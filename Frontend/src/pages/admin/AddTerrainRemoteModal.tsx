import React, { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import { MapPin, Search } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import apiService from '../../services/api';

interface AddTerrainRemoteModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const AddTerrainRemoteModal: React.FC<AddTerrainRemoteModalProps> = ({ onClose, onSuccess }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    nom: '',
    description: '',
    adresse: '',
    ville: '',
    quartier: '',
    latitude: '',
    longitude: '',
    prix_heure: '',
    capacite: '',
    telephone: '',
    type_surface: 'gazon_synthetique',
    nombre_joueurs: ['5v5'] as string[],
    longueur: '',
    largeur: '',
    eclairage: false,
    vestiaires: false,
    parking: false,
    douches: false,
    buvette: false,
    taux_commission: '10',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current || leafletMapRef.current) return;

    const map = L.map(mapRef.current).setView([14.6937, -17.4572], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap'
    }).addTo(map);

    map.on('click', (e: any) => {
      const { lat, lng } = e.latlng;
      setForm(prev => ({ ...prev, latitude: lat.toFixed(8), longitude: lng.toFixed(8) }));
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        markerRef.current = L.marker([lat, lng], { draggable: true }).addTo(map);
        markerRef.current.on('dragend', () => {
          const pos = markerRef.current.getLatLng();
          setForm(prev => ({ ...prev, latitude: pos.lat.toFixed(8), longitude: pos.lng.toFixed(8) }));
        });
      }
    });

    leafletMapRef.current = map;
    return () => { map.remove(); };
  }, []);

  const handleFormChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const target = event.target;
    const { name } = target;
    if (target instanceof HTMLInputElement && target.type === 'checkbox') {
      if (name === 'nombre_joueurs') {
        const { value, checked } = target;
        setForm(prev => {
          const formats = prev.nombre_joueurs;
          const newFormats = checked 
            ? [...formats, value]
            : formats.filter(f => f !== value);
          return { ...prev, nombre_joueurs: newFormats };
        });
      } else {
        setForm(prev => ({ ...prev, [name]: target.checked }));
      }
    } else {
      setForm(prev => ({ ...prev, [name]: target.value }));
    }
  };

  const searchAddress = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5&countrycodes=sn`);
      const data = await res.json();
      setSearchResults(data);
    } catch {
      toast.error('Erreur lors de la recherche');
    } finally {
      setSearching(false);
    }
  };

  const selectSearchResult = (result: any) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    setForm(prev => ({
      ...prev,
      latitude: lat.toFixed(8),
      longitude: lng.toFixed(8),
      adresse: prev.adresse || result.display_name?.split(',').slice(0, 3).join(', ') || '',
    }));
    setSearchResults([]);
    setSearchQuery('');

    if (leafletMapRef.current) {
      leafletMapRef.current.setView([lat, lng], 16);
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        markerRef.current = L.marker([lat, lng], { draggable: true }).addTo(leafletMapRef.current);
        markerRef.current.on('dragend', () => {
          const pos = markerRef.current.getLatLng();
          setForm(prev => ({ ...prev, latitude: pos.lat.toFixed(8), longitude: pos.lng.toFixed(8) }));
        });
      }
    }
  };

  const handleSubmit = async () => {
    if (!form.nom || !form.adresse || !form.prix_heure || !form.capacite) {
      toast.error('Remplissez les champs obligatoires (nom, adresse, prix, capacité)');
      return;
    }
    if (!form.latitude || !form.longitude) {
      toast.error('Sélectionnez un emplacement sur la carte ou saisissez les coordonnées');
      return;
    }

    try {
      setIsSaving(true);
      const { data, meta } = await apiService.createAdminTerrain({
        nom: form.nom,
        description: form.description,
        adresse: form.adresse,
        ville: form.ville,
        quartier: form.quartier,
        prix_heure: parseFloat(form.prix_heure),
        capacite: parseInt(form.capacite, 10),
        telephone: form.telephone,
        type_surface: form.type_surface,
        nombre_joueurs: form.nombre_joueurs.join(', '),
        longueur: form.longueur ? parseFloat(form.longueur) : undefined,
        largeur: form.largeur ? parseFloat(form.largeur) : undefined,
        eclairage: form.eclairage,
        vestiaires: form.vestiaires,
        parking: form.parking,
        douches: form.douches,
        buvette: form.buvette,
        taux_commission: parseInt(form.taux_commission, 10),
        latitude: parseFloat(form.latitude),
        longitude: parseFloat(form.longitude),
        source_creation: 'remote',
      });

      if (!data) {
        toast.error(meta.message || "Impossible d'ajouter ce terrain");
        return;
      }
      toast.success('Terrain ajouté avec succès');
      onSuccess();
      onClose();
    } catch (error) {
      toast.error((error as Error).message || "Erreur lors de l'ajout");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h3 className="text-2xl font-semibold text-gray-900 flex items-center gap-3">
              <MapPin className="w-6 h-6 text-blue-600" />
              Ajouter un terrain à distance
            </h3>
            <p className="text-sm text-gray-500">
              Recherchez l'adresse ou cliquez sur la carte pour positionner le terrain.
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100" aria-label="Fermer">×</button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 p-6 flex-1 overflow-y-auto">
          {/* Carte */}
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && searchAddress()}
                placeholder="Rechercher une adresse au Sénégal..."
                className="flex-1 px-3 py-2 rounded-lg border border-gray-300 focus:ring-blue-600 focus:border-blue-600"
              />
              <button
                type="button"
                onClick={searchAddress}
                disabled={searching}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <Search className="w-4 h-4" />
                {searching ? '...' : 'Chercher'}
              </button>
            </div>
            {searchResults.length > 0 && (
              <div className="bg-white border rounded-lg shadow-lg max-h-40 overflow-y-auto">
                {searchResults.map((r, i) => (
                  <button key={i} onClick={() => selectSearchResult(r)} className="w-full text-left px-3 py-2 hover:bg-blue-50 text-sm border-b last:border-b-0">
                    {r.display_name}
                  </button>
                ))}
              </div>
            )}
            <div className="h-80 rounded-xl overflow-hidden border" ref={mapRef} />
            <p className="text-sm text-gray-500">Cliquez sur la carte pour placer le marqueur, ou utilisez la recherche.</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500">Latitude</label>
                <input name="latitude" value={form.latitude} onChange={handleFormChange} className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-300 text-sm" placeholder="14.6937" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500">Longitude</label>
                <input name="longitude" value={form.longitude} onChange={handleFormChange} className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-300 text-sm" placeholder="-17.4572" />
              </div>
            </div>
          </div>

          {/* Formulaire */}
          <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nom du terrain *</label>
              <input name="nom" value={form.nom} onChange={handleFormChange} className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-300 focus:ring-blue-600 focus:border-blue-600" placeholder="Ex: Terrain Almadies" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Ville</label>
                <input name="ville" value={form.ville} onChange={handleFormChange} className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-300" placeholder="Dakar" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Quartier</label>
                <input name="quartier" value={form.quartier} onChange={handleFormChange} className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-300" placeholder="Almadies" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Adresse *</label>
              <input name="adresse" value={form.adresse} onChange={handleFormChange} className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-300" placeholder="Commune, repère" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Téléphone contact</label>
              <input name="telephone" value={form.telephone} onChange={handleFormChange} className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-300" placeholder="77 123 45 67" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea name="description" value={form.description} onChange={handleFormChange} rows={2} className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-300" placeholder="Remarques, particularités..." />
            </div>

            <h4 className="font-semibold text-gray-800 border-b pb-1">Caractéristiques</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Type de surface</label>
                <select name="type_surface" value={form.type_surface} onChange={handleFormChange} className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-300">
                  <option value="gazon_synthetique">Gazon synthétique</option>
                  <option value="gazon_naturel">Gazon naturel</option>
                  <option value="terre_battue">Terre battue</option>
                  <option value="beton">Béton</option>
                  <option value="sable">Sable</option>
                  <option value="autre">Autre</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Formats de jeu (Plusieurs choix possibles)</label>
                <div className="flex flex-wrap gap-4">
                  {['5v5', '6v6', '7v7', '8v8', '9v9', '11v11'].map((format) => (
                    <label key={format} className="flex items-center gap-2 cursor-pointer bg-gray-50 px-3 py-2 rounded-lg border hover:bg-gray-100 transition-colors">
                      <input
                        type="checkbox"
                        name="nombre_joueurs"
                        value={format}
                        checked={form.nombre_joueurs.includes(format)}
                        onChange={handleFormChange}
                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-600"
                      />
                      <span className="text-sm text-gray-700 font-medium">{format}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Longueur (m)</label>
                <input name="longueur" value={form.longueur} onChange={handleFormChange} type="number" min="0" step="0.5" className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-300" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Largeur (m)</label>
                <input name="largeur" value={form.largeur} onChange={handleFormChange} type="number" min="0" step="0.5" className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-300" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Prix / heure (FCFA) *</label>
                <input name="prix_heure" value={form.prix_heure} onChange={handleFormChange} type="number" min="0" className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-300" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Capacité joueurs *</label>
                <input name="capacite" value={form.capacite} onChange={handleFormChange} type="number" min="1" className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-300" />
              </div>
            </div>

            <h4 className="font-semibold text-gray-800 border-b pb-1">Commission gestionnaire</h4>
            <div>
              <label className="block text-sm font-medium text-gray-700">Taux de commission (%)</label>
              <input
                name="taux_commission"
                value={form.taux_commission}
                onChange={handleFormChange}
                type="number"
                min="0"
                max="100"
                step="1"
                className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-300 focus:ring-blue-600 focus:border-blue-600"
                placeholder="ex: 10"
              />
              <p className="text-xs text-gray-500 mt-1">
                Pourcentage prélevé sur chaque réservation de ce terrain (sera appliqué au gestionnaire assigné)
              </p>
            </div>

            <h4 className="font-semibold text-gray-800 border-b pb-1">Équipements</h4>
            <div className="grid grid-cols-2 gap-3">
              {[
                { name: 'eclairage', label: 'Éclairage nocturne', emoji: '💡' },
                { name: 'vestiaires', label: 'Vestiaires', emoji: '🚪' },
                { name: 'parking', label: 'Parking', emoji: '🅿️' },
                { name: 'douches', label: 'Douches', emoji: '🚿' },
                { name: 'buvette', label: 'Buvette', emoji: '🥤' },
              ].map((item) => (
                <label key={item.name} className="flex items-center gap-2 p-2 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer">
                  <input type="checkbox" name={item.name} checked={(form as any)[item.name]} onChange={handleFormChange} className="rounded text-blue-600 focus:ring-blue-500" />
                  <span className="text-sm">{item.emoji} {item.label}</span>
                </label>
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100">Annuler</button>
              <button type="button" disabled={isSaving} onClick={handleSubmit} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">
                {isSaving ? 'Enregistrement…' : 'Enregistrer le terrain'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddTerrainRemoteModal;
