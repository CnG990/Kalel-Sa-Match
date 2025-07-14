import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import apiService from '../services/api';

interface Terrain {
  id: number;
  name: string;
  description: string;
  adresse: string;
  prix_heure: number;
  area: number;
  capacite_spectateurs: number;
  equipements: string[];
  gestionnaire: string;
  contact_telephone: string;
  contact_email: string;
  horaires_ouverture: any;
  etat: string;
  latitude: number;
  longitude: number;
  distance?: number;
  stats?: {
    total_reservations: number;
    note_moyenne: number;
    est_ouvert: boolean;
  };
}

const TerrainsPage: React.FC = () => {
  const [terrains, setTerrains] = useState<Terrain[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedZone, setSelectedZone] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTerrains, setTotalTerrains] = useState(0);
  const location = useLocation();

  // Zones disponibles (basées sur les données réelles)
  const zones = ['Almadies', 'Yoff', 'Ouakam', 'Mermoz', 'Fann', 'Plateau', 'Médina', 'Gorée'];

  const fetchTerrains = useCallback(async (page: number, options: any = {}) => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        per_page: 9,
        search: searchTerm,
        sort_by: sortBy,
        sort_direction: sortDirection,
        prix_min: priceRange[0],
        prix_max: priceRange[1],
        ...options,
      };
      const response = await apiService.getTerrains(params);
      if (response.success && response.data) {
        setTerrains(response.data.data as any);
        setTotalPages(response.data.last_page);
        setCurrentPage(response.data.current_page);
        setTotalTerrains(response.data.total);
      } else {
        setError(response.message || 'Erreur lors de la récupération des terrains');
      }
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, priceRange, sortBy, sortDirection]);

  const handleSearchNearby = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const location = await apiService.getUserLocation();
      
      if (!location) {
        setError('Impossible d\'obtenir votre position. Veuillez autoriser la géolocalisation.');
        setLoading(false);
        return;
      }

      const response = await apiService.getNearbyTerrains(location.latitude, location.longitude, 10);
      
      if (response.success && response.data) {
        setTerrains(response.data);
        setTotalTerrains(response.data.length);
        setTotalPages(1);
        setCurrentPage(1);
      } else {
        setError(response.message || 'Erreur lors de la recherche des terrains à proximité');
      }
    } catch (err: any) {
      console.error('Erreur recherche proximité:', err);
      setError('Impossible de rechercher les terrains à proximité. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const searchByProximityOnLoad = location.state?.searchByProximity;
    if (searchByProximityOnLoad) {
      handleSearchNearby();
    } else {
      fetchTerrains(1, { sort_by: 'name', sort_direction: 'asc' });
    }
    // Clear state after use to avoid re-triggering on navigation
    window.history.replaceState({}, document.title)
  }, [location.state, handleSearchNearby, fetchTerrains]);

  // Fonction pour changer de page
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchTerrains(page);
  };

  // Force refresh from API to get latest prices
  const refreshTerrainData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: currentPage,
        per_page: 9,
        sort_by: sortBy,
        sort_direction: sortDirection,
        search: searchTerm,
        _timestamp: Date.now()
      };
      const response = await apiService.getTerrains({
        per_page: params.per_page,
        page: params.page,
        search: params.search,
        sort_by: params.sort_by,
        sort_direction: params.sort_direction as 'asc' | 'desc'
      });
      if (response.success && response.data) {
        setTerrains(response.data.data as any);
        setTotalPages(response.data.last_page);
        setCurrentPage(response.data.current_page);
        setTotalTerrains(response.data.total);
      } else {
        setError(response.message || 'Erreur lors de la récupération des terrains');
      }
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, sortBy, sortDirection, searchTerm]);

  // Auto-refresh every 30 seconds to get latest prices
  useEffect(() => {
    const interval = setInterval(() => {
      refreshTerrainData();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [refreshTerrainData]);

  // Fonction pour obtenir l'image du terrain
  const getTerrainImage = () => {
    return '/terrain-foot.jpg';
  };

  // Fonction pour formater les équipements
  const formatEquipements = (equipements: string[]) => {
    if (!equipements || !Array.isArray(equipements)) {
      return ['Éclairage', 'Vestiaires']; // Équipements par défaut
    }
    return equipements;
  };

  // Fonction pour obtenir la note moyenne
  const getAverageRating = (terrain: Terrain) => {
    return terrain.stats?.note_moyenne || 4.2;
  };

  // Fonction pour obtenir le nombre d'avis
  const getReviewsCount = (terrain: Terrain) => {
    return terrain.stats?.total_reservations || Math.floor(Math.random() * 100) + 20;
  };

  // Fonction pour vérifier si le est disponible
  const isTerrainAvailable = (terrain: Terrain) => {
    return terrain.etat !== 'maintenance' && terrain.stats?.est_ouvert !== false;
  };

  // Fonction pour rechercher par nom de localisation
  const searchByLocation = async (locationName: string) => {
    if (!locationName.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.searchTerrainsByLocation(locationName);
      
      if (response.success && response.data) {
        setTerrains(response.data);
        setTotalTerrains(response.data.length);
        setTotalPages(1);
        setCurrentPage(1);
      } else {
        setError(response.message || 'Erreur lors de la recherche par localisation');
      }
    } catch (err: any) {
      console.error('Erreur recherche localisation:', err);
      setError('Impossible de rechercher par localisation. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour réinitialiser la recherche
  const resetSearch = () => {
    setSearchTerm('');
    setSelectedZone('');
    setPriceRange('');
    setSortBy('name');
    setSortDirection('asc');
    fetchTerrains(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-orange-500 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Nos Terrains</h1>
            <p className="text-xl opacity-90">
              Découvrez nos terrains synthétiques de qualité à Dakar
            </p>
          </div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Recherche */}
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Rechercher
              </label>
              <input
                type="text"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Nom ou adresse..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Zone */}
            <div>
              <label htmlFor="zone" className="block text-sm font-medium text-gray-700 mb-2">
                Zone
              </label>
              <select
                id="zone"
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Toutes les zones</option>
                {zones.map(zone => (
                  <option key={zone} value={zone}>{zone}</option>
                ))}
              </select>
            </div>

            {/* Fourchette de prix */}
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                Prix
              </label>
              <select
                id="price"
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Tous les prix</option>
                <option value="low">≤ 25 000 FCFA</option>
                <option value="medium">25 000 - 30 000 FCFA</option>
                <option value="high">&gt; 30 000 FCFA</option>
              </select>
            </div>

            {/* Tri */}
            <div>
              <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-2">
                Trier par
              </label>
              <select
                id="sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="name">Nom</option>
                <option value="prix_heure">Prix</option>
                <option value="area">Surface</option>
                <option value="capacite_spectateurs">Capacité</option>
              </select>
            </div>

            {/* Direction du tri */}
            <div>
              <label htmlFor="direction" className="block text-sm font-medium text-gray-700 mb-2">
                Ordre
              </label>
              <select
                id="direction"
                value={sortDirection}
                onChange={(e) => setSortDirection(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="asc">Croissant</option>
                <option value="desc">Décroissant</option>
              </select>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={handleSearchNearby}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              Terrains à proximité
            </button>
            
            <button
              onClick={() => searchByLocation(searchTerm)}
              disabled={!searchTerm.trim()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Rechercher par localisation
            </button>

            <button
              onClick={resetSearch}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Réinitialiser
            </button>
          </div>
        </div>
      </div>

      {/* Liste des terrains */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Informations sur les résultats */}
        <div className="mb-6 flex justify-between items-center">
          <p className="text-gray-600">
            {loading ? 'Chargement...' : `${totalTerrains} ${totalTerrains > 1 ? 's' : ''} trouvé${totalTerrains > 1 ? 's' : ''}`}
          </p>
          {error && (
            <div className="text-red-600 text-sm">
              {error}
            </div>
          )}
        </div>

        {/* État de chargement */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-6">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-4"></div>
                  <div className="flex space-x-2">
                    <div className="h-8 bg-gray-200 rounded flex-1"></div>
                    <div className="h-8 bg-gray-200 rounded flex-1"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Liste des terrains */}
        {!loading && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {terrains.map((terrain) => (
                <div key={terrain.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                  {/* Image du */}
                  <div className="relative h-48 bg-gray-200">
                    <img
                      src={getTerrainImage()}
                      alt={terrain.name}
                      className="w-full h-full object-cover"
                    />
                    {!isTerrainAvailable(terrain) && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <span className="text-white font-semibold text-lg">Indisponible</span>
                      </div>
                    )}
                    <div className="absolute top-4 right-4 bg-white rounded-full px-3 py-1 shadow-md">
                      <span className="text-sm font-semibold text-gray-900">
                        {Number(terrain.prix_heure).toLocaleString()} FCFA/h
                      </span>
                    </div>
                    {terrain.distance && (
                      <div className="absolute top-4 left-4 bg-green-500 text-white rounded-full px-3 py-1 shadow-md">
                        <span className="text-sm font-semibold">{terrain.distance} km</span>
                      </div>
                    )}
                  </div>

                  {/* Informations du */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{terrain.name}</h3>
                      <div className="flex items-center space-x-1">
                        <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="text-sm font-medium text-gray-900">{getAverageRating(terrain).toFixed(1)}</span>
                        <span className="text-sm text-gray-500">({getReviewsCount(terrain)})</span>
                      </div>
                    </div>

                    <p className="text-gray-600 mb-4">{terrain.description}</p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                        {terrain.adresse}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Capacité: {terrain.capacite_spectateurs} joueurs
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                        </svg>
                        Surface: {terrain.area} m²
                      </div>
                    </div>

                    {/* Équipements */}
                    <div className="mb-6">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Équipements</h4>
                      <div className="flex flex-wrap gap-2">
                        {formatEquipements(terrain.equipements).slice(0, 3).map(equipement => (
                          <span
                            key={equipement}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                          >
                            {equipement}
                          </span>
                        ))}
                        {formatEquipements(terrain.equipements).length > 3 && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                                          +{formatEquipements(terrain.equipements).length - 3}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Boutons d'action */}
                    <div className="flex space-x-3">
                      <Link
                        to={`/users//${terrain.id}`}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium py-2 px-4 rounded-lg text-center transition-colors"
                      >
                        Voir détails
                      </Link>
                      {isTerrainAvailable(terrain) ? (
                        <Link
                          to={`/reservation/${terrain.id}`}
                          className="flex-1 bg-gradient-to-r from-green-600 to-orange-500 hover:from-green-700 hover:to-orange-600 text-white font-medium py-2 px-4 rounded-lg text-center transition-colors"
                        >
                          Réserver
                        </Link>
                      ) : (
                        <span className="flex-1 bg-gray-300 text-gray-500 font-medium py-2 px-4 rounded-lg text-center cursor-not-allowed">
                          Indisponible
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex justify-center">
                <nav className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Précédent
                  </button>
                  
                  {[...Array(totalPages)].map((_, index) => {
                    const page = index + 1;
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-2 text-sm font-medium rounded-md ${
                            page === currentPage
                              ? 'bg-green-600 text-white'
                              : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    } else if (
                      page === currentPage - 2 ||
                      page === currentPage + 2
                    ) {
                      return (
                        <span key={page} className="px-3 py-2 text-sm text-gray-500">
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Suivant
                  </button>
                </nav>
              </div>
            )}
          </>
        )}

        {/* État vide */}
        {!loading && terrains.length === 0 && !error && (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun trouvé</h3>
            <p className="text-gray-600">Essayez de modifier vos critères de recherche</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TerrainsPage; 