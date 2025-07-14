import React from 'react';
import { Navigation, Route, Clock, Car, AlertTriangle, X } from 'lucide-react';

// Interface locale pour éviter les problèmes d'import
interface NavigationState {
  isNavigating: boolean;
  currentStep: string;
  distanceRemaining: string;
  timeRemaining: string;
  trafficCondition: 'smooth' | 'moderate' | 'heavy';
}

interface NavigationPanelProps {
  navigationState: NavigationState;
  onStopNavigation: () => void;
}

export const NavigationPanel: React.FC<NavigationPanelProps> = ({
  navigationState,
  onStopNavigation
}) => {
  if (!navigationState.isNavigating) return null;

  const getTrafficColor = (condition: string) => {
    switch (condition) {
      case 'heavy': return 'bg-red-500';
      case 'moderate': return 'bg-yellow-500';
      default: return 'bg-green-500';
    }
  };

  const getTrafficText = (condition: string) => {
    switch (condition) {
      case 'heavy': return 'Trafic dense';
      case 'moderate': return 'Trafic modéré';
      default: return 'Trafic fluide';
    }
  };

  return (
    <div className="absolute top-4 left-4 right-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Navigation className="w-5 h-5 text-white" />
              <span className="font-bold text-white">Navigation active</span>
            </div>
            <button
              onClick={onStopNavigation}
              className="p-1 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Stats principales */}
        <div className="p-4">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <Route className="w-4 h-4 text-blue-600" />
              <div>
                <div className="text-xs text-gray-500">Distance</div>
                <div className="font-bold text-gray-900">{navigationState.distanceRemaining}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <Clock className="w-4 h-4 text-green-600" />
              <div>
                <div className="text-xs text-gray-500">Temps estimé</div>
                <div className="font-bold text-gray-900">{navigationState.timeRemaining}</div>
              </div>
            </div>
          </div>

          {/* Instruction actuelle */}
          <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg mb-3">
            <Car className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <div className="text-sm font-medium text-blue-900 mb-1">Prochaine instruction:</div>
              <div className="text-sm text-blue-800 leading-relaxed">
                {navigationState.currentStep}
              </div>
            </div>
          </div>

          {/* Indicateur de trafic */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${getTrafficColor(navigationState.trafficCondition)}`} />
              <span className="text-sm font-medium text-gray-700">
                {getTrafficText(navigationState.trafficCondition)}
              </span>
            </div>
            {navigationState.trafficCondition === 'heavy' && (
              <AlertTriangle className="w-4 h-4 text-red-500" />
            )}
          </div>

          {/* Actions rapides */}
          <div className="grid grid-cols-2 gap-2 mt-4">
            <button 
              onClick={() => window.open(`tel:+221123456789`, '_self')}
              className="flex items-center justify-center gap-2 p-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
            >
              🚨 Urgence
            </button>
            <button 
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: 'Mon trajet en cours',
                    text: 'Je me dirige vers le terrain',
                    url: window.location.href
                  });
                }
              }}
              className="flex items-center justify-center gap-2 p-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
            >
              📍 Partager
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavigationPanel; 