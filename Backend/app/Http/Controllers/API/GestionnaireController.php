<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Terrain;
use App\Models\ContratCommission;
use App\Models\HistoriqueValidation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Auth;

class GestionnaireController extends Controller
{
    /**
     * Lister les gestionnaires avec filtres
     */
    public function index(Request $request)
    {
        $query = User::with(['validateur', 'contratsCommission'])
                    ->where('role', 'gestionnaire');

        // Filtrer par statut de validation
        if ($request->has('statut_validation')) {
            $query->where('statut_validation', $request->statut_validation);
        }

        // Recherche par nom, email ou entreprise
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('nom', 'like', "%{$search}%")
                  ->orWhere('prenom', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('nom_entreprise', 'like', "%{$search}%");
            });
        }

        $gestionnaires = $query->orderBy('created_at', 'desc')->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $gestionnaires
        ]);
    }

    /**
     * Afficher les détails d'un gestionnaire
     */
    public function show($id)
    {
        $gestionnaire = User::with([
            'validateur', 
            'contratsCommission.terrainSynthetique',
            'terrainsGeres',
            'historiqueValidations'
        ])->where('role', 'gestionnaire')->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $gestionnaire
        ]);
    }

    /**
     * Approuver un gestionnaire
     */
    public function approuver(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'taux_commission' => 'required|numeric|min:0|max:100',
            'commentaires' => 'nullable|string|max:1000',
            'conditions_speciales' => 'nullable|string|max:2000'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Données invalides',
                'errors' => $validator->errors()
            ], 422);
        }

        $gestionnaire = User::where('role', 'gestionnaire')
                           ->where('statut_validation', 'en_attente')
                           ->findOrFail($id);

        try {
            \DB::beginTransaction();

            // Mettre à jour le gestionnaire
            $gestionnaire->update([
                'statut_validation' => 'approuve',
                'taux_commission_defaut' => $request->taux_commission,
                'date_validation' => now(),
                'valide_par' => auth()->id(),
                'notes_admin' => $request->commentaires
            ]);

            // Créer le contrat de commission global
            ContratCommission::create([
                'gestionnaire_id' => $gestionnaire->id,
                'terrain_synthetique_id' => null, // Contrat global
                'taux_commission' => $request->taux_commission,
                'type_contrat' => 'global',
                'date_debut' => now(),
                'statut' => 'actif',
                'conditions_speciales' => $request->conditions_speciales,
                'historique_negociation' => [[
                    'date' => now()->toISOString(),
                    'action' => 'creation',
                    'taux' => $request->taux_commission,
                    'commentaire' => 'Contrat initial créé lors de l\'approbation'
                ]]
            ]);

            // Enregistrer l'historique de validation
            HistoriqueValidation::create([
                'validable_type' => User::class,
                'validable_id' => $gestionnaire->id,
                'validateur_id' => auth()->id(),
                'action' => 'approuve',
                'raison' => $request->commentaires,
                'donnees_apres' => [
                    'statut_validation' => 'approuve',
                    'taux_commission' => $request->taux_commission
                ]
            ]);

            \DB::commit();

            // Envoyer email de confirmation (à implémenter)
            // Mail::to($gestionnaire->email)->send(new GestionnaireApprouve($gestionnaire));

            return response()->json([
                'success' => true,
                'message' => 'Gestionnaire approuvé avec succès',
                'data' => $gestionnaire->fresh()
            ]);

        } catch (\Exception $e) {
            \DB::rollback();
            
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'approbation',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Rejeter un gestionnaire
     */
    public function rejeter(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'raison' => 'required|string|max:1000'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'La raison du rejet est requise',
                'errors' => $validator->errors()
            ], 422);
        }

        $gestionnaire = User::where('role', 'gestionnaire')
                           ->where('statut_validation', 'en_attente')
                           ->findOrFail($id);

        try {
            \DB::beginTransaction();

            $gestionnaire->update([
                'statut_validation' => 'rejete',
                'date_validation' => now(),
                'valide_par' => auth()->id(),
                'notes_admin' => $request->raison
            ]);

            // Enregistrer l'historique de validation
            HistoriqueValidation::create([
                'validable_type' => User::class,
                'validable_id' => $gestionnaire->id,
                'validateur_id' => auth()->id(),
                'action' => 'rejete',
                'raison' => $request->raison
            ]);

            \DB::commit();

            // Envoyer email de rejet (à implémenter)
            // Mail::to($gestionnaire->email)->send(new GestionnaireRejete($gestionnaire, $request->raison));

            return response()->json([
                'success' => true,
                'message' => 'Gestionnaire rejeté',
                'data' => $gestionnaire->fresh()
            ]);

        } catch (\Exception $e) {
            \DB::rollback();
            
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du rejet',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Suspendre un gestionnaire
     */
    public function suspendre(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'raison' => 'required|string|max:1000'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'La raison de la suspension est requise',
                'errors' => $validator->errors()
            ], 422);
        }

        $gestionnaire = User::where('role', 'gestionnaire')
                           ->where('statut_validation', 'approuve')
                           ->findOrFail($id);

        try {
            \DB::beginTransaction();

            $gestionnaire->update([
                'statut_validation' => 'suspendu',
                'notes_admin' => $request->raison
            ]);

            // Suspendre tous les contrats de commission
            ContratCommission::where('gestionnaire_id', $gestionnaire->id)
                             ->where('statut', 'actif')
                             ->update(['statut' => 'suspendu']);

            // Enregistrer l'historique de validation
            HistoriqueValidation::create([
                'validable_type' => User::class,
                'validable_id' => $gestionnaire->id,
                'validateur_id' => auth()->id(),
                'action' => 'suspendu',
                'raison' => $request->raison
            ]);

            \DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Gestionnaire suspendu',
                'data' => $gestionnaire->fresh()
            ]);

        } catch (\Exception $e) {
            \DB::rollback();
            
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suspension',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Télécharger un document légal
     */
    public function telechargerDocument($id, $typeDocument)
    {
        $gestionnaire = User::where('role', 'gestionnaire')->findOrFail($id);
        
        $documentsLegaux = $gestionnaire->documents_legaux ?? [];
        
        if (!isset($documentsLegaux[$typeDocument])) {
            return response()->json([
                'success' => false,
                'message' => 'Document non trouvé'
            ], 404);
        }

        $cheminDocument = $documentsLegaux[$typeDocument];
        
        if (!Storage::exists($cheminDocument)) {
            return response()->json([
                'success' => false,
                'message' => 'Fichier non trouvé sur le serveur'
            ], 404);
        }

        return Storage::download($cheminDocument);
    }

    /**
     * Négocier le taux de commission
     */
    public function negocierCommission(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'nouveau_taux' => 'required|numeric|min:0|max:100',
            'commentaire' => 'required|string|max:1000',
            'terrain_id' => 'nullable|exists:terrains_synthetiques_dakar,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Données invalides',
                'errors' => $validator->errors()
            ], 422);
        }

        $gestionnaire = User::where('role', 'gestionnaire')
                           ->where('statut_validation', 'approuve')
                           ->findOrFail($id);

        try {
            \DB::beginTransaction();

            // Trouver le contrat approprié
            $contrat = ContratCommission::where('gestionnaire_id', $gestionnaire->id)
                                      ->when($request->terrain_id, function($q) use ($request) {
                                          return $q->where('terrain_synthetique_id', $request->terrain_id);
                                      }, function($q) {
                                          return $q->whereNull('terrain_synthetique_id'); // Contrat global
                                      })
                                      ->where('statut', 'actif')
                                      ->first();

            if (!$contrat) {
                return response()->json([
                    'success' => false,
                    'message' => 'Aucun contrat actif trouvé'
                ], 404);
            }

            $ancienTaux = $contrat->taux_commission;

            // Ajouter à l'historique de négociation
            $contrat->ajouterNegociation(
                'modification_taux',
                $ancienTaux,
                $request->nouveau_taux,
                $request->commentaire
            );

            // Mettre à jour le taux
            $contrat->update([
                'taux_commission' => $request->nouveau_taux
            ]);

            \DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Taux de commission mis à jour',
                'data' => $contrat->fresh()
            ]);

        } catch (\Exception $e) {
            \DB::rollback();
            
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la négociation',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtenir les statistiques des gestionnaires
     */
    public function statistiques()
    {
        $stats = [
            'total' => User::where('role', 'gestionnaire')->count(),
            'en_attente' => User::gestionnairesEnAttente()->count(),
            'approuves' => User::gestionnairesValides()->count(),
            'rejetes' => User::where('role', 'gestionnaire')->where('statut_validation', 'rejete')->count(),
            'suspendus' => User::where('role', 'gestionnaire')->where('statut_validation', 'suspendu')->count(),
            'commission_moyenne' => ContratCommission::actifs()->avg('taux_commission'),
            'nouvelles_candidatures_semaine' => User::gestionnairesEnAttente()
                                                   ->where('created_at', '>=', now()->subWeek())
                                                   ->count()
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }

    /**
     * Récupérer les terrains du gestionnaire connecté
     */
    public function mesTerrains(Request $request)
    {
        $user = Auth::user();
        
        if ($user->role !== 'gestionnaire') {
            return response()->json([
                'success' => false,
                'message' => 'Accès non autorisé'
            ], 403);
        }

        $query = TerrainSynthetiquesDakar::byGestionnaire($user->id)
            ->with(['avis' => function($q) {
                $q->where('statut', 'approuve')->latest()->limit(3);
            }]);

        // Filtres spécifiques au gestionnaire
        if ($request->filled('statut')) {
            $query->where('statut_validation', $request->statut);
        }

        $terrains = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $terrains
        ]);
    }

    /**
     * Obtenir les statistiques du gestionnaire
     */
    public function getStatistiques()
    {
        try {
            $gestionnaire = auth()->user();
            
            // Utiliser la vraie relation du gestionnaire avec ses terrains
            $terrains = $gestionnaire->terrains; // Utilise la relation définie dans le modèle User
            $totalTerrains = $terrains->count();
            
            // Si pas de terrains, retourner des stats vides
            if ($totalTerrains === 0) {
                return response()->json([
                    'success' => true,
                    'data' => [
                        'total_terrains' => 0,
                        'terrains_actifs' => 0,
                        'reservations_mois' => 0,
                        'revenus_mois' => 0,
                        'taux_occupation' => 0,
                        'note_moyenne' => 0,
                        'prochaines_reservations' => [],
                        'message' => 'Aucun terrain assigné. Contactez l\'administrateur pour l\'attribution de terrains.'
                    ]
                ]);
            }
            
            // Compter les réservations du mois actuel
            $reservationsMois = \App\Models\Reservation::whereMonth('date_debut', now()->month)
                                                     ->whereYear('date_debut', now()->year)
                                                     ->count();
            
            // Calculer les revenus du mois (somme des montants des réservations confirmées)
            $revenusMois = \App\Models\Reservation::whereMonth('date_debut', now()->month)
                                                 ->whereYear('date_debut', now()->year)
                                                 ->whereIn('statut', ['confirmee', 'terminee'])
                                                 ->sum('montant_total');
            
            // Calculer le taux d'occupation approximatif
            $joursOuvrables = now()->daysInMonth;
            $heuresParJour = 12; // 8h-20h
            $heuresDisponibles = $totalTerrains * $joursOuvrables * $heuresParJour;
            
            $reservationsConfirmees = \App\Models\Reservation::whereMonth('date_debut', now()->month)
                                                           ->whereYear('date_debut', now()->year)
                                                           ->whereIn('statut', ['confirmee', 'terminee'])
                                                           ->get();
            
            $heuresReservees = $reservationsConfirmees->sum(function ($reservation) {
                $debut = \Carbon\Carbon::parse($reservation->date_debut);
                $fin = \Carbon\Carbon::parse($reservation->date_fin);
                return max(0, $fin->diffInHours($debut)); // S'assurer que la durée est positive
            });
            
            // S'assurer que le taux d'occupation est positif et réaliste
            $tauxOccupation = 0;
            if ($heuresDisponibles > 0 && $heuresReservees > 0) {
                $tauxOccupation = min(100, max(0, ($heuresReservees / $heuresDisponibles) * 100));
            } else if ($reservationsMois > 0 && $totalTerrains > 0) {
                // Calcul alternatif basé sur le nombre de réservations (estimation 2h par réservation)
                $estimationHeures = $reservationsMois * 2;
                $tauxOccupation = min(100, max(0, ($estimationHeures / $heuresDisponibles) * 100));
            }
            
            // Prochaines réservations
            $prochaines = \App\Models\Reservation::with(['user', 'terrain'])
                                                ->where('date_debut', '>', now())
                                                ->where('statut', 'confirmee')
                                                ->orderBy('date_debut')
                                                ->limit(5)
                                                ->get()
                                                ->map(function ($reservation) {
                                                    return [
                                                        'terrain_nom' => $reservation->terrain->nom ?? 'Terrain',
                                                        'date_debut' => $reservation->date_debut,
                                                        'client_nom' => ($reservation->user->prenom ?? 'Client') . ' ' . ($reservation->user->nom ?? '')
                                                    ];
                                                });
            
            // Note moyenne des terrains
            $noteMoyenne = $terrains->where('note_moyenne', '>', 0)->avg('note_moyenne') ?: 0;

            $stats = [
                'total_terrains' => $totalTerrains,
                'terrains_actifs' => $terrains->where('est_disponible', true)->count(),
                'reservations_mois' => $reservationsMois,
                'revenus_mois' => $revenusMois,
                'taux_occupation' => round($tauxOccupation, 1),
                'note_moyenne' => round($noteMoyenne, 1),
                'prochaines_reservations' => $prochaines->toArray()
            ];

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);

        } catch (\Exception $e) {
            \Log::error('Erreur statistiques gestionnaire: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du chargement des statistiques',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtenir les statistiques de revenus
     */
    public function getRevenueStats()
    {
        try {
            $gestionnaire = auth()->user();
            
            // Générer les revenus des 6 derniers mois avec vraies données
            $revenusParMois = [];
            for ($i = 5; $i >= 0; $i--) {
                $mois = now()->subMonths($i);
                $revenus = \App\Models\Reservation::whereMonth('date_debut', $mois->month)
                                                 ->whereYear('date_debut', $mois->year)
                                                 ->whereIn('statut', ['confirmee', 'terminee'])
                                                 ->sum('montant_total');
                
                $revenusParMois[] = [
                    'mois' => $mois->format('M'),
                    'revenus' => $revenus
                ];
            }
            
            // Calculer les commissions (exemple 15%)
            $revenusMoisActuel = \App\Models\Reservation::whereMonth('date_debut', now()->month)
                                                      ->whereYear('date_debut', now()->year)
                                                      ->whereIn('statut', ['confirmee', 'terminee'])
                                                      ->sum('montant_total');
            
            $commissionsGenerees = $revenusMoisActuel * 0.15; // 15% de commission
            
            // Derniers paiements - seulement les vrais de la base
            $derniersPaiements = \App\Models\Paiement::with(['user', 'reservation.terrain'])
                                                   ->where('statut', 'reussi')
                                                   ->orderBy('created_at', 'desc')
                                                   ->limit(5)
                                                   ->get()
                                                   ->map(function ($paiement) {
                                                       return [
                                                           'date' => $paiement->created_at->format('Y-m-d'),
                                                           'montant' => $paiement->montant,
                                                           'client' => ($paiement->user->prenom ?? 'Client') . ' ' . ($paiement->user->nom ?? ''),
                                                           'terrain' => $paiement->reservation->terrain->nom ?? 'N/A'
                                                       ];
                                                   });

            $stats = [
                'revenus_mensuels' => $revenusParMois,
                'commissions' => [
                    'taux' => 15,
                    'total_mois' => round($commissionsGenerees),
                    'a_recevoir' => round($commissionsGenerees * 0.7) // 70% à recevoir
                ],
                'paiements_en_attente' => \App\Models\Paiement::where('statut', 'en_attente')->count(),
                'derniers_paiements' => $derniersPaiements->toArray()
            ];

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);

        } catch (\Exception $e) {
            \Log::error('Erreur stats revenus gestionnaire: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du chargement des statistiques de revenus',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtenir les réservations du gestionnaire
     */
    public function getReservations()
    {
        try {
            $gestionnaire = auth()->user();
            
            // Récupérer les vraies réservations avec relations
            $reservations = \App\Models\Reservation::with(['user', 'terrain.terrainSynthetique'])
                                                  ->orderBy('date_debut', 'desc')
                                                  ->limit(20)
                                                  ->get()
                                                  ->map(function ($reservation) {
                                                      return [
                                                          'id' => $reservation->id,
                                                          'date_debut' => $reservation->date_debut,
                                                          'date_fin' => $reservation->date_fin,
                                                          'statut' => $reservation->statut,
                                                          'prix_total' => $reservation->montant_total,
                                                          'client' => [
                                                              'nom' => $reservation->user->nom ?? '',
                                                              'prenom' => $reservation->user->prenom ?? 'Client',
                                                              'telephone' => $reservation->user->telephone ?? ''
                                                          ],
                                                          'terrain' => [
                                                              'nom' => $reservation->terrain->nom ?? 'Terrain',
                                                              'adresse' => $reservation->terrain->adresse ?? 'Adresse non disponible'
                                                          ],
                                                          'code_ticket' => $reservation->code_ticket
                                                      ];
                                                  });

            return response()->json([
                'success' => true,
                'data' => $reservations->toArray()
            ]);

        } catch (\Exception $e) {
            \Log::error('Erreur réservations gestionnaire: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du chargement des réservations',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtenir les terrains du gestionnaire
     */
    public function getTerrains()
    {
        try {
            $gestionnaire = auth()->user();
            
            // Utiliser la vraie relation du gestionnaire avec ses terrains
            $terrains = $gestionnaire->terrains; // Relation définie dans le modèle User
            
            // Mapper les données des terrains du gestionnaire
            $terrainsData = $terrains->map(function ($terrain) {
                return [
                    'id' => $terrain->id,
                    'nom' => $terrain->nom,
                    'description' => $terrain->description,
                    'capacite' => $terrain->capacite,
                    'prix_heure' => $terrain->prix_heure,
                    'est_disponible' => $terrain->est_disponible,
                    'surface' => $terrain->surface,
                    'equipements' => $terrain->equipements,
                    'note_moyenne' => $terrain->note_moyenne,
                    'nombre_avis' => $terrain->nombre_avis,
                    'adresse' => $terrain->adresse,
                    'latitude' => $terrain->latitude,
                    'longitude' => $terrain->longitude
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $terrainsData->toArray()
            ]);

        } catch (\Exception $e) {
            \Log::error('Erreur terrains gestionnaire: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du chargement des terrains',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Créer un nouveau terrain
     */
    public function createTerrain(Request $request)
    {
        $user = Auth::user();
        
        if ($user->role !== 'gestionnaire') {
            return response()->json([
                'success' => false,
                'message' => 'Vous devez être un gestionnaire pour ajouter un terrain'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'nom' => 'required|string|max:255',
            'description' => 'required|string',
            'adresse' => 'required|string|max:500',
            'capacite' => 'required|integer|min:10|max:50',
            'prix_heure' => 'required|numeric|min:5000|max:100000',
            'surface' => 'required|numeric|min:100',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Données invalides',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $terrainData = $validator->validated();
            $terrainData['est_disponible'] = true;

            return response()->json([
                'success' => true,
                'message' => 'Terrain créé avec succès. Il sera validé par notre équipe sous 48h.',
                'data' => $terrainData
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la création du terrain',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Valider un code de ticket de réservation
     */
    public function validateTicketCode(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'ticket_code' => 'required|string|min:3|max:50'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Code de ticket requis',
                    'errors' => $validator->errors()
                ], 422);
            }

            $inputCode = $request->input('ticket_code');
            
            // Parser le code d'entrée pour le normaliser
            $ticketCode = \App\Models\Reservation::parseTicketCode($inputCode);
            
            // Chercher une réservation avec ce code de ticket
            $reservation = \App\Models\Reservation::with(['user', 'terrain'])
                ->where('code_ticket', $ticketCode)
                ->first();

            if (!$reservation) {
                return response()->json([
                    'success' => false,
                    'message' => 'Code de ticket invalide ou introuvable'
                ], 404);
            }

            // Vérifier le statut de la réservation
            if (!in_array($reservation->statut, ['confirmee', 'en_cours', 'terminee'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cette réservation n\'est pas valide (statut: ' . $reservation->statut . ')'
                ], 400);
            }

            // Vérifier que la réservation n'est pas trop ancienne (7 jours)
            $dateReservation = \Carbon\Carbon::parse($reservation->date_debut);
            if ($dateReservation->isPast() && $dateReservation->diffInDays(now()) > 7) {
                return response()->json([
                    'success' => false,
                    'message' => 'Ce ticket a expiré (réservation trop ancienne)'
                ], 400);
            }

            // Validation réussie - retourner les données de la réservation
            $validatedReservation = [
                'id' => $reservation->id,
                'terrain_nom' => $reservation->terrain->nom ?? 'Terrain',
                'client_nom' => ($reservation->user->prenom ?? 'Client') . ' ' . ($reservation->user->nom ?? ''),
                'date_debut' => $reservation->date_debut,
                'date_fin' => $reservation->date_fin,
                'statut' => $reservation->statut,
                'code_ticket' => $reservation->code_ticket ?? $ticketCode,
                'montant_total' => $reservation->montant_total ?? 0
            ];

            // Marquer la réservation comme validée
            $reservation->markAsValidated();

            return response()->json([
                'success' => true,
                'message' => 'Ticket validé avec succès !',
                'data' => [
                    'reservation' => $validatedReservation
                ]
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Erreur validation ticket:', ['error' => $e->getMessage(), 'code' => $request->input('ticket_code')]);
            
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la validation du ticket'
            ], 500);
        }
    }

    /**
     * Obtenir l'historique des validations récentes
     */
    public function getValidationHistory()
    {
        try {
            $gestionnaire = auth()->user();
            
            // Récupérer les dernières validations depuis la base de données
            $validations = \App\Models\Reservation::with(['user', 'terrain'])
                ->whereNotNull('derniere_validation')
                ->orderBy('derniere_validation', 'desc')
                ->limit(10)
                ->get()
                ->map(function ($reservation) {
                    return [
                        'valid' => true,
                        'reservation' => [
                            'id' => $reservation->id,
                            'terrain_nom' => $reservation->terrain->nom ?? 'Terrain',
                            'client_nom' => ($reservation->user->prenom ?? 'Client') . ' ' . ($reservation->user->nom ?? ''),
                            'date_debut' => $reservation->date_debut,
                            'date_fin' => $reservation->date_fin,
                            'statut' => $reservation->statut,
                            'code_ticket' => $reservation->code_ticket ?? 'TSK-' . $reservation->id,
                        ],
                        'message' => 'Ticket validé avec succès !',
                        'date_validation' => $reservation->derniere_validation
                    ];
                });

            // Retourner uniquement les vraies données de la base

            return response()->json([
                'success' => true,
                'data' => $validations->toArray()
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Erreur historique validations:', ['error' => $e->getMessage()]);
            
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du chargement de l\'historique',
                'error' => $e->getMessage()
                         ], 500);
         }
     }

    /**
     * Obtenir la liste des codes de tickets existants pour gestion
     */
    public function getTicketCodes(Request $request)
    {
        try {
            $query = \App\Models\Reservation::with(['user', 'terrain'])
                ->whereNotNull('code_ticket')
                ->orderBy('created_at', 'desc');

            // Filtrer par statut si spécifié
            if ($request->has('statut')) {
                $query->where('statut', $request->statut);
            }

            // Filtrer par date si spécifié
            if ($request->has('date_debut')) {
                $query->whereDate('date_debut', '>=', $request->date_debut);
            }

            $reservations = $query->paginate(20);

            $codes = $reservations->map(function ($reservation) {
                // Extraire le code final (6 derniers chiffres)
                $codeFinal = '';
                if (preg_match('/TSK-KSM-\d{4}-(\d{6})$/', $reservation->code_ticket, $matches)) {
                    $codeFinal = $matches[1];
                }

                return [
                    'id' => $reservation->id,
                    'code_complet' => $reservation->code_ticket,
                    'code_final' => $codeFinal,
                    'client_nom' => $reservation->user ? 
                        $reservation->user->prenom . ' ' . $reservation->user->nom : 'Client',
                    'terrain_nom' => $reservation->terrain ? $reservation->terrain->nom : 'Terrain',
                    'date_debut' => $reservation->date_debut,
                    'date_fin' => $reservation->date_fin,
                    'statut' => $reservation->statut,
                    'montant_total' => $reservation->montant_total,
                    'derniere_validation' => $reservation->derniere_validation,
                    'recently_validated' => $reservation->wasRecentlyValidated()
                ];
            });

            return response()->json([
                'success' => true,
                'data' => [
                    'codes' => $codes,
                    'pagination' => [
                        'current_page' => $reservations->currentPage(),
                        'total' => $reservations->total(),
                        'per_page' => $reservations->perPage(),
                        'last_page' => $reservations->lastPage()
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            \Log::error('Erreur gestion codes tickets:', ['error' => $e->getMessage()]);
            
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du chargement des codes',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Générer manuellement un code de ticket pour une réservation
     */
    public function generateTicketForReservation(Request $request, $reservationId)
    {
        try {
            $reservation = \App\Models\Reservation::findOrFail($reservationId);
            
            if ($reservation->code_ticket) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cette réservation a déjà un code de ticket'
                ], 400);
            }

            $newCode = \App\Models\Reservation::generateTicketCode();
            $reservation->update(['code_ticket' => $newCode]);

            return response()->json([
                'success' => true,
                'message' => 'Code de ticket généré avec succès',
                'data' => [
                    'reservation_id' => $reservation->id,
                    'code_ticket' => $newCode
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la génération du code',
                'error' => $e->getMessage()
            ], 500);
        }
    }
} 
