import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const PaymentPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { reservationDetails } = location.state || {};

  if (!reservationDetails) {
    // Rediriger si on arrive sur la page sans détails de réservation
    navigate('/');
    return null;
  }

  const handlePayment = (method: 'orange-money' | 'wave') => {
    // Logique de paiement à implémenter
    console.log(`Paiement de ${reservationDetails.price} FCFA via ${method}`);
    alert(`Redirection vers la page de paiement ${method}... (simulation)`);
    // Ici, on appellerait le service de paiement
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-xl">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-4">Finaliser votre réservation</h1>
        
        <div className="bg-gray-50 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-bold mb-2">Récapitulatif</h2>
          <p><strong>Terrain:</strong> {reservationDetails.terrainName}</p>
          <p><strong>Date:</strong> {reservationDetails.date}</p>
          <p><strong>Heure:</strong> {reservationDetails.time}:00</p>
          <p className="mt-4 text-2xl font-bold text-orange-600">
            Total à payer : {reservationDetails.price.toLocaleString()} FCFA
          </p>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-4">Choisissez votre méthode de paiement</h2>
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
      </div>
    </div>
  );
};

export default PaymentPage; 