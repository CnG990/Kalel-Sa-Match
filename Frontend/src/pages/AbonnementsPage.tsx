import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import apiService from '../services/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CheckCircle, ArrowLeft } from 'lucide-react';

const DUREES_SEANCE = [1, 2, 3];
const NB_SEANCES = [1, 2, 3];

const AbonnementsPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { terrainId } = useParams<{ terrainId: string }>();

  const [terrains, setTerrains] = useState<any[]>([]);
  const [terrainSelectionne, setTerrainSelectionne] = useState<any | null>(null);
  const [abonnements, setAbonnements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [traitement, setTraitement] = useState(false);
  const [dureeSeance, setDureeSeance] = useState(1);
  const [nbSeances, setNbSeances] = useState(1);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { 
        state: { 
          from: { pathname: '/users/abonnements' },
          message: 'Veuillez vous connecter pour accéder aux abonnements' 
        } 
      });
      return;
    }
    fetchTerrains();
    fetchAbonnements();
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    console.log('🔍 Debug - useEffect sélection terrain:');
    console.log('  - terrains.length:', terrains.length);
    console.log('  - terrainId:', terrainId);
    console.log('  - terrains IDs:', terrains.map(t => t.id));
    console.log('  - terrains noms:', terrains.map(t => t.nom));
    
    if (terrains.length > 0 && terrainId) {
      const terrain = terrains.find((t) => String(t.id) === String(terrainId));
      console.log('  - terrain trouvé:', terrain);
      console.log('  - recherche pour ID:', terrainId, 'type:', typeof terrainId);
      console.log('  - comparaison avec terrains:', terrains.map(t => ({ id: t.id, type: typeof t.id, nom: t.nom })));
      
      setTerrainSelectionne(terrain || null);
      if (!terrain) {
        console.log('❌ Terrain non trouvé dans la liste');
        toast.error('Le terrain demandé n\'existe pas ou n\'est pas accessible.');
      } else {
        console.log('✅ Terrain trouvé:', terrain.nom);
      }
    } else {
      console.log('  - Aucun terrain sélectionné (terrains vide ou terrainId manquant)');
      setTerrainSelectionne(null);
    }
  }, [terrains, terrainId]);

  const fetchTerrains = async () => {
    try {
      setLoading(true);
      const response = await apiService.getTerrains();
      console.log('🔍 Debug - Réponse API terrains:', response);
      
      if (response.success && response.data) {
        // Gérer la structure paginée ou non
        let terrainsData: any[] = [];
        if (Array.isArray(response.data)) {
          terrainsData = response.data;
        } else if (Array.isArray(response.data?.data)) {
          terrainsData = response.data.data;
        } else {
          terrainsData = [];
        }
        
        console.log('🔍 Debug - Terrains extraits:', terrainsData);
        setTerrains(terrainsData);
        
        if (terrainsData.length === 0) {
          toast.error('Aucun terrain disponible');
        }
      } else {
        setTerrains([]);
        toast.error('Erreur lors du chargement des terrains');
      }
    } catch (error) {
      console.error('❌ Erreur fetchTerrains:', error);
      setTerrains([]);
      toast.error('Erreur lors du chargement des terrains');
    } finally {
      setLoading(false);
    }
  };

  const fetchAbonnements = async () => {
    try {
      const response = await apiService.getAbonnements();
      if (response.success && response.data) {
        setAbonnements(response.data);
      } else {
        setAbonnements([]);
      }
    } catch {
      setAbonnements([]);
    }
  };

  const calculerPrix = (type: 'mensuel' | 'trimestriel' | 'annuel') => {
    if (!terrainSelectionne) return null;
    const prixHeure = terrainSelectionne.prix_heure;
    let nbSemaines = 4;
    if (type === 'trimestriel') nbSemaines = 12;
    if (type === 'annuel') nbSemaines = 52;
    return prixHeure * dureeSeance * nbSeances * nbSemaines;
  };

  const souscrireAbonnement = async (abonnementId: number, type: 'mensuel' | 'trimestriel' | 'annuel') => {
    console.log('🔍 Debug - souscrireAbonnement appelée:');
    console.log('  - abonnementId:', abonnementId);
    console.log('  - type:', type);
    console.log('  - terrainSelectionne:', terrainSelectionne);
    console.log('  - dureeSeance:', dureeSeance);
    console.log('  - nbSeances:', nbSeances);
    
    if (!terrainSelectionne) {
      console.log('❌ Aucun terrain sélectionné');
      toast.error('Veuillez sélectionner un terrain d\'abord');
      return;
    }
    
    setTraitement(true);
    try {
      const prix = calculerPrix(type);
      console.log('  - prix calculé:', prix);
      
      const payload = {
        terrain_id: terrainSelectionne.id,
        duree_seance: dureeSeance,
        nb_seances: nbSeances,
        prix_total: prix
      };
      console.log('  - payload envoyé:', payload);
      
      const response = await apiService.souscrireAbonnement(abonnementId, payload);
      console.log('  - réponse API:', response);
      
      if (response.success) {
        console.log('✅ Souscription réussie');
        toast.success('Souscription initiée avec succès !');
        navigate('/payment', {
          state: {
            subscriptionDetails: {
              subscriptionId: response.data.abonnement_id,
              terrainName: terrainSelectionne.nom,
              totalAmount: prix,
              duration: response.data.type,
              startDate: format(new Date(), 'dd/MM/yyyy', { locale: fr }),
              endDate: format(new Date(response.data.date_fin), 'dd/MM/yyyy', { locale: fr }),
              status: response.data.statut
            }
          }
        });
      } else {
        console.log('❌ Erreur API:', response.message);
        toast.error(response.message || 'Erreur lors de la souscription');
      }
    } catch (error) {
      console.error('❌ Exception lors de la souscription:', error);
      toast.error('Erreur lors de la souscription');
    } finally {
      setTraitement(false);
    }
  };

  if (!isAuthenticated) return null;
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">🎫 Abonnements Terrains</h1>
              <p className="text-purple-100">Choisissez votre abonnement et économisez !</p>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
          </div>
        </div>

        {terrainSelectionne && (
          <div className="bg-white rounded-lg p-6 shadow-sm mb-8">
            <h2 className="text-xl font-semibold mb-4">Terrain sélectionné</h2>
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
                <img
                  src="/terrain-foot.jpg"
                  alt={terrainSelectionne.nom}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-semibold">{terrainSelectionne.nom}</h3>
                <p className="text-gray-600 text-sm">{terrainSelectionne.adresse}</p>
                <p className="text-green-600 font-semibold">{terrainSelectionne.prix_heure} CFA/heure</p>
              </div>
            </div>
          </div>
        )}

        {terrainSelectionne && (
          <div className="bg-white rounded-lg p-6 shadow-sm mb-8">
            <h2 className="text-xl font-semibold mb-4">Configuration de l'abonnement</h2>
            <div className="flex flex-wrap gap-8 items-center">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre de séances/semaine</label>
                <select
                  className="border rounded px-3 py-2"
                  value={nbSeances}
                  onChange={e => setNbSeances(Number(e.target.value))}
                >
                  {NB_SEANCES.map(nb => (
                    <option key={nb} value={nb}>{nb}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Durée d'une séance (heures)</label>
                <select
                  className="border rounded px-3 py-2"
                  value={dureeSeance}
                  onChange={e => setDureeSeance(Number(e.target.value))}
                >
                  {DUREES_SEANCE.map(d => (
                    <option key={d} value={d}>{d}h</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {terrainSelectionne ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {abonnements.map((abonnement) => {
              let type: 'mensuel' | 'trimestriel' | 'annuel' = 'mensuel';
              if (abonnement.nom.toLowerCase().includes('trimestriel')) type = 'trimestriel';
              if (abonnement.nom.toLowerCase().includes('annuel')) type = 'annuel';
              const prix = calculerPrix(type);
              return (
                <div key={abonnement.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold">{abonnement.nom}</h3>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-orange-600">
                          {prix !== null ? prix.toLocaleString() + ' FCFA' : '--'}
                        </div>
                        <div className="text-sm text-gray-600">{abonnement.duree_jours} jours</div>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-4">{abonnement.description}</p>
                    <div className="space-y-2 mb-6">
                      {abonnement.avantages.map((avantage: string, index: number) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>{avantage}</span>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => souscrireAbonnement(abonnement.id, type)}
                      disabled={!terrainSelectionne || traitement}
                      className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                        !terrainSelectionne 
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-green-500 hover:bg-green-600 text-white'
                      }`}
                    >
                      {traitement ? 'Traitement...' : 'Souscrire'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                Aucun terrain sélectionné
              </h3>
              <p className="text-yellow-700 mb-4">
                Pour souscrire à un abonnement, veuillez d'abord sélectionner un terrain.
              </p>
              <button
                onClick={() => navigate('/users/terrains')}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-lg font-medium"
              >
                Voir les terrains
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AbonnementsPage; 