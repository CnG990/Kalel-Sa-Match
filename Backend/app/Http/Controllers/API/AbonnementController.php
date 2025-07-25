<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Abonnement;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class AbonnementController extends Controller
{
    /**
     * Lister tous les types d'abonnements disponibles
     */
    public function index(): JsonResponse
    {
        try {
            $abonnements = [
                [
                    'id' => 1,
                    'nom' => 'Abonnement Mensuel',
                    'description' => 'Accès illimité pendant 1 mois',
                    'prix' => 25000,
                    'duree_jours' => 30,
                    'avantages' => [
                        'Réservations illimitées',
                        'Priorité sur les créneaux',
                        '10% de réduction sur les équipements'
                    ]
                ],
                [
                    'id' => 2,
                    'nom' => 'Abonnement Trimestriel',
                    'description' => 'Accès illimité pendant 3 mois',
                    'prix' => 60000,
                    'duree_jours' => 90,
                    'avantages' => [
                        'Réservations illimitées',
                        'Priorité sur les créneaux',
                        '15% de réduction sur les équipements',
                        'Accès aux événements VIP'
                    ]
                ],
                [
                    'id' => 3,
                    'nom' => 'Abonnement Annuel',
                    'description' => 'Accès illimité pendant 1 an',
                    'prix' => 200000,
                    'duree_jours' => 365,
                    'avantages' => [
                        'Réservations illimitées',
                        'Priorité sur les créneaux',
                        '20% de réduction sur les équipements',
                        'Accès aux événements VIP',
                        'Coach personnel mensuel inclus'
                    ]
                ]
            ];

            return response()->json([
                'success' => true,
                'data' => $abonnements
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des abonnements',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Souscrire à un abonnement
     */
    public function subscribe(Request $request, $id): JsonResponse
    {
        \Log::info('--- SOUSCRIPTION DEBUG ---', [
            'user_id' => Auth::id(),
            'type_abonnement_id' => $id,
            'payload' => $request->all()
        ]);
        try {
            // Récupérer le type d'abonnement depuis la nouvelle table
            $typeAbonnement = \App\Models\TypeAbonnement::find($id);
            if (!$typeAbonnement) {
                \Log::error('Type d\'abonnement non trouvé', ['id' => $id]);
                return response()->json([
                    'success' => false,
                    'message' => 'Type d\'abonnement introuvable'
                ], 404);
            }

            $request->validate([
                'terrain_id' => 'required|exists:terrains_synthetiques_dakar,id',
                'duree_seance' => 'required|numeric|min:1|max:3', // ✅ CORRIGÉ: numeric au lieu d'integer
                'nb_seances' => 'required|integer|min:1|max:10', // ✅ AUGMENTÉ: max 10 au lieu de 3
                'prix_total' => 'required|numeric|min:0',
                // Nouvelles préférences (optionnelles)
                'jour_prefere' => 'nullable|integer|min:0|max:6', // 0=dimanche, 6=samedi
                'heure_preferee' => 'nullable|date_format:H:i', // Format HH:MM
                'preferences_flexibles' => 'nullable|boolean',
                'jours_alternatifs' => 'nullable|array',
                'jours_alternatifs.*' => 'integer|min:0|max:6',
                'heures_alternatives' => 'nullable|array',
                'heures_alternatives.*' => 'date_format:H:i',
            ]);

            // ✅ VÉRIFICATION ABONNEMENT ACTIF - Gestion des colonnes optionnelles
            // Vérifier s'il n'y a pas déjà un abonnement actif pour ce terrain et ce type
            $abonnementActif = \App\Models\Abonnement::where('user_id', Auth::id())
                ->where('terrain_id', $request->terrain_id)
                ->where('type_abonnement_id', $id);
            
            // ✅ AJOUT CONDITIONNEL : Vérifier date_fin seulement si la colonne existe
            if (\Schema::hasColumn('abonnements', 'date_fin')) {
                $abonnementActif = $abonnementActif->where('date_fin', '>', now());
            }
            
            // ✅ AJOUT CONDITIONNEL : Vérifier statut seulement si la colonne existe
            if (\Schema::hasColumn('abonnements', 'statut')) {
                $abonnementActif = $abonnementActif->where('statut', 'actif');
            }
            
            $abonnementActif = $abonnementActif->first();
            
            if ($abonnementActif) {
                \Log::warning('Abonnement actif déjà existant', ['user_id' => Auth::id()]);
                return response()->json([
                    'success' => false,
                    'message' => 'Vous avez déjà un abonnement actif pour ce terrain et ce type.'
                ], 400);
            }

            // ✅ VÉRIFICATION DE DISPONIBILITÉ DES CRÉNEAUX
            if ($request->jour_prefere !== null && $request->heure_preferee) {
                $jourPrefere = $request->jour_prefere;
                $heurePrefere = $request->heure_preferee;
                $dureeSeance = $request->duree_seance;
                
                // Calculer la prochaine occurrence de ce jour
                $prochaineCreneau = now()->startOfWeek()->addDays($jourPrefere);
                if ($prochaineCreneau->isPast()) {
                    $prochaineCreneau->addWeek();
                }
                
                // Créer les dates de début et fin pour vérifier la disponibilité
                $dateDebut = $prochaineCreneau->setTimeFromTimeString($heurePrefere);
                $dateFin = $dateDebut->copy()->addHours($dureeSeance);
                
                // Vérifier les conflits avec les réservations existantes
                $conflict = \App\Models\Reservation::where('terrain_id', $request->terrain_id)
                    ->whereIn('statut', ['en_attente', 'confirmee'])
                    ->where('date_debut', '<', $dateFin)
                    ->where('date_fin', '>', $dateDebut)
                    ->exists();
                
                if ($conflict) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Le créneau préféré sélectionné n\'est pas disponible',
                        'details' => [
                            'jour' => ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'][$jourPrefere],
                            'heure' => $heurePrefere,
                            'prochaine_date' => $dateDebut->format('Y-m-d H:i')
                        ]
                    ], 409);
                }
                
                \Log::info('Créneau disponible vérifié', [
                    'terrain_id' => $request->terrain_id,
                    'jour' => $jourPrefere,
                    'heure' => $heurePrefere,
                    'prochaine_date' => $dateDebut->format('Y-m-d H:i')
                ]);
            }

            // ✅ CALCUL PRIX CORRIGÉ : Accepter les prix calculés côté frontend
            $prixMinimal = $typeAbonnement->prix * config('terrain_pricing.validation.subscription_price_min_factor', 0.5);
            $prixMaximal = $typeAbonnement->prix * config('terrain_pricing.validation.subscription_price_max_factor', 10);
            
            if ($request->prix_total < $prixMinimal || $request->prix_total > $prixMaximal) {
                \Log::warning('Prix hors limites acceptables', [
                    'prix_envoye' => $request->prix_total,
                    'prix_minimal' => $prixMinimal,
                    'prix_maximal' => $prixMaximal,
                    'option_terrain' => $request->option_terrain ?? 'non_specifie'
                ]);
                return response()->json([
                    'success' => false,
                    'message' => 'Prix hors des limites acceptables.',
                    'prix_minimal' => $prixMinimal,
                    'prix_maximal' => $prixMaximal,
                    'prix_envoye' => $request->prix_total
                ], 422);
            }

            // ✅ CRÉATION ABONNEMENT AVEC COLONNES CORRECTES SELON LA STRUCTURE BDD
            $abonnementData = [
                'user_id' => Auth::id(),
                'terrain_id' => $request->terrain_id,
                'type_abonnement' => $typeAbonnement->nom, // ✅ Colonne varchar dans la BDD
                'prix' => $request->prix_total,
                'categorie' => $typeAbonnement->categorie ?? 'basic',
                'est_visible' => true,
                'ordre_affichage' => $typeAbonnement->ordre_affichage ?? 1,
                // Préférences de créneaux (nouvelles colonnes)
                'jour_prefere' => $request->jour_prefere,
                'heure_preferee' => $request->heure_preferee,
                'nb_seances_semaine' => $request->nb_seances ?? 1,
                'duree_seance' => $request->duree_seance ?? 1.0,
                'preferences_flexibles' => $request->preferences_flexibles ?? true,
                'jours_alternatifs' => $request->jours_alternatifs,
                'heures_alternatives' => $request->heures_alternatives,
            ];
            
            // ✅ AJOUT DES COLONNES OBLIGATOIRES
            $abonnementData['date_debut'] = now();
            $abonnementData['date_fin'] = now()->addDays($typeAbonnement->duree_jours);
            $abonnementData['statut'] = 'en_attente_paiement';

            $abonnement = \App\Models\Abonnement::create($abonnementData);

            \Log::info('Souscription créée avec succès', [
                'abonnement_id' => $abonnement->id,
                'prix' => $abonnement->prix,
                'user_id' => Auth::id(),
                'terrain_id' => $request->terrain_id
            ]);

            // ✅ Préparer les données complètes pour la page de paiement
            $terrain = \App\Models\TerrainSynthetiquesDakar::find($request->terrain_id);
            
            return response()->json([
                'success' => true,
                'message' => 'Souscription créée avec succès',
                'redirect_to_payment' => true,
                'data' => [
                    'abonnement_id' => $abonnement->id,
                    'type_abonnement' => $typeAbonnement->nom,
                    'terrain_nom' => $terrain->nom ?? 'Terrain inconnu',
                    'terrain_adresse' => $terrain->adresse ?? '',
                    'prix_total' => $abonnement->prix,
                    'date_debut' => $abonnement->date_debut,
                    'date_fin' => $abonnement->date_fin,
                    'statut' => 'en_attente_paiement',
                    'duree_jours' => $typeAbonnement->duree_jours,
                    'preferences' => [
                        'jour_prefere' => $abonnement->jour_prefere,
                        'heure_preferee' => $abonnement->heure_preferee,
                        'nb_seances_semaine' => $abonnement->nb_seances_semaine,
                        'duree_seance' => $abonnement->duree_seance,
                        'preferences_flexibles' => $abonnement->preferences_flexibles
                    ],
                    'payment_options' => [
                        'immediate' => [
                            'type' => 'paiement_integral',
                            'montant' => $abonnement->prix,
                            'description' => 'Paiement intégral de l\'abonnement'
                        ],
                        'per_match' => [
                            'type' => 'paiement_par_match',
                            'montant_par_match' => $request->prix_par_match ?? ($abonnement->prix / ($abonnement->nb_seances_semaine * 4)),
                            'description' => 'Paiement à chaque utilisation du terrain',
                            'note' => 'Aucun frais d\'abonnement, vous payez uniquement quand vous jouez'
                        ]
                    ],
                    'instructions' => 'Choisissez votre mode de paiement pour finaliser votre abonnement'
                ]
            ], 201);
        } catch (\Exception $e) {
            \Log::error('SOUSCRIPTION EXCEPTION', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'user_id' => Auth::id(),
                'type_abonnement_id' => $id,
                'payload' => $request->all()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la souscription',
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ], 500);
        }
    }

    /**
     * Récupérer les abonnements de l'utilisateur
     */
    public function mySubscriptions(): JsonResponse
    {
        try {
            $abonnements = Abonnement::where('user_id', Auth::id())
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $abonnements
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des abonnements',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Annuler un abonnement
     */
    public function cancel($id): JsonResponse
    {
        try {
            $abonnement = Abonnement::where('user_id', Auth::id())
                ->findOrFail($id);

            if ($abonnement->statut === 'annule') {
                return response()->json([
                    'success' => false,
                    'message' => 'Cet abonnement est déjà annulé'
                ], 400);
            }

            $abonnement->update([
                'statut' => 'annule',
                'date_fin' => now()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Abonnement annulé avec succès',
                'data' => $abonnement->fresh()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'annulation de l\'abonnement',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Routes Admin

    /**
     * Créer un nouveau type d'abonnement (Admin)
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'type_abonnement' => 'required|string|max:255',
                'prix' => 'required|numeric|min:0',
                'duree_jours' => 'required|integer|min:1',
                'description' => 'nullable|string',
            ]);

            // Pour l'instant, on simule la création
            // Dans une vraie app, il faudrait une table types_abonnements
            
            return response()->json([
                'success' => true,
                'message' => 'Type d\'abonnement créé avec succès',
                'data' => [
                    'id' => rand(1000, 9999),
                    'type_abonnement' => $request->type_abonnement,
                    'prix' => $request->prix,
                    'duree_jours' => $request->duree_jours,
                    'description' => $request->description,
                    'created_at' => now()
                ]
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
                'message' => 'Erreur lors de la création du type d\'abonnement',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Afficher un abonnement (Admin)
     */
    public function show($id): JsonResponse
    {
        try {
            $abonnement = Abonnement::with(['user'])->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $abonnement
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Abonnement introuvable',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Mettre à jour un abonnement (Admin)
     */
    public function update(Request $request, $id): JsonResponse
    {
        try {
            $abonnement = Abonnement::findOrFail($id);
            
            $request->validate([
                'statut' => 'required|in:actif,suspendu,annule,expire',
                'date_fin' => 'nullable|date',
            ]);

            $abonnement->update($request->only(['statut', 'date_fin']));

            return response()->json([
                'success' => true,
                'message' => 'Abonnement mis à jour avec succès',
                'data' => $abonnement->fresh()
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
                'message' => 'Erreur lors de la mise à jour',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Supprimer un abonnement (Admin)
     */
    public function destroy($id): JsonResponse
    {
        try {
            $abonnement = Abonnement::findOrFail($id);
            $abonnement->delete();

            return response()->json([
                'success' => true,
                'message' => 'Abonnement supprimé avec succès'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Créer un abonnement récurrent
     */
    public function createRecurringSubscription(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'terrain_id' => 'required|exists:terrains_synthetiques_dakar,id',
                'type_recurrence' => 'required|in:hebdomadaire,mensuel,trimestriel,annuel',
                'nb_seances' => 'required|integer|min:1|max:10',
                'duree_seance' => 'required|numeric|min:1|max:3',
                'prix_total' => 'required|numeric|min:0',
                'date_debut' => 'required|date',
                'date_fin' => 'required|date|after:date_debut',
                'jours_semaine' => 'required|array|min:1',
                'jours_semaine.*' => 'integer|min:0|max:6',
                'heure_debut' => 'required|string',
                'heure_fin' => 'required|string',
            ]);

            // Vérifier s'il n'y a pas déjà un abonnement actif pour ce terrain
            $abonnementActif = Abonnement::where('user_id', Auth::id())
                ->where('terrain_id', $request->terrain_id)
                ->where('statut', 'actif')
                ->where('date_fin', '>', now())
                ->first();

            if ($abonnementActif) {
                return response()->json([
                    'success' => false,
                    'message' => 'Vous avez déjà un abonnement actif pour ce terrain'
                ], 400);
            }

            // ✅ CALCUL PRIX CORRIGÉ : Utiliser le prix envoyé par le frontend
            $terrain = \App\Models\TerrainSynthetiquesDakar::find($request->terrain_id);
            $prixHeure = $terrain ? $terrain->prix_heure : 25000;
            
            // Le frontend calcule déjà le prix correctement, on l'utilise
            $prixCalcule = $request->prix_total;
            
            // Calcul de référence pour validation (basé sur la logique simple)
            $nbSemaines = 4;
            if ($request->type_recurrence === 'trimestriel') $nbSemaines = 12;
            if ($request->type_recurrence === 'annuel') $nbSemaines = 52;
            $prixReference = $prixHeure * $request->duree_seance * $request->nb_seances * $nbSemaines;

            // ✅ VALIDATION PRIX CORRIGÉE : Validation basée sur le prix de référence
            $prixMinimalRecurrent = $prixReference * config('terrain_pricing.validation.recurring_price_min_factor', 0.1);
            $prixMaximalRecurrent = $prixReference * config('terrain_pricing.validation.recurring_price_max_factor', 5);
            
            \Log::info('Validation prix abonnement récurrent', [
                'prix_envoye' => $request->prix_total,
                'prix_reference' => $prixReference,
                'prix_minimal' => $prixMinimalRecurrent,
                'prix_maximal' => $prixMaximalRecurrent,
                'facteurs' => [
                    'min' => config('terrain_pricing.validation.recurring_price_min_factor', 0.1),
                    'max' => config('terrain_pricing.validation.recurring_price_max_factor', 5)
                ]
            ]);
            
            if ($request->prix_total < $prixMinimalRecurrent || $request->prix_total > $prixMaximalRecurrent) {
                \Log::warning('Prix abonnement récurrent hors limites', [
                    'prix_envoye' => $request->prix_total,
                    'prix_reference' => $prixReference,
                    'prix_minimal' => $prixMinimalRecurrent,
                    'prix_maximal' => $prixMaximalRecurrent
                ]);
                return response()->json([
                    'success' => false,
                    'message' => 'Prix hors des limites acceptables pour abonnement récurrent.',
                    'prix_reference' => $prixReference,
                    'prix_minimal' => $prixMinimalRecurrent,
                    'prix_maximal' => $prixMaximalRecurrent,
                    'prix_envoye' => $request->prix_total,
                    'details' => 'Validation basée sur le prix de référence calculé'
                ], 422);
            }

            $abonnement = Abonnement::create([
                'user_id' => Auth::id(),
                'terrain_id' => $request->terrain_id,
                'type_abonnement' => 'Abonnement ' . ucfirst($request->type_recurrence),
                'prix' => $request->prix_total, // ✅ Utiliser le prix calculé par le frontend
                'date_debut' => $request->date_debut,
                'date_fin' => $request->date_fin,
                'statut' => 'en_attente_paiement',
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Abonnement récurrent créé avec succès',
                'data' => [
                    'id' => $abonnement->id,
                    'terrain_id' => $abonnement->terrain_id,
                    'type_recurrence' => $request->type_recurrence,
                    'prix_total' => $request->prix_total, // ✅ Utiliser le prix calculé par le frontend
                    'date_debut' => $abonnement->date_debut,
                    'date_fin' => $abonnement->date_fin,
                    'statut' => 'en_attente_paiement'
                ]
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
                'message' => 'Erreur lors de la création de l\'abonnement récurrent',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Calculer le prix d'un abonnement récurrent
     */
    private function calculerPrixAbonnementRecurrent(Request $request): float
    {
        // Récupérer le terrain pour obtenir le prix par heure
        $terrain = \App\Models\TerrainSynthetiquesDakar::find($request->terrain_id);
        $prixHeure = $terrain ? $terrain->prix_heure : 5000; // Prix par défaut

        $dateDebut = \Carbon\Carbon::parse($request->date_debut);
        $dateFin = \Carbon\Carbon::parse($request->date_fin);
        $nombreSemaines = $dateDebut->diffInWeeks($dateFin);

        if ($request->type_recurrence === 'hebdomadaire') {
            $nombreJours = count($request->jours_semaine);
            $nombreHeures = $this->calculerNombreHeures($request->heure_debut, $request->heure_fin);
            $prixTotal = $nombreJours * $nombreHeures * $prixHeure * $nombreSemaines;
        } else {
            // Mensuel - calcul simplifié
            $prixTotal = $prixHeure * 4 * 4; // 4 heures par semaine, 4 semaines
        }

        return $prixTotal;
    }

    /**
     * Calculer le nombre d'heures entre deux heures
     */
    private function calculerNombreHeures(string $heureDebut, string $heureFin): int
    {
        $debut = \Carbon\Carbon::parse($heureDebut);
        $fin = \Carbon\Carbon::parse($heureFin);
        return $debut->diffInHours($fin);
    }

    /**
     * Lister les abonnements pour un gestionnaire (ses terrains uniquement)
     */
    public function getManagerSubscriptions(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            
            if ($user->role !== 'gestionnaire') {
                return response()->json([
                    'success' => false,
                    'message' => 'Accès non autorisé'
                ], 403);
            }

            // Récupérer les terrains gérés par ce gestionnaire
            $terrainsGeres = \App\Models\TerrainSynthetiquesDakar::where('gestionnaire_id', $user->id)->pluck('id');

            $abonnements = Abonnement::with(['user', 'terrain'])
                ->whereIn('terrain_id', $terrainsGeres)
                ->orderBy('created_at', 'desc')
                ->paginate(20);

            return response()->json([
                'success' => true,
                'data' => $abonnements,
                'manager_info' => [
                    'terrains_count' => $terrainsGeres->count(),
                    'active_subscriptions' => $abonnements->where('statut', 'actif')->count()
                ]
            ]);

        } catch (\Exception $e) {
            \Log::error('MANAGER SUBSCRIPTIONS ERROR', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des abonnements'
            ], 500);
        }
    }

    /**
     * Lister tous les abonnements pour l'admin
     */
    public function getAdminSubscriptions(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            
            if ($user->role !== 'admin') {
                return response()->json([
                    'success' => false,
                    'message' => 'Accès non autorisé'
                ], 403);
            }

            $abonnements = Abonnement::with(['user', 'terrain'])
                ->orderBy('created_at', 'desc')
                ->paginate(50);

            $stats = [
                'total_subscriptions' => Abonnement::count(),
                'active_subscriptions' => Abonnement::where('statut', 'actif')->count(),
                'pending_subscriptions' => Abonnement::where('statut', 'en_attente_paiement')->count(),
                'expired_subscriptions' => Abonnement::where('statut', 'expire')->count(),
                'total_revenue' => Abonnement::where('statut', 'actif')->sum('prix'),
                'this_month_subscriptions' => Abonnement::whereMonth('created_at', now()->month)->count()
            ];

            return response()->json([
                'success' => true,
                'data' => $abonnements,
                'stats' => $stats
            ]);

        } catch (\Exception $e) {
            \Log::error('ADMIN SUBSCRIPTIONS ERROR', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des abonnements'
            ], 500);
        }
    }

    /**
     * Mettre à jour le statut d'un abonnement (admin/gestionnaire)
     */
    public function updateSubscriptionStatus(Request $request, $id): JsonResponse
    {
        try {
            $user = Auth::user();
            $abonnement = Abonnement::with(['user', 'terrain'])->findOrFail($id);
            
            // Vérifier les permissions
            if ($user->role === 'gestionnaire') {
                $terrain = $abonnement->terrain;
                if (!$terrain || $terrain->gestionnaire_id !== $user->id) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Vous ne pouvez gérer que les abonnements de vos terrains'
                    ], 403);
                }
            } elseif ($user->role !== 'admin') {
                return response()->json([
                    'success' => false,
                    'message' => 'Accès non autorisé'
                ], 403);
            }

            $request->validate([
                'statut' => 'required|in:en_attente_paiement,actif,expire,annule,suspendu',
                'notes' => 'nullable|string|max:500'
            ]);

            $oldStatus = $abonnement->statut;
            $abonnement->statut = $request->statut;
            
            if ($request->notes) {
                $abonnement->notes_gestionnaire = $request->notes;
            }

            $abonnement->save();

            // Log de l'action
            \Log::info('SUBSCRIPTION STATUS UPDATED', [
                'abonnement_id' => $abonnement->id,
                'old_status' => $oldStatus,
                'new_status' => $request->statut,
                'updated_by' => $user->id,
                'updated_by_role' => $user->role
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Statut de l\'abonnement mis à jour avec succès',
                'data' => $abonnement
            ]);

        } catch (\Exception $e) {
            \Log::error('UPDATE SUBSCRIPTION STATUS ERROR', [
                'error' => $e->getMessage(),
                'subscription_id' => $id,
                'user_id' => Auth::id()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour du statut'
            ], 500);
        }
    }
} 