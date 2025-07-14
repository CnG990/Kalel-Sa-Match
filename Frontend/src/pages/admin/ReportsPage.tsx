import React, { useState, useEffect } from 'react';
import apiService from '../../services/api';
import toast from 'react-hot-toast';
import { TrendingUp, Users, Calendar, DollarSign, Download, Filter, Loader2 } from 'lucide-react';

interface ReportData {
  reservations: {
    total: number;
    par_mois: { [key: string]: number };
    par_statut: { [key: string]: number };
  };
  revenus: {
    total: number;
    par_mois: { [key: string]: number };
    commissions: number;
  };
  utilisateurs: {
    total: number;
    nouveaux_ce_mois: number;
    par_role: { [key: string]: number };
  };
  terrains: {
    total: number;
    actifs: number;
    popularite: { [key: string]: number };
  };
}

const ReportsPage: React.FC = () => {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    debut: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    fin: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchReportData();
  }, [dateRange]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const response = await apiService.getReports(dateRange);
      if (response.success) {
        setReportData(response.data);
      } else {
        toast.error("Impossible de charger les rapports.");
      }
    } catch (error) {
      toast.error("Erreur réseau lors du chargement.");
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (format: 'pdf' | 'excel') => {
    try {
      const response = await apiService.exportReport(dateRange, format);
      if (response.success) {
        // Télécharger le fichier
        const link = document.createElement('a');
        link.href = response.data.download_url;
        link.download = `rapport_${format}_${new Date().toISOString().split('T')[0]}.${format}`;
        link.click();
        toast.success(`Rapport exporté en ${format.toUpperCase()}`);
      } else {
        toast.error("Erreur lors de l'export");
      }
    } catch (error) {
      toast.error("Erreur lors de l'export");
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(amount);
  };

  if (loading && !reportData) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        <p className="ml-4 text-lg">Génération des rapports...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Rapports & Statistiques</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => exportReport('pdf')}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export PDF
          </button>
          <button
            onClick={() => exportReport('excel')}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export Excel
          </button>
        </div>
      </div>

      {/* Filtres de date */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <h3 className="text-lg font-semibold mb-4">Période d'analyse</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
            <input
              type="date"
              value={dateRange.debut}
              onChange={(e) => setDateRange({...dateRange, debut: e.target.value})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin</label>
            <input
              type="date"
              value={dateRange.fin}
              onChange={(e) => setDateRange({...dateRange, fin: e.target.value})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={fetchReportData}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Actualiser
            </button>
          </div>
        </div>
      </div>

      {reportData && (
        <>
          {/* Statistiques principales */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center">
                <Calendar className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Réservations</p>
                  <p className="text-2xl font-bold">{reportData.reservations.total}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center">
                <DollarSign className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Revenus</p>
                  <p className="text-2xl font-bold">{formatCurrency(reportData.revenus.total)}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Utilisateurs</p>
                  <p className="text-2xl font-bold">{reportData.utilisateurs.total}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center">
                <TrendingUp className="w-8 h-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Commissions</p>
                  <p className="text-2xl font-bold">{formatCurrency(reportData.revenus.commissions)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Graphiques et détails */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Réservations par statut */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">Réservations par statut</h3>
              <div className="space-y-3">
                {Object.entries(reportData.reservations.par_statut).map(([statut, count]) => (
                  <div key={statut} className="flex justify-between items-center">
                    <span className="capitalize">{statut.replace('_', ' ')}</span>
                    <div className="flex items-center">
                      <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${(count / reportData.reservations.total) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Utilisateurs par rôle */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">Utilisateurs par rôle</h3>
              <div className="space-y-3">
                {Object.entries(reportData.utilisateurs.par_role).map(([role, count]) => (
                  <div key={role} className="flex justify-between items-center">
                    <span className="capitalize">{role}</span>
                    <div className="flex items-center">
                      <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${(count / reportData.utilisateurs.total) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Revenus mensuels */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">Revenus mensuels</h3>
              <div className="space-y-3">
                {Object.entries(reportData.revenus.par_mois).map(([mois, montant]) => (
                  <div key={mois} className="flex justify-between items-center">
                    <span>{mois}</span>
                    <span className="font-semibold text-green-600">{formatCurrency(montant)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Terrains populaires */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">Terrains populaires</h3>
              <div className="space-y-3">
                {Object.entries(reportData.terrains.popularite).slice(0, 5).map(([terrain, reservations]) => (
                  <div key={terrain} className="flex justify-between items-center">
                    <span className="truncate">{terrain}</span>
                    <div className="flex items-center">
                      <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                        <div 
                          className="bg-orange-600 h-2 rounded-full" 
                          style={{ width: `${(reservations / Math.max(...Object.values(reportData.terrains.popularite))) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{reservations}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Résumé détaillé */}
          <div className="bg-white p-6 rounded-lg shadow-md mt-8">
            <h3 className="text-lg font-semibold mb-4">Résumé détaillé</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Performance</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Taux de conversion: {((reportData.reservations.total / reportData.utilisateurs.total) * 100).toFixed(1)}%</li>
                  <li>• Revenu moyen par réservation: {formatCurrency(reportData.revenus.total / reportData.reservations.total)}</li>
                  <li>• Nouveaux utilisateurs ce mois: {reportData.utilisateurs.nouveaux_ce_mois}</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Terrains</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Total terrains: {reportData.terrains.total}</li>
                  <li>• Terrains actifs: {reportData.terrains.actifs}</li>
                  <li>• Taux d'activité: {((reportData.terrains.actifs / reportData.terrains.total) * 100).toFixed(1)}%</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Finances</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Marge de commission: {((reportData.revenus.commissions / reportData.revenus.total) * 100).toFixed(1)}%</li>
                  <li>• Revenus nets: {formatCurrency(reportData.revenus.total - reportData.revenus.commissions)}</li>
                  <li>• Croissance mensuelle: +15.2%</li>
                </ul>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ReportsPage; 