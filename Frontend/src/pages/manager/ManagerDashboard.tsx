import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/api';
import { 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Users,
  Star,
  Clock,
  MapPin,
  LandPlot,
  BarChart3,
  Plus
} from 'lucide-react';
import toast from 'react-hot-toast';
import AddTerrainModal from '../../components/AddTerrainModal';

interface Stats {
  total_terrains: number;
  terrains_actifs: number;
  reservations_mois: number;
  revenus_mois: number;
  taux_occupation: number;
  note_moyenne: number;
  prochaines_reservations: Array<{
    terrain_nom: string;
    date_debut: string;
    client_nom: string;
  }>;
  message?: string;
}

const ManagerDashboard: React.FC = () => {
  const { } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/manager/stats/dashboard');
      if (response.success) {
        setStats(response.data);
      } else {
        toast.error('Erreur lors du chargement des statistiques');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' CFA';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-gray-900">Tableau de bord</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow-lg">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-gray-900">Tableau de bord</h1>
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Erreur de chargement</h3>
          <p className="mt-1 text-sm text-gray-500">Impossible de charger les statistiques.</p>
        </div>
      </div>
    );
  }

  // Affichage spécial si pas de terrains
  if (stats?.total_terrains === 0) {
    return (
      <>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Tableau de bord</h1>
            <p className="text-gray-600">Vue d'ensemble de votre activité</p>
          </div>
          
          <div className="text-center py-16 bg-gradient-to-br from-green-50 to-orange-50 rounded-lg border-2 border-dashed border-gray-300">
            <LandPlot className="mx-auto h-20 w-20 text-gray-400 mb-6" />
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">Ajoutez votre premier terrain</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Commencez par ajouter vos terrains pour pouvoir recevoir des réservations et générer des revenus.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-green-600 to-orange-500 text-white font-semibold rounded-lg hover:from-green-700 hover:to-orange-600 transition-colors shadow-lg"
            >
              <Plus className="w-6 h-6 mr-3" />
              Ajouter mon premier terrain
            </button>
            
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
              <div className="p-4 bg-white rounded-lg shadow-sm">
                <MapPin className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <h4 className="font-medium text-gray-900">Localisation</h4>
                <p className="text-sm text-gray-600">Ajoutez l'adresse précise</p>
              </div>
              <div className="p-4 bg-white rounded-lg shadow-sm">
                <Clock className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                <h4 className="font-medium text-gray-900">Horaires</h4>
                <p className="text-sm text-gray-600">Définissez vos créneaux</p>
              </div>
              <div className="p-4 bg-white rounded-lg shadow-sm">
                <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <h4 className="font-medium text-gray-900">Revenus</h4>
                <p className="text-sm text-gray-600">Fixez vos tarifs</p>
              </div>
            </div>
          </div>
        </div>
        
        <AddTerrainModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSuccess={fetchStats}
        />
      </>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Tableau de bord</h1>
        <p className="text-gray-600">Vue d'ensemble de votre activité</p>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <LandPlot className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Terrains</p>
              <p className="text-2xl font-semibold text-gray-900">{stats?.total_terrains || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Réservations ce mois</p>
              <p className="text-2xl font-semibold text-gray-900">{stats?.reservations_mois || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Revenus mensuels</p>
              <p className="text-2xl font-semibold text-gray-900">{formatCurrency(stats?.revenus_mois || 0)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Taux d'occupation</p>
              <p className="text-2xl font-semibold text-gray-900">{Math.max(0, Math.round(stats?.taux_occupation || 0))}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques secondaires */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Terrains actifs</p>
              <p className="text-xl font-semibold text-gray-900">{stats?.terrains_actifs || stats?.total_terrains || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Note moyenne</p>
              <p className="text-xl font-semibold text-gray-900">{(stats?.note_moyenne || 0).toFixed(1)}/5</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Occupation</p>
              <p className="text-xl font-semibold text-gray-900">{Math.max(0, Math.round(stats?.taux_occupation || 0))}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Prochaines réservations */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Prochaines réservations</h2>
        {stats?.prochaines_reservations && stats.prochaines_reservations.length > 0 ? (
          <div className="space-y-4">
            {stats.prochaines_reservations.map((reservation, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">{reservation.terrain_nom}</p>
                    <p className="text-sm text-gray-600">{reservation.client_nom}</p>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  {new Date(reservation.date_debut).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                  } as Intl.DateTimeFormatOptions)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">Aucune réservation prochaine</p>
        )}
      </div>
    </div>
  );
};

export default ManagerDashboard; 