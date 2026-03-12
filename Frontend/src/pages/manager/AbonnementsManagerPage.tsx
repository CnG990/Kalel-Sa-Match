import React, { useState, useEffect, useMemo } from 'react';
import { Users, TrendingUp, Calendar, RefreshCw, CheckCircle, XCircle, ClipboardEdit } from 'lucide-react';
import toast from 'react-hot-toast';
import apiService from '../../services/api';

type ManagerDemande = {
  id: number;
  client: { nom: string; email: string };
  planNom: string;
  terrainNom: string;
  prix_calcule: number;
  mode_paiement?: string;
  statut: string;
  disponibilite_confirmee?: boolean;
  created_at?: string;
  jours_preferes?: number[];
  creneaux_preferes?: string[];
};

const STATUS_META: Record<string, { label: string; badge: string }> = {
  pending_manager: { label: 'En attente (manager)', badge: 'bg-blue-100 text-blue-800' },
  pending_payment: { label: 'En attente paiement', badge: 'bg-amber-100 text-amber-700' },
  active: { label: 'Active', badge: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Annulée', badge: 'bg-red-100 text-red-700' },
  refused: { label: 'Refusée', badge: 'bg-red-100 text-red-700' },
};

const AbonnementsManagerPage: React.FC = () => {
  const [demandes, setDemandes] = useState<ManagerDemande[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  const fetchDemandes = async () => {
    setLoading(true);
    try {
      const { data } = await apiService.getDemandesAbonnement();
      const payload = Array.isArray(data) ? data : [];
      const mapped: ManagerDemande[] = payload.map((d) => ({
        id: Number(d.id),
        client: {
          nom: d.user ? `${d.user.prenom ?? ''} ${d.user.nom ?? ''}`.trim() || 'Client inconnu' : 'Client inconnu',
          email: d.user?.email || '—',
        },
        planNom: d.plan?.nom ?? `Plan #${d.plan_id ?? ''}`,
        terrainNom: d.terrain?.nom ?? d.plan?.terrain?.nom ?? 'Terrain inconnu',
        prix_calcule: Number(d.prix_calcule ?? d.plan?.prix ?? 0),
        mode_paiement: d.mode_paiement,
        statut: d.statut ?? 'pending_manager',
        disponibilite_confirmee: d.disponibilite_confirmee,
        created_at: d.created_at,
        jours_preferes: d.jours_preferes,
        creneaux_preferes: d.creneaux_preferes,
      }));
      setDemandes(mapped);
    } catch (error) {
      console.error('Erreur chargement demandes abonnements:', error);
      toast.error('Impossible de charger les demandes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDemandes(); }, []);

  const handleDisponibilite = async (demandeId: number, confirm: boolean) => {
    setProcessingId(demandeId);
    try {
      const { meta } = await apiService.post(`/api/terrains/demandes-abonnement/${demandeId}/confirmer_disponibilite/`, {
        disponibilite_confirmee: confirm,
      });
      toast.success(meta?.message || 'Disponibilité mise à jour');
      await fetchDemandes();
    } catch (error) {
      console.error('Erreur confirmation disponibilité:', error);
      toast.error('Erreur lors de la mise à jour.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleStatut = async (demandeId: number, nouveauStatut: string) => {
    setProcessingId(demandeId);
    try {
      const { meta } = await apiService.post(`/api/terrains/demandes-abonnement/${demandeId}/changer-statut/`, {
        statut: nouveauStatut,
      });
      toast.success(meta?.message || 'Statut mis à jour');
      await fetchDemandes();
    } catch (error) {
      console.error('Erreur changement statut:', error);
      toast.error('Erreur lors de la mise à jour du statut.');
    } finally {
      setProcessingId(null);
    }
  };

  const stats = useMemo(() => {
    const total = demandes.length;
    const pending = demandes.filter((d) => d.statut === 'pending_manager').length;
    const payment = demandes.filter((d) => d.statut === 'pending_payment').length;
    const confirmed = demandes.filter((d) => d.statut === 'active').length;
    return { total, pending, payment, confirmed };
  }, [demandes]);

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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600"><Users className="w-6 h-6" /></div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total demandes</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600"><ClipboardEdit className="w-6 h-6" /></div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">En attente manager</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-amber-100 text-amber-600"><Calendar className="w-6 h-6" /></div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">En attente paiement</p>
              <p className="text-2xl font-bold text-gray-900">{stats.payment}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600"><TrendingUp className="w-6 h-6" /></div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Confirmées</p>
              <p className="text-2xl font-bold text-gray-900">{stats.confirmed}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Demandes d'abonnement</h2>
          <button onClick={fetchDemandes} className="flex items-center gap-2 px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50">
            <RefreshCw className="w-4 h-4" /> Actualiser
          </button>
        </div>

        {demandes.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Aucune demande pour vos terrains.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan & terrain</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Préférences</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {demandes.map((demande) => {
                  const statutMeta = STATUS_META[demande.statut] ?? { label: demande.statut, badge: 'bg-gray-100 text-gray-800' };
                  const formattedCreneaux = (demande.creneaux_preferes || []).join(', ');
                  const formattedJours = (demande.jours_preferes || []).map((j) => ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'][j] ?? j).join(', ');
                  return (
                    <tr key={demande.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-gray-900">{demande.client.nom}</div>
                        <div className="text-sm text-gray-500">{demande.client.email}</div>
                        <div className="text-xs text-gray-400">{demande.created_at ? new Date(demande.created_at).toLocaleString('fr-FR') : ''}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-gray-900">{demande.planNom}</div>
                        <div className="text-sm text-gray-500">{demande.terrainNom}</div>
                        <div className="text-sm text-green-600 font-medium">{demande.prix_calcule.toLocaleString('fr-FR')} FCFA</div>
                        <div className="text-xs text-gray-400">Paiement: {demande.mode_paiement ?? '—'}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div><span className="text-gray-500">Jours :</span> {formattedJours || '—'}</div>
                        <div><span className="text-gray-500">Créneaux :</span> {formattedCreneaux || '—'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statutMeta.badge}`}>
                          {statutMeta.label}
                        </span>
                        {demande.disponibilite_confirmee != null && (
                          <div className="text-xs mt-1 flex items-center gap-1 text-gray-500">
                            {demande.disponibilite_confirmee ? <CheckCircle className="w-3 h-3 text-green-500" /> : <XCircle className="w-3 h-3 text-red-500" />}
                            {demande.disponibilite_confirmee ? 'Disponibilité confirmée' : 'Disponibilité refusée'}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 space-y-2 text-sm">
                        {demande.statut === 'pending_manager' && (
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              disabled={processingId === demande.id}
                              onClick={() => handleDisponibilite(demande.id, true)}
                              className="px-3 py-1 rounded-lg bg-green-50 text-green-700 hover:bg-green-100"
                            >
                              Confirmer disponibilité
                            </button>
                            <button
                              type="button"
                              disabled={processingId === demande.id}
                              onClick={() => handleDisponibilite(demande.id, false)}
                              className="px-3 py-1 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
                            >
                              Refuser
                            </button>
                          </div>
                        )}
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            disabled={processingId === demande.id}
                            onClick={() => handleStatut(demande.id, 'active')}
                            className="px-3 py-1 rounded-lg border text-gray-700 hover:bg-gray-50"
                          >
                            Marquer active
                          </button>
                          <button
                            type="button"
                            disabled={processingId === demande.id}
                            onClick={() => handleStatut(demande.id, 'cancelled')}
                            className="px-3 py-1 rounded-lg border text-gray-700 hover:bg-gray-50"
                          >
                            Annuler
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AbonnementsManagerPage;
