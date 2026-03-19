import React, { useState, useEffect } from 'react';
import apiService from '../../services/api';
import toast from 'react-hot-toast';
import { Calculator, CheckCircle, Clock, AlertTriangle, Users, TrendingUp, Loader2, RefreshCw, X } from 'lucide-react';

interface GestionnaireRecap {
  gestionnaire: {
    id: number;
    nom: string;
    prenom: string;
    email: string;
    taux_commission: number;
  };
  nb_terrains: number;
  total_due: number;
  total_payee: number;
  total_en_retard: number;
  nb_commissions: number;
}

interface Commission {
  id: number;
  gestionnaire: number;
  gestionnaire_info: {
    id: number;
    nom: string;
    prenom: string;
    email: string;
  };
  terrain_info?: {
    id: number;
    nom: string;
  };
  source: 'reservation' | 'abonnement' | 'mixte';
  periode: string;
  date_debut_periode: string;
  date_fin_periode: string;
  montant_revenus_reservations: number;
  montant_revenus_abonnements: number;
  montant_revenus: number;
  nb_reservations: number;
  nb_abonnements: number;
  taux_commission: number;
  montant_commission: number;
  statut: 'due' | 'payee' | 'en_retard';
  date_paiement?: string;
  reference_paiement?: string;
}

interface ResumeStats {
  total_due: number;
  total_payee: number;
  total_en_retard: number;
  nb_commissions_dues: number;
  nb_commissions_en_retard: number;
}

const CommissionsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'recap' | 'commissions'>('recap');
  const [recapGestionnaires, setRecapGestionnaires] = useState<GestionnaireRecap[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [stats, setStats] = useState<ResumeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [selectedCommission, setSelectedCommission] = useState<Commission | null>(null);
  const [showPayModal, setShowPayModal] = useState(false);
  const [referencePaiement, setReferencePaiement] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Récap par gestionnaire
      const recapRes = await apiService.get<GestionnaireRecap[]>('/terrains/commissions/par_gestionnaire/');
      if (recapRes.data) {
        setRecapGestionnaires(Array.isArray(recapRes.data) ? recapRes.data : []);
      }

      // Stats globales
      const statsRes = await apiService.get<ResumeStats>('/terrains/commissions/resume/');
      if (statsRes.data) {
        setStats(statsRes.data);
      }

      // Liste des commissions
      const commissionsRes = await apiService.get<{ results: Commission[] }>('/terrains/commissions/');
      if (commissionsRes.data) {
        const list = (commissionsRes.data as any).results || (Array.isArray(commissionsRes.data) ? commissionsRes.data : []);
        setCommissions(list);
      }
    } catch (error) {
      console.error('Erreur chargement commissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCalculer = async (periode: string) => {
    setCalculating(true);
    try {
      const res = await apiService.post<Commission[]>('/terrains/commissions/calculer/', { periode });
      if (res.meta?.success) {
        toast.success(res.meta.message || 'Commissions calculées');
        fetchData();
      } else {
        toast.error('Erreur lors du calcul');
      }
    } catch (error) {
      toast.error('Erreur lors du calcul');
    } finally {
      setCalculating(false);
    }
  };

  const handleMarquerPayee = async () => {
    if (!selectedCommission) return;
    try {
      const res = await apiService.post<Commission>(`/terrains/commissions/${selectedCommission.id}/marquer_payee/`, { reference_paiement: referencePaiement });
      if (res.meta?.success) {
        toast.success('Commission marquée comme payée');
        setShowPayModal(false);
        setSelectedCommission(null);
        setReferencePaiement('');
        fetchData();
      }
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const formatMontant = (montant: number) => montant?.toLocaleString('fr-FR') || '0';
  const formatDate = (date: string) => new Date(date).toLocaleDateString('fr-FR');

  const getSourceBadge = (source: string) => {
    switch (source) {
      case 'reservation': return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">Réservations</span>;
      case 'abonnement': return <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">Abonnements</span>;
      default: return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">Mixte</span>;
    }
  };

  const getStatutBadge = (statut: string) => {
    switch (statut) {
      case 'due': return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Due</span>;
      case 'payee': return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Payée</span>;
      case 'en_retard': return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">En retard</span>;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        <p className="ml-4 text-lg">Chargement des commissions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">💰 Gestion des Commissions</h1>
        <div className="flex gap-2">
          <button
            onClick={() => fetchData()}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Actualiser
          </button>
          <div className="relative group">
            <button
              disabled={calculating}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
            >
              <Calculator className="w-4 h-4" />
              {calculating ? 'Calcul...' : 'Calculer'}
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border hidden group-hover:block z-10">
              <button onClick={() => handleCalculer('hebdomadaire')} className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-t-lg">Hebdomadaire</button>
              <button onClick={() => handleCalculer('mensuel')} className="w-full text-left px-4 py-2 hover:bg-gray-100">Mensuel</button>
              <button onClick={() => handleCalculer('annuel')} className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-b-lg">Annuel</button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Due</p>
                <p className="text-2xl font-bold text-yellow-600">{formatMontant(stats.total_due)} FCFA</p>
                <p className="text-xs text-gray-400">{stats.nb_commissions_dues} commission(s)</p>
              </div>
              <Clock className="w-10 h-10 text-yellow-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Payée</p>
                <p className="text-2xl font-bold text-green-600">{formatMontant(stats.total_payee)} FCFA</p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">En Retard</p>
                <p className="text-2xl font-bold text-red-600">{formatMontant(stats.total_en_retard)} FCFA</p>
                <p className="text-xs text-gray-400">{stats.nb_commissions_en_retard} commission(s)</p>
              </div>
              <AlertTriangle className="w-10 h-10 text-red-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Gestionnaires</p>
                <p className="text-2xl font-bold text-blue-600">{recapGestionnaires.length}</p>
              </div>
              <Users className="w-10 h-10 text-blue-500" />
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('recap')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'recap' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            Récap par Gestionnaire
          </button>
          <button
            onClick={() => setActiveTab('commissions')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'commissions' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            <TrendingUp className="w-4 h-4 inline mr-2" />
            Toutes les Commissions
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'recap' && (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gestionnaire</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Terrains</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Taux</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payée</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">En Retard</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recapGestionnaires.map((item) => (
                <tr key={item.gestionnaire.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{item.gestionnaire.nom} {item.gestionnaire.prenom}</div>
                    <div className="text-sm text-gray-500">{item.gestionnaire.email}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{item.nb_terrains}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-blue-600">{item.gestionnaire.taux_commission}%</td>
                  <td className="px-6 py-4 text-sm font-semibold text-yellow-600">{formatMontant(item.total_due)} FCFA</td>
                  <td className="px-6 py-4 text-sm font-semibold text-green-600">{formatMontant(item.total_payee)} FCFA</td>
                  <td className="px-6 py-4 text-sm font-semibold text-red-600">{formatMontant(item.total_en_retard)} FCFA</td>
                </tr>
              ))}
              {recapGestionnaires.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">Aucun gestionnaire avec des commissions</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'commissions' && (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gestionnaire</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Période</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Réservations</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Abonnements</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Revenus</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commission</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {commissions.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 text-sm">
                    <div className="font-medium text-gray-900">{c.gestionnaire_info?.nom} {c.gestionnaire_info?.prenom}</div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600">
                    <div>{formatDate(c.date_debut_periode)}</div>
                    <div className="text-xs text-gray-400">→ {formatDate(c.date_fin_periode)}</div>
                  </td>
                  <td className="px-4 py-4">{getSourceBadge(c.source)}</td>
                  <td className="px-4 py-4 text-sm">
                    <div className="text-blue-600 font-medium">{formatMontant(c.montant_revenus_reservations)} FCFA</div>
                    <div className="text-xs text-gray-400">{c.nb_reservations} rés.</div>
                  </td>
                  <td className="px-4 py-4 text-sm">
                    <div className="text-purple-600 font-medium">{formatMontant(c.montant_revenus_abonnements)} FCFA</div>
                    <div className="text-xs text-gray-400">{c.nb_abonnements} abo.</div>
                  </td>
                  <td className="px-4 py-4 text-sm font-semibold text-gray-900">{formatMontant(c.montant_revenus)} FCFA</td>
                  <td className="px-4 py-4 text-sm font-bold text-orange-600">{formatMontant(c.montant_commission)} FCFA<br/><span className="text-xs text-gray-400">({c.taux_commission}%)</span></td>
                  <td className="px-4 py-4">{getStatutBadge(c.statut)}</td>
                  <td className="px-4 py-4">
                    {c.statut !== 'payee' && (
                      <button
                        onClick={() => { setSelectedCommission(c); setShowPayModal(true); }}
                        className="text-green-600 hover:text-green-800 text-sm font-medium"
                      >
                        Marquer payée
                      </button>
                    )}
                    {c.statut === 'payee' && c.reference_paiement && (
                      <span className="text-xs text-gray-500">Réf: {c.reference_paiement}</span>
                    )}
                  </td>
                </tr>
              ))}
              {commissions.length === 0 && (
                <tr><td colSpan={9} className="px-6 py-12 text-center text-gray-500">Aucune commission. Cliquez sur "Calculer" pour générer les commissions.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Paiement */}
      {showPayModal && selectedCommission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Marquer comme payée</h2>
              <button onClick={() => setShowPayModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Gestionnaire: <strong>{selectedCommission.gestionnaire_info?.nom} {selectedCommission.gestionnaire_info?.prenom}</strong></p>
                <p className="text-sm text-gray-600">Montant: <strong className="text-orange-600">{formatMontant(selectedCommission.montant_commission)} FCFA</strong></p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Référence de paiement (Wave/OM)</label>
                <input
                  type="text"
                  value={referencePaiement}
                  onChange={(e) => setReferencePaiement(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Ex: TXN123456789"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button onClick={() => setShowPayModal(false)} className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">Annuler</button>
                <button onClick={handleMarquerPayee} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">Confirmer le paiement</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommissionsPage; 
