'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MapPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirection immédiate
    window.location.href = '/';
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Carte des Terrains</h1>
        <p className="text-gray-600">Redirection vers la page principale...</p>
        <p className="text-sm text-gray-500 mt-2">
          Cette fonctionnalité sera bientôt disponible
        </p>
        <div className="mt-4">
          <a 
            href="/" 
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Cliquez ici si la redirection ne fonctionne pas
          </a>
        </div>
      </div>
    </div>
  );
} 