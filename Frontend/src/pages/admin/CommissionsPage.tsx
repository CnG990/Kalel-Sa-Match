import React, { useState, useEffect } from 'react';
import apiService from '../../services/api';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, Loader2 } from 'lucide-react';

interface ContratCommission {
  id: number;
  gestionnaire_id: number;
  gestionnaire: {
    id: number;
    nom: string;
    prenom: string;
    email: string;
  };
  taux_commission: number;
  type_contrat: 'global' | 'par_terrain';
  date_debut: string;
  date_fin?: string;
  statut: 'actif' | 'suspendu' | 'expire' | 'annule';
  conditions_speciales?: string;
  created_at: string;
}

const CommissionsPage: React.FC = () => {
  const [contrats, setContrats] = useState<ContratCommission[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingContrat, setEditingContrat] = useState<ContratCommission | null>(null);
  const [gestionnaires, setGestionnaires] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    gestionnaire_id: '',
    taux_commission: '',
    type_contrat: 'global',
    date_debut: '',
    date_fin: '',
    statut: 'actif',
    conditions_speciales: ''
  });

  useEffect(() => {
    fetchContrats();
    fetchGestionnaires();
  }, []);

  const fetchContrats = async () => {
    setLoading(true);
    try {
      const response = await apiService.getContratsCommission({ page: 1 });
      if (response.success) {
        setContrats(response.data.data || []);
      } else {
        toast.error("Impossible de charger les contrats de commission.");
      }
    } catch (error) {
      toast.error("Erreur réseau lors du chargement.");
    } finally {
      setLoading(false);
    }
  };

  const fetchGestionnaires = async () => {
    try {
      const response = await apiService.getAllUsers({ role: 'gestionnaire', per_page: 100 });
      if (response.success) {
        setGestionnaires(response.data.data || []);
      }
    } catch (error) {
      // Erreur silencieuse, les gestionnaires sont optionnels
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const data = {
        ...formData,
        taux_commission: parseFloat(formData.taux_commission),
        gestionnaire_id: parseInt(formData.gestionnaire_id)
      };

      let response;
      if (editingContrat) {
        response = await apiService.updateContratCommission(editingContrat.id, data);
      } else {
        response = await apiService.createContratCommission(data);
      }

      if (response.success) {
        toast.success(editingContrat ? 'Contrat mis à jour avec succès' : 'Contrat créé avec succès');
        setShowModal(false);
        resetForm();
        fetchContrats();
      } else {
        toast.error(response.message || 'Erreur lors de l\'opération');
      }
    } catch (error) {
      toast.error('Erreur lors de l\'opération');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce contrat ?')) return;
    
    try {
      const response = await apiService.deleteContratCommission(id);
      if (response.success) {
        toast.success('Contrat supprimé avec succès');
        fetchContrats();
      } else {
        toast.error(response.message || 'Erreur lors de la suppression');
      }
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleEdit = (contrat: ContratCommission) => {
    setEditingContrat(contrat);
    setFormData({
      gestionnaire_id: contrat.gestionnaire_id.toString(),
      taux_commission: contrat.taux_commission.toString(),
      type_contrat: contrat.type_contrat,
      date_debut: contrat.date_debut.split('T')[0],
      date_fin: contrat.date_fin ? contrat.date_fin.split('T')[0] : '',
      statut: contrat.statut,
      conditions_speciales: contrat.conditions_speciales || ''
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      gestionnaire_id: '',
      taux_commission: '',
      type_contrat: 'global',
      date_debut: '',
      date_fin: '',
      statut: 'actif',
      conditions_speciales: ''
    });
    setEditingContrat(null);
  };

  const openModal = () => {
    resetForm();
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  if (loading && contrats.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        <p className="ml-4 text-lg">Chargement des contrats de commission...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestion des Commissions</h1>
        <button
          onClick={openModal}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nouveau Contrat
        </button>
      </div>

      {/* Tableau des contrats */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gestionnaire</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Taux (%)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Période</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {contrats.map((contrat) => (
                <tr key={contrat.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {contrat.gestionnaire.nom} {contrat.gestionnaire.prenom}
                      </div>
                      <div className="text-sm text-gray-500">{contrat.gestionnaire.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                    {contrat.taux_commission}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {contrat.type_contrat === 'global' ? 'Global' : 'Par Terrain'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div>Début: {new Date(contrat.date_debut).toLocaleDateString('fr-FR')}</div>
                      {contrat.date_fin && (
                        <div>Fin: {new Date(contrat.date_fin).toLocaleDateString('fr-FR')}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      contrat.statut === 'actif' ? 'bg-green-100 text-green-800' :
                      contrat.statut === 'suspendu' ? 'bg-yellow-100 text-yellow-800' :
                      contrat.statut === 'expire' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {contrat.statut.charAt(0).toUpperCase() + contrat.statut.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(contrat)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(contrat.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingContrat ? 'Modifier le contrat' : 'Nouveau contrat de commission'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gestionnaire
                </label>
                <select
                  value={formData.gestionnaire_id}
                  onChange={(e) => setFormData({...formData, gestionnaire_id: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Sélectionner un gestionnaire</option>
                  {gestionnaires.map((gestionnaire) => (
                    <option key={gestionnaire.id} value={gestionnaire.id}>
                      {gestionnaire.nom} {gestionnaire.prenom}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Taux de commission (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.taux_commission}
                  onChange={(e) => setFormData({...formData, taux_commission: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type de contrat
                </label>
                <select
                  value={formData.type_contrat}
                  onChange={(e) => setFormData({...formData, type_contrat: e.target.value as 'global' | 'par_terrain'})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="global">Global</option>
                  <option value="par_terrain">Par Terrain</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date de début
                </label>
                <input
                  type="date"
                  value={formData.date_debut}
                  onChange={(e) => setFormData({...formData, date_debut: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date de fin (optionnel)
                </label>
                <input
                  type="date"
                  value={formData.date_fin}
                  onChange={(e) => setFormData({...formData, date_fin: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {editingContrat && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Statut
                  </label>
                  <select
                    value={formData.statut}
                    onChange={(e) => setFormData({...formData, statut: e.target.value as any})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="actif">Actif</option>
                    <option value="suspendu">Suspendu</option>
                    <option value="expire">Expiré</option>
                    <option value="annule">Annulé</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Conditions spéciales (optionnel)
                </label>
                <textarea
                  value={formData.conditions_speciales}
                  onChange={(e) => setFormData({...formData, conditions_speciales: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {editingContrat ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommissionsPage; 