import React, { useState, useEffect } from 'react';
import { TrendingUp, Search, Download, Eye, Plus, Users, DollarSign, CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';
import apiService from '../../services/api';
import toast from 'react-hot-toast';

interface Subscription {
  id: number;
  nom: string;
  description: string;
  prix: number;
  duree_jours: number;
  avantages: string[];
  statut: 'active' | 'inactive' | 'draft';
  nombre_abonnes: number;
  revenus_totaux: number;
  date_creation: string;
  date_modification: string;
}

interface Subscriber {
  id: number;
  user: {
    id: number;
    nom: string;
    email: string;
  };
  abonnement: {
    id: number;
    nom: string;
  };
  date_debut: string;
  date_fin: string;
  statut: 'active' | 'expired' | 'cancelled';
  montant_paye: number;
}

interface CreateSubscriptionModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const CreateSubscriptionModal: React.FC<CreateSubscriptionModalProps> = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    prix: '',
    duree_jours: '',
    categorie: 'basic',
    est_visible: true,
    nb_reservations_max: '',
    reduction_pourcentage: '',
    date_debut_validite: '',
    date_fin_validite: '',
    couleur_theme: '#3B82F6',
    icone: '',
    avantages: ['']
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: target.checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAvantageChange = (index: number, value: string) => {
    const newAvantages = [...formData.avantages];
    newAvantages[index] = value;
    setFormData(prev => ({ ...prev, avantages: newAvantages }));
  };

  const addAvantage = () => {
    setFormData(prev => ({ ...prev, avantages: [...prev.avantages, ''] }));
  };

  const removeAvantage = (index: number) => {
    const newAvantages = formData.avantages.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, avantages: newAvantages }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validation
      if (!formData.nom || !formData.description || !formData.prix || !formData.duree_jours) {
        toast.error('Veuillez remplir tous les champs obligatoires');
        return;
      }

      // Préparer les données
      const subscriptionData = {
        ...formData,
        prix: parseFloat(formData.prix),
        duree_jours: parseInt(formData.duree_jours),
        nb_reservations_max: formData.nb_reservations_max ? parseInt(formData.nb_reservations_max) : null,
        reduction_pourcentage: formData.reduction_pourcentage ? parseFloat(formData.reduction_pourcentage) : null,
        avantages: formData.avantages.filter(a => a.trim() !== '')
      };

      const response = await apiService.createSubscription(subscriptionData);
      
      if (response.success) {
        toast.success('Abonnement créé avec succès !');
        onSuccess();
        onClose();
      } else {
        toast.error(response.message || 'Erreur lors de la création');
      }
    } catch (error) {
      toast.error('Erreur lors de la création de l\'abonnement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Nouveau Plan d'Abonnement</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Informations de base */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom du plan <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Abonnement Premium"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Catégorie <span className="text-red-500">*</span>
              </label>
              <select
                name="categorie"
                value={formData.categorie}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="basic">Basic</option>
                <option value="premium">Premium</option>
                <option value="entreprise">Entreprise</option>
                <option value="promo">Promotion</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Décrivez les avantages de cet abonnement..."
              required
            />
          </div>

          {/* Prix et durée */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prix (FCFA) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="prix"
                value={formData.prix}
                onChange={handleInputChange}
                min="0"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="15000"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Durée (jours) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="duree_jours"
                value={formData.duree_jours}
                onChange={handleInputChange}
                min="1"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="30"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Réduction (%)
              </label>
              <input
                type="number"
                name="reduction_pourcentage"
                value={formData.reduction_pourcentage}
                onChange={handleInputChange}
                min="0"
                max="100"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="10"
              />
            </div>
          </div>

          {/* Avantages */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Avantages</label>
            {formData.avantages.map((avantage, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={avantage}
                  onChange={(e) => handleAvantageChange(index, e.target.value)}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Décrivez un avantage..."
                />
                <button
                  type="button"
                  onClick={() => removeAvantage(index)}
                  className="px-3 py-2 text-red-600 hover:text-red-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addAvantage}
              className="mt-2 px-4 py-2 text-blue-600 hover:text-blue-800 text-sm"
            >
              + Ajouter un avantage
            </button>
          </div>

          {/* Options avancées */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de réservations max
              </label>
              <input
                type="number"
                name="nb_reservations_max"
                value={formData.nb_reservations_max}
                onChange={handleInputChange}
                min="1"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Illimité si vide"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Couleur du thème
              </label>
              <input
                type="color"
                name="couleur_theme"
                value={formData.couleur_theme}
                onChange={handleInputChange}
                className="w-full h-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Dates de validité */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de début de validité
              </label>
              <input
                type="date"
                name="date_debut_validite"
                value={formData.date_debut_validite}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de fin de validité
              </label>
              <input
                type="date"
                name="date_fin_validite"
                value={formData.date_fin_validite}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Visibilité */}
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="est_visible"
                checked={formData.est_visible}
                onChange={handleInputChange}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Visible pour les utilisateurs</span>
            </label>
          </div>

          {/* Boutons */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Création...' : 'Créer l\'abonnement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const SubscriptionsPage: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'plans' | 'abonnes'>('plans');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [stats, setStats] = useState({
    totalPlans: 0,
    activePlans: 0,
    totalSubscribers: 0,
    activeSubscribers: 0,
    totalRevenue: 0,
    monthlyRevenue: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [subscriptionsRes, subscribersRes] = await Promise.all([
        apiService.get('/admin/subscriptions'),
        apiService.get('/admin/subscribers')
      ]);
      
      setSubscriptions(subscriptionsRes.data.subscriptions || []);
      setSubscribers(subscribersRes.data.subscribers || []);
      
      // Calculer les statistiques
      const totalPlans = subscriptionsRes.data.subscriptions?.length || 0;
      const activePlans = subscriptionsRes.data.subscriptions?.filter((s: Subscription) => s.statut === 'active').length || 0;
      const totalSubscribers = subscribersRes.data.subscribers?.length || 0;
      const activeSubscribers = subscribersRes.data.subscribers?.filter((s: Subscriber) => s.statut === 'active').length || 0;
      const totalRevenue = subscribersRes.data.subscribers?.reduce((sum: number, s: Subscriber) => sum + s.montant_paye, 0) || 0;
      
      setStats({ 
        totalPlans, 
        activePlans, 
        totalSubscribers, 
        activeSubscribers, 
        totalRevenue,
        monthlyRevenue: totalRevenue // Simplifié pour l'exemple
      });
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-red-100 text-red-800',
      draft: 'bg-gray-100 text-gray-800',
      expired: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return statusMap[status as keyof typeof statusMap] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: string) => {
    const statusMap = {
      active: 'Actif',
      inactive: 'Inactif',
      draft: 'Brouillon',
      expired: 'Expiré',
      cancelled: 'Annulé'
    };
    return statusMap[status as keyof typeof statusMap] || status;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'inactive': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'draft': return <AlertCircle className="w-4 h-4 text-gray-500" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const filteredSubscriptions = subscriptions.filter(subscription => {
    const matchesSearch = 
      subscription.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subscription.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || subscription.statut === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const filteredSubscribers = subscribers.filter(subscriber => {
    const matchesSearch = 
      subscriber.user.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subscriber.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subscriber.abonnement.nom.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || subscriber.statut === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const exportData = () => {
    const data = activeTab === 'plans' ? filteredSubscriptions : filteredSubscribers;
    const headers = activeTab === 'plans' 
      ? ['ID', 'Nom', 'Description', 'Prix', 'Durée (jours)', 'Statut', 'Abonnés', 'Revenus']
      : ['ID', 'Utilisateur', 'Email', 'Abonnement', 'Date début', 'Date fin', 'Statut', 'Montant'];
    
    const csvContent = [
      headers,
      ...data.map((item: any) => {
        if (activeTab === 'plans') {
          return [
            item.id,
            item.nom,
            item.description,
            item.prix,
            item.duree_jours,
            getStatusText(item.statut),
            item.nombre_abonnes,
            item.revenus_totaux
          ];
        } else {
          return [
            item.id,
            item.user.nom,
            item.user.email,
            item.abonnement.nom,
            new Date(item.date_debut).toLocaleDateString('fr-FR'),
            new Date(item.date_fin).toLocaleDateString('fr-FR'),
            getStatusText(item.statut),
            item.montant_paye
          ];
        }
      })
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeTab}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <TrendingUp className="w-8 h-8 text-green-600" />
          Gestion des Abonnements
        </h1>
        <div className="flex gap-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nouveau Plan
          </button>
          <button
            onClick={exportData}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Exporter
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Plans d'Abonnement</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalPlans}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Plans Actifs</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activePlans}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Abonnés</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalSubscribers}</p>
            </div>
            <Users className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Revenus Totaux</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalRevenue.toLocaleString('fr-FR')} FCFA</p>
            </div>
            <DollarSign className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Onglets */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('plans')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'plans'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Plans d'Abonnement
            </button>
            <button
              onClick={() => setActiveTab('abonnes')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'abonnes'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Abonnés
            </button>
          </nav>
        </div>

        {/* Filtres */}
        <div className="p-6 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rechercher</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder={activeTab === 'plans' ? "Nom du plan, description..." : "Utilisateur, email, plan..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tous les statuts</option>
                <option value="active">Actif</option>
                <option value="inactive">Inactif</option>
                <option value="draft">Brouillon</option>
                <option value="expired">Expiré</option>
                <option value="cancelled">Annulé</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu des onglets */}
      {activeTab === 'plans' ? (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prix
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durée
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Abonnés
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenus
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSubscriptions.map((subscription) => (
                  <tr key={subscription.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{subscription.nom}</div>
                        <div className="text-sm text-gray-500">{subscription.description}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {subscription.prix.toLocaleString('fr-FR')} FCFA
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{subscription.duree_jours} jours</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(subscription.statut)}
                        <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(subscription.statut)}`}>
                          {getStatusText(subscription.statut)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{subscription.nombre_abonnes}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-green-600">
                        {subscription.revenus_totaux.toLocaleString('fr-FR')} FCFA
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 mr-3">
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredSubscriptions.length === 0 && (
            <div className="text-center py-12">
              <TrendingUp className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun plan trouvé</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || statusFilter !== 'all' ? 'Essayez de modifier vos filtres.' : 'Aucun plan d\'abonnement n\'a été créé.'}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Abonné
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date Début
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date Fin
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Montant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSubscribers.map((subscriber) => (
                  <tr key={subscriber.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{subscriber.user.nom}</div>
                        <div className="text-sm text-gray-500">{subscriber.user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{subscriber.abonnement.nom}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(subscriber.date_debut).toLocaleDateString('fr-FR')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(subscriber.date_fin).toLocaleDateString('fr-FR')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(subscriber.statut)}`}>
                        {getStatusText(subscriber.statut)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-green-600">
                        {subscriber.montant_paye.toLocaleString('fr-FR')} FCFA
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 mr-3">
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredSubscribers.length === 0 && (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun abonné trouvé</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || statusFilter !== 'all' ? 'Essayez de modifier vos filtres.' : 'Aucun abonné n\'a été trouvé.'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Modal de création d'abonnement */}
      {showCreateModal && <CreateSubscriptionModal onClose={() => setShowCreateModal(false)} onSuccess={fetchData} />}
    </div>
  );
};

export default SubscriptionsPage; 