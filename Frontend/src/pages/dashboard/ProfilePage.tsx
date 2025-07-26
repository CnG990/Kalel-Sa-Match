import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Edit3, Save, X, Camera, Shield, Bell, Globe, Heart, Star, Trophy, Clock, CreditCard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/api';
import toast from 'react-hot-toast';

interface UserProfile {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  adresse?: string;
  date_naissance?: string;
  slogan?: string;
  profile_image_url?: string;
  role: string;
  created_at: string;
  total_reservations: number;
  total_depense: number;
  terrains_favoris: number;
  statut_abonnement?: string;
}

const ProfilePage: React.FC = () => {
  const { refreshUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    telephone: '',
    adresse: '',
    date_naissance: '',
    slogan: ''
  });

  const [preferences, setPreferences] = useState({
    notifications_email: true,
    notifications_sms: false,
    notifications_push: true,
    langue: 'fr',
    theme: 'light',
    newsletter: true
  });

  // Chargement du profil
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await apiService.getProfile();
      if (response.success && response.data) {
        const profileData = response.data;
        setProfile(profileData);
        setFormData({
          nom: profileData.nom || '',
          prenom: profileData.prenom || '',
          telephone: profileData.telephone || '',
          adresse: profileData.adresse || '',
          date_naissance: profileData.date_naissance || '',
          slogan: profileData.slogan || ''
        });
      }
    } catch (error) {
      console.error('Erreur chargement profil:', error);
      toast.error('Erreur lors du chargement du profil');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const updateData = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value) updateData.append(key, value);
      });
      
      if (imageFile) {
        updateData.append('profile_image', imageFile);
      }

      const response = await apiService.updateProfile(updateData);
      if (response.success) {
        toast.success('Profil mis à jour avec succès');
        setEditing(false);
        await loadProfile();
        await refreshUser(); // Mettre à jour le contexte d'authentification
        setImageFile(null); // Reset image file après sauvegarde
      } else {
        toast.error('Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('L\'image ne doit pas dépasser 5MB');
        return;
      }
      setImageFile(file);
      }
  };

  const getImageUrl = (url?: string) => {
    if (!url) return `https://ui-avatars.com/api/?name=${profile?.prenom}+${profile?.nom}&background=random&size=200`;
    if (url.startsWith('http')) return url;
    
    // Nettoyer l'URL pour éviter les doublons de 'storage'
    const cleanUrl = url.replace('public/', '').replace('storage/', '');
    return `https://ad07ffba09ee.ngrok-free.app/storage/${cleanUrl}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRoleDisplay = (role: string) => {
    const roles = {
      'client': 'Client',
      'gestionnaire': 'Gestionnaire',
      'admin': 'Administrateur'
    };
    return roles[role as keyof typeof roles] || role;
  };

  const getStatutColor = (statut?: string) => {
    switch (statut) {
      case 'premium': return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
      case 'vip': return 'bg-gradient-to-r from-purple-500 to-purple-700 text-white';
      case 'standard': return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white';
      default: return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Impossible de charger le profil</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-xl p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">👤 Mon Profil</h1>
        <p className="text-blue-100">Gérez vos informations personnelles et préférences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne gauche - Profil principal */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* En-tête du profil */}
            <div className="bg-gradient-to-r from-orange-500 to-red-600 p-6 text-white relative">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <img
                      src={imageFile ? URL.createObjectURL(imageFile) : getImageUrl(profile.profile_image_url)}
                      alt={`${profile.prenom} ${profile.nom}`}
                      className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                    {editing && (
                      <label className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-2 cursor-pointer hover:bg-blue-700 transition-colors">
                        <Camera className="w-4 h-4 text-white" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                  <div>
                    {editing ? (
                      <div className="space-y-2">
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            value={formData.prenom}
                            onChange={(e) => setFormData({...formData, prenom: e.target.value})}
                            className="bg-white/20 backdrop-blur rounded px-3 py-1 text-white placeholder-white/70 border border-white/30"
                            placeholder="Prénom"
                          />
                          <input
                            type="text"
                            value={formData.nom}
                            onChange={(e) => setFormData({...formData, nom: e.target.value})}
                            className="bg-white/20 backdrop-blur rounded px-3 py-1 text-white placeholder-white/70 border border-white/30"
                            placeholder="Nom"
                          />
                        </div>
                        <input
                          type="text"
                          value={formData.slogan}
                          onChange={(e) => setFormData({...formData, slogan: e.target.value})}
                          className="bg-white/20 backdrop-blur rounded px-3 py-1 text-white placeholder-white/70 border border-white/30 w-full"
                          placeholder="Ajouter un slogan..."
                        />
                      </div>
                    ) : (
                      <>
                        <h2 className="text-2xl font-bold">{profile.prenom} {profile.nom}</h2>
                        <p className="text-orange-100 font-medium">{getRoleDisplay(profile.role)}</p>
                        {profile.slogan ? (
                          <p className="text-orange-100 italic mt-1">"{profile.slogan}"</p>
                        ) : (
                          <p className="text-orange-100/70 italic mt-1">Ajouter un slogan...</p>
                        )}
                      </>
                    )}
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  {editing ? (
                    <>
                      <button
                        onClick={handleSave}
                        className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                      >
                        <Save className="w-4 h-4" />
                        <span>Sauvegarder</span>
                      </button>
                      <button
                        onClick={() => setEditing(false)}
                        className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                      >
                        <X className="w-4 h-4" />
                        <span>Annuler</span>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setEditing(true)}
                      className="bg-white/20 backdrop-blur hover:bg-white/30 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                      <span>Modifier</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Badges de statut */}
              <div className="flex items-center space-x-3 mt-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatutColor(profile.statut_abonnement)}`}>
                  <Shield className="w-4 h-4 inline mr-1" />
                  {profile.statut_abonnement || 'Standard'}
                </span>
                <span className="bg-white/20 backdrop-blur px-3 py-1 rounded-full text-sm font-medium">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Membre depuis {formatDate(profile.created_at)}
                </span>
              </div>
            </div>

            {/* Informations détaillées */}
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 Informations personnelles</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Email */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center">
                    <Mail className="w-4 h-4 mr-2" />
                    Email
                  </label>
                  <div className="bg-gray-50 px-3 py-2 rounded-lg">
                    <p className="text-gray-900">{profile.email}</p>
                  </div>
                </div>

                {/* Téléphone */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center">
                    <Phone className="w-4 h-4 mr-2" />
                    Téléphone
                  </label>
                  {editing ? (
                    <input
                      type="tel"
                      value={formData.telephone}
                      onChange={(e) => setFormData({...formData, telephone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="+221 XX XXX XX XX"
                    />
                  ) : (
                    <div className="bg-gray-50 px-3 py-2 rounded-lg">
                      <p className="text-gray-900">{profile.telephone || 'Non renseigné'}</p>
                    </div>
                  )}
                </div>

                {/* Adresse */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    Adresse
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      value={formData.adresse}
                      onChange={(e) => setFormData({...formData, adresse: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Votre adresse"
                    />
                  ) : (
                    <div className="bg-gray-50 px-3 py-2 rounded-lg">
                      <p className="text-gray-900">{profile.adresse || 'Non renseignée'}</p>
                    </div>
                  )}
                </div>

                {/* Date de naissance */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    Date de naissance
                  </label>
                  {editing ? (
                    <input
                      type="date"
                      value={formData.date_naissance}
                      onChange={(e) => setFormData({...formData, date_naissance: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <div className="bg-gray-50 px-3 py-2 rounded-lg">
                      <p className="text-gray-900">
                        {profile.date_naissance ? formatDate(profile.date_naissance) : 'Non renseignée'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Préférences */}
          <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <Bell className="w-5 h-5 mr-2" />
              🔔 Préférences de notification
            </h3>
            
            <div className="space-y-4">
              {[
                { key: 'notifications_email', label: 'Notifications par email', icon: Mail },
                { key: 'notifications_sms', label: 'Notifications par SMS', icon: Phone },
                { key: 'notifications_push', label: 'Notifications push', icon: Bell },
                { key: 'newsletter', label: 'Newsletter mensuelle', icon: Globe }
              ].map(({ key, label, icon: Icon }) => (
                <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Icon className="w-5 h-5 text-gray-600" />
                    <span className="font-medium text-gray-900">{label}</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences[key as keyof typeof preferences] as boolean}
                      onChange={(e) => setPreferences({...preferences, [key]: e.target.checked})}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Colonne droite - Statistiques */}
        <div className="space-y-6">
          {/* Statistiques rapides */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Trophy className="w-5 h-5 mr-2" />
              📊 Mes statistiques
            </h3>
            
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Total réservations</p>
                    <p className="text-2xl font-bold text-blue-900">{profile.total_reservations || 0}</p>
                  </div>
                  <Calendar className="w-8 h-8 text-blue-600" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600 font-medium">Total dépensé</p>
                    <p className="text-2xl font-bold text-green-900">{(profile.total_depense || 0).toLocaleString()} FCFA</p>
                  </div>
                  <CreditCard className="w-8 h-8 text-green-600" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-red-50 to-red-100 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-red-600 font-medium">Terrains favoris</p>
                    <p className="text-2xl font-bold text-red-900">{profile.terrains_favoris || 0}</p>
                  </div>
                  <Heart className="w-8 h-8 text-red-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Actions rapides */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">⚡ Actions rapides</h3>
            
            <div className="space-y-3">
              <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all flex items-center justify-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>Mes réservations</span>
              </button>
              
              <button className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-3 rounded-lg hover:from-green-700 hover:to-green-800 transition-all flex items-center justify-center space-x-2">
                <Heart className="w-5 h-5" />
                <span>Mes favoris</span>
              </button>
              
              <button className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-3 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all flex items-center justify-center space-x-2">
                <Star className="w-5 h-5" />
                <span>Mes avis</span>
              </button>
              
              <button className="w-full bg-gradient-to-r from-orange-600 to-orange-700 text-white px-4 py-3 rounded-lg hover:from-orange-700 hover:to-orange-800 transition-all flex items-center justify-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>Sécurité</span>
              </button>
            </div>
          </div>

          {/* Dernière activité */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              🕒 Dernière activité
            </h3>
            
            <div className="text-sm text-gray-600">
              <p>Dernière connexion :</p>
              <p className="font-medium text-gray-900">Aujourd'hui à {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 