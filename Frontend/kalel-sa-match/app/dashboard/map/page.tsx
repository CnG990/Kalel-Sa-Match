'use client';

import { useEffect } from 'react';

export default function MapPage() {
  useEffect(() => {
    // Redirection immédiate et forcée
    if (typeof window !== 'undefined') {
      window.location.replace('/');
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">Carte des Terrains</h1>
        <p className="text-gray-600 mb-4">Redirection vers la page principale...</p>
        <p className="text-sm text-gray-500 mb-6">
          Cette fonctionnalité sera bientôt disponible
        </p>
        <div className="space-y-2">
          <a 
            href="/" 
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Aller à l'accueil
          </a>
          <br />
          <a 
            href="/terrains" 
            className="inline-block bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Voir les terrains
          </a>
        </div>
        <div className="mt-6 text-xs text-gray-400">
          <p>Si la redirection ne fonctionne pas, utilisez les liens ci-dessus</p>
        </div>
      </div>
    </div>
  );
} 