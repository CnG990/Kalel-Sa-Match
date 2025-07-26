import React, { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Configuration Mapbox avec fallback
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || 'pk.eyJ1IjoiY2hlaWtobmdvbTk5IiwiYSI6ImNtYjR5c2NieTF2eXYyaXNia3FmdWd5OTYifQ.yi91YsGpTzlsDA9ljYp8DQ';

interface Terrain {
  id: number;
  nom: string;
  adresse: string;
  latitude: number;
  longitude: number;
  prix_heure: number;
  est_actif: boolean;
  image_principale?: string;
  horaires_ouverture?: string;
  horaires_fermeture?: string;
  type_surface?: string;
  capacite?: number;
  distance?: number;
}

type MapStyle = 'streets' | 'satellite' | 'outdoors' | 'dark' | 'light';
type FilterStatus = 'all' | 'open' | 'closed';

const MapPageComplete: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  
  // États
  const [terrains, setTerrains] = useState<Terrain[]>([]);
  const [filteredTerrains, setFilteredTerrains] = useState<Terrain[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [markersAdded, setMarkersAdded] = useState(false);
  
  // Contrôles interface
  const [mapStyle, setMapStyle] = useState<MapStyle>('streets');
  const [showTerrainList, setShowTerrainList] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [sortByDistance, setSortByDistance] = useState(false);

  // Position par défaut: Centre de Dakar
  const DAKAR_CENTER: [number, number] = [-17.4441, 14.6928];

  // Styles de carte disponibles
  const mapStyles = {
    streets: 'mapbox://styles/mapbox/streets-v12',
    satellite: 'mapbox://styles/mapbox/satellite-streets-v12',
    outdoors: 'mapbox://styles/mapbox/outdoors-v12',
    dark: 'mapbox://styles/mapbox/dark-v11',
    light: 'mapbox://styles/mapbox/light-v11'
  };

  // Initialisation de la carte
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    console.log('🚀 Initialisation de la carte...');

    try {
      mapboxgl.accessToken = MAPBOX_TOKEN;

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: mapStyles[mapStyle],
        center: DAKAR_CENTER,
        zoom: 11,
        attributionControl: true
      });

      // Ajouter les contrôles de navigation
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
      map.current.addControl(new mapboxgl.ScaleControl(), 'bottom-left');

      map.current.on('load', () => {
        console.log('✅ Carte Mapbox chargée!');
        setLoading(false);
        loadTerrains();
        getUserLocation();
      });

      map.current.on('error', (e) => {
        console.error('❌ Erreur carte:', e);
        setError('Erreur de chargement de la carte');
        setLoading(false);
      });

    } catch (err) {
      console.error('❌ Erreur initialisation carte:', err);
      setError('Impossible d\'initialiser la carte');
      setLoading(false);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Changement de style de carte
  useEffect(() => {
    if (map.current) {
      map.current.setStyle(mapStyles[mapStyle]);
      // Re-ajouter les marqueurs après changement de style
      map.current.on('styledata', () => {
        if (terrains.length > 0) {
          setTimeout(() => {
            clearMarkers();
            addMarkersToMap(filteredTerrains);
          }, 500);
        }
      });
    }
  }, [mapStyle]);

  // Filtrage et tri des terrains
  useEffect(() => {
    let filtered = [...terrains];

    // Filtre par recherche
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(terrain => 
        terrain.nom.toLowerCase().includes(query) ||
        terrain.adresse.toLowerCase().includes(query)
      );
    }

    // Filtre par statut (ouvert/fermé)
    if (filterStatus !== 'all') {
      const now = new Date();
      const currentHour = now.getHours();
      
      filtered = filtered.filter(terrain => {
        if (filterStatus === 'open') {
          return terrain.est_actif && isTerrainOpen(terrain, currentHour);
        } else {
          return !terrain.est_actif || !isTerrainOpen(terrain, currentHour);
        }
      });
    }

    // Tri par distance si position utilisateur disponible
    if (sortByDistance && userLocation) {
      filtered = filtered.map(terrain => ({
        ...terrain,
        distance: calculateDistance(
          userLocation[1], userLocation[0],
          terrain.latitude, terrain.longitude
        )
      })).sort((a, b) => (a.distance || 0) - (b.distance || 0));
    }

    setFilteredTerrains(filtered);

    // Mettre à jour les marqueurs
    if (markersAdded) {
      clearMarkers();
      addMarkersToMap(filtered);
    }
  }, [searchQuery, filterStatus, sortByDistance, terrains, userLocation]);

  // Vérifier si un terrain est ouvert
  const isTerrainOpen = (terrain: Terrain, currentHour: number): boolean => {
    if (!terrain.horaires_ouverture || !terrain.horaires_fermeture) {
      return true; // Supposer ouvert si pas d'horaires
    }
    
    const ouverture = parseInt(terrain.horaires_ouverture.split(':')[0]);
    const fermeture = parseInt(terrain.horaires_fermeture.split(':')[0]);
    
    return currentHour >= ouverture && currentHour < fermeture;
  };

  // Calculer la distance entre deux points
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Rayon de la Terre en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Obtenir la position de l'utilisateur
  const getUserLocation = () => {
    if (!navigator.geolocation) {
      console.warn('Géolocalisation non supportée');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const userPos: [number, number] = [longitude, latitude];
        setUserLocation(userPos);
        console.log('✅ Position utilisateur obtenue:', latitude, longitude);
      },
      (error) => {
        console.warn('⚠️ Géolocalisation échouée:', error.message);
        // Continuer sans géolocalisation
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  };

  // Aller à la position de l'utilisateur
  const goToUserLocation = () => {
    if (!userLocation || !map.current) return;

    map.current.flyTo({
      center: userLocation,
      zoom: 15,
      duration: 1500
    });

    // Ajouter marqueur utilisateur
    new mapboxgl.Marker({ color: '#3B82F6', scale: 1.2 })
      .setLngLat(userLocation)
      .setPopup(
        new mapboxgl.Popup({ offset: 25 })
          .setHTML('<div style="padding: 8px;"><strong>📍 Votre position</strong></div>')
      )
      .addTo(map.current);
  };

  // Chargement des terrains depuis l'API
  const loadTerrains = async () => {
    try {
      console.log('🔄 Appel API terrains...');
      
              const response = await fetch('https://kalel-sa-match-backend.onrender.com/api/terrains/all-for-map', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📊 Données reçues:', data);

      if (data.success && Array.isArray(data.data)) {
        console.log(`✅ ${data.data.length} terrains trouvés`);
        setTerrains(data.data);
        setFilteredTerrains(data.data);
        
        setTimeout(() => {
          addMarkersToMap(data.data);
        }, 500);
        
      } else {
        throw new Error('Format de données invalide');
      }
    } catch (err) {
      console.error('❌ Erreur API:', err);
      setError(`Erreur: ${err instanceof Error ? err.message : 'Erreur inconnue'}`);
    }
  };

  // Nettoyer les marqueurs existants
  const clearMarkers = () => {
    markers.current.forEach(marker => marker.remove());
    markers.current = [];
    setMarkersAdded(false);
  };

  // Ajout des marqueurs sur la carte
  const addMarkersToMap = (terrainsData: Terrain[]) => {
    if (!map.current) {
      console.warn('⚠️ Carte non disponible pour les marqueurs');
      return;
    }

    clearMarkers();
    console.log(`🎯 Ajout de ${terrainsData.length} marqueurs...`);

    let markersSuccessCount = 0;

    terrainsData.forEach((terrain, index) => {
      try {
        const lat = Number(terrain.latitude);
        const lng = Number(terrain.longitude);

        if (isNaN(lat) || isNaN(lng)) {
          console.error(`❌ Coordonnées invalides pour ${terrain.nom}`);
          return;
        }

        // Déterminer couleur selon statut et horaires
        const now = new Date();
        const isOpen = terrain.est_actif && isTerrainOpen(terrain, now.getHours());
        const markerColor = isOpen ? '#10B981' : '#EF4444';
        
        const marker = new mapboxgl.Marker({
          color: markerColor,
          scale: 1.2
        })
          .setLngLat([lng, lat])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 })
              .setHTML(`
                <div style="padding: 12px; min-width: 250px;">
                  <h3 style="margin: 0 0 8px 0; font-weight: bold; color: #1F2937;">${terrain.nom}</h3>
                  <p style="margin: 0 0 6px 0; font-size: 14px; color: #6B7280;">📍 ${terrain.adresse}</p>
                  <p style="margin: 0 0 6px 0; font-size: 16px; font-weight: bold; color: #059669;">💰 ${terrain.prix_heure?.toLocaleString()} FCFA/h</p>
                  ${terrain.capacite ? `<p style="margin: 0 0 6px 0; font-size: 12px; color: #6B7280;">👥 Capacité: ${terrain.capacite} personnes</p>` : ''}
                  ${terrain.type_surface ? `<p style="margin: 0 0 6px 0; font-size: 12px; color: #6B7280;">🏟️ Surface: ${terrain.type_surface}</p>` : ''}
                  ${terrain.distance ? `<p style="margin: 0 0 6px 0; font-size: 12px; color: #6B7280;">📏 Distance: ${terrain.distance.toFixed(1)} km</p>` : ''}
                  <p style="margin: 0; font-size: 12px; color: ${isOpen ? '#059669' : '#DC2626'};">
                    ${isOpen ? '✅ Ouvert maintenant' : '❌ Fermé actuellement'}
                  </p>
                  <button onclick="window.open('/terrains/${terrain.id}', '_blank')" style="margin-top: 8px; padding: 4px 8px; background: #059669; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">
                    📋 Voir détails
                  </button>
                </div>
              `)
          );

        marker.addTo(map.current!);
        markers.current.push(marker);
        markersSuccessCount++;

        console.log(`✅ Marqueur ${index + 1} ajouté: ${terrain.nom}`);

      } catch (err) {
        console.error(`❌ Erreur ajout marqueur ${terrain.nom}:`, err);
      }
    });

    setMarkersAdded(true);
    console.log(`🎉 ${markersSuccessCount}/${terrainsData.length} marqueurs ajoutés avec succès!`);
  };

  // Voler vers un terrain spécifique
  const flyToTerrain = (terrain: Terrain) => {
    if (!map.current) return;

    map.current.flyTo({
      center: [terrain.longitude, terrain.latitude],
      zoom: 16,
      duration: 1500
    });

    // Ouvrir le popup du terrain
    const marker = markers.current.find(m => {
      const lngLat = m.getLngLat();
      return Math.abs(lngLat.lng - terrain.longitude) < 0.0001 &&
             Math.abs(lngLat.lat - terrain.latitude) < 0.0001;
    });

    if (marker) {
      marker.togglePopup();
    }
  };

  return (
    <div className="relative h-screen w-full flex">
      {/* Carte */}
      <div ref={mapContainer} className={`h-full transition-all duration-300 ${showTerrainList ? 'w-2/3' : 'w-full'}`} />

      {/* Panel latéral des terrains */}
      {showTerrainList && (
        <div className="w-1/3 bg-white shadow-lg border-l border-gray-200 flex flex-col">
          {/* En-tête */}
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              🏟️ Terrains Synthétiques ({filteredTerrains.length})
            </h2>

            {/* Barre de recherche */}
            <div className="relative mb-3">
              <input
                type="text"
                placeholder="🔍 Rechercher un terrain..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Filtres */}
            <div className="flex flex-wrap gap-2 mb-3">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
                className="text-xs border border-gray-300 rounded px-2 py-1"
              >
                <option value="all">Tous</option>
                <option value="open">Ouverts</option>
                <option value="closed">Fermés</option>
              </select>

              {userLocation && (
                <button
                  onClick={() => setSortByDistance(!sortByDistance)}
                  className={`text-xs px-2 py-1 rounded transition-colors ${
                    sortByDistance 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  📏 Distance
                </button>
              )}
            </div>

            {/* Contrôles carte */}
            <div className="flex flex-wrap gap-1 mb-2">
              {Object.keys(mapStyles).map((style) => (
                <button
                  key={style}
                  onClick={() => setMapStyle(style as MapStyle)}
                  className={`text-xs px-2 py-1 rounded capitalize transition-colors ${
                    mapStyle === style 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {style === 'satellite' ? '🛰️' : '🗺️'} {style}
                </button>
              ))}
            </div>

            {userLocation && (
              <button
                onClick={goToUserLocation}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-2 rounded transition-colors"
              >
                📍 Ma Position
              </button>
            )}
          </div>

          {/* Liste des terrains */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {loading && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Chargement...</span>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded p-3">
                <p className="text-sm text-red-600">❌ {error}</p>
              </div>
            )}

            {!loading && !error && filteredTerrains.map((terrain) => {
              const now = new Date();
              const isOpen = terrain.est_actif && isTerrainOpen(terrain, now.getHours());
              
              return (
                <div
                  key={terrain.id}
                  onClick={() => flyToTerrain(terrain)}
                  className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-800 text-sm">{terrain.nom}</h3>
                    <span className={`text-xs px-2 py-1 rounded ${
                      isOpen ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {isOpen ? '✅' : '❌'}
                    </span>
                  </div>
                  
                  <p className="text-xs text-gray-600 mb-2">📍 {terrain.adresse}</p>
                  
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-green-600">
                      {terrain.prix_heure?.toLocaleString()} FCFA/h
                    </span>
                    {terrain.distance && (
                      <span className="text-gray-500">
                        📏 {terrain.distance.toFixed(1)} km
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            {!loading && !error && filteredTerrains.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>🔍 Aucun terrain trouvé</p>
                <p className="text-xs mt-2">Essayez de modifier vos filtres</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bouton toggle panel */}
      <button
        onClick={() => setShowTerrainList(!showTerrainList)}
        className="absolute top-4 right-4 z-10 bg-white shadow-lg rounded-lg p-2 hover:bg-gray-50 transition-colors"
      >
        {showTerrainList ? '👈' : '📋'}
      </button>

      {/* Debug info */}
      <div className="absolute bottom-4 left-4 bg-black bg-opacity-90 text-white text-xs p-2 rounded">
        <div>Terrains: {filteredTerrains.length}/{terrains.length}</div>
        <div>Style: {mapStyle}</div>
        <div>Position: {userLocation ? '✅' : '❌'}</div>
        <div>Marqueurs: {markersAdded ? '✅' : '⏳'}</div>
      </div>
    </div>
  );
};

export default MapPageComplete; 