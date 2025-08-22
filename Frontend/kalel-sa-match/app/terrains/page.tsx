'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function TerrainsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Rediriger vers la page d'accueil car la liste des terrains est sur la page principale
    router.push('/');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Liste des Terrains</h1>
        <p className="text-gray-600">Redirection vers la page principale...</p>
        <p className="text-sm text-gray-500 mt-2">
          Consultez les terrains disponibles sur la page d'accueil
        </p>
      </div>
    </div>
  );
} 