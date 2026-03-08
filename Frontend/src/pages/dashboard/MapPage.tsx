import React, { useEffect, useRef, useState } from 'react';
import { Search, Loader2, RefreshCw, MapPin, Crosshair } from 'lucide-react';
import toast from 'react-hot-toast';
import L from 'leaflet';
import * as EsriLeaflet from 'esri-leaflet';
import 'leaflet/dist/leaflet.css';

// Fix des icônes Leaflet en mode bundler
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png'
});

type BaseLayerKey = 'osm' | 'satellite' | 'city';

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
const MAP_ENDPOINT = `${API_BASE_URL}/api/terrains/terrains/all-for-map`;

const BASE_LAYERS: Record<BaseLayerKey, { label: string; create: () => L.Layer }> = {
  osm: {
    label: 'Plan classique',
    create: () =>
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
      })
  },
  satellite: {
    label: 'Vue satellite',
    create: () => EsriLeaflet.basemapLayer('Imagery')
  },
  city: {
    label: 'Plan urbain',
    create: () => EsriLeaflet.basemapLayer('Streets')
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
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const baseLayerRef = useRef<L.Layer | null>(null);
  const markersRef = useRef<L.Layer[]>([]);
  const userMarkerRef = useRef<L.Layer[]>([]);
  
  const [terrains, setTerrains] = useState<Terrain[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showOnlyOpen, setShowOnlyOpen] = useState(false);
  const [baseLayer, setBaseLayer] = useState<BaseLayerKey>('osm');
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
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

    // Couche de base par défaut
    const initialLayer = BASE_LAYERS.osm.create();
    initialLayer.addTo(map);
    baseLayerRef.current = initialLayer;

    void loadTerrains();

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
      const badgeColor = isReserved ? '#dc2626' : '#16a34a';
      const badgeLabel = isReserved ? 'Réservé' : 'Disponible';
      const marker = L.circleMarker([lat, lng], {
        radius: 9,
        color: badgeColor,
        fillColor: badgeColor,
        fillOpacity: 0.85,
        weight: 2
      });

      const slotsUrl = `/users/terrain/${t.id}`;
      const safeName = t.nom.replace(/"/g, '&quot;');
      marker.bindPopup(`
        <div style="min-width: 240px; font-family: 'Inter', sans-serif;">
          <h3 style="margin:0 0 6px;font-size:15px;font-weight:600;color:#111827;">🏟️ ${safeName}</h3>
          <p style="margin:0 0 6px;font-size:12px;color:#4b5563;">📍 ${t.adresse}</p>
          <p style="margin:0 0 6px;font-size:12px;font-weight:600;color:${badgeColor};">• ${badgeLabel}</p>
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
            <button onclick="window.open('${slotsUrl}','_blank')" style="flex:1;padding:8px 0;border:none;border-radius:8px;background:#f97316;color:white;font-size:12px;font-weight:600;cursor:pointer;">
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

      if (terrainsData.length === 0) {
        throw new Error('Aucun terrain reçu depuis le serveur.');
      }

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

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Géolocalisation non supportée par votre navigateur');
      return;
    }

    toast.loading('Recherche de votre position...', { id: 'geo' });

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        toast.dismiss('geo');
        // Utiliser uniquement latitude et longitude (PAS altitude)
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
          mapRef.current.setView(coords, 13);
          addUserMarker(coords);
        }

        toast.success('Position obtenue — terrains triés par proximité');
      },
      () => {
        toast.dismiss('geo');
        toast.error('Impossible d\'obtenir votre position');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 300000 }
    );
  };

  useEffect(() => {
    if (autoLocateRef.current) return;
    autoLocateRef.current = true;
    getUserLocation();
  }, []);

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
      {/* Carte */}
      <div className="w-full lg:w-2/3 h-1/2 lg:h-full relative">
        <div ref={mapContainerRef} className="w-full h-full" />
        
        {loading && (
          <div className="absolute inset-0 bg-gray-100/80 flex items-center justify-center z-20">
            <div className="text-center max-w-md">
              <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
              <h2 className="text-lg font-bold text-gray-800 mb-2">
                Chargement de la carte et des terrains...
              </h2>
            </div>
          </div>
        )}
        
        {/* Contrôles carte */}
        <div className="absolute top-3 left-3 space-y-2 z-30">
          <div className="bg-white rounded shadow-md p-2 border text-xs">
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Fond :</span>
                <select 
                value={baseLayer}
                onChange={(e) => applyBaseLayer(e.target.value as BaseLayerKey)}
                className="text-xs border rounded px-1 py-0.5"
              >
                <option value="osm">Plan classique</option>
                <option value="city">Plan urbain</option>
                <option value="satellite">Vue satellite</option>
                </select>
                </div>
              </div>

              <button
                onClick={getUserLocation}
                disabled={loading}
            className="flex items-center gap-1 bg-white rounded shadow-md px-2 py-1 border text-xs hover:bg-blue-50"
          >
            <Crosshair className="w-3 h-3" />
            Ma position
              </button>
          </div>
      </div>

      {/* Sidebar */}
        <div className="w-full lg:w-1/3 h-1/2 lg:h-full bg-white border-t lg:border-t-0 lg:border-l border-gray-300 p-4 overflow-y-auto">
          <div className="space-y-4">
            <div>
              <h2 className="text-lg lg:text-xl font-bold text-gray-800 mb-1">
                🏟️ Terrains de Dakar
              </h2>
              <p className="text-xs lg:text-sm text-gray-600">
                {sortedTerrains.length} terrain(s) disponible(s)
            </p>
            </div>

            {/* Recherche */}
            <div className="relative">
            <Search className="absolute left-2 top-2.5 w-4 h-4 text-gray-400" />
              <input
                type="text"
              placeholder="Rechercher par nom ou adresse..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>

            {/* Filtre */}
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showOnlyOpen}
                onChange={(e) => setShowOnlyOpen(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Ouverts uniquement</span>
            </label>

            {/* Actions */}
            <div className="space-y-2">
              <button
                onClick={loadTerrains}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
              <RefreshCw className="w-4 h-4" />
              Actualiser les terrains
              </button>
            </div>

            {/* Liste */}
            <div className="space-y-2 lg:space-y-3">
            <h3 className="font-bold text-sm text-gray-800">Liste des terrains</h3>
            <div className="space-y-2 max-h-80 lg:max-h-[70vh] overflow-y-auto">
              {sortedTerrains.map((terrain) => (
                    <div
                      key={terrain.id}
                  className="p-3 border rounded-lg bg-white hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition-colors"
                      onClick={() => {
                    const lat = Number(terrain.latitude);
                    const lng = Number(terrain.longitude);
                    if (mapRef.current && Number.isFinite(lat) && Number.isFinite(lng)) {
                      mapRef.current.setView([lat, lng], 15, { animate: true });
                    }
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                      <div className="font-semibold text-sm text-gray-800">
                        {terrain.nom}
                          </div>
                      <div className="text-xs text-gray-600 mt-1 flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                            {terrain.adresse}
                          </div>
                      {terrain.distance !== undefined && (
                        <div className="text-xs text-green-700 mt-1">
                          📏 {terrain.distance} km
                            </div>
                          )}
                          </div>
                    <div className="text-right text-xs space-y-1">
                      {terrain.prix_heure !== null && (
                        <>
                          <div className="text-green-600 font-bold text-sm">
                            {terrain.prix_heure.toLocaleString()}
                          </div>
                          <div className="text-gray-500">FCFA/h</div>
                        </>
                      )}
                      <div className="px-2 py-1 rounded-full bg-green-100 text-green-800 font-medium">
                        {terrain.est_actif ? 'Ouvert' : 'Fermé'}
                            </div>
                            </div>
                          </div>
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                window.location.href = `/users/terrain/${terrain.id}`;
                              }}
                              className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold transition-colors"
                            >
                              📋 Créneaux
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(`https://www.google.com/maps/dir/?api=1&destination=${Number(terrain.latitude)},${Number(terrain.longitude)}`, '_blank');
                              }}
                              className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-green-500 hover:bg-green-600 text-white text-xs font-semibold transition-colors"
                            >
                              🗺️ Itinéraire
                            </button>
                          </div>
                        </div>
              ))}

              {!loading && sortedTerrains.length === 0 && (
                <div className="text-center text-sm text-gray-500 py-8">
                  Aucun terrain ne correspond à la recherche.
                      </div>
              )}
                    </div>
              </div>
            </div>
          </div>
    </div>
  );
};

export default MapPage;