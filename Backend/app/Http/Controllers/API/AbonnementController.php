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
                'duree_seance' => 'required|integer|min:1|max:3',
                'nb_seances' => 'required|integer|min:1|max:3',
                'prix_total' => 'required|numeric|min:0',
            ]);

            // Vérifier s'il n'y a pas déjà un abonnement actif pour ce terrain et ce type
            $abonnementActif = \App\Models\Abonnement::where('user_id', Auth::id())
                ->where('terrain_id', $request->terrain_id)
                ->where('type_abonnement_id', $id)
                ->where('statut', 'actif')
                ->where('date_fin', '>', now())
                ->first();
            if ($abonnementActif) {
                \Log::warning('Abonnement actif déjà existant', ['user_id' => Auth::id()]);
                return response()->json([
                    'success' => false,
                    'message' => 'Vous avez déjà un abonnement actif pour ce terrain et ce type.'
                ], 400);
            }

            // Calcul du prix attendu (pour sécurité)
            $prixCalcule = $typeAbonnement->prix * $request->duree_seance * $request->nb_seances / 1; // Ajuste la formule si besoin
            if (abs($prixCalcule - $request->prix_total) > 1) {
                return response()->json([
                    'success' => false,
                    'message' => 'Le prix envoyé ne correspond pas au calcul attendu.',
                    'prix_attendu' => $prixCalcule,
                    'prix_envoye' => $request->prix_total
                ], 422);
            }

            // Créer l'abonnement utilisateur
            $abonnement = \App\Models\Abonnement::create([
                'user_id' => Auth::id(),
                'terrain_id' => $request->terrain_id,
                'type_abonnement_id' => $typeAbonnement->id,
                'type_abonnement' => $typeAbonnement->nom,
                'prix' => $request->prix_total,
                'date_debut' => now(),
                'date_fin' => now()->addDays($typeAbonnement->duree_jours),
                'statut' => 'en_attente_paiement',
                // Champs supplémentaires pour éviter les erreurs
                'description' => $typeAbonnement->description,
                'avantages' => $typeAbonnement->avantages,
                'categorie' => $typeAbonnement->categorie,
                'est_actif' => true,
                'est_visible' => true,
                'ordre_affichage' => $typeAbonnement->ordre_affichage,
            ]);

            \Log::info('Souscription créée avec succès', [
                'abonnement_id' => $abonnement->id,
                'prix' => $abonnement->prix
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Souscription initiée avec succès',
                'data' => [
                    'abonnement_id' => $abonnement->id,
                    'type' => $typeAbonnement->nom,
                    'prix' => $abonnement->prix,
                    'date_fin' => $abonnement->date_fin,
                    'statut' => 'en_attente_paiement',
                    'instructions' => 'Procédez au paiement pour activer votre abonnement'
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
                'type_recurrence' => 'required|in:hebdomadaire,mensuel',
                'nb_seances' => 'required|integer|min:1|max:3',
                'duree_seance' => 'required|integer|min:1|max:3',
                'prix_total' => 'required|numeric|min:0',
                'date_debut' => 'required|date',
                'date_fin' => 'required|date|after:date_debut',
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

            // Calculer le prix total basé sur les paramètres utilisateur
            $terrain = \App\Models\Terrain::find($request->terrain_id);
            $prixHeure = $terrain ? $terrain->prix_heure : 25000;
            $nbSemaines = 4;
            if ($request->type_recurrence === 'trimestriel') $nbSemaines = 12;
            if ($request->type_recurrence === 'annuel') $nbSemaines = 52;
            $prixCalcule = $prixHeure * $request->duree_seance * $request->nb_seances * $nbSemaines;

            if (abs($prixCalcule - $request->prix_total) > 1) { // tolérance 1 FCFA
                return response()->json([
                    'success' => false,
                    'message' => 'Le prix envoyé ne correspond pas au calcul attendu.',
                    'prix_attendu' => $prixCalcule,
                    'prix_envoye' => $request->prix_total
                ], 422);
            }

            $abonnement = Abonnement::create([
                'user_id' => Auth::id(),
                'terrain_id' => $request->terrain_id,
                'type_abonnement' => 'Abonnement ' . ucfirst($request->type_recurrence),
                'prix' => $prixCalcule,
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
                    'prix_total' => $prixCalcule,
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
        $terrain = \App\Models\Terrain::find($request->terrain_id);
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
} 