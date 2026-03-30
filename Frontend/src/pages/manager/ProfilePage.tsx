import React, { useState, useEffect } from 'react';
import { Camera, Save, X, User, Building, FileText, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/api';
import toast from 'react-hot-toast';

const toRequiredString = (value: unknown, fallback = ''): string =>
  typeof value === 'string' ? value : fallback;

const toOptionalString = (value: unknown): string | undefined =>
  typeof value === 'string' && value.length > 0 ? value : undefined;

interface UserProfile {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  profile_image?: string;
  profile_image_url?: string;
  nom_entreprise?: string;
  adresse?: string;
  description?: string;
  statut_validation: 'en_attente' | 'approuve' | 'rejete' | 'suspendu';
  numero_ninea?: string;
  numero_registre_commerce?: string;
  adresse_entreprise?: string;
  role?: string;
}

const ProfilePage: React.FC = () => {
  const { refreshUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile>({
    id: 0,
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    statut_validation: 'en_attente'
  });
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const { data } = await apiService.getProfile();

      if (!data) {
        toast.error('Erreur lors du chargement du profil');
        return;
      }

      const status = ['en_attente', 'approuve', 'rejete', 'suspendu'].includes(data.statut_validation ?? '')
        ? (data.statut_validation as UserProfile['statut_validation'])
        : 'en_attente';

      const sanitized: UserProfile = {
        id: data.id,
        nom: toRequiredString(data.nom),
        prenom: toRequiredString(data.prenom),
        email: toRequiredString(data.email),
        telephone: toRequiredString(data.telephone),
        profile_image: toOptionalString(data.profile_image_url),
        profile_image_url: toOptionalString(data.profile_image_url),
        nom_entreprise: toRequiredString((data as Record<string, unknown>).nom_entreprise, ''),
        adresse: toRequiredString((data as Record<string, unknown>).adresse, ''),
        description: toRequiredString((data as Record<string, unknown>).description, ''),
        statut_validation: status,
        numero_ninea: toRequiredString((data as Record<string, unknown>).numero_ninea, ''),
        numero_registre_commerce: toRequiredString((data as Record<string, unknown>).numero_registre_commerce, ''),
        adresse_entreprise: toRequiredString((data as Record<string, unknown>).adresse_entreprise, ''),
        role: data.role,
      };

      setProfile(sanitized);
      setImagePreview(sanitized.profile_image_url ?? null);
    } catch (error) {
      console.error('Erreur chargement profil:', error);
      toast.error('Erreur lors du chargement du profil');
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Vérifier la taille du fichier (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error('L\'image ne doit pas dépasser 2MB');
        return;
      }

      // Vérifier le type de fichier
      if (!file.type.startsWith('image/')) {
        toast.error('Veuillez sélectionner une image valide');
        return;
      }

      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(profile.profile_image_url || null);
  };

  const handleSave = async () => {
    setSaving(true);
    const toastId = toast.loading('Sauvegarde du profil...');
    
    try {
      const formData = new FormData();
      
      // Ajouter les données du profil (seulement les champs modifiables)
      formData.append('nom', profile.nom);
      formData.append('prenom', profile.prenom);
      formData.append('telephone', profile.telephone);
      
      if (profile.nom_entreprise) formData.append('nom_entreprise', profile.nom_entreprise);
      if (profile.adresse) formData.append('adresse', profile.adresse);
      if (profile.description) formData.append('description', profile.description);
      if (profile.numero_ninea) formData.append('numero_ninea', profile.numero_ninea);
      if (profile.numero_registre_commerce) formData.append('numero_registre_commerce', profile.numero_registre_commerce);
      if (profile.adresse_entreprise) formData.append('adresse_entreprise', profile.adresse_entreprise);

      // Ajouter l'image si sélectionnée
      if (selectedImage) {
        formData.append('profile_image', selectedImage);
      }

      await apiService.updateProfile(formData);

      toast.success('Profil mis à jour avec succès', { id: toastId });

      await loadProfile();
      await refreshUser();

      setEditing(false);
      setSelectedImage(null);
    } catch (error: any) {
      console.error('Erreur sauvegarde:', error);
      toast.error(error.message || 'Erreur lors de la sauvegarde du profil', { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setSelectedImage(null);
    loadProfile(); // Recharger les données originales
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      'en_attente': { color: 'bg-yellow-100 text-yellow-800', text: 'En attente de validation' },
      'approuve': { color: 'bg-green-100 text-green-800', text: 'Compte validé' },
      'rejete': { color: 'bg-red-100 text-red-800', text: 'Validation rejetée' },
      'suspendu': { color: 'bg-gray-100 text-gray-800', text: 'Compte suspendu' }
    };
    
    const badge = badges[status as keyof typeof badges] || badges.en_attente;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
        {status === 'approuve' && <Check className="w-3 h-3 mr-1" />}
        {badge.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <div className="bg-white rounded-lg shadow-md">
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Mon Profil</h1>
            <p className="text-gray-600">Gérez vos informations personnelles et professionnelles</p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            {getStatusBadge(profile.statut_validation)}
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Modifier
              </button>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                >
                  <X className="w-4 h-4 inline mr-1" />
                  Annuler
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4 inline mr-1" />
                  {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Photo de profil */}
            <div className="lg:col-span-1">
              <div className="text-center">
                <div className="mx-auto w-32 h-32 relative">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Photo de profil"
                      className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center border-4 border-gray-200">
                      <User className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                  
                  {editing && (
                    <div className="absolute bottom-0 right-0">
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageSelect}
                          className="hidden"
                        />
                        <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white hover:bg-green-700 transition-colors">
                          <Camera className="w-4 h-4" />
                        </div>
                      </label>
                    </div>
                  )}
                </div>
                
                {editing && selectedImage && (
                  <button
                    onClick={removeImage}
                    className="mt-2 text-sm text-red-600 hover:text-red-800"
                  >
                    Supprimer l'image sélectionnée
                  </button>
                )}
                
                <div className="mt-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {profile.prenom} {profile.nom}
                  </h3>
                  <p className="text-sm text-gray-500">{profile.email}</p>
                </div>
              </div>
            </div>

            {/* Informations personnelles */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Informations de base */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2 text-green-600" />
                  Informations personnelles
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Prénom
                    </label>
                    {editing ? (
                      <input
                        type="text"
                        value={profile.prenom}
                        onChange={(e) => setProfile({ ...profile, prenom: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    ) : (
                      <p className="text-gray-900">{profile.prenom}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom
                    </label>
                    {editing ? (
                      <input
                        type="text"
                        value={profile.nom}
                        onChange={(e) => setProfile({ ...profile, nom: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    ) : (
                      <p className="text-gray-900">{profile.nom}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <p className="text-gray-900">{profile.email}</p>
                    <p className="text-xs text-gray-500">L'email ne peut pas être modifié</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Téléphone
                    </label>
                    {editing ? (
                      <input
                        type="tel"
                        value={profile.telephone}
                        onChange={(e) => setProfile({ ...profile, telephone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    ) : (
                      <p className="text-gray-900">{profile.telephone}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Informations entreprise */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Building className="w-5 h-5 mr-2 text-green-600" />
                  Informations entreprise
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom de l'entreprise
                    </label>
                    {editing ? (
                      <input
                        type="text"
                        value={profile.nom_entreprise || ''}
                        onChange={(e) => setProfile({ ...profile, nom_entreprise: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    ) : (
                      <p className="text-gray-900">{profile.nom_entreprise || 'Non renseigné'}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Numéro NINEA
                    </label>
                    {editing ? (
                      <input
                        type="text"
                        value={profile.numero_ninea || ''}
                        onChange={(e) => setProfile({ ...profile, numero_ninea: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    ) : (
                      <p className="text-gray-900">{profile.numero_ninea || 'Non renseigné'}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Registre de commerce
                    </label>
                    {editing ? (
                      <input
                        type="text"
                        value={profile.numero_registre_commerce || ''}
                        onChange={(e) => setProfile({ ...profile, numero_registre_commerce: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    ) : (
                      <p className="text-gray-900">{profile.numero_registre_commerce || 'Non renseigné'}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Adresse entreprise
                    </label>
                    {editing ? (
                      <input
                        type="text"
                        value={profile.adresse_entreprise || ''}
                        onChange={(e) => setProfile({ ...profile, adresse_entreprise: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    ) : (
                      <p className="text-gray-900">{profile.adresse_entreprise || 'Non renseigné'}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-green-600" />
                  Description
                </h3>
                
                {editing ? (
                  <textarea
                    value={profile.description || ''}
                    onChange={(e) => setProfile({ ...profile, description: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Décrivez votre entreprise et vos activités..."
                  />
                ) : (
                  <p className="text-gray-900">
                    {profile.description || 'Aucune description disponible'}
                  </p>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 