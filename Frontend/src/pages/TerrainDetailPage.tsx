import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
// Supprimer tous les imports Leaflet :
// import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
// import 'leaflet/dist/leaflet.css';
// import L from 'leaflet';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/api';
import ReservationModal from './components/ReservationModal';

const MAPBOX_TOKEN = 'pk.eyJ1IjoiY2hlaWtobmdvbTk5IiwiYSI6ImNtYjR5c2NieTF2eXYyaXNia3FmdWd5OTYifQ.yi91YsGpTzlsDA9ljYp8DQ';

// Le type Terrain peut être partagé dans un fichier de types plus tard
interface Terrain {
  id: number;
  nom: string;
  description: string;
  adresse: string;
  latitude: number;
  longitude: number;
  images?: string[];
  prix_heure?: number;
  equipements?: string[];
  regles_terrain?: string;
  est_actif?: boolean;
  est_disponible?: boolean;
}

const TerrainDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const [terrain, setTerrain] = useState<Terrain | null>(null);
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
        
        const result = await apiService.getTerrain(id);
        
        if (result.success && result.data) {
          setTerrain(result.data);
          if (result.data.images && result.data.images.length > 0) {
            // setSelectedImage(`http://127.0.0.1:8000/storage/${result.data.images[0].replace('public/', '')}`);
          }
        } else {
          throw new Error(result.message || 'Terrain non trouvé');
        }
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
        <div className="lg:col-span-1">
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Informations détaillées</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-700">Adresse</h3>
                <p className="text-gray-600">{terrain.adresse}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700">Description</h3>
                <p className="text-gray-600">{terrain.description}</p>
              </div>
              {terrain.equipements && terrain.equipements.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Équipements</h3>
                  <ul className="grid grid-cols-1 gap-2">
                    {terrain.equipements.map((item, index) => (
                      <li key={index} className="text-gray-600 flex items-center">
                        <span className="text-green-500 mr-2">✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Colonne droite: Réservation */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-white p-8 rounded-xl shadow-xl">
            <h1 className="text-3xl font-extrabold text-gray-900">{terrain.nom}</h1>
            <p className="mt-2 text-gray-600">{terrain.adresse}</p>
            
            {/* Status badge - Toujours ouvert */}
            <div className="mt-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                ✅ Ouvert
              </span>
            </div>
            
            <div className="mt-6 pt-6 border-t">
              <span className="text-3xl font-bold text-orange-600">
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