<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\TerrainSynthetiquesDakar;
use App\Models\Terrain;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class TerrainController extends Controller
{
    /**
     * Liste des terrains synthétiques avec pagination
     */
    public function index(Request $request)
    {
        $query = TerrainSynthetiquesDakar::with(['terrains'])
            ->actif()
            ->disponible();

        // Filtres
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'ILIKE', "%{$search}%")
                  ->orWhere('description', 'ILIKE', "%{$search}%")
                  ->orWhere('gestionnaire', 'ILIKE', "%{$search}%");
            });
        }

        if ($request->has('prix_min') && $request->has('prix_max')) {
            $query->whereBetween('prix_heure', [$request->prix_min, $request->prix_max]);
        }

        if ($request->has('equipements')) {
            $equipements = explode(',', $request->equipements);
            foreach ($equipements as $equipement) {
                $query->whereJsonContains('equipements', trim($equipement));
            }
        }

        // Tri
        $sortBy = $request->get('sort_by', 'name');
        $sortDirection = $request->get('sort_direction', 'asc');
        
        $validSorts = ['name', 'prix_heure', 'area', 'capacite_spectateurs'];
        if (in_array($sortBy, $validSorts)) {
            $query->orderBy($sortBy, $sortDirection);
        }

        $terrains = $query->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => [
                'terrains' => $terrains->items(),
                'pagination' => [
                    'current_page' => $terrains->currentPage(),
                    'last_page' => $terrains->lastPage(),
                    'per_page' => $terrains->perPage(),
                    'total' => $terrains->total(),
                ]
            ]
        ]);
    }

    /**
     * Détails d'un terrain spécifique
     */
    public function show($id)
    {
        $terrain = TerrainSynthetiquesDakar::with(['terrains'])
            ->actif()
            ->find($id);

        if (!$terrain) {
            return response()->json([
                'success' => false,
                'message' => 'Terrain non trouvé'
            ], 404);
        }

        // Ajouter des statistiques
        $stats = [
            'total_reservations' => $terrain->getTotalReservations(),
            'note_moyenne' => $terrain->getAverageRating(),
            'est_ouvert' => $terrain->est_ouvert,
        ];

        return response()->json([
            'success' => true,
            'data' => array_merge($terrain->toArray(), ['stats' => $stats])
        ]);
    }

    /**
     * Recherche de terrains à proximité
     */
    public function nearby(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'radius' => 'sometimes|numeric|min:0.1|max:50'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Coordonnées invalides',
                'errors' => $validator->errors()
            ], 422);
        }

        $latitude = $request->latitude;
        $longitude = $request->longitude;
        $radius = $request->get('radius', 10); // 10km par défaut

        $terrains = TerrainSynthetiquesDakar::actif()
            ->disponible()
            ->nearby($latitude, $longitude, $radius)
            ->with(['terrains'])
            ->get()
            ->map(function ($terrain) use ($latitude, $longitude) {
                $terrainArray = $terrain->toArray();
                $terrainArray['distance'] = $terrain->getDistanceFromAttribute($latitude, $longitude);
                return $terrainArray;
            })
            ->sortBy('distance')
            ->take(20);

        return response()->json([
            'success' => true,
            'data' => $terrains->values(),
            'meta' => [
                'search_center' => [
                    'latitude' => $latitude,
                    'longitude' => $longitude
                ],
                'radius_km' => $radius,
                'total_found' => $terrains->count()
            ]
        ]);
    }

    /**
     * Recherche par localisation (nom de ville, quartier)
     */
    public function searchByLocation(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'location' => 'required|string|min:2'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Localisation invalide',
                'errors' => $validator->errors()
            ], 422);
        }

        $location = $request->location;

        $terrains = TerrainSynthetiquesDakar::actif()
            ->disponible()
            ->where(function($query) use ($location) {
                $query->where('name', 'ILIKE', "%{$location}%")
                      ->orWhere('adresse', 'ILIKE', "%{$location}%")
                      ->orWhere('description', 'ILIKE', "%{$location}%");
            })
            ->with(['terrains'])
            ->get();

        return response()->json([
            'success' => true,
            'data' => $terrains,
            'meta' => [
                'search_term' => $location,
                'total_found' => $terrains->count()
            ]
        ]);
    }

    /**
     * Terrains populaires
     */
    public function popular(Request $request)
    {
        $terrains = TerrainSynthetiquesDakar::actif()
            ->disponible()
            ->with(['terrains'])
            ->withCount(['reservations as total_reservations'])
            ->orderBy('total_reservations', 'desc')
            ->take($request->get('limit', 10))
            ->get();

        return response()->json([
            'success' => true,
            'data' => $terrains
        ]);
    }

    /**
     * Vérifier la disponibilité d'un terrain pour une date/heure
     */
    public function checkAvailability(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'terrain_id' => 'required|exists:terrains_synthetiques_dakar,id',
            'date' => 'required|date|after_or_equal:today',
            'duree_heures' => 'sometimes|numeric|min:1|max:8'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Données invalides',
                'errors' => $validator->errors()
            ], 422);
        }

        $terrain = TerrainSynthetiquesDakar::find($request->terrain_id);
        $date = $request->date;
        $dureeHeures = $request->get('duree_heures', 1);

        // Vérifier si le terrain a des sous-terrains
        $sousTerrains = $terrain->terrains()->disponible()->get();
        
        if ($sousTerrains->isEmpty()) {
            // Pas de sous-terrains, vérifier directement les horaires du terrain principal
            $creneaux = $this->getCreneauxDisponibles($terrain, $date, $dureeHeures);
        } else {
            // Agréger les créneaux de tous les sous-terrains
            $creneaux = [];
            foreach ($sousTerrains as $sousTerrain) {
                $creneauxSousTerrain = $sousTerrain->getCreneauxDisponibles($date, $dureeHeures);
                foreach ($creneauxSousTerrain as $creneau) {
                    $creneau['terrain_id'] = $sousTerrain->id;
                    $creneau['terrain_nom'] = $sousTerrain->nom;
                    $creneaux[] = $creneau;
                }
            }
        }

        return response()->json([
            'success' => true,
            'data' => [
                'terrain' => $terrain->makeHidden(['created_at', 'updated_at', 'deleted_at']),
                'date' => $date,
                'creneaux_disponibles' => $creneaux,
                'est_ouvert' => $terrain->isAvailableAt(now()),
                'horaires' => [
                    'ouverture' => $terrain->horaires_ouverture,
                    'fermeture' => $terrain->horaires_fermeture
                ]
            ]
        ]);
    }

    /**
     * Statistiques pour gestionnaire
     */
    public function managerStats(Request $request)
    {
        $user = $request->user();
        
        if (!$user->hasRole('gestionnaire')) {
            return response()->json([
                'success' => false,
                'message' => 'Accès non autorisé'
            ], 403);
        }

        // Récupérer les terrains du gestionnaire
        $terrains = TerrainSynthetiquesDakar::where('gestionnaire', $user->nom_complet)
            ->orWhere('email_contact', $user->email)
            ->with(['terrains', 'reservations'])
            ->get();

        $stats = [
            'total_terrains' => $terrains->count(),
            'reservations_mois' => $terrains->sum(function($terrain) {
                return $terrain->reservations()
                    ->thisMonth()
                    ->whereIn('statut', ['confirmee', 'terminee'])
                    ->count();
            }),
            'revenus_mois' => $terrains->sum(function($terrain) {
                return $terrain->getRevenueTotalMonth();
            }),
            'taux_occupation' => $terrains->avg(function($terrain) {
                return $terrain->getTauxOccupation();
            })
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'terrains' => $terrains,
                'statistiques' => $stats
            ]
        ]);
    }

    /**
     * Méthode privée pour obtenir les créneaux disponibles
     */
    private function getCreneauxDisponibles($terrain, $date, $dureeHeures)
    {
        $creneaux = [];
        
        if (!$terrain->horaires_ouverture || !$terrain->horaires_fermeture) {
            return $creneaux;
        }

        $debut = \Carbon\Carbon::parse($date . ' ' . $terrain->horaires_ouverture);
        $fin = \Carbon\Carbon::parse($date . ' ' . $terrain->horaires_fermeture);
        
        while ($debut->copy()->addHours($dureeHeures)->lte($fin)) {
            $creneauxFin = $debut->copy()->addHours($dureeHeures);
            
            // Vérifier s'il y a des réservations conflictuelles
            $hasConflict = DB::table('reservations')
                ->join('terrains', 'reservations.terrain_id', '=', 'terrains.id')
                ->where('terrains.terrain_synthetique_id', $terrain->id)
                ->whereIn('reservations.statut', ['en_attente', 'confirmee'])
                ->where(function($query) use ($debut, $creneauxFin) {
                    $query->whereBetween('date_debut', [$debut, $creneauxFin])
                          ->orWhereBetween('date_fin', [$debut, $creneauxFin])
                          ->orWhere(function($q) use ($debut, $creneauxFin) {
                              $q->where('date_debut', '<=', $debut)
                                ->where('date_fin', '>=', $creneauxFin);
                          });
                })
                ->exists();
            
            if (!$hasConflict) {
                $creneaux[] = [
                    'debut' => $debut->format('H:i'),
                    'fin' => $creneauxFin->format('H:i'),
                    'prix' => $terrain->prix_heure * $dureeHeures
                ];
            }
            
            $debut->addMinutes(30);
        }
        
        return $creneaux;
    }
} 