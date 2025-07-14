import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import apiService from '../../services/api';
import { Calendar, MapPin, BarChart2, PlusCircle, User } from 'lucide-react';

interface Reservation {
  id: number;
  date_debut: string;
  terrain: { name: string; adresse: string };
  statut: string;
}

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string | number; color: string }> = ({ icon, label, value, color }) => (
  <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
    <div className={`mr-4 p-3 rounded-full ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-gray-600 text-sm font-medium">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  </div>
);

const DashboardOverview: React.FC = () => {
  const { user } = useAuth();
  const [nextReservation, setNextReservation] = useState<Reservation | null>(null);
  const [totalReservations, setTotalReservations] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await apiService.getMyReservations();
        if (res.success && Array.isArray(res.data)) {
          const upcoming = res.data
            .filter((r: any) => new Date(r.date_debut) >= new Date() && r.statut !== 'annulée')
            .sort((a: any, b: any) => new Date(a.date_debut).getTime() - new Date(b.date_debut).getTime());
          
          setNextReservation(upcoming[0] || null);
          setTotalReservations(res.data.length);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading || !user) {
    return <div>Chargement de l'aperçu...</div>;
  }

  return (
    <div>
      <h1 className="text-4xl font-bold text-gray-800 mb-2">
        Bienvenue, {user.prenom} !
      </h1>
      <p className="text-lg text-gray-600 mb-8">
        Voici un résumé de votre activité sur Kalèl Sa Match.
      </p>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard 
          icon={<Calendar size={24} className="text-white" />} 
          label="Matchs joués" 
          value={totalReservations}
          color="bg-blue-500"
        />
        <StatCard 
          icon={<BarChart2 size={24} className="text-white" />} 
          label="Niveau" 
          value="Amateur"
          color="bg-green-500"
        />
        <StatCard 
          icon={<MapPin size={24} className="text-white" />} 
          label="Terrain favori" 
          value="-- --"
          color="bg-orange-500"
        />
      </div>

      {/* Next Reservation & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Prochaine réservation</h2>
          {nextReservation ? (
            <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-orange-500">
              <div className="flex items-center mb-4">
                <Calendar size={28} className="text-orange-500 mr-4" />
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{nextReservation.terrain.name}</h3>
                  <p className="text-gray-600">{new Date(nextReservation.date_debut).toLocaleString('fr-FR', { dateStyle: 'full', timeStyle: 'short' })}</p>
                </div>
              </div>
              <p className="text-gray-700">Adresse : {nextReservation.terrain.adresse}</p>
              <div className="mt-4 text-right">
                <Link to="/dashboard/reservations" className="text-sm font-medium text-orange-600 hover:text-orange-700">
                  Voir mes réservations &rarr;
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <h3 className="text-xl font-semibold text-gray-700">Aucune réservation à venir</h3>
              <p className="text-gray-500 mt-2 mb-4">Le moment idéal pour organiser votre prochain match !</p>
              <Link
                to="/dashboard/map"
                className="inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-green-600 to-orange-500 hover:from-green-700 hover:to-orange-600"
              >
                Trouver un terrain à proximité
              </Link>
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Actions rapides</h2>
          <div className="space-y-4">
            <Link to="/dashboard/map" className="w-full flex items-center bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <PlusCircle className="mr-4 text-green-600" size={24} />
              <span className="font-medium text-gray-800">Réserver un terrain proche</span>
            </Link>
            <Link to="/dashboard/profile" className="w-full flex items-center bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <User className="mr-4 text-blue-600" size={24} />
              <span className="font-medium text-gray-800">Modifier mon Profil</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview; 