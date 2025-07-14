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

interface TerrainMapProps {
  terrains: Terrain[]
  className?: string
}

export default function TerrainMapSimple({ terrains, className = "" }: TerrainMapProps) {
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

  console.log('TerrainMapSimple - Nombre de terrains reçus:', terrains.length)

  return (
    <div className={`relative ${className}`}>
      {/* Carte interactive simulée */}
      <div className="w-full h-full bg-gradient-to-br from-green-400 via-green-500 to-green-600 rounded-lg overflow-hidden relative">
        {/* Overlay avec pattern de terrain */}
        <div className="absolute inset-0 opacity-20">
          <svg className="w-full h-full" viewBox="0 0 400 300" fill="none">
            {/* Lignes de terrain de football */}
            <rect x="50" y="50" width="300" height="200" stroke="white" strokeWidth="2" fill="none" />
            <line x1="200" y1="50" x2="200" y2="250" stroke="white" strokeWidth="2" />
            <circle cx="200" cy="150" r="30" stroke="white" strokeWidth="2" fill="none" />
            <rect x="50" y="110" width="40" height="80" stroke="white" strokeWidth="2" fill="none" />
            <rect x="310" y="110" width="40" height="80" stroke="white" strokeWidth="2" fill="none" />
          </svg>
        </div>

        {/* Marqueurs des terrains */}
        <div className="absolute inset-0 p-4">
          {terrains.slice(0, 6).map((terrain, index) => {
            // Positions simulées pour les marqueurs
            const positions = [
              { top: '20%', left: '25%' },
              { top: '30%', left: '60%' },
              { top: '50%', left: '40%' },
              { top: '60%', left: '20%' },
              { top: '70%', left: '70%' },
              { top: '80%', left: '45%' },
            ]
            const position = positions[index] || { top: '50%', left: '50%' }

            return (
              <div
                key={terrain.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                style={{ top: position.top, left: position.left }}
                onClick={() => setSelectedTerrain(terrain)}
              >
                {/* Marqueur */}
                <div className="w-8 h-8 bg-kalel-primary rounded-full border-2 border-white shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>

                {/* Tooltip au survol */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-lg shadow-lg p-2 whitespace-nowrap z-10">
                  <div className="text-xs font-medium text-gray-900">{terrain.nom}</div>
                  <div className="text-xs text-kalel-secondary">{formatPrice(terrain.prix_heure)} FCFA/h</div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Message de debug au centre */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white/80 rounded-lg p-4 text-center">
            <p className="text-sm font-medium">Terrains chargés: {terrains.length}</p>
            <p className="text-xs text-gray-600">Mode debug actif</p>
          </div>
        </div>

        {/* Popup de détails */}
        {selectedTerrain && (
          <div className="absolute top-4 right-4 bg-white rounded-lg shadow-xl p-4 max-w-xs z-20">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-lg text-kalel-primary">{selectedTerrain.nom}</h3>
              <button
                onClick={() => setSelectedTerrain(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <p className="text-gray-600 text-sm mb-2">{selectedTerrain.adresse}</p>
            
            <div className="flex justify-between items-center mb-2">
              <span className="text-lg font-bold text-kalel-secondary">
                {formatPrice(selectedTerrain.prix_heure)} FCFA/h
              </span>
              <span className={`text-xs px-2 py-1 rounded-full ${
                selectedTerrain.etat === 'disponible' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {getEtatLabel(selectedTerrain.etat)}
              </span>
            </div>
          </div>
        )}

        {/* Légende */}
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
          <h3 className="font-bold text-kalel-primary mb-2">Terrains à Dakar</h3>
          <p className="text-sm text-gray-600">{terrains.length} terrain{terrains.length > 1 ? 's' : ''} disponible{terrains.length > 1 ? 's' : ''}</p>
          <div className="flex items-center mt-2 text-xs text-gray-500">
            <div className="w-3 h-3 bg-kalel-primary rounded-full mr-2"></div>
            Cliquez pour voir les détails
          </div>
        </div>
      </div>
    </div>
  )
} 