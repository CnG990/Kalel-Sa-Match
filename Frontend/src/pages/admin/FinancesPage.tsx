import React, { useState, useEffect } from 'react';
import apiService from '../../services/api';
import { TrendingUp, BarChart, Clock, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface Stats {
  chiffre_affaires_total: number;
  commission_estimee_totale: number;
  a_reverser_estimatif: number;
}

interface Transaction {
  id: number;
  date: string;
  client: string;
  montant_total: number;
  commission: number;
  montant_net_gestionnaire: number;
  methode_paiement: string;
  statut: string;
  gestionnaire: string;
}

interface PaginatedTransactions {
  data: Transaction[];
  current_page: number;
  last_page: number;
  total: number;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(amount);
};

const FinancesPage: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [transactions, setTransactions] = useState<PaginatedTransactions | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchFinances = async () => {
      setLoading(true);
      try {
        const response = await apiService.getAdminFinances({ page });
        if (response.success) {
          setStats(response.data.stats as Stats);
          setTransactions(response.data.transactions as PaginatedTransactions);
        } else {
          toast.error("Impossible de charger les données financières.");
        }
      } catch (error) {
        toast.error("Erreur réseau lors du chargement des finances.");
      } finally {
        setLoading(false);
      }
    };

    fetchFinances();
  }, [page]);

  if (loading && !transactions) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        <p className="ml-4 text-lg">Chargement des données financières...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Vue d'ensemble financière</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard 
          icon={<TrendingUp />} 
          title="Chiffre d'affaires total" 
          value={stats ? formatCurrency(stats.chiffre_affaires_total) : '...'}
          color="blue"
        />
        <StatCard 
          icon={<BarChart />} 
          title="Commissions totales (estimé)" 
          value={stats ? formatCurrency(stats.commission_estimee_totale) : '...'}
          color="green"
        />
        <StatCard 
          icon={<Clock />} 
          title="À reverser (estimé)" 
          value={stats ? formatCurrency(stats.a_reverser_estimatif) : '...'}
          color="orange"
        />
      </div>

      {/* Transactions Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <h2 className="text-xl font-semibold p-5">Historique des transactions</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gestionnaire</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Montant Total</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Commission</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Net Gestionnaire</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions && transactions.data.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{tx.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{tx.client}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{tx.gestionnaire}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold">{formatCurrency(tx.montant_total)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600">{formatCurrency(tx.commission)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-blue-600">{formatCurrency(tx.montant_net_gestionnaire)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {tx.statut}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {transactions && (
          <div className="p-4 flex justify-between items-center">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={transactions.current_page === 1}
              className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Précédent
            </button>
            <span className="text-sm text-gray-700">
              Page {transactions.current_page} sur {transactions.last_page}
            </span>
            <button
              onClick={() => setPage(p => Math.min(transactions.last_page, p + 1))}
              disabled={transactions.current_page === transactions.last_page}
              className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Suivant
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ icon, title, value, color }: { icon: React.ReactNode, title: string, value: string, color: string }) => {
  const colors = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    orange: 'bg-orange-500',
  }
  return (
    <div className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4">
      <div className={`p-3 rounded-full text-white ${colors[color as keyof typeof colors] || 'bg-gray-500'}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  )
};

export default FinancesPage; 