import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import apiService, { type TerrainDTO, type AbonnementDTO, type SubscriptionResponseDTO } from '../services/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CheckCircle, ArrowLeft, Info, TrendingUp } from 'lucide-react';
import { 
  abonnementConditionsService
} from '../services/abonnementConditionsService';
import type {
  TerrainConditions,
  HistoriqueData,
  CalculPrixResponse
} from '../services/abonnementConditionsService';

const DUREES_SEANCE = [1, 2, 3];
const NB_SEANCES = [1, 2, 3];

const mapTerrainDto = (dto: TerrainDTO) => ({
  ...dto,
  nom: dto.nom ?? (dto as any).name ?? `Terrain ${dto.id}`,
  prix_heure: Number(dto.prix_heure ?? 0),
});

const AbonnementsPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { terrainId } = useParams<{ terrainId: string }>();

  const [terrains, setTerrains] = useState<TerrainDTO[]>([]);
  const [terrainSelectionne, setTerrainSelectionne] = useState<TerrainDTO | null>(null);
  const [abonnements, setAbonnements] = useState<AbonnementDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [traitement, setTraitement] = useState(false);
  const [dureeSeance, setDureeSeance] = useState(1);
  const [nbSeances, setNbSeances] = useState(1);
  
  // Nouvelles états pour les conditions d'abonnement
  const [conditionsTerrain, setConditionsTerrain] = useState<TerrainConditions | null>(null);
  const [historiqueReservations, setHistoriqueReservations] = useState<HistoriqueData | null>(null);
  const [calculPrix, setCalculPrix] = useState<CalculPrixResponse | null>(null);
  
  // Préférences de jeu
  const [joursPreferes, setJoursPreferes] = useState<number[]>([]);
  const [creneauxPreferes, setCreneauxPreferes] = useState<string[]>([]);
  const [modePaiement, setModePaiement] = useState<'integral' | 'differe' | 'par_seance'>('integral');
  const [disponibiliteCreneaux, setDisponibiliteCreneaux] = useState<any>(null);
  const [verificationEnCours, setVerificationEnCours] = useState(false);

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

  // Charger les conditions du terrain quand un terrain est sélectionné
  useEffect(() => {
    if (terrainSelectionne) {
      fetchConditionsTerrain();
      fetchHistoriqueReservations();
    }
  }, [terrainSelectionne]);

  // Calculer le prix quand les préférences changent
  useEffect(() => {
    if (terrainSelectionne && conditionsTerrain) {
      calculerPrixAbonnement();
    }
  }, [terrainSelectionne, dureeSeance, nbSeances, modePaiement, conditionsTerrain]);

  // Vérifier la disponibilité des créneaux quand les préférences changent
  useEffect(() => {
    if (terrainSelectionne && joursPreferes.length > 0 && creneauxPreferes.length > 0) {
      verifierDisponibiliteCreneaux();
    } else {
      setDisponibiliteCreneaux(null);
    }
  }, [terrainSelectionne, joursPreferes, creneauxPreferes, dureeSeance, nbSeances]);

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
      const { data } = await apiService.getTerrains();
      console.log('🔍 Debug - Réponse API terrains (normalisée):', data);

      const terrainsData = Array.isArray(data) ? data.map(mapTerrainDto) : [];
      console.log('🔍 Debug - Terrains extraits:', terrainsData);
      setTerrains(terrainsData);

      if (terrainsData.length === 0) {
        toast.error('Aucun terrain disponible');
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
      const { data } = await apiService.getAbonnements();
      setAbonnements(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('❌ Erreur fetchAbonnements:', error);
      setAbonnements([]);
      toast.error('Erreur lors du chargement des abonnements');
    }
  };

  const fetchConditionsTerrain = async () => {
    if (!terrainSelectionne) return;
    
    try {
      const conditions = await abonnementConditionsService.getConditionsTerrain(terrainSelectionne.id);
      setConditionsTerrain(conditions);
    } catch (error) {
      console.error('Erreur fetchConditionsTerrain:', error);
      toast.error('Erreur lors du chargement des conditions du terrain');
    }
  };

  const fetchHistoriqueReservations = async () => {
    if (!terrainSelectionne) return;
    
    try {
      const historique = await abonnementConditionsService.getHistoriqueReservations(terrainSelectionne.id);
      setHistoriqueReservations(historique);
      
      // Mettre à jour les préférences basées sur l'historique
      if (historique.statistiques.jours_preferes.length > 0) {
        setJoursPreferes(historique.statistiques.jours_preferes.map(j => typeof j === 'string' ? parseInt(j) : j));
      }
      if (historique.statistiques.creneaux_preferes.length > 0) {
        setCreneauxPreferes(historique.statistiques.creneaux_preferes);
      }
    } catch (error) {
      console.error('Erreur fetchHistoriqueReservations:', error);
      // Ne pas afficher d'erreur car l'historique peut être vide
    }
  };

  const calculerPrixAbonnement = async () => {
    if (!terrainSelectionne || !conditionsTerrain) return;
    
    try {
      const request = {
        terrain_id: terrainSelectionne.id,
        type_abonnement: 'mensuel' as const, // Pour l'instant, on calcule pour mensuel
        nb_seances: nbSeances,
        duree_seance: dureeSeance,
        mode_paiement: modePaiement
      };
      
      const calculs = await abonnementConditionsService.calculerPrixAbonnement(request);
      setCalculPrix(calculs);
    } catch (error) {
      console.error('Erreur calculerPrixAbonnement:', error);
    }
  };

  const verifierDisponibiliteCreneaux = async () => {
    if (!terrainSelectionne || joursPreferes.length === 0 || creneauxPreferes.length === 0) return;
    
    setVerificationEnCours(true);
    try {
      const availability = await abonnementConditionsService.verifierDisponibiliteAbonnement({
        terrain_id: terrainSelectionne.id,
        jours_preferes: joursPreferes,
        creneaux_preferes: creneauxPreferes,
        duree_seance: dureeSeance,
        nb_seances: nbSeances
      });
      
      setDisponibiliteCreneaux(availability);
      console.log('✅ Disponibilité vérifiée:', availability);
    } catch (error) {
      console.error('Erreur lors de la vérification de disponibilité:', error);
      toast.error('Erreur lors de la vérification de disponibilité');
    } finally {
      setVerificationEnCours(false);
    }
  };

  const calculerPrix = (type: 'mensuel' | 'trimestriel' | 'annuel') => {
    if (!terrainSelectionne) return null;
    const prix = Number(terrainSelectionne.prix_heure ?? 0);
    let nbSemaines = 4;
    if (type === 'trimestriel') nbSemaines = 12;
    if (type === 'annuel') nbSemaines = 52;
    return prix * dureeSeance * nbSeances * nbSemaines;
  };

  const buildSubscriptionDetails = (response: SubscriptionResponseDTO, terrain: TerrainDTO) => {
    const startDate = response.date_debut ? new Date(response.date_debut) : new Date();
    const endDate = response.date_fin ? new Date(response.date_fin) : new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000);
    const type = response.type_abonnement === 'trimestriel'
      ? 'trimestriel'
      : response.type_abonnement === 'annuel'
        ? 'annuel'
        : 'mensuel';

    return {
      subscriptionId: response.abonnement_id ?? response.id,
      terrainName: response.terrain_nom ?? terrain.nom,
      totalAmount: response.prix_total ?? calculerPrix(type) ?? 0,
      duration: type,
      startDate: format(startDate, 'dd/MM/yyyy', { locale: fr }),
      endDate: format(endDate, 'dd/MM/yyyy', { locale: fr }),
      status: response.statut ?? 'pending',
      preferences: response.preferences,
    };
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

    // Vérifier que des jours et créneaux sont sélectionnés
    if (joursPreferes.length === 0 || creneauxPreferes.length === 0) {
      toast.error('Veuillez sélectionner au moins un jour et un créneau');
      return;
    }

    // Vérifier la disponibilité avant de procéder
    if (!disponibiliteCreneaux || !disponibiliteCreneaux.disponibilite_suffisante) {
      toast.error('Veuillez vérifier la disponibilité des créneaux avant de procéder');
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
        prix_total: prix,
        mode_paiement: modePaiement,
        jours_preferes: joursPreferes,
        creneaux_preferes: creneauxPreferes,
        preferences_flexibles: true
      };
      console.log('  - payload envoyé:', payload);
      
      const { data, meta } = await apiService.souscrireAbonnement(abonnementId, payload);
      console.log('  - réponse API:', data);

      if (!data) {
        const errorMessage = (meta?.message as string | undefined) ?? 'Erreur lors de la souscription';
        console.log('❌ Erreur API:', errorMessage);
        toast.error(errorMessage);
        return;
      }

      console.log('✅ Souscription réussie');
      toast.success((meta?.message as string | undefined) ?? 'Souscription initiée avec succès !');
      navigate('/payment', {
        state: {
          subscriptionDetails: buildSubscriptionDetails(data, terrainSelectionne),
        },
      });
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

        {terrainSelectionne && conditionsTerrain && (
          <div className="bg-white rounded-lg p-6 shadow-sm mb-8">
            <h2 className="text-xl font-semibold mb-4">Configuration de l'abonnement</h2>
            
            {/* Configuration de base */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre de séances/semaine</label>
                <select
                  className="border rounded px-3 py-2 w-full"
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
                  className="border rounded px-3 py-2 w-full"
                  value={dureeSeance}
                  onChange={e => setDureeSeance(Number(e.target.value))}
                >
                  {DUREES_SEANCE.map(d => (
                    <option key={d} value={d}>{d}h</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Mode de paiement</label>
                <select
                  className="border rounded px-3 py-2 w-full"
                  value={modePaiement}
                  onChange={e => setModePaiement(e.target.value as any)}
                >
                  <option value="integral">Paiement intégral</option>
                  <option value="differe">Paiement différé</option>
                  <option value="par_seance">Paiement par séance</option>
                </select>
              </div>
            </div>

            {/* Sélection des jours et créneaux */}
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <h3 className="font-semibold text-blue-800 mb-3 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Sélection des jours et créneaux
              </h3>
              
              {/* Sélection des jours */}
              <div className="mb-4">
                <p className="text-sm text-blue-700 mb-2">Jours de la semaine :</p>
                <div className="grid grid-cols-7 gap-2">
                  {[
                    { id: 0, nom: 'Dim' },
                    { id: 1, nom: 'Lun' },
                    { id: 2, nom: 'Mar' },
                    { id: 3, nom: 'Mer' },
                    { id: 4, nom: 'Jeu' },
                    { id: 5, nom: 'Ven' },
                    { id: 6, nom: 'Sam' }
                  ].map((jour) => (
                    <button
                      key={jour.id}
                      onClick={() => {
                        if (joursPreferes.includes(jour.id)) {
                          setJoursPreferes(joursPreferes.filter(j => j !== jour.id));
                        } else {
                          setJoursPreferes([...joursPreferes, jour.id]);
                        }
                      }}
                      className={`p-2 rounded text-sm font-medium transition-colors ${
                        joursPreferes.includes(jour.id)
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-blue-100'
                      }`}
                    >
                      {jour.nom}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sélection des créneaux */}
              <div className="mb-4">
                <p className="text-sm text-blue-700 mb-2">Créneaux horaires :</p>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'
                  ].map((creneau) => (
                    <button
                      key={creneau}
                      onClick={() => {
                        if (creneauxPreferes.includes(creneau)) {
                          setCreneauxPreferes(creneauxPreferes.filter(c => c !== creneau));
                        } else {
                          setCreneauxPreferes([...creneauxPreferes, creneau]);
                        }
                      }}
                      className={`p-2 rounded text-sm font-medium transition-colors ${
                        creneauxPreferes.includes(creneau)
                          ? 'bg-green-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-green-100'
                      }`}
                    >
                      {creneau}
                    </button>
                  ))}
                </div>
              </div>

              {/* Affichage de la disponibilité */}
              {verificationEnCours && (
                <div className="flex items-center justify-center p-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-sm text-blue-700">Vérification de la disponibilité...</span>
                </div>
              )}

              {disponibiliteCreneaux && (
                <div className="mt-4 p-3 bg-white rounded border">
                  <h4 className="font-medium text-gray-800 mb-2">Résultat de la vérification :</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-green-600 font-medium">
                        ✅ {disponibiliteCreneaux.creneaux_disponibles_count} créneaux disponibles
                      </p>
                      <p className="text-red-600 font-medium">
                        ❌ {disponibiliteCreneaux.conflits_count} conflits détectés
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">
                        Créneaux nécessaires : {nbSeances}
                      </p>
                      <p className={`font-medium ${
                        disponibiliteCreneaux.disponibilite_suffisante ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {disponibiliteCreneaux.disponibilite_suffisante ? '✅ Disponibilité suffisante' : '❌ Disponibilité insuffisante'}
                      </p>
                    </div>
                  </div>
                  
                  {/* Détails des conflits */}
                  {disponibiliteCreneaux.conflits_detectes.length > 0 && (
                    <div className="mt-3 p-2 bg-red-50 rounded">
                      <p className="text-sm font-medium text-red-800 mb-1">Conflits détectés :</p>
                      <div className="text-xs text-red-700">
                        {disponibiliteCreneaux.conflits_detectes.slice(0, 3).map((conflit: any, index: number) => (
                          <div key={index}>
                            {conflit.jour} {conflit.creneau} - {conflit.raison}
                          </div>
                        ))}
                        {disponibiliteCreneaux.conflits_detectes.length > 3 && (
                          <div>... et {disponibiliteCreneaux.conflits_detectes.length - 3} autres</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Préférences basées sur l'historique */}
              {historiqueReservations && historiqueReservations.statistiques.total_reservations > 0 && (
                <div className="mt-4 p-3 bg-yellow-50 rounded border">
                  <h4 className="font-medium text-yellow-800 mb-2">Vos préférences historiques :</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-yellow-700 mb-1">Jours préférés :</p>
                      <div className="flex flex-wrap gap-1">
                        {historiqueReservations.statistiques.jours_preferes.map((jour, index) => (
                          <span key={index} className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded text-xs">
                            {abonnementConditionsService.formatJoursSemaine([jour])[0]}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-yellow-700 mb-1">Créneaux préférés :</p>
                      <div className="flex flex-wrap gap-1">
                        {historiqueReservations.statistiques.creneaux_preferes.map((creneau, index) => (
                          <span key={index} className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded text-xs">
                            {creneau}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Conditions du terrain */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                <Info className="w-5 h-5 mr-2" />
                Conditions du terrain
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Engagement minimum : <span className="font-medium">{conditionsTerrain.conditions.conditions_abonnement.engagement_minimum} jours</span></p>
                  <p className="text-gray-600">Acompte requis : <span className="font-medium">{conditionsTerrain.conditions.acompte_minimum || 0} FCFA</span></p>
                </div>
                <div>
                  <p className="text-gray-600">Annulation : <span className="font-medium">{conditionsTerrain.conditions.conditions_abonnement.annulation}</span></p>
                  <p className="text-gray-600">Report : <span className="font-medium">{conditionsTerrain.conditions.conditions_abonnement.report}</span></p>
                </div>
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
                         {calculPrix && (
                           <div className="text-xs text-green-600 mt-1">
                             Réduction: {calculPrix.reduction_appliquee}%
                           </div>
                         )}
                       </div>
                     </div>
                    <p className="text-gray-600 mb-4">{abonnement.description}</p>
                    <div className="space-y-2 mb-6">
                      {(abonnement.avantages ?? []).map((avantage: string, index: number) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>{avantage}</span>
                        </div>
                      ))}
                    </div>
                                         {/* Détails du calcul selon le mode de paiement */}
                     {calculPrix && modePaiement === 'differe' && (
                       <div className="bg-yellow-50 p-3 rounded mb-4 text-sm">
                         <p className="text-yellow-800">
                           <strong>Acompte :</strong> {calculPrix.acompte?.toLocaleString()} FCFA
                         </p>
                         <p className="text-yellow-800">
                           <strong>Reste à payer :</strong> {calculPrix.reste_a_payer?.toLocaleString()} FCFA
                         </p>
                       </div>
                     )}
                     
                     {calculPrix && modePaiement === 'par_seance' && (
                       <div className="bg-blue-50 p-3 rounded mb-4 text-sm">
                         <p className="text-blue-800">
                           <strong>Prix par séance :</strong> {calculPrix.prix_par_seance?.toLocaleString()} FCFA
                         </p>
                         <p className="text-blue-800">
                           <strong>Total séances :</strong> {calculPrix.total_seances}
                         </p>
                       </div>
                     )}
                     
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