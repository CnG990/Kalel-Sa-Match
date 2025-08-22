import React, { useState } from 'react';
import { Euro, Eye, EyeOff, ChevronDown, ChevronUp } from 'lucide-react';

interface TerrainOption {
  id: string;
  name: string;
  price: number;
  capacity: number;
  description: string;
  duration?: number;
  timeSlot?: string;
}

interface TerrainPricingDisplayProps {
  terrainName: string;
  basePrice: number;
  compact?: boolean;
  showEdit?: boolean;
  onEdit?: () => void;
  terrainData?: any; // Full terrain data from API
}

const TerrainPricingDisplay: React.FC<TerrainPricingDisplayProps> = ({
  terrainName,
  basePrice,
  compact = false,
  showEdit = false,
  onEdit,
  terrainData
}) => {
  const [showAllOptions, setShowAllOptions] = useState(false);

  const getOptionsForTerrain = (terrain: string, data?: any): TerrainOption[] => {
    // Use terrain description to extract pricing information dynamically
    const description = data?.description || '';
    
    switch (terrain) {
      case 'Complexe Be Sport':
        // Parse from description or use calculated values
        if (description.includes('Petit terrain') && description.includes('Grand terrain')) {
          return [
            {
              id: 'be-sport-petit',
              name: 'Petit terrain',
              price: Math.round(basePrice * 0.67), // 30k when base is 45k
              capacity: 14,
              description: 'Terrain petit format'
            },
            {
              id: 'be-sport-grand-semaine',
              name: 'Grand terrain (Lun-Mer)',
              price: basePrice,
              capacity: 22,
              description: 'Grand terrain - Lundi à Mercredi'
            },
            {
              id: 'be-sport-grand-weekend',
              name: 'Grand terrain (Jeu-Dim)',
              price: Math.round(basePrice * 1.33), // 60k when base is 45k
              capacity: 22,
              description: 'Grand terrain - Jeudi à Dimanche'
            }
          ];
        }
        break;

      case 'Fara Foot':
        if (description.includes('8h-15h') && description.includes('16h-6h')) {
          return [
            {
              id: 'fara-jour',
              name: 'Tarif jour (8h-15h)',
              price: Math.round(basePrice * 0.86), // 30k when base is 35k
              capacity: data?.capacite || 10,
              description: 'Réservation de jour',
              timeSlot: '08:00-15:00'
            },
            {
              id: 'fara-nuit',
              name: 'Tarif nuit (16h-6h)',
              price: Math.round(basePrice * 1.14), // 40k when base is 35k
              capacity: data?.capacite || 10,
              description: 'Réservation de nuit',
              timeSlot: '16:00-06:00'
            }
          ];
        }
        break;

      case 'Fit Park Academy':
        if (description.includes('4x4/5x5') && description.includes('8x8/9x9') && description.includes('11x11')) {
          return [
            {
              id: 'fit-5x5',
              name: 'Terrain 4x4 / 5x5',
              price: Math.round(basePrice * 0.375), // 30k when base is 80k
              capacity: 10,
              description: 'Petit terrain pour matchs à 5'
            },
            {
              id: 'fit-8x8',
              name: 'Terrain 8x8 / 9x9',
              price: basePrice,
              capacity: 18,
              description: 'Terrain moyen format'
            },
            {
              id: 'fit-11x11',
              name: 'Terrain 11x11',
              price: Math.round(basePrice * 1.5), // 120k when base is 80k
              capacity: 22,
              description: 'Grand terrain officiel'
            }
          ];
        }
        break;

      case 'Sowfoot':
        if (description.includes('5x5') && description.includes('8x8')) {
          return [
            {
              id: 'sowfoot-5x5-dimanche',
              name: '5x5 Dimanche (90mn)',
              price: Math.round(basePrice * 0.6), // 15k when base is 25k
              capacity: 10,
              description: 'Terrain 5x5 - Dimanche 90 minutes',
              duration: 1.5
            },
            {
              id: 'sowfoot-5x5-weekend',
              name: '5x5 Vendredi-Samedi (1h)',
              price: Math.round(basePrice * 0.8), // 20k when base is 25k
              capacity: 10,
              description: 'Terrain 5x5 - Vendredi-Samedi 1 heure',
              duration: 1
            },
            {
              id: 'sowfoot-8x8-semaine',
              name: '8x8 Dimanche-Jeudi (1h30)',
              price: Math.round(basePrice * 1.4), // 35k when base is 25k
              capacity: 16,
              description: 'Terrain 8x8 - Dimanche-Jeudi 1h30',
              duration: 1.5
            },
            {
              id: 'sowfoot-8x8-weekend',
              name: '8x8 Vendredi-Samedi (1h)',
              price: Math.round(basePrice * 1.6), // 40k when base is 25k
              capacity: 16,
              description: 'Terrain 8x8 - Vendredi-Samedi 1 heure',
              duration: 1
            }
          ];
        }
        break;

      case 'Temple du Foot':
        if (description.includes('Heures creuses') && description.includes('Heures pleines')) {
          const baseCapacity = data?.capacite || 18;
          return [
            {
              id: 'temple-creuses',
              name: 'Heures creuses (10h-18h)',
              price: Math.round(basePrice * 0.82), // 35k when base is 42.5k
              capacity: Math.round(baseCapacity * 0.67),
              description: 'Tarif heures creuses',
              timeSlot: '10:00-18:00'
            },
            {
              id: 'temple-pleines',
              name: 'Heures pleines (18h-23h)',
              price: Math.round(basePrice * 1.18), // 50k when base is 42.5k
              capacity: Math.round(baseCapacity * 0.67),
              description: 'Tarif heures pleines',
              timeSlot: '18:00-23:00'
            },
            {
              id: 'temple-anfield',
              name: 'Terrain Anfield (6x6)',
              price: basePrice,
              capacity: Math.round(baseCapacity * 0.67),
              description: 'Terrain spécialisé Anfield'
            },
            {
              id: 'temple-camp-nou',
              name: 'Camp Nou (salle)',
              price: basePrice,
              capacity: Math.round(baseCapacity * 0.56),
              description: 'Terrain en salle Camp Nou'
            },
            {
              id: 'temple-old-trafford',
              name: 'Old Trafford (5x5)',
              price: basePrice,
              capacity: Math.round(baseCapacity * 0.56),
              description: 'Terrain Old Trafford'
            }
          ];
        }
        break;

      case 'Terrain Sacré Cœur':
        if (description.includes('5x5') && description.includes('8x8') && description.includes('10x10') && description.includes('11x11')) {
          return [
            {
              id: 'sacre-5x5',
              name: 'Terrain 5x5',
              price: Math.round(basePrice * 0.43), // 15k when base is 35k
              capacity: 10,
              description: 'Petit terrain 5 contre 5'
            },
            {
              id: 'sacre-8x8',
              name: 'Terrain 8x8',
              price: Math.round(basePrice * 0.86), // 30k when base is 35k
              capacity: 16,
              description: 'Terrain moyen 8 contre 8'
            },
            {
              id: 'sacre-10x10',
              name: 'Terrain 10x10',
              price: Math.round(basePrice * 1.43), // 50k when base is 35k
              capacity: 20,
              description: 'Grand terrain 10 contre 10'
            },
            {
              id: 'sacre-11x11',
              name: 'Terrain 11x11',
              price: Math.round(basePrice * 1.71), // 60k when base is 35k
              capacity: 22,
              description: 'Terrain officiel 11 contre 11'
            }
          ];
        }
        break;

      default:
        // Pour les terrains avec prix fixes
        return [
          {
            id: `${terrain.toLowerCase().replace(/\s+/g, '-')}-standard`,
            name: 'Prix standard',
            price: basePrice,
            capacity: data?.capacite || 22,
            description: 'Tarif unique'
          }
        ];
    }

    // Fallback: prix unique
    return [
      {
        id: `${terrain.toLowerCase().replace(/\s+/g, '-')}-standard`,
        name: 'Prix standard',
        price: basePrice,
        capacity: data?.capacite || 22,
        description: 'Tarif unique'
      }
    ];
  };

  const options = getOptionsForTerrain(terrainName, terrainData);
  const hasMultipleOptions = options.length > 1;

  const minPrice = Math.min(...options.map(o => o.price));
  const maxPrice = Math.max(...options.map(o => o.price));

  if (compact) {
    return (
      <div className="flex items-center space-x-2 relative">
        {hasMultipleOptions ? (
          <div className="flex items-center space-x-1">
            <span className="text-green-600 font-medium text-sm">
              {minPrice.toLocaleString()} - {maxPrice.toLocaleString()} FCFA/h
            </span>
            <button
              onClick={() => setShowAllOptions(!showAllOptions)}
              className="text-xs text-gray-500 hover:text-gray-700 flex items-center"
            >
              {showAllOptions ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            </button>
          </div>
        ) : (
          <span className="text-green-600 font-medium text-sm">
            {basePrice.toLocaleString()} FCFA/h
          </span>
        )}
        
        {showEdit && onEdit && (
          <button
            onClick={onEdit}
            className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded hover:bg-orange-200"
          >
            Modifier
          </button>
        )}

        {showAllOptions && hasMultipleOptions && (
          <div className="absolute z-10 top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-3 min-w-64">
            <div className="space-y-2">
              {options.map((option) => (
                <div key={option.id} className="flex justify-between items-center text-xs">
                  <span className="text-gray-700">{option.name}</span>
                  <span className="font-medium text-green-600">
                    {option.price.toLocaleString()} FCFA
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Euro className="w-4 h-4 text-green-600" />
          <span className="font-medium text-gray-800">
            {hasMultipleOptions ? 'Tarification multiple' : 'Prix unique'}
          </span>
        </div>
        {hasMultipleOptions && (
          <button
            onClick={() => setShowAllOptions(!showAllOptions)}
            className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-800"
          >
            <span>{showAllOptions ? 'Masquer' : 'Voir tout'}</span>
            {showAllOptions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        )}
      </div>

      {hasMultipleOptions ? (
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-sm text-gray-600 mb-2">
            Fourchette: {minPrice.toLocaleString()} - {maxPrice.toLocaleString()} FCFA/h
          </div>
          
          {showAllOptions ? (
            <div className="space-y-2">
              {options.map((option) => (
                <div key={option.id} className="bg-white rounded p-2 border border-gray-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-gray-800 text-sm">{option.name}</div>
                      <div className="text-xs text-gray-600">{option.description}</div>
                      {option.timeSlot && (
                        <div className="text-xs text-blue-600 mt-1">🕐 {option.timeSlot}</div>
                      )}
                      {option.duration && (
                        <div className="text-xs text-purple-600 mt-1">⏱️ {option.duration}h</div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600">
                        {option.price.toLocaleString()} FCFA
                      </div>
                      <div className="text-xs text-gray-500">
                        {option.capacity} joueurs max
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-gray-600">
              Cliquez sur "Voir tout" pour afficher toutes les options
            </div>
          )}
        </div>
      ) : (
        <div className="bg-green-50 rounded-lg p-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-700">Prix standard</span>
            <span className="font-bold text-green-600 text-lg">
              {basePrice.toLocaleString()} FCFA/h
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TerrainPricingDisplay; 