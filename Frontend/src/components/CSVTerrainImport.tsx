import React, { useState, useRef } from 'react';
import { Upload, FileText, Info, X, Download } from 'lucide-react';
import apiService from '../services/api';
import toast from 'react-hot-toast';

interface CSVImportResult {
  success: boolean;
  imported_count: number;
  errors: string[];
  terrain_ids: number[];
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CSVTerrainImport: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [importResult, setImportResult] = useState<CSVImportResult | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (files: FileList) => {
    const csvFile = Array.from(files).find(file => 
      file.name.toLowerCase().endsWith('.csv')
    );
    
    if (!csvFile) {
      toast.error('Seuls les fichiers CSV sont acceptés');
      return;
    }
    
    setSelectedFile(csvFile);
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
      toast.error('Veuillez sélectionner un fichier CSV');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('type', 'csv');

      const response = await apiService.importGeoData(formData);
      
      if (response.success) {
        setImportResult(response.data as CSVImportResult);
        toast.success(`Import réussi ! ${response.data.imported_count} terrain(s) importé(s)`);
        onSuccess(); // Actualiser la liste des terrains
      } else {
        toast.error(response.message || 'Erreur lors de l\'import');
      }
    } catch (error) {
      toast.error('Erreur lors de l\'import CSV');
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = [
      'nom,description,adresse,latitude,longitude,prix_heure,capacite',
      'Terrain Exemple,Description du terrain,Adresse Dakar,14.6937,-17.4441,15000,22',
      'Terrain Test,Terrain pour tests,Yoff Dakar,14.7392,-17.4692,20000,18'
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template_terrains.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Template CSV téléchargé !');
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
            <FileText className="w-8 h-8 text-blue-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Import CSV - Nouveaux Terrains</h2>
              <p className="text-gray-600">Méthode recommandée pour ajouter plusieurs terrains rapidement</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Guide et Template */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium text-blue-900">Format CSV Requis</h4>
              <p className="text-sm text-blue-800 mt-1">
                Votre fichier CSV doit contenir les colonnes : <code>nom, description, adresse, latitude, longitude, prix_heure, capacite</code>
              </p>
              <button
                onClick={downloadTemplate}
                className="mt-2 inline-flex items-center text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
              >
                <Download className="w-4 h-4 mr-1" />
                Télécharger Template CSV
              </button>
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
                  Glissez-déposez votre fichier CSV ici
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
                Format accepté : .csv uniquement
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
          accept=".csv"
          onChange={handleFileInput}
          className="sr-only"
        />

        {/* Résultats d'import */}
        {importResult && (
          <div className="bg-white border rounded-lg p-4 mb-6">
            <h3 className="font-medium text-gray-900 mb-4">📊 Résultats Import CSV</h3>
            
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
                <ul className="text-sm text-red-800 space-y-1">
                  {importResult.errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Instructions détaillées */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h4 className="font-medium text-gray-900 mb-3">💡 Instructions</h4>
          <div className="space-y-2 text-sm text-gray-700">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p><strong>Colonnes obligatoires :</strong></p>
                <ul className="mt-1 space-y-1">
                  <li>• <code>nom</code> - Nom du terrain</li>
                  <li>• <code>latitude</code> - Coordonnée GPS</li>
                  <li>• <code>longitude</code> - Coordonnée GPS</li>
                </ul>
              </div>
              <div>
                <p><strong>Colonnes optionnelles :</strong></p>
                <ul className="mt-1 space-y-1">
                  <li>• <code>description</code> - Description</li>
                  <li>• <code>adresse</code> - Adresse complète</li>
                  <li>• <code>prix_heure</code> - Prix FCFA/h</li>
                  <li>• <code>capacite</code> - Nb personnes</li>
                </ul>
              </div>
            </div>
            <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-yellow-800">
                <strong>Note :</strong> Après l'import, vous pourrez attribuer chaque terrain à un gestionnaire 
                et ajouter des images via l'interface de gestion.
              </p>
            </div>
          </div>
        </div>

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
            {isUploading ? 'Import en cours...' : 'Importer CSV'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CSVTerrainImport; 