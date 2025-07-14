import React, { useState, useEffect } from 'react';
import { X, Check, AlertTriangle, RefreshCw, } from 'lucide-react';
import apiService from '../services/api';

interface DiagnosticDebugProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  data?: any;
}

const DiagnosticDebug: React.FC<DiagnosticDebugProps> = ({ isOpen, onClose }) => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [running, setRunning] = useState(false);

  const updateResult = (name: string, status: 'success' | 'error', message: string, data?: any) => {
    setResults(prev => 
      prev.map(r => r.name === name ? { ...r, status, message, data } : r)
    );
  };

  const runDiagnostics = async () => {
    setRunning(true);
    
    // Initialiser les tests
    const initialTests = [
      { name: 'Connexion Backend', status: 'pending' as const, message: 'Test en cours...' },
      { name: 'API Profile', status: 'pending' as const, message: 'Test en cours...' },
      { name: 'API Terrains Gestionnaire', status: 'pending' as const, message: 'Test en cours...' },
      { name: 'API Statistiques', status: 'pending' as const, message: 'Test en cours...' },
      { name: 'URL Images', status: 'pending' as const, message: 'Test en cours...' }
    ];
    
    setResults(initialTests);

    // Test 1: Connexion backend
    try {
      const healthResponse = await fetch('http://127.0.0.1:8000/api/health');
      if (healthResponse.ok) {
        updateResult('Connexion Backend', 'success', 'Connexion OK');
      } else {
        updateResult('Connexion Backend', 'error', `HTTP ${healthResponse.status}`);
      }
    } catch (error) {
      updateResult('Connexion Backend', 'error', 'Connexion échouée - Serveur arrêté?');
    }

    // Test 2: API Profile
    try {
      const profileResponse = await apiService.getProfile();
      if (profileResponse.success) {
        updateResult('API Profile', 'success', 'API Profile OK', profileResponse.data);
      } else {
        updateResult('API Profile', 'error', profileResponse.message || 'Échec API Profile');
      }
    } catch (error: any) {
      updateResult('API Profile', 'error', `Erreur: ${error.message}`);
    }

    // Test 3: API Terrains Gestionnaire
    try {
      const terrainsResponse = await apiService.getManagerTerrains();
      if (terrainsResponse.success) {
        updateResult('API Terrains Gestionnaire', 'success', `${terrainsResponse.data?.length || 0} terrains trouvés`, terrainsResponse.data);
      } else {
        updateResult('API Terrains Gestionnaire', 'error', terrainsResponse.message || 'Échec API Terrains');
      }
    } catch (error: any) {
      updateResult('API Terrains Gestionnaire', 'error', `Erreur: ${error.message}`);
    }

    // Test 4: API Statistiques (avec un terrain de test)
    try {
      const terrainsResponse = await apiService.getManagerTerrains();
      if (terrainsResponse.success && terrainsResponse.data?.length > 0) {
        const premierTerrain = terrainsResponse.data[0];
        const statsResponse = await apiService.getTerrainStatistiques(premierTerrain.id);
        if (statsResponse.success) {
          updateResult('API Statistiques', 'success', 'API Statistiques OK', statsResponse.data);
        } else {
          updateResult('API Statistiques', 'error', statsResponse.message || 'Échec API Statistiques');
        }
      } else {
        updateResult('API Statistiques', 'error', 'Aucun terrain pour tester');
      }
    } catch (error: any) {
      updateResult('API Statistiques', 'error', `Erreur: ${error.message}`);
    }

    // Test 5: URL Images
    try {
      const testUrls = [
        'http://127.0.0.1:8000/storage/test.jpg',
        'http://127.0.0.1:8000/storage/profiles/test.jpg',
        'http://localhost:8000/storage/test.jpg'
      ];
      
      const imagePromises = testUrls.map(url => 
        fetch(url, { method: 'HEAD' })
          .then(response => ({ url, status: response.status }))
          .catch(() => ({ url, status: 'error' }))
      );
      
      const imageResults = await Promise.all(imagePromises);
      const workingUrls = imageResults.filter(r => typeof r.status === 'number' && r.status < 404);
      
      if (workingUrls.length > 0) {
        updateResult('URL Images', 'success', `${workingUrls.length} URLs fonctionnelles`, imageResults);
      } else {
        updateResult('URL Images', 'error', 'Aucune URL d\'image accessible', imageResults);
      }
    } catch (error: any) {
      updateResult('URL Images', 'error', `Erreur: ${error.message}`);
    }

    setRunning(false);
  };

  useEffect(() => {
    if (isOpen) {
      runDiagnostics();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                🔧 Diagnostic Debug API
              </h2>
              <p className="text-gray-600">
                Test de connexion et débogage des problèmes
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={runDiagnostics}
                disabled={running}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
              >
                <RefreshCw className={`w-4 h-4 ${running ? 'animate-spin' : ''}`} />
                <span>{running ? 'Test...' : 'Relancer'}</span>
              </button>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="p-6">
          <div className="space-y-4">
            {results.map((result) => (
              <div
                key={result.name}
                className={`border rounded-lg p-4 ${
                  result.status === 'success' 
                    ? 'border-green-200 bg-green-50' 
                    : result.status === 'error'
                    ? 'border-red-200 bg-red-50'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {result.status === 'success' && <Check className="w-5 h-5 text-green-600" />}
                    {result.status === 'error' && <AlertTriangle className="w-5 h-5 text-red-600" />}
                    {result.status === 'pending' && <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />}
                    
                    <div>
                      <h3 className="font-medium text-gray-900">{result.name}</h3>
                      <p className={`text-sm ${
                        result.status === 'success' ? 'text-green-600' :
                        result.status === 'error' ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {result.message}
                      </p>
                    </div>
                  </div>
                </div>
                
                {result.data && (
                  <div className="mt-3 bg-white rounded border p-3">
                    <details>
                      <summary className="cursor-pointer font-medium text-sm text-gray-700">
                        Voir les données
                      </summary>
                      <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </details>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Solutions suggérées */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-3">🔧 Solutions courantes :</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• <strong>Connexion Backend échouée :</strong> Vérifiez que Laravel fonctionne sur <code>http://127.0.0.1:8000</code></li>
              <li>• <strong>API Profile échoue :</strong> Problème d'authentification - Reconnectez-vous</li>
              <li>• <strong>Images non trouvées :</strong> Vérifiez le dossier <code>storage/app/public</code> et le lien symbolique</li>
              <li>• <strong>API Statistiques échoue :</strong> Route backend manquante ou erreur SQL</li>
              <li>• <strong>Terrains vides :</strong> Gestionnaire non attribué à des terrains</li>
            </ul>
          </div>

          {/* Commandes utiles */}
          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-medium text-yellow-900 mb-3">⚡ Commandes Laravel utiles :</h3>
            <div className="text-sm text-yellow-800 space-y-1">
              <code className="block bg-yellow-100 p-2 rounded">php artisan storage:link</code>
              <code className="block bg-yellow-100 p-2 rounded">php artisan migrate:fresh --seed</code>
              <code className="block bg-yellow-100 p-2 rounded">php artisan serve --host=127.0.0.1 --port=8000</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiagnosticDebug; 