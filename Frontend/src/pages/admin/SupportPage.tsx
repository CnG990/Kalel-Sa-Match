import React, { useEffect, useState } from 'react';
import apiService, { type SupportTicketDTO } from '../../services/api';
import toast from 'react-hot-toast';

const MOCK_TICKETS: SupportTicketDTO[] = [
  {
    id: 1001,
    user: { nom: 'Admin', prenom: 'Kalel', email: 'admin@kalel.com' },
    sujet: 'Impossible de confirmer une réservation',
    description: 'Le bouton confirme reste grisé sur Safari.',
    priorite: 'haute',
    statut: 'ouvert',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  } as SupportTicketDTO,
  {
    id: 1002,
    user: { nom: 'Gestionnaire', prenom: 'Fatou', email: 'fatou@example.com' },
    sujet: 'Facture Wave non reçue',
    description: 'Le paiement est validé mais aucune facture.',
    priorite: 'moyenne',
    statut: 'en_cours',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  } as SupportTicketDTO,
];

const SupportPage: React.FC = () => {
  // const [activeTab, setActiveTab] = useState<'tickets' | 'disputes'>('tickets');
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState<SupportTicketDTO[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [isFallback, setIsFallback] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, [search, statusFilter, currentPage]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const params: Record<string, string | number> = {
        page: currentPage,
        per_page: 15,
      };

      if (search) params.search = search;
      if (statusFilter) params.statut = statusFilter;

      const { data } = await apiService.getSupportTickets(params);
      const rawList = Array.isArray(data?.data)
        ? data.data
        : Array.isArray((data as any)?.results)
          ? (data as any).results
          : Array.isArray(data)
            ? data
            : [];
      setTickets(rawList);
      setTotalPages(data?.last_page ?? 1);
      setError(null);
      setIsFallback(false);
    } catch (err) {
      console.warn('Erreur support tickets:', err);
      setError('Le service des tickets admin est indisponible. Affichage des derniers tickets internes.');
      setTickets(MOCK_TICKETS);
      setTotalPages(1);
      setIsFallback(true);
      toast.error("API support indisponible : données locales affichées");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchTickets();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ouvert':
        return 'bg-blue-100 text-blue-800';
      case 'en_cours':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolu':
        return 'bg-green-100 text-green-800';
      case 'ferme':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'haute':
        return 'bg-red-100 text-red-800';
      case 'moyenne':
        return 'bg-orange-100 text-orange-800';
      case 'basse':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && tickets.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Chargement des tickets...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {isFallback && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Les tickets affichés proviennent d'un échantillon local car l'API /admin/support n'est pas encore disponible sur cet environnement.
        </div>
      )}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Support</h1>
        <div className="text-sm text-gray-500">
          {tickets.length} ticket(s) trouvé(s)
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Rechercher par sujet, utilisateur..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Tous les statuts</option>
              <option value="ouvert">Ouvert</option>
              <option value="en_cours">En cours</option>
              <option value="resolu">Résolu</option>
              <option value="ferme">Fermé</option>
            </select>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Rechercher
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-800">{error}</div>
        </div>
      )}

      {/* Liste des tickets */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ticket</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilisateur</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sujet</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priorité</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-black">
                    #{ticket.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                    {ticket.user?.nom} {ticket.user?.prenom}
                  </td>
                  <td className="px-6 py-4 text-sm text-black max-w-xs truncate">
                    {ticket.sujet}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(ticket.priorite)}`}>
                      {ticket.priorite}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(ticket.statut)}`}>
                      {ticket.statut}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(ticket.created_at).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium hover:bg-blue-200">
                        Voir
                      </button>
                      <button className="px-3 py-1 bg-green-100 text-green-700 rounded text-xs font-medium hover:bg-green-200">
                        Répondre
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Page {currentPage} sur {totalPages}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Précédent
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Suivant
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupportPage; 