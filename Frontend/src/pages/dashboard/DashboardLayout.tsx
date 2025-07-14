import React, { useState, useEffect } from 'react';
import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Toaster } from 'react-hot-toast';
import {
  LayoutDashboard,
  User,
  Calendar,
  Map,
  Settings,
  LogOut,
  Home,
  Menu,
  X,
} from 'lucide-react';

const SidebarLink: React.FC<{ 
  to: string; 
  icon: React.ReactNode; 
  text: string; 
  isMobile?: boolean; 
  onClick?: () => void;
}> = ({ to, icon, text, isMobile, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) =>
      `flex items-center text-gray-200 dark:text-gray-300 hover:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200 ${
        isActive ? 'bg-orange-600 dark:bg-orange-500 text-white' : ''
      } ${
        isMobile ? 'px-4 py-4 text-lg touch-target' : 'px-4 py-3'
      }`
    }
  >
    <span className={isMobile ? 'text-xl' : ''}>{icon}</span>
    <span className={`font-medium ${isMobile ? 'ml-4 text-lg' : 'ml-4'}`}>{text}</span>
  </NavLink>
);

const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
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

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const sidebarLinks = [
    { to: "/dashboard", icon: <LayoutDashboard size={20} />, text: "Aperçu" },
    { to: "/dashboard/profile", icon: <User size={20} />, text: "Mon Profil" },
    { to: "/dashboard/reservations", icon: <Calendar size={20} />, text: "Réservations" },
    { to: "/dashboard/map", icon: <Map size={20} />, text: "Carte" },
    { to: "/dashboard/settings", icon: <Settings size={20} />, text: "Paramètres" },
  ];

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 font-sans">
      <Toaster position="top-right" />
      
      {/* Overlay mobile pour fermer la sidebar */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        ${isMobile ? 'fixed inset-y-0 left-0 z-50' : 'relative'} 
        ${isMobile && !sidebarOpen ? 'translate-x-[-100%]' : 'translate-x-0'}
        w-64 flex-shrink-0 bg-gray-800 dark:bg-gray-950 text-white flex flex-col p-4 
        transition-transform duration-300 ease-in-out
      `}>
        {/* Header avec logo et bouton fermer mobile */}
        <div className="flex items-center justify-between mb-10 px-2">
          <Link to="/" className="flex items-center">
            <img src="/logo-1.webp" alt="Kalèl Sa Match Logo" className="h-10 w-auto" />
            <span className={`ml-3 font-bold text-white ${isMobile ? 'text-lg' : 'text-xl'}`}>
              Kalèl Sa Match
            </span>
          </Link>
          {isMobile && (
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-white hover:text-gray-300 p-2 rounded-lg transition-colors touch-target"
            >
              <X size={24} />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-grow space-y-2">
          {sidebarLinks.map(link => (
            <SidebarLink 
              key={link.to}
              to={link.to} 
              icon={link.icon} 
              text={link.text}
              isMobile={isMobile}
              onClick={isMobile ? () => setSidebarOpen(false) : undefined}
            />
          ))}
        </nav>

        {/* Actions en bas */}
        <div className="mt-auto space-y-2">
          <Link
            to="/"
            className={`flex items-center text-gray-200 dark:text-gray-300 hover:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200 ${
              isMobile ? 'px-4 py-4 text-lg touch-target' : 'px-4 py-3'
            }`}
            onClick={isMobile ? () => setSidebarOpen(false) : undefined}
          >
            <Home size={20} />
            <span className={`font-medium ${isMobile ? 'ml-4 text-lg' : 'ml-4'}`}>
              Retour au site
            </span>
          </Link>
          <button
            onClick={handleLogout}
            className={`w-full flex items-center text-gray-200 dark:text-gray-300 hover:bg-red-700 dark:hover:bg-red-600 rounded-lg transition-colors duration-200 ${
              isMobile ? 'px-4 py-4 text-lg touch-target' : 'px-4 py-3'
            }`}
          >
            <LogOut size={20} />
            <span className={`font-medium ${isMobile ? 'ml-4 text-lg' : 'ml-4'}`}>
              Déconnexion
            </span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header mobile avec bouton menu */}
        {isMobile && (
          <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white p-2 rounded-lg transition-colors touch-target"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">
              Dashboard
            </h1>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                {user?.prenom}
              </span>
            </div>
          </header>
        )}

        {/* Contenu principal */}
        <main className={`flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 ${
          isMobile ? 'p-4' : 'p-8'
        }`}>
          <div className={`bg-white dark:bg-gray-800 shadow-md ${
            isMobile ? 'p-4 rounded-lg' : 'p-6 rounded-lg'
          }`}>
            <Outlet context={{ user }} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout; 