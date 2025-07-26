import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Users, Zap, CreditCard, Clock, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import ReservationModal from './components/ReservationModal';
import ReactDOM from 'react-dom';
import apiService from '../services/api';

interface Terrain {
  id: number;
  nom: string;
  adresse: string;
  description: string;
  prix_heure: number;
  capacite: number;
  surface: number;
  latitude: number;
  longitude: number;
  est_actif: boolean;
  horaires_ouverture: string;
  horaires_fermeture: string;
  equipements: string[];
  images: string[];
  note_moyenne?: number;
  nombre_avis?: number;
}

interface Creneau {
  heure: string;
  disponible: boolean;
  prix: number;
}

interface Abonnement {
  id: number;
  nom: string;
  description: string;
  prix: number;
  duree_jours: number;
  avantages: string[];
}

const TerrainInfoPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [terrain, setTerrain] = useState<Terrain | null>(null);
  const [creneaux, setCreneaux] = useState<Creneau[]>([]);
  const [abonnements, setAbonnements] = useState<Abonnement[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedCreneaux, setSelectedCreneaux] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);

  useEffect(() => {
    if (isReservationModalOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
  }, [isReservationModalOpen]);

  useEffect(() => {
    loadTerrainInfo();
    loadAbonnements();
  }, [id]);

  useEffect(() => {
    if (terrain) loadCreneaux();
  }, [selectedDate, terrain]);

  const loadTerrainInfo = async () => {
    try {
      // Ajouter cache-busting pour s'assurer d'avoir les données fraîches
      const response = await fetch(`https://ad07ffba09ee.ngrok-free.app/api/terrains/${id}?_=${Date.now()}`);
      const data = await response.json();
      if (data.success) {
        console.log('Terrain data loaded:', data.data); // Debug
        setTerrain(data.data);
      } else toast.error('Terrain non trouvé');
    } catch {
      toast.error('Erreur lors du chargement du terrain');
    }
  };

  const loadCreneaux = async () => {
    if (!terrain || !id) return;
    try {
      const response = await fetch(`https://ad07ffba09ee.ngrok-free.app/api/terrains/check-availability?terrain_id=${id}&date=${selectedDate}&duree_heures=1`);
      const data = await response.json();
      if (data.success) {
        // Obtenir l'heure actuelle complète
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinutes = now.getMinutes();
        const currentDate = now.toISOString().split('T')[0];
        
        // Toutes les heures possibles
        const toutesHeures = [
          '08', '09', '10', '11', '12', '13', '14', '15', '16', '17',
          '18', '19', '20', '21', '22', '23', '00', '01', '02', '03'
        ];
        
        // Filtrer les heures selon la date et l'heure actuelle
        let heuresDisponibles = toutesHeures;
        
        // Si c'est aujourd'hui, filtrer les heures passées
        if (selectedDate === currentDate) {
          heuresDisponibles = toutesHeures.filter(heure => {
            const heureInt = parseInt(heure);
            
            // Logique améliorée pour filtrer les heures passées
            if (heureInt < currentHour) {
              return false; // Heure déjà passée
            } else if (heureInt === currentHour) {
              // Si on est dans l'heure actuelle, vérifier les minutes
              // On permet la réservation seulement si on est dans les 15 premières minutes
              return currentMinutes < 15;
            } else {
              return true; // Heure future
            }
          });
        }
        
        setCreneaux(heuresDisponibles.map(h => ({
          heure: `${h}:00`,
          disponible: (data.data?.creneaux_disponibles || []).includes(h),
          prix: terrain.prix_heure
        })));
      } else toast.error(data.message || 'Erreur chargement créneaux');
    } catch {
      toast.error('Impossible de charger les créneaux');
    }
  };

  const loadAbonnements = async () => {
    try {
      const response = await apiService.getAbonnements();
      if (response.success && response.data) {
        setAbonnements(response.data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des abonnements:', error);
    } finally { 
      setLoading(false); 
    }
  };

  const toggleCreneau = (heure: string) => {
    setSelectedCreneaux(prev => prev.includes(heure) ? prev.filter(h => h !== heure) : [...prev, heure]);
  };

  const calculerTotal = () => selectedCreneaux.length * (terrain?.prix_heure ?? 0);

  const procederReservation = () => {
    if (selectedCreneaux.length === 0) {
      toast.error('Veuillez sélectionner au moins un créneau');
      return;
    }
    const params = new URLSearchParams({
      terrain_id: id!,
      date: selectedDate,
      creneaux: selectedCreneaux.join(','),
      montant: calculerTotal().toString(),
      prix_heure: (terrain?.prix_heure ?? 0).toString(),
      terrain_nom: terrain?.nom ?? ''
    });
    navigate(`/reservation?${params.toString()}`);
  };

  // Calculer le prix pour un abonnement spécifique selon le terrain actuel
  const calculerPrixAbonnement = (abonnement: Abonnement): number => {
    if (!terrain?.prix_heure) return 0;

    const prixBase = terrain.prix_heure;
    const dureeSeanceDefaut = 1; // 1h par défaut
    const nbSeancesDefaut = 2; // 2 séances/semaine par défaut
    
    // Calcul basé sur l'usage standard
    const prixUneSeance = prixBase * dureeSeanceDefaut;
    const nombreSeancesParMois = nbSeancesDefaut * 4; // 4 semaines par mois
    const nombreMois = abonnement.duree_jours / 30;
    
    // Prix total sans réduction
    const prixTotalSansReduction = prixUneSeance * nombreSeancesParMois * nombreMois;
    
    // Appliquer les réductions selon le type d'abonnement
    let tauxReduction = 0;
    const nomAbonnement = abonnement.nom.toLowerCase();
    
    if (nomAbonnement.includes('mensuel')) {
      tauxReduction = 0; // Pas de réduction pour mensuel
    } else if (nomAbonnement.includes('trimestriel')) {
      tauxReduction = 0.15; // 15% de réduction
    } else if (nomAbonnement.includes('annuel')) {
      tauxReduction = 0.25; // 25% de réduction
    }
    
    const prixAvecReduction = prixTotalSansReduction * (1 - tauxReduction);
    return Math.round(prixAvecReduction);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Chargement des informations...</p>
      </div>
    </div>
  );

  if (!terrain) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800">Terrain non trouvé</h2>
        <button onClick={() => navigate(-1)} className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">Retour</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-gray-800">
            <ArrowLeft className="w-5 h-5" /> Retour
          </button>
          <h1 className="text-2xl font-bold text-gray-800">{terrain.nom}</h1>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image principale */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <img src={terrain.images?.[0] || '/terrain-foot.jpg'} alt={terrain.nom} className="w-full h-64 object-cover" />
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-800">{terrain.nom}</h2>
                  <div className="flex items-center gap-2">
                    {terrain.note_moyenne && (
                      <div className="flex items-center gap-1">
                        <Star className="w-5 h-5 text-yellow-500 fill-current" />
                        <span className="font-medium">{terrain.note_moyenne}</span>
                        <span className="text-gray-500">({terrain.nombre_avis})</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-gray-600 mb-4">
                  <MapPin className="w-5 h-5" />
                  <span>{terrain.adresse}</span>
                </div>
                <p className="text-gray-700 mb-6">{terrain.description}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <CreditCard className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                    <div className="font-bold text-lg">{terrain.prix_heure.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">FCFA/heure</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <Users className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                    <div className="font-bold text-lg">{terrain.capacite}</div>
                    <div className="text-sm text-gray-600">Joueurs max</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <Zap className="w-6 h-6 text-green-500 mx-auto mb-2" />
                    <div className="font-bold text-lg">{terrain.surface}</div>
                    <div className="text-sm text-gray-600">m²</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <Clock className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                    <div className="font-bold text-lg">8h-3h</div>
                    <div className="text-sm text-gray-600">Horaires</div>
                  </div>
                </div>
                {/* Équipements */}
                <div>
                  <h3 className="font-bold text-lg mb-3">Équipements disponibles</h3>
                  <div className="flex flex-wrap gap-2">
                    {terrain.equipements?.map((equipement, i) => (
                      <span key={i} className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">{equipement}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            {/* Bouton réservation */}
            <div className="mt-8">
              <button
                onClick={() => setIsReservationModalOpen(true)}
                className="w-full font-semibold text-lg py-4 rounded-lg shadow-lg transition-all bg-orange-600 hover:bg-orange-700 text-white hover:shadow-2xl"
              >
                Choisir un créneau
              </button>
            </div>
            {/* Modale de réservation via portal */}
            {isReservationModalOpen && terrain && ReactDOM.createPortal(
              <>
                <div className="fixed inset-0 bg-black bg-opacity-70 z-[9999]" />
                <div className="fixed inset-0 flex items-center justify-center z-[10000]">
                  <ReservationModal terrain={terrain} onClose={() => setIsReservationModalOpen(false)} />
                </div>
              </>,
              document.body
            )}
            {/* Créneaux de réservation */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Créneaux disponibles</h3>
                <div className="flex gap-4">
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 mb-6">
                {creneaux.map((creneau) => (
                  <button
                    key={creneau.heure}
                    onClick={() => creneau.disponible && toggleCreneau(creneau.heure)}
                    disabled={!creneau.disponible}
                    className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                      !creneau.disponible
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : selectedCreneaux.includes(creneau.heure)
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-orange-100'
                    }`}
                  >
                    {creneau.heure}
                  </button>
                ))}
              </div>
              {selectedCreneaux.length > 0 && (
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="font-medium">Créneaux sélectionnés: {selectedCreneaux.length}</p>
                      <p className="text-sm text-gray-600">{selectedCreneaux.sort().join(', ')}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-orange-600">{calculerTotal().toLocaleString()} FCFA</div>
                    </div>
                  </div>
                  <button
                    onClick={procederReservation}
                    className="w-full bg-orange-500 text-white py-3 rounded-lg font-medium hover:bg-orange-600 transition-colors"
                  >
                    Procéder à la réservation
                  </button>
                </div>
              )}
            </div>
          </div>
          {/* Sidebar abonnements */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold mb-4">Abonnements</h3>
              <p className="text-gray-600 mb-6">Économisez avec nos abonnements et bénéficiez d'avantages exclusifs !</p>
              <div className="space-y-4">
                {abonnements.map((abonnement) => (
                  <div key={abonnement.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold">{abonnement.nom}</h4>
                      <div className="text-right">
                        <div className="font-bold text-orange-600">
                          {calculerPrixAbonnement(abonnement).toLocaleString()} FCFA
                        </div>
                        <div className="text-sm text-gray-600">{abonnement.duree_jours} jours</div>
                        <div className="text-xs text-gray-500 mt-1">
                          Basé sur {terrain?.prix_heure?.toLocaleString()} FCFA/h × 2 séances/sem
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{abonnement.description}</p>
                    <div className="space-y-1 mb-4">
                      {abonnement.avantages.map((avantage, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <span className="text-green-500">✓</span>
                          <span>{avantage}</span>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => navigate(`/users/abonnements/${id}`, {
                        state: {
                          selectedTerrain: terrain,
                          preselectedAbonnement: abonnement
                        }
                      })}
                      className="w-full bg-green-500 text-white py-2 rounded-lg font-medium hover:bg-green-600 transition-colors"
                    >
                      Souscrire
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-orange-50 rounded-lg p-6">
              <h4 className="font-bold text-orange-800 mb-3">💡 Conseil</h4>
              <p className="text-orange-700 text-sm">Les créneaux de 8h à 12h et de 16h à 20h sont les plus demandés. Réservez à l'avance ou souscrivez un abonnement pour garantir votre place !</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TerrainInfoPage; 