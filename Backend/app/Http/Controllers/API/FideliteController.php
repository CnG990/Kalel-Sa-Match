<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class FideliteController extends Controller
{
    /**
     * Calculer le niveau de fidélité d'un utilisateur pour un terrain spécifique
     */
    public function calculerFidelite(Request $request, $terrainId): JsonResponse
    {
        try {
            $userId = Auth::id();
            
            // ✅ CORRECTION: Fidélité spécifique au terrain
            // Récupérer l'historique des réservations UNIQUEMENT pour ce terrain
            $reservations = DB::table('reservations')
                ->where('user_id', $userId)
                ->where('terrain_id', $terrainId) // ✅ Filtré par terrain spécifique
                ->where('statut', 'confirmee')
                ->where('created_at', '>=', Carbon::now()->subYear()) // Dernière année
                ->get();

            $nbReservations = $reservations->count();
            $montantTotal = $reservations->sum('montant_total'); // Montant pour CE terrain uniquement
            $anciennete = $this->calculerAnciennete($userId, $terrainId); // Ancienneté sur CE terrain

            // Calcul du score de fidélité SPÉCIFIQUE à ce terrain
            $scoreFidelite = $this->calculerScoreFidelite($nbReservations, $montantTotal, $anciennete);
            $niveauFidelite = $this->determinerNiveauFidelite($scoreFidelite);
            $reductionPourcentage = $this->obtenirReductionPourcentage($niveauFidelite);

            // Récupérer le nom du terrain pour l'affichage
            $terrain = DB::table('terrains_synthetiques_dakar')
                ->where('id', $terrainId)
                ->first();

            return response()->json([
                'success' => true,
                'data' => [
                    'user_id' => $userId,
                    'terrain_id' => $terrainId,
                    'terrain_nom' => $terrain->nom ?? 'Terrain',
                    'score_fidelite' => $scoreFidelite,
                    'niveau_fidelite' => $niveauFidelite,
                    'reduction_pourcentage' => $reductionPourcentage,
                    'nb_reservations_terrain' => $nbReservations, // Réservations sur CE terrain
                    'montant_total_terrain' => $montantTotal, // Montant dépensé sur CE terrain
                    'anciennete_terrain_mois' => $anciennete, // Ancienneté sur CE terrain
                    'avantages' => $this->obtenirAvantagesFidelite($niveauFidelite),
                    'prochaine_etape' => $this->obtenirProchaineEtape($niveauFidelite, $scoreFidelite),
                    'message_specifique' => "Votre fidélité sur {$terrain->nom}" // Message spécifique
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du calcul de fidélité',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Appliquer une réduction fidélité à un abonnement
     */
    public function appliquerReductionFidelite(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'terrain_id' => 'required|integer',
                'prix_original' => 'required|numeric|min:0',
                'type_abonnement' => 'required|string'
            ]);

            $userId = Auth::id();
            $fideliteData = $this->calculerFidelite($request, $request->terrain_id)->getData();
            
            if (!$fideliteData->success) {
                return response()->json([
                    'success' => false,
                    'message' => 'Impossible de calculer la fidélité'
                ], 400);
            }

            $reductionPourcentage = $fideliteData->data->reduction_pourcentage;
            $prixOriginal = $request->prix_original;
            $reduction = ($prixOriginal * $reductionPourcentage) / 100;
            $prixFinal = $prixOriginal - $reduction;

            // Enregistrer l'application de la réduction
            DB::table('reductions_fidelite')->insert([
                'user_id' => $userId,
                'terrain_id' => $request->terrain_id,
                'type_abonnement' => $request->type_abonnement,
                'prix_original' => $prixOriginal,
                'reduction_pourcentage' => $reductionPourcentage,
                'montant_reduction' => $reduction,
                'prix_final' => $prixFinal,
                'niveau_fidelite' => $fideliteData->data->niveau_fidelite,
                'created_at' => now(),
                'updated_at' => now()
            ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'prix_original' => $prixOriginal,
                    'reduction_pourcentage' => $reductionPourcentage,
                    'montant_reduction' => $reduction,
                    'prix_final' => $prixFinal,
                    'niveau_fidelite' => $fideliteData->data->niveau_fidelite,
                    'economies_realisees' => $reduction
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'application de la réduction',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtenir l'historique des réductions fidélité d'un utilisateur
     */
    public function historiqueReductions(): JsonResponse
    {
        try {
            $userId = Auth::id();
            
            $reductions = DB::table('reductions_fidelite')
                ->join('terrains_synthetiques_dakar', 'reductions_fidelite.terrain_id', '=', 'terrains_synthetiques_dakar.id')
                ->where('reductions_fidelite.user_id', $userId)
                ->select([
                    'reductions_fidelite.*',
                    'terrains_synthetiques_dakar.nom as terrain_nom'
                ])
                ->orderBy('reductions_fidelite.created_at', 'desc')
                ->get();

            $totalEconomies = $reductions->sum('montant_reduction');

            return response()->json([
                'success' => true,
                'data' => [
                    'reductions' => $reductions,
                    'total_economies' => $totalEconomies,
                    'nb_reductions_utilisees' => $reductions->count()
                ]
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
     * Calculer l'ancienneté d'un utilisateur sur un terrain (en mois)
     */
    private function calculerAnciennete($userId, $terrainId): int
    {
        $premiereReservation = DB::table('reservations')
            ->where('user_id', $userId)
            ->where('terrain_id', $terrainId)
            ->where('statut', 'confirmee')
            ->orderBy('created_at', 'asc')
            ->first();

        if (!$premiereReservation) {
            return 0;
        }

        return Carbon::parse($premiereReservation->created_at)->diffInMonths(Carbon::now());
    }

    /**
     * Calculer le score de fidélité basé sur plusieurs critères
     */
    private function calculerScoreFidelite($nbReservations, $montantTotal, $anciennete): int
    {
        $score = 0;
        
        // Points pour les réservations (max 500 points)
        $score += min($nbReservations * 10, 500);
        
        // Points pour le montant dépensé (1 point par 1000 FCFA, max 300 points)
        $score += min(floor($montantTotal / 1000), 300);
        
        // Points pour l'ancienneté (20 points par mois, max 200 points)
        $score += min($anciennete * 20, 200);
        
        return $score;
    }

    /**
     * Déterminer le niveau de fidélité basé sur le score
     */
    private function determinerNiveauFidelite($score): string
    {
        if ($score >= 800) return 'Platine';
        if ($score >= 600) return 'Or';
        if ($score >= 400) return 'Argent';
        if ($score >= 200) return 'Bronze';
        return 'Nouveau';
    }

    /**
     * Obtenir le pourcentage de réduction selon le niveau
     */
    private function obtenirReductionPourcentage($niveau): int
    {
        $reductions = [
            'Platine' => 20,
            'Or' => 15,
            'Argent' => 10,
            'Bronze' => 5,
            'Nouveau' => 0
        ];

        return $reductions[$niveau] ?? 0;
    }

    /**
     * Obtenir les avantages selon le niveau de fidélité
     */
    private function obtenirAvantagesFidelite($niveau): array
    {
        $avantages = [
            'Platine' => [
                '20% de réduction sur tous les abonnements',
                'Accès prioritaire aux créneaux premium',
                'Coaching personnalisé mensuel gratuit',
                'Équipements premium inclus',
                'Support client VIP 24/7'
            ],
            'Or' => [
                '15% de réduction sur tous les abonnements',
                'Réservation anticipée des créneaux',
                'Session de coaching trimestrielle',
                'Équipements de qualité inclus'
            ],
            'Argent' => [
                '10% de réduction sur tous les abonnements',
                'Notifications prioritaires des disponibilités',
                'Matériel de base inclus'
            ],
            'Bronze' => [
                '5% de réduction sur tous les abonnements',
                'Accès aux offres spéciales membres'
            ],
            'Nouveau' => [
                'Bienvenue dans notre programme de fidélité',
                'Commencez à cumuler des points dès maintenant'
            ]
        ];

        return $avantages[$niveau] ?? [];
    }

    /**
     * Obtenir les informations pour atteindre le niveau suivant
     */
    private function obtenirProchaineEtape($niveauActuel, $scoreActuel): array
    {
        $niveaux = [
            'Nouveau' => ['prochain' => 'Bronze', 'score_requis' => 200],
            'Bronze' => ['prochain' => 'Argent', 'score_requis' => 400],
            'Argent' => ['prochain' => 'Or', 'score_requis' => 600],
            'Or' => ['prochain' => 'Platine', 'score_requis' => 800],
            'Platine' => ['prochain' => 'Maximum atteint', 'score_requis' => 0]
        ];

        if (!isset($niveaux[$niveauActuel])) {
            return ['message' => 'Niveau inconnu'];
        }

        $info = $niveaux[$niveauActuel];
        
        if ($info['prochain'] === 'Maximum atteint') {
            return [
                'message' => 'Félicitations ! Vous avez atteint le niveau maximum.',
                'niveau_actuel' => $niveauActuel,
                'score_actuel' => $scoreActuel
            ];
        }

        $pointsManquants = $info['score_requis'] - $scoreActuel;
        
        return [
            'niveau_suivant' => $info['prochain'],
            'score_requis' => $info['score_requis'],
            'score_actuel' => $scoreActuel,
            'points_manquants' => max(0, $pointsManquants),
            'message' => $pointsManquants > 0 
                ? "Il vous manque {$pointsManquants} points pour atteindre le niveau {$info['prochain']}"
                : "Vous pouvez maintenant passer au niveau {$info['prochain']} !"
        ];
    }
} 