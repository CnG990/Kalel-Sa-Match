/* eslint-disable @typescript-eslint/no-explicit-any */

export interface SupportTicketUserDTO {
  id: number;
  nom?: string;
  prenom?: string;
  email?: string;
}

export interface SupportTicketDTO {
  id: number;
  sujet: string;
  description?: string;
  priorite: 'basse' | 'moyenne' | 'haute' | string;
  statut: 'ouvert' | 'en_cours' | 'resolu' | 'ferme' | string;
  created_at: string;
  updated_at?: string;
  user?: SupportTicketUserDTO;
}

export interface SupportTicketListDTO {
  data: SupportTicketDTO[];
  last_page?: number;
  current_page?: number;
  per_page?: number;
  total?: number;
}

export interface AbonnementDTO {
  id: number;
  nom: string;
  description?: string;
  prix: number;
  duree_jours?: number;
  avantages?: string[];
  [key: string]: unknown;
}

export interface SubscriptionResponseDTO {
  id: number;
  abonnement_id?: number;
  terrain_nom?: string;
  prix_total?: number;
  type_abonnement?: string;
  date_debut?: string;
  date_fin?: string;
  statut?: string;
  preferences?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface UserDTO {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string | null;
  role: 'admin' | 'client' | 'gestionnaire';
  statut_validation: string;
  created_at: string;
  updated_at: string;
  [key: string]: unknown;
}

export interface NormalizedMeta {
  count?: number;
  next?: string | null;
  previous?: string | null;
  message?: string;
  detail?: string;
  success?: boolean;
  [key: string]: unknown;
}

export interface NormalizedResponse<T> {
  data: T | null;
  meta: NormalizedMeta;
}

type RawApiPayload<T> = Partial<{
  data: T;
  results: T;
  count: number;
  next: string | null;
  previous: string | null;
  message: string;
  detail: string;
  success: boolean;
}> & Record<string, unknown>;

const buildMeta = (meta: RawApiPayload<unknown> = {}): NormalizedMeta => {
  const { count, next, previous, data, results, ...rest } = meta;
  return {
    count,
    next: next ?? null,
    previous: previous ?? null,
    ...rest,
  };
};

const normalizeResponse = <T>(payload: unknown): NormalizedResponse<T> => {
  if (payload && typeof payload === 'object') {
    const raw = payload as RawApiPayload<T>;

    if ('data' in raw) {
      const { data, ...rest } = raw;
      return {
        data: (data ?? null) as T | null,
        meta: buildMeta(rest),
      };
    }

    if ('results' in raw) {
      const { results, ...rest } = raw;
      return {
        data: (results ?? null) as T | null,
        meta: buildMeta(rest),
      };
    }

    return {
      data: (raw as T) ?? null,
      meta: buildMeta(raw),
    };
  }

  return { data: (payload ?? null) as T | null, meta: {} };
};

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface TerrainDTO {
  id: number;
  nom: string;
  adresse: string;
  description?: string;
  latitude?: number | string | null;
  longitude?: number | string | null;
  image_principale?: string;
  images?: string[];
  equipements?: string[];
  prix_heure?: number | null;
  capacite?: number | null;
  est_disponible?: boolean;
  est_actif?: boolean;
}

export interface ReservationPayload {
  terrain: number;
  date_debut: string;
  date_fin: string;
  notes?: string;
}

export interface ReservationDTO {
  id: number;
  terrain: TerrainDTO | null;
  terrain_id: number;
  user?: UserDTO | null;
  date_debut: string;
  date_fin: string;
  montant_total: number;
  statut: string;
  notes?: string;
  [key: string]: unknown;
}

export interface ManagerReservationClientDTO {
  nom?: string;
  prenom?: string;
  telephone?: string;
}

export interface ManagerReservationTerrainDTO {
  nom?: string;
  adresse?: string;
}

export interface ManagerReservationDTO {
  id: number;
  date_debut: string;
  date_fin: string;
  statut: string;
  prix_total?: number;
  montant_total?: number;
  client: ManagerReservationClientDTO;
  terrain: ManagerReservationTerrainDTO;
  code_ticket?: string;
}

export interface ManagerReservationStatusDTO {
  id: number;
  statut: string;
  old_statut?: string;
}

export interface ManagerTerrainDTO {
  id: number;
  nom: string;
  description?: string;
  adresse: string;
  prix_heure: number;
  capacite?: number;
  surface?: number;
  note_moyenne?: number;
  nombre_avis?: number;
  images?: string[];
  image_principale?: string;
  images_supplementaires?: string[];
  contact_telephone?: string;
  est_actif?: boolean;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}

export interface ManagerTerrainToggleDTO {
  id: number;
  est_actif: boolean;
  statut?: string;
}

export interface ManagerPromotionDTO {
  id: number;
  nom: string;
  description?: string;
  type_reduction?: string;
  valeur_reduction?: number;
  date_debut?: string;
  date_fin?: string;
  code_promo?: string;
  limite_utilisations?: number;
  utilisations_actuelles?: number;
  est_active?: boolean;
  cible_abonnes?: boolean;
  created_at?: string;
}

export interface ManagerRevenueByTerrainDTO {
  terrain_nom: string;
  revenus: number;
  reservations_count: number;
}

export interface ManagerRevenueByMonthDTO {
  mois: string;
  revenus: number;
  commissions: number;
}

export interface ManagerRevenueStatsDTO {
  revenus_total: number;
  revenus_mois_actuel: number;
  revenus_mois_precedent: number;
  commissions_payees: number;
  commissions_en_attente: number;
  revenus_par_terrain: ManagerRevenueByTerrainDTO[];
  revenus_par_mois: ManagerRevenueByMonthDTO[];
}

export interface ManagerDashboardStatsDTO {
  total_terrains?: number;
  terrains_actifs?: number;
  reservations_mois?: number;
  revenus_mois?: number;
  taux_occupation?: number;
  note_moyenne?: number;
  prochaines_reservations?: ManagerUpcomingReservationDTO[];
  [key: string]: unknown;
}

export interface ManagerUpcomingReservationDTO {
  terrain_nom?: string;
  date_debut?: string;
  client_nom?: string;
}

export interface TerrainStatisticsDTO {
  terrain?: {
    id: number;
    nom: string;
    prix_heure?: number;
    capacite?: number;
  };
  statistiques?: {
    reservations_mois?: number;
    revenus_mois?: number;
    taux_occupation?: number;
    note_moyenne?: number;
    nombre_avis?: number;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface RefundRequestPayload {
  refund_type: 'refund_full' | 'refund_partial' | 'refund_minimal' | 'weather_refund';
  reason: string;
  weather_evidence?: string;
}

export interface RefundResponseDTO {
  reservation?: ReservationDTO;
  montant_rembourse?: number;
  frais_annulation?: number;
  statut_remboursement?: string;
}

export interface TicketValidationReservationDTO {
  id: number;
  terrain_nom: string;
  client_nom: string;
  client_email?: string;
  client_telephone?: string;
  date_debut: string;
  date_fin: string;
  statut: string;
  code_ticket: string;
  montant_total?: number;
  derniere_validation?: string;
}

export interface TicketValidationHistoryDTO {
  valid?: boolean;
  reservation?: TicketValidationReservationDTO;
  message?: string;
  date_validation?: string;
}

export interface PaymentRequestDTO {
  subscription_id?: number;
  reservation_id?: number;
  montant: number;
  methode_paiement: 'orange_money' | 'wave' | 'mobile_money';
  reference_transaction?: string;
}

export interface PaymentResponseDTO {
  id?: number;
  statut?: string;
  reference_transaction?: string;
  montant?: number;
  methode_paiement?: string;
  message?: string;
  [key: string]: unknown;
}

export interface NotificationDTO {
  id: number;
  type: string;
  data: Record<string, unknown>;
  read_at: string | null;
  priority?: 'low' | 'normal' | 'high' | 'urgent' | string;
  created_at: string;
}

const BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'https://kalelsamatch.duckdns.org').replace(/\/$/, '');
const API_ROOT = `${BASE_URL}/api`;

const ENDPOINTS = {
  auth: {
    login: `${API_ROOT}/accounts/login/`,
    register: `${API_ROOT}/accounts/register/`,
    profile: `${API_ROOT}/accounts/me/`,
    users: `${API_ROOT}/accounts/users/`,
    changePassword: `${API_ROOT}/accounts/change-password/`,
  },
  terrains: `${API_ROOT}/terrains/terrains/`,
  availability: `${API_ROOT}/terrains/check-availability/`,
  reservations: `${API_ROOT}/terrains/reservations/`,
  paiements: `${API_ROOT}/terrains/paiements/`,
  tickets: `${API_ROOT}/terrains/tickets/`,
  notifications: `${API_ROOT}/terrains/notifications/`,
  manager: {
    reservations: `${API_ROOT}/manager/reservations/`,
    terrains: `${API_ROOT}/manager/terrains/`,
    statsDashboard: `${API_ROOT}/manager/stats/dashboard/`,
    promotions: `${API_ROOT}/manager/promotions/`,
    revenue: `${API_ROOT}/manager/stats/revenue/`,
    validateTicket: `${API_ROOT}/manager/validate-ticket/`,
    validationHistory: `${API_ROOT}/manager/validation-history/`,
  },
  reservationActions: `${API_ROOT}/reservations/`,
  admin: {
    supportTickets: `${API_ROOT}/terrains/tickets/`,
  },
  abonnements: `${API_ROOT}/abonnements/`,
};

type QueryParams = Record<string, string | number | boolean | null | undefined>;

type RequestOptions = RequestInit & { normalized?: boolean };

const buildQueryString = (params?: QueryParams): string => {
  if (!params) return '';
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    search.append(key, String(value));
  });
  const query = search.toString();
  return query ? `?${query}` : '';
};

class ApiService {
  private headers(extra?: HeadersInit): HeadersInit {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...extra,
    };
  }

  private async request(url: string, options: RequestOptions = {}): Promise<unknown> {
    const response = await fetch(url, options);
    const contentType = response.headers.get('content-type');
    const payload = contentType?.includes('application/json') ? await response.json() : undefined;

    if (!response.ok) {
      const message = payload?.detail || payload?.message || response.statusText;
      throw new Error(message);
    }

    return payload;
  }

  private async requestNormalized<T = unknown>(url: string, options: RequestOptions = {}): Promise<NormalizedResponse<T>> {
    const raw = await this.request(url, options);
    return normalizeResponse<T>(raw);
  }

  get<T = unknown>(path: string, params?: QueryParams) {
    const url = `${API_ROOT}${path}${buildQueryString(params)}`;
    return this.requestNormalized<T>(url, {
      method: 'GET',
      headers: this.headers(),
    });
  }

  post<T = unknown>(path: string, body?: unknown) {
    return this.requestNormalized<T>(`${API_ROOT}${path}`, {
      method: 'POST',
      headers: this.headers(),
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  put<T = unknown>(path: string, body?: unknown) {
    return this.requestNormalized<T>(`${API_ROOT}${path}`, {
      method: 'PUT',
      headers: this.headers(),
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  delete<T = unknown>(path: string) {
    return this.requestNormalized<T>(`${API_ROOT}${path}`, {
      method: 'DELETE',
      headers: this.headers(),
    });
  }

  async downloadFile(path: string, params?: QueryParams): Promise<Blob> {
    const url = `${API_ROOT}${path}${buildQueryString(params)}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: this.headers(),
    });

    if (!response.ok) {
      const message = response.statusText || 'Erreur lors du téléchargement du fichier';
      throw new Error(message);
    }

    return response.blob();
  }

  // Auth --------------------------------------------------
  login(email: string, password: string) {
    return this.request(ENDPOINTS.auth.login, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify({ email, password }),
    });
  }

  register(data: Record<string, unknown>) {
    return this.requestNormalized<UserDTO>(ENDPOINTS.auth.register, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify(data),
    });
  }

  getProfile() {
    return this.requestNormalized<UserDTO>(ENDPOINTS.auth.profile, {
      method: 'GET',
      headers: this.headers(),
    });
  }

  updateProfile(data: Record<string, unknown> | FormData) {
    const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
    const headers = { ...this.headers() } as Record<string, string>;
    if (isFormData) {
      delete headers['Content-Type'];
    }

    return this.requestNormalized<UserDTO>(ENDPOINTS.auth.profile, {
      method: 'PATCH',
      headers,
      body: isFormData ? data : JSON.stringify(data),
    });
  }

  changePassword(payload: { current_password: string; new_password: string; new_password_confirmation: string }) {
    return this.requestNormalized<Record<string, unknown>>(ENDPOINTS.auth.changePassword, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify(payload),
    });
  }

  // Terrains ----------------------------------------------
  listTerrains(params?: QueryParams) {
    const url = `${ENDPOINTS.terrains}${buildQueryString(params)}`;
    return this.requestNormalized<PaginatedResponse<TerrainDTO>>(url, {
      method: 'GET',
      headers: this.headers(),
    });
  }

  getAllTerrains() {
    return this.requestNormalized<TerrainDTO[]>(ENDPOINTS.terrains, {
      method: 'GET',
      headers: this.headers(),
    });
  }

  getTerrains(params?: QueryParams) {
    const url = `${ENDPOINTS.terrains}${buildQueryString(params)}`;
    return this.requestNormalized<TerrainDTO[]>(url, {
      method: 'GET',
      headers: this.headers(),
    });
  }

  getTerrain(id: number | string) {
    return this.requestNormalized<TerrainDTO>(`${ENDPOINTS.terrains}${id}/`, {
      method: 'GET',
      headers: this.headers(),
    });
  }

  getAllUsers(params?: QueryParams) {
    const url = `${ENDPOINTS.auth.users}${buildQueryString(params)}`;
    return this.requestNormalized<UserDTO[]>(url, {
      method: 'GET',
      headers: this.headers(),
    });
  }

  getAbonnements(params?: QueryParams) {
    const url = `${ENDPOINTS.abonnements}${buildQueryString(params)}`;
    return this.requestNormalized<AbonnementDTO[]>(url, {
      method: 'GET',
      headers: this.headers(),
    });
  }

  // Reservations -----------------------------------------
  listReservations(params?: QueryParams) {
    return this.request(`${ENDPOINTS.reservations}${buildQueryString(params)}`, {
      headers: this.headers(),
    });
  }

  checkAvailability(terrainId: number | string, date: string, duree_heures = 1) {
    const url = `${ENDPOINTS.availability}${buildQueryString({ terrain_id: terrainId, date, duree_heures })}`;
    return this.requestNormalized<string[]>(url, {
      method: 'GET',
      headers: this.headers(),
    });
  }

  getMyReservations(params?: QueryParams) {
    const url = `${ENDPOINTS.reservations}my-reservations/${buildQueryString(params)}`;
    return this.requestNormalized<ReservationDTO[]>(url, {
      method: 'GET',
      headers: this.headers(),
    });
  }

  getManagerReservations(params?: QueryParams) {
    const url = `${ENDPOINTS.manager.reservations}${buildQueryString(params)}`;
    return this.requestNormalized<ManagerReservationDTO[]>(url, {
      method: 'GET',
      headers: this.headers(),
    });
  }

  getManagerTerrains(params?: QueryParams) {
    const url = `${ENDPOINTS.manager.terrains}${buildQueryString(params)}`;
    return this.requestNormalized<ManagerTerrainDTO[]>(url, {
      method: 'GET',
      headers: this.headers(),
    });
  }

  getManagerPromotions(params?: QueryParams) {
    const url = `${ENDPOINTS.manager.promotions}${buildQueryString(params)}`;
    return this.requestNormalized<ManagerPromotionDTO[]>(url, {
      method: 'GET',
      headers: this.headers(),
    });
  }

  getManagerRevenueStats(params?: QueryParams) {
    const url = `${ENDPOINTS.manager.revenue}${buildQueryString(params)}`;
    return this.requestNormalized<ManagerRevenueStatsDTO>(url, {
      method: 'GET',
      headers: this.headers(),
    });
  }

  updateManagerTerrainPricing(terrainId: number, payload: Partial<Pick<ManagerTerrainDTO, 'prix_heure' | 'capacite'>>) {
    const url = `${ENDPOINTS.manager.terrains}${terrainId}/prix-capacite/`;
    return this.requestNormalized<ManagerTerrainDTO>(url, {
      method: 'PUT',
      headers: this.headers(),
      body: JSON.stringify(payload),
    });
  }

  toggleManagerTerrainDisponibilite(terrainId: number) {
    const url = `${ENDPOINTS.manager.terrains}${terrainId}/toggle-disponibilite/`;
    return this.requestNormalized<ManagerTerrainToggleDTO>(url, {
      method: 'PUT',
      headers: this.headers(),
    });
  }

  getTerrainStatistics(terrainId: number) {
    const url = `${ENDPOINTS.manager.terrains}${terrainId}/statistiques/`;
    return this.requestNormalized<TerrainStatisticsDTO>(url, {
      method: 'GET',
      headers: this.headers(),
    });
  }

  createReservation(payload: ReservationPayload) {
    return this.requestNormalized<ReservationDTO>(ENDPOINTS.reservations, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify(payload),
    });
  }

  souscrireAbonnement(abonnementId: number, payload: Record<string, unknown>) {
    const url = `${ENDPOINTS.abonnements}${abonnementId}/`; // assumes REST detail endpoint
    return this.requestNormalized<SubscriptionResponseDTO>(url, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify(payload),
    });
  }

  updateManagerReservationStatus(reservationId: number, statut: string, notes?: string) {
    const url = `${ENDPOINTS.manager.reservations}${reservationId}/status/`;
    const payload = { statut, ...(notes ? { notes } : {}) };
    return this.requestNormalized<ManagerReservationStatusDTO>(url, {
      method: 'PUT',
      headers: this.headers(),
      body: JSON.stringify(payload),
    });
  }

  requestRefund(reservationId: number, payload?: RefundRequestPayload) {
    const url = `${ENDPOINTS.reservationActions}${reservationId}/request-refund/`;
    return this.requestNormalized<RefundResponseDTO>(url, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify(
        payload ?? {
          refund_type: 'refund_full',
          reason: 'Annulation client',
        },
      ),
    });
  }

  validateTicketCode(ticketCode: string) {
    return this.requestNormalized<{ reservation?: TicketValidationReservationDTO; message?: string }>(ENDPOINTS.manager.validateTicket, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify({ ticket_code: ticketCode }),
    });
  }

  getValidationHistory(params?: QueryParams) {
    const url = `${ENDPOINTS.manager.validationHistory}${buildQueryString(params)}`;
    return this.requestNormalized<TicketValidationHistoryDTO[]>(url, {
      method: 'GET',
      headers: this.headers(),
    });
  }

  getSupportTickets(params?: QueryParams) {
    const url = `${ENDPOINTS.admin.supportTickets}${buildQueryString(params)}`;
    return this.requestNormalized<SupportTicketListDTO>(url, {
      method: 'GET',
      headers: this.headers(),
    });
  }

  getManagerStats() {
    return this.requestNormalized<ManagerDashboardStatsDTO>(ENDPOINTS.manager.statsDashboard, {
      method: 'GET',
      headers: this.headers(),
    });
  }

  // Paiements --------------------------------------------
  listPaiements(params?: QueryParams) {
    const url = `${ENDPOINTS.paiements}${buildQueryString(params)}`;
    return this.requestNormalized(url, {
      method: 'GET',
      headers: this.headers(),
    });
  }

  createSubscriptionPayment(payload: PaymentRequestDTO) {
    const url = `${ENDPOINTS.paiements}subscription/`;
    return this.requestNormalized<PaymentResponseDTO>(url, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify(payload),
    });
  }

  createReservationPayment(payload: PaymentRequestDTO) {
    const url = `${ENDPOINTS.paiements}reservation/`;
    return this.requestNormalized<PaymentResponseDTO>(url, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify(payload),
    });
  }

  // Tickets & notifications -------------------------------
  listTickets(params?: QueryParams) {
    return this.request(`${ENDPOINTS.tickets}${buildQueryString(params)}`, {
      headers: this.headers(),
    });
  }

  createTicket(payload: Record<string, unknown>) {
    return this.request(ENDPOINTS.tickets, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify(payload),
    });
  }

  listNotifications(params?: QueryParams) {
    const url = `${ENDPOINTS.notifications}${buildQueryString(params)}`;
    return this.requestNormalized<NotificationDTO[]>(url, {
      method: 'GET',
      headers: this.headers(),
    });
  }

  markNotificationAsRead(id: number) {
    const url = `${ENDPOINTS.notifications}${id}/mark-read/`;
    return this.requestNormalized<Record<string, unknown>>(url, {
      method: 'POST',
      headers: this.headers(),
    });
  }

  markAllNotificationsAsRead() {
    const url = `${ENDPOINTS.notifications}mark-all-read/`;
    return this.requestNormalized<Record<string, unknown>>(url, {
      method: 'POST',
      headers: this.headers(),
    });
  }

  deleteNotification(id: number) {
    const url = `${ENDPOINTS.notifications}${id}/`;
    return this.request(url, {
      method: 'DELETE',
      headers: this.headers(),
    });
  }
}

const apiServiceBase = new ApiService();

const apiService = new Proxy(apiServiceBase, {
  get(target, prop, receiver) {
    if (typeof prop === 'string') {
      const value = Reflect.get(target, prop, receiver);
      if (value !== undefined) {
        return typeof value === 'function' ? value.bind(target) : value;
      }

      return (...args: unknown[]) => {
        console.warn(
          `[apiService] Méthode "%s" non implémentée pour l'API Django. Arguments:`,
          prop,
          args,
        );
        return Promise.reject(
          new Error(`La méthode ${prop} n'est pas encore disponible sur l'API Django.`),
        );
      };
    }

    return Reflect.get(target, prop, receiver);
  },
}) as ApiService & Record<string, any>;

export default apiService;
