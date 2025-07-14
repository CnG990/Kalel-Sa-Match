import React, { useState, useEffect } from 'react';
import { Bell, Search, Send, Plus, Eye, Trash2, Settings, Users, Mail, AlertTriangle, CheckCircle, X, Clock } from 'lucide-react';
import apiService from '../../services/api';
import toast from 'react-hot-toast';

interface Notification {
  id: number;
  titre: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  destinataires: 'all' | 'clients' | 'gestionnaires' | 'admins' | 'specific';
  statut: 'draft' | 'sent' | 'scheduled' | 'cancelled';
  date_creation: string;
  date_envoi?: string;
  nombre_destinataires: number;
  nombre_lus: number;
  nombre_clics: number;
}

interface NotificationTemplate {
  id: number;
  nom: string;
  titre: string;
  message: string;
  type: string;
  variables: string[];
}

interface CreateNotificationModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const CreateNotificationModal: React.FC<CreateNotificationModalProps> = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    titre: '',
    message: '',
    type_notification: 'info',
    cibles: ['all'],
    date_programmee: '',
    est_recurrente: false,
    parametres_recurrence: null as any,
    template_id: null as number | null
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

  const handleCiblesChange = (cible: string) => {
    const newCibles = formData.cibles.includes(cible)
      ? formData.cibles.filter(c => c !== cible)
      : [...formData.cibles, cible];
    setFormData(prev => ({ ...prev, cibles: newCibles }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validation
      if (!formData.titre || !formData.message || formData.cibles.length === 0) {
        toast.error('Veuillez remplir tous les champs obligatoires');
        return;
      }

      const response = await apiService.createNotification(formData);
      
      if (response.success) {
        toast.success('Notification créée avec succès !');
        onSuccess();
        onClose();
      } else {
        toast.error(response.message || 'Erreur lors de la création');
      }
    } catch (error) {
      toast.error('Erreur lors de la création de la notification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Nouvelle Notification</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Informations de base */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titre <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="titre"
                value={formData.titre}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Maintenance prévue"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type <span className="text-red-500">*</span>
              </label>
              <select
                name="type_notification"
                value={formData.type_notification}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="info">Information</option>
                <option value="warning">Avertissement</option>
                <option value="success">Succès</option>
                <option value="error">Erreur</option>
                <option value="promo">Promotion</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Programmation
              </label>
              <input
                type="datetime-local"
                name="date_programmee"
                value={formData.date_programmee}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                min={new Date().toISOString().slice(0, 16)}
              />
              <p className="text-xs text-gray-500 mt-1">
                Laisser vide pour envoyer maintenant
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message <span className="text-red-500">*</span>
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Rédigez votre message..."
              required
            />
          </div>

          {/* Destinataires */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Destinataires <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { value: 'all', label: 'Tous les utilisateurs', desc: 'Clients + Gestionnaires + Admins' },
                { value: 'clients', label: 'Clients uniquement', desc: 'Utilisateurs clients' },
                { value: 'gestionnaires', label: 'Gestionnaires', desc: 'Propriétaires de terrains' },
                { value: 'admins', label: 'Administrateurs', desc: 'Équipe admin' }
              ].map((option) => (
                <label key={option.value} className="relative flex cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={formData.cibles.includes(option.value)}
                    onChange={() => handleCiblesChange(option.value)}
                  />
                  <div className={`w-full p-3 border-2 rounded-lg text-sm ${
                    formData.cibles.includes(option.value)
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <div className="font-medium">{option.label}</div>
                    <div className="text-xs text-gray-500 mt-1">{option.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Options avancées */}
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="est_recurrente"
                checked={formData.est_recurrente}
                onChange={handleInputChange}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Notification récurrente</span>
            </label>
            {formData.est_recurrente && (
              <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  🚧 Les notifications récurrentes seront configurables dans une prochaine version.
                </p>
              </div>
            )}
          </div>

          {/* Aperçu */}
          <div className="border-t pt-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Aperçu de la notification</h4>
            <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-full ${
                  formData.type_notification === 'info' ? 'bg-blue-100' :
                  formData.type_notification === 'warning' ? 'bg-yellow-100' :
                  formData.type_notification === 'success' ? 'bg-green-100' :
                  formData.type_notification === 'error' ? 'bg-red-100' : 'bg-purple-100'
                }`}>
                  {formData.type_notification === 'info' && <Bell className="w-4 h-4 text-blue-600" />}
                  {formData.type_notification === 'warning' && <AlertTriangle className="w-4 h-4 text-yellow-600" />}
                  {formData.type_notification === 'success' && <CheckCircle className="w-4 h-4 text-green-600" />}
                  {formData.type_notification === 'error' && <AlertTriangle className="w-4 h-4 text-red-600" />}
                  {formData.type_notification === 'promo' && <Mail className="w-4 h-4 text-purple-600" />}
                </div>
                <div className="flex-1">
                  <h5 className="font-medium text-gray-900">
                    {formData.titre || 'Titre de la notification'}
                  </h5>
                  <p className="text-sm text-gray-600 mt-1">
                    {formData.message || 'Message de la notification...'}
                  </p>
                  <div className="flex items-center text-xs text-gray-500 mt-2">
                    <Clock className="w-3 h-3 mr-1" />
                    {formData.date_programmee ? 
                      `Programmé pour le ${new Date(formData.date_programmee).toLocaleString('fr-FR')}` :
                      'Envoi immédiat'
                    }
                  </div>
                </div>
              </div>
            </div>
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
              {loading ? 'Création...' : (formData.date_programmee ? 'Programmer' : 'Créer et envoyer')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'notifications' | 'templates' | 'stats'>('notifications');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [stats, setStats] = useState({
    totalNotifications: 0,
    sentToday: 0,
    totalRecipients: 0,
    averageOpenRate: 0,
    totalTemplates: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [notificationsRes, templatesRes] = await Promise.all([
        apiService.get('/admin/notifications'),
        apiService.get('/admin/notification-templates')
      ]);
      
      // Vérification robuste des données avec fallbacks
      const notificationsData = notificationsRes?.data?.notifications || notificationsRes?.data || [];
      const templatesData = templatesRes?.data?.templates || templatesRes?.data || [];
      
      setNotifications(Array.isArray(notificationsData) ? notificationsData : []);
      setTemplates(Array.isArray(templatesData) ? templatesData : []);
      
      // Calculer les statistiques avec protection contre les erreurs
      const totalNotifications = notificationsData?.length || 0;
      const sentToday = notificationsData?.filter((n: Notification) => {
        try {
          const today = new Date().toDateString();
          return n.date_envoi && new Date(n.date_envoi).toDateString() === today;
        } catch {
          return false;
        }
      }).length || 0;
      const totalRecipients = notificationsData?.reduce((sum: number, n: Notification) => {
        return sum + (n.nombre_destinataires || 0);
      }, 0) || 0;
      const totalTemplates = templatesData?.length || 0;
      
      setStats({ 
        totalNotifications, 
        sentToday, 
        totalRecipients, 
        averageOpenRate: 75.5, // Exemple
        totalTemplates
      });
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      // Fallback avec données vides en cas d'erreur
      setNotifications([]);
      setTemplates([]);
      setStats({
        totalNotifications: 0,
        sentToday: 0,
        totalRecipients: 0,
        averageOpenRate: 0,
        totalTemplates: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'info': return <Bell className="w-4 h-4 text-blue-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default: return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTypeBadge = (type: string) => {
    const typeMap = {
      info: 'bg-blue-100 text-blue-800',
      warning: 'bg-yellow-100 text-yellow-800',
      success: 'bg-green-100 text-green-800',
      error: 'bg-red-100 text-red-800'
    };
    return typeMap[type as keyof typeof typeMap] || 'bg-gray-100 text-gray-800';
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      draft: 'bg-gray-100 text-gray-800',
      sent: 'bg-green-100 text-green-800',
      scheduled: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return statusMap[status as keyof typeof statusMap] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: string) => {
    const statusMap = {
      draft: 'Brouillon',
      sent: 'Envoyé',
      scheduled: 'Programmé',
      cancelled: 'Annulé'
    };
    return statusMap[status as keyof typeof statusMap] || status;
  };

  const getTypeText = (type: string) => {
    const typeMap = {
      info: 'Information',
      warning: 'Avertissement',
      success: 'Succès',
      error: 'Erreur'
    };
    return typeMap[type as keyof typeof typeMap] || type;
  };

  const getRecipientsText = (destinataires: string) => {
    const recipientsMap = {
      all: 'Tous les utilisateurs',
      clients: 'Clients uniquement',
      gestionnaires: 'Gestionnaires uniquement',
      admins: 'Administrateurs uniquement',
      specific: 'Utilisateurs spécifiques'
    };
    return recipientsMap[destinataires as keyof typeof recipientsMap] || destinataires;
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = 
      notification.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || notification.statut === statusFilter;
    const matchesType = typeFilter === 'all' || notification.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const filteredTemplates = templates.filter(template => {
    return template.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
           template.titre.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const sendNotification = async (id: number) => {
    try {
      await apiService.post(`/admin/notifications/${id}/send`);
      fetchData(); // Recharger les données
    } catch (error) {
      console.error('Erreur lors de l\'envoi:', error);
    }
  };

  const deleteNotification = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette notification ?')) {
      try {
        await apiService.delete(`/admin/notifications/${id}`);
        fetchData(); // Recharger les données
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
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
          <Bell className="w-8 h-8 text-blue-600" />
          Gestion des Notifications
        </h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nouvelle Notification
        </button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Notifications</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalNotifications}</p>
            </div>
            <Bell className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Envoyées Aujourd'hui</p>
              <p className="text-2xl font-bold text-gray-900">{stats.sentToday}</p>
            </div>
            <Send className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Destinataires</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalRecipients}</p>
            </div>
            <Users className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Taux d'Ouverture</p>
              <p className="text-2xl font-bold text-gray-900">{stats.averageOpenRate}%</p>
            </div>
            <Eye className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-indigo-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Modèles</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalTemplates}</p>
            </div>
            <Settings className="w-8 h-8 text-indigo-500" />
          </div>
        </div>
      </div>

      {/* Onglets */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('notifications')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'notifications'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Notifications
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'templates'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Modèles
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'stats'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Statistiques
            </button>
          </nav>
        </div>

        {/* Filtres */}
        <div className="p-6 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rechercher</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Titre, message..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            {activeTab === 'notifications' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="draft">Brouillon</option>
                    <option value="sent">Envoyé</option>
                    <option value="scheduled">Programmé</option>
                    <option value="cancelled">Annulé</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Tous les types</option>
                    <option value="info">Information</option>
                    <option value="warning">Avertissement</option>
                    <option value="success">Succès</option>
                    <option value="error">Erreur</option>
                  </select>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Contenu des onglets */}
      {activeTab === 'notifications' && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Notification
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Destinataires
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Performance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredNotifications.map((notification) => (
                  <tr key={notification.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{notification.titre}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">{notification.message}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getTypeIcon(notification.type)}
                        <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeBadge(notification.type)}`}>
                          {getTypeText(notification.type)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{getRecipientsText(notification.destinataires)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(notification.statut)}`}>
                        {getStatusText(notification.statut)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div>Envoyés: {notification.nombre_destinataires}</div>
                        <div>Lus: {notification.nombre_lus}</div>
                        <div>Clics: {notification.nombre_clics}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(notification.date_creation).toLocaleDateString('fr-FR')}
                      </div>
                      {notification.date_envoi && (
                        <div className="text-sm text-gray-500">
                          Envoyé: {new Date(notification.date_envoi).toLocaleDateString('fr-FR')}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-900">
                          <Eye className="w-4 h-4" />
                        </button>
                        {notification.statut === 'draft' && (
                          <button 
                            onClick={() => sendNotification(notification.id)}
                            className="text-green-600 hover:text-green-900"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        )}
                        <button 
                          onClick={() => deleteNotification(notification.id)}
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
          
          {filteredNotifications.length === 0 && (
            <div className="text-center py-12">
              <Bell className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune notification trouvée</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' ? 'Essayez de modifier vos filtres.' : 'Aucune notification n\'a été créée.'}
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'templates' && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Modèle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Titre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Variables
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTemplates.map((template) => (
                  <tr key={template.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{template.nom}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{template.titre}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeBadge(template.type)}`}>
                        {getTypeText(template.type)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {template.variables.map((variable, index) => (
                          <span key={index} className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">
                            {variable}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-900">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="text-green-600 hover:text-green-900">
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredTemplates.length === 0 && (
            <div className="text-center py-12">
              <Settings className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun modèle trouvé</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? 'Essayez de modifier vos filtres.' : 'Aucun modèle de notification n\'a été créé.'}
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'stats' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Performance des Notifications</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Taux d'ouverture moyen</span>
                <span className="text-sm font-medium text-gray-900">75.5%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Taux de clic moyen</span>
                <span className="text-sm font-medium text-gray-900">12.3%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Notifications envoyées ce mois</span>
                <span className="text-sm font-medium text-gray-900">1,247</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Types de Notifications</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Informations</span>
                <span className="text-sm font-medium text-gray-900">45%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Avertissements</span>
                <span className="text-sm font-medium text-gray-900">25%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Succès</span>
                <span className="text-sm font-medium text-gray-900">20%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Erreurs</span>
                <span className="text-sm font-medium text-gray-900">10%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de création de notification */}
      {showCreateModal && <CreateNotificationModal onClose={() => setShowCreateModal(false)} onSuccess={fetchData} />}
    </div>
  );
};

export default NotificationsPage; 