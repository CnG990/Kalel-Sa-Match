import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  ShieldCheck, 
  LandPlot, 
  Banknote, 
  ShieldAlert, 
  LifeBuoy, 
  LogOut, 
  Percent,
  Settings,
  BarChart3,
  FileText,
  Bell,
  Calendar,
  CreditCard,
  TrendingUp,
  Database
} from 'lucide-react';

const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();

  const navItems = [
    { name: 'Tableau de Bord', path: '/admin', icon: LayoutDashboard },
    { name: 'Validations', path: '/admin/validate-managers', icon: ShieldCheck },
    { name: 'Utilisateurs', path: '/admin/users', icon: Users },
    { name: 'Terrains', path: '/admin/terrains', icon: LandPlot },
    { name: 'Import Géo', path: '/admin/geo-import', icon: Database },
    { name: 'Finances', path: '/admin/finances', icon: Banknote },
    { name: 'Commissions', path: '/admin/commissions', icon: Percent },
    { name: 'Litiges', path: '/admin/disputes', icon: ShieldAlert },
    { name: 'Support', path: '/admin/support', icon: LifeBuoy },
    { name: 'Réservations', path: '/admin/reservations', icon: Calendar },
    { name: 'Paiements', path: '/admin/payments', icon: CreditCard },
    { name: 'Abonnements', path: '/admin/subscriptions', icon: TrendingUp },
    { name: 'Notifications', path: '/admin/notifications', icon: Bell },
    { name: 'Rapports', path: '/admin/reports', icon: BarChart3 },
    { name: 'Logs', path: '/admin/logs', icon: FileText },
    { name: 'Configuration', path: '/admin/settings', icon: Settings },
  ];

  const NavItem = ({ item }: { item: typeof navItems[0] }) => (
    <NavLink
      to={item.path}
      end={item.path === '/admin'}
      className={({ isActive }) =>
        `flex items-center px-4 py-3 text-gray-200 hover:bg-gray-700 rounded-lg transition-colors duration-200 ${isActive ? 'bg-orange-600 text-white shadow-inner' : ''}`
      }
    >
      <item.icon className="w-5 h-5 mr-3" />
      <span>{item.name}</span>
    </NavLink>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header avec logo */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img 
              src="/logo sans background.png" 
              alt="Logo" 
              className="h-10 w-auto"
            />
            <div>
              <h1 className="text-xl font-bold text-gray-900">Kalel Sa Match</h1>
              <p className="text-sm text-orange-600 font-medium">Administration</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Bonjour, {user?.nom || 'Admin'}</span>
            <button
              onClick={logout}
              className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-800 text-white p-4 flex flex-col h-[calc(100vh-80px)]">
          <div className="flex-1 overflow-y-auto">
            <nav className="space-y-2 pb-4">
              {navItems.map(item => <NavItem key={item.name} item={item} />)}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 overflow-y-auto h-[calc(100vh-80px)]">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout; 