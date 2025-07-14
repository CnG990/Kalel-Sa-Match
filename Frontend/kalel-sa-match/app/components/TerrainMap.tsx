'use client'

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

interface Terrain {
  id: number
  nom: string
  adresse: string
  latitude?: number
  longitude?: number
  prix_heure: number
  type_terrain: string
  surface: number
  etat: string
  eclairage: boolean
  vestiaires: boolean
  parking: boolean
  douches: boolean
}

interface TerrainMapProps {
  terrains: Terrain[]
  className?: string
}

export default function TerrainMap({ terrains, className = "" }: TerrainMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const [selectedTerrain, setSelectedTerrain] = useState<Terrain | null>(null)
  const [mapError, setMapError] = useState<string | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)

  // Centre par défaut sur Dakar
  const DAKAR_CENTER: [number, number] = [-17.4441, 14.6928]

  useEffect(() => {
    if (!mapContainer.current || map.current) return

    // Vérifier la clé Mapbox
    const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
    if (!accessToken) {
      setMapError('Clé API Mapbox manquante')
      return
    }

    console.log('🗺️ Initialisation de la carte Mapbox...')
    console.log('📍 Terrains reçus:', terrains.length)

    try {
      // Configuration de Mapbox
      mapboxgl.accessToken = accessToken

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: DAKAR_CENTER,
        zoom: 11
      })

      map.current.on('load', () => {
        console.log('✅ Carte Mapbox chargée avec succès')
        setMapLoaded(true)
        setMapError(null)

        // Ajouter les marqueurs des terrains une fois la carte chargée
        addTerrainMarkers()
      })

      map.current.on('error', (e) => {
        console.error('❌ Erreur Mapbox:', e)
        setMapError('Erreur lors du chargement de la carte')
      })

    } catch (error) {
      console.error('❌ Erreur d\'initialisation Mapbox:', error)
      setMapError('Impossible d\'initialiser la carte')
    }

    // Fonction pour ajouter les marqueurs
    function addTerrainMarkers() {
      if (!map.current) return

      console.log('📍 Ajout des marqueurs pour', terrains.length, 'terrains')

      // Créer les bounds pour ajuster la vue
      const bounds = new mapboxgl.LngLatBounds()
      let hasValidCoordinates = false

      terrains.forEach((terrain, index) => {
        // Utiliser les vraies coordonnées GPS si disponibles
        let coordinates: [number, number]
        
        if (terrain.latitude && terrain.longitude) {
          coordinates = [terrain.longitude, terrain.latitude]
          bounds.extend(coordinates)
          hasValidCoordinates = true
          console.log(`✅ Terrain "${terrain.nom}": GPS réelles [${terrain.longitude}, ${terrain.latitude}]`)
        } else {
          // Position simulée autour de Dakar si pas de GPS
          coordinates = [
            DAKAR_CENTER[0] + (Math.random() - 0.5) * 0.1,
            DAKAR_CENTER[1] + (Math.random() - 0.5) * 0.1
          ]
          console.log(`⚠️ Terrain "${terrain.nom}": Position simulée [${coordinates[0]}, ${coordinates[1]}]`)
        }

        // Créer un élément HTML personnalisé pour le marqueur
        const markerElement = document.createElement('div')
        markerElement.className = 'terrain-marker'
        markerElement.style.cssText = `
          width: 40px;
          height: 40px;
          background-color: ${terrain.etat === 'disponible' ? '#16a34a' : '#dc2626'};
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 4px 12px rgba(0,0,0,0.4);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          position: relative;
        `
        
        markerElement.innerHTML = `
          <svg width="20" height="20" fill="white" viewBox="0 0 24 24">
            <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
            <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
        `

        // Variables pour gérer le popup
        let popupTimeout: NodeJS.Timeout | null = null
        let isHoveringMarker = false
        let isHoveringPopup = false

        // Événements du marqueur
        markerElement.addEventListener('mouseenter', () => {
          isHoveringMarker = true
          markerElement.style.transform = 'scale(1.2)'
          markerElement.style.boxShadow = '0 6px 20px rgba(0,0,0,0.6)'
          
          // Annuler le timeout de fermeture
          if (popupTimeout) {
            clearTimeout(popupTimeout)
            popupTimeout = null
          }
          
          // Afficher le popup
          popup.setLngLat(coordinates).addTo(map.current!)
        })
        
        markerElement.addEventListener('mouseleave', () => {
          isHoveringMarker = false
          markerElement.style.transform = 'scale(1)'
          markerElement.style.boxShadow = '0 4px 12px rgba(0,0,0,0.4)'
          
          // Attendre avant de fermer le popup
          popupTimeout = setTimeout(() => {
            if (!isHoveringPopup && !isHoveringMarker) {
              popup.remove()
            }
          }, 100)
        })
        
        markerElement.addEventListener('click', () => {
          setSelectedTerrain(terrain)
          console.log('🎯 Terrain sélectionné:', terrain.nom)
        })

        // Créer un popup informatif
        const popup = new mapboxgl.Popup({
          offset: 25,
          closeButton: false,
          closeOnClick: false,
          className: 'terrain-popup'
        }).setHTML(`
          <div style="padding: 12px; min-width: 220px; font-family: system-ui;">
            <h3 style="margin: 0 0 8px 0; font-weight: bold; color: #16a34a; font-size: 16px;">${terrain.nom}</h3>
            <p style="margin: 0 0 6px 0; font-size: 13px; color: #666; line-height: 1.4;">${terrain.adresse}</p>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <span style="font-weight: bold; color: #dc2626; font-size: 15px;">
                ${new Intl.NumberFormat('fr-FR').format(terrain.prix_heure)} FCFA/h
              </span>
              <span style="font-size: 11px; padding: 2px 8px; border-radius: 12px; background: ${terrain.etat === 'disponible' ? '#dcfce7' : '#fef3c7'}; color: ${terrain.etat === 'disponible' ? '#166534' : '#92400e'};">
                ${terrain.etat === 'disponible' ? 'Disponible' : 'Occupé'}
              </span>
            </div>
            <p style="margin: 0; font-size: 12px; color: #888;">
              ${getTerrainTypeLabel(terrain.type_terrain)} • ${terrain.surface} m²
            </p>
          </div>
        `)

        // Ajouter le marqueur à la carte
        const marker = new mapboxgl.Marker(markerElement)
          .setLngLat(coordinates)
          .addTo(map.current!)

        // Gérer les événements du popup
        popup.on('open', () => {
          const popupElement = popup.getElement()
          if (popupElement) {
            popupElement.addEventListener('mouseenter', () => {
              isHoveringPopup = true
              if (popupTimeout) {
                clearTimeout(popupTimeout)
                popupTimeout = null
              }
            })
            
            popupElement.addEventListener('mouseleave', () => {
              isHoveringPopup = false
              popupTimeout = setTimeout(() => {
                if (!isHoveringMarker && !isHoveringPopup) {
                  popup.remove()
                }
              }, 100)
            })
          }
        })
      })

      // Ajuster la vue pour inclure tous les terrains avec des coordonnées valides
      if (hasValidCoordinates && !bounds.isEmpty()) {
        map.current.fitBounds(bounds, { 
          padding: { top: 50, bottom: 50, left: 50, right: 50 },
          maxZoom: 15
        })
        console.log('🎯 Vue ajustée pour inclure tous les terrains')
      }
    }

    // Nettoyage
    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [terrains])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price)
  }

  const getEtatLabel = (etat: string) => {
    switch (etat) {
      case 'disponible': return 'Disponible'
      case 'occupe': return 'Occupé'
      case 'maintenance': return 'Maintenance'
      default: return etat
    }
  }

  const getTerrainTypeLabel = (type: string) => {
    switch (type) {
      case 'football_11': return 'Football 11'
      case 'football_7': return 'Football 7'
      case 'football_5': return 'Football 5'
      case 'futsal': return 'Futsal'
      default: return type
    }
  }

  // Affichage en cas d'erreur
  if (mapError) {
    return (
      <div className={`relative ${className}`}>
        <div className="w-full h-full bg-gradient-to-br from-red-100 to-red-200 rounded-lg flex items-center justify-center">
          <div className="text-center p-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-500 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-red-800 mb-2">Erreur de carte</h3>
            <p className="text-red-600 text-sm mb-4">{mapError}</p>
            <p className="text-red-500 text-xs">Vérifiez votre clé API Mapbox dans .env.local</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      {/* Styles CSS pour les popups */}
      <style jsx global>{`
        .terrain-popup .mapboxgl-popup-content {
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.15);
          border: 1px solid rgba(0,0,0,0.1);
          padding: 0;
          max-width: none;
        }
        .terrain-popup .mapboxgl-popup-tip {
          border-top-color: white;
        }
        .terrain-marker {
          transition: all 0.2s ease;
          z-index: 10;
        }
        .terrain-marker:hover {
          z-index: 20;
        }
      `}</style>
      
      {/* Conteneur de la carte Mapbox */}
      <div ref={mapContainer} className="w-full h-full rounded-lg overflow-hidden" />

      {/* Indicateur de chargement */}
      {!mapLoaded && (
        <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-kalel-primary border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Chargement de la carte...</p>
          </div>
        </div>
      )}

      {/* Popup de détails du terrain sélectionné */}
      {selectedTerrain && (
        <div className="absolute top-4 right-4 bg-white rounded-xl shadow-2xl p-6 max-w-sm z-20 border border-gray-200">
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-bold text-xl text-kalel-primary">{selectedTerrain.nom}</h3>
            <button
              onClick={() => setSelectedTerrain(null)}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <p className="text-gray-600 text-sm mb-4 flex items-start">
            <svg className="w-4 h-4 mr-2 mt-0.5 text-kalel-secondary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {selectedTerrain.adresse}
          </p>
          
          <div className="flex justify-between items-center mb-4">
            <span className="text-2xl font-bold text-kalel-secondary">
              {formatPrice(selectedTerrain.prix_heure)} FCFA
              <span className="text-sm font-normal text-gray-500">/heure</span>
            </span>
            <span className={`text-sm px-3 py-1 rounded-full font-medium ${
              selectedTerrain.etat === 'disponible' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {getEtatLabel(selectedTerrain.etat)}
            </span>
          </div>
          
          <p className="text-sm text-gray-500 mb-4">
            {getTerrainTypeLabel(selectedTerrain.type_terrain)} • {selectedTerrain.surface} m²
          </p>
          
          <div className="flex flex-wrap gap-2 mb-6">
            {selectedTerrain.eclairage && (
              <span className="inline-flex items-center text-xs px-3 py-1 bg-amber-100 text-amber-800 rounded-full">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Éclairage
              </span>
            )}
            {selectedTerrain.vestiaires && (
              <span className="inline-flex items-center text-xs px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Vestiaires
              </span>
            )}
            {selectedTerrain.parking && (
              <span className="inline-flex items-center text-xs px-3 py-1 bg-green-100 text-green-800 rounded-full">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                </svg>
                Parking
              </span>
            )}
            {selectedTerrain.douches && (
              <span className="inline-flex items-center text-xs px-3 py-1 bg-purple-100 text-purple-800 rounded-full">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Douches
              </span>
            )}
          </div>
          
          <div className="flex gap-3">
            <a 
              href={`/terrains/${selectedTerrain.id}`}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-3 rounded-lg text-sm font-medium text-center transition-colors duration-200"
            >
              Voir détails
            </a>
            <a 
              href={`/book?terrain=${selectedTerrain.id}`}
              className="flex-1 bg-kalel-secondary hover:bg-kalel-secondary-dark text-white px-4 py-3 rounded-lg text-sm font-medium text-center transition-colors duration-200 shadow-lg hover:shadow-xl"
            >
              Réserver maintenant
            </a>
          </div>
        </div>
      )}

      {/* Légende améliorée */}
      <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-xl border border-gray-200 z-10">
        <h3 className="font-bold text-kalel-primary mb-3 text-lg">Terrains à Dakar</h3>
        <p className="text-sm text-gray-600 mb-3">
          <span className="font-semibold text-kalel-secondary">{terrains.length}</span> terrain{terrains.length > 1 ? 's' : ''} disponible{terrains.length > 1 ? 's' : ''}
        </p>
        <div className="space-y-2 text-xs text-gray-500">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-500 rounded-full mr-3 border-2 border-white shadow"></div>
            <span>Terrains disponibles</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-500 rounded-full mr-3 border-2 border-white shadow"></div>
            <span>Terrains occupés</span>
          </div>
          <div className="flex items-center mt-3 pt-2 border-t border-gray-200">
            <svg className="w-4 h-4 mr-2 text-kalel-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.121 2.122" />
            </svg>
            <span>Cliquez pour plus de détails</span>
          </div>
        </div>
      </div>
    </div>
  )
} 