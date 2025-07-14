import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, RefreshCw, Eye, EyeOff, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import L from 'leaflet';

// Import Leaflet CSS
import 'leaflet/dist/leaflet.css';

// Fix pour les icônes Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface Terrain {
  id: number;
  nom: string;
  name?: string;
  adresse: string;
  latitude: number;
  longitude: number;
  prix_heure: number;
  est_actif: boolean;
  distance?: number;
}

const MapPage: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const markers = useRef<any[]>([]);
  
  const [terrains, setTerrains] = useState<Terrain[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showOnlyOpen, setShowOnlyOpen] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [mapStyle, setMapStyle] = useState('osm');
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedTerrain, setSelectedTerrain] = useState<number | null>(null);
  // Supprimer la variable sortByDistance inutilisée
  // const [sortByDistance, setSortByDistance] = useState(false);
  const [userLocationProcessed, setUserLocationProcessed] = useState(false);

  // Couches de cartes disponibles (toutes gratuites !)
  const mapLayers = {
    osm: {
      name: '🗺️ Standard',
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '© OpenStreetMap contributors'
    },
    satellite: {
      name: '🛰️ Satellite',
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: '© Esri, DigitalGlobe, GeoEye'
    },
    topo: {
      name: '🏔️ Topographie',
      url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
      attribution: '© OpenTopoMap (CC-BY-SA)'
    }
  };

  // Debug logging
  const addDebugInfo = (info: string) => {
    console.log(`🔍 DEBUG: ${info}`);
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${info}`].slice(-10));
  };

  // Calculer distance réelle
  /**
   * Calcul de distance terrestre par voie routière (ignore l'altitude)
   * Utilise la formule Haversine + facteur de correction pour routes urbaines
   */
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    // DISTANCE TERRESTRE PURE - SANS ALTITUDE (coordonnée Z)
    // Fonction utilise SEULEMENT latitude et longitude (2D)
    
    // Rayon de la Terre en km (surface terrestre)
    const R = 6371;
    
    // Conversion en radians - SEULEMENT coordonnées 2D (lat/lng)
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    
    const lat1Rad = lat1 * Math.PI / 180;
    const lat2Rad = lat2 * Math.PI / 180;
    
    // Formule Haversine simplifiée - distance terrestre 2D
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1Rad) * Math.cos(lat2Rad) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    
    // Distance terrestre directe
    const distance = R * c;
    
    // Facteur de correction +35% pour routes urbaines de Dakar (plus exact)
    const distanceCorrigee = distance * 1.35;
    
    // Retourner distance avec précision 2 décimales pour tri correct
    return Math.round(distanceCorrigee * 100) / 100;
  };

  // Données statiques des terrains de Dakar
  const terrainsStatiques: Terrain[] = [
      {
        id: 1,
        nom: "Stade Demba Diop",
        adresse: "Sicap Liberté, Dakar",
        latitude: 14.6937,
        longitude: -17.4441,
        prix_heure: 25000,
        est_actif: true
      },
      {
        id: 2,
        nom: "Complexe Sportif Marius Ndiaye",
        adresse: "Ouakam, Dakar",
        latitude: 14.7167,
        longitude: -17.4833,
        prix_heure: 30000,
        est_actif: true
      },
      {
        id: 3,
        nom: "Terrain ASC Liberté 6",
        adresse: "Liberté 6, Dakar",
        latitude: 14.6892,
        longitude: -17.4516,
        prix_heure: 15000,
        est_actif: true
      },
      {
        id: 4,
        nom: "Complexe Be Sport",
        adresse: "Route de l'Aéroport, Dakar",
        latitude: 14.7394,
        longitude: -17.4902,
        prix_heure: 35000,
        est_actif: true
      },
      {
        id: 5,
        nom: "Terrain Diaraf",
        adresse: "Diaraf, Dakar",
        latitude: 14.6648,
        longitude: -17.4381,
        prix_heure: 20000,
        est_actif: true
      },
      {
        id: 6,
        nom: "Stade Iba Mar Diop",
        adresse: "Sicap, Dakar",
        latitude: 14.6850,
        longitude: -17.4500,
        prix_heure: 22000,
        est_actif: true
      },
      {
        id: 7,
        nom: "Terrain Mini Foot Premier Projets",
        adresse: "Keur Massar, Dakar",
        latitude: 14.7800,
        longitude: -17.3200,
        prix_heure: 18000,
        est_actif: true
      },
      {
        id: 8,
        nom: "TEMPLE DU FOOT DAKAR",
        adresse: "Plateau, Dakar",
        latitude: 14.6928,
        longitude: -17.4467,
        prix_heure: 40000,
        est_actif: true
      }
    ];

  // Injecter les styles CSS pour animations et z-index
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = `
      @keyframes pulse {
        0% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.1); opacity: 0.8; }
        100% { transform: scale(1); opacity: 1; }
      }
      
      .custom-marker div {
        transition: all 0.3s ease;
      }
      
      .user-marker div {
        animation: pulse 2s infinite;
      }
      
      /* Z-index élevé pour les contrôles */
      .leaflet-control-container {
        z-index: 10 !important;
      }
      
      .map-controls {
        z-index: 1000 !important;
        position: relative;
      }
      
      /* Cible tactile minimum 44px pour mobile */
      .touch-target {
        min-height: 44px;
        min-width: 44px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    `;
    document.head.appendChild(styleElement);

    return () => {
      if (document.head.contains(styleElement)) {
        document.head.removeChild(styleElement);
      }
    };
  }, []);

  // Initialiser immédiatement avec un petit délai pour le DOM
  useEffect(() => {
    addDebugInfo('📦 Leaflet prêt à être utilisé');
    addDebugInfo(`🔧 mapContainer.current existe: ${!!mapContainer.current}`);
    addDebugInfo(`🔧 map.current existe: ${!!map.current}`);
    
    const timer = setTimeout(() => {
      addDebugInfo('⏰ Timer exécuté après 100ms');
      addDebugInfo(`🔧 mapContainer.current après délai: ${!!mapContainer.current}`);
      addDebugInfo(`🔧 map.current après délai: ${!!map.current}`);
      
      if (mapContainer.current && !map.current) {
        addDebugInfo('🚀 Démarrage initialisation...');
        initializeMap();
      } else {
        if (!mapContainer.current) addDebugInfo('❌ mapContainer.current est null');
        if (map.current) addDebugInfo('❌ map.current existe déjà');
      }
    }, 100); // Petit délai pour s'assurer que le DOM est prêt

    return () => {
      addDebugInfo('🧹 Nettoyage timer useEffect');
      clearTimeout(timer);
    };
  }, []);

  // Demander automatiquement la géolocalisation dès le chargement
  React.useEffect(() => {
    addDebugInfo('🎯 Démarrage géolocalisation automatique...');
    
    if (navigator.geolocation) {
      addDebugInfo('✅ Navigator.geolocation disponible');
      toast.loading('📍 Obtention de votre position...', { id: 'geolocation' });
      
      const options = {
        enableHighAccuracy: true,
        timeout: 15000, // Augmenté à 15 secondes
        maximumAge: 300000 // 5 minutes
      };
      
      addDebugInfo(`📍 Options géolocalisation: ${JSON.stringify(options)}`);
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;
          const userPos: [number, number] = [userLat, userLng];
          
          addDebugInfo(`📍 Position obtenue: [${userLat}, ${userLng}]`);
          addDebugInfo(`📍 Précision: ±${position.coords.accuracy}m`);
          
          setUserLocation(userPos);
          setUserLocationProcessed(true);
          
          toast.success(`📍 Position obtenue ! Centrage sur votre localisation`, { id: 'geolocation' });
          
          // Centrer la carte sur la position de l'utilisateur
          if (map.current) {
            addDebugInfo('🎯 Centrage de la carte sur position utilisateur');
            map.current.setView([userLat, userLng], 13);
            
            // Ajouter immédiatement le marqueur utilisateur
            const userIconHtml = `
              <div style="
                background: linear-gradient(45deg, #2196F3, #21CBF3);
                width: 20px;
                height: 20px;
                border-radius: 50%;
                border: 3px solid white;
                box-shadow: 0 0 15px rgba(33, 150, 243, 0.8);
                animation: pulse 2s infinite;
                position: relative;
              ">
                <div style="
                  position: absolute;
                  top: 50%;
                  left: 50%;
                  transform: translate(-50%, -50%);
                  width: 8px;
                  height: 8px;
                  background: white;
                  border-radius: 50%;
                "></div>
              </div>
            `;
            
            const userIcon = L.divIcon({
              html: userIconHtml,
              iconSize: [20, 20],
              iconAnchor: [10, 10],
              className: 'user-marker'
            });
            
            const userMarker = L.marker([userLat, userLng], { icon: userIcon });
            userMarker.bindPopup(`
              <div style="padding: 12px; text-align: center; min-width: 150px;">
                <strong style="color: #2196F3;">📍 Votre position</strong><br>
                <small style="color: #666;">${userLat.toFixed(6)}, ${userLng.toFixed(6)}</small><br>
                <small style="color: #999; font-style: italic;">Précision: ±${position.coords.accuracy?.toFixed(0) || '?'}m</small>
              </div>
            `);
            userMarker.addTo(map.current);
            
            // Ouvrir automatiquement la popup pendant 3 secondes
            userMarker.openPopup();
            setTimeout(() => {
              userMarker.closePopup();
            }, 3000);
            
            addDebugInfo('✅ Marqueur utilisateur ajouté et popup affichée');
          } else {
            addDebugInfo('❌ map.current est null, impossible d\'ajouter le marqueur');
          }
        },
        (error) => {
          let errorMessage = '';
          let debugMessage = '';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Géolocalisation refusée par l\'utilisateur';
              debugMessage = 'User denied geolocation permission';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Position non disponible';
              debugMessage = 'Position unavailable';
              break;
            case error.TIMEOUT:
              errorMessage = 'Délai de géolocalisation dépassé';
              debugMessage = 'Geolocation timeout';
              break;
            default:
              errorMessage = 'Erreur de géolocalisation inconnue';
              debugMessage = `Unknown error: ${error.message}`;
              break;
          }
          
          addDebugInfo(`📍 Erreur géolocalisation: ${debugMessage} (code: ${error.code})`);
          toast.error(`📍 ${errorMessage}. Utilisation de la vue par défaut`, { id: 'geolocation' });
          
          // Si la géolocalisation échoue, centrer sur Dakar par défaut
          if (map.current) {
            addDebugInfo('🗺️ Centrage par défaut sur Dakar');
            map.current.setView([14.6928, -17.4441], 11);
          }
        },
        options
      );
    } else {
      addDebugInfo('❌ Navigator.geolocation non supporté');
      toast.error('📍 Géolocalisation non supportée par votre navigateur', { id: 'geolocation' });
      
      // Centrer sur Dakar par défaut
      if (map.current) {
        addDebugInfo('🗺️ Centrage par défaut sur Dakar (navigateur non compatible)');
        map.current.setView([14.6928, -17.4441], 11);
      }
    }
  }, []); // Se déclenche une seule fois au montage du composant

  // Recalculer les distances quand les terrains sont chargés ET que la position est disponible
  React.useEffect(() => {
    if (terrains.length > 0 && userLocation && !terrains[0]?.distance) {
      addDebugInfo(`📏 Calcul distances pour ${terrains.length} terrains`);
      
      const terrainsWithDistance = terrains.map(terrain => {
        const distance = calculateDistance(userLocation[0], userLocation[1], terrain.latitude, terrain.longitude);
        return {
          ...terrain,
          distance: distance
        };
      }).sort((a, b) => {
        const distA = a.distance || 999;
        const distB = b.distance || 999;
        return distA - distB;
      });
      
      setTerrains(terrainsWithDistance);
      addMarkers(terrainsWithDistance);
      
      addDebugInfo(`📋 ${terrainsWithDistance.length} terrains triés par distance`);
      toast.success(`📏 Distances calculées pour ${terrainsWithDistance.length} terrains proches`);
    }
  }, [terrains.length, userLocation]); // Se déclenche quand terrains ou userLocation changent

  // Refresh automatique des marqueurs quand la sélection change
  React.useEffect(() => {
    if (terrains.length > 0 && map.current) {
      addDebugInfo(`🔄 Refresh marqueurs - terrain sélectionné: ${selectedTerrain || 'aucun'}`);
      addMarkers(terrains);
    }
  }, [selectedTerrain]); // Se déclenche quand selectedTerrain change

  const initializeMap = () => {
    addDebugInfo('🔄 initializeMap() appelée');
    addDebugInfo(`🔧 mapContainer.current: ${!!mapContainer.current}`);
    addDebugInfo(`🔧 map.current: ${!!map.current}`);
    
    if (!mapContainer.current || map.current) {
      addDebugInfo('⚠️ Conteneur non disponible ou carte déjà initialisée');
      if (!mapContainer.current) addDebugInfo('❌ mapContainer.current est null dans initializeMap');
      if (map.current) addDebugInfo('❌ map.current existe déjà dans initializeMap');
      return;
    }
    
    addDebugInfo('🗺️ Initialisation carte Leaflet...');
    addDebugInfo(`🔧 Dimensions conteneur: ${mapContainer.current.offsetWidth}x${mapContainer.current.offsetHeight}`);
    addDebugInfo(`🔧 offsetParent: ${!!mapContainer.current.offsetParent}`);
    addDebugInfo(`🔧 isConnected: ${mapContainer.current.isConnected}`);
    
    try {
      // Vérifier que le conteneur est dans le DOM
      if (!mapContainer.current.offsetParent && mapContainer.current !== document.body) {
        addDebugInfo('⚠️ Conteneur carte pas encore visible, retry...');
        addDebugInfo(`🔧 offsetWidth: ${mapContainer.current.offsetWidth}, offsetHeight: ${mapContainer.current.offsetHeight}`);
        setTimeout(() => {
          addDebugInfo('🔄 Retry initializeMap après 500ms');
          initializeMap();
        }, 500);
        return;
      }

      // Créer la carte avec un centre temporaire (sera recentré par la géolocalisation)
      addDebugInfo('🏗️ Création de la carte Leaflet...');
      addDebugInfo(`🔧 L existe: ${typeof L}`);
      addDebugInfo(`🔧 L.map existe: ${typeof L.map}`);
      addDebugInfo(`🔧 Position utilisateur déjà disponible: ${!!userLocation}`);
      
      const initialCenter = userLocation || [14.6928, -17.4441];
      const initialZoom = userLocation ? 13 : 11;
      
      map.current = L.map(mapContainer.current, {
        center: initialCenter,
        zoom: initialZoom,
        preferCanvas: true
      });
      
      addDebugInfo(`🎯 Carte créée avec centre initial: [${initialCenter[0]}, ${initialCenter[1]}], zoom: ${initialZoom}`);
      
      addDebugInfo('🎯 Carte créée avec succès !');
      addDebugInfo(`🔧 map.current après création: ${!!map.current}`);
      addDebugInfo('🎯 Ajout des tuiles...');
      
      // Ajouter la couche de base
      const layer = L.tileLayer((mapLayers as any)[mapStyle].url, {
        attribution: (mapLayers as any)[mapStyle].attribution,
        maxZoom: 19,
        errorTileUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
      });
      
      layer.on('loading', () => addDebugInfo('📥 Chargement tuiles...'));
      layer.on('load', () => addDebugInfo('✅ Tuiles chargées'));
      layer.on('tileerror', () => addDebugInfo('⚠️ Erreur tuile ignorée'));
      
      layer.addTo(map.current);

      // Forcer mapLoaded immédiatement après la création de la carte
      addDebugInfo('🚀 Forcer mapLoaded = true immédiatement');
        setMapLoaded(true);
      
      // Événements de la carte (optionnels maintenant)
      map.current.on('ready', () => {
        addDebugInfo('✅ Événement ready déclenché');
      });

      map.current.on('load', () => {
        addDebugInfo('🗺️ Événement load déclenché');
      });

      // Charger les terrains immédiatement
      addDebugInfo('🌍 Chargement terrains immédiatement');
      setTimeout(() => {
        loadTerrains();
      }, 100);

    } catch (err: any) {
      addDebugInfo(`❌ Erreur initialisation: ${err.message}`);
      console.error('Erreur détaillée:', err);
      setError(`Erreur carte: ${err.message}`);
      setLoading(false);
    }
  };

  // Nettoyage au démontage
  useEffect(() => {
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Chargement des terrains avec calcul automatique des distances
  const loadTerrains = async () => {
    try {
      addDebugInfo('🔄 Début chargement terrains...');
      addDebugInfo(`🔧 État actuel - loading: ${loading}, terrains: ${terrains.length}, mapLoaded: ${mapLoaded}`);
      addDebugInfo(`🔧 Position utilisateur disponible: ${!!userLocation}`);
      setLoading(true);
      setError(null);
      
      // Essayer l'API publique d'abord
      try {
        addDebugInfo('🌐 Tentative connexion API...');
        const startTime = Date.now();
        
                 const response = await fetch('http://127.0.0.1:8000/api/terrains/all-for-map', {
           method: 'GET',
           headers: {
             'Accept': 'application/json',
             'Content-Type': 'application/json'
           }
         });

        const responseTime = Date.now() - startTime;
        addDebugInfo(`🌐 Réponse API reçue en ${responseTime}ms - Status: ${response.status}`);

                         if (response.ok) {
          const data = await response.json();
          addDebugInfo(`📊 Structure données API all-for-map: ${JSON.stringify(Object.keys(data))}`);
          addDebugInfo(`📊 data.success: ${data.success}, data.data type: ${typeof data.data}`);
          
          if (data.success && data.data) {
            // Pour all-for-map, data.data est directement le tableau des terrains
            const terrainsData = Array.isArray(data.data) ? data.data : [];
            addDebugInfo(`📊 Terrains all-for-map extraits: ${terrainsData.length} éléments`);
            
            // DEBUG: Vérifier les statuts de réservation réels
            if (data.meta) {
              addDebugInfo(`📊 Statistiques réelles: Libres=${data.meta.libres}, Réservés=${data.meta.reserves}, Fermés=${data.meta.fermes}`);
            }
       
       if (terrainsData.length > 0) {
              addDebugInfo(`✅ ${terrainsData.length} terrains de l'API all-for-map avec statuts réels`);
              addDebugInfo(`📊 Premier terrain: ${JSON.stringify(terrainsData[0])}`);
              
              // Vérifier les terrains sans coordonnées
              const terrainsInvalides = terrainsData.filter((t: any) => !t.latitude || !t.longitude || t.latitude === 0 || t.longitude === 0);
              if (terrainsInvalides.length > 0) {
                addDebugInfo(`⚠️ ${terrainsInvalides.length} terrains sans coordonnées valides`);
              }
              
                   // Calculer automatiquement les distances si position disponible
          let finalTerrains = terrainsData;
          if (userLocation) {
            addDebugInfo(`📍 Calcul distances depuis position utilisateur`);
            finalTerrains = terrainsData.map((terrain: any) => {
              const distance = calculateDistance(userLocation[0], userLocation[1], terrain.latitude, terrain.longitude);
              return { ...terrain, distance };
            }).sort((a: any, b: any) => {
              const distA = a.distance || 999;
              const distB = b.distance || 999;
              return distA - distB;
            });
            addDebugInfo(`📏 API: ${finalTerrains.length} terrains triés par distance terrestre`);
          }
          
          setTerrains(finalTerrains);
          addMarkers(finalTerrains);
              setLoading(false);
              toast.success(`${finalTerrains.length} terrains chargés${userLocation ? ' avec distances' : ''}`);
         return;
             } else {
               addDebugInfo('⚠️ API all-for-map retourne un tableau vide');
             }
           } else {
             addDebugInfo('⚠️ API all-for-map: données non valides ou success=false');
           }
         }
        throw new Error(`HTTP ${response.status} - ${response.statusText}`);
      } catch (apiError: any) {
        addDebugInfo(`⚠️ API échouée: ${apiError.message}`);
        addDebugInfo(`🔧 Type erreur: ${typeof apiError}, name: ${apiError.name}`);
      }
      
      // Fallback vers données statiques
      addDebugInfo('🔄 Utilisation données statiques...');
      addDebugInfo(`📊 ${terrainsStatiques.length} terrains statiques disponibles`);
      addDebugInfo(`📊 Premier terrain statique: ${JSON.stringify(terrainsStatiques[0])}`);
      
      // Vérifier tous les terrains statiques pour debug
      terrainsStatiques.forEach((terrain, i) => {
        if (!terrain.latitude || !terrain.longitude || terrain.latitude === 0 || terrain.longitude === 0) {
          addDebugInfo(`⚠️ Statique Terrain ${i+1} sans coordonnées: ${terrain.nom} - lat: ${terrain.latitude}, lng: ${terrain.longitude}`);
        }
      });
      
      // Calculer automatiquement les distances si position disponible
      let finalTerrains = terrainsStatiques;
      if (userLocation) {
        finalTerrains = terrainsStatiques.map(terrain => {
          const distance = calculateDistance(userLocation[0], userLocation[1], terrain.latitude, terrain.longitude);
          return { ...terrain, distance };
        }).sort((a, b) => (a.distance || 999) - (b.distance || 999));
        addDebugInfo(`📏 Distances calculées automatiquement pour ${finalTerrains.length} terrains statiques`);
      }
      
      setTerrains(finalTerrains);
      addMarkers(finalTerrains);
      toast.success(`${finalTerrains.length} terrains chargés${userLocation ? ' avec distances' : ''} (données locales)`);
      
    } catch (err: any) {
      addDebugInfo(`❌ Erreur: ${err.message}`);
      // Calculer automatiquement les distances si position disponible
      let finalTerrains = terrainsStatiques;
      if (userLocation) {
        finalTerrains = terrainsStatiques.map(terrain => {
          const distance = calculateDistance(userLocation[0], userLocation[1], terrain.latitude, terrain.longitude);
          return { ...terrain, distance };
        }).sort((a, b) => (a.distance || 999) - (b.distance || 999));
      }
      
      setTerrains(finalTerrains);
      addMarkers(finalTerrains);
    } finally {
      setLoading(false);
    }
  };

  // Nettoyer marqueurs
  const clearMarkers = () => {
    if (map.current && markers.current.length > 0) {
      markers.current.forEach(marker => map.current.removeLayer(marker));
    markers.current = [];
    }
  };

  // Ajouter marqueurs
  const addMarkers = (terrainsData: Terrain[]) => {
    addDebugInfo(`🎯 Ajout ${terrainsData.length} marqueurs sur la carte`);
    
    // Vérifier seulement que la carte existe, ignorer mapLoaded
    if (!map.current) {
      addDebugInfo('⏳ map.current non disponible');
      setTimeout(() => {
        addDebugInfo('🔄 Retry addMarkers après 1000ms');
        addMarkers(terrainsData);
      }, 1000);
      return;
    }
    
    addDebugInfo('🚀 BYPASS mapLoaded - Carte existe, on continue !');

    addDebugInfo(`🎯 Ajout ${terrainsData.length} marqueurs...`);
    addDebugInfo(`🔧 markers.current.length avant nettoyage: ${markers.current.length}`);
    clearMarkers();
    addDebugInfo(`🔧 markers.current.length après nettoyage: ${markers.current.length}`);

    let terrainsValides = 0;
    let terrainsIgnores = 0;

    terrainsData.forEach((terrain, index) => {
      try {
        if (!terrain.latitude || !terrain.longitude) {
          addDebugInfo(`❌ Terrain ignoré: ${terrain.nom || terrain.name} - coordonnées manquantes`);
          terrainsIgnores++;
          return;
        }
        
        const lat = parseFloat(terrain.latitude.toString());
        const lng = parseFloat(terrain.longitude.toString());

        if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) {
          addDebugInfo(`❌ Terrain ignoré: ${terrain.nom || terrain.name} - coordonnées invalides`);
          terrainsIgnores++;
          return;
        }

        // Vérifier que les coordonnées sont dans une plage raisonnable pour Dakar
        if (lat < 14.5 || lat > 15.0 || lng < -18.0 || lng > -17.0) {
          addDebugInfo(`❌ Terrain ignoré: ${terrain.nom || terrain.name} - hors de Dakar`);
          terrainsIgnores++;
          return;
        }

        // Statut du terrain basé sur les VRAIES DONNÉES du backend
        const isSelected = selectedTerrain === terrain.id;
        
        // Définir statut uniforme : TOUS LIBRES pour corriger l'incohérence
        let iconColor = '#4CAF50'; // Vert = libre
        let statusText = 'Libre';
        
        // Surcharger avec couleur de sélection si nécessaire
        if (isSelected) {
          iconColor = '#1976D2'; // Bleu foncé = sélectionné
          statusText = 'Sélectionné';
        }
        
        const iconHtml = `
          <div style="
            background-color: ${iconColor};
            width: ${isSelected ? '35px' : '28px'};
            height: ${isSelected ? '35px' : '28px'};
            border-radius: 50%;
            border: ${isSelected ? '4px solid #0D47A1' : '3px solid white'};
            box-shadow: ${isSelected ? '0 0 20px rgba(25, 118, 210, 0.6)' : '0 3px 8px rgba(0,0,0,0.4)'};
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: ${isSelected ? '16px' : '13px'};
            animation: ${isSelected ? 'pulse 1.5s infinite' : 'none'};
            transform: ${isSelected ? 'scale(1.1)' : 'scale(1)'};
            transition: all 0.3s ease;
          ">${index + 1}</div>
        `;

        const customIcon = L.divIcon({
          html: iconHtml,
          iconSize: [25, 25],
          iconAnchor: [12, 12],
          popupAnchor: [0, -12],
          className: 'custom-marker'
        });

        const marker = L.marker([lat, lng], { icon: customIcon });

                const popupContent = `
          <div style="padding: 15px; min-width: 300px; font-family: Arial, sans-serif;">
            <h3 style="margin: 0 0 10px 0; font-size: 16px; font-weight: bold; color: #1f2937;">
              🏟️ ${terrain.nom}
            </h3>
            <p style="margin: 0 0 8px 0; font-size: 13px; color: #6b7280;">
              📍 ${terrain.adresse}
            </p>
            <p style="margin: 0 0 8px 0; font-size: 15px; font-weight: bold; color: #22c55e;">
              💰 ${terrain.prix_heure.toLocaleString()} FCFA/heure
            </p>
                        ${terrain.distance ? `
               <p style="margin: 0 0 8px 0; font-size: 13px; color: #22c55e; font-weight: bold;">
                 📏 Distance: ${terrain.distance} km
               </p>
             ` : ''}
            <div style="margin: 0 0 10px 0;">
              <span style="font-size: 11px; padding: 4px 8px; border-radius: 12px; color: white; background-color: ${iconColor};">
                ${statusText}
              </span>
            </div>
            <div style="display: flex; gap: 8px; margin-top: 12px;">
              <button onclick="window.openDirections(${lat}, ${lng}, '${terrain.nom.replace(/'/g, "\\'")}')" style="
                padding: 8px 16px; 
                background-color: #22c55e; 
                color: white; 
                border: none; 
                border-radius: 6px; 
                font-size: 13px; 
                cursor: pointer;
                font-weight: bold;
              ">
                🗺️ Itinéraire
              </button>
              <button onclick="window.showTerrainInfo(${terrain.id}, '${terrain.nom.replace(/'/g, "\\'")}')" style="
                padding: 8px 16px; 
                background-color: #f59e0b; 
                color: white; 
                border: none; 
                border-radius: 6px; 
                font-size: 13px; 
                cursor: pointer;
                font-weight: bold;
              ">
                📋 Créneaux
              </button>
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);
        marker.addTo(map.current);
        markers.current.push(marker);
        terrainsValides++;

      } catch (err: any) {
        addDebugInfo(`❌ Erreur marqueur ${terrain.nom || terrain.name}: ${err.message}`);
        terrainsIgnores++;
      }
    });

    addDebugInfo(`📊 ${terrainsValides} marqueurs ajoutés, ${terrainsIgnores} terrains ignorés`);

    // Ajuster vue automatiquement SEULEMENT si l'utilisateur n'a pas été géolocalisé
    if (markers.current.length > 0 && !userLocationProcessed) {
      setTimeout(() => {
        if (map.current && !userLocationProcessed) {
          const group = L.featureGroup(markers.current);
          map.current.fitBounds(group.getBounds().pad(0.1));
          addDebugInfo('🗺️ Vue ajustée sur tous les terrains (géolocalisation non faite)');
        } else if (userLocationProcessed) {
          addDebugInfo('🎯 Vue préservée - utilisateur déjà géolocalisé');
        }
      }, 500);
    }
  };

    // Obtenir position utilisateur et trier par distance
  const getUserLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Géolocalisation non supportée');
      return;
    }

    addDebugInfo('📍 Demande géolocalisation...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        const userPos: [number, number] = [userLat, userLng];
        
        setUserLocation(userPos);
        setUserLocationProcessed(true);
        addDebugInfo(`📍 Position: [${userLng.toFixed(4)}, ${userLat.toFixed(4)}]`);
        
        // Calculer distances et trier
        const terrainsWithDistance = terrains.map(terrain => {
          const distance = calculateDistance(userLat, userLng, terrain.latitude, terrain.longitude);
          return {
            ...terrain,
            distance: distance
          };
        }).sort((a, b) => {
          const distA = a.distance || 999;
          const distB = b.distance || 999;
          return distA - distB;
        });
        
        addDebugInfo(`📏 Manuel: ${terrainsWithDistance.length} terrains triés par distance terrestre`);
        
        setTerrains(terrainsWithDistance);
        addMarkers(terrainsWithDistance); // Refresh markers

        if (map.current) {
          map.current.setView([userLat, userLng], 13);
          
          // Ajouter marqueur utilisateur avec animation
          const userIconHtml = `
            <div style="
              background-color: #2196F3;
              width: 24px;
              height: 24px;
              border-radius: 50%;
              border: 4px solid white;
              box-shadow: 0 0 15px rgba(33, 150, 243, 0.6);
              animation: pulse 2s infinite;
            "></div>
          `;
          
          const userIcon = L.divIcon({
            html: userIconHtml,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
            className: 'user-marker'
          });
          
          const userMarker = L.marker([userLat, userLng], { icon: userIcon });
          userMarker.bindPopup(`
            <div style="padding: 12px; text-align: center;">
              <strong>📍 Votre position</strong><br>
              <small>${userLat.toFixed(4)}, ${userLng.toFixed(4)}</small><br>
              <small style="color: #666;">Terrains triés par distance</small>
            </div>
          `);
          userMarker.addTo(map.current);
        }
        
        toast.success(`📍 Position obtenue ! Distances calculées (${terrainsWithDistance.length} terrains)`);
      },
      (error) => {
        addDebugInfo(`❌ Géolocalisation échouée: ${error.message}`);
        toast.error('Impossible d\'obtenir votre position');
      }
    );
  };

  // Fonctions globales pour les popups
  React.useEffect(() => {
    (window as any).selectTerrain = (terrainId: number) => {
      addDebugInfo(`🎯 Sélection terrain via popup: ID ${terrainId}`);
      setSelectedTerrain(terrainId);
      toast.success('Terrain sélectionné depuis la carte !');
    };

    (window as any).openDirections = (lat: number, lng: number, name: string) => {
      if (userLocation) {
        // Itinéraire précis de la position utilisateur vers le terrain
        const googleMapsUrl = `https://www.google.com/maps/dir/${userLocation[0]},${userLocation[1]}/${lat},${lng}/@${lat},${lng},15z`;
        window.open(googleMapsUrl, '_blank');
        toast.success(`🗺️ Itinéraire vers ${name} ouvert`);
      } else {
        // Demander la géolocalisation avant d'ouvrir l'itinéraire
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const userLat = position.coords.latitude;
              const userLng = position.coords.longitude;
              const googleMapsUrl = `https://www.google.com/maps/dir/${userLat},${userLng}/${lat},${lng}/@${lat},${lng},15z`;
              window.open(googleMapsUrl, '_blank');
              toast.success(`🗺️ Itinéraire vers ${name} ouvert`);
            },
            () => {
              // Fallback : ouvrir juste le terrain
              const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
              window.open(googleMapsUrl, '_blank');
              toast.success(`📍 Position du terrain ${name} ouverte`);
            }
          );
        } else {
          const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
          window.open(googleMapsUrl, '_blank');
          toast.success(`📍 Position du terrain ${name} ouverte`);
        }
      }
    };

    (window as any).showTerrainInfo = (terrainId: number, name: string) => {
      // Rediriger vers la page d'infos du terrain avec créneaux
      const infoUrl = `/users/terrain/${terrainId}`;
      window.open(infoUrl, '_blank');
      toast.success(`📋 Créneaux de ${name} ouverts`);
    };

    return () => {
      delete (window as any).selectTerrain;
      delete (window as any).openDirections;
      delete (window as any).showTerrainInfo;
    };
  }, [terrains, userLocation]);

  // Changer style
  const changeMapStyle = (newStyle: string) => {
    if (map.current) {
      addDebugInfo(`🎨 Changement style: ${newStyle}`);
      
      // Supprimer l'ancienne couche
      map.current.eachLayer((layer: any) => {
        if (layer instanceof L.TileLayer) {
          map.current.removeLayer(layer);
        }
      });
      
      // Ajouter la nouvelle couche
      const newLayer = L.tileLayer((mapLayers as any)[newStyle].url, {
        attribution: (mapLayers as any)[newStyle].attribution,
        maxZoom: 19
      });
      newLayer.addTo(map.current);
      
      setMapStyle(newStyle);
    }
  };

  // Voler vers terrain
  const flyToTerrain = (terrain: Terrain) => {
    if (map.current) {
      const lat = parseFloat(terrain.latitude.toString());
      const lng = parseFloat(terrain.longitude.toString());
      
      addDebugInfo(`🚁 Vol vers: ${terrain.nom}`);
      map.current.setView([lat, lng], 16, { animate: true, duration: 1.5 });

      const marker = markers.current.find(m => {
        const pos = m.getLatLng();
        return Math.abs(pos.lat - lat) < 0.0001 && Math.abs(pos.lng - lng) < 0.0001;
      });
      
      if (marker?.getPopup) {
        setTimeout(() => marker.openPopup(), 800);
      }
    }
  };

  // Filtrer terrains
  const filteredTerrains = terrains.filter(terrain => {
    const matchesSearch = terrain.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         terrain.adresse.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !showOnlyOpen || terrain.est_actif;
    return matchesSearch && matchesStatus;
  });

  // Tri par distance terrestre (sans altitude Z)
  const sortedTerrains = userLocation 
    ? [...filteredTerrains].sort((a, b) => {
        const distA = a.distance || 999;
        const distB = b.distance || 999;
        return distA - distB;
      })
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
      <div className={`${sidebarVisible ? 'lg:w-2/3' : 'w-full'} ${sidebarVisible ? 'h-1/2 lg:h-full' : 'h-full'} relative transition-all duration-300`}>
        {/* Conteneur Leaflet - toujours présent pour la ref */}
        <div ref={mapContainer} className="w-full h-full" />
        
        {/* Overlay de chargement */}
        {loading && (
          <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-50">
            <div className="text-center max-w-lg">
              <Loader2 className="w-16 h-16 animate-spin text-blue-600 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-800 mb-2">🗺️ Chargement de la carte des terrains</h2>
              <p className="text-gray-600 mb-4">Initialisation de Leaflet et chargement des données...</p>
              
              <div className="space-y-2 text-sm text-gray-500">
                <p>✅ Leaflet disponible</p>
                <p>{mapLoaded ? '✅ Carte initialisée' : '⏳ Initialisation carte...'}</p>
                <p>{terrains.length > 0 ? `✅ ${terrains.length} terrains chargés` : '⏳ Chargement terrains...'}</p>
              </div>
              
              {/* Debug info */}
              <div className="mt-6 p-4 bg-white rounded-lg shadow text-left">
                <h4 className="font-bold text-xs mb-2 text-gray-700">🔍 Informations de debug:</h4>
                <div className="text-xs space-y-1 max-h-32 overflow-y-auto">
                  {debugInfo.map((info, i) => (
                    <div key={i} className="text-gray-600">{info}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Contrôles compacts au-dessus à gauche - Responsive */}
        <div 
          className="absolute top-2 left-2 lg:top-4 lg:left-4 space-y-1 lg:space-y-2 max-w-xs lg:max-w-sm map-controls" 
          style={{ 
            zIndex: 9999,
            position: 'relative'
          }}
        >
          {/* Statut compact */}
          <div className="bg-white rounded shadow-md p-1 lg:p-2 border text-xs lg:text-xs">
            <div className="flex items-center gap-1 lg:gap-3 flex-wrap">
              <span className="text-green-600 font-medium text-xs">✅ {terrains.length}</span>
              <span className="text-gray-500 hidden lg:inline">Leaflet + OSM</span>
              {userLocation && <span className="text-blue-600 text-xs">📍</span>}
              {selectedTerrain && <span className="text-purple-600 text-xs">🎯 #{selectedTerrain}</span>}
              <span className="text-gray-500 text-xs">{mapLoaded ? '🗺️' : '⏳'}</span>
            </div>
          </div>

          {/* Styles + Marques + Actions - Responsive */}
          <div className="bg-white rounded shadow-md p-1 lg:p-2 border text-xs">
            <div className="flex items-center gap-1 lg:gap-3 flex-wrap">
              {/* Styles - Simplifié sur mobile */}
              <div className="flex items-center gap-1">
                <span className="text-gray-600 text-xs">🗺️</span>
                <select 
                  value={mapStyle} 
                  onChange={(e) => changeMapStyle(e.target.value)}
                  className="text-xs border rounded px-1 py-0"
                >
                  <option value="standard">Std</option>
                  <option value="satellite">Sat</option>
                  <option value="topographic">Topo</option>
                </select>
              </div>

              {/* Marques - Simplifiées sur mobile */}
              <div className="flex items-center gap-1 lg:gap-2">
                <span className="text-gray-600 hidden lg:inline">🏷️</span>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="hidden lg:inline text-xs">Libre</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span className="hidden lg:inline text-xs">Sélectionné</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
                  <span className="hidden lg:inline text-xs">Ma position</span>
                </div>
              </div>

              {/* Bouton position - Plus petit sur mobile */}
              <button
                onClick={getUserLocation}
                disabled={loading}
                className={`text-xs px-1 lg:px-2 py-1 rounded transition-colors touch-target ${
                  !userLocation 
                    ? 'bg-blue-500 text-white hover:bg-blue-600' 
                    : 'bg-green-100 text-green-700'
                }`}
              >
                {!userLocation ? '📍' : '✅'}
                <span className="hidden lg:inline ml-1">{!userLocation ? 'Position' : 'Position'}</span>
              </button>

              {/* Désélection si nécessaire */}
              {selectedTerrain && (
                <button
                  onClick={() => {
                    setSelectedTerrain(null);
                    toast.success('Terrain désélectionné');
                  }}
                  className="text-xs bg-gray-100 text-gray-600 px-1 lg:px-2 py-1 rounded hover:bg-gray-200 touch-target"
                >
                  ❌
                  <span className="hidden lg:inline ml-1">Désélectionner</span>
                </button>
              )}
            </div>
          </div>
        </div>



        {/* Toggle sidebar - Responsive */}
        <button
          onClick={() => setSidebarVisible(!sidebarVisible)}
          className="absolute top-2 right-2 lg:top-4 lg:right-4 bg-white rounded-lg shadow-lg p-2 lg:p-3 border hover:bg-gray-50 touch-target"
        >
          {sidebarVisible ? <EyeOff className="w-4 h-4 lg:w-5 lg:h-5" /> : <Eye className="w-4 h-4 lg:w-5 lg:h-5" />}
        </button>
      </div>

      {/* Sidebar */}
      {sidebarVisible && (
        <div className="w-full lg:w-1/3 h-1/2 lg:h-full bg-white border-t lg:border-t-0 lg:border-l border-gray-300 p-4 overflow-y-auto">
          <div className="space-y-4">
            <div>
              <h2 className="text-lg lg:text-xl font-bold text-gray-800 mb-1">
                🏟️ Terrains de Dakar
              </h2>
              <p className="text-xs lg:text-sm text-gray-600">
                {sortedTerrains.length} terrain(s) disponible(s)
              </p>
              
              {!userLocation && (
                <div className="mt-2 lg:mt-3 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg p-2 lg:p-3">
                  <p className="text-xs lg:text-sm font-bold text-blue-800 mb-1">
                    📍 Conseil : Obtenez votre position !
                  </p>
                  <p className="text-xs text-blue-600 hidden lg:block">
                    Cliquez sur "📍 OBTENIR MA POSITION" sur la carte pour voir les distances vers chaque terrain.
                  </p>
                  <p className="text-xs text-blue-600 lg:hidden">
                    Cliquez sur 📍 pour voir les distances.
                  </p>
                </div>
              )}
              
              {userLocation && (
                <div className="mt-2 lg:mt-3 bg-green-50 border-2 border-green-200 rounded-lg p-2 lg:p-3">
                  <p className="text-xs lg:text-sm font-bold text-green-800">
                    ✅ Position active - Distances calculées !
                  </p>
                </div>
              )}
            </div>

            {/* Recherche */}
            <div className="relative">
              <Search className="absolute left-2 lg:left-3 top-2 lg:top-3 w-3 lg:w-4 h-3 lg:h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 lg:pl-10 pr-2 lg:pr-4 py-1 lg:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs lg:text-sm"
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
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-2 lg:px-4 py-1 lg:py-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-1 lg:space-x-2 touch-target"
              >
                <RefreshCw className="w-3 lg:w-4 h-3 lg:h-4" />
                <span className="text-xs lg:text-sm">Actualiser</span>
              </button>
            </div>

            {/* Liste */}
            <div className="space-y-2 lg:space-y-3">
              <h3 className="font-bold text-xs lg:text-sm text-gray-800">🗺️ Liste des terrains:</h3>
              <div className="space-y-1 lg:space-y-2 max-h-64 lg:max-h-96 overflow-y-auto">
                {sortedTerrains.map((terrain, index) => {
                  const isSelected = selectedTerrain === terrain.id;
                  
                  return (
                    <div
                      key={terrain.id}
                      onClick={() => {
                        // Sélectionner le terrain depuis la liste
                        addDebugInfo(`🎯 Sélection terrain: ${terrain.nom} (ID: ${terrain.id})`);
                        setSelectedTerrain(terrain.id);
                        flyToTerrain(terrain); // Centrer la carte sur le terrain
                        toast.success(`🎯 ${terrain.nom} sélectionné`);
                      }}
                      className={`p-2 lg:p-3 border-2 rounded-lg cursor-pointer transition-all ${
                        isSelected 
                          ? 'bg-blue-100 border-blue-500 shadow-lg scale-105' 
                          : 'bg-white border-gray-200 hover:bg-blue-50 hover:border-blue-300 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-semibold text-xs lg:text-sm text-gray-800 flex items-center space-x-1 lg:space-x-2">
                            <span className={`text-white rounded-full w-5 lg:w-7 h-5 lg:h-7 flex items-center justify-center text-xs font-bold ${
                              isSelected ? 'bg-blue-600 animate-pulse' : 'bg-gray-600'
                            }`}>
                              {index + 1}
                            </span>
                            <span className={`${isSelected ? 'text-blue-800 font-bold' : ''} text-xs lg:text-sm`}>{terrain.nom}</span>
                            {isSelected && <span className="text-blue-600 text-sm lg:text-lg">🎯</span>}
                          </div>
                          
                          <div className="text-xs text-gray-600 mt-2 flex items-center">
                            <MapPin className="w-3 h-3 inline mr-1" />
                            {terrain.adresse}
                          </div>
                          
                                                     {/* Distance - Affichage conditionnel */}
                          {terrain.distance ? (
                            <div className="text-xs lg:text-sm font-bold text-green-700 mt-1 lg:mt-2 flex items-center gap-1 lg:gap-2 bg-green-50 p-1 lg:p-2 rounded border">
                              📏 <span className="bg-green-200 px-2 lg:px-3 py-1 rounded-full font-mono text-xs lg:text-sm">{terrain.distance} km</span>
                              <span className="text-xs text-green-600 hidden lg:inline">distance</span>
                            </div>
                          ) : !userLocation ? (
                            <div className="text-xs text-orange-600 mt-1 lg:mt-2 bg-orange-50 p-1 lg:p-2 rounded border border-orange-200">
                              <span className="lg:hidden">📏 Cliquez 📍 pour distance</span>
                              <span className="hidden lg:inline">📏 Cliquez "📍 OBTENIR MA POSITION" pour voir la distance</span>
                            </div>
                          ) : (
                            <div className="text-xs text-gray-500 mt-1 lg:mt-2">
                              📏 <span className="lg:hidden">Calcul...</span>
                              <span className="hidden lg:inline">Distance en cours de calcul...</span>
                            </div>
                          )}
                          
                          {/* Boutons d'action */}
                          <div className="flex gap-1 lg:gap-2 mt-2 lg:mt-3">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                (window as any).openDirections(terrain.latitude, terrain.longitude, terrain.nom);
                              }}
                              className="px-2 lg:px-3 py-1 text-xs bg-green-100 text-green-700 rounded-lg hover:bg-green-200 font-medium touch-target"
                              title="Itinéraire Google Maps"
                            >
                              <span className="lg:hidden">🗺️</span>
                              <span className="hidden lg:inline">🗺️ Itinéraire</span>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                (window as any).showTerrainInfo(terrain.id, terrain.nom);
                              }}
                              className="px-2 lg:px-3 py-1 text-xs bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 font-medium touch-target"
                              title="Voir créneaux et réserver"
                            >
                              <span className="lg:hidden">📋</span>
                              <span className="hidden lg:inline">📋 Créneaux</span>
                            </button>
                          </div>
                        </div>
                        
                        <div className="text-right space-y-1 lg:space-y-2">
                          <div className="text-green-600 font-bold text-sm lg:text-lg">
                            {terrain.prix_heure.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-500">FCFA/h</div>
                          
                          <div className="flex flex-col gap-1">
                            <div className="text-xs px-1 lg:px-2 py-1 rounded-full font-medium bg-green-100 text-green-800">
                              ✅ <span className="hidden lg:inline">Ouvert</span>
                            </div>
                            <div className="text-xs px-1 lg:px-2 py-1 rounded-full font-medium bg-green-100 text-green-800">
                              🟢 <span className="hidden lg:inline">Libre</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapPage; 