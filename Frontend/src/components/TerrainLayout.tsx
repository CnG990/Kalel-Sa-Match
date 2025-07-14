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
              <img src="/logo-1.webp" alt="Kalèl Sa Match Logo" className="h-10 w-auto" />
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
                <img src="/logo-1.webp" alt="Logo Kalél Sa Match" className="h-8 w-auto" />
                <div className="ml-3">
                  <span className="text-lg font-bold">
                    <span className="text-green-400">Kalél</span>
                    <span className="text-orange-400"> Sa Match</span>
                  </span>
                </div>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                La plateforme n°1 pour la réservation de terrains synthétiques à Dakar. 
                Réservez facilement vos créneaux préférés.
              </p>
              <div className="flex space-x-3">
                <a href="#" className="text-gray-400 hover:text-green-400 transition-colors" title="Facebook">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-green-400 transition-colors" title="WhatsApp">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-green-400 transition-colors" title="Instagram">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.624 0 11.99-5.367 11.99-11.989C24.007 5.367 18.641.001 12.017.001z"/>
                  </svg>
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
                  <a href="tel:+22177123456" className="hover:text-white transition-colors">
                    +221 77 123 45 67
                  </a>
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