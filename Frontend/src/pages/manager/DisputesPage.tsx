import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  AlertTriangle, 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  XCircle,
  ArrowUp,
  Filter,
  Search,
  Eye
} from 'lucide-react';
import toast from 'react-hot-toast';
import apiService from '../../services/api';

interface Litige {
  id: number;
  numero_litige: string;
  type_litige: string;
  sujet: string;
  description: string;
  priorite: string;
  statut: string;
  niveau_escalade: string;
  terrain_nom?: string;
  client_nom?: string;
  client_email?: string;
  created_at: string;
  updated_at: string;
  terrain?: { nom: string };
  client?: { nom: string; prenom: string; email: string };
}

const ManagerDisputesPage: React.FC = () => {
  const navigate = useNavigate();
  const [litiges, setLitiges] = useState<Litige[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchLitiges();
  }, [statusFilter]);

  const fetchLitiges = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (statusFilter) params.statut = statusFilter;

      const response = await apiService.get('/litiges/litiges/', { params });
      if (response.data) {
        const data = response.data as any;
        if (data.results) {
          setLitiges(data.results);
        } else if (Array.isArray(data)) {
          setLitiges(data);
        } else {
          setLitiges(data.data || []);
        }
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement des litiges');
    } finally {
      setLoading(false);
    }
  };

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'ouvert':
      case 'nouveau': return 'bg-blue-100 text-blue-800';
      case 'en_cours': return 'bg-yellow-100 text-yellow-800';
      case 'resolu': return 'bg-green-100 text-green-800';
      case 'ferme': return 'bg-gray-100 text-gray-800';
      case 'escalade': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatutIcon = (statut: string) => {
    switch (statut) {
      case 'ouvert':
      case 'nouveau': return <Clock size={14} />;
      case 'en_cours': return <MessageSquare size={14} />;
      case 'resolu': return <CheckCircle size={14} />;
      case 'ferme': return <XCircle size={14} />;
      case 'escalade': return <ArrowUp size={14} />;
      default: return <Clock size={14} />;
    }
  };

  const getPrioriteColor = (priorite: string) => {
    switch (priorite) {
      case 'faible': return 'bg-gray-100 text-gray-600';
      case 'normale': return 'bg-blue-100 text-blue-600';
      case 'elevee': return 'bg-orange-100 text-orange-600';
      case 'urgente': return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const filteredLitiges = litiges.filter(l => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      (l.sujet?.toLowerCase().includes(search)) ||
      (l.numero_litige?.toLowerCase().includes(search)) ||
      (l.client_nom?.toLowerCase().includes(search)) ||
      (l.client?.nom?.toLowerCase().includes(search)) ||
      (l.terrain_nom?.toLowerCase().includes(search)) ||
      (l.terrain?.nom?.toLowerCase().includes(search))
    );
  });

  const statsLitiges = {
    total: litiges.length,
    ouverts: litiges.filter(l => ['ouvert', 'nouveau', 'en_cours'].includes(l.statut)).length,
    escalades: litiges.filter(l => l.statut === 'escalade').length,
    resolus: litiges.filter(l => ['resolu', 'ferme'].includes(l.statut)).length,
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-gray-900">Litiges</h1>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          <span className="ml-3 text-gray-600">Chargement des litiges...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Litiges</h1>
          <p className="text-gray-600 mt-1">Gérez les réclamations de vos clients</p>
        </div>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Total</span>
            <AlertTriangle className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">{statsLitiges.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Ouverts</span>
            <Clock className="w-5 h-5 text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-blue-600 mt-1">{statsLitiges.ouverts}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Escaladés</span>
            <ArrowUp className="w-5 h-5 text-red-400" />
          </div>
          <p className="text-2xl font-bold text-red-600 mt-1">{statsLitiges.escalades}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Résolus</span>
            <CheckCircle className="w-5 h-5 text-green-400" />
          </div>
          <p className="text-2xl font-bold text-green-600 mt-1">{statsLitiges.resolus}</p>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Rechercher par sujet, client, terrain..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="">Tous les statuts</option>
              <option value="ouvert">Ouvert</option>
              <option value="en_cours">En cours</option>
              <option value="escalade">Escaladé</option>
              <option value="resolu">Résolu</option>
              <option value="ferme">Fermé</option>
            </select>
          </div>
        </div>
      </div>

      {/* Liste des litiges */}
      {filteredLitiges.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          <AlertTriangle size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun litige</h3>
          <p className="text-gray-500">
            {statusFilter ? 'Aucun litige avec ce statut.' : 'Aucun litige pour vos terrains.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredLitiges.map((litige) => (
            <div
              key={litige.id}
              className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(`/dashboard/litiges/${litige.id}`)}
            >
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-mono text-gray-500">
                        #{litige.numero_litige || litige.id}
                      </span>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatutColor(litige.statut)}`}>
                        {getStatutIcon(litige.statut)}
                        <span className="capitalize">{litige.statut.replace('_', ' ')}</span>
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getPrioriteColor(litige.priorite)}`}>
                        {litige.priorite}
                      </span>
                    </div>
                    <h3 className="text-base font-semibold text-gray-900 mb-1">
                      {litige.sujet}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                      {litige.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-gray-500">
                      <span>Client: {litige.client_nom || `${litige.client?.prenom || ''} ${litige.client?.nom || ''}`.trim() || 'N/A'}</span>
                      <span>Terrain: {litige.terrain_nom || litige.terrain?.nom || 'N/A'}</span>
                      <span>{new Date(litige.created_at).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/dashboard/litiges/${litige.id}`);
                    }}
                    className="ml-4 p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Eye size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManagerDisputesPage;
