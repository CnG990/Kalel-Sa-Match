import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  Users,
  ShieldCheck,
  Handshake,
  ShieldAlert,
  BarChart3,
  CalendarDays,
  ArrowRight,
} from 'lucide-react';
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
  tauxOccupation?: number;
  terrainsActifs?: number;
}

interface RecentReservation {
  id: number;
  client: string;
  terrain: string;
  statut: string;
  dateDebut: string;
}

interface RoleDistributionEntry {
  label: string;
  value: number;
  color: string;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentReservations, setRecentReservations] = useState<RecentReservation[]>([]);
  const [reservationsLoading, setReservationsLoading] = useState(true);
  const [roleDistribution, setRoleDistribution] = useState<RoleDistributionEntry[]>([]);
  const [rolesLoading, setRolesLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const { data, meta } = await apiService.getDashboardStats();
        if (data && typeof data === 'object') {
          const d = data as any;
          setStats({
            revenue: d.revenus_mois ? `${Number(d.revenus_mois).toLocaleString('fr-FR')} FCFA` : (d.revenue || '0 FCFA'),
            newUsers: d.users_count || d.newUsers || 0,
            pendingManagers: d.gestionnaires_en_attente || d.pendingManagers || 0,
            pendingRefunds: d.tickets_ouverts || d.pendingRefunds || 0,
            openDisputes: d.openDisputes || d.litiges_ouverts || 0,
            tauxOccupation: d.taux_occupation || d.tauxOccupation,
            terrainsActifs: d.terrains_actifs || d.totalTerrains,
          });
        } else {
          toast.error(meta.message || "Impossible de charger les statistiques : format de données incorrect.");
        }
      } catch (error) {
        toast.error("Erreur réseau lors du chargement des statistiques.");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    const fetchRecentReservations = async () => {
      try {
        setReservationsLoading(true);
        const { data } = await apiService.getAllReservations({ per_page: 5 });
        const payload = Array.isArray(data)
          ? data
          : Array.isArray((data as any)?.data)
            ? (data as any).data
            : Array.isArray((data as any)?.results)
              ? (data as any).results
              : [];

        const normalized = payload.map((item: any) => ({
          id: item.id ?? Math.random(),
          client: item.client?.nom
            ? `${item.client.prenom ?? ''} ${item.client.nom ?? ''}`.trim()
            : item.client_name ?? 'Client inconnu',
          terrain: item.terrain?.nom ?? item.terrain_nom ?? 'Terrain inconnu',
          statut: item.statut ?? item.status ?? 'en_attente',
          dateDebut: item.date_debut ?? item.start_date ?? item.created_at ?? new Date().toISOString(),
        }));

        setRecentReservations(normalized);
      } catch (error) {
        console.error('[Dashboard] reservations error', error);
        toast.error("Impossible de charger les réservations récentes.");
        setRecentReservations([]);
      } finally {
        setReservationsLoading(false);
      }
    };

    const fetchRoleDistribution = async () => {
      try {
        setRolesLoading(true);
        const { data } = await apiService.getAllUsers({ per_page: 150 });
        const list = Array.isArray(data)
          ? data
          : Array.isArray((data as any)?.data)
            ? (data as any).data
            : Array.isArray((data as any)?.results)
              ? (data as any).results
              : [];

        const counts: Record<string, number> = (list as any[]).reduce((acc: Record<string, number>, user: any) => {
          const role = user?.role ?? user?.user?.role ?? 'client';
          acc[role] = (acc[role] ?? 0) + 1;
          return acc;
        }, {});

        const distribution: RoleDistributionEntry[] = [
          { label: 'Clients', value: counts.client ?? 0, color: '#34d399' },
          { label: 'Gestionnaires', value: counts.gestionnaire ?? 0, color: '#f97316' },
          { label: 'Admins', value: counts.admin ?? 0, color: '#60a5fa' },
        ];

        setRoleDistribution(distribution);
      } catch (error) {
        console.error('[Dashboard] role distribution error', error);
        toast.error("Impossible de charger la répartition des rôles.");
        setRoleDistribution([]);
      } finally {
        setRolesLoading(false);
      }
    };

    fetchRecentReservations();
    fetchRoleDistribution();
  }, []);

  const totalUsers = useMemo(
    () => roleDistribution.reduce((sum, entry) => sum + entry.value, 0),
    [roleDistribution]
  );

  const statCards = stats ? [
    { title: "Revenus (30j)", value: stats.revenue, icon: DollarSign, color: "border-green-500", link: "/admin/finances" },
    { title: "Nouveaux Utilisateurs", value: stats.newUsers.toString(), icon: Users, color: "border-blue-500", link: "/admin/users" },
    { title: "Validations en attente", value: stats.pendingManagers.toString(), icon: ShieldCheck, color: "border-orange-500", link: "/admin/validate-managers" },
    { title: "Remboursements", value: `${stats.pendingRefunds} à traiter`, icon: Handshake, color: "border-purple-500", link: "/admin/finances" },
    { title: "Litiges ouverts", value: stats.openDisputes.toString(), icon: ShieldAlert, color: "border-red-500", link: "/admin/disputes" },
    { title: "Occup." , value: stats.tauxOccupation ? `${stats.tauxOccupation}%` : "Voir plus", icon: BarChart3, color: "border-gray-500", link: "/admin/reports" },
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
      
      <div className="mt-8 grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg">Réservations récentes</h2>
            <Link to="/admin/reservations" className="text-sm text-orange-600 font-medium inline-flex items-center gap-1">
              Voir tout <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {reservationsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-16 bg-gray-100 animate-pulse rounded-lg" />
              ))}
            </div>
          ) : recentReservations.length === 0 ? (
            <p className="text-gray-500">Aucune réservation récente.</p>
          ) : (
            <div className="space-y-3">
              {recentReservations.map((reservation) => (
                <div key={reservation.id} className="flex items-center justify-between border rounded-lg px-4 py-3">
                  <div>
                    <p className="font-semibold text-gray-800">{reservation.terrain}</p>
                    <p className="text-sm text-gray-500 flex items-center gap-2">
                      <CalendarDays className="w-4 h-4" />
                      {new Date(reservation.dateDebut).toLocaleString('fr-FR', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">{reservation.client}</p>
                    <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${
                      reservation.statut === 'confirmee' || reservation.statut === 'terminee'
                        ? 'bg-green-100 text-green-700'
                        : reservation.statut === 'annulee'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {reservation.statut.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="font-semibold text-lg mb-4">Répartition des rôles</h2>
          {rolesLoading ? (
            <div className="h-48 bg-gray-100 rounded-lg animate-pulse" />
          ) : totalUsers === 0 ? (
            <p className="text-gray-500">Aucune donnée utilisateur disponible.</p>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <svg viewBox="0 0 36 36" className="w-32 h-32">
                <circle cx="18" cy="18" r="16" fill="none" stroke="#f3f4f6" strokeWidth="4" />
                {(() => {
                  let cumulative = 0;
                  const totalCircumference = 2 * Math.PI * 16;
                  return roleDistribution.map((entry) => {
                    const value = (entry.value / totalUsers) * totalCircumference;
                    const circle = (
                      <circle
                        key={entry.label}
                        cx="18"
                        cy="18"
                        r="16"
                        fill="none"
                        stroke={entry.color}
                        strokeWidth="4"
                        strokeDasharray={`${value} ${totalCircumference}`}
                        strokeDashoffset={-cumulative}
                      />
                    );
                    cumulative += value;
                    return circle;
                  });
                })()}
              </svg>
              <div className="space-y-2 w-full">
                {roleDistribution.map((entry) => (
                  <div key={entry.label} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                      <span>{entry.label}</span>
                    </div>
                    <span className="font-semibold">{entry.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;