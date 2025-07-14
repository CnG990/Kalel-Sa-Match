import React, { useState, useEffect } from 'react';
import { FileText, Search, Download, Eye, AlertTriangle, Info, XCircle, Calendar, User, Database } from 'lucide-react';
import apiService from '../../services/api';

interface Log {
  id: number;
  niveau: 'info' | 'warning' | 'error' | 'debug' | 'critical';
  message: string;
  contexte: string;
  utilisateur_id?: number;
  utilisateur_nom?: string;
  ip_adresse?: string;
  user_agent?: string;
  date_creation: string;
  donnees?: any;
  trace?: string;
}

const LogsPage: React.FC = () => {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [contextFilter, setContextFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [showDetails, setShowDetails] = useState<number | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    info: 0,
    warning: 0,
    error: 0,
    critical: 0,
    today: 0
  });

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/admin/logs');
      setLogs(response.data.logs || []);
      
      // Calculer les statistiques
      const total = response.data.logs?.length || 0;
      const info = response.data.logs?.filter((l: Log) => l.niveau === 'info').length || 0;
      const warning = response.data.logs?.filter((l: Log) => l.niveau === 'warning').length || 0;
      const error = response.data.logs?.filter((l: Log) => l.niveau === 'error').length || 0;
      const critical = response.data.logs?.filter((l: Log) => l.niveau === 'critical').length || 0;
      const today = response.data.logs?.filter((l: Log) => {
        const today = new Date().toDateString();
        return new Date(l.date_creation).toDateString() === today;
      }).length || 0;
      
      setStats({ total, info, warning, error, critical, today });
    } catch (error) {
      console.error('Erreur lors du chargement des logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'info': return <Info className="w-4 h-4 text-blue-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'critical': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'debug': return <Database className="w-4 h-4 text-gray-500" />;
      default: return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  const getLevelBadge = (level: string) => {
    const levelMap = {
      info: 'bg-blue-100 text-blue-800',
      warning: 'bg-yellow-100 text-yellow-800',
      error: 'bg-red-100 text-red-800',
      critical: 'bg-red-200 text-red-900',
      debug: 'bg-gray-100 text-gray-800'
    };
    return levelMap[level as keyof typeof levelMap] || 'bg-gray-100 text-gray-800';
  };

  const getLevelText = (level: string) => {
    const levelMap = {
      info: 'Information',
      warning: 'Avertissement',
      error: 'Erreur',
      critical: 'Critique',
      debug: 'Debug'
    };
    return levelMap[level as keyof typeof levelMap] || level;
  };

  const getContextBadge = (context: string) => {
    const contextMap = {
      'auth': 'bg-purple-100 text-purple-800',
      'payment': 'bg-green-100 text-green-800',
      'reservation': 'bg-blue-100 text-blue-800',
      'terrain': 'bg-orange-100 text-orange-800',
      'user': 'bg-indigo-100 text-indigo-800',
      'system': 'bg-gray-100 text-gray-800'
    };
    return contextMap[context as keyof typeof contextMap] || 'bg-gray-100 text-gray-800';
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.contexte.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.utilisateur_nom && log.utilisateur_nom.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesLevel = levelFilter === 'all' || log.niveau === levelFilter;
    const matchesContext = contextFilter === 'all' || log.contexte === contextFilter;
    
    return matchesSearch && matchesLevel && matchesContext;
  });

  const exportLogs = () => {
    const csvContent = [
      ['ID', 'Niveau', 'Message', 'Contexte', 'Utilisateur', 'IP', 'Date'],
      ...filteredLogs.map(log => [
        log.id.toString(),
        getLevelText(log.niveau),
        log.message,
        log.contexte,
        log.utilisateur_nom || 'Système',
        log.ip_adresse || 'N/A',
        new Date(log.date_creation).toLocaleString('fr-FR')
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const clearLogs = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer tous les logs ? Cette action est irréversible.')) {
      try {
        await apiService.delete('/admin/logs');
        fetchLogs();
      } catch (error) {
        console.error('Erreur lors de la suppression des logs:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <FileText className="w-8 h-8 text-gray-600" />
          Journal des Logs
        </h1>
        <div className="flex gap-3">
          <button
            onClick={exportLogs}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Exporter
          </button>
          <button
            onClick={clearLogs}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <XCircle className="w-4 h-4" />
            Vider les Logs
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-gray-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Logs</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <FileText className="w-8 h-8 text-gray-500" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Informations</p>
              <p className="text-2xl font-bold text-gray-900">{stats.info}</p>
            </div>
            <Info className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avertissements</p>
              <p className="text-2xl font-bold text-gray-900">{stats.warning}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Erreurs</p>
              <p className="text-2xl font-bold text-gray-900">{stats.error}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Critiques</p>
              <p className="text-2xl font-bold text-gray-900">{stats.critical}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Aujourd'hui</p>
              <p className="text-2xl font-bold text-gray-900">{stats.today}</p>
            </div>
            <Calendar className="w-8 h-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Rechercher</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Message, contexte, utilisateur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Niveau</label>
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous les niveaux</option>
              <option value="info">Information</option>
              <option value="warning">Avertissement</option>
              <option value="error">Erreur</option>
              <option value="critical">Critique</option>
              <option value="debug">Debug</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Contexte</label>
            <select
              value={contextFilter}
              onChange={(e) => setContextFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous les contextes</option>
              <option value="auth">Authentification</option>
              <option value="payment">Paiement</option>
              <option value="reservation">Réservation</option>
              <option value="terrain">Terrain</option>
              <option value="user">Utilisateur</option>
              <option value="system">Système</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Période</label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Toutes les dates</option>
              <option value="today">Aujourd'hui</option>
              <option value="week">Cette semaine</option>
              <option value="month">Ce mois</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tableau des logs */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Log
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Niveau
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contexte
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilisateur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  IP
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900 truncate max-w-xs">{log.message}</div>
                      {showDetails === log.id && (
                        <div className="mt-2 text-xs text-gray-500 bg-gray-50 p-2 rounded">
                          <pre className="whitespace-pre-wrap">{JSON.stringify(log.donnees, null, 2)}</pre>
                          {log.trace && (
                            <div className="mt-2">
                              <strong>Trace:</strong>
                              <pre className="whitespace-pre-wrap text-xs">{log.trace}</pre>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getLevelIcon(log.niveau)}
                      <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getLevelBadge(log.niveau)}`}>
                        {getLevelText(log.niveau)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getContextBadge(log.contexte)}`}>
                      {log.contexte}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="w-4 h-4 text-gray-400 mr-1" />
                      <span className="text-sm text-gray-900">{log.utilisateur_nom || 'Système'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{log.ip_adresse || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(log.date_creation).toLocaleDateString('fr-FR')}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(log.date_creation).toLocaleTimeString('fr-FR')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      onClick={() => setShowDetails(showDetails === log.id ? null : log.id)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredLogs.length === 0 && (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun log trouvé</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || levelFilter !== 'all' || contextFilter !== 'all' ? 'Essayez de modifier vos filtres.' : 'Aucun log n\'a été enregistré.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LogsPage; 