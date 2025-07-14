import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Users, Star, Filter, Search, Calendar } from 'lucide-react';
import apiService from '../services/api';

interface Terrain {
  id: number;
  nom: string;
  name?: string;
  description: string;
  adresse: string;
  prix_heure: number;
  capacite?: number;
  surface?: number;
  latitude: number;
  longitude: number;
  image_principale: string;
  images?: string[];
  distance?: number;
  note_moyenne?: number;
  nombre_avis?: number;
  est_actif: boolean;
}

const TerrainsReservationPage: React.FC = () => {
  const [terrains, setTerrains] = useState<Terrain[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [priceFilter, setPriceFilter] = useState('');
  const [sortBy, setSortBy] = useState('distance');
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();

  const fetchTerrains = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getTerrains();
      if (response.success && response.data) {
        let terrainsData = response.data.data || response.data;
        
        if (searchTerm) {
          terrainsData = terrainsData.filter((terrain: any) =>
            terrain.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
            terrain.adresse.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }

        if (priceFilter) {
          terrainsData = terrainsData.filter((terrain: any) => {
            const prix = Number(terrain.prix_heure);
            switch (priceFilter) {
              case 'low': return prix <= 25000;
              case 'medium': return prix > 25000 && prix <= 35000;
              case 'high': return prix > 35000;
              default: return true;
            }
          });
        }

        terrainsData.sort((a: any, b: any) => {
          switch (sortBy) {
            case 'price_asc': return Number(a.prix_heure) - Number(b.prix_heure);
            case 'price_desc': return Number(b.prix_heure) - Number(a.prix_heure);
            case 'rating': return (b.note_moyenne || 0) - (a.note_moyenne || 0);
            case 'name': return a.nom.localeCompare(b.nom);
            default: return 0;
          }
        });

        setTerrains(terrainsData as any);
      } else {
        setError('Erreur lors de la récupération des terrains');
      }
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, priceFilter, sortBy]);

  useEffect(() => {
    fetchTerrains();
  }, [fetchTerrains]);

  const handleReservation = (terrainId: number) => {
    navigate(`/reservation/${terrainId}`);
  };

  const getImageUrl = () => {
    return '/terrain-foot.jpg';
  };

  const formatPrice = (price: number) => {
    return Number(price).toLocaleString() + ' CFA/h';
  };

  const getNearbyTerrains = async () => {
    setLoading(true);
    try {
      const location = await apiService.getUserLocation();
      if (location) {
        const response = await apiService.getNearbyTerrains(location.latitude, location.longitude, 15);
        if (response.success && response.data) {
          setTerrains(response.data);
        }
      }
    } catch (err) {
      console.error('Erreur localisation:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Hero avec skeleton */}
        <div className="bg-gradient-to-r from-green-600 to-orange-500 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Réservez votre </h1>
            <p className="text-xl opacity-90">Trouvez et réservez le parfait en quelques clics</p>
          </div>
        </div>
        
        {/* Skeleton loading */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-lg overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-6">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-orange-500 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Réservez votre </h1>
            <p className="text-xl opacity-90 mb-8">
              Trouvez et réservez le parfait en quelques clics
            </p>
            
            {/* Barre de recherche principale */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Rechercher par nom ou adresse..."
                  className="w-full pl-12 pr-4 py-4 rounded-lg text-gray-900 text-lg focus:ring-4 focus:ring-white/20 outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Filter className="w-4 h-4" />
                <span>Filtres</span>
              </button>
              
              <button
                onClick={getNearbyTerrains}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <MapPin className="w-4 h-4" />
                <span>À proximité</span>
              </button>
            </div>

            <div className="flex items-center space-x-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="distance">Distance</option>
                <option value="price_asc">Prix croissant</option>
                <option value="price_desc">Prix décroissant</option>
                <option value="rating">Mieux notés</option>
                <option value="name">Nom</option>
              </select>

              <div className="text-sm text-gray-600">
                {terrains.length} {terrains.length > 1 ? 's' : ''} disponible{terrains.length > 1 ? 's' : ''}
              </div>
            </div>
          </div>

          {/* Filtres étendus */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Prix par heure</label>
                  <select
                    value={priceFilter}
                    onChange={(e) => setPriceFilter(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Tous les prix</option>
                    <option value="low">≤ 25 000 CFA</option>
                    <option value="medium">25 000 - 35 000 CFA</option>
                    <option value="high">&gt; 35 000 CFA</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Terrains */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8 text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {terrains.map((terrain) => (
            <div key={terrain.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              {/* Image */}
              <div className="relative h-48">
                <img
                  src={getImageUrl()}
                  alt={terrain.nom}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4 bg-white rounded-full px-3 py-1 shadow-lg">
                  <span className="text-sm font-bold text-green-600">
                    {formatPrice(terrain.prix_heure)}
                  </span>
                </div>
                {terrain.distance && (
                  <div className="absolute top-4 left-4 bg-blue-500 text-white rounded-full px-3 py-1 shadow-lg">
                    <span className="text-sm font-medium">{terrain.distance} km</span>
                  </div>
                )}
              </div>

              {/* Contenu */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{terrain.nom}</h3>
                  {terrain.note_moyenne && (
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium">{terrain.note_moyenne.toFixed(1)}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center text-gray-600 mb-3">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span className="text-sm">{terrain.adresse}</span>
                </div>

                {terrain.capacite && (
                  <div className="flex items-center text-gray-600 mb-4">
                    <Users className="w-4 h-4 mr-2" />
                    <span className="text-sm">Capacité: {terrain.capacite} joueurs</span>
                  </div>
                )}

                <p className="text-gray-600 text-sm mb-6 line-clamp-2">
                  {terrain.description}
                </p>

                {/* Actions */}
                <div className="space-y-3">
                  <button
                    onClick={() => handleReservation(terrain.id)}
                    className="w-full bg-gradient-to-r from-green-600 to-orange-500 hover:from-green-700 hover:to-orange-600 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Réserver maintenant</span>
                  </button>
                  
                  <Link
                                                to={`/users//${terrain.id}`}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors text-center block"
                  >
                    Voir les détails
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* État vide */}
        {terrains.length === 0 && !loading && (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <MapPin className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">Aucun trouvé</h3>
            <p className="text-gray-600 mb-6">Essayez de modifier vos filtres ou votre recherche</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setPriceFilter('');
                setSortBy('distance');
                fetchTerrains();
              }}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Réinitialiser les filtres
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TerrainsReservationPage; 