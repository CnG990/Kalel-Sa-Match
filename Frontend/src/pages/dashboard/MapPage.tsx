import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Search, Loader2, RefreshCw, MapPin, Crosshair, ChevronUp, List, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix des icônes Leaflet en mode bundler
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png'
});

type BaseLayerKey = 'street' | 'satellite' | 'voyager' | 'topo' | 'dark';

const LAYER_STORAGE_KEY = 'ksm_map_layer';

const getStoredLayer = (): BaseLayerKey => {
  try {
    const stored = localStorage.getItem(LAYER_STORAGE_KEY);
    if (stored && ['street', 'satellite', 'voyager', 'topo', 'dark'].includes(stored)) {
      return stored as BaseLayerKey;
    }
  } catch {
    // ignore
  }
  return 'street';
};

const storeLayer = (key: BaseLayerKey) => {
  try {
    localStorage.setItem(LAYER_STORAGE_KEY, key);
  } catch {
    // ignore
  }
};

interface Terrain {
  id: number;
  nom: string;
  adresse: string;
  latitude: number | string;
  longitude: number | string;
  prix_heure: number | null;
  est_actif: boolean;
  distance?: number;
  statut_reservation?: 'libre' | 'reserve' | string;
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'https://kalelsamatch.duckdns.org').replace(/\/$/, '');
const MAP_ENDPOINT = `${API_BASE_URL}/api/terrains/terrains/all-for-map/`;

const BASE_LAYERS: Record<BaseLayerKey, { label: string; emoji: string; create: () => L.TileLayer }> = {
  street: {
    label: 'Street',
    emoji: '🛣️',
    create: () =>
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      })
  },
  satellite: {
    label: 'Satellite',
    emoji: '🛰️',
    create: () =>
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics',
        maxZoom: 19
      })
  },
  voyager: {
    label: 'Voyager',
    emoji: '🗺️',
    create: () =>
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
      })
  },
  topo: {
    label: 'Topographie',
    emoji: '⛰️',
    create: () =>
      L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data: &copy; OpenStreetMap, SRTM | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
        maxZoom: 17
      })
  },
  dark: {
    label: 'Sombre',
    emoji: '🌙',
    create: () =>
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
      })
  }
};

const calculateDistanceKm = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const lat1Rad = lat1 * Math.PI / 180;
  const lat2Rad = lat2 * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 100) / 100;
};

const MapPage: React.FC = () => {
  const navigate = useNavigate();
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const baseLayerRef = useRef<L.Layer | null>(null);
  const markersRef = useRef<L.Layer[]>([]);
  const userMarkerRef = useRef<L.Layer[]>([]);
  
  const [terrains, setTerrains] = useState<Terrain[]>([]);
  const [loading, setLoading] = useState(true);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showOnlyOpen, setShowOnlyOpen] = useState(false);
  const [baseLayer, setBaseLayer] = useState<BaseLayerKey>(getStoredLayer);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [showMobilePanel, setShowMobilePanel] = useState(false);
  const autoLocateRef = useRef(false);

  // Initialisation de la carte une seule fois
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [14.6928, -17.4441],
      zoom: 12,
      preferCanvas: true
    });

    mapRef.current = map;

    // Assure l'affichage immédiat des tuiles/markers (évite le rendu seulement après zoom)
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    // Couche de base restaurée depuis localStorage ou 'street' par défaut
    const storedLayer = getStoredLayer();
    const initialLayer = BASE_LAYERS[storedLayer].create();
    initialLayer.addTo(map);
    baseLayerRef.current = initialLayer;
    setBaseLayer(storedLayer);

    void loadTerrains();

    // Géolocalisation automatique dès l'init de la carte
    if (!autoLocateRef.current) {
      autoLocateRef.current = true;
      requestUserLocation();
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyBaseLayer = (key: BaseLayerKey) => {
    const map = mapRef.current;
    if (!map) return;

    if (baseLayerRef.current) {
      try {
        map.removeLayer(baseLayerRef.current);
      } catch {
        // ignore
      }
      baseLayerRef.current = null;
    }

    const layerDef = BASE_LAYERS[key];
    const newLayer = layerDef.create();
    newLayer.addTo(map);
    baseLayerRef.current = newLayer;
    setBaseLayer(key);
    storeLayer(key);
  };

  const clearMarkers = () => {
    const map = mapRef.current;
    if (!map) return;
    markersRef.current.forEach(m => map.removeLayer(m));
    markersRef.current = [];
  };

  const addMarkers = (list: Terrain[]) => {
    const map = mapRef.current;
    if (!map) return;

    clearMarkers();

    const validMarkers: L.Layer[] = [];

    list.forEach((t) => {
      const lat = Number(t.latitude);
      const lng = Number(t.longitude);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

      const status = (t.statut_reservation ?? 'libre').toLowerCase();
      const isReserved = status === 'reserve';
      const isActive = t.est_actif;
      
      // Couleurs selon statut
      const bgColor = !isActive ? '#6b7280' : isReserved ? '#dc2626' : '#16a34a';
      const badgeLabel = !isActive ? 'Fermé' : isReserved ? 'Réservé' : 'Disponible';
      const pulseColor = !isActive ? 'rgba(107,114,128,0.4)' : isReserved ? 'rgba(220,38,38,0.4)' : 'rgba(22,163,74,0.4)';
      
      // Créer un marqueur HTML personnalisé avec icône terrain
      const customIcon = L.divIcon({
        className: 'custom-terrain-marker',
        html: `
          <div style="
            position: relative;
            width: 44px;
            height: 44px;
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <!-- Cercle pulsant -->
            <div style="
              position: absolute;
              width: 44px;
              height: 44px;
              background: ${pulseColor};
              border-radius: 50%;
              animation: pulse-marker 2s ease-in-out infinite;
            "></div>
            <!-- Marqueur principal -->
            <div style="
              position: relative;
              width: 36px;
              height: 36px;
              background: linear-gradient(135deg, ${bgColor} 0%, ${bgColor}dd 100%);
              border-radius: 50% 50% 50% 0;
              transform: rotate(-45deg);
              border: 3px solid white;
              box-shadow: 0 4px 12px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <span style="
                transform: rotate(45deg);
                font-size: 16px;
                filter: drop-shadow(0 1px 1px rgba(0,0,0,0.2));
              ">⚽</span>
            </div>
            <!-- Badge numéro -->
            ${t.distance !== undefined ? `
              <div style="
                position: absolute;
                top: -4px;
                right: -4px;
                background: #f97316;
                color: white;
                font-size: 9px;
                font-weight: 700;
                padding: 2px 5px;
                border-radius: 10px;
                border: 2px solid white;
                box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                transform: rotate(0deg);
              ">${t.distance}km</div>
            ` : ''}
          </div>
        `,
        iconSize: [44, 44],
        iconAnchor: [22, 44],
        popupAnchor: [0, -40]
      });

      const marker = L.marker([lat, lng], { icon: customIcon });

      const slotsUrl = `/users/terrain/${t.id}`;
      const safeName = t.nom.replace(/"/g, '&quot;');
      marker.bindPopup(`
        <div style="min-width: 240px; font-family: 'Inter', sans-serif;">
          <h3 style="margin:0 0 6px;font-size:15px;font-weight:600;color:#111827;">🏟️ ${safeName}</h3>
          <p style="margin:0 0 6px;font-size:12px;color:#4b5563;">📍 ${t.adresse}</p>
          <p style="margin:0 0 6px;font-size:12px;font-weight:600;color:${bgColor};">• ${badgeLabel}</p>
          ${t.prix_heure
            ? `<p style=\"margin:0 0 6px;font-size:13px;font-weight:600;color:#15803d;\">💰 ${t.prix_heure.toLocaleString()} FCFA/h</p>`
            : ''
          }
          ${t.distance !== undefined
            ? `<p style=\"margin:0 0 8px;font-size:12px;color:#0f766e;\">📏 ${t.distance} km</p>`
            : ''
          }
          <div style="display:flex;gap:8px;margin-top:8px;">
            <button onclick="window.open('https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}','_blank')" style="flex:1;padding:8px 0;border:none;border-radius:8px;background:#16a34a;color:white;font-size:12px;font-weight:600;cursor:pointer;">
              🗺️ Itinéraire
            </button>
            <button onclick="window.location.href='${slotsUrl}'" style="flex:1;padding:8px 0;border:none;border-radius:8px;background:#f97316;color:white;font-size:12px;font-weight:600;cursor:pointer;">
              📋 Créneaux
            </button>
          </div>
        </div>
      `);
      marker.addTo(map);
      validMarkers.push(marker);
    });

    markersRef.current = validMarkers;

    if (validMarkers.length > 0) {
      const group = L.featureGroup(validMarkers);
      map.fitBounds(group.getBounds().pad(0.1));
    }
  };

  const loadTerrains = async () => {
    try {
      setLoading(true);
      setError(null);
        
        const response = await fetch(MAP_ENDPOINT, {
          method: 'GET',
          headers: {
          Accept: 'application/json',
            'Content-Type': 'application/json'
          }
        });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} - ${response.statusText}`);
      }

      const payload = await response.json();
      const terrainsData: any[] = Array.isArray(payload.data) ? payload.data : [];

      // Pas d'erreur si aucun terrain : on affiche simplement une carte vide
      const normalized: Terrain[] = terrainsData
        .map((t) => ({
          id: t.id,
          nom: t.nom,
          adresse: t.adresse,
          latitude: t.latitude,
          longitude: t.longitude,
          prix_heure: t.prix_heure ?? null,
          est_actif: t.est_actif,
          statut_reservation: t.statut_reservation ?? 'libre'
        }))
        .filter((t) => {
          const lat = Number(t.latitude);
          const lng = Number(t.longitude);
          return Number.isFinite(lat) && Number.isFinite(lng) && lat !== 0 && lng !== 0;
        });

      // calcul distance si position connue
      let withDistance = normalized;
      if (userLocation) {
        const [uLat, uLng] = userLocation;
        withDistance = normalized
          .map(t => ({
            ...t,
            distance: calculateDistanceKm(uLat, uLng, Number(t.latitude), Number(t.longitude))
          }))
          .sort((a, b) => (a.distance ?? 999) - (b.distance ?? 999));
      }

      setTerrains(withDistance);
      addMarkers(withDistance);
      toast.success(`${withDistance.length} terrains chargés`);
    } catch (err: any) {
      console.error(err);
      setError('Impossible de charger les terrains. Veuillez vérifier la connexion au serveur.');
      toast.error('Erreur lors du chargement des terrains');
    } finally {
      setLoading(false);
    }
  };

  const addUserMarker = (coords: [number, number]) => {
    const map = mapRef.current;
    if (!map) return;

    // Supprimer ancien marqueur utilisateur
    userMarkerRef.current.forEach(m => map.removeLayer(m));
    userMarkerRef.current = [];

    // Halo pulsant
    const pulse = L.circleMarker(coords, {
      radius: 18,
      color: '#3b82f6',
      fillColor: '#3b82f6',
      fillOpacity: 0.15,
      weight: 1,
      className: 'user-pulse'
    });
    pulse.addTo(map);

    // Point central
    const dot = L.circleMarker(coords, {
      radius: 7,
      color: '#ffffff',
      fillColor: '#2563eb',
      fillOpacity: 1,
      weight: 3
    });
    dot.bindPopup('<div style="text-align:center;font-weight:600;font-size:13px;">📍 Vous êtes ici</div>');
    dot.addTo(map);

    userMarkerRef.current = [pulse, dot];
  };

  // Fonction de géolocalisation automatique (appelée à l'init)
  const requestUserLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocating(false);
      return;
    }

    setLocating(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const coords: [number, number] = [lat, lng];
        setUserLocation(coords);
        setLocating(false);

        // Auto-centrer immédiatement sur la position utilisateur
        if (mapRef.current) {
          mapRef.current.setView(coords, 15, { animate: true });
          addUserMarker(coords);
        }

        toast.success('📍 Position obtenue');
      },
      () => {
        setLocating(false);
        toast('📍 Position non disponible — affichage par défaut', { icon: 'ℹ️' });
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 300000 }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Géolocalisation non supportée par votre navigateur');
      return;
    }

    setLocating(true);
    toast.loading('Recherche de votre position...', { id: 'geo' });

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        toast.dismiss('geo');
        setLocating(false);
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const coords: [number, number] = [lat, lng];
        setUserLocation(coords);

        // Recalculer distances et trier par proximité
        if (terrains.length > 0) {
          const updated = terrains
            .map(t => ({
              ...t,
              distance: calculateDistanceKm(lat, lng, Number(t.latitude), Number(t.longitude))
            }))
            .sort((a, b) => (a.distance ?? 999) - (b.distance ?? 999));
          setTerrains(updated);
          addMarkers(updated);
        }

        if (mapRef.current) {
          mapRef.current.setView(coords, 15, { animate: true });
          addUserMarker(coords);
        }

        toast.success('Position obtenue — terrains triés par proximité');
      },
      () => {
        toast.dismiss('geo');
        toast.error('Impossible d\'obtenir votre position');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 300000 }
    );
  };

  // Recalculer les distances quand la position utilisateur change
  useEffect(() => {
    if (!userLocation || terrains.length === 0) return;
    const [uLat, uLng] = userLocation;
    const updated = terrains
      .map(t => ({
        ...t,
        distance: calculateDistanceKm(uLat, uLng, Number(t.latitude), Number(t.longitude))
      }))
      .sort((a, b) => (a.distance ?? 999) - (b.distance ?? 999));
    setTerrains(updated);
    addMarkers(updated);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userLocation]);

  const filteredTerrains = terrains.filter((t) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      t.nom.toLowerCase().includes(term) ||
      t.adresse.toLowerCase().includes(term);
    const matchesStatus = !showOnlyOpen || t.est_actif;
    return matchesSearch && matchesStatus;
  });

  const sortedTerrains = userLocation 
    ? [...filteredTerrains].sort((a, b) => (a.distance ?? 999) - (b.distance ?? 999))
    : filteredTerrains;

  if (error && terrains.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center max-w-lg">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-red-700 mb-2">Problème de chargement</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-x-3 mb-6">
            <button
              onClick={loadTerrains}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              <RefreshCw className="w-4 h-4 inline mr-2" />
              Réessayer
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium"
            >
              Recharger page
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full flex flex-col lg:flex-row bg-gray-100">
      {/* ====== CARTE — plein écran mobile, 2/3 desktop ====== */}
      <div className="w-full lg:w-2/3 h-full relative">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Loader */}
        {loading && (
          <div className="absolute inset-0 bg-gray-100/80 flex items-center justify-center z-20">
            <div className="text-center">
              <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-3" />
              <p className="text-sm font-semibold text-gray-700">Chargement...</p>
            </div>
          </div>
        )}

        {/* ====== Contrôles carte overlay ====== */}
        <div className="leaflet-map-controls absolute top-3 left-3 space-y-2 lg:top-3 lg:left-3" style={{ zIndex: 1000 }}>
          {/* Dropdown fond de carte — compact sur mobile */}
          <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-2 border border-gray-200">
            <div className="relative">
              <select
                value={baseLayer}
                onChange={(e) => applyBaseLayer(e.target.value as BaseLayerKey)}
                className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-lg py-1.5 pl-3 pr-8 text-xs font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {(Object.keys(BASE_LAYERS) as BaseLayerKey[]).map((key) => (
                  <option key={key} value={key}>
                    {BASE_LAYERS[key].emoji} {BASE_LAYERS[key].label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          {/* Bouton Ma position */}
          <button
            onClick={getUserLocation}
            disabled={loading || locating}
            className={`flex items-center gap-1.5 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg px-3 py-1.5 border border-gray-200 text-xs font-medium transition-colors ${
              locating ? 'opacity-70 cursor-wait' : 'hover:bg-blue-50'
            }`}
          >
            {locating ? (
              <Loader2 className="w-3.5 h-3.5 text-blue-600 animate-spin" />
            ) : (
              <Crosshair className="w-3.5 h-3.5 text-blue-600" />
            )}
            {locating ? 'Recherche...' : 'Ma position'}
          </button>
        </div>

        {/* ====== Bouton flottant mobile pour ouvrir la liste ====== */}
        <button
          onClick={() => setShowMobilePanel(true)}
          className="lg:hidden leaflet-map-controls absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-full shadow-xl border-2 border-white font-semibold text-sm transition-all active:scale-95"
          style={{ zIndex: 1000 }}
        >
          <List className="w-4 h-4" />
          {sortedTerrains.length} terrains
          <ChevronUp className="w-4 h-4" />
        </button>
      </div>

      {/* ====== SIDEBAR DESKTOP — visible uniquement lg+ ====== */}
      <div className="hidden lg:flex lg:w-1/3 h-full bg-white border-l border-gray-300 flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-1">🏟️ Terrains de Dakar</h2>
          <p className="text-sm text-gray-600">{sortedTerrains.length} terrain(s) disponible(s)</p>
        </div>
        <div className="p-4 space-y-3 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showOnlyOpen}
                onChange={(e) => setShowOnlyOpen(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Ouverts uniquement</span>
            </label>
            <button
              onClick={loadTerrains}
              className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 text-xs font-medium"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Actualiser
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {sortedTerrains.map((terrain) => (
            <div
              key={terrain.id}
              className="p-3 border rounded-lg bg-white hover:bg-orange-50 hover:border-orange-300 cursor-pointer transition-all duration-200 hover:shadow-md group"
              onClick={() => navigate(`/users/terrain/${terrain.id}`)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="font-semibold text-sm text-gray-800 group-hover:text-orange-700 transition-colors">{terrain.nom}</div>
                  <div className="text-xs text-gray-600 mt-1 flex items-center">
                    <MapPin className="w-3 h-3 mr-1" />{terrain.adresse}
                  </div>
                  {terrain.distance !== undefined && (
                    <div className="text-xs text-blue-600 font-semibold mt-1">📏 {terrain.distance} km</div>
                  )}
                </div>
                <div className="text-right text-xs space-y-1">
                  {terrain.prix_heure !== null && (
                    <div className="text-green-600 font-bold text-sm">{terrain.prix_heure.toLocaleString()} <span className="text-gray-400 font-normal">F/h</span></div>
                  )}
                  <div className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${terrain.est_actif ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-700'}`}>
                    {terrain.est_actif ? 'Ouvert' : 'Fermé'}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={(e) => { e.stopPropagation(); navigate(`/users/terrain/${terrain.id}`); }}
                  className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold transition-colors"
                >
                  📋 Créneaux
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); window.open(`https://www.google.com/maps/dir/?api=1&destination=${Number(terrain.latitude)},${Number(terrain.longitude)}`, '_blank'); }}
                  className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-green-500 hover:bg-green-600 text-white text-xs font-semibold transition-colors"
                >
                  🗺️ Itinéraire
                </button>
              </div>
            </div>
          ))}
          {!loading && sortedTerrains.length === 0 && (
            <div className="text-center text-sm text-gray-500 py-8">Aucun terrain ne correspond.</div>
          )}
        </div>
      </div>

      {/* ====== PANNEAU MOBILE BOTTOM SHEET ====== */}
      {showMobilePanel && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col">
          {/* Overlay sombre */}
          <div className="flex-shrink-0 h-[15%] bg-black/40" onClick={() => setShowMobilePanel(false)} />
          {/* Panneau */}
          <div className="flex-1 bg-white rounded-t-2xl shadow-2xl flex flex-col overflow-hidden">
            {/* Barre de poignée + header */}
            <div className="flex-shrink-0 p-3 border-b border-gray-200">
              <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-3" />
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-gray-800">🏟️ Terrains ({sortedTerrains.length})</h2>
                </div>
                <button
                  onClick={() => setShowMobilePanel(false)}
                  className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200"
                >
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              {/* Recherche mobile */}
              <div className="relative mt-2">
                <Search className="absolute left-2.5 top-2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher un terrain..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-center justify-between mt-2">
                <label className="flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    checked={showOnlyOpen}
                    onChange={(e) => setShowOnlyOpen(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                  />
                  <span className="text-xs text-gray-600">Ouverts</span>
                </label>
                <button
                  onClick={loadTerrains}
                  className="flex items-center gap-1 text-blue-600 text-xs font-medium"
                >
                  <RefreshCw className="w-3 h-3" /> Actualiser
                </button>
              </div>
            </div>
            {/* Liste scrollable */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {sortedTerrains.map((terrain) => (
                <div
                  key={terrain.id}
                  className="p-3 border rounded-xl bg-white hover:bg-orange-50 active:bg-orange-100 cursor-pointer transition-all shadow-sm"
                  onClick={() => { setShowMobilePanel(false); navigate(`/users/terrain/${terrain.id}`); }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-gray-800 truncate">{terrain.nom}</div>
                      <div className="text-xs text-gray-500 mt-0.5 truncate flex items-center">
                        <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />{terrain.adresse}
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      {terrain.prix_heure !== null && (
                        <div className="text-green-600 font-bold text-sm">{terrain.prix_heure.toLocaleString()} <span className="text-[10px] text-gray-400 font-normal">F/h</span></div>
                      )}
                      {terrain.distance !== undefined && (
                        <div className="text-[10px] text-blue-600 font-semibold">{terrain.distance} km</div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); setShowMobilePanel(false); navigate(`/users/terrain/${terrain.id}`); }}
                      className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg bg-orange-500 text-white text-xs font-semibold active:bg-orange-600"
                    >
                      📋 Créneaux
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); window.open(`https://www.google.com/maps/dir/?api=1&destination=${Number(terrain.latitude)},${Number(terrain.longitude)}`, '_blank'); }}
                      className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg bg-green-500 text-white text-xs font-semibold active:bg-green-600"
                    >
                      🗺️ Itinéraire
                    </button>
                  </div>
                </div>
              ))}
              {!loading && sortedTerrains.length === 0 && (
                <div className="text-center text-sm text-gray-500 py-8">Aucun terrain trouvé.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapPage;