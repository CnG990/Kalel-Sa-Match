import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/api';

interface Abonnement {
  id: number;
  nom: string;
  prix: number;
}

interface SubscriptionModalProps {
  abonnement: Abonnement;
  onClose: () => void;
}

const jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
const heures = Array.from({ length: 18 }, (_, i) => `${i + 6}`.padStart(2, '0')); // 06:00 à 23:00

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ abonnement, onClose }) => {
  const [preferences, setPreferences] = useState({
    jours: [] as string[],
    heures: [] as string[],
  });
  const navigate = useNavigate();

  const handleToggle = (type: 'jours' | 'heures', value: string) => {
    setPreferences(prev => {
      const current = prev[type];
      const newValues = current.includes(value)
        ? current.filter(item => item !== value)
        : [...current, value];
      return { ...prev, [type]: newValues };
    });
  };

  const handleSubscribe = async () => {
    // Logique de souscription
    console.log("Souscription à", abonnement.nom, "avec les préférences:", preferences);
    // Ici, appeler l'API, puis rediriger vers le paiement
    const response = await apiService.souscrireAbonnement(abonnement.id, preferences);
    if(response.success && response.data) {
        navigate('/payment', { 
            state: { 
              // Adapter les détails pour le paiement d'un abonnement
              reservationDetails: {
                abonnementId: response.data.id,
                terrainName: `Abonnement ${abonnement.nom}`, // Le nom est plus générique
                date: new Date().toLocaleDateString(),
                time: 'N/A',
                price: abonnement.prix,
              }
            } 
          });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl font-bold">Souscrire à : {abonnement.nom}</h2>
          <button onClick={onClose} className="text-3xl text-gray-500 hover:text-gray-800">&times;</button>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-2">Choisissez vos jours préférés</h3>
          <div className="flex flex-wrap gap-2 mb-6">
            {jours.map(jour => (
              <button key={jour} onClick={() => handleToggle('jours', jour)} className={`px-4 py-2 border rounded-full ${preferences.jours.includes(jour) ? 'bg-blue-600 text-white' : ''}`}>
                {jour}
              </button>
            ))}
          </div>

          <h3 className="text-lg font-semibold mb-2">Choisissez vos heures préférées</h3>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {heures.map(heure => (
              <button key={heure} onClick={() => handleToggle('heures', heure)} className={`px-3 py-2 border rounded-lg ${preferences.heures.includes(heure) ? 'bg-blue-600 text-white' : ''}`}>
                {heure}:00
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 pt-6 border-t flex justify-end">
          <button onClick={handleSubscribe} className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg">
            Souscrire et Payer {abonnement.prix.toLocaleString()} FCFA
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionModal; 