<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Reservation;
use App\Services\QrCodeService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class TicketController extends Controller
{
    protected $qrCodeService;

    public function __construct(QrCodeService $qrCodeService)
    {
        $this->qrCodeService = $qrCodeService;
    }

    /**
     * Obtenir le ticket d'une réservation pour le client (UNIQUEMENT APRÈS PAIEMENT)
     */
    public function getTicket($reservationId): JsonResponse
    {
        try {
            $reservation = Reservation::with(['terrain', 'user'])
                ->where('id', $reservationId)
                ->where('user_id', Auth::id())
                ->first();

            if (!$reservation) {
                return response()->json([
                    'success' => false,
                    'message' => 'Réservation non trouvée'
                ], 404);
            }

            // ✅ VÉRIFICATION CRITIQUE : Paiement confirmé requis
            if ($reservation->statut !== 'confirmee') {
                return response()->json([
                    'success' => false,
                    'message' => 'Le ticket sera disponible après confirmation du paiement',
                    'statut_actuel' => $reservation->statut,
                    'instructions' => [
                        'Votre réservation doit être payée et confirmée',
                        'Le ticket sera automatiquement généré après paiement',
                        'Contactez le support si le paiement a été effectué'
                    ]
                ], 402); // 402 Payment Required
            }

            // Générer le QR code SEULEMENT si la réservation est confirmée ET payée
            if (!$reservation->qr_code) {
                $qrResult = $this->qrCodeService->generateReservationQrCode($reservation);
                if (!$qrResult['success']) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Erreur lors de la génération du ticket'
                    ], 500);
                }
                $reservation->refresh();
            }

            return response()->json([
                'success' => true,
                'message' => 'Ticket disponible - réservation confirmée',
                'data' => [
                    'reservation_id' => $reservation->id,
                    'qr_code_url' => $reservation->qr_code_path ? asset('storage/' . $reservation->qr_code_path) : null,
                    'qr_code_token' => $reservation->qr_code,
                    'code_ticket' => $reservation->code_ticket ?: 'RES-' . str_pad($reservation->id, 6, '0', STR_PAD_LEFT),
                    'terrain_nom' => $reservation->terrain->nom ?? 'Terrain',
                    'terrain_adresse' => $reservation->terrain->adresse ?? '',
                    'date_debut' => $reservation->date_debut,
                    'date_fin' => $reservation->date_fin,
                    'montant_total' => $reservation->montant_total,
                    'statut' => $reservation->statut,
                    'paiement_confirme' => true,
                    'instructions' => [
                        'Présentez ce QR code au gestionnaire du terrain',
                        'Arrivez 10 minutes avant votre créneau',
                        'Le ticket est valide 2h avant et après votre réservation',
                        '⚠️ Ce ticket n\'est valide que pour cette réservation payée'
                    ]
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération du ticket',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Scanner et valider un ticket (pour les gestionnaires)
     */
    public function scanTicket(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'qr_data' => 'required|string'
            ]);

            // Décoder les données QR
            $qrData = $request->qr_data;
            $data = json_decode($qrData, true);

            if ($data && isset($data['reservation_id']) && isset($data['token'])) {
                // QR code avec données structurées
                $reservationId = $data['reservation_id'];
                $token = $data['token'];
            } else {
                // QR code simple avec token uniquement
                $token = $qrData;
                $reservation = Reservation::where('qr_code', $token)->first();
                $reservationId = $reservation ? $reservation->id : null;
            }

            if (!$reservationId) {
                return response()->json([
                    'success' => false,
                    'message' => 'QR code invalide',
                    'valid' => false
                ], 400);
            }

            // Utiliser le service pour vérifier
            $verification = $this->qrCodeService->verifyQrCode($token, $reservationId);

            if (!$verification['valid']) {
                return response()->json([
                    'success' => false,
                    'message' => $verification['message'],
                    'valid' => false
                ], 400);
            }

            // Récupérer les détails complets de la réservation
            $reservation = Reservation::with(['user', 'terrain'])
                ->find($reservationId);

            // Mettre à jour la dernière validation
            $reservation->update([
                'derniere_validation' => now()
            ]);

            return response()->json([
                'success' => true,
                'valid' => true,
                'message' => 'Ticket valide et scanné avec succès',
                'data' => [
                    'reservation_id' => $reservation->id,
                    'code_ticket' => $reservation->code_ticket ?: 'RES-' . str_pad($reservation->id, 6, '0', STR_PAD_LEFT),
                    'client_nom' => $reservation->user->nom ?? 'Client',
                    'client_email' => $reservation->user->email ?? '',
                    'client_telephone' => $reservation->user->telephone ?? '',
                    'terrain_nom' => $reservation->terrain->nom ?? 'Terrain',
                    'date_debut' => $reservation->date_debut,
                    'date_fin' => $reservation->date_fin,
                    'montant_total' => $reservation->montant_total,
                    'statut' => $reservation->statut,
                    'derniere_validation' => $reservation->derniere_validation,
                    'temps_restant' => $this->calculateTimeRemaining($reservation)
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du scan du ticket',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Valider manuellement un ticket par code (pour les gestionnaires)
     */
    public function validateByCode(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'code_ticket' => 'required|string'
            ]);

            $codeTicket = strtoupper($request->code_ticket);
            
            // Rechercher par code ticket ou par ID de réservation
            $reservation = Reservation::with(['user', 'terrain'])
                ->where(function($query) use ($codeTicket) {
                    $query->where('code_ticket', $codeTicket)
                          ->orWhere('id', str_replace('RES-', '', $codeTicket));
                })
                ->first();

            if (!$reservation) {
                return response()->json([
                    'success' => false,
                    'message' => 'Aucune réservation trouvée avec ce code'
                ], 404);
            }

            // Vérifications de validité
            $now = now();
            $dateDebut = Carbon::parse($reservation->date_debut);
            $dateFin = Carbon::parse($reservation->date_fin);

            if ($now->lt($dateDebut->subHours(2)) || $now->gt($dateFin->addHours(2))) {
                return response()->json([
                    'success' => false,
                    'message' => 'Réservation hors de la période autorisée'
                ], 400);
            }

            if ($reservation->statut !== 'confirmee') {
                return response()->json([
                    'success' => false,
                    'message' => 'Réservation non confirmée'
                ], 400);
            }

            // Marquer comme validé
            $reservation->update([
                'derniere_validation' => now()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Ticket validé avec succès',
                'data' => [
                    'reservation_id' => $reservation->id,
                    'code_ticket' => $reservation->code_ticket ?: 'RES-' . str_pad($reservation->id, 6, '0', STR_PAD_LEFT),
                    'client_nom' => $reservation->user->nom ?? 'Client',
                    'client_email' => $reservation->user->email ?? '',
                    'terrain_nom' => $reservation->terrain->nom ?? 'Terrain',
                    'date_debut' => $reservation->date_debut,
                    'date_fin' => $reservation->date_fin,
                    'montant_total' => $reservation->montant_total,
                    'derniere_validation' => $reservation->derniere_validation
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la validation',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Récupérer tous les tickets d'un utilisateur
     */
    public function getUserTickets(): JsonResponse
    {
        try {
            $userId = Auth::id();
            
            // Récupérer toutes les réservations confirmées de l'utilisateur avec les données nécessaires
            $reservations = Reservation::with(['terrain', 'user'])
                ->where('user_id', $userId)
                ->where('statut', 'confirmee')
                ->orderBy('created_at', 'desc')
                ->get();

            $tickets = $reservations->map(function ($reservation) {
                // Générer le QR code si pas encore fait
                if (!$reservation->qr_code) {
                    $qrResult = $this->qrCodeService->generateReservationQrCode($reservation);
                    if ($qrResult['success']) {
                        $reservation->refresh();
                    }
                }

                // Déterminer le statut du ticket
                $now = now();
                $dateDebut = Carbon::parse($reservation->date_debut);
                $dateFin = Carbon::parse($reservation->date_fin);
                $expirationTime = $dateFin->addHours(2); // Ticket expire 2h après la fin

                $isUsed = !empty($reservation->derniere_validation);
                $isExpired = $now->gt($expirationTime);

                return [
                    'reservation_id' => $reservation->id,
                    'qr_code' => $reservation->qr_code,
                    'qr_code_svg' => $reservation->qr_code_path ? asset('storage/' . $reservation->qr_code_path) : null,
                    'validation_code' => $reservation->code_ticket ?: 'RES-' . str_pad($reservation->id, 6, '0', STR_PAD_LEFT),
                    'expire_at' => $expirationTime->toISOString(),
                    'is_used' => $isUsed,
                    'used_at' => $reservation->derniere_validation,
                    'terrain' => [
                        'nom' => $reservation->terrain->nom ?? 'Terrain',
                        'adresse' => $reservation->terrain->adresse ?? ''
                    ],
                    'user' => [
                        'nom' => $reservation->user->nom ?? '',
                        'prenom' => $reservation->user->prenom ?? ''
                    ],
                    'reservation' => [
                        'date_reservation' => $reservation->date_debut ? Carbon::parse($reservation->date_debut)->format('Y-m-d') : '',
                        'heure_debut' => $reservation->date_debut ? Carbon::parse($reservation->date_debut)->format('H:i') : '',
                        'heure_fin' => $reservation->date_fin ? Carbon::parse($reservation->date_fin)->format('H:i') : '',
                        'prix_total' => $reservation->montant_total ?? 0
                    ]
                ];
            });

            return response()->json([
                'success' => true,
                'message' => 'Tickets récupérés avec succès',
                'data' => $tickets
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des tickets',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Télécharger un ticket en PDF
     */
    public function downloadTicket($reservationId): JsonResponse
    {
        try {
            $reservation = Reservation::with(['terrain', 'user'])
                ->where('id', $reservationId)
                ->where('user_id', Auth::id())
                ->where('statut', 'confirmee')
                ->first();

            if (!$reservation) {
                return response()->json([
                    'success' => false,
                    'message' => 'Ticket non trouvé'
                ], 404);
            }

            // Pour l'instant, retourner les données du ticket
            // TODO: Implémenter la génération PDF avec une librairie comme DomPDF
            return response()->json([
                'success' => true,
                'message' => 'Données du ticket pour génération PDF',
                'data' => [
                    'reservation_id' => $reservation->id,
                    'code_ticket' => $reservation->code_ticket ?: 'RES-' . str_pad($reservation->id, 6, '0', STR_PAD_LEFT),
                    'qr_code_url' => $reservation->qr_code_path ? asset('storage/' . $reservation->qr_code_path) : null,
                    'terrain' => $reservation->terrain,
                    'user' => $reservation->user,
                    'date_debut' => $reservation->date_debut,
                    'date_fin' => $reservation->date_fin,
                    'montant_total' => $reservation->montant_total
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du téléchargement',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Historique des validations pour un gestionnaire
     */
    public function getValidationsHistory(): JsonResponse
    {
        try {
            $userId = Auth::id();
            
            // Récupérer les terrains gérés par cet utilisateur
            $terrainsGeres = \App\Models\TerrainSynthetiquesDakar::where('gestionnaire_id', $userId)->pluck('id');

            $validations = Reservation::with(['user', 'terrain'])
                ->whereIn('terrain_id', $terrainsGeres)
                ->whereNotNull('derniere_validation')
                ->orderBy('derniere_validation', 'desc')
                ->limit(50)
                ->get();

            return response()->json([
                'success' => true,
                'data' => $validations->map(function ($reservation) {
                    return [
                        'reservation_id' => $reservation->id,
                        'code_ticket' => $reservation->code_ticket ?: 'RES-' . str_pad($reservation->id, 6, '0', STR_PAD_LEFT),
                        'client_nom' => $reservation->user->nom ?? 'Client',
                        'terrain_nom' => $reservation->terrain->nom ?? 'Terrain',
                        'date_debut' => $reservation->date_debut,
                        'date_fin' => $reservation->date_fin,
                        'derniere_validation' => $reservation->derniere_validation,
                        'statut' => $reservation->statut
                    ];
                })
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération de l\'historique',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Calculer le temps restant d'une réservation
     */
    private function calculateTimeRemaining(Reservation $reservation): array
    {
        $now = now();
        $dateDebut = Carbon::parse($reservation->date_debut);
        $dateFin = Carbon::parse($reservation->date_fin);

        if ($now->lt($dateDebut)) {
            // Avant le début
            $minutesBeforeStart = $now->diffInMinutes($dateDebut);
            return [
                'status' => 'before_start',
                'message' => "Débute dans {$minutesBeforeStart} minutes",
                'minutes' => $minutesBeforeStart
            ];
        } elseif ($now->between($dateDebut, $dateFin)) {
            // En cours
            $minutesRemaining = $now->diffInMinutes($dateFin);
            return [
                'status' => 'in_progress',
                'message' => "Se termine dans {$minutesRemaining} minutes",
                'minutes' => $minutesRemaining
            ];
        } else {
            // Terminé
            $minutesAfterEnd = $dateFin->diffInMinutes($now);
            return [
                'status' => 'finished',
                'message' => "Terminé depuis {$minutesAfterEnd} minutes",
                'minutes' => $minutesAfterEnd
            ];
        }
    }
} 