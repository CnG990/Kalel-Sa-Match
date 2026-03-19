import React, { useState } from 'react';
import { 
  MapPin, 
  Star, 
  Crown, 
  Zap, 
  Heart, 
  Shield, 
  Trophy, 
  Target,
  Flame,
  Gem,
  X,
  Palette,
  Save,
  RotateCcw
} from 'lucide-react';

interface TerrainIconManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (iconConfig: TerrainIconConfig) => void;
  currentConfig?: TerrainIconConfig;
  terrainName: string;
}

export interface TerrainIconConfig {
  icon: string;
  color: string;
  size: 'small' | 'medium' | 'large';
  animation: 'none' | 'pulse' | 'bounce' | 'glow';
  badge?: string;
  customText?: string;
}

const TerrainIconManager: React.FC<TerrainIconManagerProps> = ({
  isOpen,
  onClose,
  onSave,
  currentConfig,
  terrainName
}) => {
  const [config, setConfig] = useState<TerrainIconConfig>(currentConfig || {
    icon: 'mappin',
    color: '#ea580c',
    size: 'medium',
    animation: 'none'
  });

  const iconOptions = [
    { id: 'mappin', icon: MapPin, label: 'Marqueur classique', emoji: '📍' },
    { id: 'star', icon: Star, label: 'Terrain premium', emoji: '⭐' },
    { id: 'crown', icon: Crown, label: 'Terrain VIP', emoji: '👑' },
    { id: 'trophy', icon: Trophy, label: 'Terrain champion', emoji: '🏆' },
    { id: 'zap', icon: Zap, label: 'Terrain rapide', emoji: '⚡' },
    { id: 'heart', icon: Heart, label: 'Terrain favori', emoji: '❤️' },
    { id: 'shield', icon: Shield, label: 'Terrain sécurisé', emoji: '🛡️' },
    { id: 'target', icon: Target, label: 'Terrain précision', emoji: '🎯' },
    { id: 'flame', icon: Flame, label: 'Terrain populaire', emoji: '🔥' },
    { id: 'gem', icon: Gem, label: 'Terrain diamant', emoji: '💎' }
  ];

  const colorOptions = [
    { id: 'orange', color: '#ea580c', label: 'Orange standard' },
    { id: 'green', color: '#16a34a', label: 'Vert premium' },
    { id: 'blue', color: '#2563eb', label: 'Bleu moderne' },
    { id: 'purple', color: '#9333ea', label: 'Violet VIP' },
    { id: 'red', color: '#dc2626', label: 'Rouge passion' },
    { id: 'yellow', color: '#eab308', label: 'Jaune soleil' },
    { id: 'pink', color: '#ec4899', label: 'Rose glamour' },
    { id: 'teal', color: '#0d9488', label: 'Sarcelle élégant' },
    { id: 'gold', color: '#f59e0b', label: 'Or prestige' },
    { id: 'black', color: '#1f2937', label: 'Noir élite' }
  ];

  const sizeOptions = [
    { id: 'small', label: 'Petit', size: 'w-4 h-4' },
    { id: 'medium', label: 'Moyen', size: 'w-6 h-6' },
    { id: 'large', label: 'Grand', size: 'w-8 h-8' }
  ];

  const animationOptions = [
    { id: 'none', label: 'Aucune', class: '' },
    { id: 'pulse', label: 'Pulsation', class: 'animate-pulse' },
    { id: 'bounce', label: 'Rebond', class: 'animate-bounce' },
    { id: 'glow', label: 'Brillance', class: 'shadow-lg shadow-current' }
  ];

  const badgeOptions = [
    { id: '', label: 'Aucun badge' },
    { id: 'new', label: 'NOUVEAU', emoji: '🆕' },
    { id: 'hot', label: 'POPULAIRE', emoji: '🔥' },
    { id: 'premium', label: 'PREMIUM', emoji: '⭐' },
    { id: 'pro', label: 'PRO', emoji: '💎' },
    { id: 'top', label: 'TOP', emoji: '🏆' }
  ];

  const getIconComponent = (iconId: string) => {
    const iconData = iconOptions.find(opt => opt.id === iconId);
    return iconData ? iconData.icon : MapPin;
  };

  const handleSave = () => {
    onSave(config);
    onClose();
  };

  const resetToDefault = () => {
    setConfig({
      icon: 'mappin',
      color: '#ea580c',
      size: 'medium',
      animation: 'none'
    });
  };

  const PreviewIcon = getIconComponent(config.icon);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Palette className="w-6 h-6" />
                Personnaliser l'icône du terrain
              </h2>
              <p className="text-blue-100 text-sm">
                {terrainName} - Choisissez comment votre terrain apparaît aux clients
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Aperçu en temps réel */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Aperçu en temps réel</h3>
            <div className="relative inline-block">
              <div className={`relative ${animationOptions.find(a => a.id === config.animation)?.class}`}>
                <PreviewIcon 
                  className={`${sizeOptions.find(s => s.id === config.size)?.size} mx-auto`}
                  style={{ color: config.color }}
                />
                {config.badge && (
                  <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1 py-0.5 rounded-full font-bold">
                    {badgeOptions.find(b => b.id === config.badge)?.emoji}
                  </div>
                )}
              </div>
              {config.customText && (
                <div className="mt-2 text-xs font-medium text-gray-700 bg-white px-2 py-1 rounded shadow">
                  {config.customText}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Choix de l'icône */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                Icône du terrain
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {iconOptions.map((option) => {
                  const IconComponent = option.icon;
                  return (
                    <button
                      key={option.id}
                      onClick={() => setConfig({ ...config, icon: option.id })}
                      className={`p-3 rounded-lg border-2 transition-all duration-200 text-left hover:shadow-md ${
                        config.icon === option.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{option.emoji}</span>
                        <div>
                          <div className="font-medium text-sm">{option.label}</div>
                          <IconComponent className="w-4 h-4 text-gray-500 mt-1" />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Choix de la couleur */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Palette className="w-5 h-5 text-purple-600" />
                Couleur du marqueur
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {colorOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setConfig({ ...config, color: option.color })}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 text-left hover:shadow-md ${
                      config.color === option.color
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: option.color }}
                      />
                      <span className="text-sm font-medium">{option.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Taille */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Taille</h3>
              <div className="space-y-2">
                {sizeOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setConfig({ ...config, size: option.id as any })}
                    className={`w-full p-3 rounded-lg border-2 transition-all duration-200 text-left ${
                      config.size === option.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <MapPin className={option.size} style={{ color: config.color }} />
                      <span className="text-sm font-medium">{option.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Animation */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Animation</h3>
              <div className="space-y-2">
                {animationOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setConfig({ ...config, animation: option.id as any })}
                    className={`w-full p-3 rounded-lg border-2 transition-all duration-200 text-left ${
                      config.animation === option.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <MapPin 
                        className={`w-5 h-5 ${option.class}`} 
                        style={{ color: config.color }} 
                      />
                      <span className="text-sm font-medium">{option.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Badge */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Badge</h3>
              <div className="space-y-2">
                {badgeOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setConfig({ ...config, badge: option.id })}
                    className={`w-full p-3 rounded-lg border-2 transition-all duration-200 text-left ${
                      config.badge === option.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {option.emoji && <span className="text-lg">{option.emoji}</span>}
                      <span className="text-sm font-medium">{option.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Texte personnalisé */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Texte personnalisé (optionnel)</h3>
            <input
              type="text"
              value={config.customText || ''}
              onChange={(e) => setConfig({ ...config, customText: e.target.value })}
              placeholder="Ex: NOUVEAU, PROMO, 50% OFF..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              maxLength={20}
            />
            <p className="text-xs text-gray-500 mt-1">Maximum 20 caractères</p>
          </div>

          {/* Exemples d'utilisation */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-800 mb-2">💡 Conseils d'utilisation</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• <strong>⭐ Étoile dorée + Badge PREMIUM</strong> : Pour vos terrains haut de gamme</li>
              <li>• <strong>🔥 Flamme rouge + Animation pulse</strong> : Pour les terrains populaires</li>
              <li>• <strong>👑 Couronne violette + Badge VIP</strong> : Pour l'expérience de luxe</li>
              <li>• <strong>🏆 Trophée + Badge TOP</strong> : Pour vos meilleurs terrains</li>
              <li>• <strong>⚡ Éclair + Animation bounce</strong> : Pour les réservations rapides</li>
            </ul>
          </div>

          {/* Boutons d'action */}
          <div className="flex justify-between items-center pt-4 border-t">
            <button
              onClick={resetToDefault}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Réinitialiser
            </button>
            
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <Save className="w-4 h-4" />
                Sauvegarder l'icône
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TerrainIconManager; 