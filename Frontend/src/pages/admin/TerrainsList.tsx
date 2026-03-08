import { useState, useEffect } from 'react';
import apiService from '../../services/api';

interface Terrain {
  id: number;
  nom: string;
  adresse: string;
  est_actif: boolean;
}

export default function TerrainsList() {
  const [terrains, setTerrains] = useState<Terrain[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadTerrains = async () => {
      setLoading(true);
      try {
        const { data } = await apiService.getAllTerrains({ include_inactive: true });
        const terrainsData = Array.isArray(data) ? data : [];
        setTerrains(terrainsData.map(t => ({ ...t, est_actif: t.est_actif ?? true })));
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadTerrains();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Terrains ({terrains.length})</h1>
      
      {loading ? (
        <div>Chargement...</div>
      ) : (
        <div className="space-y-4">
          {terrains.map(terrain => (
            <div key={terrain.id} className="border p-4 rounded">
              <h3>{terrain.nom}</h3>
              <p>{terrain.adresse}</p>
              <span className={`px-2 py-1 text-xs rounded ${
                terrain.est_actif 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {terrain.est_actif ? 'Actif' : 'Inactif'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
