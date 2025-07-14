import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/api';

interface Reservation {
  id: number;
  date_debut: string;
  date_fin: string;
  statut: 'confirmée' | 'en_attente' | 'annulée' | 'terminée';
  montant_total: number;
  terrain: {
    id: number;
    name: string;
    adresse: string;
  };
}

const ClientDashboardPage: React.FC = () => {
  const { user, logout, isLoading: authLoading } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [reservationsLoading, setReservationsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || !user) {
      return;
    }

    const fetchReservations = async () => {
      setReservationsLoading(true);
      setError(null);
      try {
        const response = await apiService.getMyReservations();
        if (response.success && Array.isArray(response.data)) {
          const formattedReservations = response.data
            .filter((res: any) => res.terrain) // S'assurer que le terrain existe
            .map((res: any) => ({
              ...res,
              terrain: {
                id: res.terrain.id,
                name: res.terrain.name || 'Nom non disponible',
                adresse: res.terrain.adresse || 'Adresse non disponible',
              }
          }));
          setReservations(formattedReservations);
        } else {
          setError(response.message || 'Impossible de charger vos réservations.');
        }
      } catch (err: any) {
        setError('Une erreur est survenue lors de la récupération de vos réservations.');
        console.error(err);
      } finally {
        setReservationsLoading(false);
      }
    };

    fetchReservations();
  }, [user, authLoading]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Chargement de votre espace...</p>
      </div>
    );
  }

  const upcomingReservations = reservations.filter(r => new Date(r.date_debut) >= new Date() && r.statut !== 'annulée');
  const pastReservations = reservations.filter(r => new Date(r.date_debut) < new Date() || r.statut === 'annulée');

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header du Dashboard */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Bonjour, {user.prenom} !
              </h1>
              <p className="mt-1 text-lg text-gray-600">
                Bienvenue sur votre espace personnel.
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-3">
              <Link
                to="/dashboard/map"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-green-600 to-orange-500 hover:from-green-700 hover:to-orange-600"
              >
                Nouvelle Réservation
              </Link>
              <button
                onClick={logout}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonne principale : Réservations */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Mes Réservations</h2>
            
            {error && <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-lg">{error}</div>}

            {/* Réservations à venir */}
            <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-8">
              <div className="p-6 border-b">
                <h3 className="text-lg font-medium">À venir</h3>
              </div>
              <div className="p-6">
                {reservationsLoading ? (
                  <p className="text-gray-600">Chargement des réservations...</p>
                ) : upcomingReservations.length > 0 ? (
                  <ul className="divide-y divide-gray-200">
                    {upcomingReservations.map(res => (
                      <li key={res.id} className="py-4 flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-800">{res.terrain.name}</p>
                          <p className="text-sm text-gray-600">{new Date(res.date_debut).toLocaleString('fr-FR')}</p>
                        </div>
                        <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 capitalize">
                          {res.statut.replace('_', ' ')}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-600">Vous n'avez aucune réservation à venir.</p>
                )}
              </div>
            </div>

            {/* Historique */}
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
              <div className="p-6 border-b">
                <h3 className="text-lg font-medium">Historique</h3>
              </div>
              <div className="p-6">
                {reservationsLoading ? (
                  <p className="text-gray-600">Chargement de l'historique...</p>
                ) : pastReservations.length > 0 ? (
                  <ul className="divide-y divide-gray-200">
                    {pastReservations.map(res => (
                       <li key={res.id} className="py-4 flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-800">{res.terrain.name}</p>
                          <p className="text-sm text-gray-600">{new Date(res.date_debut).toLocaleString('fr-FR')}</p>
                        </div>
                        <span className={`px-3 py-1 text-xs font-medium rounded-full capitalize ${res.statut === 'annulée' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                          {res.statut.replace('_', ' ')}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-600">Votre historique de réservations est vide.</p>
                )}
              </div>
            </div>
          </div>

          {/* Colonne latérale : Profil */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow-lg rounded-lg p-6 sticky top-24">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Mon Profil</h3>
              <div className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Nom complet</dt>
                  <dd className="mt-1 text-md text-gray-900">{user.prenom} {user.nom}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Adresse e-mail</dt>
                  <dd className="mt-1 text-md text-gray-900">{user.email}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Rôle</dt>
                  <dd className="mt-1 text-md text-gray-900 capitalize">{user.role}</dd>
                </div>
              </div>
              <div className="mt-8">
                <button className="w-full text-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 cursor-not-allowed opacity-50">
                  Modifier mon profil
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboardPage; 