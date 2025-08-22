import React, { useState, useEffect } from 'react';
import { Ticket, Calendar, MapPin, Clock, Download, QrCode, CheckCircle, AlertCircle } from 'lucide-react';
import apiService from '../services/api';
import toast from 'react-hot-toast';

interface TicketData {
  id: number;
  code_ticket: string;
  validation_code: string;
  qr_code: string;
  qr_code_url: string;
  expire_at: string;
  reservation_id: number;
  reservation: {
    id: number;
    date_reservation: string;
    heure_debut: string;
    heure_fin: string;
    prix_total: number;
    terrain: {
      id: number;
      nom: string;
      adresse: string;
    };
    user: {
      id: number;
      prenom: string;
      nom: string;
    };
  };
  terrain: {
    id: number;
    nom: string;
    adresse: string;
  };
  user: {
    id: number;
    prenom: string;
    nom: string;
  };
}

interface TicketWithReservation extends TicketData {
  reservation_status?: string;
  is_used?: boolean;
  used_at?: string;
}

const MesTicketsPage: React.FC = () => {
  const [tickets, setTickets] = useState<TicketWithReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'used' | 'expired'>('all');

  useEffect(() => {
    fetchMyTickets();
  }, []);

  const fetchMyTickets = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/user/tickets');
      
      if (response.success) {
        setTickets(response.data || []);
      } else {
        toast.error('Erreur lors du chargement des tickets');
      }
    } catch (error) {
      console.error('Erreur lors du chargement des tickets:', error);
      toast.error('Erreur lors du chargement des tickets');
    } finally {
      setLoading(false);
    }
  };

  const downloadTicket = async (ticketId: number) => {
    try {
      const response = await apiService.get(`/tickets/${ticketId}/download`);
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ticket-${ticketId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Ticket téléchargé avec succès');
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      toast.error('Erreur lors du téléchargement du ticket');
    }
  };

  const getTicketStatus = (ticket: TicketWithReservation) => {
    const now = new Date();
    const expireDate = new Date(ticket.expire_at);
    const reservationDate = new Date(ticket.reservation.date_reservation);
    
    if (ticket.is_used) {
      return { status: 'used', label: 'Utilisé', color: 'text-gray-500', bgColor: 'bg-gray-100' };
    }
    
    if (now > expireDate || now > reservationDate) {
      return { status: 'expired', label: 'Expiré', color: 'text-red-500', bgColor: 'bg-red-100' };
    }
    
    return { status: 'active', label: 'Actif', color: 'text-green-500', bgColor: 'bg-green-100' };
  };

  const filteredTickets = tickets.filter(ticket => {
    if (filter === 'all') return true;
    const ticketStatus = getTicketStatus(ticket);
    return ticketStatus.status === filter;
  });

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(new Date(dateString));
  };

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5); // HH:MM format
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
            <Ticket className="w-8 h-8 mr-3 text-green-600" />
            Mes Tickets
          </h1>
          <p className="text-gray-600">
            Consultez et téléchargez vos tickets de réservation
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <div className="flex space-x-4">
            {[
              { key: 'all', label: 'Tous', count: tickets.length },
              { key: 'active', label: 'Actifs', count: tickets.filter(t => getTicketStatus(t).status === 'active').length },
              { key: 'used', label: 'Utilisés', count: tickets.filter(t => getTicketStatus(t).status === 'used').length },
              { key: 'expired', label: 'Expirés', count: tickets.filter(t => getTicketStatus(t).status === 'expired').length }
            ].map(filterOption => (
              <button
                key={filterOption.key}
                onClick={() => setFilter(filterOption.key as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === filterOption.key
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                {filterOption.label} ({filterOption.count})
              </button>
            ))}
          </div>
        </div>

        {/* Tickets List */}
        {filteredTickets.length === 0 ? (
          <div className="text-center py-12">
            <Ticket className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filter === 'all' ? 'Aucun ticket trouvé' : `Aucun ticket ${filter}`}
            </h3>
            <p className="text-gray-500">
              {filter === 'all' 
                ? 'Vous n\'avez pas encore de tickets. Effectuez une réservation pour obtenir votre premier ticket.'
                : `Vous n'avez pas de tickets avec le statut "${filter}".`
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTickets.map((ticket) => {
              const status = getTicketStatus(ticket);
              
              return (
                <div key={ticket.qr_code} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 mr-3">
                            {ticket.terrain.nom}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.color} ${status.bgColor}`}>
                            {status.status === 'used' && <CheckCircle className="w-3 h-3 inline mr-1" />}
                            {status.status === 'expired' && <AlertCircle className="w-3 h-3 inline mr-1" />}
                            {status.status === 'active' && <CheckCircle className="w-3 h-3 inline mr-1" />}
                            {status.label}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                            {ticket.terrain.adresse}
                          </div>
                          
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                            {formatDate(ticket.reservation.date_reservation)}
                          </div>
                          
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-2 text-gray-400" />
                            {formatTime(ticket.reservation.heure_debut)} - {formatTime(ticket.reservation.heure_fin)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-xl font-bold text-green-600 mb-2">
                          {formatPrice(ticket.reservation.prix_total)} FCFA
                        </div>
                        
                        <div className="flex space-x-2">
                          <button
                            onClick={() => downloadTicket(ticket.reservation_id)}
                            className="flex items-center px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <Download className="w-3 h-3 mr-1" />
                            PDF
                          </button>
                          
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(ticket.validation_code);
                              toast.success('Code de validation copié');
                            }}
                            className="flex items-center px-3 py-1 bg-gray-600 text-white text-xs rounded-lg hover:bg-gray-700 transition-colors"
                          >
                            <QrCode className="w-3 h-3 mr-1" />
                            Code
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Ticket Details */}
                    <div className="border-t pt-4 mt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-500">
                        <div>
                          <span className="font-medium">Client:</span> {ticket.user.prenom} {ticket.user.nom}
                        </div>
                        <div>
                          <span className="font-medium">Code de validation:</span> 
                          <code className="ml-1 bg-gray-100 px-1 rounded">{ticket.validation_code}</code>
                        </div>
                        <div>
                          <span className="font-medium">Expire le:</span> {formatDate(ticket.expire_at)}
                        </div>
                        {ticket.used_at && (
                          <div>
                            <span className="font-medium">Utilisé le:</span> {formatDate(ticket.used_at)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MesTicketsPage; 