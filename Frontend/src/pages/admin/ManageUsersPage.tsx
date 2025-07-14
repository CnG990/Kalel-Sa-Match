import React, { useState, useEffect, useCallback } from 'react';
import apiService from '../../services/api';
import toast from 'react-hot-toast';
import { Search, UserPlus, Edit, Trash2, Eye, Key, X } from 'lucide-react';

interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  role: 'admin' | 'client' | 'gestionnaire';
  statut_validation: string;
  created_at: string;
}

interface PaginatedResponse {
  data: User[];
  current_page: number;
  last_page: number;
  total: number;
}

const ManageUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ role: '', statut_validation: '' });
  
  // Modal states
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Form states
  const [editForm, setEditForm] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    role: '',
    statut_validation: ''
  });
  const [addForm, setAddForm] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    role: 'client',
    statut_validation: 'approuve',
    mot_de_passe: ''
  });
  const [newPassword, setNewPassword] = useState('');
  const [userDetails, setUserDetails] = useState<any>(null);
  
  // États pour l'approbation des gestionnaires
  const [showManagerApprovalModal, setShowManagerApprovalModal] = useState(false);
  const [tauxCommission, setTauxCommission] = useState(10);
  const [commentairesManager, setCommentairesManager] = useState('');

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        search: searchTerm,
        role: filters.role,
        statut_validation: filters.statut_validation,
      };
      const response = await apiService.getAllUsers(params);
      if (response.success && response.data) {
        const paginatedData = response.data as PaginatedResponse;
        setUsers(paginatedData.data);
        setLastPage(paginatedData.last_page);
      } else {
        toast.error("Impossible de charger les utilisateurs.");
      }
    } catch (error) {
      toast.error("Erreur réseau lors du chargement.");
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm, filters]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setPage(1);
  };
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditForm({
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      telephone: user.telephone || '',
      role: user.role,
      statut_validation: user.statut_validation
    });
    setShowEditModal(true);
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    
    // Vérifier si on essaie d'approuver un gestionnaire
    if (selectedUser.role === 'gestionnaire' && 
        selectedUser.statut_validation !== 'approuve' && 
        editForm.statut_validation === 'approuve') {
      // Ouvrir la modal d'approbation spéciale pour les gestionnaires
      setShowEditModal(false);
      setShowManagerApprovalModal(true);
      return;
    }
    
    try {
      const response = await apiService.updateUser(selectedUser.id, editForm);
      if (response.success) {
        toast.success('Utilisateur mis à jour avec succès');
        setShowEditModal(false);
        fetchUsers();
      } else {
        toast.error(response.message || 'Erreur lors de la mise à jour');
      }
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleApproveManager = async () => {
    if (!selectedUser) return;
    
    try {
      const response = await apiService.approveManager(selectedUser.id, tauxCommission, commentairesManager);
      if (response.success) {
        toast.success('Gestionnaire approuvé avec succès');
        setShowManagerApprovalModal(false);
        setTauxCommission(10);
        setCommentairesManager('');
        fetchUsers();
      } else {
        toast.error(response.message || 'Erreur lors de l\'approbation');
      }
    } catch (error) {
      toast.error('Erreur lors de l\'approbation');
    }
  };

  const handleAddUser = async () => {
    try {
      const response = await apiService.createUser(addForm);
      if (response.success) {
        toast.success('Utilisateur créé avec succès');
        setShowAddModal(false);
        setAddForm({
          nom: '',
          prenom: '',
          email: '',
          telephone: '',
          role: 'client',
          statut_validation: 'approuve',
          mot_de_passe: ''
        });
        fetchUsers();
      } else {
        toast.error(response.message || 'Erreur lors de la création');
      }
    } catch (error) {
      toast.error('Erreur lors de la création');
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    try {
      const response = await apiService.deleteUser(selectedUser.id);
      if (response.success) {
        toast.success('Utilisateur supprimé avec succès');
        setShowDeleteModal(false);
        fetchUsers();
      } else {
        toast.error(response.message || 'Erreur lors de la suppression');
      }
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleResetPassword = async () => {
    if (!selectedUser) {
      toast.error('Aucun utilisateur sélectionné');
      return;
    }
    
    if (!newPassword || newPassword.length < 8) {
      toast.error('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }
    
    try {
      console.log('Tentative de réinitialisation pour utilisateur:', selectedUser.id, 'avec mot de passe de longueur:', newPassword.length);
      
      const response = await apiService.resetUserPassword(selectedUser.id, newPassword);
      
      console.log('Réponse API:', response);
      
      if (response.success) {
        toast.success('Mot de passe réinitialisé avec succès');
        setShowPasswordModal(false);
        setNewPassword('');
        setSelectedUser(null);
      } else {
        console.error('Erreur API:', response.message);
        toast.error(response.message || 'Erreur lors de la réinitialisation');
      }
    } catch (error) {
      console.error('Erreur lors de la réinitialisation:', error);
      toast.error('Erreur lors de la réinitialisation du mot de passe');
    }
  };

  const handleViewUserDetails = async (user: User) => {
    try {
      const [userResponse, reservationsResponse, paiementsResponse] = await Promise.all([
        apiService.getUser(user.id),
        apiService.getUserReservations(user.id),
        apiService.getUserPaiements(user.id)
      ]);

      if (userResponse.success) {
        setUserDetails({
          user: userResponse.data,
          reservations: reservationsResponse.success ? reservationsResponse.data : [],
          paiements: paiementsResponse.success ? paiementsResponse.data : []
        });
        setShowUserDetails(true);
      }
    } catch (error) {
      toast.error('Erreur lors du chargement des détails');
    }
  };
  
  const RoleBadge = ({ role }: { role: string }) => {
    const colors = {
      admin: 'bg-red-100 text-red-800 border border-red-200',
      gestionnaire: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      client: 'bg-blue-100 text-blue-800 border border-blue-200',
    };
    const statusLabel = role.charAt(0).toUpperCase() + role.slice(1);
    return <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800 border border-gray-200'}`}>{statusLabel}</span>
  }
  
  const StatusBadge = ({ status }: { status: string }) => {
    const colors = {
      approuve: 'bg-green-100 text-green-800 border border-green-200',
      en_attente: 'bg-orange-100 text-orange-800 border border-orange-200',
      rejete: 'bg-red-100 text-red-800 border border-red-200',
      suspendu: 'bg-gray-100 text-gray-800 border border-gray-200',
    };
    const statusLabel = status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
    return <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 border border-gray-200'}`}>{statusLabel}</span>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestion des Utilisateurs</h1>
        <button onClick={() => setShowAddModal(true)} className="flex items-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
          <UserPlus className="w-5 h-5 mr-2" />
          Ajouter un utilisateur
        </button>
      </div>
      
      {/* Filters and Search */}
      <div className="mb-4 flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
         <div className="relative flex-grow">
          <input
            type="text"
            placeholder="Rechercher par nom, email..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        </div>
        <select name="role" value={filters.role} onChange={handleFilterChange} className="border rounded-lg px-4 py-2">
          <option value="">Tous les rôles</option>
          <option value="admin">Admin</option>
          <option value="gestionnaire">Gestionnaire</option>
          <option value="client">Client</option>
        </select>
        <select name="statut_validation" value={filters.statut_validation} onChange={handleFilterChange} className="border rounded-lg px-4 py-2">
          <option value="">Tous les statuts</option>
          <option value="approuve">Approuvé</option>
          <option value="en_attente">En attente</option>
          <option value="rejete">Rejeté</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-white shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rôle</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inscrit le</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={6} className="text-center py-4">Chargement...</td></tr>
            ) : users.map((user, idx) => (
              <tr key={user.id} className={idx % 2 === 0 ? "bg-white hover:bg-gray-50" : "bg-gray-50 hover:bg-gray-100"}>
                <td className="px-6 py-4 min-w-[160px] max-w-xs font-semibold text-black text-base">
                  {user.prenom} {user.nom}
                </td>
                <td className="px-6 py-4 min-w-[200px] max-w-xs text-black text-sm truncate" title={user.email}>
                  {user.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap"><RoleBadge role={user.role} /></td>
                <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={user.statut_validation} /></td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500 text-sm">
                  {new Date(user.created_at).toLocaleString('fr-FR', { year: 'numeric', month: 'long', day: '2-digit' })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    {/* Bouton d'approbation rapide pour les gestionnaires en attente */}
                    {user.role === 'gestionnaire' && user.statut_validation === 'en_attente' && (
                      <button 
                        onClick={() => {
                          setSelectedUser(user);
                          setShowManagerApprovalModal(true);
                        }}
                        className="text-green-600 hover:text-green-900 p-1 bg-green-50 rounded border border-green-200"
                        title="Approuver gestionnaire"
                      >
                        ✓
                      </button>
                    )}
                    <button 
                      onClick={() => handleViewUserDetails(user)}
                      className="text-blue-600 hover:text-blue-900 p-1"
                      title="Voir les détails"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleEditUser(user)}
                      className="text-indigo-600 hover:text-indigo-900 p-1"
                      title="Modifier"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => {
                        setSelectedUser(user);
                        setShowPasswordModal(true);
                      }}
                      className="text-yellow-600 hover:text-yellow-900 p-1"
                      title="Réinitialiser mot de passe"
                    >
                      <Key className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => {
                        setSelectedUser(user);
                        setShowDeleteModal(true);
                      }}
                      className="text-red-600 hover:text-red-900 p-1"
                      title="Supprimer"
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
      
      {/* Pagination */}
      <div className="mt-6 flex justify-between items-center">
        <button 
          onClick={() => setPage(p => Math.max(1, p - 1))} 
          disabled={page === 1} 
          className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Précédent
        </button>
        <span className="text-sm text-gray-700">
          Page {page} sur {lastPage}
        </span>
        <button 
          onClick={() => setPage(p => Math.min(lastPage, p + 1))} 
          disabled={page === lastPage} 
          className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Suivant
        </button>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Modifier l'utilisateur</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nom</label>
                <input
                  type="text"
                  value={editForm.nom}
                  onChange={(e) => setEditForm(prev => ({ ...prev, nom: e.target.value }))}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Prénom</label>
                <input
                  type="text"
                  value={editForm.prenom}
                  onChange={(e) => setEditForm(prev => ({ ...prev, prenom: e.target.value }))}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Téléphone</label>
                <input
                  type="text"
                  value={editForm.telephone}
                  onChange={(e) => setEditForm(prev => ({ ...prev, telephone: e.target.value }))}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Rôle</label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm(prev => ({ ...prev, role: e.target.value }))}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="client">Client</option>
                  <option value="gestionnaire">Gestionnaire</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Statut</label>
                <select
                  value={editForm.statut_validation}
                  onChange={(e) => setEditForm(prev => ({ ...prev, statut_validation: e.target.value }))}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="en_attente">En attente</option>
                  <option value="approuve">Approuvé</option>
                  <option value="rejete">Rejeté</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleUpdateUser}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Mettre à jour
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Confirmer la suppression</h3>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer l'utilisateur {selectedUser?.prenom} {selectedUser?.nom} ? 
              Cette action est irréversible.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteUser}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password Reset Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Réinitialiser le mot de passe</h3>
              <button onClick={() => setShowPasswordModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-600 mb-4">
              Nouveau mot de passe pour {selectedUser?.prenom} {selectedUser?.nom}
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700">Nouveau mot de passe</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Minimum 8 caractères"
              />
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowPasswordModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleResetPassword}
                disabled={newPassword.length < 8}
                className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:opacity-50"
              >
                Réinitialiser
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {showUserDetails && userDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Détails de l'utilisateur</h3>
              <button onClick={() => setShowUserDetails(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Informations utilisateur */}
              <div>
                <h4 className="font-semibold mb-3">Informations personnelles</h4>
                <div className="space-y-2">
                  <p><strong>Nom:</strong> {userDetails.user.nom} {userDetails.user.prenom}</p>
                  <p><strong>Email:</strong> {userDetails.user.email}</p>
                  <p><strong>Téléphone:</strong> {userDetails.user.telephone || 'Non renseigné'}</p>
                  <p><strong>Rôle:</strong> <RoleBadge role={userDetails.user.role} /></p>
                  <p><strong>Statut:</strong> <StatusBadge status={userDetails.user.statut_validation} /></p>
                  <p><strong>Inscrit le:</strong> {new Date(userDetails.user.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Statistiques */}
              <div>
                <h4 className="font-semibold mb-3">Statistiques</h4>
                <div className="space-y-2">
                  <p><strong>Réservations:</strong> {userDetails.reservations.length}</p>
                  <p><strong>Paiements:</strong> {userDetails.paiements.length}</p>
                  <p><strong>Total payé:</strong> {userDetails.paiements.reduce((sum: number, p: any) => sum + (p.montant || 0), 0).toLocaleString('fr-FR')} FCFA</p>
                </div>
              </div>
            </div>

            {/* Réservations récentes */}
            {userDetails.reservations.length > 0 && (
              <div className="mt-6">
                <h4 className="font-semibold mb-3">Réservations récentes</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Terrain</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Date</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Statut</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Montant</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {userDetails.reservations.slice(0, 5).map((reservation: any) => (
                        <tr key={reservation.id}>
                          <td className="px-3 py-2 text-sm">{reservation.terrain?.terrainSynthetique?.nom || 'N/A'}</td>
                          <td className="px-3 py-2 text-sm">{new Date(reservation.date_debut).toLocaleDateString()}</td>
                          <td className="px-3 py-2 text-sm"><StatusBadge status={reservation.statut} /></td>
                          <td className="px-3 py-2 text-sm">{reservation.montant_total?.toLocaleString('fr-FR')} FCFA</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Manager Approval Modal */}
      {showManagerApprovalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Approuver le gestionnaire</h3>
              <button onClick={() => setShowManagerApprovalModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-gray-600 mb-4">
                Vous êtes sur le point d'approuver <strong>{selectedUser?.prenom} {selectedUser?.nom}</strong> en tant que gestionnaire.
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Taux de commission (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={tauxCommission}
                    onChange={(e) => setTauxCommission(parseFloat(e.target.value) || 0)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="ex: 10"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Pourcentage prélevé sur chaque réservation
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Commentaires (optionnel)
                  </label>
                  <textarea
                    value={commentairesManager}
                    onChange={(e) => setCommentairesManager(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Notes administratives..."
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowManagerApprovalModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleApproveManager}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Approuver
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Ajouter un utilisateur</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nom</label>
                <input
                  type="text"
                  value={addForm.nom}
                  onChange={(e) => setAddForm(prev => ({ ...prev, nom: e.target.value }))}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Prénom</label>
                <input
                  type="text"
                  value={addForm.prenom}
                  onChange={(e) => setAddForm(prev => ({ ...prev, prenom: e.target.value }))}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={addForm.email}
                  onChange={(e) => setAddForm(prev => ({ ...prev, email: e.target.value }))}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Téléphone</label>
                <input
                  type="text"
                  value={addForm.telephone}
                  onChange={(e) => setAddForm(prev => ({ ...prev, telephone: e.target.value }))}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Rôle</label>
                <select
                  value={addForm.role}
                  onChange={(e) => setAddForm(prev => ({ ...prev, role: e.target.value }))}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="client">Client</option>
                  <option value="gestionnaire">Gestionnaire</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Statut</label>
                <select
                  value={addForm.statut_validation}
                  onChange={(e) => setAddForm(prev => ({ ...prev, statut_validation: e.target.value }))}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="approuve">Approuvé</option>
                  <option value="en_attente">En attente</option>
                  <option value="rejete">Rejeté</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Mot de passe</label>
                <input
                  type="password"
                  value={addForm.mot_de_passe}
                  onChange={(e) => setAddForm(prev => ({ ...prev, mot_de_passe: e.target.value }))}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Minimum 8 caractères"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleAddUser}
                disabled={addForm.nom.length < 2 || addForm.prenom.length < 2 || !addForm.email || addForm.mot_de_passe.length < 8}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                Ajouter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsersPage; 