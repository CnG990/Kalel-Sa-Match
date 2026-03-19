import React, { useState, useEffect } from 'react';
import { X, Camera, AlertCircle, CheckCircle, Info, RefreshCw } from 'lucide-react';

interface ProfileImageDebugProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: number;
  currentImageUrl?: string;
}

interface ImageTestResult {
  url: string;
  status: 'loading' | 'success' | 'error';
  responseTime?: number;
  error?: string;
}

const ProfileImageDebug: React.FC<ProfileImageDebugProps> = ({
  isOpen,
  onClose,
  userId,
  currentImageUrl
}) => {
  const [testResults, setTestResults] = useState<ImageTestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [serverInfo, setServerInfo] = useState<any>(null);

  const testUrls = [
    currentImageUrl,
    `http://127.0.0.1:8000/storage/profile-images/default.jpg`,
    `http://localhost:8000/storage/profile-images/default.jpg`,
    `https://ui-avatars.com/api/?name=Test&background=random&size=160`,
  ].filter(Boolean) as string[];

  const testImageUrl = async (url: string): Promise<ImageTestResult> => {
    const startTime = Date.now();
    
    return new Promise((resolve) => {
      const img = new Image();
      
      img.onload = () => {
        resolve({
          url,
          status: 'success',
          responseTime: Date.now() - startTime
        });
      };
      
      img.onerror = () => {
        resolve({
          url,
          status: 'error',
          responseTime: Date.now() - startTime,
          error: 'Image failed to load'
        });
      };
      
      // Timeout après 10 secondes
      setTimeout(() => {
        resolve({
          url,
          status: 'error',
          responseTime: Date.now() - startTime,
          error: 'Timeout (10s)'
        });
      }, 10000);
      
      img.src = url;
    });
  };

  const runTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    
    for (const url of testUrls) {
      setTestResults(prev => [...prev, { url, status: 'loading' }]);
      
      const result = await testImageUrl(url);
      
      setTestResults(prev => 
        prev.map(item => 
          item.url === url ? result : item
        )
      );
    }
    
    setIsRunning(false);
  };

  const checkServerConnection = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': 'application/json',
        }
      });
      
      const data = await response.json();
      setServerInfo({
        status: response.status,
        ok: response.ok,
        data: data,
        headers: Object.fromEntries(response.headers.entries())
      });
    } catch (error: any) {
      setServerInfo({
        error: error.message,
        type: 'connection_error'
      });
    }
  };

  useEffect(() => {
    if (isOpen) {
      runTests();
      checkServerConnection();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b bg-gray-50 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Camera className="w-6 h-6 mr-2 text-blue-600" />
              Debug Photo de Profil
            </h2>
            <p className="text-gray-600">Diagnostic des problèmes de chargement d'images</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Info utilisateur */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2 flex items-center">
              <Info className="w-4 h-4 mr-2" />
              Informations utilisateur
            </h3>
            <div className="text-sm text-blue-800 space-y-1">
              <p><strong>ID Utilisateur:</strong> {userId || 'Non défini'}</p>
              <p><strong>URL Image actuelle:</strong> {currentImageUrl || 'Aucune'}</p>
              <p><strong>Token présent:</strong> {localStorage.getItem('token') ? '✅ Oui' : '❌ Non'}</p>
              <p><strong>User Agent:</strong> {navigator.userAgent}</p>
            </div>
          </div>

          {/* Test des URLs */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-900">Test de chargement des images</h3>
              <button
                onClick={runTests}
                disabled={isRunning}
                className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isRunning ? 'animate-spin' : ''}`} />
                {isRunning ? 'Test en cours...' : 'Relancer les tests'}
              </button>
            </div>

            <div className="space-y-3">
              {testResults.map((result, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
                  <div className="flex-shrink-0">
                    {result.status === 'loading' && (
                      <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    )}
                    {result.status === 'success' && (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    )}
                    {result.status === 'error' && (
                      <AlertCircle className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <p className="text-sm font-mono text-gray-800 break-all">{result.url}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-600 mt-1">
                      <span>Status: {result.status}</span>
                      {result.responseTime && <span>Temps: {result.responseTime}ms</span>}
                      {result.error && <span className="text-red-600">Erreur: {result.error}</span>}
                    </div>
                  </div>
                  
                  {result.status === 'success' && (
                    <div className="flex-shrink-0">
                      <img
                        src={result.url}
                        alt="Test"
                        className="w-12 h-12 rounded-full object-cover border-2 border-green-200"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Info serveur */}
          {serverInfo && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3">État de la connexion serveur</h3>
              <div className="text-sm space-y-2">
                {serverInfo.error ? (
                  <div className="bg-red-50 border border-red-200 rounded p-3">
                    <p className="text-red-800"><strong>Erreur:</strong> {serverInfo.error}</p>
                    <p className="text-red-600 mt-1">Le serveur backend n'est pas accessible</p>
                  </div>
                ) : (
                  <div className="bg-green-50 border border-green-200 rounded p-3">
                    <p className="text-green-800"><strong>Status:</strong> {serverInfo.status} {serverInfo.ok ? '✅' : '❌'}</p>
                    {serverInfo.data?.data?.profile_image_url && (
                      <p className="text-green-700 mt-1">
                        <strong>Image URL du serveur:</strong> {serverInfo.data.data.profile_image_url}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Solutions recommandées */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-medium text-yellow-900 mb-3">Solutions recommandées</h3>
            <ul className="text-sm text-yellow-800 space-y-2">
              <li>• Vérifiez que le serveur backend Laravel est démarré sur le port 8000</li>
              <li>• Assurez-vous que le dossier storage/profile-images existe et est accessible</li>
              <li>• Vérifiez les permissions du dossier storage/app/public</li>
              <li>• Exécutez `php artisan storage:link` dans le backend</li>
              <li>• Testez l'accès direct à: http://127.0.0.1:8000/storage/profile-images/</li>
              <li>• Vérifiez que les extensions GD ou ImageMagick sont installées sur PHP</li>
            </ul>
          </div>

          {/* Boutons d'action */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              onClick={() => window.open('http://127.0.0.1:8000/storage/', '_blank')}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Tester Storage
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileImageDebug; 