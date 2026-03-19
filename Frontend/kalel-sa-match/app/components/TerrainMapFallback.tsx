'use client'

import { useState } from 'react'

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

interface TerrainMapFallbackProps {
  terrains: Terrain[]
  className?: string
}

export default function TerrainMapFallback({ terrains, className = "" }: TerrainMapFallbackProps) {
  const [selectedTerrain, setSelectedTerrain] = useState<Terrain | null>(null)

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

  return (
    <div className={`relative ${className}`}>
      {/* Carte interactive simulée avec design amélioré */}
      <div className="w-full h-full bg-gradient-to-br from-green-400 via-green-500 to-green-600 rounded-lg overflow-hidden relative shadow-lg">
        {/* Overlay avec pattern de terrain */}
        <div className="absolute inset-0 opacity-20">
          <svg className="w-full h-full" viewBox="0 0 400 300" fill="none">
            {/* Lignes de terrain de football */}
            <rect x="50" y="50" width="300" height="200" stroke="white" strokeWidth="2" fill="none" />
            <line x1="200" y1="50" x2="200" y2="250" stroke="white" strokeWidth="2" />
            <circle cx="200" cy="150" r="30" stroke="white" strokeWidth="2" fill="none" />
            <rect x="50" y="110" width="40" height="80" stroke="white" strokeWidth="2" fill="none" />
            <rect x="310" y="110" width="40" height="80" stroke="white" strokeWidth="2" fill="none" />
            {/* Coins de terrain */}
            <path d="M50 50 Q55 50 60 55" stroke="white" strokeWidth="2" fill="none" />
            <path d="M340 50 Q345 50 350 55" stroke="white" strokeWidth="2" fill="none" />
            <path d="M50 250 Q55 250 60 245" stroke="white" strokeWidth="2" fill="none" />
            <path d="M340 250 Q345 250 350 245" stroke="white" strokeWidth="2" fill="none" />
          </svg>
        </div>

        {/* Titre de la carte */}
        <div className="absolute top-4 left-4 z-10">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
            <h3 className="text-sm font-bold text-green-700">Carte de Dakar</h3>
            <p className="text-xs text-gray-600">Mode simplifié</p>
          </div>
        </div>

        {/* Marqueurs des terrains */}
        {terrains.length > 0 && (
          <>
            {terrains.slice(0, 8).map((terrain, index) => {
              // Positions simulées réalistes pour les marqueurs autour de Dakar
              const positions = [
                { top: '25%', left: '30%', zone: 'Plateau' },
                { top: '35%', left: '65%', zone: 'Médina' },
                { top: '55%', left: '45%', zone: 'Parcelles Assainies' },
                { top: '65%', left: '25%', zone: 'Grand Yoff' },
                { top: '75%', left: '70%', zone: 'Pikine' },
                { top: '40%', left: '80%', zone: 'Guédiawaye' },
                { top: '20%', left: '55%', zone: 'Point E' },
                { top: '80%', left: '50%', zone: 'Keur Massar' },
              ]
              const position = positions[index] || { top: '50%', left: '50%', zone: 'Dakar' }

              return (
                <div
                  key={terrain.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                  style={{ top: position.top, left: position.left }}
                  onClick={() => setSelectedTerrain(terrain)}
                >
                  {/* Marqueur amélioré */}
                  <div className={`w-10 h-10 rounded-full border-3 border-white shadow-lg flex items-center justify-center group-hover:scale-110 transition-all duration-200 ${
                    terrain.etat === 'disponible' 
                      ? 'bg-green-500 hover:bg-green-600' 
                      : 'bg-red-500 hover:bg-red-600'
                  }`}>
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>

                  {/* Badge avec nom du terrain */}
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                      {terrain.nom}
                    </div>
                  </div>

                  {/* Indicateur de zone */}
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                    <div className="bg-white/80 text-gray-700 text-xs px-1 py-0.5 rounded text-center whitespace-nowrap">
                      {position.zone}
                    </div>
                  </div>
                </div>
              )
            })}
          </>
        )}

        {/* Popup de détails du terrain sélectionné */}
        {selectedTerrain && (
          <div className="absolute top-4 right-4 bg-white rounded-xl shadow-2xl p-6 max-w-sm z-20 border border-gray-200 animate-slide-in">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-bold text-xl text-green-600">{selectedTerrain.nom}</h3>
              <button
                onClick={() => setSelectedTerrain(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <p className="text-gray-600 text-sm mb-4 flex items-start">
              <svg className="w-4 h-4 mr-2 mt-0.5 text-orange-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {selectedTerrain.adresse}
            </p>
            
            <div className="flex justify-between items-center mb-4">
              <span className="text-2xl font-bold text-orange-600">
                {formatPrice(selectedTerrain.prix_heure)} FCFA
                <span className="text-sm font-normal text-gray-500">/heure</span>
              </span>
              <span className={`text-sm px-3 py-1 rounded-full font-medium ${
                selectedTerrain.etat === 'disponible' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {getEtatLabel(selectedTerrain.etat)}
              </span>
            </div>

            <div className="space-y-2 text-sm text-gray-600 mb-4">
              <div className="flex justify-between">
                <span>Type:</span>
                <span className="font-medium">{getTerrainTypeLabel(selectedTerrain.type_terrain)}</span>
              </div>
              <div className="flex justify-between">
                <span>Surface:</span>
                <span className="font-medium">{selectedTerrain.surface} m²</span>
              </div>
            </div>

            {/* Équipements */}
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedTerrain.eclairage && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                  💡 Éclairage
                </span>
              )}
              {selectedTerrain.vestiaires && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                  👕 Vestiaires
                </span>
              )}
              {selectedTerrain.parking && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                  🚗 Parking
                </span>
              )}
              {selectedTerrain.douches && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                  🚿 Douches
                </span>
              )}
            </div>

            <button className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg">
              Réserver maintenant
            </button>
          </div>
        )}

        {/* Légende en bas */}
        <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-xl border border-gray-200 z-10">
          <h3 className="font-bold text-green-600 mb-3 text-lg">Terrains à Dakar</h3>
          <p className="text-sm text-gray-600 mb-3">
            <span className="font-semibold text-orange-600">{terrains.length}</span> terrain{terrains.length > 1 ? 's' : ''} disponible{terrains.length > 1 ? 's' : ''}
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
              <svg className="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.121 2.122" />
              </svg>
              <span>Cliquez pour plus de détails</span>
            </div>
          </div>
        </div>

        {/* Message d'information Mapbox */}
        <div className="absolute top-4 right-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs text-yellow-800 max-w-xs">
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-2 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Carte simplifiée - Configurez Mapbox pour la carte interactive</span>
          </div>
        </div>
      </div>

      {/* Styles CSS pour les animations */}
      <style jsx>{`
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  )
} 