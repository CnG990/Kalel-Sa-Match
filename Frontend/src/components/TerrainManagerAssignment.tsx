import React, { useState, useEffect } from 'react';
import { User, Users, Search, CheckCircle, X } from 'lucide-react';
import apiService from '../services/api';
import toast from 'react-hot-toast';

interface Manager {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  terrains_count?: number;
}

interface Terrain {
  id: number;
  nom: string;
  adresse: string;
  gestionnaire_id?: number;
  gestionnaire?: {
    nom: string;
    prenom: string;
    email: string;
  };
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  selectedTerrain?: Terrain;
}

const TerrainManagerAssignment: React.FC<Props> = ({ isOpen, onClose, onSuccess, selectedTerrain }) => {
  const [managers, setManagers] = useState<Manager[]>([]);
  const [terrains, setTerrains] = useState<Terrain[]>([]);
  const [selectedManagerId, setSelectedManagerId] = useState<number | null>(null);
  const [searchManager, setSearchManager] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadManagers();
      loadTerrains();
      if (selectedTerrain?.gestionnaire_id) {
        setSelectedManagerId(selectedTerrain.gestionnaire_id);
      }
    }
  }, [isOpen, selectedTerrain]);

  const loadManagers = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAllUsers();
      if (response.success) {
        // Filtrer seulement les gestionnaires
        const managersData = response.data.data?.filter((user: any) => 
          user.role === 'gestionnaire'
        ) || [];
        setManagers(managersData);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des gestionnaires:', error);
      toast.error('Erreur lors du chargement des gestionnaires');
    } finally {
      setLoading(false);
    }
  };

  const loadTerrains = async () => {
    try {
      const response = await apiService.getAllTerrains();
      if (response.success) {
        const terrainsData = response.data?.data || response.data || [];
        setTerrains(terrainsData);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des terrains:', error);
    }
  };

  const handleAssignManager = async () => {
    if (!selectedTerrain || !selectedManagerId) {
      toast.error('Veuillez sélectionner un gestionnaire');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await apiService.updateTerrain(selectedTerrain.id, {
        gestionnaire_id: selectedManagerId
      });

      if (response.success) {
        toast.success('Gestionnaire attribué avec succès !');
        onSuccess();
        onClose();
      } else {
        toast.error(response.message || 'Erreur lors de l\'attribution');
      }
    } catch (error) {
      toast.error('Erreur lors de l\'attribution du gestionnaire');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeManagerFromTerrain = async () => {
    if (!selectedTerrain) return;

    setIsSubmitting(true);
    try {
      const response = await apiService.updateTerrain(selectedTerrain.id, {
        gestionnaire_id: null
      });

      if (response.success) {
        toast.success('Gestionnaire retiré du terrain');
        onSuccess();
        onClose();
      } else {
        toast.error(response.message || 'Erreur lors du retrait');
      }
    } catch (error) {
      toast.error('Erreur lors du retrait du gestionnaire');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredManagers = managers.filter(manager =>
    manager.nom.toLowerCase().includes(searchManager.toLowerCase()) ||
    manager.prenom.toLowerCase().includes(searchManager.toLowerCase()) ||
    manager.email.toLowerCase().includes(searchManager.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <Users className="w-8 h-8 text-purple-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Attribution Gestionnaire</h2>
              <p className="text-gray-600">
                {selectedTerrain ? `Terrain: ${selectedTerrain.nom}` : 'Attribuer un gestionnaire à un terrain'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Terrain sélectionné */}
        {selectedTerrain && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-blue-900 mb-2">🏟️ Terrain Sélectionné</h3>
            <div className="text-sm text-blue-800">
              <p><strong>Nom :</strong> {selectedTerrain.nom}</p>
              <p><strong>Adresse :</strong> {selectedTerrain.adresse}</p>
              {selectedTerrain.gestionnaire ? (
                <div className="mt-2 p-2 bg-green-100 border border-green-300 rounded">
                  <p className="text-green-800">
                    <strong>Gestionnaire actuel :</strong> {selectedTerrain.gestionnaire.prenom} {selectedTerrain.gestionnaire.nom}
                    <br />
                    <small>{selectedTerrain.gestionnaire.email}</small>
                  </p>
                </div>
              ) : (
                <div className="mt-2 p-2 bg-orange-100 border border-orange-300 rounded">
                  <p className="text-orange-800">
                    <strong>Aucun gestionnaire attribué</strong>
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Recherche gestionnaire */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rechercher un gestionnaire
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchManager}
              onChange={(e) => setSearchManager(e.target.value)}
              placeholder="Nom, prénom ou email..."
              className="pl-10 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Liste des gestionnaires */}
        <div className="mb-6">
          <h3 className="font-medium text-gray-900 mb-3">Sélectionner un gestionnaire</h3>
          {loading ? (
            <div className="text-center py-4">
              <p className="text-gray-600">Chargement des gestionnaires...</p>
            </div>
          ) : filteredManagers.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-gray-600">Aucun gestionnaire trouvé</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {filteredManagers.map((manager) => {
                const isSelected = selectedManagerId === manager.id;
                const isCurrentManager = selectedTerrain?.gestionnaire_id === manager.id;
                
                return (
                  <div
                    key={manager.id}
                    onClick={() => setSelectedManagerId(manager.id)}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      isSelected
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          isSelected
                            ? 'bg-purple-600 border-purple-600'
                            : 'border-gray-300'
                        }`}>
                          {isSelected && <CheckCircle className="w-4 h-4 text-white" />}
                        </div>
                        <User className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">
                            {manager.prenom} {manager.nom}
                            {isCurrentManager && (
                              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                Actuel
                              </span>
                            )}
                          </p>
                          <p className="text-sm text-gray-600">{manager.email}</p>
                          {manager.telephone && (
                            <p className="text-sm text-gray-500">{manager.telephone}</p>
                          )}
                        </div>
                      </div>
                      {manager.terrains_count !== undefined && (
                        <div className="text-sm text-gray-500">
                          {manager.terrains_count} terrain(s)
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Statistiques */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h4 className="font-medium text-gray-900 mb-2">📊 Statistiques</h4>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{managers.length}</p>
              <p className="text-gray-600">Gestionnaires</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {terrains.filter(t => t.gestionnaire_id).length}
              </p>
              <p className="text-gray-600">Attribués</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">
                {terrains.filter(t => !t.gestionnaire_id).length}
              </p>
              <p className="text-gray-600">Sans gestionnaire</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between">
          <div>
            {selectedTerrain?.gestionnaire_id && (
              <button
                onClick={removeManagerFromTerrain}
                disabled={isSubmitting}
                className="px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 disabled:opacity-50"
              >
                Retirer le gestionnaire
              </button>
            )}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              onClick={handleAssignManager}
              disabled={!selectedManagerId || isSubmitting}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Attribution...' : 'Attribuer Gestionnaire'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TerrainManagerAssignment; 