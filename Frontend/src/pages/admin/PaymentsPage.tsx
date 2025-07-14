import React, { useState, useEffect } from 'react';
import { CreditCard, Search, Download, Eye, AlertCircle, CheckCircle, XCircle, DollarSign, TrendingUp, } from 'lucide-react';
import apiService from '../../services/api';

interface Payment {
  id: number;
  montant: number;
  statut: 'pending' | 'completed' | 'failed' | 'refunded';
  methode_paiement: string;
  date_paiement: string;
  reservation_id: number;
  user: {
    id: number;
    nom: string;
    email: string;
  };
  terrain: {
    id: number;
    nom: string;
  };
  commission: number;
}

const PaymentsPage: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    failed: 0,
    totalAmount: 0,
    commissionTotal: 0
  });

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/admin/payments');
      
      // Vérification robuste des données avec fallbacks
      const paymentsData = response?.data?.payments || response?.data || [];
      setPayments(Array.isArray(paymentsData) ? paymentsData : []);
      
      // Calculer les statistiques avec protection contre les erreurs
      const total = paymentsData?.length || 0;
      const completed = paymentsData?.filter((p: Payment) => p.statut === 'completed').length || 0;
      const pending = paymentsData?.filter((p: Payment) => p.statut === 'pending').length || 0;
      const failed = paymentsData?.filter((p: Payment) => p.statut === 'failed').length || 0;
      const totalAmount = paymentsData?.reduce((sum: number, p: Payment) => {
        return sum + (p.montant || 0);
      }, 0) || 0;
      const commissionTotal = paymentsData?.reduce((sum: number, p: Payment) => {
        return sum + (p.commission || 0);
      }, 0) || 0;
      
      setStats({ total, completed, pending, failed, totalAmount, commissionTotal });
    } catch (error) {
      console.error('Erreur lors du chargement des paiements:', error);
      // Fallback avec données vides en cas d'erreur
      setPayments([]);
      setStats({
        total: 0,
        completed: 0,
        pending: 0,
        failed: 0,
        totalAmount: 0,
        commissionTotal: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending': return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'failed': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'refunded': return <XCircle className="w-5 h-5 text-gray-500" />;
      default: return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800'
    };
    return statusMap[status as keyof typeof statusMap] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: string) => {
    const statusMap = {
      completed: 'Complété',
      pending: 'En attente',
      failed: 'Échoué',
      refunded: 'Remboursé'
    };
    return statusMap[status as keyof typeof statusMap] || status;
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.user.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.terrain.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.methode_paiement.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || payment.statut === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const exportPayments = () => {
    const csvContent = [
      ['ID', 'Utilisateur', 'Email', 'Terrain', 'Montant', 'Commission', 'Statut', 'Méthode', 'Date'],
      ...filteredPayments.map(p => [
        p.id.toString(),
        p.user.nom,
        p.user.email,
        p.terrain.nom,
        p.montant.toString(),
        p.commission.toString(),
        getStatusText(p.statut),
        p.methode_paiement,
        new Date(p.date_paiement).toLocaleDateString('fr-FR')
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `paiements_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
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
          <CreditCard className="w-8 h-8 text-blue-600" />
          Gestion des Paiements
        </h1>
        <button
          onClick={exportPayments}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          Exporter CSV
        </button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Paiements</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <CreditCard className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Complétés</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">En Attente</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Échoués</p>
              <p className="text-2xl font-bold text-gray-900">{stats.failed}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Montants totaux */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Montant Total</p>
              <p className="text-2xl font-bold text-green-600">{stats.totalAmount.toLocaleString('fr-FR')} FCFA</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Commissions Totales</p>
              <p className="text-2xl font-bold text-blue-600">{stats.commissionTotal.toLocaleString('fr-FR')} FCFA</p>
            </div>
            <DollarSign className="w-8 h-8 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Rechercher</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Utilisateur, terrain, méthode..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="completed">Complétés</option>
              <option value="pending">En attente</option>
              <option value="failed">Échoués</option>
              <option value="refunded">Remboursés</option>
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

      {/* Tableau des paiements */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Paiement
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilisateur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Terrain
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Montant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Commission
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Méthode
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
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(payment.statut)}
                      <span className="ml-2 text-sm font-medium text-gray-900">#{payment.id}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{payment.user.nom}</div>
                      <div className="text-sm text-gray-500">{payment.user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{payment.terrain.nom}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {payment.montant.toLocaleString('fr-FR')} FCFA
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-blue-600 font-medium">
                      {payment.commission.toLocaleString('fr-FR')} FCFA
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(payment.statut)}`}>
                      {getStatusText(payment.statut)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{payment.methode_paiement}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(payment.date_paiement).toLocaleDateString('fr-FR')}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(payment.date_paiement).toLocaleTimeString('fr-FR')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-3">
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredPayments.length === 0 && (
          <div className="text-center py-12">
            <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun paiement trouvé</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || statusFilter !== 'all' ? 'Essayez de modifier vos filtres.' : 'Aucun paiement n\'a été effectué pour le moment.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentsPage; 