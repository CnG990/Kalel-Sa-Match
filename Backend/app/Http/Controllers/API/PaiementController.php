<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Paiement;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class PaiementController extends Controller
{
    /**
     * Lister les paiements de l'utilisateur
     */
    public function index(): JsonResponse
    {
        try {
            $paiements = Paiement::where('user_id', Auth::id())
                ->with(['reservation'])
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $paiements
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des paiements',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Créer un nouveau paiement
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'reservation_id' => 'required|exists:reservations,id',
                'montant' => 'required|numeric|min:0',
                'methode_paiement' => 'required|in:mobile_money,carte_bancaire,especes',
                'reference_transaction' => 'nullable|string',
            ]);

            $paiement = Paiement::create([
                'user_id' => Auth::id(),
                'reservation_id' => $request->reservation_id,
                'montant' => $request->montant,
                'methode_paiement' => $request->methode_paiement,
                'statut' => 'en_attente',
                'reference_transaction' => $request->reference_transaction,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Paiement créé avec succès',
                'data' => $paiement
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Données invalides',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la création du paiement',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Afficher un paiement
     */
    public function show($id): JsonResponse
    {
        try {
            $paiement = Paiement::where('user_id', Auth::id())
                ->with(['reservation'])
                ->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $paiement
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Paiement introuvable',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Traiter un paiement
     */
    public function process(Request $request, $id): JsonResponse
    {
        try {
            $paiement = Paiement::where('user_id', Auth::id())->findOrFail($id);
            
            // Simulation du traitement de paiement
            $success = rand(0, 1); // 50% de chance de succès pour la démo
            
            if ($success) {
                $paiement->update([
                    'statut' => 'confirme',
                    'date_confirmation' => now(),
                ]);
                
                return response()->json([
                    'success' => true,
                    'message' => 'Paiement traité avec succès',
                    'data' => $paiement->fresh()
                ]);
            } else {
                $paiement->update(['statut' => 'echec']);
                
                return response()->json([
                    'success' => false,
                    'message' => 'Échec du traitement du paiement'
                ], 400);
            }
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du traitement du paiement',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Paiement Mobile Money
     */
    public function mobileMoney(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'numero_telephone' => 'required|string',
                'montant' => 'required|numeric|min:0',
                'operateur' => 'required|in:orange,free,expresso',
                'reservation_id' => 'required|exists:reservations,id',
            ]);

            // Simulation API Mobile Money
            $reference = 'MM_' . time() . '_' . rand(1000, 9999);
            
            $paiement = Paiement::create([
                'user_id' => Auth::id(),
                'reservation_id' => $request->reservation_id,
                'montant' => $request->montant,
                'methode_paiement' => 'mobile_money',
                'statut' => 'en_attente',
                'reference_transaction' => $reference,
                'details_paiement' => [
                    'operateur' => $request->operateur,
                    'numero_telephone' => $request->numero_telephone,
                ]
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Demande de paiement Mobile Money initiée',
                'data' => [
                    'paiement_id' => $paiement->id,
                    'reference' => $reference,
                    'montant' => $request->montant,
                    'instructions' => 'Composez #144# et suivez les instructions pour confirmer le paiement'
                ]
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Données invalides',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'initiation du paiement Mobile Money',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Webhook pour les notifications de paiement
     */
    public function webhook(Request $request): JsonResponse
    {
        try {
            // Traitement des webhooks des opérateurs de paiement
            $reference = $request->input('reference');
            $statut = $request->input('status'); // success, failed, pending
            
            $paiement = Paiement::where('reference_transaction', $reference)->first();
            
            if ($paiement) {
                $nouveauStatut = match($statut) {
                    'success' => 'confirme',
                    'failed' => 'echec',
                    'pending' => 'en_attente',
                    default => 'en_attente'
                };
                
                $paiement->update([
                    'statut' => $nouveauStatut,
                    'date_confirmation' => $statut === 'success' ? now() : null,
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Webhook traité'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du traitement du webhook',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Statistiques des revenus pour les gestionnaires
     */
    public function managerRevenue(): JsonResponse
    {
        try {
            $stats = [
                'revenus_total' => Paiement::where('statut', 'confirme')->sum('montant'),
                'revenus_mois' => Paiement::where('statut', 'confirme')
                    ->whereMonth('created_at', now()->month)
                    ->sum('montant'),
                'revenus_semaine' => Paiement::where('statut', 'confirme')
                    ->whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()])
                    ->sum('montant'),
                'nombre_transactions' => Paiement::where('statut', 'confirme')->count(),
                'paiements_en_attente' => Paiement::where('statut', 'en_attente')->count(),
            ];

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des statistiques de revenus',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Traiter un paiement d'abonnement
     */
    public function processSubscriptionPayment(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'subscription_id' => 'required|exists:abonnements,id',
                'montant' => 'required|numeric|min:0',
                'methode_paiement' => 'required|in:orange_money,wave,mobile_money',
                'reference_transaction' => 'nullable|string',
            ]);

            $abonnement = \App\Models\Abonnement::where('user_id', Auth::id())
                ->findOrFail($request->subscription_id);

            if ($abonnement->statut !== 'en_attente_paiement') {
                return response()->json([
                    'success' => false,
                    'message' => 'Cet abonnement ne peut pas être payé'
                ], 400);
            }

            // Créer le paiement
            $paiement = Paiement::create([
                'user_id' => Auth::id(),
                'payable_id' => $abonnement->id,
                'payable_type' => \App\Models\Abonnement::class,
                'montant' => $request->montant,
                'methode' => $request->methode_paiement,
                'statut' => 'en_attente',
                'reference_transaction' => $request->reference_transaction ?? Paiement::generateReference(),
            ]);

            // Mettre à jour le statut de l'abonnement
            $abonnement->update(['statut' => 'active']);

            return response()->json([
                'success' => true,
                'message' => 'Paiement d\'abonnement traité avec succès',
                'data' => [
                    'paiement' => $paiement,
                    'abonnement' => $abonnement
                ]
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Données invalides',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du traitement du paiement d\'abonnement',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Traiter un paiement de réservation
     */
    public function processReservationPayment(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'reservation_id' => 'required|exists:reservations,id',
                'montant' => 'required|numeric|min:0',
                'methode_paiement' => 'required|in:orange_money,wave,mobile_money',
                'reference_transaction' => 'nullable|string',
            ]);

            $reservation = \App\Models\Reservation::where('user_id', Auth::id())
                ->findOrFail($request->reservation_id);

            if ($reservation->statut !== 'en_attente') {
                return response()->json([
                    'success' => false,
                    'message' => 'Cette réservation ne peut pas être payée'
                ], 400);
            }

            // Créer le paiement
            $paiement = Paiement::create([
                'user_id' => Auth::id(),
                'payable_id' => $reservation->id,
                'payable_type' => \App\Models\Reservation::class,
                'montant' => $request->montant,
                'methode' => $request->methode_paiement,
                'statut' => 'en_attente',
                'reference_transaction' => $request->reference_transaction ?? Paiement::generateReference(),
            ]);

            // Mettre à jour le statut de la réservation
            $reservation->update(['statut' => 'confirmee']);

            return response()->json([
                'success' => true,
                'message' => 'Paiement de réservation traité avec succès',
                'data' => [
                    'paiement' => $paiement,
                    'reservation' => $reservation
                ]
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Données invalides',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du traitement du paiement de réservation',
                'error' => $e->getMessage()
            ], 500);
        }
    }
} 