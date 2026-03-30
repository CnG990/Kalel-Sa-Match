import React, { useState, useRef } from 'react';
import { Upload, FileText, Info, X, Download, MapPin } from 'lucide-react';
import apiService from '../services/api';
import toast from 'react-hot-toast';

interface GeoImportResult {
  success: boolean;
  imported_count: number;
  errors: string[];
  terrain_ids: number[];
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  importType: 'kml' | 'geojson';
}

const GeoImport: React.FC<Props> = ({ isOpen, onClose, onSuccess, importType }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [importResult, setImportResult] = useState<GeoImportResult | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fileExtension = importType === 'kml' ? '.kml' : '.geojson,.json';
  const fileLabel = importType === 'kml' ? 'KML' : 'GeoJSON';

  const handleFileSelect = (files: FileList) => {
    const validExtensions = importType === 'kml' ? ['.kml'] : ['.geojson', '.json'];
    const geoFile = Array.from(files).find(file => 
      validExtensions.some(ext => file.name.toLowerCase().endsWith(ext))
    );
    
    if (!geoFile) {
      toast.error(`Seuls les fichiers ${fileLabel} sont acceptés`);
      return;
    }
    
    setSelectedFile(geoFile);
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

  const handleImport = async () => {
    if (!selectedFile) {
      toast.error('Veuillez sélectionner un fichier');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const endpoint = importType === 'kml' 
        ? `${apiService['API_ROOT']}/admin/terrains/import-kml/`
        : `${apiService['API_ROOT']}/admin/terrains/import-geojson/`;

      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: formData,
      });

      const result = await response.json();
      
      if (result.data) {
        setImportResult(result.data as GeoImportResult);
        toast.success(`Import réussi ! ${result.data.imported_count || 0} terrain(s) importé(s)`);
        onSuccess();
      } else {
        toast.error(result.meta?.message || 'Erreur lors de l\'import');
      }
    } catch (error) {
      toast.error(`Erreur lors de l'import ${fileLabel}`);
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const resetImport = () => {
    setSelectedFile(null);
    setImportResult(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <MapPin className="w-8 h-8 text-blue-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Import {fileLabel} - Terrains Géolocalisés</h2>
              <p className="text-gray-600">Importez des terrains depuis un fichier {fileLabel}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Guide */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium text-blue-900">Format {fileLabel}</h4>
              <p className="text-sm text-blue-800 mt-1">
                {importType === 'kml' 
                  ? 'Le fichier KML doit contenir des Placemarks avec des coordonnées GPS (Point). Les noms et descriptions seront extraits automatiquement.'
                  : 'Le fichier GeoJSON doit contenir des Features de type Point. Les propriétés nom, description, adresse, prix_heure et capacite seront extraites si disponibles.'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Zone de drop */}
        <div
          className={`border-2 border-dashed p-8 rounded-lg text-center transition-colors mb-6 ${
            dragOver
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
        >
          {!selectedFile ? (
            <div className="space-y-4">
              <Upload className="w-12 h-12 text-gray-400 mx-auto" />
              <div>
                <p className="text-lg font-medium text-gray-900">
                  Glissez-déposez votre fichier {fileLabel} ici
                </p>
                <p className="text-gray-500">ou</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Parcourir les fichiers
                </button>
              </div>
              <p className="text-sm text-gray-500">
                Format accepté : {fileExtension}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-2">
                <FileText className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="font-semibold text-gray-900">{selectedFile.name}</p>
                  <p className="text-sm text-gray-500">
                    {(selectedFile.size / 1024).toFixed(1)} KB
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
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept={fileExtension}
          onChange={handleFileInput}
          className="sr-only"
        />

        {/* Résultats d'import */}
        {importResult && (
          <div className="bg-white border rounded-lg p-4 mb-6">
            <h3 className="font-medium text-gray-900 mb-4">📊 Résultats Import {fileLabel}</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center bg-green-50 p-3 rounded">
                <p className="text-2xl font-bold text-green-600">{importResult.imported_count}</p>
                <p className="text-sm text-green-800">Terrains importés</p>
              </div>
              <div className="text-center bg-red-50 p-3 rounded">
                <p className="text-2xl font-bold text-red-600">{importResult.errors.length}</p>
                <p className="text-sm text-red-800">Erreurs</p>
              </div>
            </div>

            {importResult.errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded p-3">
                <h4 className="font-medium text-red-900 mb-2">Erreurs rencontrées :</h4>
                <ul className="text-sm text-red-800 space-y-1 max-h-40 overflow-y-auto">
                  {importResult.errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}
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
            disabled={!selectedFile || isUploading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? 'Import en cours...' : `Importer ${fileLabel}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GeoImport;
