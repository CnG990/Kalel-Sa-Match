import React, { useState, useEffect } from 'react';
import { Users, TrendingUp, Calendar, RefreshCw } from 'lucide-react';
import apiService from '../../services/api';
import toast from 'react-hot-toast';

interface Souscription {
  id: number;
  user: { id: number; nom: string; prenom?: string; email: string };
  abonnement: { id: number; nom?: string; type_abonnement?: string; prix?: number };
  date_debut: string;
  date_fin: string;
  statut: string;
}

const AbonnementsManagerPage: React.FC = () => {
  const [souscriptions, setSouscriptions] = useState<Souscription[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSouscriptions = async () => {
    setLoading(true);
    try {
      const { data } = await apiService.get<Souscription[]>('/terrains/souscriptions/');
      const list = Array.isArray(data) ? data : (data as any)?.results ?? [];
      setSouscriptions(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Erreur chargement souscriptions:', err);
      toast.error('Erreur lors du chargement des abonnés');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSouscriptions(); }, []);

  const getStatusBadge = (statut: string) => {
    const map: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      expiree: 'bg-yellow-100 text-yellow-800',
      annulee: 'bg-red-100 text-red-800',
    };
    const labels: Record<string, string> = {
      active: 'Active',
      expiree: 'Expirée',
      annulee: 'Annulée',
    };
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${map[statut] || 'bg-gray-100 text-gray-800'}`}>
        {labels[statut] || statut}
      </span>
    );
  };

  const activeCount = souscriptions.filter(s => s.statut === 'active').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">🎫 Abonnés de mes terrains</h1>
        <p className="text-purple-100">Suivez les souscriptions actives sur vos terrains</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600"><Users className="w-6 h-6" /></div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total abonnés</p>
              <p className="text-2xl font-bold text-gray-900">{souscriptions.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600"><TrendingUp className="w-6 h-6" /></div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Actifs</p>
              <p className="text-2xl font-bold text-gray-900">{activeCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600"><Calendar className="w-6 h-6" /></div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Expirés/Annulés</p>
              <p className="text-2xl font-bold text-gray-900">{souscriptions.length - activeCount}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Liste des souscriptions</h2>
          <button onClick={fetchSouscriptions} className="flex items-center gap-2 px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50">
            <RefreshCw className="w-4 h-4" /> Actualiser
          </button>
        </div>

        {souscriptions.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Aucun abonné pour le moment.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Abonné</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Abonnement</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Période</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {souscriptions.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{s.user?.prenom} {s.user?.nom}</div>
                      <div className="text-sm text-gray-500">{s.user?.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{s.abonnement?.nom || s.abonnement?.type_abonnement || `Plan #${s.abonnement?.id}`}</div>
                      {s.abonnement?.prix && <div className="text-sm text-green-600 font-medium">{Number(s.abonnement.prix).toLocaleString()} FCFA</div>}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div>{new Date(s.date_debut).toLocaleDateString('fr-FR')}</div>
                      <div className="text-xs text-gray-400">→ {new Date(s.date_fin).toLocaleDateString('fr-FR')}</div>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(s.statut)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AbonnementsManagerPage;
