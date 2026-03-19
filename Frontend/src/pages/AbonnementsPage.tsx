import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import apiService, { type TerrainDTO } from '../services/api';
import toast from 'react-hot-toast';
import { CheckCircle, ArrowLeft, Info, TrendingUp, MapPin, Loader2 } from 'lucide-react';
import SEOMetaTags from '../components/SEOMetaTags';

const DUREES_SEANCE = [1, 1.5, 2];
const NB_SEANCES = [1, 2, 3, 4];

interface TypeAbonnement {
  id: number;
  nom: string;
  description: string;
  prix: number;
  duree_jours: number;
  avantages: string[];
}

const mapTerrainDto = (dto: TerrainDTO) => ({
  ...dto,
  nom: dto.nom ?? (dto as any).name ?? `Terrain ${dto.id}`,
  prix_heure: Number(dto.prix_heure ?? 0),
  adresse: dto.adresse ?? (dto as any).address ?? '',
});

const mapTypeAbonnement = (raw: any): TypeAbonnement => ({
  id: Number(raw.id),
  nom: raw.nom ?? `Plan ${raw.id}`,
  description: raw.description ?? '',
  prix: Number(raw.prix ?? 0),
  duree_jours: Number(raw.duree_jours ?? 30),
  avantages: raw.avantages ?? [],
});

const AbonnementsPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { terrainId } = useParams<{ terrainId: string }>();

  // États principaux
  const [terrains, setTerrains] = useState<TerrainDTO[]>([]);
  const [terrainSelectionne, setTerrainSelectionne] = useState<TerrainDTO | null>(null);
  const [typesAbonnement, setTypesAbonnement] = useState<TypeAbonnement[]>([]);
  const [loading, setLoading] = useState(true);
  const [traitement, setTraitement] = useState(false);
  
  // Configuration séance
  const [dureeSeance, setDureeSeance] = useState<number>(1);
  const [nbSeances, setNbSeances] = useState<number>(1);
  
  // Préférences de jeu
  const [joursPreferes, setJoursPreferes] = useState<number[]>([]);
  const [creneauxPreferes, setCreneauxPreferes] = useState<string[]>([]);
  const [modePaiement, setModePaiement] = useState<'comptant' | 'par_match' | 'par_tranche'>('comptant');
  const [montantAcompte, setMontantAcompte] = useState<number>(0);
  
  // Sélection plan
  const [typeAbonnementSelectionneId, setTypeAbonnementSelectionneId] = useState<number | null>(null);
  
  // Étapes: 1=Terrain, 2=Plan, 3=Config, 4=Créneaux, 5=Récap
  const [currentStep, setCurrentStep] = useState(1);

  // Type d'abonnement sélectionné
  const typeAbonnementSelectionne = useMemo(() => {
    return typesAbonnement.find(t => t.id === typeAbonnementSelectionneId) || null;
  }, [typesAbonnement, typeAbonnementSelectionneId]);
  
  // Calcul du prix estimé (basé sur le terrain ou le plan si sélectionné)
  const prixEstime = useMemo(() => {
    if (!terrainSelectionne) return null;
    // Si un plan est sélectionné, utiliser son prix
    if (typeAbonnementSelectionne) {
      return Math.round(typeAbonnementSelectionne.prix * nbSeances * dureeSeance);
    }
    // Sinon, calculer sur la base du prix horaire du terrain
    const prixHeure = terrainSelectionne.prix_heure || 10000;
    return Math.round(prixHeure * nbSeances * dureeSeance * 4); // 4 semaines
  }, [terrainSelectionne, typeAbonnementSelectionne, nbSeances, dureeSeance]);

  // Calcul de l'acompte suggéré (30% du total)
  const acompteSuggere = useMemo(() => {
    if (!prixEstime) return 0;
    return Math.round(prixEstime * 0.3);
  }, [prixEstime]);

  // Authentification requise
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { 
        state: { 
          from: { pathname: '/users/abonnements' },
          message: 'Veuillez vous connecter pour accéder aux abonnements' 
        } 
      });
    }
  }, [isAuthenticated, navigate]);

  // Charger terrains et types d'abonnement
  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  // Sélection automatique du terrain si ID fourni
  useEffect(() => {
    if (terrains.length > 0 && terrainId) {
      const terrain = terrains.find(t => String(t.id) === String(terrainId));
      if (terrain) {
        setTerrainSelectionne(terrain);
        setCurrentStep(2);
      }
    }
  }, [terrains, terrainId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Charger les terrains
      const terrainsResponse = await apiService.getTerrains();
      const raw = Array.isArray(terrainsResponse.data) 
        ? terrainsResponse.data 
        : (terrainsResponse.data as any)?.results ?? [];
      const terrainsData = raw.map(mapTerrainDto);
      setTerrains(terrainsData);

      // Charger les types d'abonnement
      const abonnementsResponse = await apiService.getAbonnements();
      const abosRaw = Array.isArray(abonnementsResponse.data) 
        ? abonnementsResponse.data 
        : (abonnementsResponse.data as any)?.results ?? (abonnementsResponse.data as any)?.data ?? [];
      const abosData = abosRaw.map(mapTypeAbonnement);
      setTypesAbonnement(abosData);

      if (abosData.length > 0) {
        setTypeAbonnementSelectionneId(abosData[0].id);
      }
    } catch (error) {
      console.error('Erreur chargement données:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    if (!terrainSelectionne || !prixEstime) {
      toast.error('Veuillez compléter toutes les étapes');
      return;
    }

    if (joursPreferes.length === 0 || creneauxPreferes.length === 0) {
      toast.error('Veuillez sélectionner au moins un jour et un créneau');
      return;
    }

    if (modePaiement === 'par_match' && montantAcompte <= 0) {
      toast.error('Veuillez indiquer le montant de l\'acompte');
      return;
    }

    setTraitement(true);
    try {
      const payload: {
        terrain_id: number;
        plan_id?: number;
        mode_paiement: 'integral' | 'differe' | 'par_seance' | 'comptant' | 'par_match' | 'par_tranche';
        nb_seances: number;
        duree_seance: number;
        jours_preferes: number[];
        creneaux_preferes: string[];
        montant_acompte?: number;
      } = {
        terrain_id: terrainSelectionne.id,
        mode_paiement: modePaiement as any,
        nb_seances: nbSeances,
        duree_seance: dureeSeance,
        jours_preferes: joursPreferes,
        creneaux_preferes: creneauxPreferes,
        montant_acompte: modePaiement === 'par_match' || modePaiement === 'par_tranche' ? montantAcompte : 0,
      };
      // Plan optionnel
      if (typeAbonnementSelectionneId) {
        payload.plan_id = typeAbonnementSelectionneId;
      }

      const { data, meta } = await apiService.createDemandeAbonnement(payload);

      if (data) {
        toast.success('Demande d\'abonnement envoyée ! Le gestionnaire va l\'étudier.');
        navigate('/dashboard');
      } else {
        toast.error((meta?.message as string) || 'Erreur lors de la souscription');
      }
    } catch (error: any) {
      console.error('Erreur souscription:', error);
      toast.error(error.message || 'Erreur lors de la souscription');
    } finally {
      setTraitement(false);
    }
  };

  if (!isAuthenticated) return null;

  if (loading) {
    return (
      <>
        <SEOMetaTags
          title="Abonnements terrains - Formules flexibles"
          description="Choisissez un abonnement terrain Kalél Sa Match : séances récurrentes, paiement comptant ou par match, acompte sécurisé Wave/Orange Money."
          url="https://kalelsamatch.com/abonnements"
          noIndex={!isAuthenticated}
        />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
        </div>
      </>
    );
  }

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-12">
      {['Terrain', 'Forfait (optionnel)', 'Config', 'Créneaux', 'Récap'].map((label, idx) => {
        const step = idx + 1;
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
                {label}
              </span>
            </div>
            {step < 5 && (
              <div className={`w-12 h-0.5 mx-2 ${currentStep > step ? 'bg-green-500' : 'bg-gray-100'}`} />
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
        <div className="bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-100 p-8 md:p-12 mb-8">
          
          {renderStepIndicator()}

          <div className="transition-all duration-500 mt-16">
            
            {/* STEP 1: TERRAIN SELECTION */}
            {currentStep === 1 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Choisissez votre terrain</h2>
                  <p className="text-gray-500">Sélectionnez le terrain où vous souhaitez jouer régulièrement.</p>
                </div>

                {terrains.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500">Aucun terrain disponible pour le moment.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {terrains.map((terrain) => {
                      const isSelected = terrainSelectionne?.id === terrain.id;
                      return (
                        <div
                          key={terrain.id}
                          onClick={() => setTerrainSelectionne(terrain)}
                          className={`group relative p-6 rounded-2xl cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
                            isSelected 
                              ? 'bg-blue-600 text-white shadow-2xl shadow-blue-200 ring-4 ring-blue-50' 
                              : 'bg-white text-gray-900 border border-gray-100 shadow-lg hover:shadow-xl'
                          }`}
                        >
                          <div className="flex items-start gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                              isSelected ? 'bg-white/20' : 'bg-blue-50'
                            }`}>
                              <MapPin className={`w-6 h-6 ${isSelected ? 'text-white' : 'text-blue-600'}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className={`font-bold text-lg mb-1 truncate ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                                {terrain.nom}
                              </h3>
                              <p className={`text-sm truncate ${isSelected ? 'text-blue-100' : 'text-gray-500'}`}>
                                {terrain.adresse || 'Adresse non renseignée'}
                              </p>
                              <p className={`text-sm mt-2 font-semibold ${isSelected ? 'text-blue-200' : 'text-blue-600'}`}>
                                {terrain.prix_heure?.toLocaleString()} FCFA/h
                              </p>
                            </div>
                          </div>
                          {isSelected && (
                            <div className="absolute top-3 right-3">
                              <CheckCircle className="w-6 h-6 text-white" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="mt-12 flex justify-end">
                  <button
                    disabled={!terrainSelectionne}
                    onClick={() => setCurrentStep(2)}
                    className="flex items-center gap-2 px-10 py-4 bg-gray-900 text-white rounded-2xl font-bold transition-all hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Suivant
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: PLAN SELECTION */}
            {currentStep === 2 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Choisissez votre forfait</h2>
                  <p className="text-gray-500">Sélectionnez la formule qui correspond le mieux à votre rythme de jeu.</p>
                </div>

                {typesAbonnement.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500">Aucun forfait disponible pour le moment.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {typesAbonnement.map((type, idx) => {
                      const isSelected = typeAbonnementSelectionneId === type.id;
                      const isBestValue = idx === 1;

                      return (
                        <div
                          key={type.id}
                          onClick={() => setTypeAbonnementSelectionneId(type.id)}
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
                            <h3 className={`text-xl font-bold mb-1 ${isSelected ? 'text-white' : 'text-gray-900'}`}>{type.nom}</h3>
                            <p className={`text-sm ${isSelected ? 'text-blue-100' : 'text-gray-500'}`}>
                              {type.duree_jours} jours
                            </p>
                          </div>

                          <div className="mb-8">
                            <div className="flex items-baseline gap-1">
                              <span className="text-4xl font-black">{type.prix?.toLocaleString()}</span>
                              <span className="text-lg opacity-80 font-medium">FCFA</span>
                            </div>
                            <div className="text-sm opacity-60">prix de base</div>
                          </div>

                          <ul className="space-y-4 mb-10 flex-1">
                            {(type.avantages ?? []).map((avantage: string, avIdx: number) => (
                              <li key={avIdx} className="flex items-start gap-3">
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
                )}

                <div className="mt-12 flex justify-between">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="px-8 py-4 text-gray-500 font-bold hover:text-gray-900 transition-colors"
                  >
                    Précédent
                  </button>
                  <div className="flex gap-4">
                    <button
                      onClick={() => {
                        setTypeAbonnementSelectionneId(null);
                        setCurrentStep(3);
                      }}
                      className="px-8 py-4 text-gray-500 font-bold hover:text-gray-900 transition-colors border border-gray-200 rounded-2xl"
                    >
                      Passer cette étape
                    </button>
                    <button
                      disabled={!typeAbonnementSelectionneId}
                      onClick={() => setCurrentStep(3)}
                      className="flex items-center gap-2 px-10 py-4 bg-gray-900 text-white rounded-2xl font-bold transition-all hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Suivant
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: CONFIGURATION */}
            {currentStep === 3 && (
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
                        { id: 'comptant', label: 'Paiement Comptant', desc: 'Payez la totalité en une fois' },
                        { id: 'par_match', label: 'Paiement par Match', desc: 'Versez un acompte puis payez à chaque fin de match' },
                        { id: 'par_tranche', label: 'Paiement par Tranche', desc: 'Échéancier de paiement (hebdo, mensuel)' }
                      ].map((mode) => (
                        <button
                          key={mode.id}
                          onClick={() => {
                            setModePaiement(mode.id as 'comptant' | 'par_match' | 'par_tranche');
                            if (mode.id === 'par_match') {
                              setMontantAcompte(acompteSuggere);
                            }
                          }}
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

                  {/* Champ acompte si mode par_match */}
                  {modePaiement === 'par_match' && (
                    <div className="mt-6 p-6 bg-orange-50 rounded-2xl border border-orange-200">
                      <label className="block text-sm font-bold text-orange-800 mb-3">Montant de l'acompte</label>
                      <div className="flex items-center gap-4">
                        <input
                          type="number"
                          value={montantAcompte}
                          onChange={(e) => setMontantAcompte(Number(e.target.value))}
                          className="flex-1 px-4 py-3 rounded-xl border border-orange-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none text-lg font-bold"
                          placeholder="Ex: 15000"
                          min={0}
                        />
                        <span className="font-bold text-orange-700">FCFA</span>
                      </div>
                      <p className="text-xs text-orange-600 mt-2">
                        Suggestion : {acompteSuggere.toLocaleString()} FCFA (30% du total estimé)
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-12 flex justify-between">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="px-8 py-4 text-gray-500 font-bold hover:text-gray-900 transition-colors"
                  >
                    Précédent
                  </button>
                  <button
                    onClick={() => setCurrentStep(4)}
                    className="px-10 py-4 bg-gray-900 text-white rounded-2xl font-bold transition-all hover:bg-gray-800"
                  >
                    Suivant
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: SLOTS */}
            {currentStep === 4 && (
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
                                ? 'border-blue-600 bg-blue-600 text-white' 
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
                      Récapitulatif préférences
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-3 border-b border-gray-200">
                        <span className="text-gray-500">Jours sélectionnés</span>
                        <span className="font-bold text-gray-900">{joursPreferes.length} jour(s)</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-gray-200">
                        <span className="text-gray-500">Créneaux sélectionnés</span>
                        <span className="font-bold text-gray-900">{creneauxPreferes.length} créneau(x)</span>
                      </div>
                      <div className="flex justify-between items-center py-3">
                        <span className="text-gray-500">Combinaisons possibles</span>
                        <span className="font-bold text-blue-600">{joursPreferes.length * creneauxPreferes.length}</span>
                      </div>
                    </div>

                    {joursPreferes.length === 0 || creneauxPreferes.length === 0 ? (
                      <div className="mt-6 p-4 bg-orange-50 rounded-xl text-orange-700 text-sm">
                        <Info className="w-5 h-5 inline mr-2" />
                        Sélectionnez au moins un jour et un créneau
                      </div>
                    ) : (
                      <div className="mt-6 p-4 bg-green-50 rounded-xl text-green-700 text-sm">
                        <CheckCircle className="w-5 h-5 inline mr-2" />
                        Préférences enregistrées !
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-12 flex justify-between">
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="px-8 py-4 text-gray-500 font-bold hover:text-gray-900 transition-colors"
                  >
                    Précédent
                  </button>
                  <button
                    disabled={joursPreferes.length === 0 || creneauxPreferes.length === 0}
                    onClick={() => setCurrentStep(5)}
                    className="px-10 py-4 bg-gray-900 text-white rounded-2xl font-bold transition-all hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Récapitulatif
                  </button>
                </div>
              </div>
            )}

            {/* STEP 5: REVIEW */}
            {currentStep === 5 && (
              <div className="animate-in fade-in zoom-in-95 duration-500 max-w-2xl mx-auto text-center">
                <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8">
                  <CheckCircle className="w-12 h-12" />
                </div>
                <h2 className="text-4xl font-black text-gray-900 mb-4">C'est presque fini !</h2>
                <p className="text-gray-500 mb-12">Révisez les détails de votre abonnement avant de finaliser.</p>

                <div className="bg-gray-50/50 rounded-3xl p-8 border border-gray-100 text-left space-y-6 mb-12">
                  <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                    <span className="text-gray-500">Terrain</span>
                    <span className="font-bold text-gray-900">{terrainSelectionne?.nom}</span>
                  </div>
                  {typeAbonnementSelectionne && (
                    <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                      <span className="text-gray-500">Forfait choisi</span>
                      <span className="font-bold text-gray-900">{typeAbonnementSelectionne.nom}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                    <span className="text-gray-500">Configuration</span>
                    <span className="font-bold text-gray-900">{nbSeances} séance(s) de {dureeSeance}h / sem</span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                    <span className="text-gray-500">Mode de paiement</span>
                    <span className="font-bold text-gray-900 capitalize">
                      {modePaiement === 'comptant' ? 'Comptant' : modePaiement === 'par_match' ? 'Par match' : 'Par tranche'}
                    </span>
                  </div>
                  {modePaiement === 'par_match' && (
                    <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                      <span className="text-gray-500">Acompte à verser</span>
                      <span className="font-bold text-orange-600">{montantAcompte.toLocaleString()} FCFA</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-xl">
                    <span className="font-bold text-gray-900">Total estimé</span>
                    <span className="font-black text-blue-600">{prixEstime?.toLocaleString()} FCFA</span>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setCurrentStep(4)}
                    className="flex-1 py-4 bg-gray-100 text-gray-900 rounded-2xl font-bold hover:bg-gray-200 transition-all"
                  >
                    Ajuster les choix
                  </button>
                  <button
                    onClick={handleSubscribe}
                    disabled={traitement}
                    className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-xl shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {traitement ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Enregistrement...
                      </span>
                    ) : (
                      "Confirmer l'Abonnement"
                    )}
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
