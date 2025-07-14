import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, Users, ShieldCheck, Handshake, ShieldAlert, BarChart3 } from 'lucide-react';
import apiService from '../../services/api';
import toast from 'react-hot-toast';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  color: string;
  link?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color, link }) => {
  const CardContent = () => (
    <div className={`bg-white p-6 rounded-lg shadow-lg border-l-4 ${color}`}>
      <div className="flex items-center">
        <div className="p-3 bg-gray-100 rounded-full">
          <Icon className="w-6 h-6 text-gray-600" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-500 uppercase">{title}</p>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
      </div>
    </div>
  );

  return link ? <Link to={link} className="hover:opacity-80 transition-opacity"><CardContent /></Link> : <CardContent />;
};


interface StatsData {
  revenue: string;
  newUsers: number;
  pendingManagers: number;
  pendingRefunds: number;
  openDisputes: number;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await apiService.getDashboardStats();
        if (response.success && typeof response.data === 'object' && response.data !== null) {
          setStats(response.data as StatsData);
        } else {
          toast.error("Impossible de charger les statistiques : format de données incorrect.");
        }
      } catch (error) {
        toast.error("Erreur réseau lors du chargement des statistiques.");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = stats ? [
    { title: "Revenus (30j)", value: stats.revenue, icon: DollarSign, color: "border-green-500", link: "/admin/finances" },
    { title: "Nouveaux Utilisateurs", value: stats.newUsers.toString(), icon: Users, color: "border-blue-500", link: "/admin/users" },
    { title: "Validations en attente", value: stats.pendingManagers.toString(), icon: ShieldCheck, color: "border-orange-500", link: "/admin/validate-managers" },
    { title: "Remboursements", value: `${stats.pendingRefunds} à traiter`, icon: Handshake, color: "border-purple-500", link: "/admin/finances" },
    { title: "Litiges ouverts", value: stats.openDisputes.toString(), icon: ShieldAlert, color: "border-red-500", link: "/admin/disputes" },
    { title: "Rapports", value: "Voir plus", icon: BarChart3, color: "border-gray-500", link: "/admin/reports" },
  ] : [];
  
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow-lg">
            <div className="animate-pulse flex space-x-4">
              <div className="rounded-full bg-gray-200 h-12 w-12"></div>
              <div className="flex-1 space-y-4 py-1">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Tableau de Bord Principal</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats && statCards.map(stat => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>
      
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="font-semibold text-lg mb-4">Réservations Récentes</h2>
          <p className="text-gray-500">Graphique des réservations à venir...</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="font-semibold text-lg mb-4">Répartition des Rôles</h2>
          <p className="text-gray-500">Graphique des utilisateurs à venir...</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 