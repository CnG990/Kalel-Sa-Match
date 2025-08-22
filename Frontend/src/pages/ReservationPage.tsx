import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

const ReservationPage: React.FC = () => {
  const { } = useParams<{ id: string }>();
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [duration, setDuration] = useState('1');
  const [paymentMethod, setPaymentMethod] = useState('mobile_money');
  const [isProcessing, setIsProcessing] = useState(false);

  // Horaires disponibles (exemple)
  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00',
    '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'
  ];

  // Durées disponibles
  const durations = [
    { value: '1', label: '1 heure', price: 25000 },
    { value: '2', label: '2 heures', price: 48000 },
    { value: '3', label: '3 heures', price: 70000 }
  ];

  const selectedDuration = durations.find(d => d.value === duration);
  const totalPrice = selectedDuration?.price || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Simulation d'une requête API
    setTimeout(() => {
      setIsProcessing(false);
      alert('Réservation effectuée avec succès !');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Réserver un terrain</h1>
          <p className="text-gray-600">Choisissez votre créneau et effectuez votre réservation</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulaire de réservation */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Détails de la réservation</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Informations du terrain */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Terrain sélectionné</h3>
                  <div className="flex items-center space-x-4">
                    <img 
                      src="/terrain-foot.jpg" 
                      alt="Terrain" 
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div>
                      <p className="font-medium text-gray-900">Terrain A - Complexe Almadies</p>
                      <p className="text-sm text-gray-600">Surface synthétique • Éclairage • Vestiaires</p>
                    </div>
                  </div>
                </div>

                {/* Date et heure */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                      Date de réservation
                    </label>
                    <input
                      type="date"
                      id="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-2">
                      Heure de début
                    </label>
                    <select
                      id="time"
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    >
                      <option value="">Sélectionnez une heure</option>
                      {timeSlots.map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Durée */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Durée de réservation
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {durations.map(durationOption => (
                      <label
                        key={durationOption.value}
                        className={`relative flex cursor-pointer rounded-lg border p-4 focus:outline-none ${
                          duration === durationOption.value
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-300 bg-white'
                        }`}
                      >
                        <input
                          type="radio"
                          name="duration"
                          value={durationOption.value}
                          checked={duration === durationOption.value}
                          onChange={(e) => setDuration(e.target.value)}
                          className="sr-only"
                        />
                        <div className="flex w-full items-center justify-between">
                          <div className="flex items-center">
                            <div className="text-sm">
                              <p className={`font-medium ${
                                duration === durationOption.value ? 'text-green-900' : 'text-gray-900'
                              }`}>
                                {durationOption.label}
                              </p>
                              <p className={`${
                                duration === durationOption.value ? 'text-green-700' : 'text-gray-500'
                              }`}>
                                {durationOption.price.toLocaleString()} FCFA
                              </p>
                            </div>
                          </div>
                          {duration === durationOption.value && (
                            <div className="shrink-0 text-green-600">
                              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                                <path fillRule="evenodd" d="M20.707 5.293a1 1 0 010 1.414l-11 11a1 1 0 01-1.414 0l-5-5a1 1 0 011.414-1.414L9 15.586 19.293 5.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Méthode de paiement */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Méthode de paiement
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="payment"
                        value="mobile_money"
                        checked={paymentMethod === 'mobile_money'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                      />
                      <div className="flex items-center space-x-2">
                        <img src="/orange-money.png" alt="Orange Money" className="h-6 w-auto" />
                        <span className="text-gray-900">Orange Money</span>
                      </div>
                    </label>
                    
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="payment"
                        value="wave"
                        checked={paymentMethod === 'wave'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                      />
                      <div className="flex items-center space-x-2">
                        <img src="/wave.png" alt="Wave" className="h-6 w-auto" />
                        <span className="text-gray-900">Wave</span>
                      </div>
                    </label>
                    
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="payment"
                        value="cash"
                        checked={paymentMethod === 'cash'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                      />
                      <span className="text-gray-900">Paiement sur place</span>
                    </label>
                  </div>
                </div>

                {/* Bouton de réservation */}
                <button
                  type="submit"
                  disabled={isProcessing || !selectedDate || !selectedTime}
                  className="w-full bg-gradient-to-r from-green-600 to-orange-500 hover:from-green-700 hover:to-orange-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Traitement en cours...
                    </div>
                  ) : (
                    'Confirmer la réservation'
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Résumé de la réservation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Résumé</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Terrain</span>
                  <span className="font-medium">Terrain A</span>
                </div>
                
                {selectedDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date</span>
                    <span className="font-medium">{new Date(selectedDate).toLocaleDateString('fr-FR')}</span>
                  </div>
                )}
                
                {selectedTime && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Heure</span>
                    <span className="font-medium">{selectedTime}</span>
                  </div>
                )}
                
                {selectedDuration && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Durée</span>
                    <span className="font-medium">{selectedDuration.label}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Prix unitaire</span>
                  <span className="font-medium">25 000 FCFA/h</span>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span className="text-green-600">{totalPrice.toLocaleString()} FCFA</span>
                  </div>
                </div>
              </div>

              {/* Informations importantes */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">Informations importantes</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Annulation gratuite jusqu'à 24h avant</li>
                  <li>• Présentez-vous 10 min avant l'heure</li>
                  <li>• Équipements disponibles sur place</li>
                  <li>• Vestiaires et douches inclus</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReservationPage; 