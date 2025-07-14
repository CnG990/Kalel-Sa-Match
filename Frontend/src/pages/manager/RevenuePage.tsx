import React, { useState, useEffect } from 'react';
import apiService from '../../services/api';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  PieChart,
  AlertCircle,
  LandPlot
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

interface RevenueData {
  revenus_total: number;
  revenus_mois_actuel: number;
  revenus_mois_precedent: number;
  commissions_payees: number;
  commissions_en_attente: number;
  revenus_par_terrain: Array<{
    terrain_nom: string;
    revenus: number;
    reservations_count: number;
  }>;
  revenus_par_mois: Array<{
    mois: string;
    revenus: number;
    commissions: number;
  }>;
}

const RevenuePage: React.FC = () => {
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('mois');
  const [error, ] = useState<string | null>(null);

  useEffect(() => {
    fetchRevenueData();
  }, [selectedPeriod]);

  const fetchRevenueData = async () => {
    try {
      setLoading(true);
      // Utiliser la nouvelle API des statistiques de revenus
      const response = await apiService.getRevenueStats();
      
      if (response.success) {
        setRevenueData(response.data);
      } else {
        console.error('Erreur API:', response.message);
        toast.error(response.message || "Impossible de charger les données de revenus.");
      }
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      toast.error("Erreur lors du chargement des revenus.");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' CFA';
  };

  // Protection contre les données undefined
  const safeRevenueData = {
    revenus_total: revenueData?.revenus_total || 0,
    revenus_mois_actuel: revenueData?.revenus_mois_actuel || 0,
    revenus_mois_precedent: revenueData?.revenus_mois_precedent || 0,
    commissions_payees: revenueData?.commissions_payees || 0,
    commissions_en_attente: revenueData?.commissions_en_attente || 0,
    revenus_par_terrain: revenueData?.revenus_par_terrain || [],
    revenus_par_mois: revenueData?.revenus_par_mois || []
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-gray-900">Revenus</h1>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Chargement des données...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-gray-900">Revenus</h1>
        <div className="text-center py-12 bg-red-50 rounded-lg">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-2 text-sm font-medium text-red-900">Erreur de chargement</h3>
          <p className="mt-1 text-sm text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  // Affichage vide si pas de données
  if (!revenueData || safeRevenueData.revenus_total === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-gray-900">Revenus</h1>
        <div className="text-center py-12 bg-gradient-to-br from-green-50 to-orange-50 rounded-lg border-2 border-dashed border-gray-300">
          <TrendingUp className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun revenu pour le moment</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Vos revenus apparaîtront ici une fois que vous aurez des réservations confirmées et payées.
          </p>
          <Link 
            to="/manager/terrains" 
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-orange-500 text-white font-medium rounded-lg hover:from-green-700 hover:to-orange-600 transition-colors"
          >
            <LandPlot className="w-5 h-5 mr-2" />
            Gérer mes terrains
          </Link>
        </div>
      </div>
    );
  }

  const evolutionRevenu = revenueData.revenus_mois_actuel - revenueData.revenus_mois_precedent;
  const tauxEvolution = revenueData.revenus_mois_precedent > 0 
    ? (evolutionRevenu / revenueData.revenus_mois_precedent) * 100 
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Revenus</h1>
          <p className="text-gray-600">Suivez vos revenus et commissions</p>
        </div>
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="bg-white border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="mois">Ce mois</option>
          <option value="trimestre">Ce trimestre</option>
          <option value="annee">Cette année</option>
        </select>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Revenus totaux</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatCurrency(safeRevenueData.revenus_total)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Ce mois</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatCurrency(safeRevenueData.revenus_mois_actuel)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center">
            <div className={`p-2 rounded-lg ${evolutionRevenu >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
              {evolutionRevenu >= 0 ? (
                <TrendingUp className="w-6 h-6 text-green-600" />
              ) : (
                <TrendingDown className="w-6 h-6 text-red-600" />
              )}
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Évolution</p>
              <p className={`text-2xl font-semibold ${evolutionRevenu >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {tauxEvolution > 0 ? '+' : ''}{tauxEvolution.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <PieChart className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Commissions payées</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatCurrency(safeRevenueData.commissions_payees)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Revenus par terrain */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenus par terrain</h2>
        <div className="space-y-4">
          {revenueData.revenus_par_terrain.map((terrain, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">{terrain.terrain_nom}</p>
                <p className="text-sm text-gray-600">{terrain.reservations_count} réservations</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-green-600">
                  {formatCurrency(terrain.revenus)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Évolution mensuelle */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Évolution mensuelle</h2>
        <div className="space-y-4">
          {revenueData.revenus_par_mois.map((mois, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">{mois.mois}</p>
                <p className="text-sm text-gray-600">
                  Commission: {formatCurrency(mois.commissions)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-green-600">
                  {formatCurrency(mois.revenus)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Commissions en attente */}
      {revenueData.commissions_en_attente > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Calendar className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-yellow-800">Commissions en attente</p>
              <p className="text-lg font-semibold text-yellow-900">
                {formatCurrency(revenueData.commissions_en_attente)}
              </p>
              <p className="text-sm text-yellow-700">
                Ces commissions seront déduites lors de votre prochaine facture
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RevenuePage; 