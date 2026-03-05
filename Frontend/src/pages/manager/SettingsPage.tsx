import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/api';
import { 
  User, 
  Bell, 
  Shield, 
  Smartphone,
  Eye,
  EyeOff,
  Save,
  Key,
  Clock,
  Mail,
  Phone,
  CheckCircle,
  XCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const toStringOrEmpty = (value: unknown): string => (typeof value === 'string' ? value : '');

interface ProfileFormData {
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
  adresse: string;
  description: string;
  nom_entreprise: string;
}

const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'security' | 'notifications' | 'profile'>('security');
  const [loading, setLoading] = useState(false);
  
  // Paramètres de notifications
  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    sms: true,
    push: true,
    nouvelles_reservations: true,
    annulations: true,
    rappels: true,
    promotions: false
  });
  
  // Données de profil
  const [profileData, setProfileData] = useState<ProfileFormData>({
    nom: toStringOrEmpty(user?.nom),
    prenom: toStringOrEmpty(user?.prenom),
    telephone: toStringOrEmpty(user?.telephone),
    email: toStringOrEmpty(user?.email),
    adresse: toStringOrEmpty((user as Record<string, unknown>)?.adresse),
    description: toStringOrEmpty((user as Record<string, unknown>)?.description),
    nom_entreprise: toStringOrEmpty((user as Record<string, unknown>)?.nom_entreprise),
  });
  
  // Sécurité
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: ''
  });
  
  const [securityInfo, setSecurityInfo] = useState({
    two_factor_enabled: false,
    sessions_count: 1,
    last_password_change: new Date().toISOString()
  });
  
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });

  useEffect(() => {
    // Initialiser avec les données utilisateur
    if (user) {
      setProfileData({
        nom: toStringOrEmpty(user.nom),
        prenom: toStringOrEmpty(user.prenom),
        telephone: toStringOrEmpty(user.telephone),
        email: toStringOrEmpty(user.email),
        adresse: toStringOrEmpty((user as Record<string, unknown>)?.adresse),
        description: toStringOrEmpty((user as Record<string, unknown>)?.description),
        nom_entreprise: toStringOrEmpty((user as Record<string, unknown>)?.nom_entreprise),
      });
    }

    // Charger les paramètres de notifications
    const savedNotifications = localStorage.getItem('notificationSettings');
    if (savedNotifications) {
      try {
        setNotificationSettings(JSON.parse(savedNotifications));
      } catch (error) {
        console.error('Erreur lors du chargement des notifications:', error);
      }
    }
  }, [user]);

  const saveNotificationSettings = async () => {
    setLoading(true);
    try {
      // Sauvegarder en localStorage
      localStorage.setItem('notificationSettings', JSON.stringify(notificationSettings));
      
      // Simuler sauvegarde API
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success(
        '🔔 Préférences de notifications sauvegardées !',
        {
          duration: 3000,
          style: {
            background: '#10B981',
            color: 'white',
            fontSize: '16px',
            fontWeight: 'bold',
            padding: '16px 20px',
            borderRadius: '12px',
          },
          icon: '⚙️',
        }
      );
    } catch (error) {
      toast.error('❌ Erreur lors de la sauvegarde', {
        duration: 4000,
        style: {
          background: '#EF4444',
          color: 'white',
          fontSize: '16px',
          padding: '16px 20px',
          borderRadius: '12px',
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async () => {
    if (passwordData.new_password !== passwordData.new_password_confirmation) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }
    
    if (passwordData.new_password.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    
    setLoading(true);
    try {
      await apiService.changePassword(passwordData);

      toast.success(
        '🔐 Mot de passe modifié avec succès !',
        {
          duration: 5000,
          style: {
            background: '#10B981',
            color: 'white',
            fontSize: '16px',
            fontWeight: 'bold',
            padding: '16px 20px',
            borderRadius: '12px',
          },
          icon: '✅',
        }
      );
      
      setTimeout(() => {
        toast.success(
          '📧 Un email de confirmation vous a été envoyé',
          {
            duration: 4000,
            style: {
              background: '#3B82F6',
              color: 'white',
              fontSize: '14px',
              padding: '12px 16px',
              borderRadius: '8px',
            },
            icon: '📬',
          }
        );
      }, 1000);
      
      setSecurityInfo((prev) => ({
        ...prev,
        last_password_change: new Date().toISOString(),
      }));
      setPasswordData({ current_password: '', new_password: '', new_password_confirmation: '' });
    } catch (error) {
      toast.error('❌ Erreur lors du changement de mot de passe', {
        duration: 4000,
        style: {
          background: '#EF4444',
          color: 'white',
          fontSize: '16px',
          padding: '16px 20px',
          borderRadius: '12px',
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    setLoading(true);
    try {
      const { data } = await apiService.updateProfile({ ...profileData } as Record<string, unknown>);
      if (data) {
        setProfileData({
          nom: toStringOrEmpty(data.nom) || profileData.nom,
          prenom: toStringOrEmpty(data.prenom) || profileData.prenom,
          telephone: toStringOrEmpty(data.telephone) || profileData.telephone,
          email: toStringOrEmpty(data.email) || profileData.email,
          adresse: toStringOrEmpty((data as Record<string, unknown>).adresse) || profileData.adresse,
          description: toStringOrEmpty((data as Record<string, unknown>).description) || profileData.description,
          nom_entreprise: toStringOrEmpty((data as Record<string, unknown>).nom_entreprise) || profileData.nom_entreprise,
        });
      }

      toast.success(
        '👤 Profil mis à jour avec succès !',
        {
          duration: 3000,
          style: {
            background: '#10B981',
            color: 'white',
            fontSize: '16px',
            fontWeight: 'bold',
            padding: '16px 20px',
            borderRadius: '12px',
          },
          icon: '✅',
        }
      );
    } catch (error) {
      toast.error('❌ Erreur lors de la mise à jour du profil', {
        duration: 4000,
        style: {
          background: '#EF4444',
          color: 'white',
          fontSize: '16px',
          padding: '16px 20px',
          borderRadius: '12px',
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const toggle2FA = async () => {
    setLoading(true);
    try {
      // Simuler activation/désactivation 2FA
      await new Promise(resolve => setTimeout(resolve, 1000));
      const wasEnabled = securityInfo.two_factor_enabled;
      setSecurityInfo({
        ...securityInfo,
        two_factor_enabled: !securityInfo.two_factor_enabled
      });
      
      if (wasEnabled) {
        toast.success(
          '🔓 Authentification 2FA désactivée',
          {
            duration: 3000,
            style: {
              background: '#F59E0B',
              color: 'white',
              fontSize: '16px',
              fontWeight: 'bold',
              padding: '16px 20px',
              borderRadius: '12px',
            },
            icon: '⚠️',
          }
        );
      } else {
        toast.success(
          '🔐 Authentification 2FA activée !',
          {
            duration: 4000,
            style: {
              background: '#10B981',
              color: 'white',
              fontSize: '16px',
              fontWeight: 'bold',
              padding: '16px 20px',
              borderRadius: '12px',
            },
            icon: '🛡️',
          }
        );
        
        // Notification secondaire pour 2FA
        setTimeout(() => {
          toast.success(
            '📱 Configurez votre application d\'authentification',
            {
              duration: 3000,
              style: {
                background: '#3B82F6',
                color: 'white',
                fontSize: '14px',
                padding: '12px 16px',
                borderRadius: '8px',
              },
              icon: '📲',
            }
          );
        }, 1000);
      }
    } catch (error) {
      toast.error('❌ Erreur lors de la modification 2FA', {
        duration: 4000,
        style: {
          background: '#EF4444',
          color: 'white',
          fontSize: '16px',
          padding: '16px 20px',
          borderRadius: '12px',
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Sécurité et authentification</h3>
      
      {/* Changer mot de passe */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-4">Changer le mot de passe</h4>
        <div className="space-y-4">
          <div className="relative">
            <input
              type={showPassword.current ? 'text' : 'password'}
              value={passwordData.current_password}
              onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
              placeholder="Mot de passe actuel"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <button
              type="button"
              onClick={() => setShowPassword({ ...showPassword, current: !showPassword.current })}
              className="absolute right-3 top-2 text-gray-400 hover:text-gray-600"
            >
              {showPassword.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          
          <div className="relative">
            <input
              type={showPassword.new ? 'text' : 'password'}
              value={passwordData.new_password}
              onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
              placeholder="Nouveau mot de passe"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <button
              type="button"
              onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })}
              className="absolute right-3 top-2 text-gray-400 hover:text-gray-600"
            >
              {showPassword.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          
          <div className="relative">
            <input
              type={showPassword.confirm ? 'text' : 'password'}
              value={passwordData.new_password_confirmation}
              onChange={(e) => setPasswordData({ ...passwordData, new_password_confirmation: e.target.value })}
              placeholder="Confirmer le nouveau mot de passe"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <button
              type="button"
              onClick={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })}
              className="absolute right-3 top-2 text-gray-400 hover:text-gray-600"
            >
              {showPassword.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <button
              onClick={changePassword}
              disabled={loading || !passwordData.current_password || !passwordData.new_password}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Key className="w-4 h-4 mr-2" />
              {loading ? 'Modification...' : 'Changer le mot de passe'}
            </button>
            
            <div className="text-sm text-gray-500">
              <Clock className="w-4 h-4 inline mr-1" />
              Dernière modification : {new Date(securityInfo.last_password_change).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Authentification à double facteur */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-900">Authentification à double facteur (2FA)</h4>
            <p className="text-sm text-gray-600">Sécurisez votre compte avec un code de vérification</p>
          </div>
          <button
            onClick={toggle2FA}
            disabled={loading}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
              securityInfo.two_factor_enabled
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-green-600 hover:bg-green-700 text-white'
            } disabled:opacity-50`}
          >
            <Shield className="w-4 h-4 mr-2" />
            {securityInfo.two_factor_enabled ? 'Désactiver' : 'Activer'}
          </button>
        </div>
      </div>

      {/* Sessions actives */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Sessions actives</h4>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Smartphone className="w-4 h-4 mr-2 text-gray-500" />
            <span className="text-sm text-gray-600">{securityInfo.sessions_count} session(s) active(s)</span>
          </div>
          <button className="text-red-600 hover:text-red-700 text-sm">
            Déconnecter les autres sessions
          </button>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Préférences de notifications</h3>
      
      {/* Canaux de notification */}
      <div>
        <h4 className="font-medium text-gray-900 mb-4">Canaux de notification</h4>
        <div className="space-y-3">
          {[
            { key: 'email', label: 'Email', icon: Mail },
            { key: 'sms', label: 'SMS', icon: Phone },
            { key: 'push', label: 'Notifications push', icon: Bell }
          ].map(({ key, label, icon: Icon }) => (
            <div key={key} className="flex items-center justify-between">
              <div className="flex items-center">
                <Icon className="w-4 h-4 mr-2 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">{label}</span>
              </div>
              <button
                onClick={() => setNotificationSettings({
                  ...notificationSettings,
                  [key]: !notificationSettings[key as keyof typeof notificationSettings]
                })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notificationSettings[key as keyof typeof notificationSettings]
                    ? 'bg-green-600'
                    : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notificationSettings[key as keyof typeof notificationSettings]
                      ? 'translate-x-6'
                      : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Types de notifications */}
      <div>
        <h4 className="font-medium text-gray-900 mb-4">Types de notifications</h4>
        <div className="space-y-4">
          {[
            {
              key: 'nouvelles_reservations',
              label: 'Nouvelles réservations',
              description: 'Recevoir des notifications pour les nouvelles réservations'
            },
            {
              key: 'annulations',
              label: 'Annulations',
              description: 'Être notifié des annulations de réservations'
            },
            {
              key: 'rappels',
              label: 'Rappels',
              description: 'Recevoir des rappels pour les réservations à venir'
            },
            {
              key: 'promotions',
              label: 'Promotions et actualités',
              description: 'Recevoir des informations sur les nouvelles fonctionnalités'
            }
          ].map(({ key, label, description }) => (
            <div key={key} className="flex items-start justify-between">
              <div>
                <h5 className="text-sm font-medium text-gray-900">{label}</h5>
                <p className="text-sm text-gray-600">{description}</p>
              </div>
              <button
                onClick={() => setNotificationSettings({
                  ...notificationSettings,
                  [key]: !notificationSettings[key as keyof typeof notificationSettings]
                })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notificationSettings[key as keyof typeof notificationSettings]
                    ? 'bg-green-600'
                    : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notificationSettings[key as keyof typeof notificationSettings]
                      ? 'translate-x-6'
                      : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={saveNotificationSettings}
        disabled={loading}
        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
      >
        <Save className="w-4 h-4 mr-2" />
        {loading ? 'Sauvegarde...' : 'Sauvegarder'}
      </button>
    </div>
  );

  const renderProfileSettings = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Informations du profil</h3>
      
      {/* Statut du compte */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-3">Statut du compte</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Statut de validation</span>
            <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              user?.statut_validation === 'approuve'
                ? 'bg-green-100 text-green-800'
                : user?.statut_validation === 'en_attente'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {user?.statut_validation === 'approuve' && <CheckCircle className="w-3 h-3 mr-1" />}
              {user?.statut_validation === 'en_attente' && <Clock className="w-3 h-3 mr-1" />}
              {user?.statut_validation === 'rejete' && <XCircle className="w-3 h-3 mr-1" />}
              {user?.statut_validation === 'approuve' ? 'Validé' : 
               user?.statut_validation === 'en_attente' ? 'En attente' : 'Non validé'}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Rôle</span>
            <span className="text-sm font-medium text-gray-900">
              {user?.role === 'gestionnaire' ? 'Gestionnaire de terrains' : user?.role}
            </span>
          </div>
        </div>
      </div>

      {/* Informations personnelles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
          <input
            type="text"
            value={profileData.prenom}
            onChange={(e) => setProfileData({ ...profileData, prenom: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
          <input
            type="text"
            value={profileData.nom}
            onChange={(e) => setProfileData({ ...profileData, nom: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          type="email"
          value={profileData.email}
          onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
        <input
          type="tel"
          value={profileData.telephone}
          onChange={(e) => setProfileData({ ...profileData, telephone: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nom de l'entreprise</label>
        <input
          type="text"
          value={profileData.nom_entreprise}
          onChange={(e) => setProfileData({ ...profileData, nom_entreprise: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
        <input
          type="text"
          value={profileData.adresse}
          onChange={(e) => setProfileData({ ...profileData, adresse: e.target.value })}
          placeholder="Non renseigné"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description / Bio</label>
        <textarea
          value={profileData.description}
          onChange={(e) => setProfileData({ ...profileData, description: e.target.value })}
          placeholder="Aucune description"
          rows={4}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      <button
        onClick={updateProfile}
        disabled={loading}
        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
      >
        <Save className="w-4 h-4 mr-2" />
        {loading ? 'Mise à jour...' : 'Mettre à jour le profil'}
      </button>
    </div>
  );

  const tabs = [
    { id: 'security', label: 'Sécurité', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'profile', label: 'Profil', icon: User }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Paramètres</h1>
        <p className="text-gray-600">Gérez vos préférences et paramètres de compte</p>
      </div>

      <div className="bg-white rounded-lg shadow-lg">
        {/* Onglets */}
        <div className="border-b border-gray-200">
          <nav className="flex flex-wrap gap-2 sm:gap-0 sm:space-x-8 px-4 sm:px-6" aria-label="Tabs">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === id
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Contenu */}
        <div className="p-6">
          {activeTab === 'security' && renderSecuritySettings()}
          {activeTab === 'notifications' && renderNotificationSettings()}
          {activeTab === 'profile' && renderProfileSettings()}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage; 