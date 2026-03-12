import React, { useState, useEffect } from 'react';
import { Link, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navLinks = [
  { href: '/', text: 'Accueil', icon: '🏠' },
  { href: '/contact', text: 'Contact', icon: '📞' },
];

const Layout: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Détecter si on est sur mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fermer le menu mobile lors du changement de route
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Initialiser le thème au chargement de l'application
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);
  }, []);

  const applyTheme = (theme: string) => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      // Système
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  // Déterminer l'URL du dashboard selon le rôle
  const getDashboardUrl = () => {
    if (user?.role === 'admin') return '/admin';
    if (user?.role === 'gestionnaire') return '/manager';
    return '/dashboard';
  };

  const getDashboardText = () => {
    if (user?.role === 'admin') return 'Admin';
    if (user?.role === 'gestionnaire') return 'Gestionnaire';
    return 'Dashboard';
  };

  const getDashboardIcon = () => {
    if (user?.role === 'admin') return '⚙️';
    if (user?.role === 'gestionnaire') return '👔';
    return '📊';
  };

  // Navigation mobile en bas
  const MobileBottomNav = () => {
    if (!isMobile || !isAuthenticated) return null;

    return (
      <nav className="mobile-nav">
        <div className="flex h-full">
          <Link 
            to="/" 
            className={`mobile-nav-item ${location.pathname === '/' ? 'active' : ''}`}
          >
            <span className="text-lg mb-1">🏠</span>
            <span>Accueil</span>
          </Link>
          <Link 
            to="/dashboard/map" 
            className={`mobile-nav-item ${location.pathname === '/dashboard/map' ? 'active' : ''}`}
          >
            <span className="text-lg mb-1">🗺️</span>
            <span>Carte</span>
          </Link>
          <Link 
            to={getDashboardUrl()} 
            className={`mobile-nav-item ${location.pathname.includes('dashboard') || location.pathname.includes('admin') || location.pathname.includes('manager') ? 'active' : ''}`}
          >
            <span className="text-lg mb-1">{getDashboardIcon()}</span>
            <span>{getDashboardText()}</span>
          </Link>
          <Link 
            to="/contact" 
            className={`mobile-nav-item ${location.pathname === '/contact' ? 'active' : ''}`}
          >
            <span className="text-lg mb-1">📞</span>
            <span>Contact</span>
          </Link>
        </div>
      </nav>
    );
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col">
      {/* Header optimisé pour mobile */}
      <header className={`bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-lg sticky top-0 z-50 border-b border-gray-100 dark:border-gray-800 ${isMobile ? 'mobile-header' : ''}`}>
        <div className="max-w-7xl mx-auto">
          <div className={`flex justify-between items-center ${isMobile ? 'h-16 px-4' : 'h-20 px-4 sm:px-6 lg:px-8'}`}>
            {/* Logo optimisé pour mobile */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center group">
                <img 
                  src="/logo sans background.png" 
                  alt="Logo KSM" 
                  className={`transition-transform group-hover:scale-105 ${isMobile ? 'h-8 w-auto' : 'h-12 w-auto'}`} 
                />
                <div className="ml-2 lg:ml-3">
                  <span className={`font-bold transition-colors ${isMobile ? 'text-lg' : 'text-2xl'}`}>
                    <span className="text-green-600 group-hover:text-green-700">KSM</span>
                  </span>
                </div>
              </Link>
            </div>
            
            {/* Navigation Desktop uniquement */}
            {!isMobile && (
              <nav className="hidden md:flex items-center space-x-8">
                {navLinks.map((link) => (
                  <Link 
                    key={link.text} 
                    to={link.href} 
                    className="nav-link text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 font-medium transition-colors duration-200 py-2 px-3"
                  >
                    {link.text}
                  </Link>
                ))}
              </nav>
            )}
            
            {/* Actions Desktop uniquement */}
            {!isMobile && (
              <div className="hidden md:flex items-center space-x-4">
                {isAuthenticated ? (
                  <>
                    <Link 
                      to={getDashboardUrl()} 
                      className="font-medium text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors py-2 px-3 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20"
                    >
                      <span className="hidden lg:inline">Bonjour, </span>{user?.prenom}
                      {user?.role === 'admin' && (
                        <span className="ml-1 text-xs bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-2 py-1 rounded-full">Admin</span>
                      )}
                    </Link>
                    <button 
                      onClick={handleLogout} 
                      className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold py-2.5 px-6 rounded-lg shadow-md btn-hover transition-all duration-200"
                    >
                      Se Déconnecter
                    </button>
                  </>
                ) : (
                  <>
                    <Link 
                      to="/register" 
                      className="text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 font-medium transition-colors py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      S'inscrire
                    </Link>
                    <Link 
                      to="/login" 
                      className="bg-gradient-to-r from-green-600 to-orange-500 hover:from-green-700 hover:to-orange-600 text-white font-semibold py-2.5 px-6 rounded-lg shadow-md btn-hover transition-all duration-200"
                    >
                      Se Connecter
                    </Link>
                  </>
                )}
              </div>
            )}
            
            {/* Menu Mobile Button et actions pour utilisateur connecté */}
            {isMobile && (
              <div className="flex items-center space-x-2">
                {isAuthenticated && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {user?.prenom}
                    </span>
                    {user?.role === 'admin' && (
                      <span className="text-xs bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-2 py-1 rounded-full">
                        Admin
                      </span>
                    )}
                  </div>
                )}
                <button 
                  onClick={() => setIsMenuOpen(!isMenuOpen)} 
                  className="text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 touch-target"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"} 
                    />
                  </svg>
                </button>
              </div>
            )}
          </div>
          
          {/* Menu Mobile Déroulant */}
          {isMenuOpen && isMobile && (
            <nav className="md:hidden px-4 pt-2 pb-6 space-y-2 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 shadow-lg animate-slide-in-mobile">
              {/* Liens de navigation pour les non-connectés sur mobile */}
              {!isAuthenticated && navLinks.map((link) => (
                <Link 
                  key={link.text} 
                  to={link.href} 
                  className="flex items-center text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg p-3 font-medium transition-colors touch-target" 
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="text-lg mr-3">{link.icon}</span>
                  {link.text}
                </Link>
              ))}
              
              <div className="pt-4 space-y-3 border-t border-gray-100 dark:border-gray-800">
                {isAuthenticated ? (
                  <>
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold py-3 px-4 rounded-xl shadow-md transition-all touch-target"
                    >
                      <span className="text-lg mr-2">🚪</span>
                      Se Déconnecter
                    </button>
                  </>
                ) : (
                  <>
                    <Link 
                      to="/register" 
                      className="block text-center text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 font-medium py-3 px-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors touch-target" 
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <span className="text-lg mr-2">📝</span>
                      S'inscrire
                    </Link>
                    <Link 
                      to="/login" 
                      className="block text-center bg-gradient-to-r from-green-600 to-orange-500 hover:from-green-700 hover:to-orange-600 text-white font-semibold py-3 px-6 rounded-xl shadow-md transition-all touch-target" 
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <span className="text-lg mr-2">🔑</span>
                      Se Connecter
                    </Link>
                  </>
                )}
              </div>
            </nav>
          )}
        </div>
      </header>

      <main className={`flex-1 bg-gray-50 dark:bg-gray-900 ${isMobile && isAuthenticated ? 'pb-16' : ''}`}>
        <Outlet />
      </main>

      {/* Navigation mobile en bas pour utilisateurs connectés */}
      <MobileBottomNav />

      {/* Footer - Masqué sur mobile si utilisateur connecté */}
      <footer className={`bg-gray-900 dark:bg-gray-950 text-white ${isMobile && isAuthenticated ? 'hidden' : ''}`}>
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Logo et Description */}
            <div className="md:col-span-1">
              <div className="flex items-center mb-6">
                <img src="/logo sans background.png" alt="Logo KSM" className="h-10 w-auto" />
                <span className="ml-3 text-2xl font-bold text-green-400">KSM</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                Application de réservation de terrains synthétiques partout au Sénégal.
              </p>
              <div className="flex items-center space-x-2 text-green-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.04 2h-.08a10 10 0 00-8.9 14.54l-1.1 4 4.1-1.07A10 10 0 1012.04 2zm0 2a8 8 0 016.86 12.07l-.27.41a1 1 0 00-.12.27l-.5 1.84-1.9-.5a1 1 0 00-.27.01l-.49.12A8 8 0 1112.04 4zm-2.1 3.25a.7.7 0 00-.54.27c-.16.21-.48.63-.48 1.22 0 .59.5 1.16.57 1.24l.08.1c.85 1.45 2.08 2.61 3.55 3.47.6.34 1.17.62 1.7.83.67.28 1.27.24 1.75.14.53-.11 1.17-.48 1.33-.95.16-.47.16-.86.12-.94-.04-.08-.17-.13-.35-.22-.2-.1-1.17-.58-1.35-.64-.18-.07-.3-.1-.44.1-.13.2-.51.64-.62.78-.12.14-.23.15-.43.05-.21-.1-.88-.33-1.67-1.04-.62-.55-1.04-1.23-1.17-1.44-.12-.21-.01-.3.08-.39.07-.07.17-.18.25-.28.08-.1.1-.17.15-.28.05-.1.02-.2-.02-.28-.04-.08-.39-.95-.55-1.3-.15-.34-.3-.29-.43-.3-.11-.01-.23-.01-.35-.01z" />
                </svg>
                <a href="https://wa.me/221776173261" target="_blank" rel="noreferrer" className="hover:text-green-300 text-sm font-medium">
                  +221 77 617 32 61
                </a>
              </div>
            </div>
            
            {/* Navigation */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-6">Navigation</h4>
              <ul className="space-y-3">
                {navLinks.map(link => (
                  <li key={link.text}>
                    <Link to={link.href} className="footer-link text-gray-400 dark:text-gray-500 hover:text-green-400 transition-colors text-sm">
                      {link.text}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Services */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-6">Services</h4>
              <ul className="space-y-3">
                <li><a href="#" className="footer-link text-gray-400 dark:text-gray-500 hover:text-green-400 transition-colors text-sm">Réservation de terrains</a></li>
                <li><a href="#" className="footer-link text-gray-400 dark:text-gray-500 hover:text-green-400 transition-colors text-sm">Abonnements</a></li>
                <li><a href="#" className="footer-link text-gray-400 dark:text-gray-500 hover:text-green-400 transition-colors text-sm">Paiement en ligne</a></li>
                <li><a href="#" className="footer-link text-gray-400 dark:text-gray-500 hover:text-green-400 transition-colors text-sm">Support client</a></li>
              </ul>
            </div>
            
            {/* Contact */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-6">Contact</h4>
              <ul className="space-y-3 text-gray-400 dark:text-gray-500 text-sm">
                <li className="flex items-center hover:text-green-400 transition-colors">
                  <svg className="w-4 h-4 mr-3 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <a href="mailto:contact@kalelsamatch.com" className="hover:text-green-400 transition-colors">
                    contact@kalelsamatch.com
                  </a>
                </li>
                <li className="flex items-center hover:text-green-400 transition-colors">
                  <svg className="w-4 h-4 mr-3 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <div className="flex flex-col">
                    <a href="tel:+221776173261" className="hover:text-green-400 transition-colors">
                      +221 77 617 32 61
                    </a>
                    <a href="https://wa.me/221776173261" target="_blank" rel="noreferrer" className="text-green-400 hover:text-green-300 text-xs">
                      WhatsApp
                    </a>
                  </div>
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Sénégal
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-gray-800 dark:border-gray-700">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                &copy; 2025 <span className="text-green-400">KSM</span>. Tous droits réservés.
              </p>
              <div className="mt-4 md:mt-0 flex space-x-6">
                <Link to="/terms" className="text-gray-500 dark:text-gray-400 hover:text-green-400 text-sm transition-colors">
                  Conditions d'utilisation
                </Link>
                <Link to="/privacy" className="text-gray-500 dark:text-gray-400 hover:text-green-400 text-sm transition-colors">
                  Politique de confidentialité
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout; 