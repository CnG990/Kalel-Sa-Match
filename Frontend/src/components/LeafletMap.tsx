import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Navigation, Layers, Filter } from 'lucide-react';

// Fix Leaflet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface Terrain {
  id: number;
  nom: string;
  adresse: string;
  latitude: number;
  longitude: number;
  prix_heure: number;
  capacite: number;
  statut_reservation?: 'libre' | 'reserve';
  est_actif: boolean;
  distance?: number;
}

interface LeafletMapProps {
  terrains: Terrain[];
  center?: [number, number];
  zoom?: number;
  onTerrainClick?: (terrain: Terrain) => void;
  showUserLocation?: boolean;
  // enableClustering?: boolean; // TODO: Future feature
}

const MAP_LAYERS = {
  osm: {
    name: 'OpenStreetMap',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  },
  esri: {
    name: 'ESRI Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri',
  },
  topo: {
    name: 'OpenTopoMap',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: 'Map data: &copy; OpenStreetMap, SRTM | Map style: &copy; OpenTopoMap',
  },
};

export const LeafletMap: React.FC<LeafletMapProps> = ({
  terrains,
  center = [14.7167, -17.4677], // Dakar par défaut
  zoom = 12,
  onTerrainClick,
  showUserLocation = true,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const [currentLayer, setCurrentLayer] = useState<keyof typeof MAP_LAYERS>('osm');
  const [filterStatus, setFilterStatus] = useState<'all' | 'libre' | 'reserve'>('all');
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  // Initialiser la carte
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current).setView(center, zoom);
    
    // Ajouter la couche OSM par défaut
    L.tileLayer(MAP_LAYERS.osm.url, {
      attribution: MAP_LAYERS.osm.attribution,
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Géolocalisation utilisateur
  useEffect(() => {
    if (!showUserLocation || !mapInstanceRef.current) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const userPos: [number, number] = [latitude, longitude];
        setUserLocation(userPos);

        if (mapInstanceRef.current) {
          // Icône personnalisée pour l'utilisateur
          const userIcon = L.divIcon({
            html: `<div style="background: #3b82f6; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
            className: 'user-location-marker',
            iconSize: [20, 20],
          });

          userMarkerRef.current = L.marker(userPos, { icon: userIcon })
            .addTo(mapInstanceRef.current)
            .bindPopup('<b>Votre position</b>');

          // Centrer sur l'utilisateur
          mapInstanceRef.current.setView(userPos, 14);
        }
      },
      (error) => {
        console.warn('Géolocalisation refusée:', error);
      }
    );
  }, [showUserLocation]);

  // Changer de fond de carte
  const changeLayer = (layerKey: keyof typeof MAP_LAYERS) => {
    if (!mapInstanceRef.current) return;

    // Supprimer l'ancienne couche
    mapInstanceRef.current.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        mapInstanceRef.current!.removeLayer(layer);
      }
    });

    // Ajouter la nouvelle couche
    const selectedLayer = MAP_LAYERS[layerKey];
    L.tileLayer(selectedLayer.url, {
      attribution: selectedLayer.attribution,
      maxZoom: 19,
    }).addTo(mapInstanceRef.current);

    setCurrentLayer(layerKey);
  };

  // Afficher les terrains
  useEffect(() => {
    if (!mapInstanceRef.current || !terrains.length) return;

    // Supprimer les anciens markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Filtrer les terrains
    const filteredTerrains = terrains.filter(terrain => {
      if (filterStatus === 'all') return true;
      return terrain.statut_reservation === filterStatus;
    });

    // Créer les nouveaux markers
    filteredTerrains.forEach((terrain) => {
      if (!terrain.latitude || !terrain.longitude) return;

      const isLibre = terrain.statut_reservation === 'libre';
      const color = isLibre ? '#10b981' : '#ef4444';

      const customIcon = L.divIcon({
        html: `
          <div style="position: relative;">
            <svg width="32" height="40" viewBox="0 0 24 32" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 0C7.58 0 4 3.58 4 8c0 5.5 8 13 8 13s8-7.5 8-13c0-4.42-3.58-8-8-8z" 
                    fill="${color}" stroke="white" stroke-width="1.5"/>
              <circle cx="12" cy="8" r="3" fill="white"/>
            </svg>
            ${terrain.distance ? `
              <div style="position: absolute; top: -8px; right: -8px; background: white; border-radius: 12px; padding: 2px 6px; font-size: 10px; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                ${terrain.distance.toFixed(1)}km
              </div>
            ` : ''}
          </div>
        `,
        className: 'terrain-marker',
        iconSize: [32, 40],
        iconAnchor: [16, 40],
        popupAnchor: [0, -40],
      });

      const marker = L.marker([terrain.latitude, terrain.longitude], { icon: customIcon })
        .addTo(mapInstanceRef.current!)
        .bindPopup(`
          <div style="min-width: 200px;">
            <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold;">${terrain.nom}</h3>
            <p style="margin: 4px 0; font-size: 13px; color: #666;">📍 ${terrain.adresse}</p>
            <p style="margin: 4px 0; font-size: 13px; color: #666;">💰 ${terrain.prix_heure} FCFA/h</p>
            <p style="margin: 4px 0; font-size: 13px; color: #666;">👥 Capacité: ${terrain.capacite}</p>
            <p style="margin: 8px 0 4px 0;">
              <span style="display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: bold; background: ${color}; color: white;">
                ${isLibre ? '✓ LIBRE' : '✗ RÉSERVÉ'}
              </span>
            </p>
            ${terrain.distance ? `<p style="margin: 4px 0; font-size: 12px; color: #888;">📏 ${terrain.distance.toFixed(2)} km</p>` : ''}
          </div>
        `);

      if (onTerrainClick) {
        marker.on('click', () => onTerrainClick(terrain));
      }

      markersRef.current.push(marker);
    });

    // Auto-zoom pour afficher tous les markers
    if (markersRef.current.length > 0) {
      const group = L.featureGroup(markersRef.current);
      mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1));
    }
  }, [terrains, filterStatus, onTerrainClick]);

  const centrerSurUtilisateur = () => {
    if (userLocation && mapInstanceRef.current) {
      mapInstanceRef.current.setView(userLocation, 15);
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Carte */}
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />

      {/* Contrôles supérieurs */}
      <div style={{
        position: 'absolute',
        top: '16px',
        right: '16px',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}>
        {/* Changeur de couche */}
        <div style={{
          background: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          padding: '8px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Layers size={16} />
            <span style={{ fontSize: '12px', fontWeight: 'bold' }}>Fond de carte</span>
          </div>
          {Object.entries(MAP_LAYERS).map(([key, layer]) => (
            <button
              key={key}
              onClick={() => changeLayer(key as keyof typeof MAP_LAYERS)}
              style={{
                display: 'block',
                width: '100%',
                padding: '8px',
                marginBottom: '4px',
                border: 'none',
                borderRadius: '4px',
                background: currentLayer === key ? '#3b82f6' : '#f3f4f6',
                color: currentLayer === key ? 'white' : '#374151',
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {layer.name}
            </button>
          ))}
        </div>

        {/* Filtre statut */}
        <div style={{
          background: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          padding: '8px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Filter size={16} />
            <span style={{ fontSize: '12px', fontWeight: 'bold' }}>Filtrer</span>
          </div>
          {[
            { value: 'all', label: 'Tous', color: '#6b7280' },
            { value: 'libre', label: 'Libres', color: '#10b981' },
            { value: 'reserve', label: 'Réservés', color: '#ef4444' },
          ].map((filter) => (
            <button
              key={filter.value}
              onClick={() => setFilterStatus(filter.value as any)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                width: '100%',
                padding: '8px',
                marginBottom: '4px',
                border: 'none',
                borderRadius: '4px',
                background: filterStatus === filter.value ? filter.color : '#f3f4f6',
                color: filterStatus === filter.value ? 'white' : '#374151',
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: filter.color,
              }} />
              {filter.label}
            </button>
          ))}
        </div>

        {/* Bouton position utilisateur */}
        {showUserLocation && userLocation && (
          <button
            onClick={centrerSurUtilisateur}
            style={{
              background: 'white',
              border: 'none',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              padding: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Centrer sur ma position"
          >
            <Navigation size={20} color="#3b82f6" />
          </button>
        )}
      </div>

      {/* Statistiques */}
      <div style={{
        position: 'absolute',
        bottom: '16px',
        left: '16px',
        zIndex: 1000,
        background: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        padding: '12px 16px',
        display: 'flex',
        gap: '16px',
        fontSize: '13px',
      }}>
        <div>
          <span style={{ fontWeight: 'bold', color: '#6b7280' }}>Total: </span>
          <span style={{ fontWeight: 'bold' }}>{terrains.length}</span>
        </div>
        <div>
          <span style={{ fontWeight: 'bold', color: '#10b981' }}>Libres: </span>
          <span style={{ fontWeight: 'bold' }}>
            {terrains.filter(t => t.statut_reservation === 'libre').length}
          </span>
        </div>
        <div>
          <span style={{ fontWeight: 'bold', color: '#ef4444' }}>Réservés: </span>
          <span style={{ fontWeight: 'bold' }}>
            {terrains.filter(t => t.statut_reservation === 'reserve').length}
          </span>
        </div>
      </div>
    </div>
  );
};

export default LeafletMap;
