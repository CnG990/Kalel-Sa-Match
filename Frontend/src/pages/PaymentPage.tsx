import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { paymentService } from '../services/paymentService';
import type { PaymentDetails } from '../services/paymentService';
import { toast } from 'react-hot-toast';

const PaymentPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const { reservationDetails, subscriptionDetails } = location.state || {};

  // Déterminer le type de paiement (réservation ou abonnement)
  const paymentDetails: PaymentDetails = reservationDetails || subscriptionDetails;

  if (!paymentDetails) {
    // Rediriger si on arrive sur la page sans détails de paiement
    navigate('/');
    return null;
  }

  // Valider les détails de paiement
  const validation = paymentService.validatePaymentDetails(paymentDetails);
  if (!validation.valid) {
    console.error('Détails de paiement invalides:', validation.errors);
    toast.error('Données de paiement invalides');
    navigate('/');
    return null;
  }

  const handlePayment = async (method: 'orange_money' | 'wave') => {
    if (processing) return;
    
    setProcessing(true);
    const amount = paymentDetails.price || paymentDetails.totalAmount;
    
    try {
      let result;
      
      if (paymentDetails.subscriptionId) {
        // Paiement d'abonnement
        result = await paymentService.processSubscriptionPayment(
          paymentDetails.subscriptionId,
          amount,
          method
        );
      } else if (paymentDetails.reservationId) {
        // Paiement de réservation
        result = await paymentService.processReservationPayment(
          paymentDetails.reservationId,
          amount,
          method
        );
      } else {
        throw new Error('Type de paiement non reconnu');
      }

      if (result.success) {
        toast.success('Paiement traité avec succès !');
        // Rediriger vers la page de confirmation
        navigate('/dashboard', { 
          state: { 
            paymentSuccess: true,
            paymentDetails: paymentDetails 
          } 
        });
      } else {
        toast.error(result.message || 'Erreur lors du paiement');
      }
    } catch (error) {
      console.error('Erreur paiement:', error);
      toast.error('Erreur lors du traitement du paiement');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-xl">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-4">Finaliser votre réservation</h1>
        
        <div className="bg-gray-50 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-bold mb-2">Récapitulatif</h2>
          <p><strong>Terrain:</strong> {paymentDetails.terrainName}</p>
          
          {/* Informations pour les réservations */}
          {paymentDetails.date && (
            <>
              <p><strong>Date:</strong> {paymentDetails.date}</p>
              <p><strong>Heure:</strong> {paymentDetails.time}:00</p>
            </>
          )}
          
          {/* Informations pour les abonnements */}
          {paymentDetails.duration && (
            <p><strong>Type d'abonnement:</strong> {paymentDetails.duration}</p>
          )}
          {paymentDetails.startDate && paymentDetails.endDate && (
            <>
              <p><strong>Période:</strong> {paymentDetails.startDate} - {paymentDetails.endDate}</p>
            </>
          )}
          {paymentDetails.preferences && (
            <div className="mt-3 p-3 bg-blue-50 rounded">
              <p className="font-semibold text-blue-800">Préférences:</p>
              <p className="text-sm text-blue-700">
                {paymentDetails.preferences.nb_seances_semaine} séance(s)/semaine, 
                {paymentDetails.preferences.duree_seance}h par séance
              </p>
            </div>
          )}
          
          <p className="mt-4 text-2xl font-bold text-orange-600">
            Total à payer : {(paymentDetails.price || paymentDetails.totalAmount).toLocaleString()} FCFA
          </p>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-4">Choisissez votre méthode de paiement</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Orange Money */}
            <button 
              onClick={() => handlePayment('orange_money')}
              disabled={processing}
              className="flex flex-col items-center justify-center p-6 border-2 rounded-lg hover:border-orange-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <img src="/orange-money.png" alt="Orange Money" className="h-16 mb-4" />
              <span className="font-semibold">
                {processing ? 'Traitement...' : 'Payer avec Orange Money'}
              </span>
            </button>

            {/* Wave */}
            <button 
              onClick={() => handlePayment('wave')}
              disabled={processing}
              className="flex flex-col items-center justify-center p-6 border-2 rounded-lg hover:border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <img src="/wave.png" alt="Wave" className="h-16 mb-4" />
              <span className="font-semibold">
                {processing ? 'Traitement...' : 'Payer avec Wave'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage; 