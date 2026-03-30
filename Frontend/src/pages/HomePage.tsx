import React from 'react';
import { MapPin, Users, Calendar, ArrowRight, ExternalLink } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import SEOMetaTags from '../components/SEOMetaTags';
import { useAuth } from '../context/AuthContext';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const goToClientMap = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/dashboard/map' } });
      return;
    }
    navigate('/dashboard/map');
  };

  return (
    <>
      <SEOMetaTags 
        title="Réservez des terrains de football partout au Sénégal"
        description="🏟️ Trouvez et réservez des terrains synthétiques partout au Sénégal en 30s. Paiement Wave/Orange Money, carte interactive, confirmation instantanée."
        url="https://kalelsamatch.com"
      />
      <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-600 to-blue-600 text-white">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="flex flex-col items-center gap-4 mb-6">
              <img 
                src="/logo sans background.png" 
                alt="Kalél Sa Match" 
                className="h-16 w-auto"
              />
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold">
                🏟️ Trouvez votre terrain de foot partout au Sénégal
              </h1>
            </div>
            <p className="text-xl md:text-2xl mb-8 text-green-100">
              Réservez facilement les meilleurs terrains synthétiques avec Kalél Sa Match
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {/* Carte autonome - FONCTIONNE SANS AUTH */}
              <button
                onClick={goToClientMap}
                className="bg-white text-green-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 flex items-center space-x-3 justify-center"
              >
                <MapPin className="w-6 h-6" />
                <span>🗺️ Voir la carte des terrains</span>
                <ExternalLink className="w-5 h-5" />
              </button>
              
              <Link
                to="/terrains"
                className="bg-green-500 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-green-400 flex items-center space-x-3 justify-center"
              >
                <span>📋 Liste des terrains</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              🌟 Fonctionnalités disponibles
            </h2>
            <p className="text-lg text-gray-600">
              Découvrez tous les outils pour trouver et réserver votre terrain
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Carte interactive */}
            <div className="text-center p-6 bg-gray-50 rounded-xl">
              <div className="w-16 h-16 bg-blue-600 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">🗺️ Carte Interactive</h3>
              <p className="text-gray-600 mb-4">
                Visualisez tous les terrains sur une carte Mapbox avec géolocalisation et calcul de distance
              </p>
              <button
                onClick={goToClientMap}
                className="text-blue-600 hover:text-blue-800 font-medium flex items-center space-x-2 mx-auto"
              >
                <span>Tester maintenant</span>
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>

            {/* Réservations */}
            <div className="text-center p-6 bg-gray-50 rounded-xl">
              <div className="w-16 h-16 bg-green-600 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">📅 Réservations</h3>
              <p className="text-gray-600 mb-4">
                Système complet de réservation avec paiement mobile money et tickets QR
              </p>
              <Link
                to="/login"
                className="text-green-600 hover:text-green-800 font-medium flex items-center space-x-2 mx-auto"
              >
                <span>Se connecter</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Gestion / Sécurité */}
            <div className="text-center p-6 bg-gray-50 rounded-xl">
              <div className="w-16 h-16 bg-purple-600 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Sécurité & contrôle</h3>
              <p className="text-gray-600 mb-4">
                Accès gestionnaire sécurisé, suivi des réservations et contrôle des validations
              </p>
              <Link
                to="/register/manager"
                className="text-purple-600 hover:text-purple-800 font-medium flex items-center space-x-2 mx-auto"
              >
                <span>Devenir gestionnaire</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  </>
  );
};

export default HomePage;