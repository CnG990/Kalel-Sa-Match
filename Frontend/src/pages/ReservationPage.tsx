import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, Euro, CreditCard, ArrowLeft } from 'lucide-react';
import apiService from '../services/api';
import toast from 'react-hot-toast';
import TerrainOptionSelector from '../components/TerrainOptionSelector';

interface Terrain {
  id: number;
  nom: string;
  adresse: string;
  prix_heure: number;
  description?: string;
  capacite: number;
  image_principale?: string;
}

interface TerrainOption {
  id: string;
  name: string;
  price: number;
  capacity: number;
  duration?: number;
  description: string;
  allowedDays?: number[];
  restrictions?: string[];
  allowedHours?: { start: number; end: number };
}

const ReservationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // États pour les données dynamiques
  const [terrain, setTerrain] = useState<Terrain | null>(null);
  const [loadingTerrain, setLoadingTerrain] = useState(true);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  
  // États du formulaire
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [duration, setDuration] = useState('1');
  const [paymentMethod, setPaymentMethod] = useState('mobile_money');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // ✅ AJOUT : Support des options terrain avec contraintes
  const [selectedOption, setSelectedOption] = useState<TerrainOption | null>(null);

  // ✅ VALIDATION CONTRAINTES : Fonction pour valider les contraintes d'option
  const validateOptionConstraints = (date: string, time: string): string | null => {
    if (!selectedOption) return null;
    
    const selectedDate = new Date(date);
    const dayOfWeek = selectedDate.getDay();
    const selectedHour = parseInt(time);

    // Vérifier les contraintes de jour
    if (selectedOption.allowedDays && !selectedOption.allowedDays.includes(dayOfWeek)) {
      const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
      const allowedDayNames = selectedOption.allowedDays.map(d => dayNames[d]).join(', ');
      return `Cette option n'est disponible que : ${allowedDayNames}`;
    }

    // Vérifier les contraintes d'heure
    if (selectedOption.allowedHours) {
      const { start, end } = selectedOption.allowedHours;
      let isValidHour = false;

      if (start > end) {
        // Créneau traverse minuit (ex: 16h-6h)
        isValidHour = selectedHour >= start || selectedHour <= end;
      } else {
        // Créneau normal (ex: 8h-15h)
        isValidHour = selectedHour >= start && selectedHour < end;
      }

      if (!isValidHour) {
        if (start > end) {
          return `Cette option n'est disponible que de ${start}h à 6h`;
        } else {
          return `Cette option n'est disponible que de ${start}h à ${end}h`;
        }
      }
    }

    return null; // Pas d'erreur
  };

  // ✅ FILTRAGE CRÉNEAUX : Filtrer les créneaux selon les contraintes
  const getFilteredSlots = () => {
    if (!selectedOption || !selectedDate) return availableSlots;
    
    return availableSlots.filter(slot => {
      const error = validateOptionConstraints(selectedDate, slot);
      return error === null;
    });
  };

  const filteredSlots = getFilteredSlots();

  // ✅ CALCUL PRIX AVEC OPTION TERRAIN
  const calculatePrice = () => {
    if (selectedOption) {
      const finalDuration = selectedOption.duration || parseFloat(duration);
      return selectedOption.price * (parseFloat(duration) / finalDuration);
    }
    return terrain ? terrain.prix_heure * parseFloat(duration) : 0;
  };

  // Durées disponibles (basées sur l'option terrain ou terrain de base)
  const getDurations = () => {
    if (!terrain) return [];
    
    if (selectedOption) {
      // Si une option est sélectionnée, utiliser sa durée spécifique
      const optionDuration = selectedOption.duration || 1;
      return [
        { value: optionDuration.toString(), label: `${optionDuration} heure${optionDuration > 1 ? 's' : ''}`, price: selectedOption.price }
      ];
    }
    
    // Sinon, durées standards
    const basePrice = terrain.prix_heure;
    return [
      { value: '1', label: '1 heure', price: basePrice },
      { value: '2', label: '2 heures', price: basePrice * 2 },
      { value: '3', label: '3 heures', price: basePrice * 3 }
    ];
  };

  const durations = getDurations();
  const selectedDuration = durations.find(d => d.value === duration);
  const totalPrice = calculatePrice();

  // Charger les données du terrain
  useEffect(() => {
    const fetchTerrain = async () => {
      if (!id) return;
      
      try {
        setLoadingTerrain(true);
        const response = await apiService.getTerrain(id);
        
        if (response.success && response.data) {
          setTerrain(response.data);
          // Pré-remplir depuis les paramètres URL si disponibles
          const date = searchParams.get('date');
          const time = searchParams.get('time');
          if (date) setSelectedDate(date);
          if (time) setSelectedTime(time);
        } else {
          toast.error('Terrain non trouvé');
          navigate('/');
        }
      } catch (error) {
        console.error('Erreur chargement terrain:', error);
        toast.error('Erreur lors du chargement du terrain');
        navigate('/');
      } finally {
        setLoadingTerrain(false);
      }
    };

    fetchTerrain();
  }, [id, searchParams, navigate]);

  // Charger les créneaux disponibles
  useEffect(() => {
    const fetchAvailableSlots = async () => {
      if (!terrain || !selectedDate) return;

      try {
        setLoadingSlots(true);
        const response = await apiService.checkAvailability(
          terrain.id, 
          selectedDate, 
          parseInt(duration)
        );
        
        if (response.success && Array.isArray(response.data)) {
          setAvailableSlots(response.data);
        } else {
          setAvailableSlots([]);
        }
      } catch (error) {
        console.error('Erreur créneaux:', error);
        setAvailableSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchAvailableSlots();
  }, [terrain, selectedDate, duration]);

  // ✅ HANDLER OPTION : Gérer la sélection d'option terrain
  const handleOptionSelect = (option: TerrainOption) => {
    setSelectedOption(option);
    // Mettre à jour la durée si l'option la spécifie
    if (option.duration) {
      setDuration(option.duration.toString());
    }
    // Réinitialiser l'heure sélectionnée car les contraintes ont changé
    setSelectedTime('');
  };

  // Validation lors de la soumission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDate || !selectedTime) {
      toast.error('Veuillez sélectionner une date et un créneau');
      return;
    }

    // ✅ VALIDATION CONTRAINTES avant soumission
    const constraintError = validateOptionConstraints(selectedDate, selectedTime);
    if (constraintError) {
      toast.error(constraintError);
      return;
    }

    setIsProcessing(true);
    
    try {
      const reservationData = {
        terrain_id: terrain!.id,
        date_debut: `${selectedDate} ${selectedTime}:00:00`,
        duree_heures: parseFloat(duration),
        prix_total: totalPrice,
        methode_paiement: paymentMethod,
        option_terrain: selectedOption?.id || null,
        option_details: selectedOption ? {
          name: selectedOption.name,
          price: selectedOption.price,
          capacity: selectedOption.capacity,
          restrictions: selectedOption.restrictions || []
        } : null
      };

      const response = await apiService.createReservation(reservationData);
      
      if (response.success) {
        toast.success('Réservation créée avec succès !');
        navigate('/mes-reservations');
      } else {
        toast.error(response.message || 'Erreur lors de la réservation');
      }
    } catch (error: any) {
      console.error('Erreur réservation:', error);
      toast.error(error.message || 'Une erreur est survenue');
    } finally {
      setIsProcessing(false);
    }
  };

  if (loadingTerrain) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du terrain...</p>
        </div>
      </div>
    );
  }

  if (!terrain) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">Terrain non trouvé</h2>
          <button 
            onClick={() => navigate('/')}
            className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* En-tête avec retour */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Retour
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Réserver un créneau</h1>
          <p className="text-gray-600">Finalisez votre réservation pour {terrain?.nom}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Formulaire de réservation */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-6">Détails de la réservation</h2>
            
            {/* ✅ SÉLECTEUR OPTIONS TERRAIN */}
            {terrain && (
              <div className="mb-6">
                <TerrainOptionSelector
                  terrainData={terrain}
                  onOptionSelect={handleOptionSelect}
                />
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Sélection de la date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Date de réservation
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              {/* Créneaux horaires filtrés */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-2" />
                  Créneau horaire
                  {selectedOption && (
                    <span className="text-xs text-blue-600 ml-2">
                      (Filtré selon l'option sélectionnée)
                    </span>
                  )}
                </label>
                {loadingSlots ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500 mx-auto"></div>
                  </div>
                ) : filteredSlots.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {filteredSlots.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedTime(slot)}
                        className={`p-3 text-sm rounded-md border transition-colors ${
                          selectedTime === slot
                            ? 'bg-orange-500 text-white border-orange-500'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-orange-500'
                        }`}
                      >
                        {slot}:00
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    {selectedDate ? (
                      selectedOption && filteredSlots.length === 0 && availableSlots.length > 0 ? (
                        <div>
                          <p>Aucun créneau compatible avec cette option</p>
                          <p className="text-xs mt-1">
                            Contraintes : {selectedOption.restrictions?.join(', ')}
                          </p>
                        </div>
                      ) : (
                        'Aucun créneau disponible pour cette date'
                      )
                    ) : (
                      'Sélectionnez une date pour voir les créneaux'
                    )}
                  </div>
                )}
              </div>

              {/* Durée */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Durée
                </label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  disabled={selectedOption && selectedOption.duration} // Désactiver si l'option impose une durée
                >
                  {durations.map((d) => (
                    <option key={d.value} value={d.value}>
                      {d.label} - {d.price.toLocaleString()} FCFA
                    </option>
                  ))}
                </select>
                {selectedOption && selectedOption.duration && (
                  <p className="text-xs text-blue-600 mt-1">
                    Durée fixée par l'option sélectionnée
                  </p>
                )}
              </div>

              {/* Méthode de paiement */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <CreditCard className="w-4 h-4 inline mr-2" />
                  Méthode de paiement
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="mobile_money">Mobile Money</option>
                  <option value="carte_bancaire">Carte bancaire</option>
                  <option value="especes">Espèces</option>
                </select>
              </div>

              {/* Bouton de soumission */}
              <button
                type="submit"
                disabled={isProcessing || !selectedDate || !selectedTime}
                className={`w-full py-3 px-4 rounded-md font-semibold transition-colors ${
                  isProcessing || !selectedDate || !selectedTime
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-orange-500 text-white hover:bg-orange-600'
                }`}
              >
                {isProcessing ? 'Traitement...' : `Réserver - ${totalPrice.toLocaleString()} FCFA`}
              </button>
            </form>
          </div>

          {/* Récapitulatif */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-6">Récapitulatif</h2>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <MapPin className="w-5 h-5 text-gray-400 mt-1 mr-3" />
                <div>
                  <p className="font-semibold">{terrain?.nom}</p>
                  <p className="text-gray-600 text-sm">{terrain?.adresse}</p>
                </div>
              </div>

              {selectedOption && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-2">Option sélectionnée</h3>
                  <p className="text-blue-700">{selectedOption.name}</p>
                  <p className="text-blue-600 text-sm">{selectedOption.description}</p>
                  {selectedOption.restrictions && selectedOption.restrictions.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-blue-600 font-semibold">Restrictions :</p>
                      <ul className="text-xs text-blue-600">
                        {selectedOption.restrictions.map((restriction, index) => (
                          <li key={index}>• {restriction}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {selectedDate && (
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="font-semibold">Date</p>
                    <p className="text-gray-600">
                      {new Date(selectedDate).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              )}

              {selectedTime && (
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="font-semibold">Heure</p>
                    <p className="text-gray-600">{selectedTime}:00</p>
                  </div>
                </div>
              )}

              <div className="flex items-center">
                <Euro className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="font-semibold">Prix total</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {totalPrice.toLocaleString()} FCFA
                  </p>
                  {selectedOption && selectedOption.price !== terrain?.prix_heure && (
                    <p className="text-xs text-gray-500">
                      (Prix spécial pour cette option)
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReservationPage; 

