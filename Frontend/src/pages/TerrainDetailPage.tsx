import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
// Supprimer tous les imports Leaflet :
// import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
// import 'leaflet/dist/leaflet.css';
// import L from 'leaflet';
import { useAuth } from '../context/AuthContext';
import apiService, { type TerrainDTO } from '../services/api';
import ReservationModal from './components/ReservationModal';
import type { TerrainUI } from '../types/terrain.ts';

const TerrainDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const [terrain, setTerrain] = useState<TerrainUI | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTerrain = async () => {
      if (!id) {
        setError('ID du terrain manquant');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        const { data, meta } = await apiService.getTerrain(id);
        const result = data;
        
        if (!result) {
          throw new Error(meta.message || 'Terrain non trouvé');
        }

        const normalizedTerrain: TerrainUI = {
          ...result,
          latitude: result.latitude !== undefined && result.latitude !== null ? Number(result.latitude) : null,
          longitude: result.longitude !== undefined && result.longitude !== null ? Number(result.longitude) : null,
          equipements: (result as TerrainDTO).equipements ?? [],
          images: result.images ?? [],
        };

        setTerrain(normalizedTerrain);
      } catch (e: any) {
        console.error("Erreur lors de la récupération du terrain:", e);
        setError(e.message || 'Erreur lors du chargement du terrain');
      } finally {
        setLoading(false);
      }
    };

    fetchTerrain();
  }, [id]);

  const handleReservationClick = () => {
    if (!isAuthenticated) {
      navigate('/login', { 
        state: { 
          from: `/users/terrain/${id}`,
          message: 'Veuillez vous connecter pour réserver ce terrain' 
        } 
      });
      return;
    }
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        <span className="ml-3 text-lg">Chargement du terrain...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="text-center bg-red-50 border border-red-200 rounded-lg p-8 max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Erreur</h2>
          <p className="text-red-700 mb-6">{error}</p>
          <Link 
            to="/dashboard/map" 
            className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg inline-block transition-colors"
          >
            Voir la carte
          </Link>
        </div>
      </div>
    );
  }

  if (!terrain) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="text-center bg-gray-50 border border-gray-200 rounded-lg p-8 max-w-md">
          <h2 className="text-2xl font-bold text-gray-600 mb-4">Terrain non trouvé</h2>
          <p className="text-gray-700 mb-6">Le terrain demandé n'existe pas ou n'est plus disponible.</p>
          <Link 
            to="/dashboard/map" 
            className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg inline-block transition-colors"
          >
            Voir la carte
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Breadcrumb */}
      <div className="mb-8 text-sm">
        <Link to="/" className="text-orange-600 hover:underline">Accueil</Link>
        <span className="mx-2">/</span>
        <Link to="/dashboard/map" className="text-orange-600 hover:underline">Carte</Link>
        <span className="mx-2">/</span>
        <span>{terrain.nom}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Colonne gauche: Informations détaillées */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-5 sm:p-8 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Informations détaillées</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-700">Adresse</h3>
                <p className="text-gray-600">{terrain.adresse}</p>
                {((terrain as any).ville || (terrain as any).quartier) && (
                  <p className="text-sm text-gray-500 mt-1">
                    {(terrain as any).quartier}{(terrain as any).quartier && (terrain as any).ville ? ', ' : ''}{(terrain as any).ville}
                  </p>
                )}
              </div>
              {terrain.description && (
                <div>
                  <h3 className="font-semibold text-gray-700">Description</h3>
                  <p className="text-gray-600">{terrain.description}</p>
                </div>
              )}
              {(terrain as any).telephone && (
                <div>
                  <h3 className="font-semibold text-gray-700">Contact</h3>
                  <a href={`tel:${(terrain as any).telephone}`} className="text-orange-600 hover:underline">{(terrain as any).telephone}</a>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Caractéristiques</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-500 mb-1">Surface</p>
                <p className="font-semibold text-green-800 text-sm">{((terrain as any).type_surface || 'gazon_synthetique').replace(/_/g, ' ')}</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-500 mb-1">Format</p>
                <p className="font-semibold text-blue-800 text-sm">{(terrain as any).nombre_joueurs || '5v5'}</p>
              </div>
              {(terrain as any).longueur && (terrain as any).largeur && (
                <div className="bg-purple-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500 mb-1">Dimensions</p>
                  <p className="font-semibold text-purple-800 text-sm">{(terrain as any).longueur} x {(terrain as any).largeur} m</p>
                </div>
              )}
              {terrain.capacite && (
                <div className="bg-orange-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500 mb-1">Capacité</p>
                  <p className="font-semibold text-orange-800 text-sm">{terrain.capacite} joueurs</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Équipements & Services</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'eclairage', label: 'Éclairage nocturne', icon: '💡' },
                { key: 'vestiaires', label: 'Vestiaires', icon: '🚪' },
                { key: 'parking', label: 'Parking', icon: '🅿️' },
                { key: 'douches', label: 'Douches', icon: '🚿' },
                { key: 'buvette', label: 'Buvette', icon: '🥤' },
              ].map((item) => (
                <div key={item.key} className={`flex items-center gap-2 p-2 rounded-lg text-sm ${(terrain as any)[item.key] ? 'bg-green-50 text-green-800' : 'bg-gray-50 text-gray-400'}`}>
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                  {(terrain as any)[item.key] ? <span className="ml-auto text-green-600 font-bold">✓</span> : <span className="ml-auto">✗</span>}
                </div>
              ))}
            </div>
            {terrain.equipements && terrain.equipements.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <h3 className="font-semibold text-gray-700 mb-2">Autres équipements</h3>
                <ul className="grid grid-cols-1 gap-1">
                  {terrain.equipements.map((item, index) => (
                    <li key={index} className="text-gray-600 text-sm flex items-center">
                      <span className="text-green-500 mr-2">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Colonne droite: Réservation */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-white p-5 sm:p-8 rounded-xl shadow-xl">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">{terrain.nom}</h1>
            <p className="mt-2 text-gray-600">{terrain.adresse}</p>
            
            {/* Status badge - Toujours ouvert */}
            <div className="mt-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                ✅ Ouvert
              </span>
            </div>
            
            <div className="mt-6 pt-6 border-t">
              <span className="text-2xl sm:text-3xl font-bold text-orange-600">
                {terrain.prix_heure ? `${terrain.prix_heure.toLocaleString()} FCFA` : 'Prix sur demande'}
                <span className="text-lg font-normal text-gray-500"> / heure</span>
              </span>
            </div>
            
             <div className="mt-8">
              <button 
                onClick={handleReservationClick}
                className="w-full font-semibold text-lg py-4 rounded-lg shadow-lg transition-all bg-orange-600 hover:bg-orange-700 text-white hover:shadow-2xl"
              >
                {isAuthenticated ? 'Choisir un créneau' : 'Se connecter pour réserver'}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {isModalOpen && (
        <ReservationModal 
          terrain={terrain}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default TerrainDetailPage; 