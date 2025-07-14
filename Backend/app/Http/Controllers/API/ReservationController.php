<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Reservation;
use App\Models\TerrainSynthetiquesDakar;
use App\Models\Paiement;
use App\Services\QrCodeService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class ReservationController extends Controller
{
    /**
     * Liste des réservations de l'utilisateur connecté
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        $query = Reservation::with(['terrain.terrainSynthetique'])
            ->where('user_id', $user->id);

        // Filtres
        if ($request->has('statut')) {
            $query->where('statut', $request->statut);
        }

        if ($request->has('periode')) {
            $periode = $request->periode;
            switch ($periode) {
                case 'upcoming':
                    $query->upcoming();
                    break;
                case 'past':
                    $query->past();
                    break;
                case 'today':
                    $query->today();
                    break;
                case 'this_week':
                    $query->thisWeek();
                    break;
                case 'this_month':
                    $query->thisMonth();
                    break;
            }
        }

        $reservations = $query->orderBy('date_debut', 'desc')
            ->paginate($request->get('per_page', 10));

        return response()->json([
            'success' => true,
            'data' => [
                'reservations' => $reservations->items(),
                'pagination' => [
                    'current_page' => $reservations->currentPage(),
                    'last_page' => $reservations->lastPage(),
                    'per_page' => $reservations->perPage(),
                    'total' => $reservations->total(),
                ]
            ]
        ]);
    }

    /**
     * Mes réservations - Version simplifiée pour le frontend
     */
    public function myReservations(Request $request)
    {
        $user = $request->user();
        
        $reservations = Reservation::with(['terrain'])
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $reservations
        ]);
    }

    /**
     * Créer une nouvelle réservation
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'terrain_id' => 'required|exists:terrains_synthetiques_dakar,id',
            'date_debut' => 'required|date|after:now',
            'duree_heures' => 'required|numeric|min:1|max:8',
            'notes' => 'sometimes|string|max:500'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Données invalides',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();
        $terrain = TerrainSynthetiquesDakar::find($request->terrain_id);
        
        // Vérifier que le terrain existe
        if (!$terrain) {
            return response()->json([
                'success' => false,
                'message' => 'Terrain non trouvé'
            ], 404);
        }
        
        $dateDebut = \Carbon\Carbon::parse($request->date_debut);
        $dateFin = $dateDebut->copy()->addHours($request->duree_heures);

        // Vérifier la disponibilité
        $conflict = Reservation::where('terrain_id', $request->terrain_id)
            ->whereIn('statut', ['en_attente', 'confirmee'])
            ->where(function ($query) use ($dateDebut, $dateFin) {
                $query->whereBetween('date_debut', [$dateDebut, $dateFin])
                      ->orWhereBetween('date_fin', [$dateDebut, $dateFin])
                      ->orWhere(function ($q) use ($dateDebut, $dateFin) {
                          $q->where('date_debut', '<=', $dateDebut)
                            ->where('date_fin', '>=', $dateFin);
                      });
            })
            ->exists();

        if ($conflict) {
            return response()->json([
                'success' => false,
                'message' => 'Créneau non disponible pour cette période'
            ], 409);
        }

        // Calculer le montant
        $montantTotal = $terrain->prix_heure * $request->duree_heures;

        // Créer la réservation
        $reservation = Reservation::create([
            'terrain_id' => $request->terrain_id,
            'user_id' => $user->id,
            'date_debut' => $dateDebut,
            'date_fin' => $dateFin,
            'montant_total' => $montantTotal,
            'statut' => 'en_attente',
            'notes' => $request->notes
        ]);

        // Créer un enregistrement de paiement en attente
        $paiement = Paiement::create([
            'user_id' => $user->id,
            'payable_id' => $reservation->id,
            'payable_type' => Reservation::class,
            'reference_transaction' => Paiement::generateReference(),
            'montant' => $montantTotal,
            'methode' => 'mobile_money',
            'statut' => 'en_attente'
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Réservation créée avec succès',
            'data' => [
                'reservation' => $reservation->load(['terrain']),
                'paiement' => $paiement
            ]
        ], 201);
    }

    /**
     * Détails d'une réservation
     */
    public function show($id)
    {
        $reservation = Reservation::with(['terrain.terrainSynthetique', 'user', 'paiements'])
            ->find($id);

        if (!$reservation) {
            return response()->json([
                'success' => false,
                'message' => 'Réservation non trouvée'
            ], 404);
        }

        // Vérifier que l'utilisateur a accès à cette réservation
        $user = request()->user();
        if ($reservation->user_id !== $user->id && !$user->hasAnyRole(['admin', 'gestionnaire'])) {
            return response()->json([
                'success' => false,
                'message' => 'Accès non autorisé'
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $reservation
        ]);
    }

    /**
     * Annuler une réservation
     */
    public function cancel($id, Request $request)
    {
        $reservation = Reservation::find($id);

        if (!$reservation) {
            return response()->json([
                'success' => false,
                'message' => 'Réservation non trouvée'
            ], 404);
        }

        $user = $request->user();
        if ($reservation->user_id !== $user->id && !$user->hasAnyRole(['admin', 'gestionnaire'])) {
            return response()->json([
                'success' => false,
                'message' => 'Accès non autorisé'
            ], 403);
        }

        try {
            $reservation->cancel($request->reason);
            
            return response()->json([
                'success' => true,
                'message' => 'Réservation annulée avec succès',
                'data' => $reservation->fresh()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Confirmer une réservation (pour gestionnaires)
     */
    public function confirm($id, Request $request)
    {
        $user = $request->user();
        
        if (!$user->hasAnyRole(['admin', 'gestionnaire'])) {
            return response()->json([
                'success' => false,
                'message' => 'Accès non autorisé'
            ], 403);
        }

        $reservation = Reservation::find($id);

        if (!$reservation) {
            return response()->json([
                'success' => false,
                'message' => 'Réservation non trouvée'
            ], 404);
        }

        try {
            $reservation->confirm();
            
            return response()->json([
                'success' => true,
                'message' => 'Réservation confirmée avec succès',
                'data' => $reservation->fresh()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Vérifier la disponibilité des créneaux pour une date (8h à 3h du matin)
     */
    public function checkAvailability(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'terrain_id' => 'required|exists:terrains_synthetiques_dakar,id',
            'date_debut' => 'required|date_format:Y-m-d',
            'duree_heures' => 'required|numeric|min:1|max:8'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Données invalides',
                'errors' => $validator->errors()
            ], 422);
        }

        $date = $request->date_debut;
        $terrainId = $request->terrain_id;
        $dureeHeures = $request->duree_heures;
        
        // Créneaux fixes de 8h à 3h du matin
        $heuresOuverture = [
            '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', 
            '18', '19', '20', '21', '22', '23', '00', '01', '02', '03'
        ];
        
        $creneauxDisponibles = [];
        
        foreach ($heuresOuverture as $heure) {
            $debut = \Carbon\Carbon::parse($date . ' ' . $heure . ':00:00');
            
            // Pour les heures après minuit (00, 01, 02, 03), on passe au jour suivant
            if (in_array($heure, ['00', '01', '02', '03'])) {
                $debut->addDay();
            }
            
            $fin = $debut->copy()->addHours($dureeHeures);
            
            // Vérifier s'il y a des réservations conflictuelles
            $conflict = Reservation::where('terrain_id', $terrainId)
                ->whereIn('statut', ['en_attente', 'confirmee'])
                ->where(function ($query) use ($debut, $fin) {
                    $query->whereBetween('date_debut', [$debut, $fin])
                          ->orWhereBetween('date_fin', [$debut, $fin])
                          ->orWhere(function ($q) use ($debut, $fin) {
                              $q->where('date_debut', '<=', $debut)
                                ->where('date_fin', '>=', $fin);
                          });
                })
                ->exists();
            
            if (!$conflict) {
                $creneauxDisponibles[] = $heure;
            }
        }

        return response()->json([
            'success' => true,
            'data' => $creneauxDisponibles,
            'message' => count($creneauxDisponibles) . ' créneaux disponibles'
        ]);
    }

    /**
     * Obtenir les options de remboursement pour une réservation
     */
    public function getRefundOptions($id, Request $request)
    {
        $reservation = Reservation::with(['terrain', 'paiements'])->find($id);

        if (!$reservation) {
            return response()->json([
                'success' => false,
                'message' => 'Réservation non trouvée'
            ], 404);
        }

        $user = $request->user();
        if ($reservation->user_id !== $user->id && !$user->hasAnyRole(['admin', 'gestionnaire'])) {
            return response()->json([
                'success' => false,
                'message' => 'Accès non autorisé'
            ], 403);
        }

        $now = now();
        $dateDebut = \Carbon\Carbon::parse($reservation->date_debut);
        $heuresAvantMatch = $now->diffInHours($dateDebut, false);

        // Calcul des options de remboursement selon les conditions
        $options = [];

        if ($heuresAvantMatch >= 24) {
            // Plus de 24h avant : remboursement intégral
            $options[] = [
                'type' => 'refund_full',
                'label' => 'Remboursement intégral',
                'percentage' => 100,
                'amount' => $reservation->montant_total,
                'description' => 'Annulation gratuite (plus de 24h avant)',
                'fees' => 0
            ];
        } elseif ($heuresAvantMatch >= 6) {
            // Entre 6h et 24h : remboursement partiel (80%)
            $refundAmount = $reservation->montant_total * 0.8;
            $fees = $reservation->montant_total * 0.2;
            
            $options[] = [
                'type' => 'refund_partial',
                'label' => 'Remboursement partiel (80%)',
                'percentage' => 80,
                'amount' => $refundAmount,
                'description' => 'Frais d\'annulation de 20%',
                'fees' => $fees
            ];
        } elseif ($heuresAvantMatch >= 2) {
            // Entre 2h et 6h : remboursement minimal (50%)
            $refundAmount = $reservation->montant_total * 0.5;
            $fees = $reservation->montant_total * 0.5;
            
            $options[] = [
                'type' => 'refund_minimal',
                'label' => 'Remboursement minimal (50%)',
                'percentage' => 50,
                'amount' => $refundAmount,
                'description' => 'Frais d\'annulation de 50%',
                'fees' => $fees
            ];
        }

        // Option de reprogrammation toujours disponible (avec frais réduits)
        if ($heuresAvantMatch > 2) {
            $rescheduleFeesPercentage = $heuresAvantMatch >= 24 ? 0 : ($heuresAvantMatch >= 6 ? 10 : 20);
            $rescheduleFees = $reservation->montant_total * ($rescheduleFeesPercentage / 100);
            
            $options[] = [
                'type' => 'reschedule',
                'label' => 'Reprogrammer',
                'percentage' => 100 - $rescheduleFeesPercentage,
                'amount' => $reservation->montant_total - $rescheduleFees,
                'description' => $rescheduleFeesPercentage > 0 
                    ? "Frais de reprogrammation: {$rescheduleFeesPercentage}%" 
                    : 'Reprogrammation gratuite',
                'fees' => $rescheduleFees
            ];
        }

        // Conditions météo : remboursement intégral possible
        $options[] = [
            'type' => 'weather_refund',
            'label' => 'Annulation météo',
            'percentage' => 100,
            'amount' => $reservation->montant_total,
            'description' => 'Remboursement intégral en cas de conditions météo extrêmes',
            'fees' => 0,
            'requires_approval' => true
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'reservation' => $reservation,
                'heures_avant_match' => max(0, $heuresAvantMatch),
                'options' => $options,
                'can_cancel' => $heuresAvantMatch > 0,
                'can_reschedule' => $heuresAvantMatch > 2
            ]
        ]);
    }

    /**
     * Demander un remboursement
     */
    public function requestRefund($id, Request $request)
    {
        $validator = Validator::make($request->all(), [
            'refund_type' => 'required|in:refund_full,refund_partial,refund_minimal,weather_refund',
            'reason' => 'required|string|max:500',
            'weather_evidence' => 'sometimes|string|max:1000' // Pour les annulations météo
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Données invalides',
                'errors' => $validator->errors()
            ], 422);
        }

        $reservation = Reservation::with(['paiements'])->find($id);

        if (!$reservation) {
            return response()->json([
                'success' => false,
                'message' => 'Réservation non trouvée'
            ], 404);
        }

        $user = $request->user();
        if ($reservation->user_id !== $user->id && !$user->hasAnyRole(['admin', 'gestionnaire'])) {
            return response()->json([
                'success' => false,
                'message' => 'Accès non autorisé'
            ], 403);
        }

        if ($reservation->statut === 'annulee') {
            return response()->json([
                'success' => false,
                'message' => 'Cette réservation est déjà annulée'
            ], 400);
        }

        try {
            DB::beginTransaction();

            $now = now();
            $dateDebut = \Carbon\Carbon::parse($reservation->date_debut);
            $heuresAvantMatch = $now->diffInHours($dateDebut, false);

            // Calculer le montant de remboursement selon le type
            $refundPercentage = match($request->refund_type) {
                'refund_full' => $heuresAvantMatch >= 24 ? 100 : 0,
                'refund_partial' => $heuresAvantMatch >= 6 ? 80 : 0,
                'refund_minimal' => $heuresAvantMatch >= 2 ? 50 : 0,
                'weather_refund' => 100, // Nécessite approbation
                default => 0
            };

            if ($refundPercentage === 0 && $request->refund_type !== 'weather_refund') {
                return response()->json([
                    'success' => false,
                    'message' => 'Remboursement non autorisé pour cette période'
                ], 400);
            }

            $refundAmount = ($reservation->montant_total * $refundPercentage) / 100;
            $fees = $reservation->montant_total - $refundAmount;

            // Mettre à jour la réservation
            $reservation->update([
                'statut' => 'annulee',
                'raison_annulation' => $request->reason,
                'date_annulation' => $now,
                'montant_rembourse' => $refundAmount,
                'frais_annulation' => $fees
            ]);

            // Créer une demande de remboursement
            $refundRequest = [
                'reservation_id' => $reservation->id,
                'user_id' => $user->id,
                'type_remboursement' => $request->refund_type,
                'montant_demande' => $refundAmount,
                'raison' => $request->reason,
                'statut' => $request->refund_type === 'weather_refund' ? 'en_attente_approbation' : 'approuve',
                'evidence_meteorologique' => $request->weather_evidence ?? null,
                'created_at' => $now
            ];

            // Insérer dans une table de demandes de remboursement (à créer)
            DB::table('demandes_remboursement')->insert($refundRequest);

            // Si remboursement automatique approuvé, créer le paiement de remboursement
            if ($refundRequest['statut'] === 'approuve' && $refundAmount > 0) {
                Paiement::create([
                    'user_id' => $user->id,
                    'payable_id' => $reservation->id,
                    'payable_type' => Reservation::class,
                    'reference_transaction' => 'REF-' . time() . '-' . $reservation->id,
                    'montant' => -$refundAmount, // Montant négatif pour remboursement
                    'methode' => 'remboursement',
                    'statut' => 'rembourse',
                    'notes' => "Remboursement automatique - {$request->refund_type}"
                ]);
            }

            DB::commit();

            $message = $request->refund_type === 'weather_refund' 
                ? 'Demande de remboursement soumise. Elle sera examinée par notre équipe.'
                : 'Remboursement traité avec succès. Les fonds seront crédités sous 2-5 jours ouvrables.';

            return response()->json([
                'success' => true,
                'message' => $message,
                'data' => [
                    'reservation' => $reservation->fresh(),
                    'montant_rembourse' => $refundAmount,
                    'frais_annulation' => $fees,
                    'statut_remboursement' => $refundRequest['statut']
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du traitement du remboursement',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Reprogrammer une réservation
     */
    public function reschedule($id, Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nouvelle_date_debut' => 'required|date|after:now',
            'raison' => 'required|string|max:500'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Données invalides',
                'errors' => $validator->errors()
            ], 422);
        }

        $reservation = Reservation::with(['terrain'])->find($id);

        if (!$reservation) {
            return response()->json([
                'success' => false,
                'message' => 'Réservation non trouvée'
            ], 404);
        }

        $user = $request->user();
        if ($reservation->user_id !== $user->id && !$user->hasAnyRole(['admin', 'gestionnaire'])) {
            return response()->json([
                'success' => false,
                'message' => 'Accès non autorisé'
            ], 403);
        }

        if ($reservation->statut === 'annulee') {
            return response()->json([
                'success' => false,
                'message' => 'Impossible de reprogrammer une réservation annulée'
            ], 400);
        }

        try {
            DB::beginTransaction();

            $now = now();
            $ancienneDateDebut = \Carbon\Carbon::parse($reservation->date_debut);
            $nouvelleDateDebut = \Carbon\Carbon::parse($request->nouvelle_date_debut);
            $heuresAvantMatch = $now->diffInHours($ancienneDateDebut, false);

            // Vérifier si la reprogrammation est autorisée (minimum 2h avant)
            if ($heuresAvantMatch <= 2) {
                return response()->json([
                    'success' => false,
                    'message' => 'Reprogrammation impossible moins de 2h avant le match'
                ], 400);
            }

            // Calculer la durée du match
            $dureeMatch = \Carbon\Carbon::parse($reservation->date_debut)
                ->diffInHours(\Carbon\Carbon::parse($reservation->date_fin));
            
            $nouvelleDateFin = $nouvelleDateDebut->copy()->addHours($dureeMatch);

            // Vérifier la disponibilité du nouveau créneau
            $conflict = Reservation::where('terrain_id', $reservation->terrain_id)
                ->where('id', '!=', $reservation->id)
                ->whereIn('statut', ['en_attente', 'confirmee'])
                ->where(function ($query) use ($nouvelleDateDebut, $nouvelleDateFin) {
                    $query->whereBetween('date_debut', [$nouvelleDateDebut, $nouvelleDateFin])
                          ->orWhereBetween('date_fin', [$nouvelleDateDebut, $nouvelleDateFin])
                          ->orWhere(function ($q) use ($nouvelleDateDebut, $nouvelleDateFin) {
                              $q->where('date_debut', '<=', $nouvelleDateDebut)
                                ->where('date_fin', '>=', $nouvelleDateFin);
                          });
                })
                ->exists();

            if ($conflict) {
                return response()->json([
                    'success' => false,
                    'message' => 'Le nouveau créneau demandé n\'est pas disponible'
                ], 409);
            }

            // Calculer les frais de reprogrammation
            $feesPercentage = $heuresAvantMatch >= 24 ? 0 : ($heuresAvantMatch >= 6 ? 10 : 20);
            $rescheduleFees = ($reservation->montant_total * $feesPercentage) / 100;

            // Mettre à jour la réservation
            $reservation->update([
                'date_debut' => $nouvelleDateDebut,
                'date_fin' => $nouvelleDateFin,
                'statut' => 'reprogrammee',
                'raison_reprogrammation' => $request->raison,
                'date_reprogrammation' => $now,
                'frais_reprogrammation' => $rescheduleFees,
                'ancienne_date_debut' => $ancienneDateDebut,
                'ancienne_date_fin' => \Carbon\Carbon::parse($reservation->date_fin)
            ]);

            // Créer un paiement pour les frais de reprogrammation si applicable
            if ($rescheduleFees > 0) {
                Paiement::create([
                    'user_id' => $user->id,
                    'payable_id' => $reservation->id,
                    'payable_type' => Reservation::class,
                    'reference_transaction' => 'RESCHEDULE-' . time() . '-' . $reservation->id,
                    'montant' => $rescheduleFees,
                    'methode' => 'frais_reprogrammation',
                    'statut' => 'a_payer',
                    'notes' => "Frais de reprogrammation ({$feesPercentage}%)"
                ]);
            }

            DB::commit();

            $message = $rescheduleFees > 0 
                ? "Match reprogrammé avec succès. Frais de reprogrammation: {$rescheduleFees} FCFA"
                : 'Match reprogrammé gratuitement avec succès.';

            return response()->json([
                'success' => true,
                'message' => $message,
                'data' => [
                    'reservation' => $reservation->fresh(),
                    'ancienne_date' => $ancienneDateDebut->toISOString(),
                    'nouvelle_date' => $nouvelleDateDebut->toISOString(),
                    'frais_reprogrammation' => $rescheduleFees
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la reprogrammation',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Générer un QR code pour une réservation
     */
    public function generateQrCode($id): JsonResponse
    {
        try {
            $reservation = Reservation::with(['user', 'terrain.terrainSynthetique'])
                ->where('user_id', Auth::id())
                ->findOrFail($id);

            if ($reservation->statut !== 'confirmee') {
                return response()->json([
                    'success' => false,
                    'message' => 'Seules les réservations confirmées peuvent avoir un QR code'
                ], 400);
            }

            $qrCodeService = new QrCodeService();
            $qrCodeData = $qrCodeService->generateReservationQrCode($reservation);

            return response()->json([
                'success' => true,
                'message' => 'QR code généré avec succès',
                'data' => $qrCodeData
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la génération du QR code',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Récupérer le QR code d'une réservation
     */
    public function getQrCode($id): JsonResponse
    {
        try {
            $reservation = Reservation::with(['user', 'terrain.terrainSynthetique'])
                ->where('user_id', Auth::id())
                ->findOrFail($id);

            if (!$reservation->qr_code_path) {
                return response()->json([
                    'success' => false,
                    'message' => 'Aucun QR code trouvé pour cette réservation'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'qr_code_url' => asset('storage/' . $reservation->qr_code_path),
                    'reservation' => $reservation
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération du QR code',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Vérifier un QR code
     */
    public function verifyQrCode(Request $request)
    {
        try {
            $request->validate([
                'qr_data' => 'required|string'
            ]);
            
            $qrCodeService = app(QrCodeService::class);
            $reservation = $qrCodeService->verify($request->qr_data);
            
            if (!$reservation) {
                return response()->json([
                    'valid' => false,
                    'message' => 'QR code invalide ou réservation introuvable'
                ], 404);
            }
            
            return response()->json([
                'valid' => true,
                'message' => 'QR code valide',
                'reservation' => $reservation->load(['user', 'terrain'])
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Erreur vérification QR code: ' . $e->getMessage());
            
            return response()->json([
                'valid' => false,
                'message' => 'Erreur lors de la vérification',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mettre à jour le statut d'une réservation pour un gestionnaire
     */
    public function updateManagerReservationStatus(Request $request, $id)
    {
        try {
            $request->validate([
                'statut' => 'required|in:confirmee,annulee,terminee',
                'notes' => 'nullable|string'
            ]);
            
            $reservation = Reservation::findOrFail($id);
            $user = auth()->user();
            
            // Vérifier que l'utilisateur est gestionnaire du terrain
            if ($user->role !== 'gestionnaire' || $reservation->terrain->gestionnaire_id !== $user->id) {
                return response()->json([
                    'message' => 'Non autorisé à modifier cette réservation'
                ], 403);
            }
            
            $reservation->update([
                'statut' => $request->statut,
                'notes' => $request->notes ? $reservation->notes . "\n" . $request->notes : $reservation->notes
            ]);
            
            return response()->json([
                'message' => 'Statut mis à jour avec succès',
                'reservation' => $reservation->load(['user', 'terrain'])
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Erreur mise à jour statut réservation: ' . $e->getMessage());
            
            return response()->json([
                'message' => 'Erreur lors de la mise à jour',
                'error' => $e->getMessage()
            ], 500);
        }
    }
} 
