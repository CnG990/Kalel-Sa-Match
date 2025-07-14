import React, { useState, useEffect } from 'react';
import { Ticket, CheckCircle, XCircle, AlertCircle, Users, Search, Hash, Clock, Sparkles, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import apiService from '../../services/api';

interface ValidationResult {
  valid: boolean;
  reservation?: {
    id: number;
    terrain_nom: string;
    client_nom: string;
    date_debut: string;
    date_fin: string;
    statut: string;
    code_ticket: string;
  };
  message: string;
}

const TicketValidationPage: React.FC = () => {
  const [ticketCode, setTicketCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [validationHistory, setValidationHistory] = useState<ValidationResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Détecter si on est sur mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Charger l'historique des validations récentes
  useEffect(() => {
    loadValidationHistory();
  }, []);

  const loadValidationHistory = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getValidationHistory({ limit: 5 });
      if (response.success && response.data) {
        setValidationHistory(response.data.slice(0, 5)); // Dernières 5 validations
      }
    } catch (error) {
      console.error('Erreur chargement historique:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Valider un code de ticket
  const validateTicketCode = async (code: string) => {
    if (!code || code.trim().length === 0) {
      toast.error('Veuillez saisir un code de ticket');
      return;
    }

    setIsValidating(true);
    
    try {
      const response = await apiService.validateTicketCode(code.trim().toUpperCase());

      if (response.success && response.data) {
        const result: ValidationResult = {
          valid: true,
          reservation: response.data.reservation,
          message: 'Ticket validé avec succès !'
        };
        
        setValidationResult(result);
        setValidationHistory(prev => [result, ...prev.slice(0, 4)]);
        toast.success('✅ Ticket validé !');
        setTicketCode(''); // Vider le champ après validation réussie
        
      } else {
        const result: ValidationResult = {
          valid: false,
          message: response.message || 'Code de ticket invalide'
        };
        setValidationResult(result);
        toast.error('❌ ' + result.message);
      }
    } catch (error: any) {
      console.error('Erreur validation:', error);
      const result: ValidationResult = {
        valid: false,
        message: error.response?.data?.message || 'Erreur lors de la validation'
      };
      setValidationResult(result);
      toast.error('❌ Erreur de validation');
    } finally {
      setIsValidating(false);
    }
  };

  // Gérer la soumission du formulaire
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    validateTicketCode(ticketCode);
  };

  // Nettoyer le résultat
  const clearResult = () => {
    setValidationResult(null);
    setTicketCode('');
    document.getElementById('ticket-input')?.focus();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header moderne avec animations */}
      <div className="text-center relative">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-400/20 via-purple-400/20 to-pink-400/20 rounded-3xl blur-xl"></div>
        <div className="relative bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-8">
          <div className={`mx-auto mb-4 p-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 shadow-lg inline-block`}>
            <Ticket className={`text-white ${isMobile ? 'w-12 h-12' : 'w-16 h-16'}`} />
          </div>
          <h1 className={`font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent ${isMobile ? 'text-2xl' : 'text-4xl'} mb-3`}>
            Vérification des Tickets
          </h1>
          <p className={`text-gray-600 max-w-2xl mx-auto ${isMobile ? 'text-base' : 'text-lg'}`}>
            Scanner et valider les réservations de vos clients en toute simplicité
          </p>
          <div className="flex items-center justify-center space-x-6 mt-6">
            <div className="flex items-center space-x-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm font-medium">Validation rapide</span>
            </div>
            <div className="flex items-center space-x-2 text-blue-600">
              <Clock className="w-5 h-5" />
              <span className="text-sm font-medium">Temps réel</span>
            </div>
            <div className="flex items-center space-x-2 text-purple-600">
              <Sparkles className="w-5 h-5" />
              <span className="text-sm font-medium">Automatique</span>
            </div>
          </div>
        </div>
      </div>

      {/* Formulaire de validation amélioré */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 via-blue-400/20 to-purple-400/20 rounded-3xl blur-xl"></div>
        <div className="relative bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/30 overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-blue-600 px-6 py-4">
            <h2 className="text-white font-bold text-xl flex items-center">
              <Search className="w-6 h-6 mr-3" />
              Scanner le Code Ticket
            </h2>
          </div>
          
          <form onSubmit={handleSubmit} className={`${isMobile ? 'p-6' : 'p-8'}`}>
            <div className="flex flex-col items-center space-y-6">
              <div className={`w-full ${isMobile ? '' : 'max-w-md'}`}>
                <label htmlFor="ticket-input" className={`block font-bold text-gray-800 mb-4 ${
                  isMobile ? 'text-lg text-center' : 'text-xl text-center'
                }`}>
                  {isMobile ? '🎫 Saisissez le Code' : '🎫 Code du Ticket Client'}
                </label>
                <div className="relative group">
                  <input
                    id="ticket-input"
                    type="text"
                    value={ticketCode}
                    onChange={(e) => setTicketCode(e.target.value)}
                    placeholder={isMobile ? "123456" : "Ex: 123456"}
                    className={`w-full border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/30 focus:border-indigo-500 text-center font-mono tracking-widest uppercase transition-all duration-300 bg-gradient-to-r from-gray-50 to-white shadow-inner group-hover:shadow-lg ${
                      isMobile 
                        ? 'text-3xl py-6 px-6' 
                        : 'px-6 py-5 text-2xl'
                    }`}
                    disabled={isValidating}
                    autoComplete="off"
                    autoFocus
                    inputMode="numeric"
                    pattern="[0-9]*"
                  />
                  <div className={`absolute inset-y-0 right-0 flex items-center ${
                    isMobile ? 'pr-6' : 'pr-6'
                  }`}>
                    <div className="p-2 bg-indigo-100 rounded-xl">
                      <Hash className={`text-indigo-600 ${isMobile ? 'h-6 w-6' : 'h-5 w-5'}`} />
                    </div>
                  </div>
                </div>
                <p className={`text-gray-500 mt-3 text-center ${
                  isMobile ? 'text-base' : 'text-lg'
                }`}>
                  <strong>Format:</strong> Saisissez les <span className="text-indigo-600 font-bold">6 derniers chiffres</span>
                </p>
                <div className="mt-3 flex justify-center">
                  <div className="bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-2">
                    <span className="text-indigo-700 font-mono text-sm">
                      TSK-KSM-2025-<span className="bg-indigo-200 px-2 py-1 rounded font-bold">123456</span>
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isValidating || !ticketCode.trim()}
                className={`font-bold shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-4 transition-all duration-300 transform hover:scale-105 active:scale-95 bg-gradient-to-r from-green-500 via-blue-500 to-purple-600 text-white rounded-2xl hover:shadow-green-500/30 ${
                  isMobile 
                    ? 'text-xl py-6 px-12 w-full' 
                    : 'px-12 py-5 text-xl'
                }`}
              >
                {isValidating ? (
                  <>
                    <div className="animate-spin rounded-full h-7 w-7 border-b-3 border-white"></div>
                    <span>Validation en cours...</span>
                  </>
                ) : (
                  <>
                    <div className="p-2 bg-white/20 rounded-xl">
                      <Search className={`${isMobile ? 'w-6 h-6' : 'w-6 h-6'}`} />
                    </div>
                    <span>Valider le Ticket</span>
                    <Sparkles className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Résultat de la validation moderne */}
      {validationResult && (
        <div className="relative">
          <div className={`absolute inset-0 ${
            validationResult.valid 
              ? 'bg-gradient-to-r from-green-400/30 to-emerald-400/30' 
              : 'bg-gradient-to-r from-red-400/30 to-pink-400/30'
          } rounded-3xl blur-xl`}></div>
          
          <div className={`relative bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border overflow-hidden ${
            validationResult.valid ? 'border-green-200' : 'border-red-200'
          }`}>
            <div className={`px-6 py-4 ${
              validationResult.valid 
                ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
                : 'bg-gradient-to-r from-red-500 to-pink-600'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {validationResult.valid ? (
                    <div className="p-2 bg-white/20 rounded-xl">
                      <CheckCircle className="w-8 h-8 text-white" />
                    </div>
                  ) : (
                    <div className="p-2 bg-white/20 rounded-xl">
                      <XCircle className="w-8 h-8 text-white" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-white font-bold text-2xl">
                      {validationResult.valid ? 'Ticket Valide !' : 'Ticket Invalide'}
                    </h3>
                    <p className="text-white/90 text-lg">
                      {validationResult.message}
                    </p>
                  </div>
                </div>
                
                {!isMobile && (
                  <button
                    onClick={clearResult}
                    className="text-white/80 hover:text-white transition-colors p-3 rounded-xl hover:bg-white/10"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                )}
              </div>
            </div>
            
            <div className={`${isMobile ? 'p-6' : 'p-8'}`}>
              {/* Détails réservation avec design moderne */}
              {validationResult.reservation && (
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-green-50 via-blue-50 to-purple-50 rounded-2xl p-6 border border-green-200">
                    <h4 className="font-bold text-gray-900 mb-6 flex items-center text-xl">
                      <Star className="mr-3 w-6 h-6 text-yellow-500" />
                      Détails de la Réservation
                    </h4>
                    
                    <div className={`gap-4 ${isMobile ? 'space-y-4' : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
                      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 transform hover:scale-105 transition-transform">
                        <div className="flex items-center mb-3">
                          <div className="p-2 bg-green-100 rounded-lg mr-3">
                            <span className="text-2xl">🏟️</span>
                          </div>
                          <span className="text-gray-600 font-semibold">Terrain</span>
                        </div>
                        <span className="font-bold text-gray-900 text-lg block">
                          {validationResult.reservation.terrain_nom}
                        </span>
                      </div>
                      
                      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 transform hover:scale-105 transition-transform">
                        <div className="flex items-center mb-3">
                          <div className="p-2 bg-blue-100 rounded-lg mr-3">
                            <span className="text-2xl">👤</span>
                          </div>
                          <span className="text-gray-600 font-semibold">Client</span>
                        </div>
                        <span className="font-bold text-gray-900 text-lg block">
                          {validationResult.reservation.client_nom}
                        </span>
                      </div>
                      
                      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 transform hover:scale-105 transition-transform">
                        <div className="flex items-center mb-3">
                          <div className="p-2 bg-purple-100 rounded-lg mr-3">
                            <span className="text-2xl">🕐</span>
                          </div>
                          <span className="text-gray-600 font-semibold">Horaires</span>
                        </div>
                        <div className="space-y-1">
                          <p className="font-bold text-gray-900">
                            {new Date(validationResult.reservation.date_debut).toLocaleString('fr-FR', {
                              day: '2-digit',
                              month: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                          <p className="text-gray-600 text-sm">
                            à {new Date(validationResult.reservation.date_fin).toLocaleTimeString('fr-FR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                      
                      <div className={`bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl shadow-lg p-4 transform hover:scale-105 transition-transform ${
                        isMobile ? '' : 'md:col-span-2 lg:col-span-3'
                      }`}>
                        <div className="flex items-center mb-3">
                          <div className="p-2 bg-white/20 rounded-lg mr-3">
                            <Ticket className="w-6 h-6 text-white" />
                          </div>
                          <span className="font-semibold text-white/90">Code Ticket Confirmé</span>
                        </div>
                        <span className="font-mono font-bold text-white text-xl bg-white/20 px-4 py-2 rounded-lg inline-block">
                          {validationResult.reservation.code_ticket}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Actions */}
              <div className="flex justify-center mt-8">
                <button
                  onClick={clearResult}
                  className={`font-bold shadow-xl flex items-center justify-center space-x-4 transition-all duration-300 transform hover:scale-105 active:scale-95 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white rounded-2xl ${
                    isMobile 
                      ? 'w-full text-lg py-4 px-8' 
                      : 'px-10 py-4 text-lg'
                  }`}
                >
                  <Ticket className="w-6 h-6" />
                  <span>Valider un Autre Ticket</span>
                  <Sparkles className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Instructions modernes */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-indigo-400/20 to-purple-400/20 rounded-3xl blur-xl"></div>
        <div className="relative bg-white/90 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4">
            <h3 className="text-white font-bold text-xl flex items-center">
              <AlertCircle className="w-6 h-6 mr-3" />
              Guide d'Utilisation
            </h3>
          </div>
          
          <div className={`${isMobile ? 'p-6' : 'p-8'}`}>
            <div className={`gap-6 ${isMobile ? 'space-y-6' : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4'}`}>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200 text-center transform hover:scale-105 transition-transform">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📱</span>
                </div>
                <h4 className="font-bold text-green-900 mb-2">1. Réception</h4>
                <p className="text-green-700 text-sm">Le client présente son ticket QR ou code</p>
              </div>
              
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200 text-center transform hover:scale-105 transition-transform">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Hash className="w-8 h-8 text-white" />
                </div>
                <h4 className="font-bold text-blue-900 mb-2">2. Saisie</h4>
                <p className="text-blue-700 text-sm">Tapez les 6 derniers chiffres du code</p>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200 text-center transform hover:scale-105 transition-transform">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-white" />
                </div>
                <h4 className="font-bold text-purple-900 mb-2">3. Validation</h4>
                <p className="text-purple-700 text-sm">Vérification automatique en temps réel</p>
              </div>
              
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-200 text-center transform hover:scale-105 transition-transform">
                <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <h4 className="font-bold text-yellow-900 mb-2">4. Accès</h4>
                <p className="text-yellow-700 text-sm">Si valide, le client accède au terrain</p>
              </div>
            </div>
            
            <div className="mt-8 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-2xl p-6 border border-indigo-200">
              <div className="text-center">
                <h4 className="font-bold text-indigo-900 mb-3 text-lg">💡 Format du Code Ticket</h4>
                <div className="bg-white rounded-xl p-4 border border-indigo-200 inline-block">
                  <p className="font-mono text-lg text-gray-800 mb-2">
                    TSK-KSM-2025-<span className="bg-indigo-200 px-3 py-1 rounded-lg font-bold text-indigo-800">123456</span>
                  </p>
                  <p className="text-sm text-indigo-600">
                    ↑ Saisissez uniquement ces 6 chiffres
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Historique moderne */}
      {validationHistory.length > 0 && (
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-400/20 via-gray-400/20 to-zinc-400/20 rounded-3xl blur-xl"></div>
          <div className="relative bg-white/90 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-600 to-gray-700 px-6 py-4">
              <h2 className="text-white font-bold text-xl flex items-center">
                <Users className="w-6 h-6 mr-3" />
                Historique des Validations
              </h2>
            </div>
            
            <div className={`${isMobile ? 'p-6' : 'p-8'}`}>
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-600"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {validationHistory.map((validation, index) => (
                    <div key={index} className={`rounded-2xl shadow-lg border transform hover:scale-102 transition-all duration-200 ${
                      validation.valid 
                        ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' 
                        : 'bg-gradient-to-r from-red-50 to-pink-50 border-red-200'
                    }`}>
                      <div className={`${isMobile ? 'p-4' : 'p-6'}`}>
                        <div className={`${isMobile ? 'space-y-3' : 'flex items-center justify-between'}`}>
                          <div className={`${isMobile ? 'space-y-3' : 'flex items-center space-x-4'}`}>
                            <div className={`${isMobile ? 'flex justify-center' : ''}`}>
                              {validation.valid ? (
                                <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl">
                                  <CheckCircle className="text-white w-8 h-8" />
                                </div>
                              ) : (
                                <div className="p-3 bg-gradient-to-r from-red-500 to-pink-600 rounded-2xl">
                                  <XCircle className="text-white w-8 h-8" />
                                </div>
                              )}
                            </div>
                            
                            <div className={`${isMobile ? 'text-center' : 'flex-1'}`}>
                              <div className={`${isMobile ? 'space-y-2' : 'flex items-center space-x-4'}`}>
                                <span className={`font-bold text-gray-900 ${isMobile ? 'block text-lg' : 'text-lg'}`}>
                                  {validation.reservation?.client_nom || 'Validation échouée'}
                                </span>
                                {validation.reservation && (
                                  <span className="font-mono bg-gray-200 px-3 py-2 rounded-lg text-sm border">
                                    {validation.reservation.code_ticket}
                                  </span>
                                )}
                              </div>
                              {validation.reservation && (
                                <div className={`mt-2 ${isMobile ? 'space-y-1' : 'flex space-x-4'}`}>
                                  <span className="text-gray-600 text-sm flex items-center">
                                    <span className="mr-1">🏟️</span>
                                    {validation.reservation.terrain_nom}
                                  </span>
                                  <span className="text-gray-600 text-sm flex items-center">
                                    <span className="mr-1">📊</span>
                                    {validation.reservation.statut}
                                  </span>
                                  <span className="text-gray-600 text-sm flex items-center">
                                    <span className="mr-1">📅</span>
                                    {new Date(validation.reservation.date_debut).toLocaleDateString('fr-FR')}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className={`${isMobile ? 'text-center' : ''}`}>
                            <span className="bg-gray-100 text-gray-600 px-3 py-2 rounded-lg text-xs font-medium border">
                              <Clock className="w-3 h-3 inline mr-1" />
                              {new Date().toLocaleTimeString('fr-FR')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {validationHistory.length === 0 && (
                    <div className="text-center py-16">
                      <div className="w-20 h-20 bg-gradient-to-r from-gray-200 to-gray-300 rounded-3xl flex items-center justify-center mx-auto mb-4">
                        <Ticket className="w-10 h-10 text-gray-400" />
                      </div>
                      <p className="text-gray-500 text-xl font-medium">Aucune validation récente</p>
                      <p className="text-gray-400 mt-2">Les validations apparaîtront ici</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketValidationPage; 