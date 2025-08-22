import React from 'react';
import { Ruler, Calculator, Edit, RefreshCw } from 'lucide-react';

interface TerrainSurfaceDisplayProps {
  terrain: {
    id: number;
    nom: string;
    surface_postgis?: number;
    surface?: number;
    surface_calculee?: number;
    has_geometry?: boolean;
    geometrie?: string;
    geometrie_geojson?: string;
  };
  compact?: boolean;
  showActions?: boolean;
  isCalculating?: boolean;
  onCalculate?: (terrainId: number) => void;
  onEdit?: (terrainId: number) => void;
}

const TerrainSurfaceDisplay: React.FC<TerrainSurfaceDisplayProps> = ({
  terrain,
  compact = false,
  showActions = true,
  isCalculating = false,
  onCalculate,
  onEdit
}) => {
  const getPrimarySurface = () => {
    // ✅ PRIORITÉ ABSOLUE À POSTGIS
    if (terrain.surface_postgis) return terrain.surface_postgis;
    if (terrain.surface_calculee) return terrain.surface_calculee;
    if (terrain.surface) return terrain.surface; // Fallback legacy
    return null;
  };

  const getSurfaceType = () => {
    if (terrain.surface_postgis) return 'PostGIS (Automatique)';
    if (terrain.surface_calculee) return 'PostGIS (Calculée)';
    if (terrain.surface) return 'Manuelle (Legacy)';
    return null;
  };

  const getSurfaceIcon = () => {
    if (terrain.surface_postgis) return <Calculator className="w-3 h-3 text-green-600" />;
    if (terrain.surface_calculee) return <Calculator className="w-3 h-3 text-blue-600" />;
    if (terrain.surface) return <Edit className="w-3 h-3 text-amber-600" />;
    return <Ruler className="w-3 h-3 text-gray-400" />;
  };

  const getSurfaceStatus = () => {
    if (terrain.surface_postgis) return { type: 'success', label: 'PostGIS' };
    if (terrain.surface_calculee) return { type: 'warning', label: 'Calculée' };
    if (terrain.surface) return { type: 'legacy', label: 'Manuelle' };
    return { type: 'missing', label: 'Manquante' };
  };

  const primarySurface = getPrimarySurface();
  const surfaceType = getSurfaceType();
  const surfaceIcon = getSurfaceIcon();
  const surfaceStatus = getSurfaceStatus();

  if (compact) {
    return (
      <div className="flex items-center space-x-2">
        {surfaceIcon}
        <span className={`text-sm font-medium ${
          surfaceStatus.type === 'success' ? 'text-green-700' :
          surfaceStatus.type === 'warning' ? 'text-blue-700' :
          surfaceStatus.type === 'legacy' ? 'text-amber-700' :
          'text-gray-500'
        }`}>
          {primarySurface ? `${primarySurface.toLocaleString('fr-FR')} m²` : 'N/A'}
        </span>
        {showActions && (
          <div className="flex space-x-1">
            {terrain.has_geometry && onCalculate && (
              <button
                onClick={() => onCalculate(terrain.id)}
                disabled={isCalculating}
                className="p-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:opacity-50"
                title="Recalculer avec PostGIS"
              >
                <RefreshCw className={`w-3 h-3 ${isCalculating ? 'animate-spin' : ''}`} />
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* ✅ SURFACE PRINCIPALE (POSTGIS PRIORITAIRE) */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg">
        <div className="flex items-center space-x-3">
          {surfaceIcon}
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold text-gray-800">
                {primarySurface ? `${primarySurface.toLocaleString('fr-FR')} m²` : 'Surface non calculée'}
              </span>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                surfaceStatus.type === 'success' ? 'bg-green-100 text-green-800' :
                surfaceStatus.type === 'warning' ? 'bg-blue-100 text-blue-800' :
                surfaceStatus.type === 'legacy' ? 'bg-amber-100 text-amber-800' :
                'bg-gray-100 text-gray-600'
              }`}>
                {surfaceStatus.label}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1">{surfaceType}</p>
          </div>
        </div>

        {showActions && (
          <div className="flex space-x-2">
            {terrain.has_geometry && onCalculate && (
              <button
                onClick={() => onCalculate(terrain.id)}
                disabled={isCalculating}
                className="flex items-center space-x-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Recalculer automatiquement avec PostGIS"
              >
                <RefreshCw className={`w-4 h-4 ${isCalculating ? 'animate-spin' : ''}`} />
                <span className="text-sm font-medium">
                  {isCalculating ? 'Calcul...' : 'Recalculer'}
                </span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* ✅ DÉTAILS TECHNIQUES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Statut géométrie */}
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <div className={`w-2 h-2 rounded-full ${terrain.has_geometry ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm font-medium text-gray-700">Géométrie</span>
          </div>
          <p className="text-xs text-gray-600">
            {terrain.has_geometry ? 'Définie (PostGIS prêt)' : 'Non définie (calcul impossible)'}
          </p>
        </div>

        {/* Méthode de calcul */}
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Calculator className="w-3 h-3 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">Méthode</span>
          </div>
          <p className="text-xs text-gray-600">
            {terrain.surface_postgis ? 
              'ST_Area + Transform EPSG:32628' : 
              terrain.has_geometry ? 
                'PostGIS disponible (non calculé)' : 
                'Géométrie requise'
            }
          </p>
        </div>
      </div>

      {/* ✅ SURFACES MULTIPLES (si existantes) */}
      {(terrain.surface_postgis && terrain.surface) && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <h4 className="text-sm font-medium text-amber-800 mb-2">⚠️ Surfaces multiples détectées</h4>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-amber-700">📝 Surface manuelle (legacy) :</span>
              <span className="font-medium">{terrain.surface.toLocaleString('fr-FR')} m²</span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-700">🔧 Surface PostGIS (utilisée) :</span>
              <span className="font-medium">{terrain.surface_postgis.toLocaleString('fr-FR')} m²</span>
            </div>
            {Math.abs(terrain.surface_postgis - terrain.surface) > 10 && (
              <p className="text-amber-700 mt-2">
                Différence significative détectée. La surface PostGIS est prioritaire.
              </p>
            )}
          </div>
        </div>
      )}

      {/* ✅ ACTIONS */}
      {!terrain.has_geometry && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">
            <span className="font-medium">Géométrie manquante :</span> 
            Importez un fichier KML ou définissez manuellement les coordonnées pour calculer la surface automatiquement.
          </p>
        </div>
      )}
    </div>
  );
};

export default TerrainSurfaceDisplay; 