import React from 'react';
import { MapPin, Users, Calendar, Star, ArrowRight, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-600 to-blue-600 text-white">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              🏟️ Trouvez votre terrain de foot à Dakar
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-green-100">
              Réservez facilement les meilleurs terrains synthétiques de la capitale
            </p>
            {/* Les boutons et infos ont été retirés ici */}
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

          <div className="grid md:grid-cols-3 gap-8">
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
                onClick={() => window.open('/dashboard/map', '_blank')}
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
                to="/terrains"
                className="text-green-600 hover:text-green-800 font-medium flex items-center space-x-2 mx-auto"
              >
                <span>Voir les terrains</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Gestion */}
            <div className="text-center p-6 bg-gray-50 rounded-xl">
              <div className="w-16 h-16 bg-purple-600 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">👥 Gestion</h3>
              <p className="text-gray-600 mb-4">
                Interface admin et gestionnaire avec analytics, rapports et validation
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

      {/* Terrains populaires */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              🏆 Terrains populaires à Dakar
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: "Complexe Be Sport", location: "Route Aéroport", price: "45,000 FCFA/h" },
              { name: "Temple du Foot", location: "Dakar", price: "42,500 FCFA/h" },
              { name: "Fit Park Academy", location: "Corniche Ouest", price: "80,000 FCFA/h" },
              { name: "Stade Deggo", location: "Marriste", price: "25,000 FCFA/h" }
            ].map((terrain, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-3">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <span className="text-green-600 font-bold text-sm">✅ Ouvert</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{terrain.name}</h3>
                <p className="text-gray-600 text-sm mb-2">📍 {terrain.location}</p>
                <p className="text-green-600 font-bold">{terrain.price}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <button
              onClick={() => window.open('/dashboard/map', '_blank')}
              className="bg-green-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-green-700 flex items-center space-x-2 mx-auto"
            >
              <MapPin className="w-5 h-5" />
              <span>Voir tous les terrains sur la carte</span>
            </button>
          </div>
        </div>
      </section>



      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold">Terrains Synthétiques Dakar</span>
            </div>
            <p className="text-gray-400 mb-4">
              Plateforme de réservation de terrains de football synthétiques à Dakar
            </p>
            <div className="text-sm text-gray-500">
              © 2025 Terrains Synthétiques. Projet développé avec Laravel + React + Mapbox + PostGIS
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage; 