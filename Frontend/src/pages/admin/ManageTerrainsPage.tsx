import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { PlusCircle, RefreshCw, Power, MapPin, Users, Trash2 } from 'lucide-react';

import apiService from '../../services/api';
import AddTerrainOnSiteModal from './AddTerrainOnSiteModal';
import AddTerrainRemoteModal from './AddTerrainRemoteModal';
import EditTerrainModal from './EditTerrainModal';
import TerrainManagerAssignment from '../../components/TerrainManagerAssignment';

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
  gestionnaire_id?: number | null;
  gestionnaire?: {
    id?: number;
    nom?: string;
    prenom?: string;
    email?: string;
  };
  type_surface?: string;
  nombre_joueurs?: string;
  longueur?: number | null;
  largeur?: number | null;
  eclairage?: boolean;
  vestiaires?: boolean;
  parking?: boolean;
  douches?: boolean;
  buvette?: boolean;
  telephone?: string;
  ville?: string;
  quartier?: string;
  prix_heure?: number | null;
  capacite?: number | null;
  created_at?: string;
  updated_at?: string;
}

const ManageTerrainsPageSimple: React.FC = () => {
  const [terrains, setTerrains] = useState<Terrain[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRemoteModal, setShowRemoteModal] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTerrain, setSelectedTerrain] = useState<Terrain | null>(null);

  const fetchTerrains = async () => {
    setLoading(true);
    try {
      const { data } = await apiService.getAllTerrains({ include_inactive: true });
      const terrainsData = Array.isArray(data) ? data : [];
      
      const validTerrains = terrainsData.map((terrain) => {
        const raw = terrain as any;
        const manager = raw.gestionnaire || raw.manager || null;
        return {
          ...terrain,
          id: raw.id || 0,
          nom: raw.nom || 'Terrain sans nom',
          adresse: raw.adresse || '',
          latitude: raw.latitude ? Number(raw.latitude) : undefined,
          longitude: raw.longitude ? Number(raw.longitude) : undefined,
          est_actif: raw.est_actif ?? true,
          gestionnaire_id: raw.gestionnaire_id ?? manager?.id ?? null,
          gestionnaire: manager
            ? {
                id: manager.id,
                nom: manager.nom,
                prenom: manager.prenom,
                email: manager.email,
              }
            : undefined,
        } as Terrain;
      });
      
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

  const toggleDisponibilite = async (terrain: Terrain) => {
    try {
      setTogglingId(terrain.id);
      const { data, meta } = await apiService.toggleManagerTerrainDisponibilite(terrain.id);
      if (!data) {
        toast.error(meta.message || "Impossible de changer l'état du terrain");
        return;
      }

      toast.success(meta.message || `Terrain ${data.est_actif ? 'activé' : 'désactivé'}`);
      setTerrains((prev) => prev.map((item) => (item.id === terrain.id ? { ...item, est_actif: data.est_actif } : item)));
    } catch (error) {
      toast.error("Erreur lors du changement d'état");
    } finally {
      setTogglingId(null);
    }
  };

  const deleteTerrain = async (terrain: Terrain) => {
    const confirmed = window.confirm(
      `⚠️ Supprimer définitivement "${terrain.nom}" ?\n\nCette action est irréversible. Toutes les réservations associées seront perdues.`
    );
    if (!confirmed) return;

    setDeletingId(terrain.id);
    try {
      await apiService.delete(`/terrains/terrains/${terrain.id}/`);
      toast.success(`Terrain "${terrain.nom}" supprimé.`);
      setTerrains((prev) => prev.filter((t) => t.id !== terrain.id));
    } catch (error) {
      toast.error('Erreur lors de la suppression du terrain.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Gestion des Terrains</h1>
            <p className="text-gray-500 mt-1">Surveillez l'état des terrains et ajoutez-en de nouveaux directement depuis le terrain.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={fetchTerrains}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              <RefreshCw className="w-4 h-4" /> Rafraîchir
            </button>
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
            >
              <PlusCircle className="w-4 h-4" /> Sur les lieux
            </button>
            <button
              type="button"
              onClick={() => setShowRemoteModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              <MapPin className="w-4 h-4" /> À distance
            </button>
          </div>
        </div>
        
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
                      Surface / Format
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Équipements
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Gestionnaire
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
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
                        <div className="text-sm text-gray-900 flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-orange-500" />
                          <span>{terrain.adresse}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <span className="inline-block px-2 py-0.5 rounded bg-green-50 text-green-700 text-xs font-medium">
                            {(terrain.type_surface || 'gazon_synthetique').replace(/_/g, ' ')}
                          </span>
                          <span className="ml-2 text-xs text-gray-500">{terrain.nombre_joueurs || '5v5'}</span>
                          {terrain.longueur && terrain.largeur && (
                            <span className="block text-xs text-gray-400 mt-0.5">{terrain.longueur}×{terrain.largeur}m</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1">
                          {terrain.eclairage && <span className="text-xs px-1.5 py-0.5 rounded bg-yellow-50 text-yellow-700">💡</span>}
                          {terrain.vestiaires && <span className="text-xs px-1.5 py-0.5 rounded bg-blue-50 text-blue-700">🚪</span>}
                          {terrain.parking && <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-700">🅿️</span>}
                          {terrain.douches && <span className="text-xs px-1.5 py-0.5 rounded bg-cyan-50 text-cyan-700">🚿</span>}
                          {terrain.buvette && <span className="text-xs px-1.5 py-0.5 rounded bg-orange-50 text-orange-700">🥤</span>}
                          {!terrain.eclairage && !terrain.vestiaires && !terrain.parking && !terrain.douches && !terrain.buvette && (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            terrain.est_actif 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {terrain.est_actif ? 'Actif' : 'Inactif'}
                          </span>
                          <button
                            type="button"
                            disabled={togglingId === terrain.id}
                            onClick={() => toggleDisponibilite(terrain)}
                            className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full border ${
                              terrain.est_actif
                                ? 'border-red-200 text-red-600 hover:bg-red-50'
                                : 'border-green-200 text-green-600 hover:bg-green-50'
                            } disabled:opacity-50`}
                          >
                            <Power className="w-3 h-3" />
                            {terrain.est_actif ? 'Désactiver' : 'Activer'}
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1 text-sm text-gray-900">
                          {terrain.gestionnaire ? (
                            <>
                              <span className="font-medium">
                                {terrain.gestionnaire.prenom} {terrain.gestionnaire.nom}
                              </span>
                              <span className="text-gray-500 text-xs">{terrain.gestionnaire.email}</span>
                            </>
                          ) : (
                            <span className="text-gray-400">Non attribué</span>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedTerrain(terrain);
                              setShowAssignModal(true);
                            }}
                            className="inline-flex items-center gap-1 w-fit px-3 py-1 text-xs font-semibold rounded-full border border-purple-200 text-purple-600 hover:bg-purple-50"
                          >
                            <Users className="w-3 h-3" />
                            {terrain.gestionnaire ? 'Changer' : 'Attribuer'}
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedTerrain(terrain);
                              setShowEditModal(true);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Modifier ce terrain"
                          >
                            Éditer
                          </button>
                          <button
                            type="button"
                            disabled={deletingId === terrain.id}
                            onClick={() => deleteTerrain(terrain)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors"
                            title="Supprimer ce terrain définitivement"
                          >
                            {deletingId === terrain.id ? (
                              <span className="animate-spin">⏳</span>
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                            Supprimer
                          </button>
                        </div>
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

      {showAddModal && (
        <AddTerrainOnSiteModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            fetchTerrains();
          }}
        />
      )}

      {showRemoteModal && (
        <AddTerrainRemoteModal
          onClose={() => setShowRemoteModal(false)}
          onSuccess={() => {
            setShowRemoteModal(false);
            fetchTerrains();
          }}
        />
      )}

      {showAssignModal && selectedTerrain && (
        <TerrainManagerAssignment
          isOpen={showAssignModal}
          selectedTerrain={selectedTerrain as any}
          onClose={() => {
            setShowAssignModal(false);
            setSelectedTerrain(null);
          }}
          onSuccess={() => {
            fetchTerrains();
          }}
        />
      )}

      {showEditModal && selectedTerrain && (
        <EditTerrainModal
          terrain={selectedTerrain}
          onClose={() => {
            setShowEditModal(false);
            setSelectedTerrain(null);
          }}
          onSuccess={() => {
            setShowEditModal(false);
            fetchTerrains();
          }}
        />
      )}
    </div>
  );
};

export default ManageTerrainsPageSimple;
