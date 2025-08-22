import React, { useState, useEffect } from 'react';
import type { TerrainOption, TerrainData } from '../types/terrainTypes';

interface TerrainOptionSelectorProps {
  terrainData: TerrainData | null;
  onOptionSelect: (option: TerrainOption | null) => void;
}

const TerrainOptionSelector: React.FC<TerrainOptionSelectorProps> = ({
  terrainData,
  onOptionSelect
}) => {
  const [options, setOptions] = useState<TerrainOption[]>([]);
  const [selectedOption, setSelectedOption] = useState<TerrainOption | null>(null);
  const [loading, setLoading] = useState(false);

  const terrainName = terrainData?.nom || '';

  useEffect(() => {
    if (terrainData) {
      generateOptions();
    }
  }, [terrainData]);

  const generateOptions = () => {
    setLoading(true);
    
    // ✅ SKATE PARC : PRIX STATIQUES - 30,000 FCFA tous les jours, 1h uniquement
    if (terrainName.toLowerCase().includes('skate') || terrainData?.id === 4) {
      setOptions([
        {
          id: 'skatepark-1h',
          name: 'Skate Parc (1h)',
          price: 30000, // ✅ Prix fixe 30,000 FCFA (confirmé BDD)
          capacity: 14, // ✅ Capacité réelle de la BDD
          duration: 1,
          description: '30,000 FCFA pour 1h - Tous les jours',
          allowedDays: [0, 1, 2, 3, 4, 5, 6], // Tous les jours
          restrictions: ['Équipements de protection recommandés']
        }
      ]);
    }
    // ✅ COMPLEXE BE SPORT : PRIX VARIABLES SELON LA TAILLE - Petit terrain 30k / Grand terrain 50k
    else if (terrainName.toLowerCase().includes('be sport') || terrainName.toLowerCase().includes('complexe be sport')) {
      setOptions([
        {
          id: 'besport-petit-1h',
          name: 'Complexe Be Sport - Petit terrain (1h)',
          price: 30000, // ✅ Prix fixe petit terrain
          capacity: 16, // ✅ Capacité spécifique petit terrain
          duration: 1,
          description: '30,000 FCFA pour 1h - Petit terrain (16 personnes)',
          allowedDays: [0, 1, 2, 3, 4, 5, 6], // Tous les jours
          restrictions: ['Crampons autorisés', 'Petit terrain']
        },
        {
          id: 'besport-grand-1h',
          name: 'Complexe Be Sport - Grand terrain (1h)',
          price: 50000, // ✅ Prix fixe grand terrain
          capacity: 22, // ✅ Capacité grand terrain
          duration: 1,
          description: '50,000 FCFA pour 1h - Grand terrain (22 personnes)',
          allowedDays: [0, 1, 2, 3, 4, 5, 6], // Tous les jours
          restrictions: ['Crampons autorisés', 'Grand terrain']
        }
      ]);
    }
    // ✅ SOWFOOT : PRIX STATIQUES (demande utilisateur - prix fixes)
    else if (terrainName.toLowerCase() === 'sowfoot') {
      setOptions([
        {
          id: 'sowfoot-5x5-dimanche-1h',
          name: '5x5 Dimanche (1h)',
          price: 15000, // ✅ Prix statique fixé
          capacity: 10,
          duration: 1,
          description: '15,000 FCFA pour 1h - Dimanche uniquement',
          allowedDays: [0],
          restrictions: ['Dimanche uniquement', 'Crampons interdits']
        },
        {
          id: 'sowfoot-5x5-dimanche-90mn',
          name: '5x5 Dimanche (1h30)',
          price: 20000, // ✅ Prix statique fixé (+5k pour 90mn)
          capacity: 10,
          duration: 1.5,
          description: '20,000 FCFA pour 1h30 - Dimanche uniquement (+5k pour 90mn)',
          allowedDays: [0],
          restrictions: ['Dimanche uniquement', 'Crampons interdits']
        },
        {
          id: 'sowfoot-5x5-weekend-1h',
          name: '5x5 Vendredi-Samedi (1h)',
          price: 20000, // ✅ Prix statique fixé (corrigé)
          capacity: 10,
          duration: 1,
          description: '20,000 FCFA pour 1h - Vendredi et Samedi (PAS de 1h30 ces jours)',
          allowedDays: [5, 6],
          restrictions: ['Vendredi et Samedi uniquement', 'Crampons interdits', 'Pas de 1h30 ces jours']
        },
        {
          id: 'sowfoot-8x8-dimanche-90mn',
          name: '8x8 Dimanche (1h30)',
          price: 35000, // ✅ Prix statique fixé
          capacity: 16,
          duration: 1.5,
          description: '35,000 FCFA pour 1h30 - Dimanche uniquement',
          allowedDays: [0],
          restrictions: ['Dimanche uniquement', 'Crampons interdits']
        },
        {
          id: 'sowfoot-8x8-semaine-90mn',
          name: '8x8 Lundi-Jeudi (1h30)',
          price: 35000, // ✅ Prix statique fixé
          capacity: 16,
          duration: 1.5,
          description: '35,000 FCFA pour 1h30 - Lundi à Jeudi',
          allowedDays: [1, 2, 3, 4],
          restrictions: ['Lundi à Jeudi uniquement', 'Crampons interdits']
        },
        {
          id: 'sowfoot-8x8-weekend-1h',
          name: '8x8 Vendredi-Samedi (1h)',
          price: 40000, // ✅ Prix statique fixé (corrigé)
          capacity: 16,
          duration: 1,
          description: '40,000 FCFA pour 1h - Vendredi et Samedi (PAS de 1h30 ces jours)',
          allowedDays: [5, 6],
          restrictions: ['Vendredi et Samedi uniquement', 'Crampons interdits', 'Pas de 1h30 ces jours']
        }
      ]);
    }
    // ✅ AUTRES TERRAINS : PRIX DYNAMIQUES SELON LA BASE DE DONNÉES
    else {
      const prixHeure = terrainData?.prix_heure || 25000;
      
      setOptions([
        {
          id: 'standard-1h',
          name: `${terrainName} (1h)`,
          price: prixHeure,
          capacity: terrainData?.capacite || 22,
          duration: 1,
          description: `${prixHeure.toLocaleString()} FCFA pour 1h`,
          allowedDays: [0, 1, 2, 3, 4, 5, 6],
          restrictions: []
        },
        {
          id: 'standard-90mn',
          name: `${terrainName} (1h30)`,
          price: Math.round(prixHeure * 1.5),
          capacity: terrainData?.capacite || 22,
          duration: 1.5,
          description: `${Math.round(prixHeure * 1.5).toLocaleString()} FCFA pour 1h30`,
          allowedDays: [0, 1, 2, 3, 4, 5, 6],
          restrictions: []
        },
        {
          id: 'standard-2h',
          name: `${terrainName} (2h)`,
          price: prixHeure * 2,
          capacity: terrainData?.capacite || 22,
          duration: 2,
          description: `${(prixHeure * 2).toLocaleString()} FCFA pour 2h`,
          allowedDays: [0, 1, 2, 3, 4, 5, 6],
          restrictions: []
        }
      ]);
    }
    
    setLoading(false);
  };

  const handleOptionSelect = (option: TerrainOption) => {
    setSelectedOption(option);
    onOptionSelect(option);
  };

  const handleClearSelection = () => {
    setSelectedOption(null);
    onOptionSelect(null);
  };

  if (!terrainData) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <p className="text-yellow-700">Veuillez sélectionner un terrain pour voir les options disponibles.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Chargement des options...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Options pour {terrainName}
        </h3>
        {selectedOption && (
          <button
            onClick={handleClearSelection}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Effacer la sélection
          </button>
        )}
      </div>

      <div className="grid gap-3">
        {options.map((option) => (
          <div
            key={option.id}
            className={`
              p-4 rounded-lg border-2 cursor-pointer transition-all duration-200
              ${selectedOption?.id === option.id
                ? 'border-blue-500 bg-blue-50 shadow-md'
                : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
              }
            `}
            onClick={() => handleOptionSelect(option)}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{option.name}</h4>
                <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                
                <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
                  <span>👥 {option.capacity} personnes</span>
                  <span>⏱️ {option.duration}h</span>
                  {option.allowedDays && option.allowedDays.length < 7 && (
                    <span>📅 Jours spécifiques</span>
                  )}
                </div>

                {option.restrictions && option.restrictions.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-amber-600 font-medium">Restrictions:</p>
                    <ul className="text-xs text-amber-600 ml-2">
                      {option.restrictions.map((restriction, index) => (
                        <li key={index}>• {restriction}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              
              <div className="text-right ml-4">
                <p className="text-xl font-bold text-blue-600">
                  {option.price.toLocaleString()} FCFA
                </p>
                {selectedOption?.id === option.id && (
                  <div className="text-green-600 text-sm mt-1">
                    ✓ Sélectionné
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedOption && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-2">Option sélectionnée:</h4>
          <p className="text-blue-800">{selectedOption.name}</p>
          <p className="text-blue-600 text-sm mt-1">{selectedOption.description}</p>
        </div>
      )}
    </div>
  );
};

export default TerrainOptionSelector; 