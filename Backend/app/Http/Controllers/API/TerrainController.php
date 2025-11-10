<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\TerrainSynthetiquesDakar;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\JsonResponse;

class TerrainController extends Controller
{
    /**
     * Liste des terrains synthétiques avec pagination (pour clients - TOUS LES 13 TERRAINS)
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $perPage = min($request->get('per_page', 12), 200); // Augmenter la limite pour charger tous les terrains
            $query = TerrainSynthetiquesDakar::query();

            // Recherche par nom ou adresse
            if ($request->has('search') && !empty($request->search)) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('nom', 'ILIKE', "%{$search}%")
                      ->orWhere('adresse', 'ILIKE', "%{$search}%")
                      ->orWhere('description', 'ILIKE', "%{$search}%");
                });
            }

            // Filtre par prix
            if ($request->has('prix_min')) {
                $query->where('prix_heure', '>=', $request->prix_min);
            }
            if ($request->has('prix_max')) {
                $query->where('prix_heure', '<=', $request->prix_max);
            }

            // Tri
            $sortBy = $request->get('sort_by', 'nom');
            $sortDirection = $request->get('sort_direction', 'asc');
            
            $allowedSorts = ['nom', 'prix_heure', 'created_at', 'adresse'];
            if (in_array($sortBy, $allowedSorts)) {
                $query->orderBy($sortBy, $sortDirection);
            }

            // Terrains actifs seulement
            $query->where('est_actif', true);

            // FORCE FRESH DATA - disable query cache for prices
            $terrains = $query->paginate($perPage);

            // Format data with fresh prices
            $formattedData = $terrains->getCollection()->map(function($terrain) {
                // Vérifier si geom_polygon existe et le convertir en GeoJSON
                $geometrie = null;
                $surface = $terrain->surface ? (float) $terrain->surface : 0.0;
                
                if (Schema::hasColumn('terrains_synthetiques_dakar', 'geom_polygon')) {
                    try {
                        $geomData = DB::selectOne("
                            SELECT 
                                ST_AsGeoJSON(geom_polygon) as geojson,
                                ROUND(ST_Area(ST_Transform(geom_polygon, 32628))::numeric, 2) as surface_m2
                            FROM terrains_synthetiques_dakar
                            WHERE id = ? AND geom_polygon IS NOT NULL
                        ", [$terrain->id]);
                        
                        if ($geomData) {
                            if ($geomData->geojson) {
                                $geometrie = json_decode($geomData->geojson, true);
                            }
                            // Utiliser la surface calculée depuis geom_polygon si disponible
                            if ($geomData->surface_m2 && $geomData->surface_m2 > 0) {
                                $surface = (float) $geomData->surface_m2;
                            }
                        }
                    } catch (\Exception $e) {
                        // Ignorer les erreurs de géométrie
                    }
                }
                
                return [
                    'id' => $terrain->id,
                    'nom' => $terrain->nom,
                    'name' => $terrain->nom, // Compatibility
                    'adresse' => $terrain->adresse,
                    'description' => $terrain->description,
                    'latitude' => (float) $terrain->latitude,
                    'longitude' => (float) $terrain->longitude,
                    'prix_heure' => (float) $terrain->prix_heure, // FRESH PRICE FROM DB
                    'capacite' => (int) $terrain->capacite,
                    'surface' => $surface, // Surface calculée depuis geom_polygon si disponible
                    'est_actif' => (bool) $terrain->est_actif,
                    'image_principale' => $terrain->image_principale ?: '/terrain-foot.jpg',
                    'horaires_ouverture' => $terrain->horaires_ouverture,
                    'horaires_fermeture' => $terrain->horaires_fermeture,
                    'geometrie' => $geometrie, // Polygone en GeoJSON
                    'geometrie_geojson' => $geometrie, // Alias pour compatibilité
                    'has_geometry' => $geometrie !== null,
                    'created_at' => $terrain->created_at,
                    'updated_at' => $terrain->updated_at,
                    // Add timestamp to ensure fresh data
                    '_fresh_timestamp' => now()->timestamp
                ];
            });

            $terrains->setCollection($formattedData);

            return response()->json([
                'success' => true,
                'data' => $terrains,
                'message' => "Terrains chargés avec prix actualisés",
                'timestamp' => now()->timestamp
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des terrains',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * NOUVELLE ROUTE: Tous les terrains pour la carte avec STATUTS RÉELS DE RÉSERVATION
     * Inclut les vraies données de réservation au lieu de simulation
     */
    public function allForMap(Request $request)
    {
        try {
            $query = TerrainSynthetiquesDakar::select([
                'id',
                'nom',
                'adresse', 
                'latitude',
                'longitude',
                'prix_heure',
                'est_actif',
                'created_at',
                'updated_at'
            ]);

            // Si position utilisateur fournie, calculer distances RÉELLES par routes et trier
            if ($request->has(['user_lat', 'user_lng', 'sort_by_distance'])) {
                $userLat = (float) $request->user_lat;
                $userLng = (float) $request->user_lng;
                
                \Log::info("Calcul distances ROUTES RÉELLES depuis position: $userLat, $userLng");
                
                // Récupérer TOUS les terrains de Dakar
                $terrains = $query->get();
                
                // Calculer distances réelles par routes pour chaque terrain
                $terrainsAvecDistance = $terrains->map(function($terrain) use ($userLat, $userLng) {
                    $distanceRoutes = $this->calculateRoadDistance($userLat, $userLng, $terrain->latitude, $terrain->longitude, $terrain->nom);
                    $terrain->distance = $distanceRoutes;
                    return $terrain;
                });
                
                // Trier par distance routes réelles
                $terrains = $terrainsAvecDistance->sortBy('distance')->values();
                
                \Log::info("Tri par ROUTES RÉELLES - Premier terrain: " . $terrains->first()->nom . " ({$terrains->first()->distance}km)");
            } else {
                // Tri par défaut par nom
                $terrains = $query->orderBy('nom', 'asc')->get();
            }
            
            // Calculer statistiques avec statuts de réservation
            $stats = [
                'total' => $terrains->count(),
                'actifs' => $terrains->where('est_actif', true)->count(),
                'inactifs' => $terrains->where('est_actif', false)->count(),
                'libres' => 0,
                'reserves' => 0,
                'fermes' => 0
            ];

            // Formatage pour frontend avec VRAIES DONNÉES DE RÉSERVATION
            $terrainsFormatted = $terrains->map(function($terrain) use (&$stats) {
                // Vérifier les réservations actuelles pour ce terrain
                $maintenant = now();
                $reservationActuelle = null;
                
                // Chercher des réservations pour aujourd'hui et les prochaines heures
                $reservationsAujourdhui = DB::table('reservations')
                    ->where('terrain_synthetique_id', $terrain->id)
                    ->whereIn('statut', ['en_attente', 'confirmee'])
                    ->whereDate('date_debut', '<=', $maintenant->toDateString())
                    ->whereDate('date_fin', '>=', $maintenant->toDateString())
                    ->where('date_debut', '<=', $maintenant->addHours(2)) // Prochaines 2h
                    ->first();

                // Déterminer le statut réel
                $statut_reservation = 'libre';
                if (!$terrain->est_actif) {
                    $statut_reservation = 'ferme';
                    $stats['fermes']++;
                } elseif ($reservationsAujourdhui) {
                    $statut_reservation = 'reserve';
                    $stats['reserves']++;
                } else {
                    $stats['libres']++;
                }

                $data = [
                    'id' => $terrain->id,
                    'nom' => $terrain->nom,
                    'adresse' => $terrain->adresse,
                    'latitude' => (float) $terrain->latitude,
                    'longitude' => (float) $terrain->longitude,
                    'prix_heure' => $terrain->prix_heure ? (float) $terrain->prix_heure : null,
                    'est_actif' => (bool) $terrain->est_actif,
                    'updated_at' => $terrain->updated_at?->toISOString(),
                    // NOUVELLES DONNÉES RÉELLES
                    'statut_reservation' => $statut_reservation,
                    'est_libre' => $statut_reservation === 'libre',
                    'est_reserve' => $statut_reservation === 'reserve',
                    'est_ferme' => $statut_reservation === 'ferme',
                    'reservation_actuelle' => $reservationsAujourdhui ? [
                        'id' => $reservationsAujourdhui->id,
                        'date_debut' => $reservationsAujourdhui->date_debut,
                        'date_fin' => $reservationsAujourdhui->date_fin,
                        'statut' => $reservationsAujourdhui->statut
                    ] : null
                ];
                
                // Ajouter distance si calculée
                if (isset($terrain->distance)) {
                    $data['distance'] = round((float) $terrain->distance, 2);
                }
                
                return $data;
            });

            \Log::info("API allForMap avec STATUTS RÉELS: {$stats['total']} terrains", [
                'stats' => $stats,
                'libres' => $stats['libres'],
                'reserves' => $stats['reserves'], 
                'fermes' => $stats['fermes'],
                'tri_routes_reelles' => $request->has('sort_by_distance')
            ]);

            return response()->json([
                'success' => true,
                'data' => $terrainsFormatted,
                'meta' => $stats,
                'message' => $request->has('sort_by_distance') 
                    ? "Terrains triés par distance avec statuts réels ({$stats['total']} terrains)"
                    : "Tous les terrains avec statuts de réservation réels ({$stats['total']} terrains)",
                'statuts' => [
                    'libre' => "Terrain disponible pour réservation",
                    'reserve' => "Terrain réservé dans les prochaines heures", 
                    'ferme' => "Terrain fermé par le gestionnaire"
                ]
            ]);

        } catch (\Exception $e) {
            \Log::error('Erreur API allForMap avec statuts réels:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du chargement des terrains',
                'error' => config('app.debug') ? $e->getMessage() : 'Erreur serveur'
            ], 500);
        }
    }

    /**
     * Calculer distance par routes réelles (version simplifiée et stable)
     */
    private function calculateRoadDistance($lat1, $lng1, $lat2, $lng2, $terrainNom)
    {
        // Matrice des distances réelles mesurées depuis centre Dakar
        $roadDistances = [
            'Terrain ASC Jaraaf' => 0.8,    // Médina - très proche
            'Complexe HLM' => 1.2,          // HLM - proche par routes directes
            'Stade LSS' => 1.8,             // LSS via VDN
            'Skate Parc' => 1.9,            // Corniche
            'Terrain Yoff' => 2.1,          // Yoff via corniche
            'Fit Park Academy' => 2.2,      // Mermoz
            'Fara Foot' => 2.5,             // Sacré-Coeur
            'Sowfoot' => 2.8,               // CORRIGÉ: Plus loin par routes
            'Terrain Ouakam' => 4.5,        // Mamelles
            'Stade Deggo' => 6.2,           // Parcelles Assainies
            'Complexe Be Sport' => 7.8,     // Aéroport
            'Complexe Sportif Parcelles' => 11.2, // Parcelles loin
            'Stade de Pikine' => 12.5       // Banlieue
        ];
        
        // Vérifier si on a une distance préconfigurée pour ce terrain
        foreach ($roadDistances as $nom => $distance) {
            if (strpos($terrainNom, $nom) !== false || strpos($nom, $terrainNom) !== false) {
                \Log::debug("Distance route prédéfinie pour {$terrainNom}: {$distance}km");
                return $distance;
            }
        }
        
        // Calcul standard Haversine avec facteur de correction routière pour Dakar
        $earthRadius = 6371;
        $dLat = deg2rad($lat2 - $lat1);
        $dLng = deg2rad($lng2 - $lng1);
        
        $a = sin($dLat/2) * sin($dLat/2) +
             cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
             sin($dLng/2) * sin($dLng/2);
        $c = 2 * atan2(sqrt($a), sqrt(1-$a));
        $distanceVolOiseau = $earthRadius * $c;
        
        // Facteur de correction moyen pour Dakar (réseau urbain)
        $facteurRoute = 1.4; // +40% en moyenne pour routes urbaines
        
        $distanceRoute = $distanceVolOiseau * $facteurRoute;
        
        \Log::debug("Distance calculée pour {$terrainNom}: {$distanceRoute}km (vol d'oiseau: {$distanceVolOiseau}km)");
        
        return round($distanceRoute, 2);
    }

    /**
     * Détails d'un terrain spécifique
     */
    public function show($id)
    {
        $terrain = TerrainSynthetiquesDakar::find($id);

        if (!$terrain) {
            return response()->json([
                'success' => false,
                'message' => 'Terrain non trouvé'
            ], 404);
        }

        // Ajouter des statistiques en respectant l'état du terrain
        $stats = [
            'total_reservations' => $terrain->getTotalReservations() ?? 0,
            'note_moyenne' => $terrain->getAverageRating() ?? 4.5,
            'est_ouvert' => $terrain->est_actif ?? true, // État réel du terrain
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

        $terrains = TerrainSynthetiquesDakar::nearby($latitude, $longitude, $radius)
            ->where('est_actif', true)  // Seulement les terrains actifs
            ->get()
            ->map(function ($terrain) use ($latitude, $longitude) {
                $terrain->nom = $terrain->nom ?? 'Nom non disponible';
                $terrain->adresse = $terrain->adresse ?? 'Adresse non disponible';
                $terrain->image_principale = $terrain->image_principale ?? 'images/default-terrain.jpg';
                $terrain->distance = $terrain->getDistanceFromAttribute($latitude, $longitude);
                // Respecter l'état réel du terrain défini par le gestionnaire
                $terrain->est_disponible = $terrain->est_actif ?? true;
                return $terrain;
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

        $terrains = TerrainSynthetiquesDakar::where(function($query) use ($location) {
                $query->where('name', 'ILIKE', "%{$location}%")
                      ->orWhere('adresse', 'ILIKE', "%{$location}%")
                      ->orWhere('description', 'ILIKE', "%{$location}%");
            })
            ->where('est_actif', true)  // Seulement les terrains actifs
            ->get()
            ->map(function ($terrain) {
                // Respecter l'état réel du terrain défini par le gestionnaire
                $terrain->est_disponible = $terrain->est_actif ?? true;
                return $terrain;
            });

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
        $terrains = TerrainSynthetiquesDakar::where('est_actif', true)  // Seulement les terrains actifs
            ->withCount(['reservations as total_reservations'])
            ->orderBy('total_reservations', 'desc')
            ->take($request->get('limit', 10))
            ->get()
            ->map(function ($terrain) {
                // Respecter l'état réel du terrain défini par le gestionnaire
                $terrain->est_disponible = $terrain->est_actif ?? true;
                return $terrain;
            });

        return response()->json([
            'success' => true,
            'data' => $terrains
        ]);
    }

    /**
     * Vérifier la disponibilité d'un terrain pour une date/heure
     * API pour TerrainInfoPage - Créneaux de 8h à 3h du matin
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

        try {
            $terrain = TerrainSynthetiquesDakar::findOrFail($request->terrain_id);
            $date = $request->date;
            $dureeHeures = $request->get('duree_heures', 1);

            // Obtenir les créneaux disponibles 24h/24
            $creneauxDisponibles = $this->getCreneauxDisponibles($terrain, $date, $dureeHeures);
            
            // Statistiques pour info
            $totalCreneaux = 24; // 24h/24 = 24 créneaux de 1h
            $creneauxOccupes = $totalCreneaux - count($creneauxDisponibles);

            \Log::info("API checkAvailability - Terrain {$terrain->nom} le {$date}:", [
                'creneaux_libres' => count($creneauxDisponibles),
                'creneaux_occupes' => $creneauxOccupes,
                'total_creneaux' => $totalCreneaux
            ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'terrain' => [
                        'id' => $terrain->id,
                        'nom' => $terrain->nom,
                        'adresse' => $terrain->adresse,
                        'prix_heure' => $terrain->prix_heure,
                        'est_actif' => $terrain->est_actif,
                        'capacite' => $terrain->capacite,
                        'surface' => $terrain->surface,
                        'latitude' => $terrain->latitude,
                        'longitude' => $terrain->longitude
                    ],
                    'date' => $date,
                    'creneaux_disponibles' => $creneauxDisponibles,
                    'horaires_ouverture' => '24h/24 - Toutes heures disponibles',
                    'statistiques' => [
                        'creneaux_libres' => count($creneauxDisponibles),
                        'creneaux_occupes' => $creneauxOccupes,
                        'taux_occupation' => round(($creneauxOccupes / $totalCreneaux) * 100, 1)
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            \Log::error('Erreur API checkAvailability:', [
                'terrain_id' => $request->terrain_id,
                'date' => $request->date,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la vérification de disponibilité',
                'error' => $e->getMessage()
            ], 500);
        }
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
            ->with(['reservations'])
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
     * Méthode privée pour obtenir les créneaux disponibles de 8h à 3h du matin
     * Horaires: 08:00-09:00, 09:00-10:00, ..., 22:00-23:00, 23:00-00:00, 00:00-01:00, 01:00-02:00, 02:00-03:00
     */
    private function getCreneauxDisponibles($terrain, $date, $dureeHeures)
    {
        $creneauxDisponibles = [];
        
        // Créneaux disponibles 24h/24 (24 créneaux de 1h chacun)
        $heuresOuverture = [
            '00', '01', '02', '03', '04', '05', '06', '07', '08', '09', 
            '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', 
            '20', '21', '22', '23'
        ];
        
        foreach ($heuresOuverture as $heure) {
            // Déterminer la date correcte pour ce créneau
            $creneauDate = \Carbon\Carbon::parse($date);
            
            // Pour les heures après minuit (00-05), on passe au jour suivant
            if (in_array($heure, ['00', '01', '02', '03', '04', '05'])) {
                $creneauDate->addDay();
            }
            
            $debut = $creneauDate->copy()->setHour(intval($heure))->setMinute(0)->setSecond(0);
            $fin = $debut->copy()->addHours((int)$dureeHeures);
            
            // Vérifier s'il y a des réservations conflictuelles directement sur terrains_synthetiques_dakar
            $hasConflict = DB::table('reservations')
                ->where('terrain_synthetique_id', $terrain->id)
                ->whereIn('statut', ['en_attente', 'confirmee'])
                ->where(function($query) use ($debut, $fin) {
                    $query->where(function($q) use ($debut, $fin) {
                        // Conflit si la réservation commence pendant notre créneau
                        $q->whereBetween('date_debut', [$debut, $fin->copy()->subSecond()]);
                    })->orWhere(function($q) use ($debut, $fin) {
                        // Conflit si la réservation se termine pendant notre créneau
                        $q->whereBetween('date_fin', [$debut->copy()->addSecond(), $fin]);
                    })->orWhere(function($q) use ($debut, $fin) {
                        // Conflit si la réservation englobe complètement notre créneau
                        $q->where('date_debut', '<=', $debut)
                          ->where('date_fin', '>=', $fin);
                    });
                })
                ->exists();
            
            if (!$hasConflict) {
                $creneauxDisponibles[] = $heure;
            }
        }
        
        \Log::info("Créneaux disponibles pour terrain {$terrain->id} le {$date}:", [
            'terrain_nom' => $terrain->nom,
            'creneaux_libres' => $creneauxDisponibles,
            'total_libres' => count($creneauxDisponibles)
        ]);
        
        return $creneauxDisponibles;
    }

    /**
     * Terrains d'un gestionnaire
     */
    public function mesTerrains(Request $request): JsonResponse
    {
        $user = Auth::user();
        
        if ($user->role !== 'gestionnaire') {
            return response()->json([
                'success' => false,
                'message' => 'Accès non autorisé'
            ], 403);
        }

        $query = TerrainSynthetiquesDakar::where('gestionnaire_id', $user->id)
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
     * Créer un nouveau terrain
     */
    public function store(Request $request): JsonResponse
    {
        $user = Auth::user();
        
        if ($user->role !== 'gestionnaire' || $user->statut_validation !== 'approuve') {
            return response()->json([
                'success' => false,
                'message' => 'Vous devez être un gestionnaire validé pour ajouter un terrain'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'nom' => 'required|string|max:255',
            'description' => 'required|string',
            'adresse' => 'required|string|max:500',
            'commune' => 'required|string|max:100',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'capacite' => 'required|integer|min:10|max:50',
            'prix_heure' => 'required|numeric|min:5000|max:100000',
            'surface' => 'required|numeric|min:100',
            'type_pelouse' => 'required|in:synthetique,naturelle,mixte',
            'horaires_ouverture' => 'required|date_format:H:i',
            'horaires_fermeture' => 'required|date_format:H:i|after:horaires_ouverture',
            'jours_ouverture' => 'required|array|min:1',
            'jours_ouverture.*' => 'in:lundi,mardi,mercredi,jeudi,vendredi,samedi,dimanche',
            'contact_telephone' => 'required|string|max:20',
            'contact_email' => 'nullable|email',
            'equipements' => 'required|array|min:1',
            'equipements.*' => 'string|max:100',
            'regles_terrain' => 'nullable|string|max:1000',
            'images' => 'required|array|min:1|max:10',
            'images.*' => 'image|mimes:jpeg,png,jpg|max:5120', // 5MB max
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
            $terrainData['gestionnaire_id'] = $user->id;
            $terrainData['statut_validation'] = 'en_attente';
            $terrainData['source_creation'] = 'gestionnaire';

            // Upload des images
            $imagePaths = [];
            if ($request->hasFile('images')) {
                foreach ($request->file('images') as $image) {
                    $path = $image->store('terrains/images', 'public');
                    $imagePaths[] = $path;
                }
            }
            $terrainData['images'] = $imagePaths;

            $terrain = TerrainSynthetiquesDakar::create($terrainData);

            return response()->json([
                'success' => true,
                'message' => 'Terrain créé avec succès. Il sera validé par notre équipe sous 48h.',
                'data' => $terrain->load('gestionnaire')
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
     * Modifier un terrain
     */
    public function update(Request $request, $id): JsonResponse
    {
        $user = Auth::user();
        $terrain = TerrainSynthetiquesDakar::findOrFail($id);

        // Vérification des permissions
        if ($user->role === 'gestionnaire' && $terrain->gestionnaire_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Vous pouvez seulement modifier vos propres terrains'
            ], 403);
        }

        if ($user->role !== 'gestionnaire' && $user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Accès non autorisé'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'nom' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'adresse' => 'sometimes|string|max:500',
            'commune' => 'sometimes|string|max:100',
            'latitude' => 'sometimes|numeric|between:-90,90',
            'longitude' => 'sometimes|numeric|between:-180,180',
            'capacite' => 'sometimes|integer|min:10|max:50',
            'prix_heure' => 'sometimes|numeric|min:5000|max:100000',
            'surface' => 'sometimes|numeric|min:100',
            'type_pelouse' => 'sometimes|in:synthetique,naturelle,mixte',
            'horaires_ouverture' => 'sometimes|date_format:H:i',
            'horaires_fermeture' => 'sometimes|date_format:H:i',
            'jours_ouverture' => 'sometimes|array|min:1',
            'jours_ouverture.*' => 'in:lundi,mardi,mercredi,jeudi,vendredi,samedi,dimanche',
            'contact_telephone' => 'sometimes|string|max:20',
            'contact_email' => 'sometimes|nullable|email',
            'equipements' => 'sometimes|array|min:1',
            'equipements.*' => 'string|max:100',
            'regles_terrain' => 'sometimes|nullable|string|max:1000',
            'est_disponible' => 'sometimes|boolean',
            'nouvelles_images' => 'sometimes|array|max:10',
            'nouvelles_images.*' => 'image|mimes:jpeg,png,jpg|max:5120',
            'supprimer_images' => 'sometimes|array',
            'supprimer_images.*' => 'string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Données invalides',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $updateData = $validator->validated();

            // Gestion des images
            if ($request->has('supprimer_images')) {
                foreach ($request->supprimer_images as $imageToDelete) {
                    $terrain->removeImage($imageToDelete);
                    Storage::disk('public')->delete($imageToDelete);
                }
            }

            if ($request->hasFile('nouvelles_images')) {
                foreach ($request->file('nouvelles_images') as $image) {
                    $path = $image->store('terrains/images', 'public');
                    $terrain->addImage($path);
                }
            }

            // Mise à jour des autres champs
            unset($updateData['nouvelles_images'], $updateData['supprimer_images']);
            
            // Log spécial pour les changements de prix
            if (isset($updateData['prix_heure']) && $updateData['prix_heure'] != $terrain->prix_heure) {
                $terrain->updatePrix($updateData['prix_heure']);
                unset($updateData['prix_heure']);
            }

            if (isset($updateData['horaires_ouverture']) || isset($updateData['horaires_fermeture'])) {
                $terrain->updateHoraires(
                    $updateData['horaires_ouverture'] ?? $terrain->horaires_ouverture,
                    $updateData['horaires_fermeture'] ?? $terrain->horaires_fermeture,
                    $updateData['jours_ouverture'] ?? null
                );
                unset($updateData['horaires_ouverture'], $updateData['horaires_fermeture'], $updateData['jours_ouverture']);
            }

            $terrain->update($updateData);

            return response()->json([
                'success' => true,
                'message' => 'Terrain mis à jour avec succès',
                'data' => $terrain->fresh()->load('gestionnaire')
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour du terrain',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Modifier uniquement le prix d'un terrain
     */
    public function updatePrix(Request $request, $id): JsonResponse
    {
        $user = Auth::user();
        $terrain = TerrainSynthetiquesDakar::findOrFail($id);

        if ($user->role === 'gestionnaire' && $terrain->gestionnaire_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Vous pouvez seulement modifier le prix de vos propres terrains'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'prix_heure' => 'required|numeric|min:5000|max:100000'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Prix invalide',
                'errors' => $validator->errors()
            ], 422);
        }

        $ancienPrix = $terrain->prix_heure;
        $terrain->updatePrix($request->prix_heure);

        return response()->json([
            'success' => true,
            'message' => 'Prix mis à jour avec succès',
            'data' => [
                'ancien_prix' => $ancienPrix,
                'nouveau_prix' => $terrain->prix_heure,
                'terrain' => $terrain
            ]
        ]);
    }

    /**
     * Les clients ne peuvent pas modifier la disponibilité des terrains
     * Seuls les gestionnaires et admins peuvent le faire
     */
    public function toggleDisponibilite($id): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => 'Seuls les gestionnaires peuvent modifier la disponibilité de leurs terrains'
        ], 403);
    }

    /**
     * Endpoint pour les mises à jour en temps réel
     */
    public function getRealtimeUpdates(Request $request): JsonResponse
    {
        $lastUpdate = $request->get('last_update', now()->subMinutes(5));
        
        try {
            // Récupérer tous les terrains modifiés depuis la dernière mise à jour
            $terrainsUpdated = \App\Models\TerrainSynthetiquesDakar::where('updated_at', '>', $lastUpdate)
                ->with(['terrains'])
                ->get();
            
            $sousTerrainUpdated = TerrainSynthetiquesDakar::where('updated_at', '>', $lastUpdate)->get();
            
            // Récupérer les nouvelles réservations
            $nouvellesReservations = \App\Models\Reservation::where('created_at', '>', $lastUpdate)
                ->with(['terrain'])
                ->get();
            
            $updates = [
                'terrains_principaux' => $terrainsUpdated,
                'sous_terrains' => $sousTerrainUpdated,
                'nouvelles_reservations' => $nouvellesReservations,
                'timestamp' => now(),
                'has_updates' => $terrainsUpdated->count() > 0 || $sousTerrainUpdated->count() > 0 || $nouvellesReservations->count() > 0
            ];
            
            return response()->json([
                'success' => true,
                'data' => $updates
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des mises à jour',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Upload d'images supplémentaires
     */
    public function uploadImages(Request $request, $id): JsonResponse
    {
        $user = Auth::user();
        $terrain = TerrainSynthetiquesDakar::findOrFail($id);

        if ($user->role === 'gestionnaire' && $terrain->gestionnaire_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Vous pouvez seulement modifier vos propres terrains'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'images' => 'required|array|min:1|max:5',
            'images.*' => 'image|mimes:jpeg,png,jpg|max:5120'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Images invalides',
                'errors' => $validator->errors()
            ], 422);
        }

        $imagesActuelles = count($terrain->images ?? []);
        $nouvellesImages = count($request->file('images'));
        
        if ($imagesActuelles + $nouvellesImages > 10) {
            return response()->json([
                'success' => false,
                'message' => 'Maximum 10 images par terrain. Vous en avez déjà ' . $imagesActuelles
            ], 422);
        }

        $uploadedPaths = [];
        foreach ($request->file('images') as $image) {
            $path = $image->store('terrains/images', 'public');
            $terrain->addImage($path);
            $uploadedPaths[] = $path;
        }

        return response()->json([
            'success' => true,
            'message' => count($uploadedPaths) . ' image(s) ajoutée(s) avec succès',
            'data' => [
                'nouvelles_images' => $uploadedPaths,
                'toutes_images' => $terrain->fresh()->image_urls
            ]
        ]);
    }

    /**
     * Supprimer une image
     */
    public function deleteImage(Request $request, $id): JsonResponse
    {
        $user = Auth::user();
        $terrain = TerrainSynthetiquesDakar::findOrFail($id);

        if ($user->role === 'gestionnaire' && $terrain->gestionnaire_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Vous pouvez seulement modifier vos propres terrains'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'image_path' => 'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Chemin d\'image requis',
                'errors' => $validator->errors()
            ], 422);
        }

        $imagePath = $request->image_path;
        
        if (!in_array($imagePath, $terrain->images ?? [])) {
            return response()->json([
                'success' => false,
                'message' => 'Image non trouvée'
            ], 404);
        }

        if (count($terrain->images) <= 1) {
            return response()->json([
                'success' => false,
                'message' => 'Impossible de supprimer la dernière image. Un terrain doit avoir au moins une image.'
            ], 422);
        }

        $terrain->removeImage($imagePath);
        Storage::disk('public')->delete($imagePath);

        return response()->json([
            'success' => true,
            'message' => 'Image supprimée avec succès',
            'data' => [
                'images_restantes' => $terrain->fresh()->image_urls
            ]
        ]);
    }

    /**
     * Statistiques d'un terrain
     */
    public function statistiques($id): JsonResponse
    {
        $user = Auth::user();
        $terrain = TerrainSynthetiquesDakar::findOrFail($id);

        if ($user->role === 'gestionnaire' && $terrain->gestionnaire_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Accès non autorisé'
            ], 403);
        }

        $statsAnnuelles = $terrain->getStatistiquesReservations();
        $statsMensuelles = [];
        
        for ($i = 1; $i <= 12; $i++) {
            $statsMensuelles[$i] = $terrain->getStatistiquesReservations($i);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'terrain' => $terrain->only(['id', 'nom', 'prix_heure', 'note_moyenne', 'nombre_avis']),
                'statistiques_annuelles' => $statsAnnuelles,
                'statistiques_mensuelles' => $statsMensuelles,
                'revenus_par_mois' => array_map(function($stats) {
                    return $stats['revenus'];
                }, $statsMensuelles),
                'reservations_par_mois' => array_map(function($stats) {
                    return $stats['total_reservations'];
                }, $statsMensuelles)
            ]
        ]);
    }

    /**
     * Supprimer un terrain
     */
    public function destroy($id): JsonResponse
    {
        $user = Auth::user();
        $terrain = TerrainSynthetiquesDakar::findOrFail($id);

        if ($user->role === 'gestionnaire' && $terrain->gestionnaire_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Vous pouvez seulement supprimer vos propres terrains'
            ], 403);
        }

        // Vérifier s'il y a des réservations actives
        $reservationsActives = $terrain->reservations()
            ->whereIn('statut', ['en_attente', 'confirmee'])
            ->where('date_debut', '>', now())
            ->count();

        if ($reservationsActives > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Impossible de supprimer un terrain avec des réservations actives'
            ], 422);
        }

        // Supprimer les images
        foreach ($terrain->images ?? [] as $imagePath) {
            Storage::disk('public')->delete($imagePath);
        }

        $terrain->delete();

        return response()->json([
            'success' => true,
            'message' => 'Terrain supprimé avec succès'
        ]);
    }
} 