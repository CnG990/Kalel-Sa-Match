import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  User, 
  CheckCircle, 
  XCircle, 
  DollarSign, 
  Repeat,
  Search,
  } from 'lucide-react';
import apiService from '../services/api';
import toast from 'react-hot-toast';

interface SessionData {
  id: number;
  abonnement_id: number;
  client_nom: string;
  client_telephone: string;
  terrain_nom: string;
  date_seance: string;
  heure_debut: string;
  heure_fin: string;
  statut: 'programmee' | 'presente' | 'absente' | 'reportee' | 'annulee';
  amende_appliquee: boolean;
  montant_amende: number;
  amende_payee: boolean;
  notes?: string;
  date_report?: string;
  heure_debut_report?: string;
  heure_fin_report?: string;
}

interface RescheduleModalProps {
  session: SessionData | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const RescheduleModal: React.FC<RescheduleModalProps> = ({ session, isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [reason, setReason] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isOpen && session) {
      fetchAvailableSlots();
    }
  }, [isOpen, session]);

  const fetchAvailableSlots = async () => {
    if (!session) return;
    
    try {
      const dateFin = new Date();
      dateFin.setMonth(dateFin.getMonth() + 1); // 1 mois à l'avance

      // Simuler des créneaux disponibles (à remplacer par l'API réelle)
      const mockSlots = [
        { date: '2025-01-25', heure_debut: '18:00', heure_fin: '19:00', disponible: true },
        { date: '2025-01-26', heure_debut: '17:00', heure_fin: '18:00', disponible: true },
        { date: '2025-01-27', heure_debut: '19:00', heure_fin: '20:00', disponible: true },
        { date: '2025-01-28', heure_debut: '16:00', heure_fin: '17:00', disponible: true },
      ];
      
      setAvailableSlots(mockSlots);
    } catch (error) {
      console.error('Erreur chargement créneaux:', error);
      toast.error('Erreur lors du chargement des créneaux disponibles');
    }
  };

  const handleReschedule = async () => {
    if (!session || !selectedSlot || !reason.trim()) {
      toast.error('Veuillez sélectionner un créneau et indiquer la raison');
      return;
    }

    setLoading(true);
    
    try {
      const response = await apiService.rescheduleSession(session.id, {
        nouvelle_date: selectedSlot.date,
        nouvelle_heure_debut: selectedSlot.heure_debut,
        nouvelle_heure_fin: selectedSlot.heure_fin,
        reason: reason
      });

      if (response.success) {
        toast.success('Séance reportée avec succès');
        onSuccess();
        onClose();
      } else {
        toast.error(response.message || 'Erreur lors du report');
      }
    } catch (error) {
      console.error('Erreur report:', error);
      toast.error('Erreur lors du report de la séance');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !session) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-xl shadow-2xl w-full max-h-[90vh] overflow-y-auto ${
        isMobile ? 'max-w-sm' : 'max-w-lg'
      }`}>
        <div className={`border-b flex items-center justify-between ${isMobile ? 'px-4 py-3' : 'px-6 py-4'}`}>
          <h3 className={`font-semibold text-gray-900 ${isMobile ? 'text-lg' : 'text-xl'}`}>
            📅 Reporter la séance
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 touch-target">
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <div className={isMobile ? 'p-4 space-y-4' : 'p-6 space-y-6'}>
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Séance actuelle</h4>
            <p className="text-sm text-gray-600">
              {session.client_nom} • {new Date(session.date_seance).toLocaleDateString('fr-FR')} • 
              {session.heure_debut}-{session.heure_fin}
            </p>
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-2">Raison du report</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex: Client malade, problème personnel..."
              className={`w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                isMobile ? 'p-3 text-base' : 'p-3'
              }`}
              rows={3}
              required
            />
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-3">Nouveau créneau</label>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {availableSlots.map((slot, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setSelectedSlot(slot)}
                  className={`w-full p-3 border rounded-lg text-left transition-colors ${
                    selectedSlot === slot
                      ? 'bg-green-50 border-green-500 text-green-700'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">
                      {new Date(slot.date).toLocaleDateString('fr-FR', { 
                        weekday: 'long', 
                        day: 'numeric', 
                        month: 'long' 
                      })}
                    </span>
                    <span className="text-sm text-gray-600">
                      {slot.heure_debut}-{slot.heure_fin}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className={`pt-4 border-t ${isMobile ? 'space-y-3' : 'flex justify-end space-x-3'}`}>
            <button
              onClick={onClose}
              className={`font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors ${
                isMobile ? 'w-full py-3' : 'px-6 py-2'
              }`}
            >
              Annuler
            </button>
            <button
              onClick={handleReschedule}
              disabled={loading || !selectedSlot || !reason.trim()}
              className={`font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50 ${
                isMobile ? 'w-full py-3' : 'px-6 py-2'
              }`}
            >
              {loading ? 'Report...' : 'Confirmer le report'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const SubscriptionSessionsManager: React.FC = () => {
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  
  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('today');
  
  // Modals
  const [rescheduleModal, setRescheduleModal] = useState<{
    isOpen: boolean;
    session: SessionData | null;
  }>({ isOpen: false, session: null });

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      // Simuler des données de séances (à remplacer par l'API réelle)
      const mockSessions: SessionData[] = [
        {
          id: 1,
          abonnement_id: 1,
          client_nom: "Mamadou Diallo",
          client_telephone: "+221 77 123 45 67",
          terrain_nom: "Terrain Almadies",
          date_seance: "2025-01-24",
          heure_debut: "18:00",
          heure_fin: "19:00",
          statut: "programmee",
          amende_appliquee: false,
          montant_amende: 5000,
          amende_payee: false,
          notes: "Abonnement vendredi soir"
        },
        {
          id: 2,
          abonnement_id: 2,
          client_nom: "Awa Seck",
          client_telephone: "+221 78 987 65 43",
          terrain_nom: "Terrain Médina",
          date_seance: "2025-01-24",
          heure_debut: "17:00",
          heure_fin: "18:00",
          statut: "absente",
          amende_appliquee: true,
          montant_amende: 5000,
          amende_payee: false,
          notes: "Absence signalée"
        },
        {
          id: 3,
          abonnement_id: 3,
          client_nom: "Omar Ba",
          client_telephone: "+221 76 555 44 33",
          terrain_nom: "Terrain Point E",
          date_seance: "2025-01-24",
          heure_debut: "19:00",
          heure_fin: "20:00",
          statut: "presente",
          amende_appliquee: false,
          montant_amende: 5000,
          amende_payee: false,
          notes: "Séance réalisée"
        }
      ];
      
      setSessions(mockSessions);
    } catch (error) {
      console.error('Erreur chargement séances:', error);
      toast.error('Erreur lors du chargement des séances');
    } finally {
      setLoading(false);
    }
  };

  const markSessionAbsent = async (sessionId: number) => {
    try {
      const response = await apiService.markSessionAbsent(sessionId, 'Absence constatée par le gestionnaire');
      
      if (response.success) {
        toast.success('Absence marquée - Amende de 5 000 CFA appliquée');
        fetchSessions();
      } else {
        toast.error(response.message || 'Erreur lors du marquage');
      }
    } catch (error) {
      console.error('Erreur marquage absence:', error);
      toast.error('Erreur lors du marquage de l\'absence');
    }
  };

  const markSessionPresent = async (sessionId: number) => {
    try {
      // Mettre à jour le statut localement pour demo
      setSessions(prev => prev.map(session => 
        session.id === sessionId 
          ? { ...session, statut: 'presente' as const }
          : session
      ));
      toast.success('Présence confirmée');
    } catch (error) {
      console.error('Erreur marquage présence:', error);
      toast.error('Erreur lors du marquage de la présence');
    }
  };

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'presente':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'absente':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'programmee':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'reportee':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'annulee':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (statut: string) => {
    switch (statut) {
      case 'presente':
        return <CheckCircle className="w-4 h-4" />;
      case 'absente':
        return <XCircle className="w-4 h-4" />;
      case 'programmee':
        return <Calendar className="w-4 h-4" />;
      case 'reportee':
        return <Repeat className="w-4 h-4" />;
      case 'annulee':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  const getStatusText = (statut: string) => {
    switch (statut) {
      case 'presente': return 'Présent(e)';
      case 'absente': return 'Absent(e)';
      case 'programmee': return 'Programmée';
      case 'reportee': return 'Reportée';
      case 'annulee': return 'Annulée';
      default: return 'Inconnue';
    }
  };

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = 
      session.client_nom.toLowerCase().includes(search.toLowerCase()) ||
      session.terrain_nom.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || session.statut === statusFilter;
    
    const today = new Date().toISOString().split('T')[0];
    const sessionDate = session.date_seance;
    
    let matchesDate = true;
    if (dateFilter === 'today') {
      matchesDate = sessionDate === today;
    } else if (dateFilter === 'week') {
      const weekFromNow = new Date();
      weekFromNow.setDate(weekFromNow.getDate() + 7);
      matchesDate = sessionDate >= today && sessionDate <= weekFromNow.toISOString().split('T')[0];
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className={`font-semibold text-gray-900 ${isMobile ? 'text-xl' : 'text-2xl'}`}>
          Gestion des Séances
        </h1>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className={`bg-white rounded-lg shadow-lg ${isMobile ? 'p-4' : 'p-6'}`}>
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className={`font-semibold text-gray-900 ${isMobile ? 'text-xl' : 'text-2xl'}`}>
          🗓️ Gestion des Séances
        </h1>
        <p className={`text-gray-600 ${isMobile ? 'text-sm' : ''}`}>
          Gérez les présences, absences et reports des séances d'abonnement
        </p>
      </div>

      {/* Filtres */}
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${
        isMobile ? 'p-3 space-y-3' : 'p-4 space-y-4 sm:space-y-0 sm:flex sm:items-center sm:space-x-4'
      }`}>
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={isMobile ? "Rechercher..." : "Rechercher par client ou terrain..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                isMobile ? 'py-3 text-base' : 'py-2'
              }`}
            />
          </div>
        </div>
        
        <div className={`gap-3 ${isMobile ? 'grid grid-cols-2' : 'flex'}`}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
              isMobile ? 'px-3 py-3 text-base' : 'px-3 py-2'
            }`}
          >
            <option value="all">Tous les statuts</option>
            <option value="programmee">Programmées</option>
            <option value="presente">Présentes</option>
            <option value="absente">Absentes</option>
            <option value="reportee">Reportées</option>
          </select>
          
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className={`border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
              isMobile ? 'px-3 py-3 text-base' : 'px-3 py-2'
            }`}
          >
            <option value="today">Aujourd'hui</option>
            <option value="week">Cette semaine</option>
            <option value="all">Toutes</option>
          </select>
        </div>
      </div>

      {/* Liste des séances */}
      {filteredSessions.length === 0 ? (
        <div className={`text-center bg-gray-50 rounded-lg ${isMobile ? 'py-8' : 'py-12'}`}>
          <Calendar className={`mx-auto text-gray-400 ${isMobile ? 'h-10 w-10' : 'h-12 w-12'}`} />
          <h3 className={`mt-2 font-medium text-gray-900 ${isMobile ? 'text-base' : 'text-sm'}`}>
            Aucune séance
          </h3>
          <p className={`mt-1 text-gray-500 ${isMobile ? 'text-sm' : 'text-sm'}`}>
            Aucune séance ne correspond aux filtres sélectionnés.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSessions.map((session) => (
            <div key={session.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className={isMobile ? 'p-4' : 'p-6'}>
                <div className={`${isMobile ? 'space-y-4' : 'flex items-start justify-between'}`}>
                  <div className="flex-1">
                    <div className={`${isMobile ? 'space-y-2' : 'flex items-center space-x-3 mb-2'}`}>
                      <h3 className={`font-semibold text-gray-900 ${isMobile ? 'text-lg' : 'text-xl'}`}>
                        {session.client_nom}
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(session.statut)}`}>
                        {getStatusIcon(session.statut)}
                        <span className="ml-1">{getStatusText(session.statut)}</span>
                      </span>
                    </div>
                    
                    <div className={`gap-4 ${isMobile ? 'space-y-2' : 'grid grid-cols-1 md:grid-cols-3'}`}>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-500 flex-shrink-0" />
                        <span className={`text-gray-600 ${isMobile ? 'text-sm' : 'text-sm'}`}>
                          {new Date(session.date_seance).toLocaleDateString('fr-FR', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long'
                          })}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-500 flex-shrink-0" />
                        <span className={`text-gray-600 ${isMobile ? 'text-sm' : 'text-sm'}`}>
                          {session.heure_debut} - {session.heure_fin}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-500 flex-shrink-0" />
                        <span className={`text-gray-600 ${isMobile ? 'text-sm' : 'text-sm'}`}>
                          {session.terrain_nom}
                        </span>
                      </div>
                    </div>

                    {session.amende_appliquee && (
                      <div className={`mt-3 p-3 bg-red-50 border border-red-200 rounded-lg ${isMobile ? '' : ''}`}>
                        <div className="flex items-center space-x-2">
                          <DollarSign className="w-4 h-4 text-red-600" />
                          <span className="text-sm font-medium text-red-800">
                            Amende: {session.montant_amende.toLocaleString()} CFA
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            session.amende_payee 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {session.amende_payee ? 'Payée' : 'Non payée'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Actions */}
                <div className={`pt-4 border-t border-gray-200 ${
                  isMobile ? 'space-y-3' : 'flex items-center justify-between'
                }`}>
                  <div className={`${isMobile ? 'grid grid-cols-2 gap-2' : 'flex space-x-3'}`}>
                    {session.statut === 'programmee' && (
                      <>
                        <button
                          onClick={() => markSessionPresent(session.id)}
                          className={`flex items-center justify-center space-x-1 text-green-600 hover:text-green-800 transition-colors ${
                            isMobile ? 'py-2 px-3 bg-green-50 rounded-lg touch-target' : 'text-sm'
                          }`}
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Présent</span>
                        </button>
                        
                        <button
                          onClick={() => markSessionAbsent(session.id)}
                          className={`flex items-center justify-center space-x-1 text-red-600 hover:text-red-800 transition-colors ${
                            isMobile ? 'py-2 px-3 bg-red-50 rounded-lg touch-target' : 'text-sm'
                          }`}
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Absent</span>
                        </button>
                      </>
                    )}
                    
                    {(session.statut === 'programmee' || session.statut === 'absente') && (
                      <button
                        onClick={() => setRescheduleModal({ isOpen: true, session })}
                        className={`flex items-center justify-center space-x-1 text-blue-600 hover:text-blue-800 transition-colors ${
                          isMobile ? 'py-2 px-3 bg-blue-50 rounded-lg touch-target col-span-2' : 'text-sm'
                        }`}
                      >
                        <Repeat className="w-4 h-4" />
                        <span>Reporter</span>
                      </button>
                    )}
                  </div>
                  
                  <div className={`${isMobile ? 'text-center' : 'text-right'}`}>
                    <p className="text-xs text-gray-500">
                      Tel: {session.client_telephone}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de report */}
      <RescheduleModal
        session={rescheduleModal.session}
        isOpen={rescheduleModal.isOpen}
        onClose={() => setRescheduleModal({ isOpen: false, session: null })}
        onSuccess={() => {
          fetchSessions();
          setRescheduleModal({ isOpen: false, session: null });
        }}
      />
    </div>
  );
};

export default SubscriptionSessionsManager; 