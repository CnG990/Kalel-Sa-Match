import React, { useEffect, useMemo, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import type { FeatureCollection, LineString, Polygon } from 'geojson';
import toast from 'react-hot-toast';
import { MapPin, LocateFixed, RefreshCw, Undo2 } from 'lucide-react';
import apiService from '../../services/api';

import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN ?? '';

interface AddTerrainOnSiteModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

interface Coordinate {
  lng: number;
  lat: number;
}

const defaultCenter: Coordinate = { lng: -17.4572, lat: 14.6937 };

const metersCoordinates = (coords: [number, number][]) => {
  if (coords.length === 0) {
    return [] as { x: number; y: number }[];
  }
  const latMean = coords.reduce((sum, [, lat]) => sum + lat, 0) / coords.length;
  const cosLat = Math.cos((latMean * Math.PI) / 180);
  const earthRadius = 6378137; // metres

  return coords.map(([lng, lat]) => ({
    x: (lng * Math.PI) / 180 * earthRadius * cosLat,
    y: (lat * Math.PI) / 180 * earthRadius,
  }));
};

const computePolygonArea = (coords: [number, number][]) => {
  if (coords.length < 3) return 0;
  const points = metersCoordinates(coords);
  let sum = 0;
  for (let i = 0; i < points.length; i += 1) {
    const current = points[i];
    const next = points[(i + 1) % points.length];
    sum += current.x * next.y - next.x * current.y;
  }
  return Math.abs(sum / 2);
};

const computeCentroid = (coords: [number, number][]) => {
  if (coords.length === 0) return null;
  if (coords.length === 1) return coords[0];
  const area = computePolygonArea(coords);
  if (area === 0) {
    const [lngSum, latSum] = coords.reduce(
      (acc, value) => [acc[0] + value[0], acc[1] + value[1]],
      [0, 0],
    );
    return [lngSum / coords.length, latSum / coords.length] as [number, number];
  }

  let cx = 0;
  let cy = 0;
  const points = coords;
  for (let i = 0; i < points.length; i += 1) {
    const [x0, y0] = points[i];
    const [x1, y1] = points[(i + 1) % points.length];
    const factor = x0 * y1 - x1 * y0;
    cx += (x0 + x1) * factor;
    cy += (y0 + y1) * factor;
  }
  const polygonArea = area * 6;
  return [cx / polygonArea, cy / polygonArea] as [number, number];
};

const AddTerrainOnSiteModal: React.FC<AddTerrainOnSiteModalProps> = ({ onClose, onSuccess }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const [polygonCoords, setPolygonCoords] = useState<[number, number][]>([]);
  const [pointCoords, setPointCoords] = useState<Coordinate | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    nom: '',
    description: '',
    adresse: '',
    prix_heure: '',
    capacite: '',
  });

  const hasGeometry = polygonCoords.length >= 3;
  const polygonArea = useMemo(() => computePolygonArea(polygonCoords), [polygonCoords]);

  useEffect(() => {
    if (!containerRef.current) return;

    if (!mapboxgl.accessToken) {
      toast.error('Clé Mapbox manquante. Ajoutez VITE_MAPBOX_TOKEN dans le fichier .env');
      return;
    }

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [defaultCenter.lng, defaultCenter.lat],
      zoom: 12,
    });
    mapRef.current = map;
    map.addControl(new mapboxgl.NavigationControl());

    const handleMapLoad = () => {
      if (map.getSource('onsite-shape')) return;
      const emptyCollection: FeatureCollection = { type: 'FeatureCollection', features: [] };
      map.addSource('onsite-shape', {
        type: 'geojson',
        data: emptyCollection,
      });

      map.addLayer({
        id: 'onsite-polygon-fill',
        type: 'fill',
        source: 'onsite-shape',
        paint: {
          'fill-color': '#16a34a',
          'fill-opacity': 0.3,
        },
        filter: ['==', '$type', 'Polygon'],
      });

      map.addLayer({
        id: 'onsite-polygon-line',
        type: 'line',
        source: 'onsite-shape',
        paint: {
          'line-color': '#16a34a',
          'line-width': 2,
        },
      });
    };

    const handleClick = (event: mapboxgl.MapMouseEvent) => {
      const { lng, lat } = event.lngLat;
      setPolygonCoords((prev) => {
        const next = [...prev, [lng, lat] as [number, number]];
        drawPolygon(next);
        return next;
      });
    };

    map.on('load', handleMapLoad);
    map.on('click', handleClick);

    return () => {
      map.off('load', handleMapLoad);
      map.off('click', handleClick);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  const buildFeatureCollection = (coords: [number, number][]): FeatureCollection => {
    if (coords.length >= 3) {
      const closed = [...coords, coords[0]];
      return {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'Polygon',
              coordinates: [closed],
            } as Polygon,
          },
        ],
      };
    }

    if (coords.length === 2) {
      return {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: coords,
            } as LineString,
          },
        ],
      };
    }

    return { type: 'FeatureCollection', features: [] };
  };

  const drawPolygon = (coords: [number, number][]) => {
    const map = mapRef.current;
    if (!map) return;
    const source = map.getSource('onsite-shape') as mapboxgl.GeoJSONSource | undefined;
    if (!source) return;
    source.setData(buildFeatureCollection(coords));
  };

  const centerOnUser = () => {
    if (!navigator.geolocation) {
      toast.error('Géolocalisation indisponible sur ce navigateur');
      return;
    }
    toast.loading('Recherche de votre position...', { id: 'geo' });
    navigator.geolocation.getCurrentPosition(
      (position) => {
        toast.dismiss('geo');
        const { latitude, longitude } = position.coords;
        setPointCoords({ lat: latitude, lng: longitude });
        updateMarker(longitude, latitude);
        mapRef.current?.flyTo({ center: [longitude, latitude], zoom: 15 });
      },
      () => {
        toast.dismiss('geo');
        toast.error('Impossible de récupérer votre position');
      },
      { enableHighAccuracy: true, timeout: 12000 },
    );
  };

  const updateMarker = (lng: number, lat: number) => {
    const map = mapRef.current;
    if (!map) return;
    if (!markerRef.current) {
      markerRef.current = new mapboxgl.Marker({ color: '#16a34a' })
        .setLngLat([lng, lat])
        .addTo(map);
    } else {
      markerRef.current.setLngLat([lng, lat]);
    }
  };

  const resetPolygon = () => {
    setPolygonCoords([]);
    drawPolygon([]);
  };

  const handleFormChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!form.nom || !form.adresse || !form.prix_heure || !form.capacite) {
      toast.error('Tous les champs obligatoires doivent être remplis');
      return;
    }

    const numericPrice = parseFloat(form.prix_heure);
    const numericCapacity = parseInt(form.capacite, 10);
    if (Number.isNaN(numericPrice) || Number.isNaN(numericCapacity)) {
      toast.error('Prix ou capacité invalide');
      return;
    }

    const polygon = hasGeometry ? [...polygonCoords, polygonCoords[0]] : null;
    const centroid = hasGeometry ? computeCentroid(polygonCoords) : null;
    const point = pointCoords ?? (centroid ? { lng: centroid[0], lat: centroid[1] } : null);

    if (!point) {
      toast.error('Ajoutez au moins un point GPS ou dessinez le contour du terrain');
      return;
    }

    try {
      setIsSaving(true);
      const { data, meta } = await apiService.createAdminTerrain({
        nom: form.nom,
        description: form.description,
        adresse: form.adresse,
        prix_heure: numericPrice,
        capacite: numericCapacity,
        latitude: point.lat,
        longitude: point.lng,
        geometry: polygon ? { type: 'Polygon', coordinates: [polygon] } : undefined,
        surface_calculee: polygonArea ? Math.round(polygonArea) : undefined,
        source_creation: 'field',
      });

      if (!data) {
        toast.error(meta.message || "Impossible d'ajouter ce terrain");
        return;
      }

      toast.success(meta.message || 'Terrain ajouté depuis le terrain');
      onSuccess();
      onClose();
    } catch (error) {
      toast.error((error as Error).message || "Erreur lors de l'ajout");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h3 className="text-2xl font-semibold text-gray-900 flex items-center gap-3">
              <MapPin className="w-6 h-6 text-green-600" />
              Ajouter un terrain sur place
            </h3>
            <p className="text-sm text-gray-500">
              Géolocalisez-vous, dessinez le contour du terrain et remplissez les informations clés.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
            aria-label="Fermer"
          >
            ×
          </button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 p-6 flex-1 overflow-y-auto">
          <div className="space-y-4">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={centerOnUser}
                className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <LocateFixed className="w-4 h-4" />
                Ma position
              </button>
              <button
                type="button"
                onClick={resetPolygon}
                className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                <Undo2 className="w-4 h-4" />
                Effacer le contour
              </button>
            </div>

            <div className="h-96 rounded-xl overflow-hidden border" ref={containerRef} />
            <p className="text-sm text-gray-500">
              Cliquez sur la carte pour tracer le contour. Minimum 3 points pour valider un polygone.
            </p>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1 text-green-700">
                <RefreshCw className="w-4 h-4" />
                {polygonCoords.length} point{polygonCoords.length > 1 ? 's' : ''}
              </div>
              {hasGeometry && (
                <div>
                  Surface estimée : <span className="font-semibold">{Math.round(polygonArea).toLocaleString('fr-FR')} m²</span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nom du terrain *</label>
              <input
                name="nom"
                value={form.nom}
                onChange={handleFormChange}
                className="w-full mt-1 rounded-lg border-gray-300 focus:ring-green-600 focus:border-green-600"
                placeholder="Ex: Terrain Cité Keur Gorgui"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Adresse *</label>
              <input
                name="adresse"
                value={form.adresse}
                onChange={handleFormChange}
                className="w-full mt-1 rounded-lg border-gray-300 focus:ring-green-600 focus:border-green-600"
                placeholder="Commune, repère, ville"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleFormChange}
                rows={3}
                className="w-full mt-1 rounded-lg border-gray-300 focus:ring-green-600 focus:border-green-600"
                placeholder="Équipements, type de pelouse, remarques..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Prix / heure (FCFA) *</label>
                <input
                  name="prix_heure"
                  value={form.prix_heure}
                  onChange={handleFormChange}
                  type="number"
                  min="0"
                  className="w-full mt-1 rounded-lg border-gray-300 focus:ring-green-600 focus:border-green-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Capacité joueurs *</label>
                <input
                  name="capacite"
                  value={form.capacite}
                  onChange={handleFormChange}
                  type="number"
                  min="1"
                  className="w-full mt-1 rounded-lg border-gray-300 focus:ring-green-600 focus:border-green-600"
                />
              </div>
            </div>
            <div className="rounded-lg border border-dashed border-green-200 bg-green-50 p-4 text-sm text-green-800">
              <p className="font-medium">Astuce terrain</p>
              <p>
                Cliquez sur « Ma position » pour enregistrer vos coordonnées GPS. Ensuite, ajoutez au moins
                trois points sur la carte pour dessiner le contour exact du terrain.
              </p>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={handleSubmit}
                className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
              >
                {isSaving ? 'Enregistrement…' : 'Enregistrer le terrain'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddTerrainOnSiteModal;
