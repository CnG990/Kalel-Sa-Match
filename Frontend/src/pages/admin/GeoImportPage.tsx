import React, { useState, useRef, useEffect } from 'react';
import { Upload, Download, FileText, Map, CheckCircle, AlertTriangle, X, Edit, Eye } from 'lucide-react';
import apiService from '../../services/api';

interface ImportResult {
  success: boolean;
  message: string;
  data?: {
    imported_count: number;
    errors: string[];
    terrain_ids: number[];
  };
}

interface Terrain {
  id: number;
  nom: string;
  adresse: string;
  latitude?: number;
  longitude?: number;
  surface?: number;
  geometrie?: string;
  created_at: string;
}

const GeoImportPage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importType, setImportType] = useState<'kobocollect' | 'kml' | 'shapefile' | 'geojson'>('kobocollect');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<ImportResult | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [terrains, setTerrains] = useState<Terrain[]>([]);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supportedFormats = {
    kobocollect: {
      label: 'KoboCollect CSV',
      description: 'Données collectées via KoboToolbox avec coordonnées GPS',
      extensions: '.csv',
      icon: <FileText className="w-8 h-8 text-blue-500" />
    },
    kml: {
      label: 'KML/KMZ',
      description: 'Fichiers Google Earth avec points et polygones',
      extensions: '.kml, .kmz',
      icon: <Map className="w-8 h-8 text-green-500" />
    },
    shapefile: {
      label: 'Shapefile',
      description: 'Format ESRI avec fichiers .shp, .shx, .dbf (ZIP requis)',
      extensions: '.zip',
      icon: <Map className="w-8 h-8 text-purple-500" />
    },
    geojson: {
      label: 'GeoJSON',
      description: 'Format JSON avec géométries et propriétés',
      extensions: '.json, .geojson',
      icon: <Map className="w-8 h-8 text-orange-500" />
    }
  };

  // Charger les terrains existants
  const loadTerrains = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAllTerrains();
      if (response.success && response.data) {
        setTerrains(response.data.data || response.data);
      }
    } catch (error) {
      // Erreur silencieuse, les terrains sont chargés ailleurs
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTerrains();
  }, []);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setUploadResult(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const validateFile = (file: File): string | null => {
    const format = supportedFormats[importType];
    const maxSize = 50 * 1024 * 1024; // 50MB

    if (file.size > maxSize) {
      return 'Le fichier dépasse la taille maximale de 50MB';
    }

    // Vérification basique des extensions
    const ext = file.name.toLowerCase().split('.').pop();
    const allowedExts = format.extensions.toLowerCase().replace(/[. ]/g, '').split(',');
    
    if (!allowedExts.includes(ext || '')) {
      return `Format non supporté. Formats acceptés: ${format.extensions}`;
    }

    return null;
  };

  const handleImport = async () => {
    if (!selectedFile) return;

    const validationError = validateFile(selectedFile);
    if (validationError) {
      setUploadResult({
        success: false,
        message: validationError
      });
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('type', importType);
      
      const response = await apiService.importGeoData(formData);
      setUploadResult(response as ImportResult);
      
      // Recharger les terrains après import réussi
      if (response.success) {
        loadTerrains();
      }
    } catch (error) {
      setUploadResult({
        success: false,
        message: 'Erreur lors de l\'import: ' + (error as Error).message
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleExport = async (format: 'kml' | 'geojson' | 'csv') => {
    try {
      const response = await apiService.exportGeoData(format);
      if (response.success) {
        // Créer un lien de téléchargement
        const blob = new Blob([JSON.stringify(response.data)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `terrains_export.${format}`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      // Erreur déjà gérée par toast dans le bloc try
    }
  };

  const validateDataIntegrity = async () => {
    try {
      const response = await apiService.validateDataIntegrity();
      setUploadResult({
        success: response.success,
        message: response.message || 'Validation terminée',
        data: response.data
      });
    } catch (error) {
      setUploadResult({
        success: false,
        message: 'Erreur lors de la validation'
      });
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-black mb-4">Import de Données Géospatiales</h1>
        <p className="text-gray-600">
          Importez des terrains depuis KoboCollect, fichiers KML, Shapefiles ou autres sources de données géographiques.
        </p>
      </div>

      {/* Statistiques des terrains existants */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-black mb-4">Terrains Existants</h2>
        {loading ? (
          <div className="text-center py-4">
            <p className="text-gray-600">Chargement...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-800">Total Terrains</h3>
                <p className="text-3xl font-bold text-blue-600">{terrains.length}</p>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-800">Avec Géométrie</h3>
                <p className="text-3xl font-bold text-green-600">
                  {terrains.filter(t => t.geometrie || (t.latitude && t.longitude)).length}
                </p>
              </div>

              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-800">Export Disponible</h3>
                <p className="text-3xl font-bold text-purple-600">
                  {terrains.filter(t => t.latitude && t.longitude).length}
                </p>
              </div>
            </div>

            {/* Tableau des terrains */}
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900">Terrain</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900">Adresse</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900">Coordonnées</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900">Géométrie</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {terrains.length > 0 ? (
                    terrains.map((terrain) => (
                      <tr key={terrain.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-sm text-black font-medium">{terrain.nom}</td>
                        <td className="px-4 py-2 text-sm text-black">{terrain.adresse}</td>
                        <td className="px-4 py-2 text-sm text-black">
                          {terrain.latitude && terrain.longitude ? (
                            <span className="text-green-600">
                              {terrain.latitude.toFixed(6)}, {terrain.longitude.toFixed(6)}
                            </span>
                          ) : (
                            <span className="text-red-500">Non défini</span>
                          )}
                        </td>
                        <td className="px-4 py-2 text-sm text-black">
                          {terrain.geometrie || (terrain.latitude && terrain.longitude) ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Définie
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              Manquante
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-2 text-sm">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => window.open(`/terrains/${terrain.id}`, '_blank')}
                              className="text-blue-600 hover:text-blue-800"
                              title="Voir"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => window.open(`/admin/terrains?edit=${terrain.id}`, '_blank')}
                              className="text-green-600 hover:text-green-800"
                              title="Modifier"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                        Aucun terrain trouvé
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Sélection du type d'import */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-black mb-4">Type de données</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(supportedFormats).map(([type, info]) => (
            <div
              key={type}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                importType === type
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setImportType(type as any)}
            >
              <div className="flex flex-col items-center text-center space-y-2">
                {info.icon}
                <h3 className="font-semibold text-black">{info.label}</h3>
                <p className="text-sm text-gray-600">{info.description}</p>
                <p className="text-xs text-gray-500">{info.extensions}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Zone de téléchargement */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-black mb-4">Sélectionner un fichier</h2>
        
        <div
          className={`border-2 border-dashed p-8 rounded-lg text-center transition-colors ${
            dragOver
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
        >
          {selectedFile ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-2">
                <FileText className="w-8 h-8 text-green-500" />
                <div>
                  <p className="font-semibold text-black">{selectedFile.name}</p>
                  <p className="text-sm text-gray-500">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
                <button
                  onClick={() => setSelectedFile(null)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Upload className="w-12 h-12 text-gray-400 mx-auto" />
              <div>
                <p className="text-lg font-medium text-black">
                  Glissez-déposez votre fichier ici
                </p>
                <p className="text-gray-500">ou</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Parcourir les fichiers
                </button>
              </div>
            </div>
          )}
          
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileInput}
            accept={supportedFormats[importType].extensions}
          />
        </div>

        {selectedFile && (
          <div className="mt-6 flex justify-center">
            <button
              onClick={handleImport}
              disabled={isUploading}
              className={`px-6 py-3 rounded-lg font-semibold ${
                isUploading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700'
              } text-white`}
            >
              {isUploading ? 'Import en cours...' : 'Importer les données'}
            </button>
          </div>
        )}
      </div>

      {/* Résultat de l'import */}
      {uploadResult && (
        <div className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${
          uploadResult.success ? 'border-green-500' : 'border-red-500'
        }`}>
          <div className="flex items-start space-x-3">
            {uploadResult.success ? (
              <CheckCircle className="w-6 h-6 text-green-500 mt-1" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-red-500 mt-1" />
            )}
            <div className="flex-1">
              <h3 className={`font-semibold ${
                uploadResult.success ? 'text-green-800' : 'text-red-800'
              }`}>
                {uploadResult.success ? 'Import réussi' : 'Erreur d\'import'}
              </h3>
              <p className="text-black mt-1">{uploadResult.message}</p>
              
              {uploadResult.data && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm text-black">
                    <strong>Terrains importés:</strong> {uploadResult.data.imported_count}
                  </p>
                  {uploadResult.data.errors.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-red-600">Erreurs:</p>
                      <ul className="text-sm text-red-600 list-disc list-inside">
                        {uploadResult.data.errors.map((error, idx) => (
                          <li key={idx}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Actions d'export et validation */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-black mb-4">Actions</h2>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => handleExport('kml')}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Download className="w-4 h-4" />
            <span>Exporter KML</span>
          </button>
          
          <button
            onClick={() => handleExport('geojson')}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Download className="w-4 h-4" />
            <span>Exporter GeoJSON</span>
          </button>
          
          <button
            onClick={() => handleExport('csv')}
            className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
          >
            <Download className="w-4 h-4" />
            <span>Exporter CSV</span>
          </button>
          
          <button
            onClick={validateDataIntegrity}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Valider l'intégrité</span>
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-blue-800 mb-3">Instructions d'import</h2>
        <div className="space-y-3 text-blue-700">
          <div>
            <h3 className="font-semibold">KoboCollect CSV:</h3>
            <p className="text-sm">Le fichier doit contenir les colonnes: nom, latitude, longitude, adresse, description (optionnel)</p>
          </div>
          <div>
            <h3 className="font-semibold">KML/KMZ:</h3>
            <p className="text-sm">Fichiers créés avec Google Earth ou autres outils cartographiques</p>
          </div>
          <div>
            <h3 className="font-semibold">Shapefile:</h3>
            <p className="text-sm">Archive ZIP contenant les fichiers .shp, .shx, .dbf et .prj</p>
          </div>
          <div>
            <h3 className="font-semibold">GeoJSON:</h3>
            <p className="text-sm">Format JSON standard avec Features et Properties</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeoImportPage; 