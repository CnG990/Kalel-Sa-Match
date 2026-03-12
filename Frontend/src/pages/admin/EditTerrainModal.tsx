import React, { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import { MapPin, Search } from 'lucide-react';
import apiService from '../../services/api';

interface EditTerrainModalProps {
  terrain: any;
  onClose: () => void;
  onSuccess: () => void;
}

const EditTerrainModal: React.FC<EditTerrainModalProps> = ({ terrain, onClose, onSuccess }) => {
  const [isSaving, setIsSaving] = useState(false);
  
  // Convert nombre_joueurs from string "5v5, 7v7" to array for checkboxes
  const initialFormats = terrain.nombre_joueurs 
    ? terrain.nombre_joueurs.split(',').map((f: string) => f.trim()) 
    : ['5v5'];

  const [form, setForm] = useState({
    nom: terrain.nom || '',
    description: terrain.description || '',
    adresse: terrain.adresse || '',
    ville: terrain.ville || '',
    quartier: terrain.quartier || '',
    latitude: terrain.latitude?.toString() || '',
    longitude: terrain.longitude?.toString() || '',
    prix_heure: terrain.prix_heure?.toString() || '',
    capacite: terrain.capacite?.toString() || '',
    telephone: terrain.telephone || '',
    type_acompte: terrain.type_acompte || 'pourcentage',
    pourcentage_acompte: terrain.pourcentage_acompte?.toString() || '30',
    montant_acompte_fixe: terrain.montant_acompte_fixe?.toString() || '',
    type_surface: terrain.type_surface || 'gazon_synthetique',
    nombre_joueurs_array: initialFormats,
    longueur: terrain.longueur?.toString() || '',
    largeur: terrain.largeur?.toString() || '',
    eclairage: terrain.eclairage || false,
    vestiaires: terrain.vestiaires || false,
    parking: terrain.parking || false,
    douches: terrain.douches || false,
    buvette: terrain.buvette || false,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current) return;
    const L = (window as any).L;
    if (!L) return;

    const lat = form.latitude ? parseFloat(form.latitude) : 14.6937;
    const lng = form.longitude ? parseFloat(form.longitude) : -17.4572;

    const map = L.map(mapRef.current).setView([lat, lng], form.latitude ? 16 : 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap'
    }).addTo(map);

    if (form.latitude && form.longitude) {
      markerRef.current = L.marker([lat, lng], { draggable: true }).addTo(map);
      markerRef.current.on('dragend', () => {
        const pos = markerRef.current.getLatLng();
        setForm(prev => ({ ...prev, latitude: pos.lat.toFixed(8), longitude: pos.lng.toFixed(8) }));
      });
    }

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
  }, []); // Only empty deps to initialize once

  const handleFormChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const target = event.target;
    const { name } = target;
    if (target instanceof HTMLInputElement && target.type === 'checkbox') {
      if (['5v5', '6v6', '7v7', '8v8', '9v9', '11v11'].includes(name)) { // Format checkboxes
        setForm(prev => {
          const currentFormats = [...prev.nombre_joueurs_array];
          if (target.checked) {
            if (!currentFormats.includes(name)) currentFormats.push(name);
          } else {
            const idx = currentFormats.indexOf(name);
            if (idx > -1) currentFormats.splice(idx, 1);
          }
          return { ...prev, nombre_joueurs_array: currentFormats };
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

    const L = (window as any).L;
    if (leafletMapRef.current && L) {
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
    if (form.nombre_joueurs_array.length === 0) {
      toast.error('Sélectionnez au moins un format de jeu');
      return;
    }

    try {
      setIsSaving(true);
      const { data, meta } = await apiService.updateAdminTerrain(terrain.id, {
        nom: form.nom,
        description: form.description,
        adresse: form.adresse,
        ville: form.ville,
        quartier: form.quartier,
        prix_heure: parseFloat(form.prix_heure),
        capacite: parseInt(form.capacite, 10),
        telephone: form.telephone,
        type_acompte: form.type_acompte,
        pourcentage_acompte: form.pourcentage_acompte ? parseFloat(form.pourcentage_acompte) : null,
        montant_acompte_fixe: form.montant_acompte_fixe ? parseFloat(form.montant_acompte_fixe) : null,
        type_surface: form.type_surface,
        nombre_joueurs: form.nombre_joueurs_array.join(', '),
        longueur: form.longueur ? parseFloat(form.longueur) : null,
        largeur: form.largeur ? parseFloat(form.largeur) : null,
        eclairage: form.eclairage,
        vestiaires: form.vestiaires,
        parking: form.parking,
        douches: form.douches,
        buvette: form.buvette,
        latitude: parseFloat(form.latitude),
        longitude: parseFloat(form.longitude),
      });

      if (!data) {
        toast.error(meta.message || "Impossible de modifier ce terrain");
        return;
      }
      toast.success('Terrain modifié avec succès');
      onSuccess();
      onClose();
    } catch (error) {
      toast.error((error as Error).message || "Erreur lors de la modification");
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
              <MapPin className="w-6 h-6 text-orange-600" />
              Modifier le terrain : {terrain.nom}
            </h3>
            <p className="text-sm text-gray-500">
              Ajustez les informations, équipements ou coordonnées du terrain.
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
                className="flex-1 px-3 py-2 rounded-lg border border-gray-300 focus:ring-orange-600 focus:border-orange-600"
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
            <p className="text-sm text-gray-500">Ajustez le marqueur sur la carte si nécessaire.</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500">Latitude</label>
                <input name="latitude" value={form.latitude} onChange={handleFormChange} className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-300 text-sm bg-gray-50" readOnly />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500">Longitude</label>
                <input name="longitude" value={form.longitude} onChange={handleFormChange} className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-300 text-sm bg-gray-50" readOnly />
              </div>
            </div>
          </div>

          {/* Formulaire */}
          <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nom du terrain *</label>
              <input name="nom" value={form.nom} onChange={handleFormChange} className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-300 focus:ring-orange-600 focus:border-orange-600" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Ville</label>
                <input name="ville" value={form.ville} onChange={handleFormChange} className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-300 focus:ring-orange-600 focus:border-orange-600" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Quartier</label>
                <input name="quartier" value={form.quartier} onChange={handleFormChange} className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-300 focus:ring-orange-600 focus:border-orange-600" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Adresse *</label>
              <input name="adresse" value={form.adresse} onChange={handleFormChange} className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-300 focus:ring-orange-600 focus:border-orange-600" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Téléphone contact</label>
              <input name="telephone" value={form.telephone} onChange={handleFormChange} className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-300 focus:ring-orange-600 focus:border-orange-600" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea name="description" value={form.description} onChange={handleFormChange} rows={2} className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-300 focus:ring-orange-600 focus:border-orange-600" />
            </div>

            <h4 className="font-semibold text-gray-800 border-b pb-1">Caractéristiques</h4>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Type de surface</label>
                <select name="type_surface" value={form.type_surface} onChange={handleFormChange} className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-300 focus:ring-orange-600 focus:border-orange-600">
                  <option value="gazon_synthetique">Gazon synthétique</option>
                  <option value="gazon_naturel">Gazon naturel</option>
                  <option value="terre_battue">Terre battue</option>
                  <option value="beton">Béton</option>
                  <option value="sable">Sable</option>
                  <option value="autre">Autre</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Formats de jeu *</label>
                <div className="grid grid-cols-3 gap-2">
                  {['5v5', '6v6', '7v7', '8v8', '9v9', '11v11'].map((format) => (
                    <label key={format} className="flex items-center gap-2 p-2 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input 
                        type="checkbox" 
                        name={format} 
                        checked={form.nombre_joueurs_array.includes(format)} 
                        onChange={handleFormChange} 
                        className="rounded text-orange-600 focus:ring-orange-500" 
                      />
                      <span className="text-sm">{format.replace('v', ' contre ')}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Longueur (m)</label>
                <input name="longueur" value={form.longueur} onChange={handleFormChange} type="number" min="0" step="0.5" className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-300 focus:ring-orange-600 focus:border-orange-600" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Largeur (m)</label>
                <input name="largeur" value={form.largeur} onChange={handleFormChange} type="number" min="0" step="0.5" className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-300 focus:ring-orange-600 focus:border-orange-600" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Prix / heure (FCFA) *</label>
                <input name="prix_heure" value={form.prix_heure} onChange={handleFormChange} type="number" min="0" className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-300 focus:ring-orange-600 focus:border-orange-600" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Capacité joueurs max *</label>
                <input name="capacite" value={form.capacite} onChange={handleFormChange} type="number" min="1" className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-300 focus:ring-orange-600 focus:border-orange-600" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Type d'avance</label>
                <select
                  name="type_acompte"
                  value={form.type_acompte}
                  onChange={handleFormChange}
                  className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-300 focus:ring-orange-600 focus:border-orange-600"
                >
                  <option value="pourcentage">Pourcentage</option>
                  <option value="montant_fixe">Montant fixe</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Avance (%)</label>
                <input
                  name="pourcentage_acompte"
                  value={form.pourcentage_acompte}
                  onChange={handleFormChange}
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  disabled={form.type_acompte === 'montant_fixe'}
                  className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-300 focus:ring-orange-600 focus:border-orange-600 disabled:bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Avance fixe (FCFA)</label>
                <input
                  name="montant_acompte_fixe"
                  value={form.montant_acompte_fixe}
                  onChange={handleFormChange}
                  type="number"
                  min="0"
                  step="100"
                  disabled={form.type_acompte === 'pourcentage'}
                  className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-300 focus:ring-orange-600 focus:border-orange-600 disabled:bg-gray-100"
                />
              </div>
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
                  <input type="checkbox" name={item.name} checked={(form as any)[item.name]} onChange={handleFormChange} className="rounded text-orange-600 focus:ring-orange-500" />
                  <span className="text-sm">{item.emoji} {item.label}</span>
                </label>
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100">Annuler</button>
              <button type="button" disabled={isSaving} onClick={handleSubmit} className="px-4 py-2 rounded-lg bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-50">
                {isSaving ? 'Enregistrement…' : 'Enregistrer les modifications'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditTerrainModal;
