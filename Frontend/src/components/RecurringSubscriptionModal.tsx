import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, CreditCard, AlertTriangle, Repeat } from 'lucide-react';
import apiService from '../services/api';
import toast from 'react-hot-toast';

interface RecurringSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  terrainId?: number;
  terrainNom?: string;
  prixHeure?: number;
  onSuccess?: () => void;
}

const JOURS_SEMAINE = [
  { id: 1, nom: 'Lundi', short: 'L' },
  { id: 2, nom: 'Mardi', short: 'M' },
  { id: 3, nom: 'Mercredi', short: 'M' },
  { id: 4, nom: 'Jeudi', short: 'J' },
  { id: 5, nom: 'Vendredi', short: 'V' },
  { id: 6, nom: 'Samedi', short: 'S' },
  { id: 0, nom: 'Dimanche', short: 'D' },
];

const RecurringSubscriptionModal: React.FC<RecurringSubscriptionModalProps> = ({
  isOpen,
  onClose,
  terrainId,
  terrainNom,
  prixHeure = 0,
  onSuccess
}) => {
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    type_recurrence: 'hebdomadaire' as 'hebdomadaire' | 'mensuel',
    jours_semaine: [] as number[],
    heure_debut: '',
    heure_fin: '',
    date_debut: '',
    date_fin: '',
    mode_paiement: 'acompte' as 'acompte' | 'apres_match',
    pourcentage_acompte: 40,
  });

  const [calculatedValues, setCalculatedValues] = useState({
    nombreSeances: 0,
    coutTotal: 0,
    acompte: 0,
    coutParSeance: 0,
  });

  // Détection mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Calcul automatique des coûts
  useEffect(() => {
    if (formData.date_debut && formData.date_fin && formData.jours_semaine.length > 0 && formData.heure_debut && formData.heure_fin) {
      const dateDebut = new Date(formData.date_debut);
      const dateFin = new Date(formData.date_fin);
      const heureDebut = new Date(`2000-01-01T${formData.heure_debut}`);
      const heureFin = new Date(`2000-01-01T${formData.heure_fin}`);
      
      // Calcul durée en heures
      const dureeHeures = (heureFin.getTime() - heureDebut.getTime()) / (1000 * 60 * 60);
      
      // Calcul nombre de séances
      let nombreSeances = 0;
      const current = new Date(dateDebut);
      
      while (current <= dateFin) {
        if (formData.jours_semaine.includes(current.getDay())) {
          nombreSeances++;
        }
        current.setDate(current.getDate() + 1);
      }
      
      const coutParSeance = prixHeure * dureeHeures;
      const coutTotal = nombreSeances * coutParSeance;
      const acompte = (coutTotal * formData.pourcentage_acompte) / 100;
      
      setCalculatedValues({
        nombreSeances,
        coutTotal,
        acompte,
        coutParSeance,
      });
    }
  }, [formData, prixHeure]);

  const handleJourToggle = (jourId: number) => {
    setFormData(prev => ({
      ...prev,
      jours_semaine: prev.jours_semaine.includes(jourId)
        ? prev.jours_semaine.filter(id => id !== jourId)
        : [...prev.jours_semaine, jourId]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!terrainId) {
      toast.error('Terrain non sélectionné');
      return;
    }

    if (formData.jours_semaine.length === 0) {
      toast.error('Veuillez sélectionner au moins un jour');
      return;
    }

    if (!formData.heure_debut || !formData.heure_fin) {
      toast.error('Veuillez renseigner les horaires');
      return;
    }

    if (!formData.date_debut || !formData.date_fin) {
      toast.error('Veuillez renseigner les dates');
      return;
    }

    setLoading(true);
    
    try {
      const response = await apiService.createRecurringSubscription({
        terrain_id: terrainId,
        ...formData,
      });

      if (response.success) {
        toast.success('Abonnement récurrent créé avec succès !');
        onSuccess?.();
        onClose();
        
        // Reset form
        setFormData({
          type_recurrence: 'hebdomadaire',
          jours_semaine: [],
          heure_debut: '',
          heure_fin: '',
          date_debut: '',
          date_fin: '',
          mode_paiement: 'acompte',
          pourcentage_acompte: 40,
        });
      } else {
        toast.error(response.message || 'Erreur lors de la création');
      }
    } catch (error) {
      console.error('Erreur création abonnement:', error);
      toast.error('Erreur lors de la création de l\'abonnement');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-xl shadow-2xl w-full max-h-[90vh] overflow-y-auto ${
        isMobile ? 'max-w-sm' : 'max-w-2xl'
      }`}>
        {/* Header */}
        <div className={`sticky top-0 bg-white border-b flex items-center justify-between ${
          isMobile ? 'px-4 py-3' : 'px-6 py-4'
        }`}>
          <div>
            <h2 className={`font-semibold text-gray-900 ${isMobile ? 'text-lg' : 'text-xl'}`}>
              🔄 Abonnement Récurrent
            </h2>
            {terrainNom && (
              <p className={`text-gray-600 ${isMobile ? 'text-sm' : ''}`}>
                {terrainNom}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors touch-target"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={isMobile ? 'p-4 space-y-6' : 'p-6 space-y-6'}>
          {/* Type de récurrence */}
          <div>
            <label className={`block font-medium text-gray-700 mb-3 ${isMobile ? 'text-lg' : ''}`}>
              📅 Type de récurrence
            </label>
            <div className={`gap-3 ${isMobile ? 'space-y-2' : 'grid grid-cols-2'}`}>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, type_recurrence: 'hebdomadaire' }))}
                className={`p-3 border rounded-lg text-center transition-colors ${
                  formData.type_recurrence === 'hebdomadaire'
                    ? 'bg-green-50 border-green-500 text-green-700'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Repeat className="w-5 h-5 mx-auto mb-1" />
                <span className="block font-medium">Hebdomadaire</span>
                <span className="text-sm text-gray-600">Même jour chaque semaine</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, type_recurrence: 'mensuel' }))}
                className={`p-3 border rounded-lg text-center transition-colors ${
                  formData.type_recurrence === 'mensuel'
                    ? 'bg-green-50 border-green-500 text-green-700'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Calendar className="w-5 h-5 mx-auto mb-1" />
                <span className="block font-medium">Mensuel</span>
                <span className="text-sm text-gray-600">Même date chaque mois</span>
              </button>
            </div>
          </div>

          {/* Jours de la semaine */}
          <div>
            <label className={`block font-medium text-gray-700 mb-3 ${isMobile ? 'text-lg' : ''}`}>
              📆 Jours de la semaine
            </label>
            <div className={`gap-2 ${isMobile ? 'grid grid-cols-4' : 'grid grid-cols-7'}`}>
              {JOURS_SEMAINE.map(jour => (
                <button
                  key={jour.id}
                  type="button"
                  onClick={() => handleJourToggle(jour.id)}
                  className={`touch-target rounded-lg font-medium transition-colors ${
                    isMobile ? 'py-3 text-sm' : 'py-2 px-3'
                  } ${
                    formData.jours_semaine.includes(jour.id)
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {isMobile ? jour.short : jour.nom}
                </button>
              ))}
            </div>
          </div>

          {/* Horaires */}
          <div className={`gap-4 ${isMobile ? 'space-y-4' : 'grid grid-cols-2'}`}>
            <div>
              <label className={`block font-medium text-gray-700 mb-2 ${isMobile ? 'text-base' : 'text-sm'}`}>
                🕐 Heure de début
              </label>
              <input
                type="time"
                value={formData.heure_debut}
                onChange={(e) => setFormData(prev => ({ ...prev, heure_debut: e.target.value }))}
                className={`w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  isMobile ? 'mobile-form-input' : 'px-3 py-2'
                }`}
                required
              />
            </div>
            <div>
              <label className={`block font-medium text-gray-700 mb-2 ${isMobile ? 'text-base' : 'text-sm'}`}>
                🕐 Heure de fin
              </label>
              <input
                type="time"
                value={formData.heure_fin}
                onChange={(e) => setFormData(prev => ({ ...prev, heure_fin: e.target.value }))}
                className={`w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  isMobile ? 'mobile-form-input' : 'px-3 py-2'
                }`}
                required
              />
            </div>
          </div>

          {/* Période */}
          <div className={`gap-4 ${isMobile ? 'space-y-4' : 'grid grid-cols-2'}`}>
            <div>
              <label className={`block font-medium text-gray-700 mb-2 ${isMobile ? 'text-base' : 'text-sm'}`}>
                📅 Date de début
              </label>
              <input
                type="date"
                value={formData.date_debut}
                onChange={(e) => setFormData(prev => ({ ...prev, date_debut: e.target.value }))}
                min={new Date().toISOString().split('T')[0]}
                className={`w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  isMobile ? 'mobile-form-input' : 'px-3 py-2'
                }`}
                required
              />
            </div>
            <div>
              <label className={`block font-medium text-gray-700 mb-2 ${isMobile ? 'text-base' : 'text-sm'}`}>
                📅 Date de fin
              </label>
              <input
                type="date"
                value={formData.date_fin}
                onChange={(e) => setFormData(prev => ({ ...prev, date_fin: e.target.value }))}
                min={formData.date_debut || new Date().toISOString().split('T')[0]}
                className={`w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  isMobile ? 'mobile-form-input' : 'px-3 py-2'
                }`}
                required
              />
            </div>
          </div>

          {/* Mode de paiement */}
          <div>
            <label className={`block font-medium text-gray-700 mb-3 ${isMobile ? 'text-lg' : ''}`}>
              💳 Mode de paiement
            </label>
            <div className={`gap-3 ${isMobile ? 'space-y-3' : 'grid grid-cols-2'}`}>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, mode_paiement: 'acompte' }))}
                className={`p-4 border rounded-lg text-left transition-colors ${
                  formData.mode_paiement === 'acompte'
                    ? 'bg-green-50 border-green-500 text-green-700'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <CreditCard className="w-5 h-5 mb-2" />
                <span className="block font-medium">Acompte ({formData.pourcentage_acompte}%)</span>
                <span className="text-sm text-gray-600">
                  Payez {formData.pourcentage_acompte}% maintenant, le reste à la fin
                </span>
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, mode_paiement: 'apres_match' }))}
                className={`p-4 border rounded-lg text-left transition-colors ${
                  formData.mode_paiement === 'apres_match'
                    ? 'bg-green-50 border-green-500 text-green-700'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Clock className="w-5 h-5 mb-2" />
                <span className="block font-medium">Après chaque match</span>
                <span className="text-sm text-gray-600">
                  Payez après chaque séance
                </span>
              </button>
            </div>

            {formData.mode_paiement === 'acompte' && (
              <div className="mt-3">
                <label className={`block font-medium text-gray-700 mb-2 ${isMobile ? 'text-base' : 'text-sm'}`}>
                  Pourcentage d'acompte
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="range"
                    min="20"
                    max="80"
                    step="10"
                    value={formData.pourcentage_acompte}
                    onChange={(e) => setFormData(prev => ({ ...prev, pourcentage_acompte: parseInt(e.target.value) }))}
                    className="flex-1"
                  />
                  <span className="font-bold text-green-600">{formData.pourcentage_acompte}%</span>
                </div>
              </div>
            )}
          </div>

          {/* Récapitulatif */}
          {calculatedValues.nombreSeances > 0 && (
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border border-green-200">
              <h3 className={`font-semibold text-gray-900 mb-3 ${isMobile ? 'text-lg' : ''}`}>
                📊 Récapitulatif
              </h3>
              <div className={`gap-3 ${isMobile ? 'space-y-2' : 'grid grid-cols-2'}`}>
                <div className={`${isMobile ? 'text-center' : ''}`}>
                  <span className="text-gray-600 block">Nombre de séances</span>
                  <span className="font-bold text-lg">{calculatedValues.nombreSeances}</span>
                </div>
                <div className={`${isMobile ? 'text-center' : ''}`}>
                  <span className="text-gray-600 block">Coût par séance</span>
                  <span className="font-bold text-lg">{calculatedValues.coutParSeance.toLocaleString()} CFA</span>
                </div>
                <div className={`${isMobile ? 'text-center' : ''}`}>
                  <span className="text-gray-600 block">Coût total</span>
                  <span className="font-bold text-xl text-green-600">{calculatedValues.coutTotal.toLocaleString()} CFA</span>
                </div>
                {formData.mode_paiement === 'acompte' && (
                  <div className={`${isMobile ? 'text-center' : ''}`}>
                    <span className="text-gray-600 block">Acompte à payer</span>
                    <span className="font-bold text-xl text-orange-600">{calculatedValues.acompte.toLocaleString()} CFA</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Avertissement amendes */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-800 mb-1">⚠️ Politique d'absence</h4>
                <p className={`text-yellow-700 ${isMobile ? 'text-sm' : 'text-sm'}`}>
                  En cas d'absence sans préavis, une amende de <strong>5 000 CFA</strong> sera appliquée.
                  Vous pourrez reporter votre séance à une autre date disponible.
                </p>
              </div>
            </div>
          </div>

          {/* Boutons */}
          <div className={`pt-4 border-t ${isMobile ? 'space-y-3' : 'flex justify-end space-x-3'}`}>
            <button
              type="button"
              onClick={onClose}
              className={`font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors ${
                isMobile ? 'w-full py-3' : 'px-6 py-2'
              }`}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading || calculatedValues.nombreSeances === 0}
              className={`font-semibold text-white bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                isMobile ? 'w-full py-3' : 'px-8 py-2'
              }`}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white inline-block mr-2"></div>
                  Création...
                </>
              ) : (
                <>
                  🔄 Créer l'abonnement
                  {formData.mode_paiement === 'acompte' && calculatedValues.acompte > 0 && 
                    ` (${calculatedValues.acompte.toLocaleString()} CFA)`
                  }
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecurringSubscriptionModal; 