import React, { useState, useEffect } from 'react';
import apiService from '../../services/api';
import RefundModal from '../../components/RefundModal';
import { 
  Calendar, 
  Clock, 
  User, 
  MapPin, 
  DollarSign,
  CheckCircle,
  XCircle,
  AlertCircle,
  Banknote
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Reservation {
  id: number;
  date_debut: string;
  date_fin: string;
  statut: string;
  prix_total: number;
  montant_total: number;
  client: {
    nom: string;
    prenom: string;
    telephone: string;
  };
  terrain: {
    nom: string;
    adresse: string;
  };
  code_ticket?: string;
}

const ReservationsPage: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('toutes');
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [showRefundModal, setShowRefundModal] = useState(false);

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      // Utiliser la vraie API backend
      const response = await apiService.getManagerReservations();
      
      if (response.success) {
        setReservations(response.data || []);
      } else {
        console.error('Erreur API:', response.message);
        toast.error(response.message || "Impossible de charger les réservations.");
      }
    } catch (error: any) {
      console.error('Erreur lors du chargement:', error);
      
      // Gestion d'erreur plus spécifique
      if (error.message?.includes('404') || error.message?.includes('Endpoint non trouvé')) {
        toast.error("Service de réservations temporairement indisponible. Veuillez réessayer plus tard.");
      } else if (error.message?.includes('401') || error.message?.includes('Unauthenticated')) {
        toast.error("Session expirée. Veuillez vous reconnecter.");
      } else if (error.message?.includes('500')) {
        toast.error("Erreur serveur. Veuillez contacter le support technique.");
      } else {
        toast.error("Erreur lors du chargement des réservations.");
      }
    } finally {
      setLoading(false);
    }
  };

  const updateReservationStatus = async (reservationId: number, newStatus: string) => {
    try {
      // Utiliser la vraie API
      const response = await apiService.updateManagerReservationStatus(reservationId, newStatus);
      
      if (response.success) {
        setReservations(reservations.map(r => 
          r.id === reservationId ? { ...r, statut: newStatus } : r
        ));
        toast.success(response.message || `Réservation ${newStatus === 'confirmee' ? 'confirmée' : 'annulée'}.`);
      } else {
        toast.error(response.message || 'Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast.error("Erreur lors de la mise à jour.");
    }
  };

  const handleRefundRequest = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setShowRefundModal(true);
  };

  const handleRefundProcessed = () => {
    fetchReservations(); // Recharger les réservations
    setSelectedReservation(null);
    setShowRefundModal(false);
  };

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'confirmee': return 'text-green-600 bg-green-100 border-green-200';
      case 'en_attente': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'annulée': return 'text-red-600 bg-red-100 border-red-200';
      case 'terminee': return 'text-gray-600 bg-gray-100 border-gray-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getStatusIcon = (statut: string) => {
    switch (statut) {
      case 'confirmee': return <CheckCircle className="w-4 h-4" />;
      case 'en_attente': return <AlertCircle className="w-4 h-4" />;
      case 'annulée': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const filteredReservations = reservations.filter(reservation => {
    if (filter === 'toutes') return true;
    return reservation.statut === filter;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-gray-900">Réservations</h1>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow-lg">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Réservations</h1>
          <p className="text-gray-600">Gérez les réservations sur vos terrains</p>
        </div>
        <div className="flex space-x-2">
          {['toutes', 'en_attente', 'confirmee', 'terminee'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === status
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status === 'toutes' ? 'Toutes' : status.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {filteredReservations.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune réservation</h3>
          <p className="mt-1 text-sm text-gray-500">
            {filter === 'toutes' 
              ? 'Aucune réservation trouvée.' 
              : `Aucune réservation ${filter.replace('_', ' ')}.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReservations.map((reservation) => (
            <div key={reservation.id} className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {reservation.terrain.nom}
                    </h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(reservation.statut)}`}>
                      {getStatusIcon(reservation.statut)}
                      <span className="ml-1 capitalize">{reservation.statut.replace('_', ' ')}</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      <span>{reservation.client.prenom} {reservation.client.nom}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>
                        {new Date(reservation.date_debut).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                    
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>
                        {new Date(reservation.date_debut).toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })} - {new Date(reservation.date_fin).toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    
                    <div className="flex items-center">
                      <DollarSign className="w-4 h-4 mr-2" />
                      <span className="font-medium text-green-600">
                        {reservation.prix_total.toLocaleString()} CFA
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{reservation.terrain.adresse}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="ml-6 flex space-x-2">
                  {reservation.statut === 'en_attente' && (
                    <>
                      <button
                        onClick={() => updateReservationStatus(reservation.id, 'confirmee')}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                      >
                        Confirmer
                      </button>
                      <button
                        onClick={() => updateReservationStatus(reservation.id, 'annulée')}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                      >
                        Refuser
                      </button>
                    </>
                  )}
                  
                  {/* Bouton de remboursement pour réservations confirmées */}
                  {reservation.statut === 'confirmee' && (
                    <button
                      onClick={() => handleRefundRequest(reservation)}
                      className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded-lg text-sm transition-colors flex items-center space-x-1"
                      title="Traiter une demande de remboursement"
                    >
                      <Banknote className="w-4 h-4" />
                      <span>Rembourser</span>
                    </button>
                  )}
                  
                  {reservation.code_ticket && (
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-lg text-sm font-mono">
                      {reservation.code_ticket}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de remboursement */}
      {selectedReservation && (
        <RefundModal
          isOpen={showRefundModal}
          onClose={() => {
            setShowRefundModal(false);
            setSelectedReservation(null);
          }}
          reservation={{
            ...selectedReservation,
            montant_total: selectedReservation.prix_total || 0
          } as any}
          onRefundSuccess={handleRefundProcessed}
        />
      )}
    </div>
  );
};

export default ReservationsPage; 