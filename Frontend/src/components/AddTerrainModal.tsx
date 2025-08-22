import React, { useState } from 'react';
import { X, MapPin, DollarSign, Clock, Users, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import apiService from '../services/api';

interface AddTerrainModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddTerrainModal: React.FC<AddTerrainModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    adresse: '',
    prix_par_heure: '',
    capacite_max: '',
    amenagements: '',
    coordonnees_gps: '',
    heures_ouverture: '08:00',
    heures_fermeture: '20:00',
    surface: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nom || !formData.adresse || !formData.prix_par_heure) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setLoading(true);

    try {
      const response = await apiService.post('/terrains', {
        ...formData,
        prix_par_heure: parseFloat(formData.prix_par_heure),
        capacite_max: formData.capacite_max ? parseInt(formData.capacite_max) : null,
        surface: formData.surface ? parseFloat(formData.surface) : null
      });

      if (response.success) {
        toast.success('Terrain ajouté avec succès !');
        onSuccess();
        onClose();
        
        // Réinitialiser le formulaire
        setFormData({
          nom: '',
          description: '',
          adresse: '',
          prix_par_heure: '',
          capacite_max: '',
          amenagements: '',
          coordonnees_gps: '',
          heures_ouverture: '08:00',
          heures_fermeture: '20:00',
          surface: ''
        });
      } else {
        toast.error(response.message || 'Erreur lors de l\'ajout du terrain');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de l\'ajout du terrain');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Ajouter votre premier terrain</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Informations de base */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Informations de base</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du terrain *
                </label>
                <input
                  type="text"
                  name="nom"
                  value={formData.nom}
                  onChange={handleInputChange}
                  placeholder="Ex: Terrain de foot Liberté"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prix par heure (CFA) *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    name="prix_par_heure"
                    value={formData.prix_par_heure}
                    onChange={handleInputChange}
                    placeholder="25000"
                    className="w-full pl-10 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Décrivez votre terrain (état, équipements...)"
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Localisation */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Localisation</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adresse complète *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="adresse"
                  value={formData.adresse}
                  onChange={handleInputChange}
                  placeholder="Ex: Liberté 6, Dakar, Sénégal"
                  className="w-full pl-10 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Coordonnées GPS (optionnel)
              </label>
              <input
                type="text"
                name="coordonnees_gps"
                value={formData.coordonnees_gps}
                onChange={handleInputChange}
                placeholder="Ex: 14.7319, -17.4761"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Caractéristiques */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Caractéristiques</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Capacité max (joueurs)
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    name="capacite_max"
                    value={formData.capacite_max}
                    onChange={handleInputChange}
                    placeholder="22"
                    className="w-full pl-10 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Surface (m²)
                </label>
                <input
                  type="number"
                  name="surface"
                  value={formData.surface}
                  onChange={handleInputChange}
                  placeholder="7140"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Aménagements
                </label>
                <input
                  type="text"
                  name="amenagements"
                  value={formData.amenagements}
                  onChange={handleInputChange}
                  placeholder="Vestiaires, éclairage..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Horaires */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Horaires d'ouverture</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Heure d'ouverture
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-2 w-5 h-5 text-gray-400" />
                  <input
                    type="time"
                    name="heures_ouverture"
                    value={formData.heures_ouverture}
                    onChange={handleInputChange}
                    className="w-full pl-10 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Heure de fermeture
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-2 w-5 h-5 text-gray-400" />
                  <input
                    type="time"
                    name="heures_fermeture"
                    value={formData.heures_fermeture}
                    onChange={handleInputChange}
                    className="w-full pl-10 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center px-6 py-2 bg-gradient-to-r from-green-600 to-orange-500 text-white rounded-lg hover:from-green-700 hover:to-orange-600 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Ajout en cours...' : 'Ajouter le terrain'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTerrainModal; 