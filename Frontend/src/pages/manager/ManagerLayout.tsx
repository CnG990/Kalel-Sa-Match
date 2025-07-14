import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  Building, 
  Calendar, 
  DollarSign, 
  User, 
  Settings, 
  LogOut, 
  Ticket,
  Menu,
  X,
  Home,
  ChevronRight
} from 'lucide-react';

const ManagerLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Détecter si on est sur mobile
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarOpen(false); // Fermer la sidebar si on passe en desktop
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fermer la sidebar mobile lors du changement de route
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  const navItems = [
    { 
      name: 'Tableau de Bord', 
      path: '/manager', 
      icon: LayoutDashboard, 
      emoji: '📊',
      color: 'from-blue-400 to-blue-600',
      description: 'Vue d\'ensemble de votre activité'
    },
    { 
      name: 'Mes Terrains', 
      path: '/manager/terrains', 
      icon: Building, 
      emoji: '🏟️',
      color: 'from-green-400 to-green-600',
      description: 'Gérer vos terrains et installations'
    },
    { 
      name: 'Réservations', 
      path: '/manager/reservations', 
      icon: Calendar, 
      emoji: '📅',
      color: 'from-purple-400 to-purple-600',
      description: 'Consultez vos réservations'
    },
    { 
      name: 'Promotions', 
      path: '/manager/promotions', 
      icon: Calendar, 
      emoji: '🎁',
      color: 'from-purple-400 to-pink-600',
      description: 'Créez des offres pour vos abonnés'
    },
    { 
      name: 'Revenus', 
      path: '/manager/revenue', 
      icon: DollarSign, 
      emoji: '💰',
      color: 'from-yellow-400 to-yellow-600',
      description: 'Suivez vos gains et statistiques'
    },
    { 
      name: 'Vérification Ticket', 
      path: '/manager/qr-scanner', 
      icon: Ticket, 
      emoji: '🎫',
      color: 'from-indigo-400 to-indigo-600',
      description: 'Scanner et valider les réservations'
    },
    { 
      name: 'Mon Profil', 
      path: '/manager/profile', 
      icon: User, 
      emoji: '👤',
      color: 'from-teal-400 to-teal-600',
      description: 'Informations personnelles'
    },
    { 
      name: 'Paramètres', 
      path: '/manager/settings', 
      icon: Settings, 
      emoji: '⚙️',
      color: 'from-gray-400 to-gray-600',
      description: 'Configurer votre compte'
    },
  ];

  const NavItem = ({ 
    item, 
    isMobile, 
    onClick 
  }: { 
    item: typeof navItems[0]; 
    isMobile?: boolean; 
    onClick?: () => void; 
  }) => (
    <NavLink
      to={item.path}
      end={item.path === '/manager'}
      onClick={onClick}
      className={({ isActive }) =>
        `group relative flex items-center text-gray-100 hover:text-white rounded-xl transition-all duration-300 transform hover:scale-105 ${
          isActive 
            ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/30' 
            : 'hover:bg-white/10 backdrop-blur-sm'
        } ${
          isMobile ? 'px-4 py-4 text-base touch-target' : 'px-4 py-3 mx-2'
        }`
      }
    >
      <div className={`flex items-center ${isMobile ? 'w-full' : 'w-full'}`}>
        {isMobile ? (
          <>
            <div className={`p-2 rounded-lg bg-gradient-to-r ${item.color} shadow-lg mr-4`}>
              <span className="text-lg">{item.emoji}</span>
            </div>
            <div className="flex-1">
              <span className="font-semibold block">{item.name}</span>
              <span className="text-xs text-gray-300 opacity-90">{item.description}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
          </>
        ) : (
          <>
            <div className={`p-2 rounded-lg bg-gradient-to-r ${item.color} shadow-lg mr-3 group-hover:shadow-xl transition-shadow`}>
              <item.icon className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <span className="font-medium">{item.name}</span>
            </div>
          </>
        )}
      </div>
    </NavLink>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-green-50">
      {/* Overlay mobile pour fermer la sidebar */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Header amélioré */}
      <header className={`bg-white/80 backdrop-blur-lg shadow-lg border-b border-white/20 ${isMobile ? 'px-4 py-3' : 'px-6 py-4'}`}>
        <div className="flex items-center justify-between">
          {/* Menu mobile button */}
          {isMobile && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="relative p-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 touch-target"
            >
              <Menu size={20} />
            </button>
          )}

          {/* Logo et titre améliorés */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-500 rounded-xl blur opacity-30"></div>
              <img 
                src="/logo.svg" 
                alt="Logo" 
                className={`relative w-auto ${isMobile ? 'h-8' : 'h-10'} drop-shadow-lg`}
              />
            </div>
            <div>
              <h1 className={`font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent ${isMobile ? 'text-lg' : 'text-xl'}`}>
                Kalel Sa Match
              </h1>
              <p className={`font-semibold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent ${isMobile ? 'text-xs' : 'text-sm'}`}>
                🏟️ Espace Gestionnaire
              </p>
            </div>
          </div>

          {/* Actions header améliorées */}
          <div className="flex items-center space-x-3">
                      {!isMobile && (
            <>
              {/* User greeting */}
              <div className="text-right">
                <span className="text-sm font-medium text-gray-700">
                  Bonjour, 👋
                </span>
                <p className="text-sm font-bold text-green-600">
                  {user?.prenom || 'Gestionnaire'}
                </p>
              </div>
            </>
          )}
            
                      {isMobile ? (
            <div className="flex items-center space-x-2">
              <button
                onClick={logout}
                className="p-2 rounded-xl bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 touch-target"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
              <button
                onClick={logout}
                className="flex items-center px-4 py-2 rounded-xl bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 font-medium"
              >
                <LogOut className="w-4 h-4 mr-2" />
                <span>Déconnexion</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar améliorée */}
        <aside className={`
          ${isMobile ? 'fixed inset-y-0 left-0 z-50' : 'relative'} 
          ${isMobile && !sidebarOpen ? 'translate-x-[-100%]' : 'translate-x-0'}
          w-80 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col 
          transition-all duration-300 ease-in-out shadow-2xl backdrop-blur-xl
          ${isMobile ? 'h-full pt-0' : 'h-[calc(100vh-88px)] rounded-tr-3xl'}
        `}>
          
          {/* Header sidebar mobile amélioré */}
          {isMobile && (
            <div className="flex items-center justify-between p-6 border-b border-white/10 bg-gradient-to-r from-green-600 to-blue-600">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                  <img src="/logo.svg" alt="Logo" className="h-8 w-auto" />
                </div>
                <div>
                  <span className="text-lg font-bold text-white">Menu Principal</span>
                  <p className="text-xs text-white/80">Gestionnaire</p>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-xl bg-white/20 text-white hover:bg-white/30 transition-colors touch-target backdrop-blur-sm"
              >
                <X size={20} />
              </button>
            </div>
          )}

          {/* Navigation améliorée */}
          <div className={`flex-1 overflow-y-auto ${isMobile ? 'p-4' : 'p-4'}`}>
            {!isMobile && (
              <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-white/10 backdrop-blur-sm">
                <h3 className="text-lg font-bold text-white mb-1">Navigation</h3>
                <p className="text-sm text-gray-300">Gérez vos terrains efficacement</p>
              </div>
            )}
            
            <nav className="space-y-2">
              {navItems.map(item => (
                <NavItem 
                  key={item.name} 
                  item={item} 
                  isMobile={isMobile}
                  onClick={isMobile ? () => setSidebarOpen(false) : undefined}
                />
              ))}
            </nav>
          </div>

          {/* Actions sidebar améliorées */}
          <div className={`border-t border-white/10 ${isMobile ? 'p-4' : 'p-4'} bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur-sm`}>
            <NavLink
              to="/"
              className={`group flex items-center text-gray-200 hover:text-white rounded-xl transition-all duration-300 transform hover:scale-105 hover:bg-white/10 backdrop-blur-sm ${
                isMobile ? 'px-4 py-4 text-base touch-target' : 'px-4 py-3'
              }`}
              onClick={isMobile ? () => setSidebarOpen(false) : undefined}
            >
              {isMobile ? (
                <>
                  <div className="p-2 rounded-lg bg-gradient-to-r from-orange-400 to-red-500 shadow-lg mr-4">
                    <span className="text-lg">🏠</span>
                  </div>
                  <div className="flex-1">
                    <span className="font-semibold block">Retour au site</span>
                    <span className="text-xs text-gray-300">Interface client</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
                </>
              ) : (
                <>
                  <div className="p-2 rounded-lg bg-gradient-to-r from-orange-400 to-red-500 shadow-lg mr-3">
                    <Home className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-medium">Retour au site</span>
                </>
              )}
            </NavLink>
          </div>
        </aside>

        {/* Main Content amélioré */}
        <main className={`flex-1 overflow-y-auto ${
          isMobile 
            ? 'h-[calc(100vh-72px)] p-4' 
            : 'h-[calc(100vh-88px)] p-6'
        }`}>
          <div className={`bg-white/80 backdrop-blur-lg shadow-xl border border-white/20 ${
            isMobile ? 'p-4 rounded-2xl' : 'p-8 rounded-3xl'
          } min-h-full`}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default ManagerLayout; 