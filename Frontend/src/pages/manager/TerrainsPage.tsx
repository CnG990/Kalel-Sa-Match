import React, { useState, useEffect, useCallback } from 'react';
import { 
  MapPin, 
  Users, 
  Euro, 
  Star, 
  Edit3, 
  Save, 
  X,
  Power,
  PowerOff
} from 'lucide-react';
import apiService, { type ManagerTerrainDTO } from '../../services/api';
import toast from 'react-hot-toast';


const TerrainsPage: React.FC = () => {
  const [terrains, setTerrains] = useState<ManagerTerrainDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [editingTerrain, setEditingTerrain] = useState<{ id: number; currentPrice: number } | null>(null);
  const [newPrice, setNewPrice] = useState('');

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchTerrains = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await apiService.getManagerTerrains();
      const raw = Array.isArray(data) ? data : (data as any)?.results ?? (data as any)?.data;
      setTerrains(Array.isArray(raw) ? raw : []);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      toast.error("Erreur lors du chargement des terrains.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTerrains();
  }, [fetchTerrains]);

  const updatePrix = async (terrainId: number, nouveauPrix: number) => {
    try {
      const { data } = await apiService.updateManagerTerrainPricing(terrainId, { prix_heure: nouveauPrix });
      setTerrains(prev =>
        prev.map(t => (t.id === terrainId ? { ...t, ...(data ?? {}), prix_heure: nouveauPrix } : t)),
      );
      toast.success('Prix mis à jour avec succès');
      setEditingTerrain(null);
      setNewPrice('');
    } catch (error) {
      console.error('Erreur update prix:', error);
      toast.error("Erreur lors de la mise à jour du prix.");
    }
  };

  const handlePriceEdit = (terrain: ManagerTerrainDTO) => {
    setEditingTerrain({ id: terrain.id, currentPrice: terrain.prix_heure });
    setNewPrice(terrain.prix_heure.toString());
  };

  const savePriceChange = () => {
    if (editingTerrain && newPrice) {
      const price = parseFloat(newPrice);
      if (price > 0) {
        updatePrix(editingTerrain.id, price);
      } else {
        toast.error('Le prix doit être supérieur à 0');
      }
    }
  };

  const cancelPriceEdit = () => {
    setEditingTerrain(null);
    setNewPrice('');
  };

  const toggleDisponibilite = async (terrainId: number) => {
    try {
      const { data, meta } = await apiService.toggleManagerTerrainDisponibilite(terrainId);
      setTerrains(prev =>
        prev.map(t =>
          t.id === terrainId
            ? { ...t, est_actif: data?.est_actif ?? !t.est_actif }
            : t,
        ),
      );
      toast.success(meta.message || (data?.est_actif ? 'Terrain activé avec succès' : 'Terrain désactivé avec succès'));
    } catch (error) {
      console.error('Erreur toggle disponibilité:', error);
      toast.error("Erreur lors de la modification de la disponibilité.");
    }
  };



  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Date inconnue';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-xl p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">🏟️ Mes Terrains</h1>
        <p className="text-green-100">Gérez vos terrains et tarifs (visible aux clients)</p>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <MapPin className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Terrains</p>
              <p className="text-2xl font-bold text-gray-900">{terrains.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <Euro className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Prix Moyen</p>
              <p className="text-2xl font-bold text-gray-900">
                {terrains.length > 0 
                  ? Math.round(terrains.reduce((sum, t) => {
                      const prix = typeof t.prix_heure === 'number' ? t.prix_heure : parseFloat(t.prix_heure) || 0;
                      return sum + prix;
                    }, 0) / terrains.length).toLocaleString()
                  : 0
                } CFA
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <Star className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Note Moyenne</p>
              <p className="text-2xl font-bold text-gray-900">
                {terrains.length > 0 
                  ? (terrains.reduce((sum, t) => {
                      const note = typeof t.note_moyenne === 'number' ? t.note_moyenne : 0;
                      return sum + note;
                    }, 0) / terrains.length).toFixed(1)
                  : '0.0'
                }/5
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des terrains */}
      {terrains.length === 0 ? (
        <div className="text-center py-12">
          <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun terrain</h3>
          <p className="text-gray-600">Vous n'avez pas encore de terrains attribués.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Vos terrains ({terrains.length})
            </h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {terrains.map((terrain) => (
              <div key={terrain.id} className="p-6 hover:bg-gray-50">
                <div className={`${isMobile ? 'space-y-4' : 'flex items-start justify-between'}`}>
                  <div className={`${isMobile ? 'w-full' : 'flex-1'}`}>
                    {/* Image et infos principales */}
                    <div className={`${isMobile ? 'flex flex-col space-y-3' : 'flex items-center space-x-4'}`}>
                      <div className={`${isMobile ? 'w-full h-48' : 'w-24 h-24'} bg-gray-200 rounded-lg overflow-hidden flex-shrink-0`}>
                        <img
                          src="/terrain-foot.jpg"
                          alt={terrain.nom}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-semibold text-gray-900 ${isMobile ? 'text-lg' : 'text-base'}`}>
                          {terrain.nom}
                        </h3>
                        <p className="text-gray-600 mt-1 text-sm">{terrain.adresse}</p>
                        
                        <div className="flex flex-wrap gap-2 mt-2 mb-2">
                          <span className="inline-block px-2 py-0.5 rounded bg-green-50 text-green-700 text-xs font-medium">
                            {((terrain as any).type_surface || 'gazon_synthetique').replace(/_/g, ' ')}
                          </span>
                          <span className="inline-block px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-xs font-medium">
                            {(terrain as any).nombre_joueurs || '5v5'}
                          </span>
                          {(terrain as any).eclairage && <span className="text-xs px-1.5 py-0.5 rounded bg-yellow-50 text-yellow-700">💡 Éclairage</span>}
                          {(terrain as any).vestiaires && <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-700">🚪 Vestiaires</span>}
                          {(terrain as any).parking && <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-700">🅿️ Parking</span>}
                          {(terrain as any).douches && <span className="text-xs px-1.5 py-0.5 rounded bg-cyan-50 text-cyan-700">🚿 Douches</span>}
                          {(terrain as any).buvette && <span className="text-xs px-1.5 py-0.5 rounded bg-orange-50 text-orange-700">🥤 Buvette</span>}
                        </div>

                        <div className={`${isMobile ? 'grid grid-cols-2 gap-2 mt-3' : 'flex items-center space-x-4 mt-2'}`}>
                          <div className="flex items-center space-x-2">
                            <Users className="w-4 h-4 text-gray-500 flex-shrink-0" />
                            <span className={`text-gray-600 ${isMobile ? 'text-sm' : 'text-sm'}`}>
                              {terrain.capacite ?? 0} pers.
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4 text-gray-500 flex-shrink-0" />
                            <span className={`text-gray-600 ${isMobile ? 'text-sm' : 'text-sm'}`}>
                              {(terrain as any).longueur && (terrain as any).largeur
                                ? `${(terrain as any).longueur}×${(terrain as any).largeur}m`
                                : `${terrain.surface ?? 0} m²`}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-1">
                            {editingTerrain?.id === terrain.id ? (
                              <div className="flex items-center space-x-2">
                                <input
                                  type="number"
                                  value={newPrice}
                                  onChange={(e) => setNewPrice(e.target.value)}
                                  className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  placeholder="Prix"
                                />
                                <button
                                  onClick={savePriceChange}
                                  className="text-green-600 hover:text-green-800 touch-target"
                                >
                                  <Save className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={cancelPriceEdit}
                                  className="text-red-600 hover:text-red-800 touch-target"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-1">
                                <span className={`font-medium text-green-600 ${isMobile ? 'text-sm' : 'text-sm'}`}>
                                  {(
                                    typeof terrain.prix_heure === 'number'
                                      ? terrain.prix_heure
                                      : Number(terrain.prix_heure ?? 0)
                                  ).toLocaleString()} CFA/h
                                </span>
                                <button
                                  onClick={() => handlePriceEdit(terrain)}
                                  className="text-gray-400 hover:text-gray-600 touch-target"
                                >
                                  <Edit3 className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Star className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                            <span className={`text-gray-600 ${isMobile ? 'text-sm' : 'text-sm'}`}>
                              {terrain.note_moyenne && typeof terrain.note_moyenne === 'number' 
                                ? terrain.note_moyenne.toFixed(1) 
                                : 'N/A'} 
                              ({terrain.nombre_avis || 0})
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Actions de gestion */}
                  <div className={`${isMobile ? 'mt-4 flex flex-col space-y-2' : 'flex items-center space-x-2'}`}>
                    {/* Bouton Activer/Désactiver */}
                    <button
                      onClick={() => toggleDisponibilite(terrain.id)}
                      className={`${isMobile ? 'w-full' : 'px-4 py-2'} rounded-lg font-medium transition-colors ${
                        terrain.est_actif
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-red-100 text-red-700 hover:bg-red-200'
                      }`}
                    >
                      {terrain.est_actif ? (
                        <div className="flex items-center justify-center space-x-2">
                          <Power className="w-4 h-4" />
                          <span>Actif</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center space-x-2">
                          <PowerOff className="w-4 h-4" />
                          <span>Inactif</span>
                        </div>
                      )}
                    </button>
                  </div>
                </div>
                
                {/* Informations complémentaires mobile */}
                <div className={`${isMobile ? 'mt-4 pt-4 border-t border-gray-200' : 'hidden'}`}>
                  <div className="text-sm text-gray-500 space-y-1">
                    <p>Créé le {formatDate(terrain.created_at)}</p>
                    <p>Dernière mise à jour: {formatDate(terrain.updated_at)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}


    </div>
  );
};

export default TerrainsPage; 