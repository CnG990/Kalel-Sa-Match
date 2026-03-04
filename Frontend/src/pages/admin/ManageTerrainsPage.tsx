import React, { useState, useEffect } from 'react';
import apiService from '../../services/api';
import toast from 'react-hot-toast';

interface Terrain {
  id: number;
  nom: string;
  description?: string;
  adresse: string;
  latitude?: number;
  longitude?: number;
  image_principale?: string;
  images?: string[];
  est_actif: boolean;
  created_at?: string;
  updated_at?: string;
}

const ManageTerrainsPageSimple: React.FC = () => {
  const [terrains, setTerrains] = useState<Terrain[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTerrains = async () => {
    setLoading(true);
    try {
      const response = await apiService.getAllTerrains();
      const terrainsData = Array.isArray(response) ? response : [];
      
      const validTerrains = terrainsData.map(terrain => ({
        ...terrain,
        id: terrain.id || 0,
        nom: terrain.nom || 'Terrain sans nom',
        adresse: terrain.adresse || '',
        latitude: terrain.latitude ? Number(terrain.latitude) : undefined,
        longitude: terrain.longitude ? Number(terrain.longitude) : undefined,
        est_actif: terrain.est_actif ?? true
      }));
      
      setTerrains(validTerrains);
    } catch (error) {
      console.error('Erreur API:', error);
      toast.error("Impossible de charger les terrains.");
      setTerrains([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTerrains();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Gestion des Terrains</h1>
        
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement...</p>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">
                Liste des Terrains ({terrains.length})
              </h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nom
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Adresse
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Coordonnées
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {terrains.map((terrain) => (
                    <tr key={terrain.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{terrain.nom}</div>
                        {terrain.description && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">{terrain.description}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{terrain.adresse}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {terrain.latitude && terrain.longitude ? (
                            `${terrain.latitude}, ${terrain.longitude}`
                          ) : (
                            <span className="text-gray-400">Non défini</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          terrain.est_actif 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {terrain.est_actif ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {terrains.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">Aucun terrain trouvé</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageTerrainsPageSimple;
