'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function MapPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Rediriger vers la page d'accueil car la carte n'est pas encore implémentée
    router.push('/');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Carte des Terrains</h1>
        <p className="text-gray-600">Redirection vers la page principale...</p>
        <p className="text-sm text-gray-500 mt-2">
          Cette fonctionnalité sera bientôt disponible
        </p>
      </div>
    </div>
  );
} 