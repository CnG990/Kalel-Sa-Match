import React from 'react';
import { Clock, Info } from 'lucide-react';

interface PricingRule {
  terrainName: string;
  rules: {
    timeSlot: string;
    price: number;
    description: string;
  }[];
  defaultPrice: number;
}

interface DynamicPricingCalculatorProps {
  terrainName: string;
  selectedTime?: string;
  duration: number;
  onPriceUpdate: (price: number) => void;
  basePrice: number;
  terrainDescription?: string;
}

// Fonctions pour générer les règles de tarification basées sur les données du terrain
const generatePricingRules = (terrainName: string, basePrice: number, description: string = ''): PricingRule => {
  // Analyser la description pour extraire les informations de tarification
  const desc = description.toLowerCase();
  
  // Règles dynamiques basées sur le nom du terrain et sa description
  if (terrainName.toLowerCase().includes('temple du foot')) {
    return {
      terrainName,
      defaultPrice: basePrice,
      rules: [
        {
          timeSlot: '10:00-18:00',
          price: Math.round(basePrice * 0.82), // ~35k quand base = 42.5k
          description: 'Heures creuses (10h-18h)'
        },
        {
          timeSlot: '18:00-23:00',
          price: Math.round(basePrice * 1.18), // ~50k quand base = 42.5k
          description: 'Heures pleines (18h-23h)'
        }
      ]
    };
  }
  
  if (terrainName.toLowerCase().includes('fara foot')) {
    return {
      terrainName,
      defaultPrice: basePrice,
      rules: [
        {
          timeSlot: '08:00-15:00',
          price: Math.round(basePrice * 0.86), // Tarif jour
          description: 'Tarif de jour (8h-15h)'
        },
        {
          timeSlot: '16:00-06:00',
          price: Math.round(basePrice * 1.14), // Tarif nuit
          description: 'Tarif de nuit (16h-6h)'
        }
      ]
    };
  }
  
  if (terrainName.toLowerCase().includes('be sport')) {
    // Extraire des informations de la description si disponibles
    const rules = [];
    
    if (desc.includes('petit terrain') || desc.includes('petit')) {
      rules.push({
        timeSlot: 'all',
        price: Math.round(basePrice * 0.67), // Petit terrain moins cher
        description: 'Petit terrain'
      });
    }
    
    rules.push(
      {
        timeSlot: '08:00-17:00',
        price: basePrice,
        description: 'Grand terrain (lundi-mercredi)'
      },
      {
        timeSlot: '18:00-23:00',
        price: Math.round(basePrice * 1.33), // Weekend plus cher
        description: 'Grand terrain (jeudi-dimanche)'
      }
    );
    
    return { terrainName, defaultPrice: basePrice, rules };
  }
  
  if (terrainName.toLowerCase().includes('sowfoot')) {
    return {
      terrainName,
      defaultPrice: basePrice,
      rules: [
        {
          timeSlot: 'all',
          price: Math.round(basePrice * 0.6), // 5x5 dimanche
          description: 'Terrain 5x5 (dimanche - 90mn)'
        },
        {
          timeSlot: 'all',
          price: Math.round(basePrice * 0.8), // 5x5 weekend
          description: 'Terrain 5x5 (vendredi-samedi - 1h)'
        },
        {
          timeSlot: 'all',
          price: Math.round(basePrice * 1.4), // 8x8 semaine
          description: 'Terrain 8x8 (dimanche-jeudi - 1h30)'
        },
        {
          timeSlot: 'all',
          price: Math.round(basePrice * 1.6), // 8x8 weekend
          description: 'Terrain 8x8 (vendredi-samedi - 1h)'
        }
      ]
    };
  }
  
  // Règles de tarification par défaut (fallback)
  return {
    terrainName,
    defaultPrice: basePrice,
    rules: [
      {
        timeSlot: 'all',
        price: basePrice,
        description: 'Tarif standard'
      }
    ]
  };
};

const DynamicPricingCalculator: React.FC<DynamicPricingCalculatorProps> = ({
  terrainName,
  selectedTime,
  duration,
  onPriceUpdate,
  basePrice,
  terrainDescription = ''
}) => {
  // Générer les règles de tarification dynamiquement
  const pricingRule = generatePricingRules(terrainName, basePrice, terrainDescription);

  // Si pas de règles spéciales, utiliser le prix de base
  if (!pricingRule.rules || pricingRule.rules.length === 0) {
    React.useEffect(() => {
      onPriceUpdate(basePrice * duration);
    }, [basePrice, duration, onPriceUpdate]);
    return null;
  }

  // Fonction pour vérifier si l'heure est dans un créneau
  const isTimeInSlot = (time: string, timeSlot: string): boolean => {
    if (timeSlot === 'all') return true;
    
    const [startTime, endTime] = timeSlot.split('-');
    const [startHour] = startTime.split(':').map(Number);
    const [endHour] = endTime.split(':').map(Number);
    const [currentHour] = time.split(':').map(Number);
    
    // Gérer les créneaux qui passent minuit
    if (endHour < startHour) {
      return currentHour >= startHour || currentHour < endHour;
    }
    
    return currentHour >= startHour && currentHour < endHour;
  };

  // Calculer le prix basé sur l'heure sélectionnée
  const calculatePrice = (): number => {
    if (!selectedTime) return pricingRule.defaultPrice;
    
    // Trouver la règle applicable
    const applicableRule = pricingRule.rules.find(rule => 
      isTimeInSlot(selectedTime, rule.timeSlot)
    );
    
    return applicableRule ? applicableRule.price : pricingRule.defaultPrice;
  };

  const currentPrice = calculatePrice();
  const totalPrice = currentPrice * duration;

  // Mettre à jour le prix dans le composant parent
  React.useEffect(() => {
    onPriceUpdate(totalPrice);
  }, [totalPrice, onPriceUpdate]);

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
      <div className="flex items-center gap-2 mb-3">
        <Clock className="w-5 h-5 text-blue-600" />
        <h3 className="font-semibold text-blue-800">Tarification spéciale</h3>
      </div>
      
      <div className="space-y-3">
        {/* Règles de tarification */}
        <div className="text-sm">
          <p className="font-medium text-gray-700 mb-2">Tarifs pour {pricingRule.terrainName} :</p>
          <div className="grid grid-cols-1 gap-2">
            {pricingRule.rules.map((rule, index) => (
              <div 
                key={index}
                className={`p-2 rounded border text-xs ${
                  selectedTime && isTimeInSlot(selectedTime, rule.timeSlot)
                    ? 'border-blue-500 bg-blue-100 text-blue-800'
                    : 'border-gray-200 bg-gray-50 text-gray-600'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span>{rule.description}</span>
                  <span className="font-semibold">
                    {rule.price.toLocaleString()} FCFA/h
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Prix calculé */}
        {selectedTime && (
          <div className="bg-white rounded p-3 border border-blue-300">
            <div className="flex justify-between items-center text-sm">
              <span>Prix pour {selectedTime} ({duration}h) :</span>
              <span className="font-bold text-blue-600">
                {totalPrice.toLocaleString()} FCFA
              </span>
            </div>
          </div>
        )}

        {/* Note d'information */}
        <div className="flex items-start gap-2 text-xs text-blue-600">
          <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <p>
            Les prix peuvent varier selon l'heure, le jour de la semaine, et la taille du terrain. 
            Sélectionnez un créneau pour voir le prix exact.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DynamicPricingCalculator; 