import React, { useState, useEffect } from 'react';
import { MapPin, Clock, Calendar, CheckCircle, AlertCircle, Download, Share, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import apiService from '../services/api';
import { toast } from 'react-hot-toast';

interface TicketData {
  reservation_id: number;
  code_ticket: string;
  statut: string;
  is_used: boolean;
  used_at: string | null;
  expire_at: string | null;
  terrain: {
    id: number;
    nom: string;
    adresse: string;
  };
  reservation: {
    date_debut: string;
    date_fin: string;
    montant_total: number;
  };
  access_instructions: string[];
}

interface TicketDisplayProps {
  reservationId: number;
  isOpen: boolean;
  onClose: () => void;
}

const TicketDisplay: React.FC<TicketDisplayProps> = ({ reservationId, isOpen, onClose }) => {
  const [ticket, setTicket] = useState<TicketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{
    type: 'error' | 'payment_required';
    message: string;
    instructions?: string[];
  } | null>(null);

  useEffect(() => {
    if (isOpen && reservationId) {
      loadTicket();
    }
  }, [isOpen, reservationId]);

  const loadTicket = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, meta } = await apiService.getTicket(reservationId);

      if (data) {
        setTicket(data as TicketData);
        return;
      }

      const message = meta.message || 'Erreur lors du chargement du ticket';
      if (message.includes('paiement') || message.includes('payment')) {
        setError({
          type: 'payment_required',
          message,
          instructions: [
            'Votre réservation doit être payée et confirmée',
            'Le ticket sera automatiquement généré après paiement'
          ]
        });
      } else {
        setError({
          type: 'error',
          message
        });
      }
    } catch (error: any) {
      setError({
        type: 'error',
        message: error.message || 'Une erreur est survenue'
      });
      console.error('Erreur chargement ticket:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadTicket = () => {
    if (!ticket) {
      toast.error('Ticket non disponible');
      return;
    }

    // Créer un contenu texte avec les informations du ticket
    const ticketContent = `
Ticket de Réservation - ${ticket.terrain.nom}
=====================================
Code du ticket: ${ticket.code_ticket}
Terrain: ${ticket.terrain.adresse}
Date: ${new Date(ticket.reservation.date_debut).toLocaleDateString('fr-FR')}
Heure: ${new Date(ticket.reservation.date_debut).toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})} - ${new Date(ticket.reservation.date_fin).toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})}
Montant: ${ticket.reservation.montant_total} FCFA

Instructions:
${ticket.access_instructions.join('\n')}
    `.trim();

    // Créer un blob et télécharger
    const blob = new Blob([ticketContent], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `ticket-${ticket.code_ticket}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
    
    toast.success('Ticket téléchargé !');
  };

  const shareTicket = async () => {
    if (!ticket) return;

    const shareData = {
      title: `Ticket - ${ticket.terrain.nom}`,
      text: `Ma réservation ${ticket.code_ticket} pour ${ticket.terrain.nom} - Code: ${ticket.code_ticket}`,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareData.text}`);
        toast.success('Code du ticket copié dans le presse-papier !');
      }
    } catch (error) {
      console.error('Erreur partage:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement du ticket...</p>
          </div>
        ) : error ? (
          <div className="p-6">
            {error.type === 'payment_required' ? (
              // Cas spécial : Paiement requis
              <div className="text-center">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Clock className="w-8 h-8 text-yellow-600" />
                  <h3 className="text-lg font-semibold text-yellow-900">Paiement en Attente</h3>
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <p className="text-yellow-800 mb-4">{error.message}</p>
                  
                  {error.instructions && (
                    <div className="text-left">
                      <h4 className="font-medium text-yellow-900 mb-2">Instructions :</h4>
                      <ul className="space-y-2 text-sm text-yellow-800">
                        {error.instructions.map((instruction, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 bg-yellow-600 rounded-full mt-2 flex-shrink-0"></span>
                            {instruction}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-1 gap-3">
                  <button
                    onClick={loadTicket}
                    className="flex items-center justify-center gap-2 bg-yellow-600 text-white py-3 px-4 rounded-lg hover:bg-yellow-700 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Vérifier le Paiement
                  </button>
                  <button
                    onClick={onClose}
                    className="bg-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            ) : (
              // Cas d'erreur générale
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                  <h3 className="text-lg font-semibold text-red-900">Erreur</h3>
                </div>
                <p className="text-red-700 mb-4">{error.message}</p>
                <div className="flex gap-3">
                  <button
                    onClick={loadTicket}
                    className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Réessayer
                  </button>
                  <button
                    onClick={onClose}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : ticket ? (
          <div className="bg-white rounded-xl overflow-hidden">
            {/* Header du ticket */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Ticket d'Accès</h2>
                <button
                  onClick={onClose}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold mb-1">{ticket.code_ticket}</div>
                <div className="text-indigo-100">{ticket.terrain.nom}</div>
              </div>
            </div>

            {/* Code du ticket */}
            <div className="p-6 bg-gray-50 text-center">
              <div className="bg-white inline-block p-8 rounded-lg shadow-sm border">
                <div className="text-6xl font-bold text-indigo-600 mb-2">{ticket.code_ticket}</div>
                <p className="text-gray-600">Code du ticket</p>
              </div>
              
              <p className="text-sm text-gray-600 mt-3">
                Présentez ce code au gestionnaire du terrain
              </p>
            </div>

            {/* Détails de la réservation */}
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <div className="font-medium text-gray-900">{ticket.terrain.nom}</div>
                    <div className="text-sm text-gray-600">{ticket.terrain.adresse}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="font-medium text-gray-900">
                      {format(new Date(ticket.reservation.date_debut), 'EEEE dd MMMM yyyy', { locale: fr })}
                    </div>
                    <div className="text-sm text-gray-600">
                      {format(new Date(ticket.reservation.date_debut), 'HH:mm', { locale: fr })} - {' '}
                      {format(new Date(ticket.reservation.date_fin), 'HH:mm', { locale: fr })}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="font-medium text-gray-900">
                      Durée : {Math.round((new Date(ticket.reservation.date_fin).getTime() - new Date(ticket.reservation.date_debut).getTime()) / (1000 * 60))} minutes
                    </div>
                    <div className="text-sm text-gray-600">
                      Total : {ticket.reservation.montant_total.toLocaleString()} FCFA
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <CheckCircle className={`w-5 h-5 ${ticket.statut === 'confirmee' ? 'text-green-500' : 'text-yellow-500'}`} />
                  <div>
                    <div className="font-medium text-gray-900">
                      Statut : {ticket.statut === 'confirmee' ? 'Confirmée' : ticket.statut}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="p-6 bg-blue-50 border-t">
              <h4 className="font-semibold text-blue-900 mb-3">Instructions importantes :</h4>
              <ul className="space-y-2 text-sm text-blue-800">
                {ticket.access_instructions.map((instruction: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                    {instruction}
                  </li>
                ))}
              </ul>
            </div>

            {/* Actions */}
            <div className="p-6 border-t bg-gray-50">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={downloadTicket}
                  className="flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Télécharger
                </button>
                <button
                  onClick={shareTicket}
                  className="flex items-center justify-center gap-2 bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <Share className="w-4 h-4" />
                  Partager
                </button>
              </div>
              
              <button
                onClick={onClose}
                className="w-full mt-3 bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default TicketDisplay; 