import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { CheckCircle, ArrowLeft, MapPin, Users, Euro, Calendar, Clock, Star, Trophy, Gift } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/api';
import TerrainOptionSelector from '../components/TerrainOptionSelector';
import RecurringSubscriptionModal from '../components/RecurringSubscriptionModal';
import FideliteCard from '../components/FideliteCard';

const DUREES_SEANCE = [1, 2, 3];
const NB_SEANCES = [1, 2, 3, 4, 5];

// Interface pour les terrains avec informations complètes
interface Terrain {
  id: number;
  nom: string;
  name?: string;
  adresse: string;
  prix_heure: number;
  capacite?: number;
  image_principale?: string;
  description?: string;
}

// Interface pour les options de terrain
interface TerrainOption {
  id: string;
  name: string;
  price: number;
  capacity: number;
  description: string;
  duration?: number;
  timeSlot?: string;
}

// Interface pour les abonnements
interface Abonnement {
  id: number;
  nom: string;
  description: string;
  duree_jours: number;
  avantages: string[];
  prix?: number; // Ajout du prix pour les abonnements avec un prix fixe
}

const AbonnementsPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { terrainId } = useParams<{ terrainId: string }>();
  const location = useLocation();

  const [terrains, setTerrains] = useState<Terrain[]>([]);
  const [terrainSelectionne, setTerrainSelectionne] = useState<Terrain | null>(null);
  const [selectedOption, setSelectedOption] = useState<TerrainOption | null>(null);
  const [nbSeances, setNbSeances] = useState(2); // CORRECTION: 2 séances par défaut
  const [dureeSeance, setDureeSeance] = useState(1);
  const [traitement, setTraitement] = useState(false);

  // Nouveaux states pour les créneaux récurrents
  const [creneauxSelectionnes, setCreneauxSelectionnes] = useState<{
    jour: number; // 0=Dimanche, 1=Lundi, etc.
    heure: string; // "18:00", "20:00", etc.
  }[]>([]);
  const [jourSelectionne, setJourSelectionne] = useState<number | null>(null);
  const [heureSelectionnee, setHeureSelectionnee] = useState<string>('');
  const [verificationDisponibilite, setVerificationDisponibilite] = useState(false);
  const [creneauxDisponibles, setCreneauxDisponibles] = useState<{[key: string]: string[]}>({});
  const [abonnements, setAbonnements] = useState<Abonnement[]>([]);
  const [abonnementSelectionne, setAbonnementSelectionne] = useState<Abonnement | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showRecurringModal, setShowRecurringModal] = useState(false);
  const [fideliteData, setFideliteData] = useState<any>(null);
  const [fideliteLoading, setFideliteLoading] = useState(false);
  const [prixAvecReduction, setPrixAvecReduction] = useState<number | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    fetchTerrains();
    fetchAbonnements();
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    // Auto-select terrain and option from location state or URL parameter
    if (location.state?.selectedTerrain) {
      console.log('🎯 Terrain depuis location.state:', location.state.selectedTerrain);
      setTerrainSelectionne(location.state.selectedTerrain);
      setSelectedOption(location.state.selectedOption || null);
    } else if (terrainId && terrains.length > 0) {
      const terrain = terrains.find(t => t.id === parseInt(terrainId));
      console.log('🎯 Terrain trouvé par ID:', terrain);
      if (terrain) {
        setTerrainSelectionne(terrain);
      }
    }
  }, [terrainId, terrains, location.state]);

  // Charger les données de fidélité quand un terrain est sélectionné
  useEffect(() => {
    if (terrainSelectionne && isAuthenticated) {
      chargerFidelite();
    }
  }, [terrainSelectionne, isAuthenticated]);

  const chargerFidelite = async () => {
    if (!terrainSelectionne || !isAuthenticated) return;
    
    setFideliteLoading(true);
    try {
      const response = await apiService.calculerFidelite(terrainSelectionne.id);
      if (response.success) {
        setFideliteData(response.data);
      }
    } catch (error) {
      console.error('Erreur chargement fidélité:', error);
      // Ne pas afficher d'erreur, juste ne pas afficher la carte de fidélité
    } finally {
      setFideliteLoading(false);
    }
  };

  const fetchTerrains = async () => {
    try {
      // Cache-busting via l'URL directement
      const response = await apiService.getTerrains();
      if (response.success) {
        let terrainsData: Terrain[] = [];
        if (Array.isArray(response.data)) {
          terrainsData = response.data;
        } else if (response.data?.data && Array.isArray(response.data.data)) {
          terrainsData = response.data.data;
        }
        console.log('🔄 Terrains récupérés:', terrainsData.map(t => ({ nom: t.nom, prix: t.prix_heure })));
        setTerrains(terrainsData);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des terrains:', error);
      toast.error('Impossible de charger les terrains');
    }
  };

  const fetchAbonnements = async () => {
    setLoading(true);
    try {
      const response = await apiService.getAbonnements();
      if (response.success && response.data) {
        setAbonnements(response.data);
        // Pas de sélection automatique - l'utilisateur doit choisir
      }
    } catch (error) {
      console.error('Erreur lors du chargement des abonnements:', error);
      toast.error('Impossible de charger les abonnements');
    } finally {
      setLoading(false);
    }
  };

  // Calculer le prix pour un abonnement spécifique - CORRECTION MAJEURE
  const calculerPrixPourAbonnement = (abonnement: Abonnement): number => {
    if (!terrainSelectionne || !selectedOption) return abonnement.prix || 0;

    const prixDeBase = selectedOption.price || terrainSelectionne.prix_heure;
    const dureeSeanceHeures = selectedOption.duration || dureeSeance;
    let prixCalcule = 0;

    // Calcul selon le type d'abonnement
    switch (abonnement.nom) {
      case 'Abonnement Mensuel':
        prixCalcule = prixDeBase * dureeSeanceHeures * nbSeances * 4;
        break;
      case 'Abonnement Trimestriel':
        prixCalcule = prixDeBase * dureeSeanceHeures * nbSeances * 12;
        break;
      case 'Abonnement Annuel':
        prixCalcule = prixDeBase * dureeSeanceHeures * nbSeances * 52;
        break;
      default:
        prixCalcule = abonnement.prix || 0;
    }

    // Appliquer la réduction fidélité si disponible
    if (fideliteData?.reduction_pourcentage > 0) {
      const reduction = (prixCalcule * fideliteData.reduction_pourcentage) / 100;
      prixCalcule = prixCalcule - reduction;
    }

    return Math.round(prixCalcule);
  };

  // Calculer l'économie réalisée par rapport au paiement individuel
  const calculerEconomiesPourAbonnement = (abonnement: Abonnement): number => {
    if (!terrainSelectionne) return 0;

    const prixBase = selectedOption?.price || terrainSelectionne.prix_heure;
    const dureeFinalSeance = selectedOption?.duration || dureeSeance;
    
    // Prix si on payait chaque séance individuellement
    const prixSeance = prixBase * dureeFinalSeance;
    const seancesParMois = nbSeances * 4;
    const nombreMois = abonnement.duree_jours / 30;
    const prixSansAbonnement = prixSeance * seancesParMois * nombreMois;
    
    // Prix avec abonnement
    const prixAvecAbonnement = calculerPrixPourAbonnement(abonnement);
    
    // L'économie est la différence
    return Math.max(0, Math.round(prixSansAbonnement - prixAvecAbonnement));
  };

  // Fonction pour vérifier si on peut souscrire
  const peutSouscrire = (): boolean => {
    return !!(
      terrainSelectionne && 
      abonnementSelectionne && 
      selectedOption && 
      !traitement
    );
  };

  const gererSouscription = async () => {
    if (!terrainSelectionne || !abonnementSelectionne || !selectedOption) {
      toast.error('Veuillez sélectionner toutes les options requises');
      return;
    }

    // Vérifier les conflits de créneaux si nécessaire
    const conflits = creneauxSelectionnes.some(creneau => {
      const cleCreneau = `${creneau.jour}-${creneau.heure}`;
      const creneauxOccupes = creneauxDisponibles[cleCreneau] || [];
      return creneauxOccupes.length > 0;
    });

    if (conflits) {
      toast.error('Certains créneaux sélectionnés ne sont pas disponibles. Veuillez modifier votre sélection.');
      return;
    }

    setTraitement(true);

    try {
      const abonnementData = {
        terrain_id: terrainSelectionne.id,
        type_abonnement_id: abonnementSelectionne.id,
        duree_seance: selectedOption.duration || dureeSeance,
        nb_seances: nbSeances,
        prix_total: calculerPrixPourAbonnement(abonnementSelectionne),
        type: abonnementSelectionne.nom,
        option_terrain: selectedOption.id || null,
        // Nouvelles préférences de créneaux
        jour_prefere: jourSelectionne,
        heure_preferee: heureSelectionnee,
        preferences_flexibles: true, // Par défaut flexible
        jours_alternatifs: jourSelectionne !== null ? [jourSelectionne] : null,
        heures_alternatives: heureSelectionnee ? [heureSelectionnee] : null,
        creneaux_recurrents: creneauxSelectionnes.map(creneau => ({
          jour_semaine: creneau.jour,
          heure_debut: creneau.heure,
          duree: selectedOption.duration || dureeSeance
        }))
      };

      console.log('Données abonnement:', abonnementData);
      
      const response = await apiService.souscrireAbonnement(abonnementSelectionne.id, abonnementData);
      
      if (response.success && (response as any).redirect_to_payment) {
        // ✅ Redirection directe vers la page de paiement sans popup
        navigate('/payment', {
          state: {
            subscriptionDetails: {
              // Données de base de l'abonnement
              subscriptionId: response.data.abonnement_id,
              terrainName: response.data.terrain_nom,
              terrainAddress: response.data.terrain_adresse,
              abonnementType: response.data.type_abonnement,
              abonnementDescription: abonnementSelectionne.description,
              duration: response.data.duree_jours,
              price: response.data.prix_total,
              originalPrice: calculerPrixPourAbonnement(abonnementSelectionne) + calculerEconomiesPourAbonnement(abonnementSelectionne),
              
              // Options de terrain sélectionnées
              terrainPricePerHour: selectedOption?.price || terrainSelectionne.prix_heure,
              terrainOptionName: selectedOption?.name,
              terrainOptionDescription: selectedOption?.description,
              
              // Détails des séances
              sessionsPerWeek: response.data.preferences.nb_seances_semaine || nbSeances,
              sessionDuration: response.data.preferences.duree_seance || dureeSeance,
              totalSessions: (response.data.preferences.nb_seances_semaine || nbSeances) * 4 * (response.data.duree_jours / 30),
              
              // Dates formatées
              startDate: format(new Date(response.data.date_debut), 'dd/MM/yyyy', { locale: fr }),
              endDate: format(new Date(response.data.date_fin), 'dd/MM/yyyy', { locale: fr }),
              
              // Économies calculées
              savings: calculerEconomiesPourAbonnement(abonnementSelectionne),
              
              // Préférences depuis le backend
              preferences: {
                jourPrefere: response.data.preferences.jour_prefere ? nomsJours[response.data.preferences.jour_prefere] : null,
                heurePrefere: response.data.preferences.heure_preferee,
                preferencesFlexibles: response.data.preferences.preferences_flexibles,
                joursAlternatifs: [],
                heuresAlternatives: []
              },
              
              // Créneaux récurrents sélectionnés
              creneauxRecurrents: creneauxSelectionnes.map(creneau => ({
                jour: nomsJours[creneau.jour],
                heure: creneau.heure
              })),
              
              // ✅ NOUVELLES OPTIONS DE PAIEMENT
              paymentOptions: response.data.payment_options,
              statut: response.data.statut,
              instructions: response.data.instructions
            }
          }
        });
      } else if (response.success) {
        // Cas où la souscription est réussie mais pas de redirection (ne devrait pas arriver)
        navigate('/payment', {
          state: {
            subscriptionDetails: {
              subscriptionId: response.data.abonnement_id,
              terrainName: response.data.terrain_nom,
              terrainAddress: response.data.terrain_adresse,
              abonnementType: response.data.type_abonnement,
              abonnementDescription: abonnementSelectionne.description,
              duration: response.data.duree_jours,
              price: response.data.prix_total,
              originalPrice: calculerPrixPourAbonnement(abonnementSelectionne) + calculerEconomiesPourAbonnement(abonnementSelectionne),
              terrainPricePerHour: selectedOption?.price || terrainSelectionne.prix_heure,
              terrainOptionName: selectedOption?.name,
              terrainOptionDescription: selectedOption?.description,
              sessionsPerWeek: response.data.preferences.nb_seances_semaine || nbSeances,
              sessionDuration: response.data.preferences.duree_seance || dureeSeance,
              totalSessions: (response.data.preferences.nb_seances_semaine || nbSeances) * 4 * (response.data.duree_jours / 30),
              startDate: format(new Date(response.data.date_debut), 'dd/MM/yyyy', { locale: fr }),
              endDate: format(new Date(response.data.date_fin), 'dd/MM/yyyy', { locale: fr }),
              savings: calculerEconomiesPourAbonnement(abonnementSelectionne),
              preferences: {
                jourPrefere: response.data.preferences.jour_prefere ? nomsJours[response.data.preferences.jour_prefere] : null,
                heurePrefere: response.data.preferences.heure_preferee,
                preferencesFlexibles: response.data.preferences.preferences_flexibles,
                joursAlternatifs: [],
                heuresAlternatives: []
              },
              creneauxRecurrents: creneauxSelectionnes.map(creneau => ({
                jour: nomsJours[creneau.jour],
                heure: creneau.heure
              })),
              paymentOptions: response.data.payment_options,
              statut: response.data.statut,
              instructions: response.data.instructions
            }
          }
        });
      } else {
        // Gestion des erreurs spécifiques
        if (response.message?.includes('disponible')) {
          toast.error('❌ ' + response.message + '\nVeuillez choisir un autre créneau ou activer les préférences flexibles.');
        } else {
          toast.error(response.message || 'Erreur lors de la souscription');
        }
      }
    } catch (error: any) {
      console.error('Erreur lors de la souscription:', error);
      toast.error(error.message || 'Une erreur est survenue');
    } finally {
      setTraitement(false);
    }
  };

  // Gestion de la sélection d'option de terrain
  const handleOptionSelect = (option: TerrainOption | null) => {
    setSelectedOption(option);
    if (option) {
      setDureeSeance(option.duration || dureeSeance);
    }
  };

  // Fonction pour ajouter un créneau récurrent
  const ajouterCreneau = () => {
    if (jourSelectionne !== null && heureSelectionnee && terrainSelectionne) {
      const nouveauCreneau = {
        jour: jourSelectionne,
        heure: heureSelectionnee
      };
      
      // Vérifier si le créneau n'existe pas déjà
      const existe = creneauxSelectionnes.some(c => c.jour === jourSelectionne && c.heure === heureSelectionnee);
      if (!existe) {
        setCreneauxSelectionnes([...creneauxSelectionnes, nouveauCreneau]);
        setJourSelectionne(null);
        setHeureSelectionnee('');
        
        // Vérifier la disponibilité du nouveau créneau
        verifierDisponibiliteCreneau(nouveauCreneau);
      }
    }
  };

  // Fonction pour supprimer un créneau
  const supprimerCreneau = (index: number) => {
    const nouveauxCreneaux = creneauxSelectionnes.filter((_, i) => i !== index);
    setCreneauxSelectionnes(nouveauxCreneaux);
  };

  // Fonction pour vérifier la disponibilité d'un créneau sur les 4 prochaines semaines
  const verifierDisponibiliteCreneau = async (creneau: {jour: number, heure: string}) => {
    if (!terrainSelectionne) return;

    setVerificationDisponibilite(true);
    const creneauxOccupes: string[] = [];

    try {
      // Vérifier les 4 prochaines semaines (durée d'un mois d'abonnement)
      for (let semaine = 0; semaine < 4; semaine++) {
        const date = new Date();
        date.setDate(date.getDate() + (semaine * 7) + (creneau.jour - date.getDay()));
        
        const dateStr = format(date, 'yyyy-MM-dd');
        const response = await apiService.checkAvailability(
          terrainSelectionne.id, 
          dateStr, 
          selectedOption?.duration || dureeSeance
        );

        if (response.success && Array.isArray(response.data)) {
          const disponible = response.data.includes(creneau.heure.split(':')[0]);
          if (!disponible) {
            creneauxOccupes.push(`${format(date, 'dd/MM')} à ${creneau.heure}`);
          }
        }
      }

      const cleCreneau = `${creneau.jour}-${creneau.heure}`;
      setCreneauxDisponibles(prev => ({
        ...prev,
        [cleCreneau]: creneauxOccupes
      }));

    } catch (error) {
      console.error('Erreur lors de la vérification de disponibilité:', error);
      toast.error('Erreur lors de la vérification de disponibilité');
    } finally {
      setVerificationDisponibilite(false);
    }
  };

  // Noms des jours
  const nomsJours = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

  // Heures disponibles (8h à 23h)
  const heuresDisponibles = Array.from({length: 16}, (_, i) => {
    const heure = i + 8;
    return `${heure.toString().padStart(2, '0')}:00`;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Abonnements</h1>
          <p className="text-gray-600">
            Choisissez l'abonnement qui correspond le mieux à vos besoins de jeu
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Colonne principale - Sélection et abonnements */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Sélection du terrain */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Choisir un terrain</h2>
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-32 bg-gray-200 rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {terrains.map((terrain) => (
                    <div
                      key={terrain.id}
                      onClick={() => setTerrainSelectionne(terrain)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        terrainSelectionne?.id === terrain.id
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 hover:border-indigo-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900">{terrain.nom}</h3>
                          <p className="text-sm text-gray-600 mt-1">{terrain.adresse}</p>
                                                     <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                             <span className="flex items-center gap-1">
                               <MapPin className="w-4 h-4" />
                               {terrain.adresse}
                             </span>
                             <span className="flex items-center gap-1">
                               <Users className="w-4 h-4" />
                               {terrain.capacite ? `${terrain.capacite} joueurs` : 'Football'}
                             </span>
                           </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sélection des options de terrain */}
            {terrainSelectionne && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">Options du terrain</h3>
                                                 <TerrainOptionSelector
                  terrainData={terrainSelectionne}
                  onOptionSelect={handleOptionSelect}
                />
              </div>
            )}

            {/* Configuration des préférences */}
            {terrainSelectionne && selectedOption && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">Vos préférences</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre de séances par semaine
                    </label>
                    <select
                      value={nbSeances}
                      onChange={(e) => setNbSeances(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value={1}>1 séance</option>
                      <option value={2}>2 séances</option>
                      <option value={3}>3 séances</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Durée par séance
                    </label>
                    <select
                      value={dureeSeance}
                      onChange={(e) => setDureeSeance(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      disabled={selectedOption !== null}
                    >
                      <option value={1}>1 heure</option>
                      <option value={1.5}>1h30</option>
                      <option value={2}>2 heures</option>
                    </select>
                    {selectedOption && (
                      <p className="text-xs text-gray-500 mt-1">
                        Durée fixée par l'option sélectionnée: {selectedOption.duration}h
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Jour préféré de la semaine
                    </label>
                    <select
                      value={jourSelectionne || ''}
                      onChange={(e) => setJourSelectionne(e.target.value ? Number(e.target.value) : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">Choisir un jour</option>
                      <option value={1}>Lundi</option>
                      <option value={2}>Mardi</option>
                      <option value={3}>Mercredi</option>
                      <option value={4}>Jeudi</option>
                      <option value={5}>Vendredi</option>
                      <option value={6}>Samedi</option>
                      <option value={0}>Dimanche</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Heure préférée
                    </label>
                    <select
                      value={heureSelectionnee}
                      onChange={(e) => setHeureSelectionnee(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">Choisir une heure</option>
                      <option value="08:00">08h00</option>
                      <option value="09:00">09h00</option>
                      <option value="10:00">10h00</option>
                      <option value="11:00">11h00</option>
                      <option value="12:00">12h00</option>
                      <option value="13:00">13h00</option>
                      <option value="14:00">14h00</option>
                      <option value="15:00">15h00</option>
                      <option value="16:00">16h00</option>
                      <option value="17:00">17h00</option>
                      <option value="18:00">18h00</option>
                      <option value="19:00">19h00</option>
                      <option value="20:00">20h00</option>
                      <option value="21:00">21h00</option>
                      <option value="22:00">22h00</option>
                      <option value="23:00">23h00</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Liste des abonnements */}
            {terrainSelectionne && selectedOption && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold">Choisir votre abonnement</h3>
                  {fideliteData?.reduction_pourcentage > 0 && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                      <Gift className="w-4 h-4" />
                      -{fideliteData.reduction_pourcentage}% fidélité appliquée
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {abonnements.map((abonnement) => {
                    const prixCalcule = calculerPrixPourAbonnement(abonnement);
                    const prixOriginal = calculerPrixPourAbonnement({...abonnement, prix: abonnement.prix});
                    const reduction = fideliteData?.reduction_pourcentage > 0 ? prixOriginal - prixCalcule : 0;
                    
                    return (
                      <div
                        key={abonnement.id}
                        onClick={() => setAbonnementSelectionne(abonnement)}
                        className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
                          abonnementSelectionne?.id === abonnement.id
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-gray-200 hover:border-indigo-300'
                        }`}
                      >
                        <div className="text-center">
                          <h4 className="text-lg font-semibold text-gray-900 mb-2">
                            {abonnement.nom}
                          </h4>
                          <p className="text-sm text-gray-600 mb-4">{abonnement.description}</p>
                          
                          <div className="mb-4">
                            {reduction > 0 && (
                              <div className="text-sm text-gray-500 line-through mb-1">
                                {prixOriginal.toLocaleString()} FCFA
                              </div>
                            )}
                            <div className="text-2xl font-bold text-indigo-600">
                              {prixCalcule.toLocaleString()} FCFA
                            </div>
                            {reduction > 0 && (
                              <div className="text-sm text-green-600 font-medium">
                                Économie: {reduction.toLocaleString()} FCFA
                              </div>
                            )}
                          </div>

                          <ul className="text-sm text-gray-600 space-y-1 mb-4">
                            {abonnement.avantages.map((avantage: string, index: number) => (
                              <li key={index} className="flex items-center justify-center gap-2">
                                <span className="w-1 h-1 bg-indigo-600 rounded-full"></span>
                                {avantage}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Actions */}
            {abonnementSelectionne && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={gererSouscription}
                    disabled={!peutSouscrire() || traitement}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-colors"
                  >
                    {traitement ? 'Traitement...' : 'Souscrire maintenant'}
                  </button>
                  
                  <button
                    onClick={() => setShowRecurringModal(true)}
                    className="flex-1 bg-white border border-indigo-600 text-indigo-600 hover:bg-indigo-50 font-medium py-3 px-6 rounded-lg transition-colors"
                  >
                    Créneaux récurrents
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Fidélité et résumé */}
          <div className="space-y-6">
            
            {/* Carte de fidélité */}
            {terrainSelectionne && (
              <FideliteCard
                fideliteData={fideliteData}
                terrainNom={terrainSelectionne.nom}
                isLoading={fideliteLoading}
              />
            )}

            {/* Résumé de la sélection */}
            {terrainSelectionne && abonnementSelectionne && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">Résumé</h3>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Terrain :</span>
                    <span className="font-medium">{terrainSelectionne.nom}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Abonnement :</span>
                    <span className="font-medium">{abonnementSelectionne.nom}</span>
                  </div>
                  
                  {selectedOption && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Option :</span>
                      <span className="font-medium">{selectedOption.name}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Séances/semaine :</span>
                    <span className="font-medium">{nbSeances}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Durée/séance :</span>
                    <span className="font-medium">{selectedOption?.duration || dureeSeance}h</span>
                  </div>

                  {fideliteData?.reduction_pourcentage > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Réduction fidélité :</span>
                      <span className="font-medium">-{fideliteData.reduction_pourcentage}%</span>
                    </div>
                  )}
                  
                  <div className="border-t pt-3">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total :</span>
                      <span className="text-indigo-600">
                        {calculerPrixPourAbonnement(abonnementSelectionne).toLocaleString()} FCFA
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal pour créneaux récurrents */}
                 {showRecurringModal && terrainSelectionne && abonnementSelectionne && (
           <RecurringSubscriptionModal
             isOpen={showRecurringModal}
             onClose={() => setShowRecurringModal(false)}
             terrainId={terrainSelectionne.id}
             terrainNom={terrainSelectionne.nom}
             prixHeure={selectedOption?.price || terrainSelectionne?.prix_heure || 0}
             selectedOption={selectedOption}
             onSuccess={() => {
               setShowRecurringModal(false);
               fetchAbonnements();
             }}
           />
         )}
      </div>
    </div>
  );
};

export default AbonnementsPage; 