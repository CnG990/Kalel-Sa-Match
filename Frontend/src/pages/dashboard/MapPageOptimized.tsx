import React, { useRef, useEffect, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { AlertTriangle, MapPin, ChevronsDown, Eye, } from 'lucide-react';
import apiService, { type TerrainDTO } from '../../services/api';

import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { calculateDistance } from '../../utils/distance';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
interface CachedData {
  terrainsData: Terrain[];
  reservationsData: ReservationDTO[];
}

// Cache pour éviter les rechargements inutiles
const mapCache: {
  terrains: CachedData | null;
  lastFetch: number;
  cacheTime: number;
} = {
  terrains: null,
  lastFetch: 0,
  cacheTime: 5 * 60 * 1000, // 5 minutes
};

interface Terrain {

  id: number;
  nom: string;
  adresse: string;
  latitude: number;
  longitude: number;
  prix_heure: number;
  type_surface: string;
  description?: string;
  images?: string[];
  gestionnaire?: {
    id: number;
    nom: string;
    email: string;
  };
  disponibilite?: boolean;
  surface?: number;
  created_at?: string;
  updated_at?: string;
  gestionnaire_id?: number;
  contact_telephone?: string;
  contact_email?: string;
  horaires_ouverture?: string;
  horaires_fermeture?: string;
  jours_ouverture?: string[];
  etat?: string;
  image_principale?: string;
  images_supplementaires?: string[];
  est_actif?: boolean;
  est_disponible?: boolean;
  // Compatibilité
  name?: string;
  terrain_synthetique?: {
    id: number;
    nom: string;
    adresse: string;
    image_principale?: string;
  };
  capacite_spectateurs?: number;
}

interface TerrainWithDistance extends Terrain {
  distance: number;
}

interface ReservationDTO {
  id: number;
  terrain_id: number;
  [key: string]: unknown;
}

const mapTerrainDtoToTerrain = (dto: TerrainDTO): Terrain => ({
  id: dto.id,
  nom: dto.nom ?? (dto as any).name ?? `Terrain ${dto.id}`,
  adresse: dto.adresse ?? 'Adresse non disponible',
  latitude: dto.latitude ? Number(dto.latitude) : 0,
  longitude: dto.longitude ? Number(dto.longitude) : 0,
  prix_heure: Number(dto.prix_heure ?? 0),
  type_surface: (dto as any).type_surface ?? 'Inconnue',
  description: dto.description,
  images: Array.isArray(dto.images) ? dto.images : undefined,
  est_actif: dto.est_actif ?? true,
  est_disponible: dto.est_disponible ?? true,
  image_principale: dto.image_principale,
  surface: (dto as any).surface,
  terrain_synthetique: (dto as any).terrain_synthetique,
  capacite_spectateurs: (dto as any).capacite_spectateurs,
});

const normalizeReservations = (raw: unknown): ReservationDTO[] => {
  if (!raw) return [];
  const data = (raw as any).data ?? raw;
  if (Array.isArray(data)) return data as ReservationDTO[];
  if (data && Array.isArray((data as any).data)) return (data as any).data as ReservationDTO[];
  return [];
};

const MapPageOptimized: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const mounted = useRef(false);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const geolocateControl = useRef<mapboxgl.GeolocateControl | null>(null);

  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ latitude: number, longitude: number } | null>(null);
  const [selectedTerrain, setSelectedTerrain] = useState<Terrain | null>(null);
  const [routeInfo, setRouteInfo] = useState<any>(null);
  const [terrains, setTerrains] = useState<Terrain[]>([]);
  const [sortedTerrains, setSortedTerrains] = useState<TerrainWithDistance[]>([]);
  const [reservedTerrainIds, setReservedTerrainIds] = useState<Set<number>>(new Set());
  const [showTerrainDetails, setShowTerrainDetails] = useState(false);

  const { } = useAuth();

  // Optimisation des images avec fallback
  const getOptimizedImageUrl = (type: 'terrain' | 'profile' = 'terrain') => {
    return type === 'terrain' ? '/terrain-foot.jpg' : `https://ui-avatars.com/api/?name=User&background=random&size=80`;
  };

  // Fonction optimisée pour créer les marqueurs
  const createOptimizedTerrainMarkers = useCallback((mapInstance: mapboxgl.Map, terrainsData: Terrain[], reservationsData: ReservationDTO[]) => {
    // Nettoyer les anciens marqueurs
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    terrainsData.forEach((terrain: Terrain) => {
      if (!terrain.latitude || !terrain.longitude) return;

      const isReserved = reservationsData.some((r: ReservationDTO) => r.terrain_id === terrain.id);

      const terrainData = terrain.terrain_synthetique || terrain;
      const nom = terrainData.nom || terrain.name || 'Terrain sans nom';
      const adresse = terrainData.adresse || terrain.adresse || 'Adresse non disponible';
      const prix = terrain.prix_heure || 0;
      // Optimisation des images
      const mainImage = getOptimizedImageUrl();

      // Popup optimisée avec informations complètes
      const popupNode = document.createElement('div');
      popupNode.innerHTML = `
        <div class="terrain-popup" style="font-family: sans-serif; max-width: 320px;">
          <div style="position: relative; margin-bottom: 8px;">
            <img 
              src="${mainImage}" 
              alt="${nom}" 
              style="width: 100%; height: 100px; object-fit: cover; border-radius: 8px;" 
              onerror="this.src='/terrain-foot.jpg'"
            />
            ${isReserved ? `<div style="position: absolute; top: 4px; right: 4px; background-color: #8b5cf6; color: white; padding: 3px 8px; border-radius: 6px; font-size: 11px; font-weight: bold;">✅ Réservé</div>` : ''}

          </div>
          
          <div style="padding: 0 4px;">
            <h3 style="font-size: 16px; font-weight: bold; margin: 0 0 4px; color: #1f2937;">${nom}</h3>
            <p style="font-size: 12px; margin: 0 0 8px; color: #666; line-height: 1.4;">${adresse}</p>
            
            ${prix > 0 ? `
            <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 8px;">
              <span style="background: linear-gradient(45deg, #16a34a, #22c55e); color: white; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: bold;">
                💰 ${prix.toLocaleString()} FCFA/h
              </span>
              ${terrain.capacite_spectateurs ? `<span style="background: #f3f4f6; color: #374151; padding: 2px 6px; border-radius: 4px; font-size: 10px;">👥 ${terrain.capacite_spectateurs}</span>` : ''}
            </div>` : ''}



            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 8px;">
              ${isReserved ? 
                `<a href="/dashboard/reservations" style="grid-column: span 2; display: block; text-align: center; padding: 8px; background-color: #f59e0b; color: white; border-radius: 6px; text-decoration: none; font-weight: 500; font-size: 12px;">📅 Voir ma réservation</a>` : 
                `<a href="/users/terrain/${terrain.id}" style="display: block; text-align: center; padding: 8px; background: linear-gradient(45deg, #16a34a, #22c55e); color: white; border-radius: 6px; text-decoration: none; font-weight: 500; font-size: 12px;">🏈 Réserver</a>
                 <button onclick="window.showTerrainDetails(${terrain.id})" style="padding: 8px; background: #3b82f6; color: white; border-radius: 6px; border: none; font-weight: 500; font-size: 12px; cursor: pointer;">👁️ Détails</button>`
              }
            </div>
            
            <div style="border-top: 1px solid #e5e7eb; padding-top: 8px;">
              <p style="font-size: 10px; color: #6b7280; margin: 0 0 6px 0; font-weight: 500;">🗺️ Calculer l'itinéraire :</p>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px;">
                <button onclick="window.calculateRouteToTerrain(${terrain.longitude}, ${terrain.latitude}, 'driving')" style="padding: 4px 6px; background-color: #3b82f6; color: white; border-radius: 4px; border: none; font-weight: 500; font-size: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 2px;">🚗 Voiture</button>
                <button onclick="window.calculateRouteToTerrain(${terrain.longitude}, ${terrain.latitude}, 'walking')" style="padding: 4px 6px; background-color: #10b981; color: white; border-radius: 4px; border: none; font-weight: 500; font-size: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 2px;">🚶 Pied</button>
                <button onclick="window.calculateRouteToTerrain(${terrain.longitude}, ${terrain.latitude}, 'cycling')" style="padding: 4px 6px; background-color: #f59e0b; color: white; border-radius: 4px; border: none; font-weight: 500; font-size: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 2px;">🚴 Vélo</button>
                <button onclick="window.calculateRouteToTerrain(${terrain.longitude}, ${terrain.latitude}, 'transit')" style="padding: 4px 6px; background-color: #8b5cf6; color: white; border-radius: 4px; border: none; font-weight: 500; font-size: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 2px;">🚌 Transport</button>
              </div>
            </div>
          </div>
        </div>
      `;

      const popup = new mapboxgl.Popup({ 
        offset: 25,
        closeButton: true,
        closeOnClick: false,
        maxWidth: '320px'
      }).setDOMContent(popupNode);

      // Couleur du marqueur selon le statut
      let markerColor = '#16a34a'; // Vert par défaut (ouvert)
      
      // Vérifier si le terrain est inactif (fermé)
      if (!terrain.est_actif || !terrain.est_disponible) {
        markerColor = '#dc2626'; // Rouge pour terrain fermé/inactif
      } else if (isReserved) {
        markerColor = '#8b5cf6'; // Violet pour réservé
      }

      const marker = new mapboxgl.Marker({ color: markerColor })
        .setLngLat([terrain.longitude, terrain.latitude])
        .setPopup(popup)
        .addTo(mapInstance);

      markersRef.current.push(marker);
    });
  }, []);

  // Chargement optimisé des données avec cache
  const loadTerrainsData = useCallback(async () => {
    const now = Date.now();
    
    // Utiliser le cache si disponible et récent
    if (mapCache.terrains && (now - mapCache.lastFetch) < mapCache.cacheTime) {
      console.log('📦 Utilisation du cache des terrains');
      return mapCache.terrains;
    }

    try {
      console.log('📡 Chargement des terrains depuis l\'API...');
      const [{ data: terrainDtos }, reservationsResponse] = await Promise.all([
        apiService.getTerrains({ per_page: 999 }),
        apiService.getMyReservations().catch(() => ({ data: [] })),
      ]);

      const reservationsData = normalizeReservations(reservationsResponse);
      setReservedTerrainIds(new Set(reservationsData.map((r) => r.terrain_id)));

      if (Array.isArray(terrainDtos)) {
        const mappedTerrains = terrainDtos.map(mapTerrainDtoToTerrain).filter((terrain) => terrain.latitude && terrain.longitude);
        mapCache.terrains = { terrainsData: mappedTerrains, reservationsData };
        mapCache.lastFetch = now;
        console.log(`✅ ${mappedTerrains.length} terrains chargés et mis en cache`);
        return { terrainsData: mappedTerrains, reservationsData };
      }
    } catch (error) {
      console.error('❌ Erreur chargement terrains:', error);
      toast.error("Erreur de chargement des terrains");
    }

    return { terrainsData: [], reservationsData: [] };
  }, []);

  // Calcul optimisé d'itinéraire
  const calculateRoute = useCallback(async (from: [number, number], to: [number, number], mode: string = 'driving') => {
    if (!map.current) return;

    try {
      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/${mode}/${from[0]},${from[1]};${to[0]},${to[1]}?geometries=geojson&access_token=${MAPBOX_TOKEN}`
      );
      const data = await response.json();
      
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        setRouteInfo({
          distance: (route.distance / 1000).toFixed(1),
          duration: Math.round(route.duration / 60),
          mode: mode
        });

        const routeColors = {
          driving: '#3b82f6',
          walking: '#10b981',
          cycling: '#f59e0b',
          transit: '#8b5cf6'
        };

        if (map.current.getSource('route')) {
          (map.current.getSource('route') as mapboxgl.GeoJSONSource).setData({
            type: 'Feature',
            properties: {},
            geometry: route.geometry
          });
        } else {
          map.current.addSource('route', {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: route.geometry
            }
          });

          map.current.addLayer({
            id: 'route',
            type: 'line',
            source: 'route',
            layout: {
              'line-join': 'round',
              'line-cap': 'round'
            },
            paint: {
              'line-color': routeColors[mode as keyof typeof routeColors] || '#3b82f6',
              'line-width': 5,
              'line-opacity': 0.8
            }
          });
        }

        if (map.current.getLayer('route')) {
          map.current.setPaintProperty('route', 'line-color', routeColors[mode as keyof typeof routeColors] || '#3b82f6');
        }

        toast.success(`🗺️ Itinéraire: ${route.distance/1000 < 1 ? Math.round(route.distance) + 'm' : (route.distance/1000).toFixed(1) + 'km'} (${Math.round(route.duration/60)}min)`);
      }
    } catch (error) {
      console.error('Erreur itinéraire:', error);
      toast.error('Impossible de calculer l\'itinéraire');
    }
  }, []);

  // Géolocalisation optimisée
  const getUserLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error('Géolocalisation non supportée');
      return;
    }

    toast.loading('📍 Obtention de votre position...', { duration: 3000 });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setUserLocation({ latitude, longitude });
        
        if (map.current) {
          map.current.flyTo({
            center: [longitude, latitude],
            zoom: 14,
            speed: 1.2
          });
        }
        
        toast.success(`📍 Position obtenue! Précision: ${Math.round(accuracy)}m`);
      },
      (error) => {
        console.error('Erreur géolocalisation:', error);
        
        // Fallback vers Dakar
        setUserLocation({ latitude: 14.71, longitude: -17.46 });
        if (map.current) {
          map.current.flyTo({
            center: [-17.46, 14.71],
            zoom: 11
          });
        }
        toast.success('📍 Position par défaut: Dakar');
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  }, []);

  // Affichage des détails d'un terrain
  const showTerrainDetailsCallback = useCallback((terrainId: number) => {
    const terrain = terrains.find(t => t.id === terrainId);
    if (terrain) {
      setSelectedTerrain(terrain);
      setShowTerrainDetails(true);
    }
  }, [terrains]);

  // Initialisation optimisée de la carte
  useEffect(() => {
    if (mounted.current || !mapContainer.current || !MAPBOX_TOKEN) return;

    mounted.current = true;
    mapboxgl.accessToken = MAPBOX_TOKEN;

    const newMap = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-17.46, 14.71],
      zoom: 11,
      attributionControl: false
    });

    map.current = newMap;

    newMap.on('load', async () => {
      console.log('🗺️ Carte chargée');
      
      // Contrôles
      newMap.addControl(new mapboxgl.NavigationControl(), 'top-right');
      
      geolocateControl.current = new mapboxgl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
        showUserHeading: true,
      });
      newMap.addControl(geolocateControl.current);

      geolocateControl.current.on('geolocate', (e: any) => {
        if (e.coords) {
          setUserLocation({ latitude: e.coords.latitude, longitude: e.coords.longitude });
        }
      });

      // Chargement des données
      setLoading(true);
      const { terrainsData, reservationsData } = await loadTerrainsData();
      
      if (terrainsData.length > 0) {
        setTerrains(terrainsData);
        createOptimizedTerrainMarkers(newMap, terrainsData, reservationsData);
      }
      
      setLoading(false);
      
      // Géolocalisation automatique
      setTimeout(() => geolocateControl.current?.trigger(), 1000);
    });

    return () => {
      mounted.current = false;
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [loadTerrainsData, createOptimizedTerrainMarkers]);

  // Tri des terrains par distance
  useEffect(() => {
    if (userLocation && terrains.length > 0) {
      const terrainsWithDistance = terrains.map(terrain => ({
        ...terrain,
        distance: calculateDistance([userLocation.longitude, userLocation.latitude], [terrain.longitude, terrain.latitude])
      }));
      
      terrainsWithDistance.sort((a, b) => a.distance - b.distance);
      setSortedTerrains(terrainsWithDistance as TerrainWithDistance[]);
    }
  }, [userLocation, terrains]);

  // Exposition des fonctions globales
  useEffect(() => {
    (window as any).calculateRouteToTerrain = (lng: number, lat: number, mode: string = 'driving') => {
      if (userLocation) {
        calculateRoute([userLocation.longitude, userLocation.latitude], [lng, lat], mode);
      } else {
        toast.error('Activez d\'abord votre géolocalisation');
      }
    };

    (window as any).showTerrainDetails = showTerrainDetailsCallback;

    return () => {
      delete (window as any).calculateRouteToTerrain;
      delete (window as any).showTerrainDetails;
    };
  }, [userLocation, calculateRoute, showTerrainDetailsCallback]);

  if (!MAPBOX_TOKEN) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-6 rounded-lg">
        <div className="flex">
          <AlertTriangle className="h-6 w-6 text-red-500" />
          <div className="ml-4">
            <h3 className="text-lg font-bold text-red-800">Configuration Mapbox requise</h3>
            <p className="text-sm text-red-700 mt-2">
              Créez un fichier <code>.env</code> avec: <code>VITE_MAPBOX_TOKEN=pk.YOUR_TOKEN</code>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-gray-800 mb-2">🗺️ Carte des terrains</h1>
        <p className="text-lg text-gray-600">
          Explorez les terrains, trouvez votre position et réservez votre prochain match.
        </p>
      </div>
      
      {/* Panneau de contrôle optimisé */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="flex flex-wrap gap-4 items-center">
          <button
            onClick={getUserLocation}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <MapPin className="w-4 h-4" />
            📍 Ma position
          </button>
          
          {userLocation && (
            <div className="text-sm text-gray-600 bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
              📍 Position: {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
            </div>
          )}
          
          {routeInfo && (
            <div className="text-sm text-gray-600 bg-green-50 px-3 py-2 rounded-lg border border-green-200 flex items-center gap-2">
              <span className="text-lg">
                {routeInfo.mode === 'driving' && '🚗'}
                {routeInfo.mode === 'walking' && '🚶'}
                {routeInfo.mode === 'cycling' && '🚴'}
                {routeInfo.mode === 'transit' && '🚌'}
              </span>
              <span className="font-medium">
                {routeInfo.distance}km • {routeInfo.duration}min
              </span>
            </div>
          )}
        </div>
      </div>
      
      {/* Carte optimisée */}
      <div className="relative h-[70vh] w-full rounded-xl shadow-lg overflow-hidden border border-gray-200">
        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Chargement de la carte et des terrains...</p>
            </div>
          </div>
        )}
        <div ref={mapContainer} className="h-full w-full" />
      </div>

      {/* Liste des terrains optimisée */}
      <div>
        <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
          <ChevronsDown className="w-8 h-8 text-orange-500" />
          Terrains à proximité
          {sortedTerrains.length > 0 && (
            <span className="text-lg font-normal text-gray-500">({sortedTerrains.length})</span>
          )}
        </h2>
        
        {sortedTerrains.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedTerrains.slice(0, 12).map((terrain: TerrainWithDistance) => {
              const isReserved = reservedTerrainIds.has(terrain.id);
              const mainImage = getOptimizedImageUrl();
              const prix = terrain.prix_heure || 0;
              
              return (
                <div key={terrain.id} className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:-translate-y-2 transition-all duration-300 border border-gray-100 hover:shadow-xl">
                  <div className="relative">
                    <img 
                      src={mainImage} 
                      alt={terrain.nom || terrain.terrain_synthetique?.nom || 'Terrain'} 
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/terrain-foot.jpg';
                      }}
                    />
                    <div className="absolute top-3 left-3">
                      <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-bold">
                        📍 {terrain.distance.toFixed(1)} km
                      </span>
                    </div>
                    {isReserved && (
                      <div className="absolute top-3 right-3">
                        <span className="bg-purple-600 text-white px-2 py-1 rounded-full text-xs font-bold">
                          ✅ Réservé
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">
                      {terrain.nom || terrain.terrain_synthetique?.nom || 'Terrain sans nom'}
                    </h3>
                    
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      📍 {terrain.adresse || terrain.terrain_synthetique?.adresse || 'Adresse non disponible'}
                    </p>
                    
                    {prix > 0 && (
                      <div className="mb-3">
                        <span className="bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                          💰 {prix.toLocaleString()} FCFA/h
                        </span>
                      </div>
                    )}
                    

                    
                    <div className="flex gap-2">
                      {isReserved ? (
                        <Link
                          to="/dashboard/reservations"
                          className="flex-1 text-center px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-sm font-medium rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all duration-200"
                        >
                          📅 Ma réservation
                        </Link>
                      ) : (
                        <>
                          <Link
                            to={`/users/terrain/${terrain.id}`}
                            className="flex-1 text-center px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white text-sm font-medium rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200"
                          >
                            🏈 Réserver
                          </Link>
                          <button
                            onClick={() => showTerrainDetailsCallback(terrain.id)}
                            className="px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white p-8 rounded-xl shadow-lg text-center border border-gray-200">
            <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">
              Activez votre géolocalisation pour voir les terrains les plus proches.
            </p>
            <button
              onClick={getUserLocation}
              className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              📍 Activer la géolocalisation
            </button>
          </div>
        )}
      </div>

      {/* Modal détails terrain */}
      {showTerrainDetails && selectedTerrain && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedTerrain.nom || selectedTerrain.terrain_synthetique?.nom}
                </h2>
                <button
                  onClick={() => setShowTerrainDetails(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <img 
                src={getOptimizedImageUrl()} 
                alt={selectedTerrain.nom || 'Terrain'}
                className="w-full h-64 object-cover rounded-lg mb-4"
                onError={(e) => {
                  e.currentTarget.src = '/terrain-foot.jpg';
                }}
              />
              
              <div className="space-y-4">
                <p className="text-gray-600">
                  📍 {selectedTerrain.adresse || selectedTerrain.terrain_synthetique?.adresse}
                </p>
                
                {selectedTerrain.description && (
                  <p className="text-gray-700">{selectedTerrain.description}</p>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  {(selectedTerrain.prix_heure) && (
                    <div>
                      <span className="font-medium">💰 Prix:</span> {(selectedTerrain.prix_heure)?.toLocaleString()} FCFA/h
                    </div>
                  )}
                  
                  {selectedTerrain.capacite_spectateurs && (
                    <div>
                      <span className="font-medium">👥 Capacité:</span> {selectedTerrain.capacite_spectateurs} personnes
                    </div>
                  )}
                  
                  {selectedTerrain.surface && (
                    <div>
                      <span className="font-medium">📐 Surface:</span> {selectedTerrain.surface}m²
                    </div>
                  )}
                </div>
                
                <div className="flex gap-3 pt-4">
                  <Link
                    to={`/users/terrain/${selectedTerrain.id}`}
                    className="flex-1 text-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    🏈 Réserver maintenant
                  </Link>
                  <button
                    onClick={() => setShowTerrainDetails(false)}
                    className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapPageOptimized; 