import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Users, Euro, Clock, X } from 'lucide-react';
import apiService from '../../services/api';

interface Abonnement {
  id: number;
  nom: string;
  prix: number;
  description?: string;
  duree_jours?: number;
  avantages?: string[];
}

interface SubscriptionModalProps {
  abonnement: Abonnement;
  onClose: () => void;
  terrainId?: number;
}

interface Terrain {
  id: number;
  nom: string;
  adresse: string;
  description: string;
  prix_heure: number;
  capacite: number;
  surface: number;
  horaires_ouverture: string;
  horaires_fermeture: string;
  contact_telephone: string;
  est_actif: boolean;
}

interface TerrainSchedule {
  jours_disponibles: string[];
  heures_ouverture: string;
  heures_fermeture: string;
  heures_indisponibles?: string[];
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ abonnement, onClose, terrainId }) => {
  const [preferences, setPreferences] = useState({
    jours: [] as string[],
    heures: [] as string[],
  });
  const [terrain, setTerrain] = useState<Terrain | null>(null);
  const [schedule, setSchedule] = useState<TerrainSchedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Jours de la semaine par défaut
  const getDefaultJours = () => [
    'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'
  ];

  // Générer les heures disponibles basées sur les horaires du terrain
  const generateHeures = (ouverture: string = '08:00', fermeture: string = '22:00', indisponibles: string[] = []) => {
    const heures = [];
    
    // Parser les heures d'ouverture et fermeture
    const [startHour] = ouverture.split(':').map(Number);
    let [endHour] = fermeture.split(':').map(Number);
    
    // Gérer le cas où le terrain ferme très tard (comme 24:00 ou après minuit)
    if (endHour <= startHour) {
      endHour = 24; // Considérer jusqu'à minuit
    }
    
    for (let i = startHour; i < endHour; i++) {
      const heure = i.toString().padStart(2, '0');
      if (!indisponibles.includes(`${heure}:00`)) {
        heures.push(heure);
      }
    }
    return heures;
  };

  // Charger les informations du terrain
  useEffect(() => {
    const fetchTerrainData = async () => {
      if (!terrainId) {
        // Utiliser les valeurs par défaut si pas de terrain spécifique
        setSchedule({
          jours_disponibles: getDefaultJours(),
          heures_ouverture: '08:00',
          heures_fermeture: '22:00',
          heures_indisponibles: []
        });
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const response = await apiService.getTerrain(terrainId.toString());
        
        if (response.success && response.data) {
          const terrainData = response.data;
          setTerrain(terrainData);
          
          // Utiliser les horaires réels du terrain
          const heureOuverture = terrainData.horaires_ouverture || '08:00';
          const heureFermeture = terrainData.horaires_fermeture || '22:00';
          
          setSchedule({
            jours_disponibles: getDefaultJours(), // Tous les jours par défaut
            heures_ouverture: heureOuverture,
            heures_fermeture: heureFermeture,
            heures_indisponibles: []
          });
        } else {
          throw new Error('Impossible de récupérer les données du terrain');
        }
      } catch (error) {
        console.error('Erreur lors du chargement du terrain:', error);
        setError('Erreur lors du chargement des informations du terrain');
        
        // Utiliser les valeurs par défaut en cas d'erreur
        setSchedule({
          jours_disponibles: getDefaultJours(),
          heures_ouverture: '08:00',
          heures_fermeture: '22:00',
          heures_indisponibles: []
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTerrainData();
  }, [terrainId]);

  const handleToggle = (type: 'jours' | 'heures', value: string) => {
    setPreferences(prev => {
      const current = prev[type];
      const newValues = current.includes(value)
        ? current.filter(item => item !== value)
        : [...current, value];
      return { ...prev, [type]: newValues };
    });
  };

  const handleSubscribe = async () => {
    if (preferences.jours.length === 0 || preferences.heures.length === 0) {
      alert('Veuillez sélectionner au moins un jour et une heure');
      return;
    }

    try {
      const response = await apiService.souscrireAbonnement(abonnement.id, {
        ...preferences,
        terrain_id: terrainId
      });
      
      if (response.success && response.data) {
        navigate('/payment', { 
          state: { 
            reservationDetails: {
              abonnementId: response.data.id,
              terrainName: terrain ? `${terrain.nom} - Abonnement ${abonnement.nom}` : `Abonnement ${abonnement.nom}`,
              date: new Date().toLocaleDateString('fr-FR'),
              time: 'N/A',
              price: abonnement.prix,
              pricePerHour: terrain?.prix_heure || 0,
              duration: abonnement.duree_jours || 30,
              preferences: preferences
            }
          } 
        });
      } else {
        setError(response.message || 'Erreur lors de la souscription');
      }
    } catch (error) {
      console.error('Erreur lors de la souscription:', error);
      setError('Erreur lors de la souscription. Veuillez réessayer.');
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-2xl">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Chargement des informations...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!schedule) {
    return null;
  }

  const jours = schedule.jours_disponibles;
  const heures = generateHeures(
    schedule.heures_ouverture, 
    schedule.heures_fermeture, 
    schedule.heures_indisponibles
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10 rounded-t-xl">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Souscrire à l'abonnement</h2>
            <p className="text-orange-600 font-semibold">{abonnement.nom}</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {/* Informations du terrain si disponible */}
          {terrain && (
            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-4 mb-6">
              <h3 className="font-bold text-lg text-gray-800 mb-3">🏟️ Terrain sélectionné</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-600" />
                    <span className="font-semibold">{terrain.nom}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{terrain.adresse}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-gray-600" />
                    <span>{terrain.capacite} joueurs max</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Euro className="w-4 h-4 text-green-600" />
                    <span className="font-semibold text-green-600">
                      {terrain.prix_heure?.toLocaleString()} FCFA/h
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-gray-600" />
                    <span>{schedule.heures_ouverture} - {schedule.heures_fermeture}</span>
                  </div>
                  {terrain.surface && (
                    <div className="text-sm text-gray-600">
                      📐 Surface: {terrain.surface} m²
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Informations de l'abonnement */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <h3 className="font-bold text-lg text-blue-800 mb-2">📋 Détails de l'abonnement</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-semibold">Prix:</span> {abonnement.prix?.toLocaleString()} FCFA
              </div>
              {abonnement.duree_jours && (
                <div>
                  <span className="font-semibold">Durée:</span> {abonnement.duree_jours} jours
                </div>
              )}
            </div>
            {abonnement.description && (
              <p className="text-sm text-blue-700 mt-2">{abonnement.description}</p>
            )}
            {abonnement.avantages && abonnement.avantages.length > 0 && (
              <div className="mt-3">
                <span className="font-semibold text-blue-800">Avantages:</span>
                <ul className="list-disc list-inside text-sm text-blue-700 mt-1">
                  {abonnement.avantages.map((avantage, index) => (
                    <li key={index}>{avantage}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Erreur */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800">{error}</p>
            </div>
          )}
          
          {/* Sélection des jours */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">
              📅 Choisissez vos jours préférés
              <span className="text-sm font-normal text-gray-600 ml-2">
                ({jours.length} jour(s) disponible(s))
              </span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {jours.map(jour => (
                <button 
                  key={jour} 
                  onClick={() => handleToggle('jours', jour)} 
                  className={`px-4 py-2 border rounded-full transition-colors ${
                    preferences.jours.includes(jour) 
                      ? 'bg-blue-600 text-white border-blue-600' 
                      : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500'
                  }`}
                >
                  {jour}
                </button>
              ))}
            </div>
          </div>

          {/* Sélection des heures */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">
              ⏰ Choisissez vos heures préférées
              <span className="text-sm font-normal text-gray-600 ml-2">
                ({schedule.heures_ouverture} - {schedule.heures_fermeture})
              </span>
            </h3>
            {heures.length > 0 ? (
              <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2">
                {heures.map(heure => (
                  <button 
                    key={heure} 
                    onClick={() => handleToggle('heures', heure)} 
                    className={`px-3 py-2 border rounded-lg transition-colors text-sm ${
                      preferences.heures.includes(heure) 
                        ? 'bg-blue-600 text-white border-blue-600' 
                        : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500'
                    }`}
                  >
                    {heure}h
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">
                Aucun créneau horaire disponible pour ce terrain
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t px-6 py-4 rounded-b-xl">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              <p>
                ✅ Sélectionné: {preferences.jours.length} jour(s), {preferences.heures.length} heure(s)
              </p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button 
                onClick={handleSubscribe} 
                disabled={preferences.jours.length === 0 || preferences.heures.length === 0}
                className={`font-semibold py-3 px-8 rounded-lg transition-colors ${
                  preferences.jours.length === 0 || preferences.heures.length === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                💳 Souscrire - {abonnement.prix?.toLocaleString()} FCFA
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionModal; 