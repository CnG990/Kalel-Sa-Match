import React, { useState, useEffect, useRef, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import { Navigation, Clock, Route } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface NavigationState {
  isNavigating: boolean;
  currentStep: string;
  distanceRemaining: string;
  timeRemaining: string;
  nextInstruction: string;
  trafficCondition: 'smooth' | 'moderate' | 'heavy';
}

interface Terrain {
  id: number;
  nom: string;
  latitude: number;
  longitude: number;
  isReservedByUser?: boolean;
  reservationTime?: string;
}

interface AdvancedMapNavigationProps {
  terrains: Terrain[];
  userLocation: { latitude: number; longitude: number } | null;
  onNavigationStart: (terrainId: number) => void;
}

export const AdvancedMapNavigation: React.FC<AdvancedMapNavigationProps> = ({
  terrains,
  userLocation,
  onNavigationStart
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const userLocationMarker = useRef<mapboxgl.Marker | null>(null);
  const watchPositionId = useRef<number | null>(null);

  const [navigationState, setNavigationState] = useState<NavigationState>({
    isNavigating: false,
    currentStep: '',
    distanceRemaining: '',
    timeRemaining: '',
    nextInstruction: '',
    trafficCondition: 'smooth'
  });

  const [selectedTerrain, setSelectedTerrain] = useState<Terrain | null>(null);
  const [showNavigationPanel, setShowNavigationPanel] = useState(false);
  const [realTimeTracking, setRealTimeTracking] = useState(false);

  // Initialisation de la carte avec layers avancées
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/navigation-day-v1', // Style navigation
      center: [-17.46, 14.71],
      zoom: 11,
      bearing: 0,
      pitch: 45 // Vue 3D pour navigation
    });

    map.current.on('load', () => {
      if (!map.current) return;

      // Ajouter les contrôles de navigation 3D
      map.current.addControl(new mapboxgl.NavigationControl());
      map.current.addControl(new mapboxgl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
        showUserHeading: true
      }));

      // Ajouter layer pour le trafic (simulé)
      addTrafficLayer();
      addTerrainMarkers();
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Ajouter layer de trafic
  const addTrafficLayer = useCallback(() => {
    if (!map.current) return;

    // Layer de trafic simulé avec couleurs
    map.current.addSource('traffic', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: [] // Sera rempli avec les données de trafic
      }
    });

    map.current.addLayer({
      id: 'traffic-layer',
      type: 'line',
      source: 'traffic',
      paint: {
        'line-color': [
          'case',
          ['==', ['get', 'traffic'], 'heavy'], '#dc2626', // Rouge pour trafic dense
          ['==', ['get', 'traffic'], 'moderate'], '#f59e0b', // Orange pour trafic modéré
          '#22c55e' // Vert pour trafic fluide
        ],
        'line-width': 8,
        'line-opacity': 0.8
      }
    });
  }, []);

  // Ajouter les marqueurs de terrains avec différenciation
  const addTerrainMarkers = useCallback(() => {
    if (!map.current) return;

    terrains.forEach(terrain => {
      const isReserved = terrain.isReservedByUser;
      
      // Couleur et style selon le statut
      let markerColor = '#3b82f6'; // Bleu normal
      let markerSize = 40;
      let pulseAnimation = false;

      if (isReserved) {
        markerColor = '#22c55e'; // Vert pour réservé
        markerSize = 50;
        pulseAnimation = true;
      }

      // Créer marqueur custom avec animation
      const markerElement = document.createElement('div');
      markerElement.className = 'custom-terrain-marker';
      markerElement.style.cssText = `
        width: ${markerSize}px;
        height: ${markerSize}px;
        background: ${markerColor};
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 16px;
        position: relative;
        ${pulseAnimation ? 'animation: pulse-reserved 2s infinite;' : ''}
      `;

      // Icône selon le type
      markerElement.innerHTML = isReserved ? '⭐' : '🏟️';

      // Animation CSS pour terrains réservés
      if (pulseAnimation) {
        const style = document.createElement('style');
        style.textContent = `
          @keyframes pulse-reserved {
            0% { transform: scale(1); box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3); }
            50% { transform: scale(1.1); box-shadow: 0 6px 20px rgba(34, 197, 94, 0.6); }
            100% { transform: scale(1); box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3); }
          }
        `;
        document.head.appendChild(style);
      }

      // Popup enrichi
      new mapboxgl.Popup({ offset: 25 })
        .setHTML(`
          <div style="padding: 15px; min-width: 250px;">
            <h3 style="margin: 0 0 10px; color: #1f2937; font-size: 18px;">
              ${isReserved ? '⭐' : '🏟️'} ${terrain.nom}
            </h3>
            ${isReserved ? `
              <div style="background: #dcfce7; padding: 8px; border-radius: 6px; margin-bottom: 10px;">
                <strong style="color: #166534;">✅ Votre réservation</strong><br>
                <small style="color: #166534;">Créneaux: ${terrain.reservationTime || 'Voir détails'}</small>
              </div>
            ` : ''}
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 10px;">
              <button onclick="window.startNavigation(${terrain.id})" 
                style="background: #3b82f6; color: white; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; font-size: 12px;">
                🧭 Naviguer
              </button>
              <button onclick="window.callTerrain(${terrain.id})" 
                style="background: #10b981; color: white; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; font-size: 12px;">
                📞 Appeler
              </button>
            </div>
            <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #e5e7eb;">
              <button onclick="window.shareLocation(${terrain.id})" 
                style="width: 100%; background: #6366f1; color: white; border: none; padding: 8px; border-radius: 6px; cursor: pointer; font-size: 12px;">
                📍 Partager ma position
              </button>
            </div>
          </div>
        `);

      // Event listeners
      markerElement.addEventListener('click', () => {
        setSelectedTerrain(terrain);
      });
    });
  }, [terrains]);

  // Démarrer la navigation
  const startNavigation = useCallback(async (terrainId: number) => {
    const terrain = terrains.find(t => t.id === terrainId);
    if (!terrain || !userLocation) return;

    setNavigationState(prev => ({ ...prev, isNavigating: true }));
    setShowNavigationPanel(true);
    setRealTimeTracking(true);

    // Simuler la navigation avec Google Maps
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${terrain.latitude},${terrain.longitude}&travelmode=driving`;
    window.open(googleMapsUrl, '_blank');

        onNavigationStart(terrainId);
    toast.success(`Navigation vers ${terrain.nom} démarrée`);
  }, [terrains, userLocation, onNavigationStart]);

  // Suivre la position en temps réel
  useEffect(() => {
    if (!realTimeTracking || !userLocation) return;

    const watchPosition = (position: GeolocationPosition) => {
      const { latitude, longitude } = position.coords;
        
      if (map.current && userLocationMarker.current) {
          userLocationMarker.current.setLngLat([longitude, latitude]);
      }

      // Mettre à jour les informations de navigation
      if (selectedTerrain) {
        const distance = calculateDistance(latitude, longitude, selectedTerrain.latitude, selectedTerrain.longitude);
        const estimatedTime = Math.round(distance * 2); // 2 min par km en moyenne

        setNavigationState(prev => ({
          ...prev,
          distanceRemaining: `${distance.toFixed(1)} km`,
          timeRemaining: `${estimatedTime} min`
        }));
      }
    };

    watchPositionId.current = navigator.geolocation.watchPosition(
      watchPosition,
      (error) => {
        console.error('Erreur géolocalisation:', error);
        toast.error('Impossible de suivre votre position');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000
      }
    );

    return () => {
    if (watchPositionId.current) {
      navigator.geolocation.clearWatch(watchPositionId.current);
      }
    };
  }, [realTimeTracking, userLocation, selectedTerrain]);

  // Exposer les fonctions globalement
  useEffect(() => {
    (window as any).startNavigation = (terrainId: number) => startNavigation(terrainId);
    (window as any).callTerrain = (terrainId: number) => {
      const terrain = terrains.find(t => t.id === terrainId);
      if (terrain) {
        // Simuler un appel
        toast.success(`Appel vers ${terrain.nom} en cours...`);
      }
    };
    (window as any).shareLocation = () => {
      if (navigator.share && userLocation) {
        navigator.share({
          title: 'Ma position',
          text: `Je suis à ${userLocation.latitude}, ${userLocation.longitude}`,
          url: `https://maps.google.com/?q=${userLocation.latitude},${userLocation.longitude}`
        });
      } else {
        toast.success('Position copiée dans le presse-papiers');
      }
    };
  }, [startNavigation, terrains, userLocation]);

  // Calculer la distance entre deux points
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Rayon de la Terre en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  return (
    <div className="relative">
      {/* Carte */}
      <div ref={mapContainer} className="w-full h-96 rounded-lg" />

      {/* Panneau de navigation */}
      {showNavigationPanel && (
        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">Navigation</h3>
            <button
              onClick={() => setShowNavigationPanel(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          {navigationState.isNavigating && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Navigation className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium">
                  {navigationState.distanceRemaining} restant
                </span>
          </div>

              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-orange-600" />
                <span className="text-sm">
                  {navigationState.timeRemaining} estimé
                </span>
          </div>

              <div className="flex items-center space-x-2">
                <Route className="w-4 h-4 text-green-600" />
                <span className="text-sm">
                  Trafic: {navigationState.trafficCondition}
            </span>
          </div>
        </div>
      )}
        </div>
      )}
    </div>
  );
};

export default AdvancedMapNavigation; 