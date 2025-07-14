import React, { useState, useEffect } from 'react';
import apiService from '../../services/api';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Reservation {
  id: number;
  date_debut: string;
  date_fin: string;
  statut: 'en_attente' | 'confirmee' | 'annulee' | 'terminee';
  montant_total: number;
  terrain: {
    id: number;
    nom: string;
    image_principale: string;
    adresse: string;
  };
}

interface ReservationCardProps {
  reservation: Reservation;
  onCancel: (reservationId: number) => Promise<void>;
}

const ReservationCard = ({ reservation, onCancel }: ReservationCardProps) => {
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const formatTime = (dateString: string) => new Date(dateString).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  const getStatusBadge = (status: string) => {
    const styles: { [key: string]: string } = {
      confirmee: "text-green-800 bg-green-100",
      en_attente: "text-yellow-800 bg-yellow-100",
      annulee: "text-red-800 bg-red-100",
      terminee: "text-gray-800 bg-gray-100",
    };
    const label = status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
    return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status] || styles.terminee}`}>{label}</span>;
  };

  const isCancellable = reservation.statut === 'confirmee' && new Date(reservation.date_debut) > new Date();

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col sm:flex-row transition-transform hover:scale-105 duration-300">
                    <img src="/terrain-foot.jpg" alt={reservation.terrain.nom} className="w-full sm:w-48 h-48 sm:h-auto object-cover" />
      <div className="p-5 flex-grow flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-1">
            <h3 className="text-xl font-bold text-gray-800">{reservation.terrain.nom}</h3>
            {getStatusBadge(reservation.statut)}
          </div>
          <p className="text-sm text-gray-500">{reservation.terrain.adresse}</p>
        </div>
        <div className="mt-4 border-t pt-4 space-y-2 text-sm text-gray-700">
          <p><strong>Date :</strong> {formatDate(reservation.date_debut)}</p>
          <p><strong>Horaire :</strong> De {formatTime(reservation.date_debut)} à {formatTime(reservation.date_fin)}</p>
          <p><strong>Montant :</strong> {reservation.montant_total.toLocaleString('fr-FR')} FCFA</p>
        </div>
        
        {isCancellable && (
          <div className="mt-4 pt-4 border-t">
            <button 
              onClick={() => onCancel(reservation.id)}
              className="w-full text-center px-4 py-2 bg-red-100 text-red-700 font-semibold rounded-lg hover:bg-red-200"
            >
              Annuler et demander un remboursement
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const ReservationsPage: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        setLoading(true);
        const response = await apiService.getMyReservations();
        if (response.success && Array.isArray(response.data)) {
          setReservations(response.data);
        } else {
          setError('Impossible de charger vos réservations.');
        }
      } catch (err) {
        setError('Une erreur est survenue lors du chargement des réservations.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchReservations();
  }, []);

  const now = new Date();
  const upcomingReservations = reservations
    .filter(r => new Date(r.date_debut) >= now && r.statut !== 'annulee' && r.statut !== 'terminee')
    .sort((a, b) => new Date(a.date_debut).getTime() - new Date(b.date_debut).getTime());

  const pastReservations = reservations
    .filter(r => new Date(r.date_debut) < now || r.statut === 'annulee' || r.statut === 'terminee')
    .sort((a, b) => new Date(b.date_debut).getTime() - new Date(a.date_debut).getTime());

  const handleCancelReservation = async (reservationId: number) => {
    if (!window.confirm("Êtes-vous sûr de vouloir annuler cette réservation ? Cette action est irréversible.")) {
      return;
    }
    
    try {
      const response = await apiService.requestRefund(reservationId);
      if (response.success) {
        setReservations(prevReservations => 
          prevReservations.map(r => 
            r.id === reservationId ? { ...r, statut: 'annulee' } : r
          )
        );
        alert("Votre demande d'annulation a été prise en compte.");
      } else {
        setError(response.message || "L'annulation a échoué.");
      }
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors de l\'annulation.');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        <p className="ml-4 text-lg text-gray-600">Chargement de vos réservations...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-6 rounded-lg text-red-800 flex items-center gap-4">
        <AlertTriangle className="w-8 h-8" />
        <div>
          <h3 className="font-bold">Erreur</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-4xl font-bold text-gray-800">Mes Réservations</h1>
      <p className="text-lg text-gray-600 mt-2 mb-8">Consultez et gérez toutes vos réservations passées et à venir.</p>
      
      <section>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">À venir</h2>
        {upcomingReservations.length > 0 ? (
          <div className="space-y-6">
            {upcomingReservations.map(res => <ReservationCard key={`upcoming-${res.id}`} reservation={res} onCancel={handleCancelReservation} />)}
          </div>
        ) : (
          <div className="bg-white p-8 rounded-lg shadow-sm text-center text-gray-500 border-2 border-dashed">
            <p className="mb-4">Vous n'avez aucune réservation à venir.</p>
            <Link to="/dashboard/map" className="inline-block px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-transform hover:scale-105">
              Explorer les terrains à proximité
            </Link>
          </div>
        )}
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Historique</h2>
        {pastReservations.length > 0 ? (
          <div className="space-y-6">
            {pastReservations.map(res => <ReservationCard key={`past-${res.id}`} reservation={res} onCancel={handleCancelReservation} />)}
          </div>
        ) : (
          <div className="bg-white p-8 rounded-lg shadow-sm text-center text-gray-500 border-2 border-dashed">
            <p>Votre historique de réservations est vide.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default ReservationsPage; 