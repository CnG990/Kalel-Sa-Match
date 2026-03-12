import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { paymentService } from '../services/paymentService';
import type { PaymentDetails } from '../services/paymentService';
import { toast } from 'react-hot-toast';
import apiService from '../services/api';
import { useAuth } from '../context/AuthContext';

const PaymentPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [processing, setProcessing] = useState(false);
  const { reservationDetails, subscriptionDetails } = location.state || {};
  const [reservationStatus, setReservationStatus] = useState<string | undefined>(reservationDetails?.status);
  const [statusLoading, setStatusLoading] = useState(false);
  const [customerPhone, setCustomerPhone] = useState<string>(String(user?.telephone ?? ''));
  const [customerName, setCustomerName] = useState<string>(`${user?.prenom ?? ''} ${user?.nom ?? ''}`.trim());
  const [lastCheckout, setLastCheckout] = useState<{ methode: string; url?: string; instructions?: string; ussd?: string } | null>(null);

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

  const reservationId = paymentDetails.reservationId;
  const paymentId = (paymentDetails as any).paymentId as number | undefined;
  const paymentType = paymentDetails.payment_type ?? 'total';
  const isRefused = reservationStatus === 'refusee';

  const canProceed =
    !reservationId ||
    isRefused === false &&
      ((paymentType === 'acompte' && reservationStatus === 'en_attente') ||
        (paymentType !== 'acompte'));

  const fetchReservationStatus = async () => {
    if (!reservationId) return;
    setStatusLoading(true);
    try {
      const { data } = await apiService.getReservationDetail(reservationId);
      if (data) {
        setReservationStatus(data.statut);
      }
    } catch (error) {
      toast.error('Impossible de vérifier le statut de la réservation');
    } finally {
      setStatusLoading(false);
    }
  };

  useEffect(() => {
    if (reservationId) {
      fetchReservationStatus();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reservationId]);

  const handlePayment = async (method: 'orange_money' | 'wave') => {
    if (processing) return;

    if (!canProceed) {
      toast.error(isRefused ? 'Réservation refusée par le gestionnaire' : 'Validation gestionnaire en attente');
      return;
    }

    if (!customerPhone.trim() || !customerName.trim()) {
      toast.error('Veuillez renseigner votre nom et votre numéro pour le paiement.');
      return;
    }

    setProcessing(true);
    const amount = paymentDetails.price || paymentDetails.totalAmount;

    try {
      let result;
      
      if (paymentDetails.subscriptionId) {
        // Paiement d'abonnement
        result = await paymentService.processSubscriptionPayment(
          paymentDetails.subscriptionId,
          amount,
          method,
          customerPhone,
          customerName,
        );
      } else if (paymentDetails.reservationId) {
        // Paiement de réservation
        result = await paymentService.processReservationPayment(
          paymentDetails.reservationId,
          amount,
          method,
          customerPhone,
          customerName,
          paymentId,
        );
      } else {
        throw new Error('Type de paiement non reconnu');
      }

      if (result.success) {
        const payload = result.data as any;
        const checkoutUrl = payload?.checkout_url as string | undefined;
        const instructions = payload?.instructions as string | undefined;
        const ussd = payload?.ussd_code as string | undefined;

        setLastCheckout({ methode: method, url: checkoutUrl, instructions, ussd });

        if (method === 'wave' && checkoutUrl) {
          // Ouvrir Wave dans un nouvel onglet (lien de paiement)
          window.open(checkoutUrl, '_blank', 'noopener,noreferrer');
          toast.success('Lien Wave ouvert. Finalisez le paiement puis revenez ici.');
        } else if (method === 'orange_money') {
          toast.success('Instructions Orange Money affichées.');
        } else {
          toast.success('Paiement initialisé.');
        }
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
          
          {/* Affichage avance si applicable */}
          {paymentDetails.montant_acompte && paymentDetails.payment_type === 'acompte' && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-700 mb-2">Avance requise</p>
              <p className="text-lg font-semibold text-blue-900">
                Montant total : {paymentDetails.totalAmount?.toLocaleString()} FCFA
              </p>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                Avance à payer : {paymentDetails.montant_acompte.toLocaleString()} FCFA
              </p>
              <p className="text-sm text-blue-600 mt-1">
                Solde restant : {(paymentDetails.totalAmount - paymentDetails.montant_acompte).toLocaleString()} FCFA (à payer avant ou sur place)
              </p>
            </div>
          )}
          
          {paymentDetails.montant_acompte && paymentDetails.payment_type === 'solde' && (
            <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-green-700 mb-2">✓ Avance déjà payée</p>
              <p className="text-2xl font-bold text-green-600">
                Solde à payer : {(paymentDetails.price || paymentDetails.totalAmount).toLocaleString()} FCFA
              </p>
            </div>
          )}
          
          {!paymentDetails.montant_acompte && (
            <p className="mt-4 text-2xl font-bold text-orange-600">
              Total à payer : {(paymentDetails.price || paymentDetails.totalAmount).toLocaleString()} FCFA
            </p>
          )}
        </div>

        {/* Infos payeur */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
          <h2 className="text-lg font-bold mb-3">Informations de paiement</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
              <input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full border rounded px-3 py-2"
                placeholder="Votre nom"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
              <input
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full border rounded px-3 py-2"
                placeholder="+2217XXXXXXXX"
              />
            </div>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Ces informations sont utilisées pour initier le paiement (Wave / Orange Money).
          </p>
        </div>

        {lastCheckout?.methode === 'orange_money' && (lastCheckout.instructions || lastCheckout.ussd) && (
          <div className="mb-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
            <h3 className="font-bold text-orange-900 mb-2">Orange Money</h3>
            {lastCheckout.ussd && <p className="font-mono text-orange-900">USSD : {lastCheckout.ussd}</p>}
            {lastCheckout.instructions && <p className="text-sm text-orange-800 mt-1">{lastCheckout.instructions}</p>}
          </div>
        )}

        {lastCheckout?.methode === 'wave' && lastCheckout.url && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-bold text-blue-900 mb-2">Wave</h3>
            <p className="text-sm text-blue-800 mb-2">
              Si le lien ne s’est pas ouvert, clique ici :
            </p>
            <a className="text-blue-700 underline break-all" href={lastCheckout.url} target="_blank" rel="noreferrer">
              {lastCheckout.url}
            </a>
          </div>
        )}

        {reservationId && (
          <div className={`mb-6 p-4 rounded-lg flex items-center justify-between text-sm font-medium ${
            reservationStatus === 'en_attente_validation'
              ? 'bg-yellow-100 text-yellow-900'
              : reservationStatus === 'refusee'
              ? 'bg-red-100 text-red-900'
              : reservationStatus === 'annulee'
              ? 'bg-gray-100 text-gray-800'
              : reservationStatus === 'en_attente'
              ? 'bg-blue-100 text-blue-900'
              : 'bg-green-100 text-green-900'
          }`}>
            <div>
              Statut de la réservation : <strong>{reservationStatus?.replace(/_/g, ' ') ?? 'inconnu'}</strong>
              {reservationStatus === 'en_attente_validation' && ' — Le gestionnaire doit valider avant paiement.'}
              {reservationStatus === 'refusee' && ' — Contactez le support pour plus d’informations.'}
              {reservationStatus === 'annulee' && ' — Réservation annulée, paiement impossible.'}
            </div>
            <button
              type="button"
              onClick={fetchReservationStatus}
              disabled={statusLoading}
              className="ml-4 px-3 py-1 rounded border text-xs font-semibold disabled:opacity-50"
            >
              {statusLoading ? 'Actualisation…' : 'Actualiser'}
            </button>
          </div>
        )}

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