import React, { useState, useEffect } from 'react';
import apiService, { type ReservationDTO } from '../../services/api';
import { AlertTriangle, Loader2, Share2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

type Reservation = ReservationDTO & {
  terrain: {
    id: number;
    nom: string;
    image_principale: string;
    adresse: string;
    latitude?: number | string | null;
    longitude?: number | string | null;
  };
};

interface ReservationCardProps {
  reservation: Reservation;
  onCancel: (reservationId: number) => Promise<void>;
  onPayDeposit?: (reservation: Reservation) => void;
  onPayBalance?: (reservation: Reservation) => void;
  onReportIssue?: (reservation: Reservation) => void;
}

const ReservationCard = ({ reservation, onCancel, onPayDeposit, onPayBalance, onReportIssue }: ReservationCardProps) => {
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const formatTime = (dateString: string) => new Date(dateString).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  const getStatusBadge = (status: string) => {
    const styles: { [key: string]: string } = {
      en_attente_validation: "text-orange-800 bg-orange-100",
      refusee: "text-red-800 bg-red-100",
      confirmee: "text-green-800 bg-green-100",
      acompte_paye: "text-blue-800 bg-blue-100",
      en_attente: "text-yellow-800 bg-yellow-100",
      annulee: "text-red-800 bg-red-100",
      terminee: "text-gray-800 bg-gray-100",
      en_cours: "text-purple-800 bg-purple-100",
    };
    const labels: { [key: string]: string } = {
      en_attente_validation: "En attente de validation",
      refusee: "Refusée",
      acompte_paye: "Acompte payé",
      en_attente: "En attente de paiement",
      confirmee: "Confirmée",
      annulee: "Annulée",
      terminee: "Terminée",
      en_cours: "En cours",
    };
    return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status] || styles.terminee}`}>{labels[status] || status}</span>;
  };

  const isCancellable = reservation.statut === 'confirmee' && new Date(reservation.date_debut) > new Date();
  const canPayDeposit =
    reservation.statut === 'en_attente' &&
    !reservation.acompte_paye &&
    Boolean(reservation.paiement_acompte_id) &&
    typeof onPayDeposit === 'function';
  const canPayBalance =
    (reservation.acompte_paye || reservation.statut === 'acompte_paye' || reservation.statut === 'confirmee') &&
    !reservation.solde_paye &&
    (reservation.montant_restant ?? 0) > 0 &&
    typeof onPayBalance === 'function';

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col sm:flex-row transition-transform hover:scale-[1.02] duration-300">
      <img src="/terrain-foot.jpg" alt={reservation.terrain.nom} className="w-full sm:w-40 md:w-48 h-40 sm:h-auto object-cover flex-shrink-0" />
      <div className="p-4 sm:p-5 flex-grow flex flex-col justify-between min-w-0">
        <div>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-2 mb-1">
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 truncate">{reservation.terrain.nom}</h3>
            {getStatusBadge(reservation.statut)}
          </div>

          <p className="text-sm text-gray-500">{reservation.terrain.adresse}</p>
        </div>
        <div className="mt-4 border-t pt-4 space-y-2 text-sm text-gray-700">
          <p><strong>Date :</strong> {formatDate(reservation.date_debut)}</p>
          <p><strong>Horaire :</strong> De {formatTime(reservation.date_debut)} à {formatTime(reservation.date_fin)}</p>
          <p><strong>Montant total :</strong> {reservation.montant_total.toLocaleString('fr-FR')} FCFA</p>
          {reservation.montant_acompte && (
            <p className="text-blue-700"><strong>Acompte :</strong> {reservation.montant_acompte.toLocaleString('fr-FR')} FCFA {reservation.acompte_paye ? '✓ Payé' : '⏳ À payer'}</p>
          )}
          {reservation.montant_restant && reservation.montant_restant > 0 && (
            <p className="text-gray-600"><strong>Solde :</strong> {reservation.montant_restant.toLocaleString('fr-FR')} FCFA {reservation.solde_paye ? '✓ Payé' : '⏳ À payer'}</p>
          )}
        </div>
        
        <div className="mt-4 pt-4 border-t grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap gap-2">
          {/* Bouton Partager */}
          <button
            onClick={() => {
              const terrainNom = reservation.terrain?.nom || (reservation as any).terrain_nom || '';
              const terrainAdresse = reservation.terrain?.adresse || '';
              const lat = Number(reservation.terrain?.latitude);
              const lng = Number(reservation.terrain?.longitude);
              const hasCoords = Number.isFinite(lat) && Number.isFinite(lng) && lat !== 0 && lng !== 0;
              const mapsUrl = hasCoords
                ? `https://www.google.com/maps?q=${lat},${lng}`
                : (terrainAdresse ? `https://www.google.com/maps/search/${encodeURIComponent(terrainAdresse)}` : '');
              const dateStr = formatDate(reservation.date_debut);
              const timeStr = `${formatTime(reservation.date_debut)} - ${formatTime(reservation.date_fin)}`;
              const montantStr = reservation.montant_total.toLocaleString('fr-FR');
              const baseText = `Match prevu !\n\n` +
                (terrainNom ? `Terrain : ${terrainNom}\n` : '') +
                (terrainAdresse ? `Adresse : ${terrainAdresse}\n` : '') +
                `Date : ${dateStr}\nHeure : ${timeStr}\nMontant : ${montantStr} FCFA`;
              const text = mapsUrl ? `${baseText}\n\nCarte : ${mapsUrl}` : baseText;

              if (navigator.share) {
                navigator.share({ title: `Match - ${terrainNom}`, text }).catch(() => {});
              } else {
                const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
                window.open(waUrl, '_blank');
              }
            }}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-100 text-green-700 font-semibold rounded-lg hover:bg-green-200"
          >
            <Share2 className="w-4 h-4" />
            Partager le match
          </button>

          {isCancellable && (
            <button 
              onClick={() => onCancel(reservation.id)}
              className="flex-1 text-center px-4 py-2 bg-red-100 text-red-700 font-semibold rounded-lg hover:bg-red-200"
            >
              Annuler
            </button>
          )}

          {canPayDeposit && (
            <button
              onClick={() => onPayDeposit?.(reservation)}
              className="flex-1 text-center px-4 py-2 bg-blue-100 text-blue-700 font-semibold rounded-lg hover:bg-blue-200"
            >
              Payer l'acompte
            </button>
          )}

          {canPayBalance && (
            <button
              onClick={() => onPayBalance?.(reservation)}
              className="flex-1 text-center px-4 py-2 bg-indigo-100 text-indigo-700 font-semibold rounded-lg hover:bg-indigo-200"
            >
              Payer le solde
            </button>
          )}

          {/* Signaler un problème */}
          <button
            onClick={() => onReportIssue?.(reservation)}
            className="flex-1 text-center px-4 py-2 bg-red-50 text-red-700 font-semibold rounded-lg hover:bg-red-100"
          >
            Signaler un problème
          </button>
        </div>
      </div>
    </div>
  );
};

const ReservationsPage: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [issueReservation, setIssueReservation] = useState<Reservation | null>(null);
  const [issueDescription, setIssueDescription] = useState('');
  const [issueLoading, setIssueLoading] = useState(false);
  const navigate = useNavigate();

  const formatDateModal = (dateString: string) => new Date(dateString).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const formatTimeModal = (dateString: string) => new Date(dateString).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        setLoading(true);
        const { data } = await apiService.getMyReservations();
        if (data) {
          const list = Array.isArray(data) ? data : (data as any)?.results;
          setReservations(Array.isArray(list) ? list : []);
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
      const { data, meta } = await apiService.requestRefund(reservationId);
      if (data) {
        setReservations(prevReservations => 
          prevReservations.map(r => 
            r.id === reservationId ? { ...r, statut: 'annulee' } : r
          )
        );
        alert("Votre demande d'annulation a été prise en compte.");
      } else {
        setError(meta.message || "L'annulation a échoué.");
      }
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors de l\'annulation.');
      console.error(err);
    }
  };

  const handleReportIssue = (reservation: Reservation) => {
    setIssueReservation(reservation);
    setIssueDescription('');
    setIssueModalOpen(true);
  };

  const submitIssue = async () => {
    if (!issueReservation) return;
    if (!issueDescription.trim()) {
      toast.error('Décrivez le problème.');
      return;
    }
    setIssueLoading(true);
    try {
      const payload: Record<string, unknown> = {
        objet: 'Problème de réservation / paiement',
        description: issueDescription.trim(),
        reservation_id: issueReservation.id,
      };
      const { data, meta } = await apiService.creerLitige(payload);
      if (data) {
        toast.success(meta?.message || 'Problème signalé, support informé.');
        setIssueModalOpen(false);
        setIssueReservation(null);
        setIssueDescription('');
      } else {
        toast.error(meta?.message || 'Impossible de signaler le problème.');
      }
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de l'envoi du problème.");
    } finally {
      setIssueLoading(false);
    }
  };

  const buildPaymentPayload = (
    reservation: Reservation,
    paymentId: number | undefined,
    paymentType: 'acompte' | 'solde',
    amount: number,
  ) => {
    const startDate = new Date(reservation.date_debut);
    return {
      reservationId: reservation.id,
      paymentId,
      terrainName: reservation.terrain?.nom || (reservation as any).terrain_nom || `Terrain #${reservation.terrain_id}`,
      date: startDate.toLocaleDateString('fr-FR'),
      time: startDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      price: amount,
      totalAmount: reservation.montant_total,
      montant_acompte: reservation.montant_acompte,
      payment_type: paymentType,
      status: reservation.statut,
    };
  };

  const handlePayDeposit = (reservation: Reservation) => {
    if (!reservation.paiement_acompte_id) {
      toast.error('Paiement d’acompte introuvable.');
      return;
    }
    const amount = reservation.montant_acompte ?? reservation.montant_total;
    navigate('/payment', {
      state: {
        reservationDetails: buildPaymentPayload(reservation, reservation.paiement_acompte_id, 'acompte', amount),
      },
    });
  };

  const handlePayBalance = async (reservation: Reservation) => {
    const remaining = reservation.montant_restant ?? 0;
    if (remaining <= 0) {
      toast.error('Aucun solde à régler.');
      return;
    }

    try {
      const paymentId = reservation.paiement_solde_id ?? null;
      const amount = remaining;

      navigate('/payment', {
        state: {
          reservationDetails: buildPaymentPayload(reservation, paymentId ?? undefined, 'solde', amount),
        },
      });
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Erreur lors de l’initiation du paiement du solde.');
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
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800">Mes Réservations</h1>
      <p className="text-base sm:text-lg text-gray-600 mt-2 mb-6 sm:mb-8">Consultez et gérez toutes vos réservations passées et à venir.</p>
      
      <section>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">À venir</h2>
        {upcomingReservations.length > 0 ? (
          <div className="space-y-6">
            {upcomingReservations.map(res => <ReservationCard key={`upcoming-${res.id}`} reservation={res} onCancel={handleCancelReservation} onPayDeposit={handlePayDeposit} onPayBalance={handlePayBalance} onReportIssue={handleReportIssue} />)}
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
            {pastReservations.map(res => (
              <ReservationCard
                key={`past-${res.id}`}
                reservation={res}
                onCancel={handleCancelReservation}
                onPayDeposit={handlePayDeposit}
                onPayBalance={handlePayBalance}
                onReportIssue={handleReportIssue}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white p-8 rounded-lg shadow-sm text-center text-gray-500 border-2 border-dashed">
            <p>Votre historique de réservations est vide.</p>
          </div>
        )}
      </section>

      {/* Modal Signalement */}
      {issueModalOpen && issueReservation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Signaler un problème</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Réservation #{issueReservation.id} — {issueReservation.terrain?.nom || 'Terrain'}
                </p>
              </div>
              <button onClick={() => setIssueModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <div className="space-y-2 text-sm text-gray-700 bg-gray-50 rounded-lg p-3">
              <p><strong>Date :</strong> {formatDateModal(issueReservation.date_debut)} — {formatTimeModal(issueReservation.date_debut)} / {formatTimeModal(issueReservation.date_fin)}</p>
              <p><strong>Montant total :</strong> {issueReservation.montant_total.toLocaleString('fr-FR')} FCFA</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Décrivez le problème</label>
              <textarea
                className="w-full border rounded-lg p-3 text-sm focus:ring-blue-500 focus:border-blue-500"
                rows={4}
                placeholder="Exemple : Paiement effectué mais ticket non reçu, référence Wave ..."
                value={issueDescription}
                onChange={(e) => setIssueDescription(e.target.value)}
                disabled={issueLoading}
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIssueModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
                disabled={issueLoading}
              >
                Annuler
              </button>
              <button
                onClick={submitIssue}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
                disabled={issueLoading}
              >
                {issueLoading ? 'Envoi...' : 'Envoyer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservationsPage; 
