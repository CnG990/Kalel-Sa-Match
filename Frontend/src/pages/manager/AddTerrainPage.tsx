import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, MapPin, DollarSign, Clock, Percent } from 'lucide-react';
import toast from 'react-hot-toast';
import apiService from '../../services/api';

interface TerrainForm {
  nom: string;
  description: string;
  adresse: string;
  ville: string;
  latitude: string;
  longitude: string;
  prix_heure: string;
  capacite: string;
  type_surface: string;
  horaires_ouverture: string;
  horaires_fermeture: string;
  equipements: string;
  type_acompte: 'pourcentage' | 'montant_fixe' | 'aucun';
  pourcentage_acompte: string;
  montant_acompte_fixe: string;
}

const AddTerrainPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<TerrainForm>({
    nom: '',
    description: '',
    adresse: '',
    ville: 'Dakar',
    latitude: '',
    longitude: '',
    prix_heure: '',
    capacite: '10',
    type_surface: 'synthetique',
    horaires_ouverture: '08:00',
    horaires_fermeture: '23:00',
    equipements: '',
    type_acompte: 'pourcentage',
    pourcentage_acompte: '30',
    montant_acompte_fixe: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.nom || !form.adresse || !form.prix_heure) {
      toast.error('Veuillez remplir les champs obligatoires');
      return;
    }

    try {
      setLoading(true);
      const payload: any = {
        nom: form.nom,
        description: form.description,
        adresse: form.adresse,
        ville: form.ville,
        prix_heure: parseFloat(form.prix_heure),
        capacite: parseInt(form.capacite),
        type_surface: form.type_surface,
        horaires_ouverture: form.horaires_ouverture,
        horaires_fermeture: form.horaires_fermeture,
        equipements: form.equipements ? form.equipements.split(',').map(e => e.trim()) : [],
      };

      if (form.latitude) payload.latitude = parseFloat(form.latitude);
      if (form.longitude) payload.longitude = parseFloat(form.longitude);

      if (form.type_acompte === 'pourcentage' && form.pourcentage_acompte) {
        payload.type_acompte = 'pourcentage';
        payload.pourcentage_acompte = parseFloat(form.pourcentage_acompte);
      } else if (form.type_acompte === 'montant_fixe' && form.montant_acompte_fixe) {
        payload.type_acompte = 'montant_fixe';
        payload.montant_acompte_fixe = parseFloat(form.montant_acompte_fixe);
      }

      const response = await apiService.post('/manager/terrains/', payload);
      if (response.data) {
        toast.success('Terrain créé avec succès !');
        navigate('/manager/terrains');
      } else {
        toast.error(response.meta?.message || 'Erreur lors de la création');
      }
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error(error?.response?.data?.detail || 'Erreur lors de la création du terrain');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/manager/terrains')} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Ajouter un terrain</h1>
          <p className="text-gray-600">Remplissez les informations de votre terrain</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informations générales */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <MapPin className="mr-2 text-green-600" size={20} />
            Informations générales
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom du terrain *</label>
              <input type="text" name="nom" value={form.nom} onChange={handleChange} required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Ex: Terrain Synthétique Almadies" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Décrivez votre terrain..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Adresse *</label>
              <input type="text" name="adresse" value={form.adresse} onChange={handleChange} required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Ex: Route des Almadies, Dakar" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
              <input type="text" name="ville" value={form.ville} onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
              <input type="text" name="latitude" value={form.latitude} onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="14.7167" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
              <input type="text" name="longitude" value={form.longitude} onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="-17.4677" />
            </div>
          </div>
        </div>

        {/* Tarification et capacité */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <DollarSign className="mr-2 text-yellow-600" size={20} />
            Tarification et capacité
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prix par heure (FCFA) *</label>
              <input type="number" name="prix_heure" value={form.prix_heure} onChange={handleChange} required min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="10000" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Capacité (joueurs)</label>
              <input type="number" name="capacite" value={form.capacite} onChange={handleChange} min="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type de surface</label>
              <select name="type_surface" value={form.type_surface} onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                <option value="synthetique">Synthétique</option>
                <option value="naturel">Gazon naturel</option>
                <option value="terre_battue">Terre battue</option>
                <option value="beton">Béton</option>
              </select>
            </div>
          </div>
        </div>

        {/* Horaires */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Clock className="mr-2 text-blue-600" size={20} />
            Horaires et équipements
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Heure d'ouverture</label>
              <input type="time" name="horaires_ouverture" value={form.horaires_ouverture} onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Heure de fermeture</label>
              <input type="time" name="horaires_fermeture" value={form.horaires_fermeture} onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Équipements (séparés par des virgules)</label>
              <input type="text" name="equipements" value={form.equipements} onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Vestiaires, Douches, Éclairage, Parking" />
            </div>
          </div>
        </div>

        {/* Configuration Acompte */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Percent className="mr-2 text-orange-600" size={20} />
            Configuration de l'acompte
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Définissez le montant d'acompte requis pour confirmer une réservation.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type d'acompte</label>
              <select name="type_acompte" value={form.type_acompte} onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent">
                <option value="pourcentage">Pourcentage du total</option>
                <option value="montant_fixe">Montant fixe (FCFA)</option>
                <option value="aucun">Pas d'acompte (paiement total)</option>
              </select>
            </div>

            {form.type_acompte === 'pourcentage' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pourcentage (%)</label>
                <input type="number" name="pourcentage_acompte" value={form.pourcentage_acompte} onChange={handleChange}
                  min="1" max="100" step="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="30" />
                <p className="text-xs text-gray-500 mt-1">
                  Ex: Pour un terrain à {form.prix_heure || '10000'} FCFA/h, l'acompte sera de {Math.round((parseFloat(form.prix_heure || '10000') * parseFloat(form.pourcentage_acompte || '30')) / 100)} FCFA
                </p>
              </div>
            )}

            {form.type_acompte === 'montant_fixe' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Montant fixe (FCFA)</label>
                <input type="number" name="montant_acompte_fixe" value={form.montant_acompte_fixe} onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="5000" />
                <p className="text-xs text-gray-500 mt-1">
                  Montant fixe d'acompte quelle que soit la durée de réservation
                </p>
              </div>
            )}

            {form.type_acompte === 'aucun' && (
              <div className="flex items-center">
                <p className="text-sm text-yellow-600 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                  Le client devra payer la totalité lors de la réservation.
                </p>
              </div>
            )}
          </div>

          {/* Aperçu acompte */}
          {form.type_acompte !== 'aucun' && form.prix_heure && (
            <div className="mt-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
              <h4 className="text-sm font-semibold text-orange-800 mb-2">Aperçu pour 1h de réservation</h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Total</p>
                  <p className="font-bold text-gray-900">{parseFloat(form.prix_heure).toLocaleString()} FCFA</p>
                </div>
                <div>
                  <p className="text-gray-600">Acompte</p>
                  <p className="font-bold text-orange-600">
                    {form.type_acompte === 'pourcentage'
                      ? `${Math.round((parseFloat(form.prix_heure) * parseFloat(form.pourcentage_acompte || '30')) / 100).toLocaleString()} FCFA`
                      : `${parseFloat(form.montant_acompte_fixe || '0').toLocaleString()} FCFA`
                    }
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Solde restant</p>
                  <p className="font-bold text-green-600">
                    {form.type_acompte === 'pourcentage'
                      ? `${(parseFloat(form.prix_heure) - Math.round((parseFloat(form.prix_heure) * parseFloat(form.pourcentage_acompte || '30')) / 100)).toLocaleString()} FCFA`
                      : `${(parseFloat(form.prix_heure) - parseFloat(form.montant_acompte_fixe || '0')).toLocaleString()} FCFA`
                    }
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Boutons */}
        <div className="flex justify-end gap-4">
          <button type="button" onClick={() => navigate('/manager/terrains')}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
            Annuler
          </button>
          <button type="submit" disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-colors disabled:opacity-50 flex items-center">
            <Save className="mr-2" size={18} />
            {loading ? 'Création en cours...' : 'Créer le terrain'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddTerrainPage;
