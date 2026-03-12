import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import apiService, {
  type TerrainDTO,
  type PlanAbonnementDTO,
} from '../services/api';
import toast from 'react-hot-toast';
import { CheckCircle, ArrowLeft, Info, TrendingUp } from 'lucide-react';
import { 
  abonnementConditionsService
} from '../services/abonnementConditionsService';
import type {
  TerrainConditions
} from '../services/abonnementConditionsService';

const DUREES_SEANCE = [1, 2, 3];
const NB_SEANCES = [1, 2, 3];

const mapTerrainDto = (dto: TerrainDTO) => ({
  ...dto,
  nom: dto.nom ?? (dto as any).name ?? `Terrain ${dto.id}`,
  prix_heure: Number(dto.prix_heure ?? 0),
});

const mapPlanAbonnementDto = (dto: PlanAbonnementDTO) => ({
  ...dto,
  id: Number(dto.id),
  nom: dto.nom ?? (dto as any).name ?? `Plan ${dto.id}`,
  prix: dto.prix != null ? Number(dto.prix) : (dto as any).price ?? null,
  reduction_percent: dto.reduction_percent != null ? Number(dto.reduction_percent) : 0,
  description: dto.description ?? (dto as any).desc ?? '',
  type_abonnement: (dto.type_abonnement as string | undefined)?.toLowerCase() ?? null,
});

const DUMMY_PLANS: PlanAbonnementDTO[] = [
  {
    id: -1,
    nom: "Pack Premium Mensuel",
    description: "Accès illimité à nos meilleures installations avec des créneaux prioritaires et services VIP.",
    prix: 45000,
    type_abonnement: "mensuel",
    duree_jours: 30,
    avantages: ["4 séances par mois", "Créneaux prioritaires", "Accès aux vestiaires VIP", "Eau minérale offerte"]
  },
  {
    id: -2,
    nom: "Pack Élite Trimestriel",
    description: "La solution idéale pour les équipes régulières cherchant la performance sur le long terme.",
    prix: 120000,
    type_abonnement: "trimestriel",
    duree_jours: 90,
    avantages: ["12 séances (1 par semaine)", "2 heures offertes", "Analyse vidéo de vos matchs", "Réduction boutique"]
  },
  {
    id: -3,
    nom: "Club Champions Annuel",
    description: "Rejoignez l'élite. Le meilleur rapport qualité-prix pour les passionnés du ballon rond.",
    prix: 400000,
    type_abonnement: "annuel",
    duree_jours: 365,
    avantages: ["52 séances par an", "Maillot du club offert", "Accès tournois exclusifs", "Invités gratuits (2/mois)"]
  }
];

const AbonnementsPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { terrainId } = useParams<{ terrainId: string }>();

  const [terrains, setTerrains] = useState<TerrainDTO[]>([]);
  const [terrainSelectionne, setTerrainSelectionne] = useState<TerrainDTO | null>(null);
  const [plans, setPlans] = useState<PlanAbonnementDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [traitement, setTraitement] = useState(false);
  const [dureeSeance, setDureeSeance] = useState(1);
  const [nbSeances, setNbSeances] = useState(1);
  
  // Nouvelles états pour les conditions d'abonnement
  const [conditionsTerrain, setConditionsTerrain] = useState<TerrainConditions | null>(null);
  
  // Préférences de jeu
  const [joursPreferes, setJoursPreferes] = useState<number[]>([]);
  const [creneauxPreferes, setCreneauxPreferes] = useState<string[]>([]);
  const [modePaiement, setModePaiement] = useState<'integral' | 'differe' | 'par_seance'>('integral');
  const [disponibiliteCreneaux, setDisponibiliteCreneaux] = useState<any>(null);
  const [planSelectionneId, setPlanSelectionneId] = useState<number | null>(null);
  const [typeAbonnementSelectionne, setTypeAbonnementSelectionne] = useState<'mensuel' | 'trimestriel' | 'annuel' | null>(null);
  const [prixEstimeSelection, setPrixEstimeSelection] = useState<number | null>(null);
  const [currentStep, setCurrentStep] = useState(1); // 1: Plan, 2: Config, 3: Slots, 4: Review

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
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (terrainId) {
      fetchPlans(terrainId);
    } else {
      fetchPlans();
    }
  }, [terrainId]);

  // Charger les conditions du terrain quand un terrain est sélectionné
  useEffect(() => {
    if (terrainSelectionne) {
      fetchConditionsTerrain();
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
    } else if (terrains.length > 0 && !terrainSelectionne) {
      // Pas de terrainId dans l'URL : on garde ou on pré-sélectionne le premier
      setTerrainSelectionne(terrains[0]);
    } else if (terrains.length === 0) {
      console.log('  - Aucun terrain disponible');
      setTerrainSelectionne(null);
    }
  }, [terrains, terrainId]);

  const fetchTerrains = async () => {
    try {
      setLoading(true);
      const { data } = await apiService.getTerrains();
      console.log('🔍 Debug - Réponse API terrains (normalisée):', data);

      const raw = Array.isArray(data) ? data : (data as any)?.results;
      const terrainsData = Array.isArray(raw) ? raw.map(mapTerrainDto) : [];
      console.log('🔍 Debug - Terrains extraits:', terrainsData);
      setTerrains(terrainsData);

      if (terrainsData.length === 0) {
        toast.error('Aucun terrain disponible');
      } else if (!terrainId && !terrainSelectionne) {
        // Pré-sélectionner le premier terrain pour activer le calcul et la vérification
        setTerrainSelectionne(terrainsData[0]);
      }
    } catch (error) {
      console.error('❌ Erreur fetchTerrains:', error);
      setTerrains([]);
      toast.error('Erreur lors du chargement des terrains');
    } finally {
      setLoading(false);
    }
  };

  const fetchPlans = async (tid?: string) => {
    try {
      const { data } = await apiService.getPlanAbonnements(tid ? { terrain_id: tid } : {});
      const plansRaw = Array.isArray(data) ? data : (data as any)?.results;
      const plansData = Array.isArray(plansRaw) ? plansRaw.map(mapPlanAbonnementDto) : [];
      setPlans(plansData);
      
      // Auto-sélection du premier plan si aucun n'est sélectionné
      if (plansData.length > 0 && !planSelectionneId) {
        const first = plansData[0];
        setPlanSelectionneId(first.id);
        const type = detectTypeAbonnement(first);
        setTypeAbonnementSelectionne(type);
        const reduction = Number(first.reduction_percent ?? 0);
        const prixBase = Number(first.prix ?? 0);
        const prixNet = prixBase * (1 - reduction / 100);
        setPrixEstimeSelection(prixNet);
      }
    } catch (error) {
      console.error('❌ Erreur fetchPlans:', error);
      setPlans([]);
      toast.error('Erreur lors du chargement des plans');
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

  const calculerPrixAbonnement = async () => {
    if (!terrainSelectionne || !conditionsTerrain) return;
    
    try {
      /* const request = {
        terrain_id: terrainSelectionne.id,
        type_abonnement: 'mensuel' as const,
        nb_seances: nbSeances,
        duree_seance: dureeSeance,
        mode_paiement: modePaiement
      }; */
      
      // await abonnementConditionsService.calculerPrixAbonnement(request);
    } catch (error) {
      console.error('Erreur calculerPrixAbonnement:', error);
    }
  };

  const verifierDisponibiliteCreneaux = async () => {
    if (!terrainSelectionne || joursPreferes.length === 0 || creneauxPreferes.length === 0) return;
    
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
    }
  };

  const detectTypeAbonnement = (plan: PlanAbonnementDTO): 'mensuel' | 'trimestriel' | 'annuel' => {
    const label = plan.type_abonnement ?? plan.nom.toLowerCase();
    if (label.includes('trimestriel')) return 'trimestriel';
    if (label.includes('annuel')) return 'annuel';
    return 'mensuel';
  };

  const calculerPrix = (_type: 'mensuel' | 'trimestriel' | 'annuel', plan?: PlanAbonnementDTO | null) => {
    if (plan && plan.prix != null) {
      const reduction = Number(plan.reduction_percent ?? 0);
      const prixBase = Number(plan.prix);
      const prixNet = prixBase * (1 - reduction / 100);
      return prixNet;
    }
    return null;
  };

  type DemandeCreationPayload = {
    plan_id: number;
    mode_paiement: 'integral' | 'differe' | 'par_seance';
    nb_seances: number;
    duree_seance: number;
    jours_preferes: number[];
    creneaux_preferes: string[];
    prix_estime?: number | null;
  };

  const buildDemandePayload = (planId: number): DemandeCreationPayload => ({
    plan_id: planId,
    mode_paiement: modePaiement,
    nb_seances: nbSeances,
    duree_seance: dureeSeance,
    jours_preferes: joursPreferes,
    creneaux_preferes: creneauxPreferes,
  });

  const createDemandeAbonnement = async (
    planId: number,
    type: 'mensuel' | 'trimestriel' | 'annuel'
  ) => {
    console.log('🔍 Debug - createDemandeAbonnement appelée:');
    console.log('  - planId:', planId);
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
      const selectedPlan = (plans.length > 0 ? plans : DUMMY_PLANS).find(p => p.id === planId) ?? null;
      const prix = calculerPrix(type, selectedPlan);
      console.log('  - prix calculé:', prix);
      const payload = buildDemandePayload(planId);
      if (prix !== null) {
        payload.prix_estime = prix;
      }
      console.log('  - payload envoyé:', payload);

      const { data, meta } = await apiService.createDemandeAbonnement(payload);
      console.log('  - réponse API demande:', data);

      if (!data) {
        const errorMessage = (meta?.message as string | undefined) ?? 'Erreur lors de la demande';
        console.log('❌ Erreur API:', errorMessage);
        toast.error(errorMessage);
        return;
      }

      console.log('✅ Demande créée');
      toast.success((meta?.message as string | undefined) ?? 'Demande enregistrée !');
      navigate('/users/mes-abonnements');
    } catch (error) {
      console.error('❌ Exception lors de la demande:', error);
      toast.error('Erreur lors de la demande');
    } finally {
      setTraitement(false);
    }
  };

  if (!isAuthenticated) return null;
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const effectivePlans = plans.length > 0 ? plans : DUMMY_PLANS;

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-12">
      {[1, 2, 3, 4].map((step) => {
        const isActive = currentStep === step;
        const isCompleted = currentStep > step;
        return (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center relative">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  isActive ? 'border-blue-600 bg-blue-600 text-white shadow-lg scale-110' : 
                  isCompleted ? 'border-green-500 bg-green-500 text-white' : 
                  'border-gray-200 bg-white text-gray-400'
                }`}
              >
                {isCompleted ? <CheckCircle className="w-6 h-6" /> : step}
              </div>
              <span className={`absolute -bottom-7 text-xs font-medium whitespace-nowrap ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
                {step === 1 ? 'Forfait' : step === 2 ? 'Config' : step === 3 ? 'Créneaux' : 'Récap'}
              </span>
            </div>
            {step < 4 && (
              <div className={`w-16 h-0.5 mx-2 ${currentStep > step ? 'bg-green-500' : 'bg-gray-100'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-[#1e3a8a] via-[#1e40af] to-[#1d4ed8] pt-12 pb-24 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-48 -mt-48 blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/10 rounded-full -ml-32 -mb-32 blur-2xl" />
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex items-center justify-between mb-8">
            <button 
              onClick={() => navigate(-1)}
              className="group flex items-center gap-2 text-white/80 hover:text-white transition-colors"
            >
              <div className="p-2 rounded-lg bg-white/10 group-hover:bg-white/20 transition-all">
                <ArrowLeft className="w-5 h-5" />
              </div>
              <span className="font-medium">Retour</span>
            </button>
            <div className="px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-blue-100 uppercase tracking-wider">
              Abonnement Premium
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
            Boostez votre expérience <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-white">sportive</span>
          </h1>
          <p className="text-blue-100/80 text-lg max-w-2xl mb-8 leading-relaxed">
            Profitez de créneaux réguliers, de tarifs préférentiels et d'avantages exclusifs sur vos terrains préférés.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto w-full px-4 -mt-16 mb-20 relative z-20">
        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-100 p-8 md:p-12 mb-8">
          
          {renderStepIndicator()}

          <div className="transition-all duration-500">
            {/* STEP 1: PLAN SELECTION */}
            {currentStep === 1 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Choisissez votre forfait</h2>
                  <p className="text-gray-500">Sélectionnez la formule qui correspond le mieux à votre rythme de jeu.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {effectivePlans.map((plan) => {
                    const type = detectTypeAbonnement(plan);
                    const prix = calculerPrix(type, plan);
                    const isSelected = planSelectionneId === plan.id;
                    const isBestValue = type === 'trimestriel';

                    return (
                      <div
                        key={plan.id}
                        onClick={() => {
                          setPlanSelectionneId(plan.id);
                          setTypeAbonnementSelectionne(type);
                          setPrixEstimeSelection(prix);
                        }}
                        className={`group relative flex flex-col p-8 rounded-3xl cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
                          isSelected 
                            ? 'bg-blue-600 text-white shadow-2xl shadow-blue-200 scale-[1.02] ring-4 ring-blue-50' 
                            : 'bg-white text-gray-900 border border-gray-100 shadow-xl shadow-gray-100/50 hover:shadow-2xl hover:shadow-gray-200/50'
                        }`}
                      >
                        {isBestValue && (
                          <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-orange-500 text-white text-[10px] font-bold uppercase tracking-widest shadow-lg">
                            Populaire
                          </div>
                        )}
                        
                        <div className="mb-6">
                          <h3 className={`text-xl font-bold mb-1 ${isSelected ? 'text-white' : 'text-gray-900'}`}>{plan.nom}</h3>
                          <p className={`text-sm ${isSelected ? 'text-blue-100' : 'text-gray-500'}`}>
                            {type === 'mensuel' ? 'Engagement mensuel' : type === 'trimestriel' ? '3 mois de passion' : 'Passion illimitée'}
                          </p>
                        </div>

                        <div className="mb-8">
                          <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-black">{prix?.toLocaleString()}</span>
                            <span className="text-lg opacity-80 font-medium">FCFA</span>
                          </div>
                          <div className="text-sm opacity-60">par période</div>
                        </div>

                        <ul className="space-y-4 mb-10 flex-1">
                          {(plan.avantages ?? []).map((avantage: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-3">
                              <CheckCircle className={`w-5 h-5 shrink-0 ${isSelected ? 'text-blue-300' : 'text-green-500'}`} />
                              <span className="text-sm leading-tight opacity-90">{avantage}</span>
                            </li>
                          ))}
                        </ul>

                        <button
                          className={`w-full py-4 rounded-2xl font-bold transition-all ${
                            isSelected 
                              ? 'bg-white text-blue-600 shadow-lg' 
                              : 'bg-gray-50 text-gray-900 hover:bg-gray-100'
                          }`}
                        >
                          {isSelected ? 'Sélectionné' : 'Choisir ce pack'}
                        </button>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-12 flex justify-end">
                  <button
                    disabled={!planSelectionneId}
                    onClick={() => setCurrentStep(2)}
                    className="flex items-center gap-2 px-10 py-4 bg-gray-900 text-white rounded-2xl font-bold transition-all hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Suivant
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: CONFIGURATION */}
            {currentStep === 2 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500 max-w-2xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Configuration</h2>
                  <p className="text-gray-500">Personnalisez les détails de vos séances.</p>
                </div>

                <div className="space-y-8 bg-gray-50/50 p-8 rounded-3xl border border-gray-100">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-3">Séances par semaine</label>
                      <div className="flex gap-2">
                        {NB_SEANCES.map(nb => (
                          <button
                            key={nb}
                            onClick={() => setNbSeances(nb)}
                            className={`flex-1 py-3 rounded-xl border-2 transition-all font-bold ${
                              nbSeances === nb ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-white bg-white text-gray-400 hover:border-gray-200'
                            }`}
                          >
                            {nb}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-3">Durée de séance</label>
                      <div className="flex gap-2">
                        {DUREES_SEANCE.map(d => (
                          <button
                            key={d}
                            onClick={() => setDureeSeance(d)}
                            className={`flex-1 py-3 rounded-xl border-2 transition-all font-bold ${
                              dureeSeance === d ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-white bg-white text-gray-400 hover:border-gray-200'
                            }`}
                          >
                            {d}h
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">Mode de paiement préféré</label>
                    <div className="grid grid-cols-1 gap-3">
                      {[
                        { id: 'integral', label: 'Paiement Intégral', desc: 'Payez la totalité pour plus de simplicité' },
                        { id: 'differe', label: 'Paiement Différé', desc: 'Payez un acompte maintenant, le reste plus tard' },
                        { id: 'par_seance', label: 'Par Séance', desc: 'Payez à chaque fois que vous jouez' }
                      ].map((mode) => (
                        <button
                          key={mode.id}
                          onClick={() => setModePaiement(mode.id as any)}
                          className={`flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${
                            modePaiement === mode.id ? 'border-blue-600 bg-blue-50' : 'border-white bg-white hover:border-gray-100'
                          }`}
                        >
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${modePaiement === mode.id ? 'border-blue-600 bg-blue-600' : 'border-gray-200'}`}>
                            {modePaiement === mode.id && <div className="w-2 h-2 rounded-full bg-white" />}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900">{mode.label}</div>
                            <div className="text-xs text-gray-500">{mode.desc}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-12 flex justify-between">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="px-8 py-4 text-gray-500 font-bold hover:text-gray-900 transition-colors"
                  >
                    Précédent
                  </button>
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="px-10 py-4 bg-gray-900 text-white rounded-2xl font-bold transition-all hover:bg-gray-800"
                  >
                    Suivant
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: SLOTS */}
            {currentStep === 3 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Vos créneaux préférés</h2>
                  <p className="text-gray-500">Quand souhaitez-vous fouler la pelouse ?</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">1. Choisissez vos jours</h3>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { id: 1, nom: 'Lundi' }, { id: 2, nom: 'Mardi' }, { id: 3, nom: 'Mercredi' },
                          { id: 4, nom: 'Jeudi' }, { id: 5, nom: 'Vendredi' }, { id: 6, nom: 'Samedi' }, { id: 0, nom: 'Dimanche' }
                        ].map((jour) => (
                          <button
                            key={jour.id}
                            onClick={() => {
                              if (joursPreferes.includes(jour.id)) setJoursPreferes(joursPreferes.filter(j => j !== jour.id));
                              else setJoursPreferes([...joursPreferes, jour.id]);
                            }}
                            className={`px-6 py-3 rounded-xl font-bold transition-all border-2 ${
                              joursPreferes.includes(jour.id) 
                                ? 'border-primary-600 bg-primary-600 text-white' 
                                : 'border-gray-50 bg-gray-50 text-gray-500 hover:border-gray-200'
                            }`}
                          >
                            {jour.nom}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">2. Choisissez vos heures</h3>
                      <div className="grid grid-cols-4 gap-2">
                        {['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'].map((creneau) => (
                          <button
                            key={creneau}
                            onClick={() => {
                              if (creneauxPreferes.includes(creneau)) setCreneauxPreferes(creneauxPreferes.filter(c => c !== creneau));
                              else setCreneauxPreferes([...creneauxPreferes, creneau]);
                            }}
                            className={`py-3 rounded-xl font-bold transition-all border-2 ${
                              creneauxPreferes.includes(creneau) 
                                ? 'border-green-500 bg-green-500 text-white shadow-md' 
                                : 'border-gray-50 bg-gray-50 text-gray-500 hover:border-gray-200'
                            }`}
                          >
                            {creneau}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50/50 p-8 rounded-3xl border border-gray-100 h-fit">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-blue-600" />
                      Statut de disponibilité
                    </h3>
                    
                    {!disponibiliteCreneaux ? (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 text-gray-300">
                          <Info className="w-8 h-8" />
                        </div>
                        <p className="text-sm text-gray-400 px-8">Sélectionnez au moins un jour et un créneau pour vérifier la disponibilité.</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className={`p-6 rounded-2xl flex items-center gap-4 ${disponibiliteCreneaux.disponibilite_suffisante ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${disponibiliteCreneaux.disponibilite_suffisante ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                            {disponibiliteCreneaux.disponibilite_suffisante ? <CheckCircle className="w-6 h-6" /> : <Info className="w-6 h-6" />}
                          </div>
                          <div>
                            <div className="font-bold text-lg">{disponibiliteCreneaux.disponibilite_suffisante ? 'Disponible !' : 'Indisponible'}</div>
                            <div className="text-sm opacity-80">{disponibiliteCreneaux.creneaux_disponibles_count} créneaux trouvés pour vos besoins.</div>
                          </div>
                        </div>

                        {disponibiliteCreneaux.conflits_count > 0 && (
                          <div className="bg-white p-6 rounded-2xl border border-red-100">
                            <h4 className="text-xs font-bold text-red-500 uppercase tracking-widest mb-2">Conflits détectés</h4>
                            <p className="text-sm text-gray-600">{disponibiliteCreneaux.conflits_count} de vos choix sont déjà réservés. Veuillez ajuster.</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-12 flex justify-between">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="px-8 py-4 text-gray-500 font-bold hover:text-gray-900 transition-colors"
                  >
                    Précédent
                  </button>
                  <button
                    disabled={!disponibiliteCreneaux?.disponibilite_suffisante}
                    onClick={() => setCurrentStep(4)}
                    className="px-10 py-4 bg-gray-900 text-white rounded-2xl font-bold transition-all hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Récapitulatif
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: REVIEW */}
            {currentStep === 4 && (
              <div className="animate-in fade-in zoom-in-95 duration-500 max-w-2xl mx-auto text-center">
                <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8">
                  <CheckCircle className="w-12 h-12" />
                </div>
                <h2 className="text-4xl font-black text-gray-900 mb-4">C'est presque fini !</h2>
                <p className="text-gray-500 mb-12">Révisez les détails de votre abonnement avant de finaliser la demande.</p>

                <div className="bg-gray-50/50 rounded-3xl p-8 border border-gray-100 text-left space-y-6 mb-12">
                  <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                    <span className="text-gray-500">Forfait choisi</span>
                    <span className="font-bold text-gray-900">{effectivePlans.find(p => p.id === planSelectionneId)?.nom}</span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                    <span className="text-gray-500">Configuration</span>
                    <span className="font-bold text-gray-900">{nbSeances} séance(s) de {dureeSeance}h / sem</span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                    <span className="text-gray-500">Mode de paiement</span>
                    <span className="font-bold text-gray-900 capitalize">{modePaiement.replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between items-center text-xl">
                    <span className="font-bold text-gray-900">Total à régler</span>
                    <span className="font-black text-blue-600">{prixEstimeSelection?.toLocaleString()} FCFA</span>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="flex-1 py-4 bg-gray-100 text-gray-900 rounded-2xl font-bold hover:bg-gray-200 transition-all"
                  >
                    Ajuster les choix
                  </button>
                  <button
                    onClick={() => planSelectionneId && typeAbonnementSelectionne && createDemandeAbonnement(planSelectionneId, typeAbonnementSelectionne)}
                    disabled={traitement}
                    className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-xl shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {traitement ? 'Enregistrement...' : 'Confirmer l\'Abonnement'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl p-8 flex items-start gap-6">
          <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
            <Info className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-gray-900 mb-1">Comment ça marche ?</h4>
            <p className="text-sm text-gray-500 leading-relaxed">
              Une fois votre demande envoyée, le gestionnaire du terrain l'étudiera sous 24h. 
              Dès validation, vous recevrez une notification pour procéder au paiement et activer vos créneaux.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AbonnementsPage;