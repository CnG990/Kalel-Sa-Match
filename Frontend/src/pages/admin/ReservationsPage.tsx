import React, { useState, useEffect } from 'react';
import apiService from '../../services/api';
import toast from 'react-hot-toast';
import { Search, Filter, Calendar, Clock, Eye, Trash2, CheckCircle, XCircle, Loader2, AlertTriangle, MessageSquare, Ticket, QrCode, Check, Plus } from 'lucide-react';

interface Reservation {
  id: number;
  terrain_id: number;
  user_id: number;
  date_debut: string;
  date_fin: string;
  montant_total: number;
  statut: 'en_attente' | 'confirmee' | 'annulee' | 'terminee';
  notes?: string;
  notes_admin?: string;
  code_ticket?: string;
  derniere_validation?: string;
  has_ticket: boolean;
  ticket_validated: boolean;
  duree_heures: number;
  created_at: string;
  user: {
    nom: string;
    prenom: string;
    email: string;
    telephone?: string;
  };
  terrain: {
    nom: string;
    terrain_synthetique: {
      nom: string;
      adresse: string;
    };
  };
  paiements?: Array<{
    id: number;
    montant: number;
    statut: string;
    methode: string;
    created_at: string;
  }>;
}

interface ReservationStats {
  total: number;
  en_attente: number;
  confirmees: number;
  annulees: number;
  terminees: number;
  avec_tickets: number;
  tickets_valides: number;
}

const ReservationsPage: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [stats, setStats] = useState<ReservationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    statut: '',
    date_debut: '',
    date_fin: '',
    terrain_id: '',
    probleme: false
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [ticketCode, setTicketCode] = useState('');
  const [validatingTicket, setValidatingTicket] = useState(false);

  useEffect(() => {
    fetchReservations();
  }, [filters]);

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const response = await apiService.getAllReservations({ 
        search: searchTerm,
        ...filters 
      });
      if (response.success) {
        setReservations(response.data?.data || []);
        setStats(response.data?.stats || null);
      } else {
        toast.error("Impossible de charger les réservations.");
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette réservation ? Cette action est irréversible.')) return;
    
    try {
      const response = await apiService.deleteReservation(id);
      if (response.success) {
        toast.success('Réservation supprimée avec succès');
        fetchReservations();
      } else {
        toast.error(response.message || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleAddNotes = async () => {
    if (!selectedReservation || !adminNotes.trim()) return;
    
    try {
      const response = await apiService.updateReservationNotes(selectedReservation.id, adminNotes);
      if (response.success) {
        toast.success('Notes ajoutées avec succès');
        setShowNotesModal(false);
        setAdminNotes('');
        fetchReservations();
      } else {
        toast.error(response.message || 'Erreur lors de l\'ajout des notes');
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleGenerateTicket = async (reservationId: number) => {
    try {
      const response = await apiService.post(`/admin/reservations/${reservationId}/generate-ticket`);
      if (response.success) {
        toast.success('Ticket généré avec succès');
        fetchReservations();
      } else {
        toast.error(response.message || 'Erreur lors de la génération du ticket');
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleValidateTicket = async () => {
    if (!ticketCode.trim()) {
      toast.error('Veuillez saisir un code de ticket');
      return;
    }

    setValidatingTicket(true);
    try {
      const response = await apiService.post('/admin/tickets/validate', {
        code_ticket: ticketCode
      });
      
      if (response.success) {
        toast.success('Ticket validé avec succès');
        setTicketCode('');
        setShowTicketModal(false);
        fetchReservations();
      } else {
        toast.error(response.message || 'Code de ticket invalide');
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleViewDetails = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    // setShowDetailsModal(true); // Supprimer la variable showDetailsModal inutilisée
  };

  const handleAddNotesClick = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setAdminNotes(reservation.notes_admin || '');
    setShowNotesModal(true);
  };

  const getReservationsWithProblems = () => {
    return reservations.filter(r => 
      r.statut === 'annulee' || 
      (new Date(r.date_debut) < new Date() && r.statut === 'en_attente') ||
      r.paiements?.some(p => p.statut === 'echec')
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF'
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'en_attente': { color: 'bg-yellow-100 text-yellow-800', label: 'En attente' },
      'confirmee': { color: 'bg-green-100 text-green-800', label: 'Confirmée' },
      'annulee': { color: 'bg-red-100 text-red-800', label: 'Annulée' },
      'terminee': { color: 'bg-gray-100 text-gray-800', label: 'Terminée' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || { color: 'bg-gray-100 text-gray-800', label: status };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getTicketBadge = (reservation: Reservation) => {
    if (!reservation.has_ticket) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <XCircle className="w-3 h-3 mr-1" />
          Pas de ticket
        </span>
      );
    }

    if (reservation.ticket_validated) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Validé
        </span>
      );
    }

    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
        <Ticket className="w-3 h-3 mr-1" />
        Non utilisé
      </span>
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Réservations</h1>
          <p className="text-gray-600 mt-2">Surveillance et gestion des réservations et tickets</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowTicketModal(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <QrCode className="w-4 h-4" />
            Valider ticket
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filtres
          </button>
          <button
            onClick={fetchReservations}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            Actualiser
          </button>
        </div>
      </div>

      {/* Statistiques */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-blue-600">Total</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{stats.en_attente}</div>
            <div className="text-sm text-yellow-600">En attente</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{stats.confirmees}</div>
            <div className="text-sm text-green-600">Confirmées</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{stats.annulees}</div>
            <div className="text-sm text-red-600">Annulées</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-gray-600">{stats.terminees}</div>
            <div className="text-sm text-gray-600">Terminées</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{stats.avec_tickets}</div>
            <div className="text-sm text-purple-600">Avec tickets</div>
          </div>
          <div className="bg-indigo-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-indigo-600">{stats.tickets_valides}</div>
            <div className="text-sm text-indigo-600">Tickets validés</div>
          </div>
        </div>
      )}

      {/* Alertes pour les problèmes */}
      {getReservationsWithProblems().length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
            <span className="text-yellow-800 font-medium">
              {getReservationsWithProblems().length} réservation(s) nécessitent votre attention
            </span>
          </div>
        </div>
      )}

      {/* Barre de recherche et filtres */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher par nom, email ou terrain..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && fetchReservations()}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Filtres étendus */}
        {showFilters && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-5 gap-4 p-4 bg-gray-50 rounded-lg">
            <select
              value={filters.statut}
              onChange={(e) => setFilters({ ...filters, statut: e.target.value })}
              className="border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">Tous les statuts</option>
              <option value="en_attente">En attente</option>
              <option value="confirmee">Confirmée</option>
              <option value="annulee">Annulée</option>
              <option value="terminee">Terminée</option>
            </select>

            <input
              type="date"
              value={filters.date_debut}
              onChange={(e) => setFilters({ ...filters, date_debut: e.target.value })}
              className="border border-gray-300 rounded-md px-3 py-2"
              placeholder="Date de début"
            />

            <input
              type="date"
              value={filters.date_fin}
              onChange={(e) => setFilters({ ...filters, date_fin: e.target.value })}
              className="border border-gray-300 rounded-md px-3 py-2"
              placeholder="Date de fin"
            />

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={filters.probleme}
                onChange={(e) => setFilters({ ...filters, probleme: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm">Avec problèmes</span>
            </label>

            <button
              onClick={() => setFilters({ statut: '', date_debut: '', date_fin: '', terrain_id: '', probleme: false })}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
            >
              Réinitialiser
            </button>
          </div>
        )}
      </div>

      {/* Tableau des réservations */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Terrain</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date & Heure</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ticket</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500" />
                    <p className="mt-2 text-gray-500">Chargement des réservations...</p>
                  </td>
                </tr>
              ) : reservations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="text-gray-500">
                      <Calendar className="w-12 h-12 mx-auto mb-4" />
                      <p>Aucune réservation trouvée</p>
                    </div>
                  </td>
                </tr>
              ) : (
                reservations.map((reservation) => (
                  <tr key={reservation.id} className={`hover:bg-gray-50 ${getReservationsWithProblems().includes(reservation) ? 'bg-yellow-50' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {reservation.user.prenom} {reservation.user.nom}
                        </div>
                        <div className="text-sm text-gray-500">{reservation.user.email}</div>
                        {reservation.user.telephone && (
                          <div className="text-sm text-gray-500">{reservation.user.telephone}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {reservation.terrain.terrain_synthetique.nom}
                        </div>
                        <div className="text-sm text-gray-500">{reservation.terrain.nom}</div>
                        <div className="text-sm text-gray-500">{reservation.terrain.terrain_synthetique.adresse}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                          {formatDate(reservation.date_debut)}
                        </div>
                        <div className="flex items-center mt-1">
                          <Clock className="w-4 h-4 mr-1 text-gray-400" />
                          {reservation.duree_heures}h - Fin: {formatDate(reservation.date_fin)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                      {formatCurrency(reservation.montant_total)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(reservation.statut)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        {getTicketBadge(reservation)}
                        {reservation.code_ticket && (
                          <div className="text-xs text-gray-500 font-mono">
                            {reservation.code_ticket.slice(-6)}
                          </div>
                        )}
                        {reservation.derniere_validation && (
                          <div className="text-xs text-gray-500">
                            Validé: {formatDate(reservation.derniere_validation)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewDetails(reservation)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Voir détails"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => handleAddNotesClick(reservation)}
                          className="text-green-600 hover:text-green-900"
                          title="Ajouter notes"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>

                        {!reservation.has_ticket && (
                          <button
                            onClick={() => handleGenerateTicket(reservation.id)}
                            className="text-purple-600 hover:text-purple-900"
                            title="Générer ticket"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        )}
                        
                        <button
                          onClick={() => handleDelete(reservation.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de validation de ticket */}
      {showTicketModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <QrCode className="w-5 h-5 mr-2 text-purple-600" />
              Valider un ticket
            </h3>
            <p className="text-gray-600 mb-4">
              Saisissez le code complet du ticket ou les 6 derniers chiffres.
            </p>
            <input
              type="text"
              value={ticketCode}
              onChange={(e) => setTicketCode(e.target.value.toUpperCase())}
              placeholder="Ex: TSK-KSM-2025-123456 ou 123456"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent mb-4"
              disabled={validatingTicket}
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowTicketModal(false);
                  setTicketCode('');
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                disabled={validatingTicket}
              >
                Annuler
              </button>
              <button
                onClick={handleValidateTicket}
                disabled={!ticketCode.trim() || validatingTicket}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {validatingTicket ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Validation...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Valider</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de notes */}
      {showNotesModal && selectedReservation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Ajouter des notes administrateur
            </h3>
            <p className="text-gray-600 mb-4">
              Réservation de {selectedReservation.user.prenom} {selectedReservation.user.nom}
            </p>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Notes administrateur..."
              className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowNotesModal(false);
                  setAdminNotes('');
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
              >
                Annuler
              </button>
              <button
                onClick={handleAddNotes}
                disabled={!adminNotes.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Ajouter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservationsPage; 