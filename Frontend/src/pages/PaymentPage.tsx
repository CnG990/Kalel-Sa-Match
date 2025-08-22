import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const PaymentPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { reservationDetails, subscriptionDetails } = location.state || {};

  // Déterminer le type de paiement et les données correspondantes
  const isSubscription = !!subscriptionDetails;
  const paymentData = isSubscription ? subscriptionDetails : reservationDetails;

  // Gestion de la redirection si pas de données (évite les erreurs de hot reload)
  useEffect(() => {
    if (!reservationDetails && !subscriptionDetails) {
      console.warn('PaymentPage: Aucune donnée de paiement trouvée, redirection vers l\'accueil');
      navigate('/', { replace: true });
    }
  }, [reservationDetails, subscriptionDetails, navigate]);

  // Affichage de loading pendant la redirection
  if (!reservationDetails && !subscriptionDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Redirection en cours...</p>
        </div>
      </div>
    );
  }

  const handlePayment = async (method: 'orange-money' | 'wave') => {
    try {
      if (isSubscription && selectedPaymentMode) {
        // Traitement spécialisé pour les abonnements
        const finalAmount = selectedPaymentMode === 'per_match' 
          ? paymentData.paymentOptions?.per_match?.montant_par_match || 0
          : paymentData.paymentOptions?.immediate?.montant || paymentData.price;

        console.log(`💳 Paiement abonnement via ${method}`, {
          mode: selectedPaymentMode,
          montant: finalAmount,
          subscriptionId: paymentData.subscriptionId
        });

        // Simuler le traitement du paiement
        toast.loading('Traitement du paiement en cours...');
        
        // Similer appel API
        await new Promise(resolve => setTimeout(resolve, 2000));

        if (selectedPaymentMode === 'per_match') {
          // Mode paiement par match - confirmer l'activation
          const message = `✅ Abonnement activé avec paiement par match !

📝 Récapitulatif :
• Mode de paiement configuré : ${method === 'orange-money' ? 'Orange Money' : 'Wave'}
• Prix par match : ${Math.round(finalAmount).toLocaleString()} FCFA
• Vous payez uniquement quand vous utilisez le terrain

🎯 Instructions :
1. Votre abonnement est maintenant actif
2. Réservez vos créneaux normalement  
3. Le paiement sera demandé à chaque réservation via ${method === 'orange-money' ? 'Orange Money' : 'Wave'}
4. Annulation gratuite jusqu'à 2h avant le match

⚽ Votre gestionnaire de terrain a été notifié.`;

          toast.dismiss();
          alert(message);
          
          navigate('/dashboard', { 
            state: { 
              message: `Abonnement activé avec paiement par match via ${method === 'orange-money' ? 'Orange Money' : 'Wave'} ✅`,
              subscriptionId: paymentData.subscriptionId 
            } 
          });
        } else {
          // Paiement intégral
          toast.dismiss();
          toast.success(`Paiement intégral réussi via ${method === 'orange-money' ? 'Orange Money' : 'Wave'} !`);
          
          navigate('/dashboard', { 
            state: { 
              message: `Abonnement payé intégralement via ${method === 'orange-money' ? 'Orange Money' : 'Wave'} ✅`,
              subscriptionId: paymentData.subscriptionId 
            } 
          });
        }
      } else {
        // Paiement classique (réservation)
        const amount = paymentData.price || paymentData.totalAmount;
        console.log(`Paiement de ${amount} FCFA via ${method}`);
        alert(`Redirection vers la page de paiement ${method}... (simulation)`);
      }
    } catch (error) {
      toast.dismiss();
      toast.error('Erreur lors du traitement du paiement');
      console.error('Erreur paiement:', error);
    }
  };

  const [selectedPaymentMode, setSelectedPaymentMode] = useState<'immediate' | 'per_match' | null>(null);

  const handleSubscriptionPayment = (paymentType: 'immediate' | 'per_match') => {
    setSelectedPaymentMode(paymentType);
    
    if (paymentType === 'per_match') {
      // Mode paiement par match - afficher un message informatif mais continuer vers les méthodes de paiement
      toast.success(`Mode paiement par match sélectionné ! 
Prix par match : ${Math.round(paymentData.paymentOptions?.per_match?.montant_par_match || 0).toLocaleString()} FCFA`);
    } else {
      // Paiement intégral sélectionné
      toast.success(`Paiement intégral sélectionné ! 
Montant total : ${paymentData.paymentOptions?.immediate?.montant?.toLocaleString()} FCFA`);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-xl">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-4">
          {isSubscription ? 'Finaliser votre abonnement' : 'Finaliser votre réservation'}
        </h1>
        
        <div className="bg-gray-50 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-bold mb-2">Récapitulatif</h2>
          
          {/* Affichage pour les abonnements */}
          {isSubscription ? (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3">📍 Informations du terrain</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p><strong>Terrain:</strong> {paymentData.terrainName}</p>
                    {paymentData.terrainAddress && (
                      <p className="text-sm text-gray-600"><strong>Adresse:</strong> {paymentData.terrainAddress}</p>
                    )}
                  </div>
                  <div>
                    {paymentData.terrainOptionName && (
                      <p><strong>Option:</strong> {paymentData.terrainOptionName}</p>
                    )}
                    <p><strong>Prix par heure:</strong> {paymentData.terrainPricePerHour?.toLocaleString()} FCFA</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3">📋 Détails de l'abonnement</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p><strong>Type:</strong> {paymentData.abonnementType}</p>
                    <p><strong>Durée:</strong> {paymentData.duration} jours</p>
                    <p><strong>Période:</strong> du {paymentData.startDate} au {paymentData.endDate}</p>
                  </div>
                  <div>
                    <p><strong>Séances par semaine:</strong> {paymentData.sessionsPerWeek}</p>
                    <p><strong>Durée par séance:</strong> {paymentData.sessionDuration}h</p>
                    <p><strong>Total de séances:</strong> {Math.round(paymentData.totalSessions || 0)}</p>
                  </div>
                </div>
                {paymentData.abonnementDescription && (
                  <p className="text-sm text-gray-600 mt-2">{paymentData.abonnementDescription}</p>
                )}
              </div>

              {/* Préférences d'horaires */}
              {paymentData.preferences && (paymentData.preferences.jourPrefere || paymentData.preferences.heurePrefere) && (
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-purple-900 mb-2">⚙️ Préférences d'horaires :</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {paymentData.preferences.jourPrefere && (
                      <p className="text-purple-800">
                        <strong>Jour préféré:</strong> {paymentData.preferences.jourPrefere}
                      </p>
                    )}
                    {paymentData.preferences.heurePrefere && (
                      <p className="text-purple-800">
                        <strong>Heure préférée:</strong> {paymentData.preferences.heurePrefere}
                      </p>
                    )}
                  </div>
                  {paymentData.preferences.preferencesFlexibles && (
                    <p className="text-purple-700 text-sm mt-2">✅ Préférences flexibles activées</p>
                  )}
                </div>
              )}

              {/* Créneaux récurrents */}
              {paymentData.creneauxRecurrents && paymentData.creneauxRecurrents.length > 0 && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">Créneaux récurrents confirmés :</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {paymentData.creneauxRecurrents.map((creneau: any, index: number) => (
                      <div key={index} className="flex items-center text-blue-800">
                        <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                        <span>{creneau.jour} à {creneau.heure}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Calcul des économies */}
              {paymentData.savings && paymentData.savings > 0 && (
                <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
                  <h3 className="font-semibold text-green-900 mb-3">💰 Récapitulatif des économies</h3>
                  <div className="space-y-2">
                    {paymentData.originalPrice && (
                      <div className="flex justify-between items-center">
                        <span className="text-green-800">Prix sans abonnement :</span>
                        <span className="font-semibold text-green-800 line-through">
                          {paymentData.originalPrice.toLocaleString()} FCFA
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-green-800">Prix avec abonnement :</span>
                      <span className="font-semibold text-green-800">
                        {paymentData.price?.toLocaleString()} FCFA
                      </span>
                    </div>
                    <div className="border-t border-green-200 pt-2">
                      <div className="flex justify-between items-center">
                        <span className="text-green-900 font-semibold">Économies totales :</span>
                        <span className="text-xl font-bold text-green-600">
                          {paymentData.savings.toLocaleString()} FCFA
                        </span>
                      </div>
                      <p className="text-sm text-green-700 mt-1">
                        🎯 Vous économisez par rapport au paiement séance par séance !
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="border-t pt-4">
                <p className="mt-4 text-2xl font-bold text-orange-600">
                  Total à payer : {paymentData.price?.toLocaleString() || 'N/A'} FCFA
                </p>
              </div>
            </div>
          ) : (
            /* Affichage pour les réservations */
            <>
              <p><strong>Terrain:</strong> {paymentData.terrainName}</p>
              <p><strong>Date:</strong> {paymentData.date}</p>
              <p><strong>Heure:</strong> {paymentData.time}:00</p>
              <p className="mt-4 text-2xl font-bold text-orange-600">
                Total à payer : {paymentData.price?.toLocaleString() || 'N/A'} FCFA
              </p>
            </>
          )}
        </div>

        {/* Options de paiement pour abonnements */}
        {isSubscription && paymentData.paymentOptions && (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">💳 Choisissez votre mode de paiement</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Paiement intégral */}
              <div className="p-6 border-2 border-green-200 rounded-lg bg-green-50">
                <div className="text-center">
                  <div className="text-green-600 text-2xl mb-2">💎</div>
                  <h3 className="text-lg font-bold text-green-800 mb-2">
                    {paymentData.paymentOptions.immediate?.description}
                  </h3>
                  <p className="text-2xl font-bold text-green-600 mb-2">
                    {paymentData.paymentOptions.immediate?.montant?.toLocaleString()} FCFA
                  </p>
                  <p className="text-sm text-green-700 mb-4">
                    ✅ Accès immédiat à tous vos créneaux<br/>
                    ✅ Économies maximales<br/>
                    ✅ Priorité sur les réservations
                  </p>
                  <button 
                    onClick={() => handleSubscriptionPayment('immediate')}
                    className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Payer l'abonnement complet
                  </button>
                </div>
              </div>

              {/* Paiement par match */}
              <div className="p-6 border-2 border-blue-200 rounded-lg bg-blue-50">
                <div className="text-center">
                  <div className="text-blue-600 text-2xl mb-2">⚽</div>
                  <h3 className="text-lg font-bold text-blue-800 mb-2">
                    {paymentData.paymentOptions.per_match?.description}
                  </h3>
                  <p className="text-2xl font-bold text-blue-600 mb-2">
                    {Math.round(paymentData.paymentOptions.per_match?.montant_par_match || 0).toLocaleString()} FCFA/match
                  </p>
                  <p className="text-sm text-blue-700 mb-4">
                    ✅ Pas de frais d'abonnement<br/>
                    ✅ Payez seulement quand vous jouez<br/>
                    ✅ Flexibilité maximale
                  </p>
                  <button 
                    onClick={() => handleSubscriptionPayment('per_match')}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Choisir paiement par match
                  </button>
                </div>
              </div>
            </div>
            <div className="text-center text-sm text-gray-600">
              {paymentData.instructions}
            </div>
          </div>
        )}

        {/* Méthodes de paiement classiques */}
        {(!isSubscription || selectedPaymentMode) && (
          <div>
            <h2 className="text-xl font-bold mb-4">
              {isSubscription 
                ? (selectedPaymentMode === 'per_match' 
                    ? 'Configurez votre méthode de paiement par match' 
                    : 'Procédez au paiement intégral')
                : 'Choisissez votre méthode de paiement'}
            </h2>
            
            {/* Indicateur du mode sélectionné pour les abonnements */}
            {isSubscription && selectedPaymentMode && (
              <div className={`mb-4 p-3 rounded-lg border-l-4 ${
                selectedPaymentMode === 'per_match' 
                  ? 'bg-blue-50 border-blue-400 text-blue-800' 
                  : 'bg-green-50 border-green-400 text-green-800'
              }`}>
                <p className="font-medium">
                  {selectedPaymentMode === 'per_match' 
                    ? `⚽ Mode paiement par match sélectionné (${Math.round(paymentData.paymentOptions?.per_match?.montant_par_match || 0).toLocaleString()} FCFA/match)`
                    : `💎 Paiement intégral sélectionné (${paymentData.paymentOptions?.immediate?.montant?.toLocaleString()} FCFA)`
                  }
                </p>
              </div>
            )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Orange Money */}
            <button 
              onClick={() => handlePayment('orange-money')}
              className="flex flex-col items-center justify-center p-6 border-2 rounded-lg hover:border-orange-500 transition-colors"
            >
              <img src="/orange-money.png" alt="Orange Money" className="h-16 mb-4" />
              <span className="font-semibold">Payer avec Orange Money</span>
            </button>

            {/* Wave */}
            <button 
              onClick={() => handlePayment('wave')}
              className="flex flex-col items-center justify-center p-6 border-2 rounded-lg hover:border-blue-500 transition-colors"
            >
              <img src="/wave.png" alt="Wave" className="h-16 mb-4" />
              <span className="font-semibold">Payer avec Wave</span>
            </button>
          </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentPage; 