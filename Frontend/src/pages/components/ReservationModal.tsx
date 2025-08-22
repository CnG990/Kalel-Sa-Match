import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/api';
import { Calendar, Clock, MapPin, Euro, Users, X } from 'lucide-react';
import TerrainOptionSelector from '../../components/TerrainOptionSelector';

interface TerrainOption {
  id: string;
  name: string;
  price: number;
  capacity: number;
  description: string;
  duration?: number;
  timeSlot?: string;
  allowedDays?: number[]; // Ex: [0, 1, 2, 3, 4, 5, 6] pour tous les jours
  allowedHours?: { start: number; end: number }; // Ex: { start: 8, end: 17 }
  restrictions?: string[]; // Ex: ["Pas de match de niveau 1", "Pas de match de niveau 2"]
}

interface ReservationModalProps {
  terrain: any;
  onClose: () => void;
}

const ReservationModal: React.FC<ReservationModalProps> = ({ terrain, onClose }) => {
  const { isAuthenticated, user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [duration, setDuration] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedOption, setSelectedOption] = useState<TerrainOption | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      onClose();
      navigate('/login', {
        state: {
          from: `/users/terrain/${terrain.id}`,
          message: 'Vous devez être connecté pour faire une réservation.'
        }
      });
    }
  }, [isAuthenticated, navigate, onClose, terrain.id]);

  useEffect(() => {
    if (selectedDate && isAuthenticated) {
      fetchAvailability();
    }
  }, [selectedDate, terrain.id, duration, isAuthenticated]);

  const fetchAvailability = async () => {
    setLoadingSlots(true);
    setError(null);
    try {
      const response = await apiService.checkAvailability(terrain.id, format(selectedDate!, 'yyyy-MM-dd'), duration);
      if (response.success && Array.isArray(response.data)) {
        setAvailableSlots(response.data);
      } else {
        setAvailableSlots([]);
      }
    } catch (error: any) {
      console.error("Erreur lors de la vérification des disponibilités:", error);
      if (error.message === 'Unauthenticated.') {
        onClose();
        navigate('/login', {
          state: {
            from: `/users/terrain/${terrain.id}`,
            message: 'Session expirée. Veuillez vous reconnecter.'
          }
        });
      } else {
        setError('Impossible de charger les créneaux disponibles');
      }
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const calculatePrice = () => {
    if (selectedOption) {
      const finalDuration = selectedOption.duration || duration;
      return selectedOption.price * (duration / finalDuration);
    }
    // Fallback to terrain base price - assurer que terrain.prix_heure est correct
    const basePrice = terrain.prix_heure || terrain.price || 30000; // Changé de 25000 à 30000
    return basePrice * duration;
  };

  const handleOptionSelect = (option: TerrainOption) => {
    setSelectedOption(option);
    // Update duration if the option specifies it
    if (option.duration) {
      setDuration(option.duration);
    }
  };

  const handleReservation = async () => {
    if (!selectedDate || !selectedSlot) {
      setError('Veuillez sélectionner une date et un créneau');
      return;
    }

    // Validation des contraintes d'option si une option est sélectionnée
    if (selectedOption) {
      const dayOfWeek = selectedDate.getDay();
      const selectedHour = parseInt(selectedSlot);

      // Vérifier les contraintes de jour
      if (selectedOption.allowedDays && !selectedOption.allowedDays.includes(dayOfWeek)) {
        const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
        const allowedDayNames = selectedOption.allowedDays.map(d => dayNames[d]).join(', ');
        setError(`Cette option n'est disponible que : ${allowedDayNames}`);
        return;
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
            setError(`Cette option n'est disponible que de ${start}h à 6h`);
          } else {
            setError(`Cette option n'est disponible que de ${start}h à ${end}h`);
          }
          return;
        }
      }
    }

    setIsProcessing(true);
    setError(null);

    try {
      const reservationData = {
        terrain_id: terrain.id,
        date_debut: format(selectedDate, 'yyyy-MM-dd') + ` ${selectedSlot}:00:00`,
        duree_heures: selectedOption?.duration || duration,
        prix_total: calculatePrice(),
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
        navigate('/payment', {
          state: {
            reservationDetails: {
              reservationId: response.data.id,
              terrainName: terrain.nom,
              date: format(selectedDate, 'dd/MM/yyyy', { locale: fr }),
              time: `${selectedSlot}:00`,
              duration: selectedOption?.duration || duration,
              price: calculatePrice(),
              optionName: selectedOption?.name || 'Standard',
              optionRestrictions: selectedOption?.restrictions || []
            }
          }
        });
      } else {
        setError(response.message || 'Erreur lors de la réservation');
      }
    } catch (e: any) {
      console.error("Erreur lors de la réservation:", e);
      if (e.message === 'Unauthenticated.') {
        onClose();
        navigate('/login', { 
          state: { 
            from: `/users/terrain/${terrain.id}`,
            message: 'Session expirée. Veuillez vous reconnecter.' 
          } 
        });
      } else if (e.message?.includes('Créneau non disponible')) {
        setError("Ce créneau n'est plus disponible, veuillez en choisir un autre.");
        // Rafraîchir la liste des créneaux
        if (selectedDate && isAuthenticated) {
          // Appelle la fonction de fetchAvailability
          const fetchAvailability = async () => {
            setLoadingSlots(true);
            setError(null);
            try {
              const response = await apiService.checkAvailability(terrain.id, format(selectedDate, 'yyyy-MM-dd'), duration);
              if (response.success && Array.isArray(response.data)) {
                setAvailableSlots(response.data);
              } else {
                setAvailableSlots([]);
              }
            } catch (error: any) {
              setAvailableSlots([]);
            } finally {
              setLoadingSlots(false);
            }
          };
          fetchAvailability();
        }
      } else {
        setError(e.message || "Une erreur est survenue lors de la réservation.");
      }
      await fetchAvailability();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubscription = () => {
    // Rediriger vers la page des abonnements avec l'id du terrain dans l'URL
    navigate(`/users/abonnements/${terrain.id}`, {
      state: {
        selectedTerrain: terrain,
        selectedOption: selectedOption
      }
    });
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto relative">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Réserver un créneau</h2>
          <p className="text-gray-600">{terrain.nom || terrain.name}</p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-6 h-6 text-gray-500" />
        </button>
      </div>

      <div className="p-6">
        {/* Informations du terrain */}
        <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-4">
            <img
              src={terrain.image_principale || '/terrain-foot.jpg'}
              alt={terrain.nom}
              className="w-20 h-20 rounded-lg object-cover"
            />
            <div className="flex-1">
              <h3 className="font-bold text-lg text-gray-800">{terrain.nom || terrain.name}</h3>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{terrain.adresse}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{selectedOption?.capacity || terrain.capacite} joueurs</span>
                </div>
                <div className="flex items-center gap-1">
                  <Euro className="w-4 h-4" />
                  <span className="font-semibold text-orange-600">
                    {(selectedOption?.price || terrain.prix_heure)?.toLocaleString()} FCFA/h
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sélecteur d'options de terrain */}
        <TerrainOptionSelector
          terrainData={terrain}
          onOptionSelect={handleOptionSelect}
        />

        {/* Configuration de la réservation */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Durée */}
          <div className="bg-gray-50 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <Clock className="w-4 h-4 inline mr-2" />
              Durée de réservation
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map((dur) => (
                <button
                  key={dur}
                  onClick={() => setDuration(dur)}
                  disabled={selectedOption?.duration !== undefined}
                  className={`p-3 rounded-lg border text-center font-medium transition-colors ${
                    duration === dur
                      ? 'border-orange-500 bg-orange-500 text-white'
                      : selectedOption?.duration !== undefined
                      ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'border-gray-300 bg-white hover:border-orange-300'
                  }`}
                >
                  {dur}h
                  {selectedOption?.duration === undefined && (
                    <div className="text-xs opacity-75">
                      {((selectedOption?.price || terrain.prix_heure) * dur)?.toLocaleString()} FCFA
                    </div>
                  )}
                </button>
              ))}
            </div>
            {selectedOption?.duration && (
              <div className="mt-2 text-sm text-blue-600">
                * Durée fixée par l'option sélectionnée: {selectedOption.duration}h
              </div>
            )}
          </div>

          {/* Prix total */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Résumé du prix</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Option sélectionnée :</span>
                <span className="font-medium">{selectedOption?.name || 'Standard'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Prix de base :</span>
                <span>
                  {(selectedOption?.price || terrain.prix_heure)?.toLocaleString()} FCFA
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Durée :</span>
                <span>{duration}h</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold text-lg">
                <span>Total :</span>
                <span className="text-green-600">{calculatePrice().toLocaleString()} FCFA</span>
              </div>
              {selectedOption?.description && (
                <div className="text-xs text-gray-600 mt-2">
                  {selectedOption.description}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sélection de date et créneaux */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start mt-6">
          {/* Calendrier */}
          <div className="border rounded-lg p-2 bg-gray-50 flex justify-center">
            <DayPicker
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={{ before: new Date() }}
              locale={fr}
              formatters={{
                formatCaption: (date) => format(date, 'MMMM yyyy', { locale: fr })
              }}
              className="rdp-custom"
            />
          </div>

          {/* Créneaux disponibles */}
          <div className="border rounded-lg p-4 bg-gray-50 min-h-[300px]">
            <h3 className="text-xl font-semibold mb-4 text-center text-gray-700">
              <Calendar className="w-5 h-5 inline mr-2" />
              Créneaux pour le{' '}
              <span className="font-bold text-orange-600">
                {selectedDate ? format(selectedDate, 'dd/MM/yyyy', { locale: fr }) : '...'}
              </span>
            </h3>

            {loadingSlots ? (
              <div className="flex justify-center items-center h-48">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                <span className="ml-3">Chargement des créneaux...</span>
              </div>
            ) : availableSlots.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {availableSlots.map(slot => (
                  <button
                    key={slot}
                    onClick={() => setSelectedSlot(slot)}
                    className={`p-3 rounded-lg border text-center font-semibold transition-all duration-200 ${
                      selectedSlot === slot
                        ? 'bg-orange-600 text-white border-orange-700 shadow-lg transform scale-105'
                        : 'bg-white hover:bg-orange-100 hover:border-orange-400 hover:shadow-md'
                    }`}
                  >
                    {slot}:00
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex justify-center items-center h-48">
                <div className="text-center">
                  <Clock className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Aucun créneau disponible pour cette date.</p>
                  <p className="text-sm text-gray-400 mt-1">Essayez une autre date</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Affichage de l'erreur */}
        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="font-medium">⚠️ Erreur :</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Boutons d'action */}
        <div className="flex gap-4 mt-6 pt-6 border-t">
          <button
            onClick={handleReservation}
            disabled={!selectedDate || !selectedSlot || isProcessing}
            className={`flex-1 py-4 px-6 rounded-lg font-semibold text-lg transition-all ${
              !selectedDate || !selectedSlot || isProcessing
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl'
            }`}
          >
            {isProcessing ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Traitement...</span>
              </div>
            ) : (
              `Réserver maintenant • ${calculatePrice().toLocaleString()} FCFA`
            )}
          </button>

          <button
            onClick={handleSubscription}
            className="px-6 py-4 border-2 border-green-500 text-green-600 hover:bg-green-500 hover:text-white rounded-lg font-semibold transition-all"
          >
            Abonnement
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReservationModal; 