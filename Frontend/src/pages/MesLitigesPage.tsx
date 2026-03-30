import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  AlertTriangle, 
  Plus, 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  XCircle,
  ArrowUp,
  Eye,
  Filter
} from 'lucide-react';
import toast from 'react-hot-toast';
import apiService from '../services/api';

interface Litige {
  id: number;
  numero_litige: string;
  type_litige: 'reservation' | 'paiement' | 'service' | 'equipement' | 'autre';
  sujet: string;
  description: string;
  priorite: 'faible' | 'normale' | 'elevee' | 'urgente';
  statut: 'nouveau' | 'en_cours' | 'resolu' | 'ferme' | 'escalade';
  niveau_escalade: 'client' | 'gestionnaire' | 'admin';
  terrain_nom: string;
  created_at: string;
  updated_at: string;
  messages_count?: number;
}

const MesLitigesPage: React.FC = () => {
  const navigate = useNavigate();
  const [litiges, setLitiges] = useState<Litige[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filtreStatut, setFiltreStatut] = useState<string>('tous');
  const [filtrePriorite, setFiltrePriorite] = useState<string>('tous');

  useEffect(() => {
    chargerMesLitiges();
  }, []);

  const chargerMesLitiges = async () => {
    try {
      setLoading(true);
      const { data } = await apiService.get('/litiges/litiges/');
      const litigesData = Array.isArray(data) ? data : (data as any)?.results;
      if (Array.isArray(litigesData)) {
        setLitiges(litigesData);
      } else {
        setLitiges([]);
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement des litiges');
    } finally {
      setLoading(false);
    }
  };

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'nouveau': return 'bg-blue-100 text-blue-800';
      case 'en_cours': return 'bg-yellow-100 text-yellow-800';
      case 'resolu': return 'bg-green-100 text-green-800';
      case 'ferme': return 'bg-gray-100 text-gray-800';
      case 'escalade': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatutIcon = (statut: string) => {
    switch (statut) {
      case 'nouveau': return <Clock size={16} />;
      case 'en_cours': return <MessageSquare size={16} />;
      case 'resolu': return <CheckCircle size={16} />;
      case 'ferme': return <XCircle size={16} />;
      case 'escalade': return <ArrowUp size={16} />;
      default: return <Clock size={16} />;
    }
  };

  const getPrioriteColor = (priorite: string) => {
    switch (priorite) {
      case 'faible': return 'bg-gray-100 text-gray-600';
      case 'normale': return 'bg-blue-100 text-blue-600';
      case 'elevee': return 'bg-orange-100 text-orange-600';
      case 'urgente': return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getTypeLibelle = (type: string) => {
    switch (type) {
      case 'reservation': return 'Réservation';
      case 'paiement': return 'Paiement';
      case 'service': return 'Service';
      case 'equipement': return 'Équipement';
      case 'autre': return 'Autre';
      default: return type;
    }
  };

  const litigesFiltres = litiges.filter(litige => {
    if (filtreStatut !== 'tous' && litige.statut !== filtreStatut) return false;
    if (filtrePriorite !== 'tous' && litige.priorite !== filtrePriorite) return false;
    return true;
  });

  const voirDetailsLitige = (litigeId: number) => {
    navigate(`/dashboard/litiges/${litigeId}`);
  };

  return (
    <div className="p-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <AlertTriangle className="mr-3 text-orange-500" size={28} />
            Mes Litiges
          </h1>
          <p className="text-gray-600 mt-1">
            Gérez vos réclamations et suivez leur résolution
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center shrink-0"
        >
          <Plus size={20} className="mr-2" />
          Nouveau Litige
        </button>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
          <Filter size={20} className="text-gray-500 hidden sm:block" />
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <label className="text-sm font-medium text-gray-700 shrink-0">Statut:</label>
            <select
              value={filtreStatut}
              onChange={(e) => setFiltreStatut(e.target.value)}
              className="border border-gray-300 rounded px-3 py-1 text-sm"
            >
              <option value="tous">Tous</option>
              <option value="nouveau">Nouveau</option>
              <option value="en_cours">En cours</option>
              <option value="resolu">Résolu</option>
              <option value="ferme">Fermé</option>
              <option value="escalade">Escaladé</option>
            </select>
          </div>
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <label className="text-sm font-medium text-gray-700 shrink-0">Priorité:</label>
            <select
              value={filtrePriorite}
              onChange={(e) => setFiltrePriorite(e.target.value)}
              className="border border-gray-300 rounded px-3 py-1 text-sm"
            >
              <option value="tous">Toutes</option>
              <option value="faible">Faible</option>
              <option value="normale">Normale</option>
              <option value="elevee">Élevée</option>
              <option value="urgente">Urgente</option>
            </select>
          </div>
        </div>
      </div>

      {/* Liste des litiges */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Chargement des litiges...</span>
        </div>
      ) : litigesFiltres.length === 0 ? (
        <div className="text-center py-12">
          <AlertTriangle size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Aucun litige trouvé
          </h3>
          <p className="text-gray-600 mb-4">
            {litiges.length === 0 
              ? "Vous n'avez pas encore créé de litige."
              : "Aucun litige ne correspond aux filtres sélectionnés."
            }
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Créer un litige
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {litigesFiltres.map((litige) => (
            <div
              key={litige.id}
              className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => voirDetailsLitige(litige.id)}
            >
              <div className="flex flex-col sm:flex-row sm:justify-between items-start gap-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="font-semibold text-blue-600">
                      #{litige.numero_litige}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${getStatutColor(litige.statut)}`}>
                      {getStatutIcon(litige.statut)}
                      <span className="ml-1 capitalize">{litige.statut.replace('_', ' ')}</span>
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPrioriteColor(litige.priorite)}`}>
                      {litige.priorite}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {litige.sujet}
                  </h3>
                  
                  <p className="text-gray-600 mb-3 line-clamp-2">
                    {litige.description}
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm text-gray-500">
                    <span> {litige.terrain_nom}</span>
                    <span> {getTypeLibelle(litige.type_litige)}</span>
                    <span> {new Date(litige.created_at).toLocaleDateString('fr-FR')}</span>
                    {litige.messages_count && (
                      <span className="flex items-center">
                        <MessageSquare size={14} className="mr-1" />
                        {litige.messages_count} messages
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="ml-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      voirDetailsLitige(litige.id);
                    }}
                    className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors"
                  >
                    <Eye size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de création de litige */}
      {showCreateModal && (
        <CreateLitigeModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            chargerMesLitiges();
          }}
        />
      )}
    </div>
  );
};

// Composant Modal pour créer un litige
interface CreateLitigeModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const CreateLitigeModal: React.FC<CreateLitigeModalProps> = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    terrain_id: '',
    type_litige: 'autre',
    sujet: '',
    description: '',
    priorite: 'normale',
    reservation_id: ''
  });
  const [terrains, setTerrains] = useState<any[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    chargerTerrains();
    chargerReservations();
  }, []);

  const chargerTerrains = async () => {
    try {
      const { data } = await apiService.get('/terrains/terrains/');
      const terrainsRaw = Array.isArray(data) ? data : (data as any)?.results;
      setTerrains(Array.isArray(terrainsRaw) ? terrainsRaw : []);
    } catch (error) {
      console.error('Erreur chargement terrains:', error);
      setTerrains([]);
    }
  };

  const chargerReservations = async () => {
    try {
      const { data } = await apiService.get('/reservations/my/');
      const resaRaw = Array.isArray(data) ? data : (data as any)?.results;
      setReservations(Array.isArray(resaRaw) ? resaRaw : []);
    } catch (error) {
      console.error('Erreur chargement réservations:', error);
      setReservations([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.terrain_id || !formData.sujet || !formData.description) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      setLoading(true);
      const { data, meta } = await apiService.post('/litiges/litiges/', formData);
      
      if (data) {
        toast.success(meta?.message || 'Litige créé avec succès');
        onSuccess();
      } else {
        toast.error(meta?.message || 'Erreur lors de la création du litige');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la création du litige');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-5 sm:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Créer un nouveau litige</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <XCircle size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Terrain */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Terrain concerné *
            </label>
            <select
              value={formData.terrain_id}
              onChange={(e) => setFormData({...formData, terrain_id: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              required
            >
              <option value="">Sélectionnez un terrain</option>
              {terrains.map((terrain) => (
                <option key={terrain.id} value={terrain.id}>
                  {terrain.nom} - {terrain.adresse}
                </option>
              ))}
            </select>
          </div>

          {/* Type de litige */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type de litige *
            </label>
            <select
              value={formData.type_litige}
              onChange={(e) => setFormData({...formData, type_litige: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              required
            >
              <option value="reservation">Problème de réservation</option>
              <option value="paiement">Problème de paiement</option>
              <option value="service">Qualité de service</option>
              <option value="equipement">Problème d'équipement</option>
              <option value="autre">Autre</option>
            </select>
          </div>

          {/* Réservation (optionnel) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Réservation concernée (optionnel)
            </label>
            <select
              value={formData.reservation_id}
              onChange={(e) => setFormData({...formData, reservation_id: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="">Aucune réservation spécifique</option>
              {reservations.map((reservation) => (
                <option key={reservation.id} value={reservation.id}>
                  {reservation.terrain_nom} - {new Date(reservation.date_debut).toLocaleDateString('fr-FR')}
                </option>
              ))}
            </select>
          </div>

          {/* Priorité */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priorité *
            </label>
            <select
              value={formData.priorite}
              onChange={(e) => setFormData({...formData, priorite: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              required
            >
              <option value="faible">Faible</option>
              <option value="normale">Normale</option>
              <option value="elevee">Élevée</option>
              <option value="urgente">Urgente</option>
            </select>
          </div>

          {/* Sujet */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sujet *
            </label>
            <input
              type="text"
              value={formData.sujet}
              onChange={(e) => setFormData({...formData, sujet: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="Résumé du problème..."
              required
              maxLength={255}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description détaillée *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              rows={4}
              placeholder="Décrivez en détail le problème rencontré..."
              required
              maxLength={2000}
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.description.length}/2000 caractères
            </p>
          </div>

          {/* Boutons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Création...' : 'Créer le litige'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MesLitigesPage; 