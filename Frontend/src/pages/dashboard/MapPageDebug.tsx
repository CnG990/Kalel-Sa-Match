import React, { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Token Mapbox
const MAPBOX_TOKEN = 'pk.eyJ1IjoiY2hlaWtobmdvbTk5IiwiYSI6ImNtYjR5c2NieTF2eXYyaXNia3FmdWd5OTYifQ.yi91YsGpTzlsDA9ljYp8DQ';

interface Terrain {
  id: number;
  nom: string;
  adresse: string;
  latitude: number;
  longitude: number;
  prix_heure: number;
  est_actif: boolean;
}

const MapPageDebug: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [terrains, setTerrains] = useState<Terrain[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [markersCount, setMarkersCount] = useState(0);

  // Fonction pour ajouter un log
  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage);
    setLogs(prev => [...prev.slice(-10), logMessage]); // Garder les 10 derniers logs
  };

  // Initialisation de la carte
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    addLog('🚀 Début initialisation carte');

    try {
      mapboxgl.accessToken = MAPBOX_TOKEN;
      addLog('✅ Token Mapbox configuré');

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [-17.4441, 14.6928], // Dakar
        zoom: 11
      });

      addLog('✅ Carte Mapbox créée');

      map.current.on('load', () => {
        addLog('🎉 Carte chargée - début chargement terrains');
        loadTerrainsAndAddMarkers();
      });

      map.current.on('error', (e) => {
        addLog(`❌ Erreur carte: ${e.error.message}`);
      });

    } catch (err) {
      addLog(`❌ Erreur création carte: ${err instanceof Error ? err.message : 'Erreur inconnue'}`);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Chargement des terrains et ajout immédiat des marqueurs
  const loadTerrainsAndAddMarkers = async () => {
    try {
      addLog('📡 Appel API terrains...');
      
              const response = await fetch('https://kalel-sa-match-backend.onrender.com/api/terrains/all-for-map');
      addLog(`📡 Réponse API: ${response.status}`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      addLog(`📊 Données reçues: ${data.data?.length || 0} terrains`);

      if (data.success && Array.isArray(data.data)) {
        setTerrains(data.data);
        addLog('✅ Terrains stockés dans state');

        // Ajouter les marqueurs IMMÉDIATEMENT
        forceAddMarkers(data.data);
      } else {
        addLog('❌ Format données invalide');
      }
    } catch (err) {
      addLog(`❌ Erreur API: ${err instanceof Error ? err.message : 'Erreur inconnue'}`);
    }
  };

  // Forcer l'ajout des marqueurs avec logs détaillés
  const forceAddMarkers = (terrainsData: Terrain[]) => {
    if (!map.current) {
      addLog('❌ Carte non disponible pour marqueurs');
      return;
    }

    addLog(`🎯 FORÇAGE ajout de ${terrainsData.length} marqueurs`);

    let successCount = 0;

    terrainsData.forEach((terrain, index) => {
      try {
        const lat = Number(terrain.latitude);
        const lng = Number(terrain.longitude);

        addLog(`📍 Terrain ${index + 1}: ${terrain.nom} [${lng}, ${lat}]`);

        if (isNaN(lat) || isNaN(lng)) {
          addLog(`❌ Coordonnées invalides: ${terrain.nom}`);
          return;
        }

        // Créer un élément HTML personnalisé pour le marqueur
        const el = document.createElement('div');
        el.style.cssText = `
          width: 30px;
          height: 30px;
          background-color: ${terrain.est_actif ? '#22c55e' : '#ef4444'};
          border: 2px solid white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 12px;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          z-index: 1000;
        `;
        el.textContent = (index + 1).toString();

        // Créer le marqueur avec élément personnalisé
        new mapboxgl.Marker({
          element: el,
          anchor: 'center'
        })
          .setLngLat([lng, lat])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 })
              .setHTML(`
                <div style="padding: 10px;">
                  <h3 style="margin: 0 0 5px 0; font-size: 14px;">${terrain.nom}</h3>
                  <p style="margin: 0 0 5px 0; font-size: 12px;">${terrain.adresse}</p>
                  <p style="margin: 0; color: green; font-weight: bold;">${terrain.prix_heure} FCFA/h</p>
                </div>
              `)
          )
          .addTo(map.current!);

        successCount++;
        addLog(`✅ Marqueur ${index + 1} ajouté: ${terrain.nom}`);

        // Ajouter un listener de clic
        el.addEventListener('click', () => {
          addLog(`🎯 Clic sur terrain: ${terrain.nom}`);
        });

      } catch (err) {
        addLog(`❌ Erreur marqueur ${terrain.nom}: ${err instanceof Error ? err.message : 'Erreur inconnue'}`);
      }
    });

    setMarkersCount(successCount);
    addLog(`🎉 TOTAL: ${successCount}/${terrainsData.length} marqueurs ajoutés`);

    // Centrer la vue sur tous les marqueurs
    if (successCount > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      terrainsData.forEach(terrain => {
        bounds.extend([terrain.longitude, terrain.latitude]);
      });
      map.current?.fitBounds(bounds, { padding: 50 });
      addLog('📐 Vue ajustée sur tous les marqueurs');
    }
  };

  // Fonction pour forcer le rechargement des marqueurs
  const forceReload = () => {
    if (terrains.length > 0) {
      addLog('🔄 FORCE RELOAD des marqueurs');
      forceAddMarkers(terrains);
    } else {
      addLog('🔄 FORCE RELOAD complet');
      loadTerrainsAndAddMarkers();
    }
  };

  return (
    <div className="relative h-screen w-full flex">
      {/* Carte */}
      <div ref={mapContainer} className="w-2/3 h-full" />

      {/* Panel de debug */}
      <div className="w-1/3 bg-white border-l border-gray-300 flex flex-col">
        {/* En-tête */}
        <div className="p-4 border-b border-gray-200 bg-blue-50">
          <h2 className="text-lg font-bold text-blue-800 mb-2">
            🐛 MODE DEBUG
          </h2>
          <div className="text-sm space-y-1">
            <div>Terrains: {terrains.length}</div>
            <div>Marqueurs: {markersCount}</div>
            <div>Carte: {map.current ? '✅' : '❌'}</div>
          </div>
          <button
            onClick={forceReload}
            className="mt-3 w-full bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm font-semibold"
          >
            🔄 FORCE RELOAD
          </button>
        </div>

        {/* Logs en temps réel */}
        <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
          <h3 className="font-semibold mb-2 text-gray-800">📋 Logs temps réel:</h3>
          <div className="space-y-1">
            {logs.map((log, index) => (
              <div
                key={index}
                className={`text-xs p-2 rounded ${
                  log.includes('❌') ? 'bg-red-100 text-red-800' :
                  log.includes('✅') ? 'bg-green-100 text-green-800' :
                  log.includes('🎉') ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-700'
                }`}
              >
                {log}
              </div>
            ))}
          </div>
        </div>

        {/* Liste des terrains */}
        {terrains.length > 0 && (
          <div className="p-4 border-t border-gray-200 max-h-60 overflow-y-auto">
            <h3 className="font-semibold mb-2">🏟️ Terrains chargés:</h3>
            <div className="space-y-1">
              {terrains.map((terrain, index) => (
                <div key={terrain.id} className="text-xs p-2 bg-white border rounded">
                  <div className="font-semibold">{index + 1}. {terrain.nom}</div>
                  <div className="text-gray-600">
                    Lat: {terrain.latitude}, Lng: {terrain.longitude}
                  </div>
                  <div className={`text-xs ${terrain.est_actif ? 'text-green-600' : 'text-red-600'}`}>
                    {terrain.est_actif ? '✅ Actif' : '❌ Inactif'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapPageDebug; 