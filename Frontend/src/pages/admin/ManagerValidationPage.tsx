import React, { useState, useEffect } from 'react';
import apiService from '../../services/api';
import toast from 'react-hot-toast';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  Building, 
  Phone, 
  Mail,
  Eye,
  X
} from 'lucide-react';

interface Manager {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  created_at: string;
  nom_entreprise?: string;
  numero_ninea?: string;
  numero_registre_commerce?: string;
  adresse_entreprise?: string;
  description?: string;
  profile_image_url?: string;
}

interface ManagerDetailsModalProps {
  manager: Manager | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (managerId: number, companyData?: any) => void;
  setRejectModalOpen: (open: boolean) => void;
}

const ManagerDetailsModal: React.FC<ManagerDetailsModalProps> = ({
  manager,
  isOpen,
  onClose,
  onApprove,
  setRejectModalOpen
}) => {
  const [companyData, setCompanyData] = useState({
    nom_entreprise: '',
    numero_ninea: '',
    numero_registre_commerce: '',
    adresse_entreprise: '',
    description: ''
  });
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (manager) {
      setCompanyData({
        nom_entreprise: manager.nom_entreprise || '',
        numero_ninea: manager.numero_ninea || '',
        numero_registre_commerce: manager.numero_registre_commerce || '',
        adresse_entreprise: manager.adresse_entreprise || '',
        description: manager.description || ''
      });
    }
  }, [manager]);

  const handleApproveWithData = () => {
    if (manager) {
      onApprove(manager.id, companyData);
    }
  };

  if (!isOpen || !manager) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Validation Gestionnaire
            </h2>
            <p className="text-gray-600">
              {manager.prenom} {manager.nom}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Informations personnelles */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2 text-green-600" />
              Informations personnelles
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <User className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Nom complet</p>
                  <p className="font-medium">{manager.prenom} {manager.nom}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{manager.email}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Téléphone</p>
                  <p className="font-medium">{manager.telephone || 'Non renseigné'}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Clock className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Demande créée le</p>
                  <p className="font-medium">
                    {new Date(manager.created_at).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Informations entreprise */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Building className="w-5 h-5 mr-2 text-blue-600" />
                Informations entreprise
              </h3>
              <button
                onClick={() => setEditing(!editing)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                {editing ? 'Arrêter l\'édition' : 'Modifier/Ajouter'}
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom de l'entreprise
                </label>
                {editing ? (
                  <input
                    type="text"
                    value={companyData.nom_entreprise}
                    onChange={(e) => setCompanyData({
                      ...companyData,
                      nom_entreprise: e.target.value
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: SARL Terrain Sport"
                  />
                ) : (
                  <p className="text-gray-900">{companyData.nom_entreprise || 'Non renseigné'}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Numéro NINEA
                </label>
                {editing ? (
                  <input
                    type="text"
                    value={companyData.numero_ninea}
                    onChange={(e) => setCompanyData({
                      ...companyData,
                      numero_ninea: e.target.value
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: 123456789"
                  />
                ) : (
                  <p className="text-gray-900">{companyData.numero_ninea || 'Non renseigné'}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Registre de commerce
                </label>
                {editing ? (
                  <input
                    type="text"
                    value={companyData.numero_registre_commerce}
                    onChange={(e) => setCompanyData({
                      ...companyData,
                      numero_registre_commerce: e.target.value
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: RC/DKR/2024/A123"
                  />
                ) : (
                  <p className="text-gray-900">{companyData.numero_registre_commerce || 'Non renseigné'}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adresse entreprise
                </label>
                {editing ? (
                  <input
                    type="text"
                    value={companyData.adresse_entreprise}
                    onChange={(e) => setCompanyData({
                      ...companyData,
                      adresse_entreprise: e.target.value
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: Dakar, Almadies"
                  />
                ) : (
                  <p className="text-gray-900">{companyData.adresse_entreprise || 'Non renseigné'}</p>
                )}
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description de l'activité
              </label>
              {editing ? (
                <textarea
                  value={companyData.description}
                  onChange={(e) => setCompanyData({
                    ...companyData,
                    description: e.target.value
                  })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Décrivez l'activité de l'entreprise..."
                />
              ) : (
                <p className="text-gray-900">{companyData.description || 'Non renseigné'}</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              onClick={() => {
                onClose();
                setRejectModalOpen(true);
              }}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
            >
              <XCircle className="w-4 h-4" />
              <span>Rejeter</span>
            </button>
            
            <button
              onClick={handleApproveWithData}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Approuver avec ces informations</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ManagerValidationPage: React.FC = () => {
  const [managers, setManagers] = useState<Manager[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedManager, setSelectedManager] = useState<Manager | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const fetchPendingManagers = async () => {
    setLoading(true);
    try {
      const response = await apiService.getPendingManagers();
      if (response.success) {
        setManagers((response.data as Manager[]) || []);
      } else {
        toast.error(response.message || 'Erreur lors du chargement des gestionnaires.');
      }
    } catch (error) {
      toast.error('Une erreur réseau est survenue.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingManagers();
  }, []);

  const handleViewDetails = (manager: Manager) => {
    setSelectedManager(manager);
    setDetailsModalOpen(true);
  };

  const handleApprove = async (managerId: number, companyData?: any) => {
    try {
      const response = await apiService.approveManagerWithContract(managerId, companyData);

      if (response.success) {
        toast.success('Gestionnaire approuvé avec succès');
        setManagers(managers.filter(m => m.id !== managerId));
        setDetailsModalOpen(false);
      } else {
        toast.error(response.message || 'Erreur lors de l\'approbation');
      }
    } catch (error) {
      toast.error('Une erreur est survenue lors de l\'approbation');
    }
  };

  const handleReject = async (managerId: number, raison?: string) => {
    try {
      const response = await apiService.rejectManager(managerId, raison);

      if (response.success) {
        toast.success('Gestionnaire rejeté');
        setManagers(managers.filter(m => m.id !== managerId));
        setDetailsModalOpen(false);
        setRejectModalOpen(false);
        setRejectReason('');
      } else {
        toast.error(response.message || 'Erreur lors du rejet');
      }
    } catch (error) {
      toast.error('Une erreur est survenue lors du rejet');
    }
  };

  const confirmReject = () => {
    if (selectedManager && rejectReason.trim()) {
      handleReject(selectedManager.id, rejectReason);
    } else {
      toast.error('Veuillez saisir une raison pour le rejet');
    }
  };

  const quickApprove = async (managerId: number) => {
    const originalManagers = [...managers];
    setManagers(managers.filter(m => m.id !== managerId));

    try {
      const response = await apiService.approveManager(managerId);

      if (response.success) {
        toast.success('Gestionnaire approuvé rapidement');
      } else {
        toast.error(response.message || 'Erreur lors de l\'approbation');
        setManagers(originalManagers);
      }
    } catch (error) {
      toast.error('Une erreur est survenue lors de l\'approbation');
      setManagers(originalManagers);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Validation des Gestionnaires</h1>
        <p className="text-gray-600 mt-2">
          Gérez les demandes d'inscription des gestionnaires de terrains
        </p>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      ) : managers.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Clock className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun gestionnaire en attente</h3>
          <p className="mt-1 text-sm text-gray-500">Toutes les demandes ont été traitées.</p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="space-y-4">
              {managers.map((manager) => (
                <div key={manager.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        {manager.profile_image_url ? (
                          <img
                            src={manager.profile_image_url.startsWith('http') 
                              ? manager.profile_image_url 
                              : `https://b0385fbb1e44.ngrok-free.app/storage/${manager.profile_image_url.replace('public/', '').replace('storage/', '')}`
                            }
                            alt="Photo de profil"
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                        
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            {manager.prenom} {manager.nom}
                          </h3>
                          <p className="text-sm text-gray-500">{manager.email}</p>
                          <p className="text-sm text-gray-500">{manager.telephone}</p>
                        </div>
                      </div>
                      
                      <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Entreprise:</span>
                          <span className="ml-1 text-gray-600">
                            {manager.nom_entreprise || 'Non renseigné'}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">NINEA:</span>
                          <span className="ml-1 text-gray-600">
                            {manager.numero_ninea || 'Non renseigné'}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Inscrit le:</span>
                          <span className="ml-1 text-gray-600">
                            {new Date(manager.created_at).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col space-y-2 ml-4">
                      <button
                        onClick={() => handleViewDetails(manager)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Voir détails</span>
                      </button>
                      
                      <button
                        onClick={() => quickApprove(manager.id)}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center space-x-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Approuver</span>
                      </button>

                      <button
                        onClick={() => {
                          setSelectedManager(manager);
                          setRejectModalOpen(true);
                        }}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center space-x-2"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Rejeter</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal détails */}
      <ManagerDetailsModal
        manager={selectedManager}
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        onApprove={handleApprove}
        setRejectModalOpen={setRejectModalOpen}
      />

      {/* Modal de rejet */}
      {rejectModalOpen && selectedManager && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Rejeter le gestionnaire
            </h3>
            <p className="text-gray-600 mb-4">
              Vous êtes sur le point de rejeter <strong>{selectedManager.prenom} {selectedManager.nom}</strong>.
              Veuillez indiquer la raison du rejet :
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Raison du rejet (obligatoire)..."
              className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
              required
            />
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setRejectModalOpen(false);
                  setRejectReason('');
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
              >
                Annuler
              </button>
              <button
                onClick={confirmReject}
                disabled={!rejectReason.trim()}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirmer le rejet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerValidationPage; 