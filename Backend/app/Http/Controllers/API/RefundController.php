<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Reservation;
use App\Models\Remboursement;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class RefundController extends Controller
{
    /**
     * Calculer le montant de remboursement selon les règles
     */
    public function calculateRefund($reservationId): JsonResponse
    {
        try {
            $reservation = Reservation::with(['terrain', 'user'])->findOrFail($reservationId);
            $user = Auth::user();
            
            // Vérifications de sécurité
            if ($user->role === 'client' && $reservation->user_id !== $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Vous ne pouvez annuler que vos propres réservations'
                ], 403);
            }
            
            if ($user->role === 'gestionnaire' && $reservation->terrain->gestionnaire_id !== $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Vous ne pouvez annuler que les réservations de vos terrains'
                ], 403);
            }
            
            // Vérifier si la réservation peut être annulée
            if ($reservation->statut === 'annulee') {
                return response()->json([
                    'success' => false,
                    'message' => 'Cette réservation est déjà annulée'
                ], 422);
            }
            
            if ($reservation->statut === 'terminee') {
                return response()->json([
                    'success' => false,
                    'message' => 'Impossible d\'annuler une réservation terminée'
                ], 422);
            }
            
            if (Carbon::parse($reservation->date_debut)->isPast()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Impossible d\'annuler une réservation passée'
                ], 422);
            }
            
            // Calculer le délai avant le match
            $dateMatch = Carbon::parse($reservation->date_debut);
            $maintenant = Carbon::now();
            $heuresRestantes = $maintenant->diffInHours($dateMatch, false);
            
            // Règles de remboursement
            $acompte = 5000; // FCFA - acompte standard
            $montantRemboursement = 0;
            $conditions = '';
            $eligible = false;
            
            if ($heuresRestantes >= 12) {
                // Annulation 12h+ avant = remboursement complet de l'acompte
                $montantRemboursement = $acompte;
                $conditions = 'Annulation effectuée plus de 12h avant le match';
                $eligible = true;
            } else {
                // Annulation moins de 12h avant = perte de l'acompte
                $montantRemboursement = 0;
                $conditions = 'Annulation effectuée moins de 12h avant le match - Acompte non remboursable';
                $eligible = false;
            }
            
            return response()->json([
                'success' => true,
                'data' => [
                    'reservation_id' => $reservation->id,
                    'heures_restantes' => round($heuresRestantes, 1),
                    'eligible_remboursement' => $eligible,
                    'montant_acompte' => $acompte,
                    'montant_remboursement' => $montantRemboursement,
                    'montant_perdu' => $acompte - $montantRemboursement,
                    'conditions' => $conditions,
                    'date_match' => $reservation->date_debut,
                    'terrain' => $reservation->terrain->nom,
                    'client' => $reservation->user->prenom . ' ' . $reservation->user->nom,
                    'regles' => [
                        'annulation_12h_plus' => 'Remboursement complet de l\'acompte (5000 FCFA)',
                        'annulation_12h_moins' => 'Perte de l\'acompte (5000 FCFA)',
                        'acompte_obligatoire' => 'Acompte de 5000 FCFA requis pour toute réservation'
                    ]
                ]
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du calcul du remboursement',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Annuler une réservation avec remboursement selon les règles
     */
    public function cancelReservation(Request $request, $reservationId): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'motif_annulation' => 'required|string|max:500',
            'confirme_conditions' => 'required|boolean|accepted'
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Données invalides',
                'errors' => $validator->errors()
            ], 422);
        }
        
        try {
            DB::beginTransaction();
            
            $reservation = Reservation::with(['terrain', 'user'])->findOrFail($reservationId);
            $user = Auth::user();
            
            // Vérifications de sécurité (même que calculateRefund)
            if ($user->role === 'client' && $reservation->user_id !== $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Vous ne pouvez annuler que vos propres réservations'
                ], 403);
            }
            
            if ($user->role === 'gestionnaire' && $reservation->terrain->gestionnaire_id !== $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Vous ne pouvez annuler que les réservations de vos terrains'
                ], 403);
            }
            
            // Calculer le remboursement
            $dateMatch = Carbon::parse($reservation->date_debut);
            $maintenant = Carbon::now();
            $heuresRestantes = $maintenant->diffInHours($dateMatch, false);
            
            $acompte = 5000;
            $montantRemboursement = $heuresRestantes >= 12 ? $acompte : 0;
            
            // Mettre à jour la réservation
            $reservation->update([
                'statut' => 'annulee',
                'date_annulation' => now(),
                'motif_annulation' => $request->motif_annulation,
                'annule_par' => $user->id,
                'heures_avant_annulation' => round($heuresRestantes, 1)
            ]);
            
            // Créer l'enregistrement de remboursement
            $remboursement = Remboursement::create([
                'reservation_id' => $reservation->id,
                'user_id' => $reservation->user_id,
                'montant_acompte' => $acompte,
                'montant_remboursement' => $montantRemboursement,
                'montant_perdu' => $acompte - $montantRemboursement,
                'statut' => $montantRemboursement > 0 ? 'en_attente' : 'non_applicable',
                'date_demande' => now(),
                'heures_avant_match' => round($heuresRestantes, 1),
                'motif_annulation' => $request->motif_annulation,
                'regle_appliquee' => $heuresRestantes >= 12 ? '12h_plus' : '12h_moins',
                'traite_par' => null,
                'date_traitement' => null,
                'methode_remboursement' => $montantRemboursement > 0 ? 'orange_money' : null,
                'reference_transaction' => null
            ]);
            
            // Log de l'action
            \Log::info('Réservation annulée avec remboursement', [
                'reservation_id' => $reservation->id,
                'user_id' => $user->id,
                'montant_remboursement' => $montantRemboursement,
                'heures_restantes' => $heuresRestantes,
                'annule_par_role' => $user->role
            ]);
            
            DB::commit();
            
            return response()->json([
                'success' => true,
                'message' => $montantRemboursement > 0 
                    ? 'Réservation annulée. Remboursement de ' . number_format($montantRemboursement, 0, ',', ' ') . ' FCFA en cours de traitement.'
                    : 'Réservation annulée. Acompte non remboursable selon les conditions d\'annulation.',
                'data' => [
                    'reservation' => $reservation,
                    'remboursement' => $remboursement,
                    'montant_remboursement' => $montantRemboursement,
                    'delai_traitement' => $montantRemboursement > 0 ? '24-48 heures' : 'N/A'
                ]
            ]);
            
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'annulation de la réservation',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Lister les remboursements d'un utilisateur
     */
    public function myRefunds(): JsonResponse
    {
        $user = Auth::user();
        
        $query = Remboursement::with(['reservation.terrain'])
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc');
            
        $remboursements = $query->get();
        
        return response()->json([
            'success' => true,
            'data' => $remboursements
        ]);
    }
    
    /**
     * Traiter un remboursement (Admin/Gestionnaire)
     */
    public function processRefund(Request $request, $remboursementId): JsonResponse
    {
        $user = Auth::user();
        
        if (!in_array($user->role, ['admin', 'gestionnaire'])) {
            return response()->json([
                'success' => false,
                'message' => 'Accès non autorisé'
            ], 403);
        }
        
        $validator = Validator::make($request->all(), [
            'statut' => 'required|in:approuve,refuse',
            'reference_transaction' => 'required_if:statut,approuve|string|max:100',
            'commentaire_admin' => 'nullable|string|max:500'
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Données invalides',
                'errors' => $validator->errors()
            ], 422);
        }
        
        try {
            $remboursement = Remboursement::with(['reservation.terrain', 'user'])->findOrFail($remboursementId);
            
            // Vérifier que le gestionnaire ne peut traiter que ses terrains
            if ($user->role === 'gestionnaire' && $remboursement->reservation->terrain->gestionnaire_id !== $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Vous ne pouvez traiter que les remboursements de vos terrains'
                ], 403);
            }
            
            $remboursement->update([
                'statut' => $request->statut,
                'traite_par' => $user->id,
                'date_traitement' => now(),
                'reference_transaction' => $request->reference_transaction,
                'commentaire_admin' => $request->commentaire_admin
            ]);
            
            $message = $request->statut === 'approuve'
                ? 'Remboursement approuvé et traité'
                : 'Remboursement refusé';
                
            return response()->json([
                'success' => true,
                'message' => $message,
                'data' => $remboursement
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du traitement du remboursement',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Statistiques des remboursements pour admin/gestionnaire
     */
    public function refundStats(): JsonResponse
    {
        $user = Auth::user();
        
        if (!in_array($user->role, ['admin', 'gestionnaire'])) {
            return response()->json([
                'success' => false,
                'message' => 'Accès non autorisé'
            ], 403);
        }
        
        $query = Remboursement::with(['reservation.terrain']);
        
        // Filtrer par gestionnaire si nécessaire
        if ($user->role === 'gestionnaire') {
            $query->whereHas('reservation.terrain', function($q) use ($user) {
                $q->where('gestionnaire_id', $user->id);
            });
        }
        
        $stats = [
            'total_remboursements' => $query->count(),
            'montant_total_rembourse' => $query->where('statut', 'approuve')->sum('montant_remboursement'),
            'montant_total_perdu' => $query->sum('montant_perdu'),
            'en_attente' => $query->where('statut', 'en_attente')->count(),
            'approuves' => $query->where('statut', 'approuve')->count(),
            'refuses' => $query->where('statut', 'refuse')->count(),
            'par_regle' => [
                '12h_plus' => $query->where('regle_appliquee', '12h_plus')->count(),
                '12h_moins' => $query->where('regle_appliquee', '12h_moins')->count()
            ]
        ];
        
        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }
} 