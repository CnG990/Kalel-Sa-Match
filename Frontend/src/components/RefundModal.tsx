import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, CheckCircle, Clock, DollarSign } from 'lucide-react';
import { toast } from 'react-hot-toast';
import apiService from '../services/api';

interface Reservation {
  id: number;
  terrain_id: number;
  terrain_nom: string;
  date_reservation: string;
  heure_debut: string;
  heure_fin: string;
  montant_paye: number;
  statut: string;
  created_at: string;
}

interface RefundModalProps {
  reservation: Reservation;
  isOpen: boolean;
  onClose: () => void;
  onRefundSuccess: () => void;
}

interface RefundCalculation {
  montant_eligible: number;
  frais_retrait: number;
  montant_rembourse: number;
  delai_remboursement: string;
}

const RefundModal: React.FC<RefundModalProps> = ({ 
  reservation,
  isOpen, 
  onClose, 
  onRefundSuccess
}) => {
  const [loading, setLoading] = useState(false);
  const [refundCalculation, setRefundCalculation] = useState<RefundCalculation | null>(null);
  const [raison, setRaison] = useState('');

  useEffect(() => {
    if (isOpen && reservation) {
      calculateRefund();
    }
  }, [isOpen, reservation]);

  const calculateRefund = () => {
    const now = new Date();
    const reservationDate = new Date(reservation.date_reservation + ' ' + reservation.heure_debut);
    const timeDiff = reservationDate.getTime() - now.getTime();
    const hoursUntilReservation = timeDiff / (1000 * 60 * 60);

    let montantEligible = reservation.montant_paye;
    let fraisRetrait = 0;
    let delaiRemboursement = '';

    // Calcul selon le délai avant la réservation
    if (hoursUntilReservation > 24) {
      // Plus de 24h avant : remboursement complet
      montantEligible = reservation.montant_paye;
      fraisRetrait = 0;
      delaiRemboursement = '3-5 jours ouvrables';
    } else if (hoursUntilReservation > 2) {
      // Entre 2h et 24h avant : 80% du montant
      montantEligible = reservation.montant_paye * 0.8;
      fraisRetrait = reservation.montant_paye * 0.2;
      delaiRemboursement = '5-7 jours ouvrables';
      } else {
      // Moins de 2h avant : pas de remboursement
      montantEligible = 0;
      fraisRetrait = reservation.montant_paye;
      delaiRemboursement = 'Non éligible';
    }

    setRefundCalculation({
      montant_eligible: montantEligible,
      frais_retrait: fraisRetrait,
      montant_rembourse: montantEligible - fraisRetrait,
      delai_remboursement: delaiRemboursement
    });
  };

  const handleRefundRequest = async () => {
    if (!refundCalculation || refundCalculation.montant_rembourse <= 0) {
      toast.error('Aucun montant éligible au remboursement');
      return;
    }

    if (!raison.trim()) {
      toast.error('Veuillez indiquer la raison du remboursement');
      return;
    }

    setLoading(true);
    try {
      const refundData = {
        refund_type: 'partial',
        reason: raison,
        weather_evidence: 'N/A' // Placeholder, actual evidence would be fetched
      };

      const response = await apiService.requestRefund(reservation.id, refundData);
      
      if (response.success) {
        toast.success(response.message || 'Remboursement traité avec succès');
        onRefundSuccess();
        onClose();
      } else {
        toast.error(response.message || 'Erreur lors de la demande de remboursement');
      }
    } catch (error) {
      console.error('Erreur remboursement:', error);
      toast.error('Erreur lors de la demande de remboursement');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReservation = async () => {
    setLoading(true);
    try {
      // Corriger l'appel à l'API
      const response = await apiService.updateAdminReservationStatus(reservation.id, 'annulee');
      
      if (response.success) {
        toast.success('Réservation annulée avec succès');
        onRefundSuccess();
        onClose();
      } else {
        toast.error(response.message || 'Erreur lors de l\'annulation');
      }
    } catch (error) {
      console.error('Erreur annulation:', error);
      toast.error('Erreur lors de l\'annulation de la réservation');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-orange-600" />
            </div>
          <div>
              <h2 className="text-xl font-bold text-gray-900">Demande de remboursement</h2>
              <p className="text-sm text-gray-600">Terrain: {reservation.terrain_nom}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Informations de la réservation */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Détails de la réservation</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Date:</span>
                <span className="ml-2 font-medium">{formatDate(reservation.date_reservation)}</span>
              </div>
              <div>
                <span className="text-gray-600">Heure:</span>
                <span className="ml-2 font-medium">
                  {formatTime(reservation.heure_debut)} - {formatTime(reservation.heure_fin)}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Montant payé:</span>
                <span className="ml-2 font-medium text-green-600">
                  {reservation.montant_paye.toLocaleString()} FCFA
                </span>
              </div>
              <div>
                <span className="text-gray-600">Statut:</span>
                <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                  reservation.statut === 'confirmee' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {reservation.statut === 'confirmee' ? 'Confirmée' : 'En attente'}
                </span>
              </div>
            </div>
          </div>

          {/* Calcul du remboursement */}
          {refundCalculation && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <CheckCircle className="w-5 h-5 text-blue-600 mr-2" />
                Calcul du remboursement
              </h3>
                <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Montant éligible:</span>
                  <span className="font-medium">{refundCalculation.montant_eligible.toLocaleString()} FCFA</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Frais de retrait:</span>
                  <span className="font-medium text-red-600">-{refundCalculation.frais_retrait.toLocaleString()} FCFA</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-900">Montant remboursé:</span>
                    <span className={`font-bold ${
                      refundCalculation.montant_rembourse > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {refundCalculation.montant_rembourse.toLocaleString()} FCFA
                    </span>
                  </div>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="w-4 h-4 mr-2" />
                  Délai: {refundCalculation.delai_remboursement}
                </div>
              </div>
            </div>
          )}

          {/* Raison du remboursement */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Raison du remboursement *
            </label>
            <textarea
              value={raison}
              onChange={(e) => setRaison(e.target.value)}
              placeholder="Expliquez pourquoi vous demandez un remboursement..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              rows={3}
              required
            />
        </div>

        {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
            {refundCalculation && refundCalculation.montant_rembourse > 0 ? (
          <button
                onClick={handleRefundRequest}
                disabled={loading || !raison.trim()}
                className="flex-1 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
          >
            {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <DollarSign className="w-5 h-5 mr-2" />
                    Demander le remboursement
                  </>
                )}
              </button>
            ) : (
              <div className="flex-1 bg-gray-100 text-gray-500 font-semibold py-3 px-6 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Remboursement non éligible
              </div>
            )}
            
            <button
              onClick={handleCancelReservation}
              disabled={loading}
              className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler la réservation
          </button>
          </div>

          {/* Informations importantes */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-1">Informations importantes:</p>
                <ul className="space-y-1 text-xs">
                  <li>• Le remboursement sera effectué sur le même moyen de paiement utilisé</li>
                  <li>• Les frais de retrait varient selon le délai avant la réservation</li>
                  <li>• En cas d'annulation, la réservation sera définitivement supprimée</li>
                  <li>• Pour toute question, contactez notre support client</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RefundModal; 