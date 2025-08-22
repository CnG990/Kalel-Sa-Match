import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Send, 
  AlertTriangle, 
  Clock, 
  MessageSquare, 
  CheckCircle, 
  XCircle,
  ArrowUp,
  FileText,
  Calendar,
  User,
  MapPin
} from 'lucide-react';
import toast from 'react-hot-toast';
import apiService from '../services/api';

interface LitigeDetails {
  id: number;
  numero_litige: string;
  type_litige: string;
  sujet: string;
  description: string;
  priorite: string;
  statut: string;
  niveau_escalade: string;
  terrain_nom: string;
  terrain_adresse: string;
  client_nom: string;
  client_email: string;
  reservation_id: number | null;
  reservation_date: string | null;
  created_at: string;
  updated_at: string;
  preuves: string[];
}

interface Message {
  id: number;
  litige_id: number;
  user_id: number;
  user_nom: string;
  user_role: string;
  message: string;
  type_message: 'message' | 'action' | 'escalade';
  created_at: string;
}

const LitigeDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [litige, setLitige] = useState<LitigeDetails | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    if (id) {
      chargerDetailsLitige();
    }
  }, [id]);

  const chargerDetailsLitige = async () => {
    try {
      setLoading(true);
      const [litigeResponse, messagesResponse] = await Promise.all([
        apiService.get(`/litiges/${id}`),
        apiService.get(`/litiges/${id}/messages`)
      ]);

      if (litigeResponse.success) {
        setLitige(litigeResponse.data);
      } else {
        toast.error('Erreur lors du chargement du litige');
        navigate('/dashboard/litiges');
      }

      if (messagesResponse.success) {
        setMessages(messagesResponse.data || []);
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement des données');
      navigate('/dashboard/litiges');
    } finally {
      setLoading(false);
    }
  };

  const envoyerMessage = async () => {
    if (!newMessage.trim()) {
      toast.error('Veuillez saisir un message');
      return;
    }

    try {
      setSendingMessage(true);
      const response = await apiService.post(`/litiges/${id}/messages`, {
        message: newMessage.trim()
      });

      if (response.success) {
        setNewMessage('');
        await chargerDetailsLitige(); // Recharger pour avoir le nouveau message
        toast.success('Message envoyé avec succès');
      } else {
        toast.error(response.message || 'Erreur lors de l\'envoi du message');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de l\'envoi du message');
    } finally {
      setSendingMessage(false);
    }
  };

  const escaladerLitige = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir escalader ce litige ?')) {
      return;
    }

    try {
      const response = await apiService.post(`/litiges/${id}/escalader`);
      if (response.success) {
        toast.success('Litige escaladé avec succès');
        await chargerDetailsLitige();
      } else {
        toast.error(response.message || 'Erreur lors de l\'escalade');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de l\'escalade du litige');
    }
  };

  const fermerLitige = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir fermer ce litige ?')) {
      return;
    }

    try {
      const response = await apiService.post(`/litiges/${id}/fermer`);
      if (response.success) {
        toast.success('Litige fermé avec succès');
        await chargerDetailsLitige();
      } else {
        toast.error(response.message || 'Erreur lors de la fermeture');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la fermeture du litige');
    }
  };

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'nouveau': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'en_cours': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'resolu': return 'bg-green-100 text-green-800 border-green-200';
      case 'ferme': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'escalade': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatutIcon = (statut: string) => {
    switch (statut) {
      case 'nouveau': return <Clock size={16} />;
      case 'en_cours': return <MessageSquare size={16} />;
      case 'resolu': return <CheckCircle size={16} />;
      case 'ferme': return <XCircle size={16} />;
      case 'escalade': return <ArrowUp size={16} />;
      default: return <Clock size={16} />;
    }
  };

  const getPrioriteColor = (priorite: string) => {
    switch (priorite) {
      case 'faible': return 'bg-gray-100 text-gray-600 border-gray-200';
      case 'normale': return 'bg-blue-100 text-blue-600 border-blue-200';
      case 'elevee': return 'bg-orange-100 text-orange-600 border-orange-200';
      case 'urgente': return 'bg-red-100 text-red-600 border-red-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getTypeLibelle = (type: string) => {
    switch (type) {
      case 'reservation': return 'Problème de réservation';
      case 'paiement': return 'Problème de paiement';
      case 'service': return 'Qualité de service';
      case 'equipement': return 'Problème d\'équipement';
      case 'autre': return 'Autre';
      default: return type;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'client': return 'bg-blue-100 text-blue-800';
      case 'gestionnaire': return 'bg-green-100 text-green-800';
      case 'admin': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Chargement du litige...</span>
      </div>
    );
  }

  if (!litige) {
    return (
      <div className="text-center py-12">
        <AlertTriangle size={48} className="mx-auto text-red-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Litige introuvable</h3>
        <p className="text-gray-600 mb-4">Ce litige n'existe pas ou vous n'avez pas l'autorisation de le voir.</p>
        <button
          onClick={() => navigate('/dashboard/litiges')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Retour aux litiges
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* En-tête avec bouton retour */}
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate('/dashboard/litiges')}
          className="mr-4 p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <AlertTriangle className="mr-3 text-orange-500" size={28} />
            Litige #{litige.numero_litige}
          </h1>
          <p className="text-gray-600 mt-1">{litige.sujet}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Détails du litige */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Informations du litige</h2>
            
            {/* Statut et priorité */}
            <div className="flex flex-wrap gap-2 mb-4">
              <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center ${getStatutColor(litige.statut)}`}>
                {getStatutIcon(litige.statut)}
                <span className="ml-1 capitalize">{litige.statut.replace('_', ' ')}</span>
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPrioriteColor(litige.priorite)}`}>
                Priorité {litige.priorite}
              </span>
            </div>

            {/* Détails */}
            <div className="space-y-3 text-sm">
              <div className="flex items-center">
                <FileText size={16} className="text-gray-400 mr-2" />
                <span className="text-gray-600">Type:</span>
                <span className="ml-2 font-medium">{getTypeLibelle(litige.type_litige)}</span>
              </div>
              
              <div className="flex items-center">
                <MapPin size={16} className="text-gray-400 mr-2" />
                <span className="text-gray-600">Terrain:</span>
                <span className="ml-2 font-medium">{litige.terrain_nom}</span>
              </div>
              
              <div className="flex items-center">
                <Calendar size={16} className="text-gray-400 mr-2" />
                <span className="text-gray-600">Créé le:</span>
                <span className="ml-2 font-medium">
                  {new Date(litige.created_at).toLocaleDateString('fr-FR')}
                </span>
              </div>

              <div className="flex items-center">
                <User size={16} className="text-gray-400 mr-2" />
                <span className="text-gray-600">Niveau:</span>
                <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${getRoleColor(litige.niveau_escalade)}`}>
                  {litige.niveau_escalade}
                </span>
              </div>

              {litige.reservation_id && (
                <div className="flex items-center">
                  <Calendar size={16} className="text-gray-400 mr-2" />
                  <span className="text-gray-600">Réservation:</span>
                  <span className="ml-2 font-medium">
                    {litige.reservation_date ? new Date(litige.reservation_date).toLocaleDateString('fr-FR') : 'N/A'}
                  </span>
                </div>
              )}
            </div>

            {/* Description complète */}
            <div className="mt-4 pt-4 border-t">
              <h3 className="font-medium text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{litige.description}</p>
            </div>

            {/* Preuves */}
            {litige.preuves && litige.preuves.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <h3 className="font-medium text-gray-900 mb-2">Preuves jointes</h3>
                <div className="space-y-1">
                  {litige.preuves.map((preuve, index) => (
                    <div key={index} className="text-xs text-blue-600 hover:underline cursor-pointer">
                      📎 {preuve}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            {(litige.statut === 'nouveau' || litige.statut === 'en_cours') && (
              <div className="mt-6 pt-4 border-t space-y-2">
                <h3 className="font-medium text-gray-900 mb-3">Actions</h3>
                
                {litige.niveau_escalade === 'client' && (
                  <button
                    onClick={escaladerLitige}
                    className="w-full bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors text-sm flex items-center justify-center"
                  >
                    <ArrowUp size={16} className="mr-2" />
                    Escalader au gestionnaire
                  </button>
                )}
                
                {litige.statut === 'resolu' && (
                  <button
                    onClick={fermerLitige}
                    className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm flex items-center justify-center"
                  >
                    <XCircle size={16} className="mr-2" />
                    Fermer le litige
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Conversation */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border h-[600px] flex flex-col">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <MessageSquare className="mr-2" size={20} />
                Conversation ({messages.length} messages)
              </h2>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
              {messages.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">Aucun message pour l'instant</p>
                  <p className="text-sm text-gray-500">Commencez la conversation ci-dessous</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.user_role === 'client' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] p-3 rounded-lg ${
                        message.user_role === 'client'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <div className="flex items-center mb-1 text-xs opacity-75">
                        <span className={`px-2 py-1 rounded ${getRoleColor(message.user_role)}`}>
                          {message.user_nom} ({message.user_role})
                        </span>
                        <span className="ml-2">
                          {new Date(message.created_at).toLocaleString('fr-FR')}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed">{message.message}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Zone de saisie */}
            {(litige.statut === 'nouveau' || litige.statut === 'en_cours' || litige.statut === 'escalade') && (
              <div className="p-4 border-t">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && envoyerMessage()}
                    placeholder="Tapez votre message..."
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={sendingMessage}
                  />
                  <button
                    onClick={envoyerMessage}
                    disabled={sendingMessage || !newMessage.trim()}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    <Send size={16} className="mr-1" />
                    {sendingMessage ? 'Envoi...' : 'Envoyer'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LitigeDetailsPage; 