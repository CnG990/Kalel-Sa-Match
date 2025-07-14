import React, { useState, useRef, useEffect } from 'react';
import { Upload, Globe, CheckCircle, AlertTriangle, Info, X, FileText } from 'lucide-react';
import apiService from '../services/api';
import toast from 'react-hot-toast';

interface KMLImportResult {
  success: boolean;
  processed_files: number;
  success_count: number;
  total_surface: number;
  surface_moyenne: number;
  results: Array<{
    success: boolean;
    terrain_id?: number;
    terrain_name?: string;
    surface?: number;
    points_count?: number;
    file_name: string;
    error?: string;
  }>;
  errors: string[];
  terrains_updated: Array<any>;
}

interface PostGISStats {
  total_terrains: number;
  avec_postgis: number;
  pourcentage_postgis: number;
  surface_totale_postgis: number;
  surface_moyenne_postgis: number;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const KMLGoogleEarthImport: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [importResult, setImportResult] = useState<KMLImportResult | null>(null);
  const [postgisStats, setPostgisStats] = useState<PostGISStats | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      loadPostGISStats();
    }
  }, [isOpen]);

  const loadPostGISStats = async () => {
    try {
      const response = await apiService.getPostGISStats();
      if (response.success) {
        setPostgisStats(response.data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des stats PostGIS:', error);
    }
  };

  const handleFileSelect = (files: FileList) => {
    const kmlFiles = Array.from(files).filter(file => 
      file.name.toLowerCase().endsWith('.kml')
    );
    
    if (kmlFiles.length !== files.length) {
      toast.error('Seuls les fichiers KML sont acceptés');
    }
    
    setSelectedFiles(kmlFiles);
    setImportResult(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFileSelect(e.target.files);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(files => files.filter((_, i) => i !== index));
  };

  const handleImport = async () => {
    if (selectedFiles.length === 0) {
      toast.error('Veuillez sélectionner des fichiers KML');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      selectedFiles.forEach((file, index) => {
        formData.append(`files[${index}]`, file);
      });

      const response = await apiService.importKMLBatch(formData);
      
      if (response.success) {
        setImportResult(response.data as KMLImportResult);
        toast.success(`Import réussi ! ${response.data.success_count}/${response.data.processed_files} fichiers traités`);
        loadPostGISStats(); // Actualiser les stats
        onSuccess(); // Actualiser la liste des terrains
      } else {
        toast.error(response.message || 'Erreur lors de l\'import');
      }
    } catch (error) {
      toast.error('Erreur lors de l\'import KML');
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const resetImport = () => {
    setSelectedFiles([]);
    setImportResult(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <Globe className="w-8 h-8 text-green-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Import KML Google Earth</h2>
              <p className="text-gray-600">Importez vos géométries Google Earth pour calcul automatique des surfaces</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Statistiques PostGIS actuelles */}
        {postgisStats && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-blue-900 mb-3">📊 État Actuel PostGIS</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{postgisStats.total_terrains}</p>
                <p className="text-blue-800">Total Terrains</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{postgisStats.avec_postgis}</p>
                <p className="text-green-800">Avec PostGIS</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{postgisStats.pourcentage_postgis}%</p>
                <p className="text-purple-800">Couverture</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">{Math.round(postgisStats.surface_totale_postgis).toLocaleString()}</p>
                <p className="text-orange-800">m² Total</p>
              </div>
            </div>
          </div>
        )}

        {/* Guide rapide */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <Info className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-green-900">Guide Rapide</h4>
              <ul className="text-sm text-green-800 mt-2 space-y-1">
                <li>• Nommez vos fichiers KML avec le nom exact du terrain</li>
                <li>• Le système fait la correspondance automatiquement</li>
                <li>• Les surfaces sont calculées avec PostGIS (précision satellite)</li>
                <li>• Projection UTM Zone 28N pour le Sénégal</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Zone de drop */}
        <div
          className={`border-2 border-dashed p-8 rounded-lg text-center transition-colors mb-6 ${
            dragOver
              ? 'border-green-500 bg-green-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
        >
          {selectedFiles.length === 0 ? (
            <div className="space-y-4">
              <Upload className="w-12 h-12 text-gray-400 mx-auto" />
              <div>
                <p className="text-lg font-medium text-gray-900">
                  Glissez-déposez vos fichiers KML ici
                </p>
                <p className="text-gray-500">ou</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Parcourir les fichiers
                </button>
              </div>
              <p className="text-sm text-gray-500">
                Formats acceptés : .kml (Google Earth)
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">
                {selectedFiles.length} fichier(s) sélectionné(s)
              </h4>
              <div className="max-h-32 overflow-y-auto space-y-2">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium">{file.name}</span>
                      <span className="text-xs text-gray-500">
                        ({(file.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".kml"
          onChange={handleFileInput}
          className="sr-only"
        />

        {/* Résultats d'import */}
        {importResult && (
          <div className="bg-white border rounded-lg p-4 mb-6">
            <h3 className="font-medium text-gray-900 mb-4">📊 Résultats Import</h3>
            
            {/* Statistiques globales */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center bg-blue-50 p-3 rounded">
                <p className="text-2xl font-bold text-blue-600">{importResult.processed_files}</p>
                <p className="text-sm text-blue-800">Fichiers traités</p>
              </div>
              <div className="text-center bg-green-50 p-3 rounded">
                <p className="text-2xl font-bold text-green-600">{importResult.success_count}</p>
                <p className="text-sm text-green-800">Succès</p>
              </div>
              <div className="text-center bg-purple-50 p-3 rounded">
                <p className="text-2xl font-bold text-purple-600">{Math.round(importResult.total_surface).toLocaleString()}</p>
                <p className="text-sm text-purple-800">m² Total</p>
              </div>
              <div className="text-center bg-orange-50 p-3 rounded">
                <p className="text-2xl font-bold text-orange-600">{Math.round(importResult.surface_moyenne).toLocaleString()}</p>
                <p className="text-sm text-orange-800">m² Moyenne</p>
              </div>
            </div>

            {/* Détails par fichier */}
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {importResult.results.map((result, index) => (
                <div key={index} className={`flex items-center justify-between p-2 rounded ${
                  result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                }`}>
                  <div className="flex items-center space-x-3">
                    {result.success ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                    )}
                    <div>
                      <p className="text-sm font-medium">
                        {result.success ? result.terrain_name : result.file_name}
                      </p>
                      {result.success ? (
                        <p className="text-xs text-gray-600">
                          Surface: {Math.round(result.surface || 0).toLocaleString()} m² • 
                          Points: {result.points_count}
                        </p>
                      ) : (
                        <p className="text-xs text-red-600">{result.error}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={resetImport}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Réinitialiser
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Fermer
          </button>
          <button
            onClick={handleImport}
            disabled={selectedFiles.length === 0 || isUploading}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? 'Import en cours...' : `Importer ${selectedFiles.length} fichier(s)`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default KMLGoogleEarthImport; 