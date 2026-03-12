import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Toaster } from 'react-hot-toast';
import {
  Map,
  User,
  LogIn,
  Home,
  Menu,
  X,
} from 'lucide-react';

const TerrainLayout: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Détecter si on est sur mobile
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setMenuOpen(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      
      {/* Header */}
      <header className="bg-white shadow-lg border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <img src="/logo sans background.png" alt="Kalèl Sa Match Logo" className="h-10 w-auto" />
              <span className="ml-3 text-xl font-bold text-gray-900">
                Kalèl Sa Match
              </span>
            </Link>

            {/* Navigation Desktop */}
            {!isMobile && (
              <nav className="hidden md:flex items-center space-x-6">
                <Link 
                  to="/" 
                  className="flex items-center text-gray-600 hover:text-orange-600 transition-colors"
                >
                  <Home className="w-4 h-4 mr-1" />
                  Accueil
                </Link>
                
                <Link 
                  to="/dashboard/map" 
                  className="flex items-center text-gray-600 hover:text-orange-600 transition-colors"
                >
                  <Map className="w-4 h-4 mr-1" />
                  Carte
                </Link>

                {isAuthenticated ? (
                  <div className="flex items-center space-x-4">
                    <Link 
                      to="/dashboard" 
                      className="flex items-center text-gray-600 hover:text-orange-600 transition-colors"
                    >
                      <User className="w-4 h-4 mr-1" />
                      Mon Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="text-gray-600 hover:text-red-600 transition-colors"
                    >
                      Déconnexion
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-4">
                    <Link 
                      to="/login" 
                      className="flex items-center text-gray-600 hover:text-orange-600 transition-colors"
                    >
                      <LogIn className="w-4 h-4 mr-1" />
                      Se connecter
                    </Link>
                    <Link 
                      to="/register" 
                      className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      S'inscrire
                    </Link>
                  </div>
                )}
              </nav>
            )}

            {/* Menu Mobile Button */}
            {isMobile && (
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="text-gray-600 hover:text-gray-900 p-2 rounded-lg transition-colors"
              >
                {menuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            )}
          </div>

          {/* Menu Mobile */}
          {isMobile && menuOpen && (
            <div className="md:hidden border-t bg-white py-4">
              <nav className="space-y-4">
                <Link 
                  to="/" 
                  className="flex items-center text-gray-600 hover:text-orange-600 transition-colors py-2"
                  onClick={() => setMenuOpen(false)}
                >
                  <Home className="w-4 h-4 mr-2" />
                  Accueil
                </Link>
                
                <Link 
                  to="/dashboard/map" 
                  className="flex items-center text-gray-600 hover:text-orange-600 transition-colors py-2"
                  onClick={() => setMenuOpen(false)}
                >
                  <Map className="w-4 h-4 mr-2" />
                  Carte
                </Link>

                {isAuthenticated ? (
                  <>
                    <Link 
                      to="/dashboard" 
                      className="flex items-center text-gray-600 hover:text-orange-600 transition-colors py-2"
                      onClick={() => setMenuOpen(false)}
                    >
                      <User className="w-4 h-4 mr-2" />
                      Mon Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setMenuOpen(false);
                      }}
                      className="flex items-center text-gray-600 hover:text-red-600 transition-colors py-2"
                    >
                      Déconnexion
                    </button>
                  </>
                ) : (
                  <div className="space-y-4">
                    <Link 
                      to="/login" 
                      className="flex items-center text-gray-600 hover:text-orange-600 transition-colors py-2"
                      onClick={() => setMenuOpen(false)}
                    >
                      <LogIn className="w-4 h-4 mr-2" />
                      Se connecter
                    </Link>
                    <Link 
                      to="/register" 
                      className="inline-block bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors"
                      onClick={() => setMenuOpen(false)}
                    >
                      S'inscrire
                    </Link>
                  </div>
                )}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Contenu principal */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer amélioré */}
      <footer className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white mt-12">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Logo et Description */}
            <div className="md:col-span-1">
              <div className="flex items-center mb-4">
                <img src="/logo sans background.png" alt="Logo Kalél Sa Match" className="h-8 w-auto" />
                <div className="ml-3">
                  <span className="text-lg font-bold">
                    <span className="text-green-400">Kalél</span>
                    <span className="text-orange-400"> Sa Match</span>
                  </span>
                </div>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                L'application n°1 pour la réservation de terrains synthétiques à Dakar. 
                Réservez facilement vos créneaux préférés.
              </p>
              <div className="flex space-x-3">
                <a href="https://wa.me/221776173261" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-green-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.04 2h-.08a10 10 0 00-8.9 14.54l-1.1 4 4.1-1.07A10 10 0 1012.04 2zm0 2a8 8 0 016.86 12.07l-.27.41a1 1 0 00-.12.27l-.5 1.84-1.9-.5a1 1 0 00-.27.01l-.49.12A8 8 0 1112.04 4zm-2.1 3.25a.7.7 0 00-.54.27c-.16.21-.48.63-.48 1.22 0 .59.5 1.16.57 1.24l.08.1c.85 1.45 2.08 2.61 3.55 3.47.6.34 1.17.62 1.7.83.67.28 1.27.24 1.75.14.53-.11 1.17-.48 1.33-.95.16-.47.16-.86.12-.94-.04-.08-.17-.13-.35-.22-.2-.1-1.17-.58-1.35-.64-.18-.07-.3-.1-.44.1-.13.2-.51.64-.62.78-.12.14-.23.15-.43.05-.21-.1-.88-.33-1.67-1.04-.62-.55-1.04-1.23-1.17-1.44-.12-.21-.01-.3.08-.39.07-.07.17-.18.25-.28.08-.1.1-.17.15-.28.05-.1.02-.2-.02-.28-.04-.08-.39-.95-.55-1.3-.15-.34-.3-.29-.43-.3-.11-.01-.23-.01-.35-.01z" />
                  </svg>
                  <span className="text-sm font-medium">+221 77 617 32 61</span>
                </a>
              </div>
            </div>
            
            {/* Navigation rapide */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-green-400">Navigation</h4>
              <ul className="space-y-2">
                <li><Link to="/" className="text-gray-400 hover:text-white transition-colors text-sm">Accueil</Link></li>
                <li><Link to="/dashboard/map" className="text-gray-400 hover:text-white transition-colors text-sm">Carte des terrains</Link></li>
                <li><Link to="/terrains" className="text-gray-400 hover:text-white transition-colors text-sm">Tous les terrains</Link></li>
                <li><Link to="/abonnements" className="text-gray-400 hover:text-white transition-colors text-sm">Abonnements</Link></li>
                <li><Link to="/contact" className="text-gray-400 hover:text-white transition-colors text-sm">Contact</Link></li>
              </ul>
            </div>
            
            {/* Services */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-orange-400">Services</h4>
              <ul className="space-y-2">
                <li><span className="text-gray-400 text-sm">✅ Réservation en ligne 24h/7j</span></li>
                <li><span className="text-gray-400 text-sm">🏟️ 13 terrains à Dakar</span></li>
                <li><span className="text-gray-400 text-sm">💳 Paiement sécurisé</span></li>
                <li><span className="text-gray-400 text-sm">📱 Application mobile</span></li>
                <li><span className="text-gray-400 text-sm">🎯 Géolocalisation précise</span></li>
              </ul>
            </div>
            
            {/* Contact */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-blue-400">Contact</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <a href="mailto:contact@kalelsamatch.com" className="hover:text-white transition-colors">
                    contact@kalelsamatch.com
                  </a>
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <div className="flex flex-col">
                    <a href="tel:+221776173261" className="hover:text-white transition-colors">
                      +221 77 617 32 61
                    </a>
                    <a href="https://wa.me/221776173261" target="_blank" rel="noreferrer" className="text-green-300 hover:text-green-200 text-xs">
                      WhatsApp
                    </a>
                  </div>
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Dakar, Sénégal
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  8h - 3h du matin
                </li>
              </ul>
            </div>
          </div>
          
          {/* Séparateur et copyright */}
          <div className="mt-8 pt-6 border-t border-gray-700">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm">
                &copy; 2025 <span className="text-green-400">Kalél</span><span className="text-orange-400"> Sa Match</span>. Tous droits réservés.
              </p>
              <div className="mt-4 md:mt-0 flex space-x-6">
                <Link to="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Conditions d'utilisation
                </Link>
                <Link to="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Confidentialité
                </Link>
                <Link to="/support" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Support
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default TerrainLayout; 