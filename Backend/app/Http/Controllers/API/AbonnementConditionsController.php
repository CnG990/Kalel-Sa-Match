<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\TerrainSynthetiquesDakar;
use App\Models\Reservation;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class AbonnementConditionsController extends Controller
{
    /**
     * Récupérer les conditions d'abonnement d'un terrain
     */
    public function getConditionsTerrain($terrainId): JsonResponse
    {
        try {
            $terrain = TerrainSynthetiquesDakar::findOrFail($terrainId);
            
            return response()->json([
                'success' => true,
                'data' => [
                    'terrain' => [
                        'id' => $terrain->id,
                        'nom' => $terrain->nom,
                        'adresse' => $terrain->adresse,
                        'prix_heure' => $terrain->prix_heure,
                        'horaires_ouverture' => $terrain->horaires_ouverture,
                        'horaires_fermeture' => $terrain->horaires_fermeture,
                    ],
                    'conditions' => [
                        'jours_disponibles' => $terrain->getJoursDisponibles(),
                        'creneaux_disponibles' => $terrain->getCreneauxDisponibles(),
                        'conditions_abonnement' => $terrain->getConditionsAbonnement(),
                        'reductions' => $terrain->getReductionsAbonnement(),
                        'paiement_differe' => $terrain->accepte_paiement_differe,
                        'acompte_minimum' => $terrain->acompte_minimum,
                    ]
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des conditions',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Récupérer l'historique des réservations d'un utilisateur pour un terrain
     */
    public function getHistoriqueReservations($terrainId): JsonResponse
    {
        try {
            $terrain = TerrainSynthetiquesDakar::findOrFail($terrainId);
            $historique = $terrain->getHistoriqueReservations(Auth::id());
            
            return response()->json([
                'success' => true,
                'data' => [
                    'historique' => $historique->map(function ($reservation) {
                        return [
                            'id' => $reservation->id,
                            'date_debut' => $reservation->date_debut,
                            'date_fin' => $reservation->date_fin,
                            'montant_total' => $reservation->montant_total,
                            'statut' => $reservation->statut,
                            'notes' => $reservation->notes,
                        ];
                    }),
                    'statistiques' => [
                        'total_reservations' => $historique->count(),
                        'montant_total' => $historique->sum('montant_total'),
                        'jours_preferes' => $this->calculerJoursPreferes($historique),
                        'creneaux_preferes' => $this->calculerCreneauxPreferes($historique),
                    ]
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
     * Calculer les jours préférés d'un utilisateur
     */
    private function calculerJoursPreferes($reservations)
    {
        $jours = [];
        foreach ($reservations as $reservation) {
            $jour = strtolower($reservation->date_debut->format('l'));
            $jours[$jour] = ($jours[$jour] ?? 0) + 1;
        }
        
        arsort($jours);
        return array_keys(array_slice($jours, 0, 3, true));
    }

    /**
     * Calculer les créneaux préférés d'un utilisateur
     */
    private function calculerCreneauxPreferes($reservations)
    {
        $creneaux = [];
        foreach ($reservations as $reservation) {
            $heure = $reservation->date_debut->format('H:i');
            $creneaux[$heure] = ($creneaux[$heure] ?? 0) + 1;
        }
        
        arsort($creneaux);
        return array_keys(array_slice($creneaux, 0, 3, true));
    }

    /**
     * Vérifier la disponibilité d'un créneau
     */
    public function verifierDisponibilite(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'terrain_id' => 'required|exists:terrains_synthetiques_dakar,id',
                'date' => 'required|date|after:today',
                'creneau' => 'required|string',
            ]);

            $terrain = TerrainSynthetiquesDakar::findOrFail($request->terrain_id);
            $disponible = $terrain->getDisponibiliteCreneaux($request->date, $request->creneau);
            
            return response()->json([
                'success' => true,
                'data' => [
                    'disponible' => $disponible,
                    'date' => $request->date,
                    'creneau' => $request->creneau,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la vérification de disponibilité',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Vérifier la disponibilité des créneaux pour un abonnement
     */
    public function verifierDisponibiliteAbonnement(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'terrain_id' => 'required|exists:terrains_synthetiques_dakar,id',
                'jours_preferes' => 'required|array',
                'jours_preferes.*' => 'integer|min:0|max:6',
                'creneaux_preferes' => 'required|array',
                'creneaux_preferes.*' => 'string',
                'duree_seance' => 'required|numeric|min:1|max:3',
                'nb_seances' => 'required|integer|min:1|max:10',
            ]);

            $terrain = TerrainSynthetiquesDakar::findOrFail($request->terrain_id);
            $conflitsDetectes = [];
            $creneauxDisponibles = [];
            
            // Vérifier chaque combinaison jour/créneau
            foreach ($request->jours_preferes as $jourPrefere) {
                foreach ($request->creneaux_preferes as $creneauPrefere) {
                    // Calculer les prochaines occurrences de ce créneau
                    $prochaineCreneau = now()->startOfWeek()->addDays($jourPrefere);
                    if ($prochaineCreneau->isPast()) {
                        $prochaineCreneau->addWeek();
                    }
                    
                    // Créer les dates de début et fin pour vérifier la disponibilité
                    $dateDebut = $prochaineCreneau->setTimeFromTimeString($creneauPrefere);
                    $dateFin = $dateDebut->copy()->addHours($request->duree_seance);
                    
                    // Vérifier les conflits avec les réservations existantes
                    $conflict = \App\Models\Reservation::where('terrain_id', $request->terrain_id)
                        ->whereIn('statut', ['en_attente', 'confirmee'])
                        ->where('date_debut', '<', $dateFin)
                        ->where('date_fin', '>', $dateDebut)
                        ->exists();
                    
                    if ($conflict) {
                        $conflitsDetectes[] = [
                            'jour' => ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'][$jourPrefere],
                            'creneau' => $creneauPrefere,
                            'date' => $dateDebut->format('Y-m-d H:i'),
                            'raison' => 'Réservation existante'
                        ];
                    } else {
                        $creneauxDisponibles[] = [
                            'jour' => $jourPrefere,
                            'jour_nom' => ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'][$jourPrefere],
                            'creneau' => $creneauPrefere,
                            'date' => $dateDebut->format('Y-m-d H:i'),
                            'disponible' => true
                        ];
                    }
                }
            }
            
            return response()->json([
                'success' => true,
                'data' => [
                    'creneaux_disponibles' => $creneauxDisponibles,
                    'conflits_detectes' => $conflitsDetectes,
                    'total_creneaux_testes' => count($request->jours_preferes) * count($request->creneaux_preferes),
                    'creneaux_disponibles_count' => count($creneauxDisponibles),
                    'conflits_count' => count($conflitsDetectes),
                    'disponibilite_suffisante' => count($creneauxDisponibles) >= $request->nb_seances
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la vérification de disponibilité',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Calculer le prix d'un abonnement avec options
     */
    public function calculerPrixAbonnement(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'terrain_id' => 'required|exists:terrains_synthetiques_dakar,id',
                'type_abonnement' => 'required|in:mensuel,trimestriel,semestriel,annuel',
                'nb_seances' => 'required|integer|min:1|max:7',
                'duree_seance' => 'required|integer|min:1|max:3',
                'mode_paiement' => 'required|in:integral,differe,par_seance',
            ]);

            $terrain = TerrainSynthetiquesDakar::findOrFail($request->terrain_id);
            $prixBase = $terrain->calculerPrixAbonnement(
                $request->type_abonnement,
                $request->nb_seances,
                $request->duree_seance
            );

            $calculs = [
                'prix_base' => $prixBase,
                'reduction_appliquee' => $terrain->getReductionsAbonnement()[$request->type_abonnement] ?? 0,
                'prix_final' => $prixBase,
            ];

            // Calculs selon le mode de paiement
            switch ($request->mode_paiement) {
                case 'differe':
                    $acompte = $terrain->acompte_minimum ?? ($prixBase * 0.3);
                    $calculs['acompte'] = $acompte;
                    $calculs['reste_a_payer'] = $prixBase - $acompte;
                    break;
                    
                case 'par_seance':
                    $prixParSeance = $terrain->prix_heure * $request->duree_seance;
                    $calculs['prix_par_seance'] = $prixParSeance;
                    $calculs['total_seances'] = $this->calculerNombreSeances($request->type_abonnement, $request->nb_seances);
                    break;
            }

            return response()->json([
                'success' => true,
                'data' => $calculs
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du calcul du prix',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Calculer le nombre de séances selon le type d'abonnement
     */
    private function calculerNombreSeances($type, $nbSeancesParSemaine)
    {
        $semaines = [
            'mensuel' => 4,
            'trimestriel' => 12,
            'semestriel' => 24,
            'annuel' => 52,
        ];

        return $nbSeancesParSemaine * ($semaines[$type] ?? 4);
    }
}
