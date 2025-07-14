import React, { useState, useEffect } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale'; // Locale française
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/api';

interface Terrain {
  id: number;
  nom: string; // Correction: utiliser nom au lieu de name
  name?: string; // Compatibilité
  prix_heure?: number;
  latitude?: number;
  longitude?: number;
  // Ajoutez d'autres champs si nécessaire
}

interface ReservationModalProps {
  terrain: Terrain;
  onClose: () => void;
}

const ReservationModal: React.FC<ReservationModalProps> = ({ terrain, onClose }) => {
  const { isAuthenticated, user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [] = useState(false);
  const navigate = useNavigate();

  // Vérifier l'authentification au chargement
  useEffect(() => {
    if (!isAuthenticated) {
      onClose();
      navigate('/login', { 
        state: { 
          from: `/users/terrain/${terrain.id}`,
          message: 'Veuillez vous connecter pour réserver un terrain' 
        } 
      });
      return;
    }
  }, [isAuthenticated, navigate, onClose, terrain.id]);

  useEffect(() => {
    if (selectedDate && isAuthenticated) {
      const fetchAvailability = async () => {
        setLoadingSlots(true);
        setError(null);
        try {
          // Note: La durée est en dur (1h), à rendre dynamique plus tard
          const response = await apiService.checkAvailability(terrain.id, format(selectedDate, 'yyyy-MM-dd'), 1);
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
      fetchAvailability();
    }
  }, [selectedDate, terrain.id, isAuthenticated, navigate, onClose]);

  const handleReservation = async () => {
    if (!isAuthenticated) {
      onClose();
      navigate('/login', { 
        state: { 
          from: `/users/terrain/${terrain.id}`,
          message: 'Veuillez vous connecter pour effectuer une réservation' 
        } 
      });
      return;
    }

    if (!selectedDate || !selectedSlot) {
      setError("Veuillez sélectionner une date et un créneau.");
      return;
    }
    setError(null);

    try {
      const reservationData = {
        terrain_id: terrain.id,
        date_debut: `${format(selectedDate, 'yyyy-MM-dd')} ${selectedSlot?.padStart(2, '0')}:00:00`,
        duree_heures: 1,
      };

      const response = await apiService.createReservation(reservationData);

      if (response.success && response.data) {
        navigate('/payment', { 
          state: { 
            reservationDetails: {
              reservationId: response.data.id,
              terrainName: terrain.nom || terrain.name,
              date: format(selectedDate, 'dd/MM/yyyy', { locale: fr }),
              time: selectedSlot,
              price: response.data.montant_total,
            }
          } 
        });
      } else {
        setError(
          response.message ||
          (response.errors ? JSON.stringify(response.errors) : "La création de la réservation a échoué.")
        );
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
              const response = await apiService.checkAvailability(terrain.id, format(selectedDate, 'yyyy-MM-dd'), 1);
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
    }
  };

  const handleSubscription = () => {
    // Rediriger vers la page des abonnements avec l'id du terrain dans l'URL
    navigate(`/users/abonnements/${terrain.id}`);
  };

  // Si pas authentifié, ne pas afficher la modal (elle va se fermer automatiquement)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto z-[1000]">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-3xl font-bold">Réserver : {terrain.nom || terrain.name}</h2>
            <p className="text-lg text-gray-500">{terrain.prix_heure?.toLocaleString()} FCFA / heure</p>
            <p className="text-sm text-blue-600">Connecté en tant que : {user?.prenom} {user?.nom}</p>
            <p className="text-gray-600 text-sm">{terrain?.adresse || 'Adresse inconnue'}</p>
          </div>
          <button onClick={onClose} className="text-3xl text-gray-500 hover:text-gray-800">&times;</button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
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
            />
          </div>

          {/* Créneaux disponibles */}
          <div className="border rounded-lg p-4 bg-gray-50 min-h-[300px]">
            <h3 className="text-xl font-semibold mb-4 text-center text-gray-700">
              Créneaux pour le <span className="font-bold text-orange-600">{selectedDate ? format(selectedDate, 'dd/MM/yyyy', { locale: fr }) : '...'}</span>
            </h3>
            {loadingSlots ? (
              <div className="flex justify-center items-center h-48">
                 <p>Chargement des créneaux...</p>
              </div>
            ) : availableSlots.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {availableSlots.map(slot => (
                  <button 
                    key={slot}
                    onClick={() => setSelectedSlot(slot)}
                    className={`p-3 rounded-lg border text-center font-semibold transition-colors duration-200 ${selectedSlot === slot ? 'bg-orange-600 text-white border-orange-700 shadow-lg' : 'bg-white hover:bg-orange-100 hover:border-orange-400'}`}
                  >
                    {slot}:00
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex justify-center items-center h-48">
                <p className="text-gray-500 text-center">Aucun créneau disponible pour cette date.</p>
              </div>
            )}
          </div>
        </div>

        {/* Affichage de l'erreur */}
        {error && (
          <div className="mt-4 text-center p-3 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Pied de la modale */}
        <div className="mt-8 pt-6 border-t">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            {/* Section abonnements */}
            <div className="flex flex-col items-start">
              <p className="text-sm text-gray-600 mb-2">💡 Réservez souvent ? Économisez avec un abonnement !</p>
              <button 
                onClick={handleSubscription}
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
              >
                🎫 S'abonner
              </button>
            </div>
            {/* Section réservation unique */}
            <div className="flex flex-col items-end">
              <p className="text-sm text-gray-600 mb-2">Ou réservez cette session uniquement :</p>
              <button 
                onClick={handleReservation}
                disabled={!selectedSlot || loadingSlots}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {loadingSlots ? 'Chargement...' : '💳 Confirmer et payer'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReservationModal; 