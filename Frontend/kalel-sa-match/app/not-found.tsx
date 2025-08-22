'use client';

import { useEffect } from 'react';

export default function NotFound() {
  useEffect(() => {
    // Redirection après 3 secondes
    const timer = setTimeout(() => {
      window.location.replace('/');
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md mx-auto">
        <h1 className="text-4xl font-bold mb-4 text-gray-800">404</h1>
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">Page non trouvée</h2>
        <p className="text-gray-600 mb-6">
          La page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        <div className="space-y-3">
          <a 
            href="/" 
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retour à l'accueil
          </a>
          <br />
          <a 
            href="/terrains" 
            className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            Voir les terrains
          </a>
        </div>
        <div className="mt-6 text-sm text-gray-500">
          <p>Redirection automatique dans 3 secondes...</p>
        </div>
      </div>
    </div>
  );
} 