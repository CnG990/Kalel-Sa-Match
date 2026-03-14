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

export interface PlanAbonnementDTO {
  id: number;
  terrain?: TerrainDTO | null;
  terrain_id?: number;
  nom: string;
  description?: string;
  type_abonnement?: 'mensuel' | 'trimestriel' | 'annuel' | string | null;
  duree_jours?: number | null;
  prix: number;
  avantages?: string[];
  actif?: boolean;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}

export interface DemandeAbonnementDTO {
  id: number;
  user?: UserDTO;
  terrain?: TerrainDTO | null;
  terrain_id?: number;
  plan?: PlanAbonnementDTO | null;
  plan_id?: number;
  mode_paiement?: 'integral' | 'differe' | 'par_seance' | string;
  nb_seances?: number;
  duree_seance?: number;
  jours_preferes?: number[];
  creneaux_preferes?: string[];
  prix_calcule?: number;
  statut?: string;
  disponibilite_confirmee?: boolean;
  notes_manager?: string;
  created_at?: string;
  updated_at?: string;
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
  type_surface?: string;
  longueur?: number | null;
  largeur?: number | null;
  nombre_joueurs?: string;
  eclairage?: boolean;
  vestiaires?: boolean;
  parking?: boolean;
  douches?: boolean;
  buvette?: boolean;
  telephone?: string;
  ville?: string;
  quartier?: string;
  horaires_ouverture?: Record<string, unknown>;
  type_acompte?: string;
  pourcentage_acompte?: number;
  montant_acompte_fixe?: number | null;
  gestionnaire_id?: number | null;
}

export interface ReservationPayload {
  terrain_id: number;
  date_debut: string;
  duree_heures: number;
  telephone?: string;
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
  montant_acompte?: number;
  montant_restant?: number;
  acompte_paye?: boolean;
  solde_paye?: boolean;
  paiement_acompte_id?: number | null;
  paiement_solde_id?: number | null;
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

// Nouveau flux Paiement (backend: /api/payments/init/)
export interface InitPaymentRequestDTO {
  payment_id?: number;
  reservation_id?: number;
  abonnement_id?: number;
  montant?: number;
  methode: 'wave';
  customer_phone: string;
  customer_name: string;
}

export interface InitPaymentResponseDTO {
  payment_id: number;
  reference: string;
  checkout_url?: string;
  montant: number;
  methode: 'wave';
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

const resolveBaseUrl = () => {
  const rawEnvUrl = (import.meta.env.VITE_API_BASE_URL ?? '').trim();
  const sanitizedEnvUrl = rawEnvUrl.replace(/\/$/, '');
  const isLocalEnv = /localhost|127\.0\.0\.1/i.test(sanitizedEnvUrl);
  const isDev = import.meta.env.DEV;

  if (sanitizedEnvUrl) {
    if (!isLocalEnv || isDev) {
      return sanitizedEnvUrl;
    }
  }

  return 'https://kalelsamatch.duckdns.org';
};

const BASE_URL = resolveBaseUrl();
const API_ROOT = `${BASE_URL}/api`;

const ENDPOINTS = {
  auth: {
    login: `${API_ROOT}/accounts/login/`,
    googleLogin: `${API_ROOT}/accounts/google-login/`,
    register: `${API_ROOT}/accounts/register/`,
    profile: `${API_ROOT}/accounts/me/`,
    users: `${API_ROOT}/accounts/users/`,
    changePassword: `${API_ROOT}/accounts/change-password/`,
  },
  terrains: `${API_ROOT}/terrains/terrains/`,
  availability: `${API_ROOT}/terrains/check-availability/`,
  reservations: `${API_ROOT}/reservations/`,
  paiements: `${API_ROOT}/terrains/paiements/`,
  payments: `${API_ROOT}/payments/`,
  tickets: `${API_ROOT}/terrains/tickets/`,
  notifications: `${API_ROOT}/terrains/notifications/`,
  manager: {
    terrains: `${API_ROOT}/manager/terrains/`,
    statsDashboard: `${API_ROOT}/manager/stats/dashboard/`,
    revenue: `${API_ROOT}/manager/stats/revenue/`,
    validateTicket: `${API_ROOT}/manager/validation/validate_ticket/`,
    validationHistory: `${API_ROOT}/manager/validation/validation_history/`,
    pendingReservations: `${API_ROOT}/manager/validation/pending/`,
  },
  reservationActions: `${API_ROOT}/reservations/`,
  admin: {
    supportTickets: `${API_ROOT}/admin/support/tickets/`,
  },
  abonnements: `${API_ROOT}/terrains/abonnements/`,
  planAbonnements: `${API_ROOT}/terrains/plans/`,
  demandesAbonnement: `${API_ROOT}/terrains/demandes-abonnement/`,
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
    // Custom handler: lit le body brut pour inspecter les erreurs 4xx
    return fetch(ENDPOINTS.auth.login, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify({ email, password }),
    }).then(async (response) => {
      const rawText = await response.text();
      let payload: any;
      try {
        payload = rawText ? JSON.parse(rawText) : {};
      } catch (e) {
        console.error('login JSON parse error:', e, 'raw:', rawText);
        payload = {};
      }
      if (!response.ok) {
        const meta = {
          success: false,
          // simplejwt retourne { detail: '...' }, Django standard { message: '...' }
          message: payload?.detail || payload?.message || payload?.error || 'Email ou mot de passe incorrect'
        };
        return { ok: false, status: response.status, data: null, meta };
      }
      // Backend Django/simplejwt retourne { access, refresh, user }
      // normalizeResponse: pas de cle 'data' donc retourne raw comme .data
      const normalized = normalizeResponse<any>(payload);
      return { ok: true, status: response.status, data: normalized.data, meta: normalized.meta };
    }).catch((error) => {
      console.error('login fetch error:', error);
      return { ok: false, status: 0, data: null, meta: { success: false, message: 'Erreur réseau login' } };
    });
  }

  googleLogin(data: {
    uid: string;
    email: string;
    nom: string;
    prenom: string;
    photo_url?: string | null;
    firebase_token: string;
  }) {
    // Custom handler to avoid throwing on 4xx so the caller can inspect payload/meta
    return fetch(ENDPOINTS.auth.googleLogin, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify(data),
    }).then(async (response) => {
      const contentType = response.headers.get('content-type');
      const payload = contentType?.includes('application/json') ? await response.json() : undefined;
      if (!response.ok) {
        return { ok: false, status: response.status, data: null, meta: payload || {} };
      }
      return normalizeResponse(payload);
    }).catch((error) => {
      console.error('googleLogin fetch error:', error);
      return { ok: false, status: 0, data: null, meta: { success: false, message: 'Erreur réseau Google login' } };
    });
  }

  logout() {
    localStorage.removeItem('token');
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

  // Password Reset ------------------------------------------
  forgotPassword(email: string) {
    const url = `${API_ROOT}/accounts/forgot-password/`;
    return this.request(url, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify({ email }),
    }) as Promise<any>;
  }

  resetPassword(email: string, token: string, password: string, passwordConfirmation: string) {
    const url = `${API_ROOT}/accounts/reset-password/`;
    return this.requestNormalized(url, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify({ email, token, password, password_confirmation: passwordConfirmation }),
    });
  }

  // Terrains - Geo Search -----------------------------------
  getNearbyTerrains(lat: number, lng: number, radius?: number) {
    const params: QueryParams = { latitude: lat, longitude: lng };
    if (radius) params.radius = radius;
    const url = `${ENDPOINTS.terrains}${buildQueryString(params)}`;
    return this.requestNormalized<TerrainDTO[]>(url, {
      method: 'GET',
      headers: this.headers(),
    });
  }

  searchTerrainsByLocation(latOrSearch: number | string, lng?: number, radius?: number) {
    if (typeof latOrSearch === 'string') {
      return this.getTerrains({ search: latOrSearch });
    }
    return this.getNearbyTerrains(latOrSearch, lng!, radius);
  }

  getUserLocation(): Promise<{ lat: number; lng: number }> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Géolocalisation non supportée'));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) => resolve({ lat: position.coords.latitude, lng: position.coords.longitude }),
        (error) => reject(error),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  }

  get apiURL() {
    return API_ROOT;
  }

  // Terrains ----------------------------------------------
  listTerrains(params?: QueryParams) {
    const url = `${ENDPOINTS.terrains}${buildQueryString(params)}`;
    return this.requestNormalized<PaginatedResponse<TerrainDTO>>(url, {
      method: 'GET',
      headers: this.headers(),
    });
  }

  getAllTerrains(params?: QueryParams) {
    const url = `${ENDPOINTS.terrains}all/${buildQueryString(params)}`;
    return this.requestNormalized<TerrainDTO[]>(url, {
      method: 'GET',
      headers: this.headers(),
    });
  }

  getReservationDetail(reservationId: number) {
    const url = `${ENDPOINTS.reservations}${reservationId}/`;
    return this.requestNormalized<ReservationDTO>(url, {
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

  getPlanAbonnements(params?: QueryParams) {
    const url = `${ENDPOINTS.planAbonnements}${buildQueryString(params)}`;
    return this.requestNormalized<PlanAbonnementDTO[]>(url, {
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

  async checkAvailability(terrainId: number | string, date: string, duree_heures = 1): Promise<NormalizedResponse<string[]>> {
    const startOfDay = `${date}T00:00:00`;
    const endOfDay = `${date}T23:59:59`;
    const url = `${ENDPOINTS.reservations}${terrainId}/disponibilites/${buildQueryString({ date_debut: startOfDay, date_fin: endOfDay })}`;

    const response = await this.requestNormalized<{
      terrain?: string;
      creneaux_occupes?: { date_debut: string; date_fin: string; duree_heures?: number }[];
      prix_heure?: number;
    }>(url, {
      method: 'GET',
      headers: this.headers(),
    });

    const occupiedRanges = (response.data?.creneaux_occupes ?? []).map((slot) => ({
      start: new Date(slot.date_debut),
      end: new Date(slot.date_fin)
    }));

    const padHour = (hour: number) => String(hour).padStart(2, '0');

    const availableSlots = Array.from({ length: 24 }, (_, index) => padHour(index)).filter((hour) => {
      const slotStart = new Date(`${date}T${hour}:00:00`);
      const slotEnd = new Date(slotStart.getTime() + duree_heures * 60 * 60 * 1000);
      const overlaps = occupiedRanges.some(({ start, end }) => slotStart < end && slotEnd > start);
      return !overlaps;
    });

    return {
      data: availableSlots,
      meta: response.meta,
    };
  }

  getMyReservations(params?: QueryParams) {
    const url = `${ENDPOINTS.reservations}my/${buildQueryString(params)}`;
    return this.requestNormalized<ReservationDTO[]>(url, {
      method: 'GET',
      headers: this.headers(),
    });
  }

  getManagerReservations(params?: QueryParams) {
    const url = `${API_ROOT}/manager/validation/${buildQueryString(params)}`;
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

  async getManagerPromotions(_params?: QueryParams): Promise<NormalizedResponse<ManagerPromotionDTO[]>> {
    return { data: [], meta: { success: true, message: 'Promotions non disponibles' } };
  }

  getManagerRevenueStats(params?: QueryParams) {
    const url = `${ENDPOINTS.manager.revenue}${buildQueryString(params)}`;
    return this.requestNormalized<ManagerRevenueStatsDTO>(url, {
      method: 'GET',
      headers: this.headers(),
    });
  }

  updateManagerTerrainPricing(terrainId: number, payload: Partial<Pick<ManagerTerrainDTO, 'prix_heure' | 'capacite'>>) {
    const url = `${ENDPOINTS.manager.terrains}${terrainId}/prix_capacite/`;
    return this.requestNormalized<ManagerTerrainDTO>(url, {
      method: 'PUT',
      headers: this.headers(),
      body: JSON.stringify(payload),
    });
  }

  toggleManagerTerrainDisponibilite(terrainId: number) {
    const url = `${ENDPOINTS.manager.terrains}${terrainId}/toggle_disponibilite/`;
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
    const url = `${ENDPOINTS.abonnements}${abonnementId}/souscrire/`;
    return this.requestNormalized<SubscriptionResponseDTO>(url, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify(payload),
    });
  }

  getDemandesAbonnement(params?: QueryParams) {
    const url = `${ENDPOINTS.demandesAbonnement}${buildQueryString(params)}`;
    return this.requestNormalized<DemandeAbonnementDTO[]>(url, {
      method: 'GET',
      headers: this.headers(),
    });
  }

  createDemandeAbonnement(payload: Record<string, unknown>) {
    return this.requestNormalized<DemandeAbonnementDTO>(ENDPOINTS.demandesAbonnement, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify(payload),
    });
  }

  confirmerDisponibiliteDemande(demandeId: number, disponibilite: boolean) {
    const url = `${ENDPOINTS.demandesAbonnement}${demandeId}/confirmer_disponibilite/`;
    return this.requestNormalized<DemandeAbonnementDTO>(url, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify({ disponibilite_confirmee: disponibilite }),
    });
  }

  changerStatutDemande(demandeId: number, statut: string) {
    const url = `${ENDPOINTS.demandesAbonnement}${demandeId}/changer-statut/`;
    return this.requestNormalized<DemandeAbonnementDTO>(url, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify({ statut }),
    });
  }

  updateManagerReservationStatus(reservationId: number, statut: string, notes?: string) {
    const url = `${API_ROOT}/manager/validation/${reservationId}/`;
    const payload = { statut, ...(notes ? { notes } : {}) };
    return this.requestNormalized<ManagerReservationStatusDTO>(url, {
      method: 'PATCH',
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

  /**
   * Initie un paiement Wave/Orange Money via l'API officielle backend.
   * Backend: POST /api/payments/init/
   */
  initPayment(payload: InitPaymentRequestDTO) {
    const url = `${ENDPOINTS.payments}init/`;
    return this.requestNormalized<InitPaymentResponseDTO>(url, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify(payload),
    });
  }

  getPaymentStatus(paymentId: number) {
    const url = `${ENDPOINTS.payments}${paymentId}/status/`;
    return this.requestNormalized(url, {
      method: 'GET',
      headers: this.headers(),
    });
  }

  /**
   * Legacy wrappers (historique). Ne pas utiliser pour Wave/OM: PaiementViewSet terrains est deprecated.
   */
  createSubscriptionPayment(_payload: PaymentRequestDTO) {
    throw new Error('createSubscriptionPayment: deprecated - use initPayment(/api/payments/init/)');
  }

  createReservationPayment(_payload: PaymentRequestDTO) {
    throw new Error('createReservationPayment: deprecated - use initPayment(/api/payments/init/)');
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

  // Manager - Reservation Validation ----------------------
  getManagerPendingReservations() {
    const url = ENDPOINTS.manager.pendingReservations;
    return this.requestNormalized<ManagerReservationDTO[]>(url, {
      method: 'GET',
      headers: this.headers(),
    });
  }

  approveReservation(reservationId: number, notes?: string) {
    const url = `${API_ROOT}/manager/validation/${reservationId}/approve/`;
    return this.requestNormalized(url, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify({ notes: notes || '' }),
    });
  }

  rejectReservation(reservationId: number, motif?: string) {
    const url = `${API_ROOT}/manager/validation/${reservationId}/reject/`;
    return this.requestNormalized(url, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify({ motif: motif || '' }),
    });
  }

  // Manager - Ticket Validation & Exports -----------------
  validateReservation(reservationId: number, qrCode?: string) {
    const url = `${API_ROOT}/manager/validation/validate/`;
    return this.requestNormalized(url, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify({ reservation_id: reservationId, qr_code: qrCode }),
    });
  }

  getValidationHistory(params?: QueryParams) {
    const url = `${ENDPOINTS.manager.validationHistory}${buildQueryString(params)}`;
    return this.requestNormalized(url, {
      method: 'GET',
      headers: this.headers(),
    });
  }

  exportManagerData(type: 'reservations' | 'revenue' | 'clients', params?: QueryParams) {
    const url = `${API_ROOT}/manager/exports/${type}/${buildQueryString(params)}`;
    return this.requestNormalized(url, {
      method: 'GET',
      headers: this.headers(),
    });
  }

  // Admin - Payment Config -------------------------------
  getPaymentConfig() {
    const url = `${API_ROOT}/admin/payment-config/`;
    return this.requestNormalized(url, {
      method: 'GET',
      headers: this.headers(),
    });
  }

  updatePaymentConfig(id: number, data: Record<string, unknown>) {
    const url = `${API_ROOT}/admin/payment-config/${id}/`;
    return this.requestNormalized(url, {
      method: 'PATCH',
      headers: this.headers(),
      body: JSON.stringify(data),
    });
  }

  getPaymentStats(params?: QueryParams) {
    const url = `${API_ROOT}/admin/payment-stats/${buildQueryString(params)}`;
    return this.requestNormalized(url, {
      method: 'GET',
      headers: this.headers(),
    });
  }

  // Admin - Users & Terrains -----------------------------
  getAdminUsers(params?: QueryParams) {
    const url = `${API_ROOT}/admin/users/${buildQueryString(params)}`;
    return this.requestNormalized(url, {
      method: 'GET',
      headers: this.headers(),
    });
  }

  updateUserRole(userId: number, role: string) {
    const url = `${API_ROOT}/admin/users/${userId}/`;
    return this.requestNormalized(url, {
      method: 'PATCH',
      headers: this.headers(),
      body: JSON.stringify({ role }),
    });
  }

  updateTerrainManagers(terrainId: number, gestionnaireId: number | null) {
    const url = `${API_ROOT}/terrains/terrains/${terrainId}/`;
    return this.requestNormalized(url, {
      method: 'PATCH',
      headers: this.headers(),
      body: JSON.stringify({ gestionnaire_id: gestionnaireId }),
    });
  }

  updateAdminTerrain(terrainId: number, terrainData: Record<string, unknown>) {
    const url = `${API_ROOT}/admin/terrains/${terrainId}/`;
    return this.requestNormalized(url, {
      method: 'PATCH',
      headers: this.headers(),
      body: JSON.stringify(terrainData),
    });
  }

  // Admin - User Management -----------------------------------
  getUser(userId: number) {
    const url = `${API_ROOT}/admin/users/${userId}/`;
    return this.requestNormalized(url, {
      method: 'GET',
      headers: this.headers(),
    });
  }

  createUser(userData: Record<string, unknown>) {
    const url = `${API_ROOT}/admin/users/`;
    return this.requestNormalized(url, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify(userData),
    });
  }

  updateUser(userId: number, userData: Record<string, unknown>) {
    const url = `${API_ROOT}/admin/users/${userId}/`;
    return this.requestNormalized(url, {
      method: 'PATCH',
      headers: this.headers(),
      body: JSON.stringify(userData),
    });
  }

  deleteUser(userId: number) {
    const url = `${API_ROOT}/admin/users/${userId}/`;
    return this.requestNormalized(url, {
      method: 'DELETE',
      headers: this.headers(),
    });
  }

  resetUserPassword(userId: number, newPassword?: string) {
    const url = `${API_ROOT}/admin/users/${userId}/`;
    return this.requestNormalized(url, {
      method: 'PATCH',
      headers: this.headers(),
      body: JSON.stringify({ password: newPassword || 'TempPass123!' }),
    });
  }

  approveManager(managerId: number, tauxCommission?: number, commentaires?: string) {
    const url = `${API_ROOT}/admin/users/${managerId}/validate_user/`;
    return this.requestNormalized(url, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify({
        action: 'approuver',
        taux_commission: tauxCommission,
        commentaires,
      }),
    });
  }

  approveManagerWithContract(managerId: number, contractData?: Record<string, unknown>) {
    const url = `${API_ROOT}/admin/users/${managerId}/validate_user/`;
    return this.requestNormalized(url, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify({
        action: 'approuver',
        ...contractData,
      }),
    });
  }

  rejectManager(managerId: number, raison?: string) {
    const url = `${API_ROOT}/admin/users/${managerId}/validate_user/`;
    return this.requestNormalized(url, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify({ action: 'rejeter', raison }),
    });
  }

  getPendingManagers() {
    const url = `${API_ROOT}/admin/users/pending_validations/`;
    return this.requestNormalized(url, {
      method: 'GET',
      headers: this.headers(),
    });
  }

  updateManagerCommission(managerId: number, tauxCommission: number, commentaire?: string) {
    const url = `${API_ROOT}/admin/users/${managerId}/`;
    return this.requestNormalized(url, {
      method: 'PATCH',
      headers: this.headers(),
      body: JSON.stringify({
        taux_commission_defaut: tauxCommission,
        commentaire_commission: commentaire,
      }),
    });
  }

  getUserReservations(userId: number) {
    const url = `${API_ROOT}/admin/payments/?user_id=${userId}`;
    return this.requestNormalized(url, {
      method: 'GET',
      headers: this.headers(),
    });
  }

  getUserPaiements(userId: number) {
    const url = `${API_ROOT}/admin/payments/?user_id=${userId}`;
    return this.requestNormalized(url, {
      method: 'GET',
      headers: this.headers(),
    });
  }

  // Admin - Dashboard & Stats --------------------------------
  getDashboardStats() {
    const url = `${API_ROOT}/admin/stats/dashboard/`;
    return this.requestNormalized(url, {
      method: 'GET',
      headers: this.headers(),
    });
  }

  getAdminFinances(params?: QueryParams) {
    const url = `${API_ROOT}/admin/payments/${buildQueryString(params)}`;
    return this.requestNormalized(url, {
      method: 'GET',
      headers: this.headers(),
    });
  }

  // Admin - Reservations --------------------------------------
  getAdminReservations(params?: QueryParams) {
    const url = `${API_ROOT}/admin/reservations/${buildQueryString(params)}`;
    return this.requestNormalized(url, {
      method: 'GET',
      headers: this.headers(),
    });
  }

  deleteAdminReservation(reservationId: number) {
    const url = `${API_ROOT}/admin/reservations/${reservationId}/`;
    return this.requestNormalized(url, {
      method: 'DELETE',
      headers: this.headers(),
    });
  }

  updateAdminReservationNotes(reservationId: number, notes: string) {
    const url = `${API_ROOT}/admin/reservations/${reservationId}/notes/`;
    return this.requestNormalized(url, {
      method: 'PATCH',
      headers: this.headers(),
      body: JSON.stringify({ notes }),
    });
  }

  updateAdminReservationStatus(reservationId: number, status: string, motif?: string) {
    const url = `${API_ROOT}/admin/reservations/${reservationId}/status/`;
    return this.requestNormalized(url, {
      method: 'PATCH',
      headers: this.headers(),
      body: JSON.stringify({ status, ...(motif ? { motif_annulation: motif } : {}) }),
    });
  }

  // Admin - Reports -------------------------------------------
  getReports(params?: QueryParams) {
    const url = `${API_ROOT}/admin/stats/dashboard/${buildQueryString(params)}`;
    return this.requestNormalized(url, {
      method: 'GET',
      headers: this.headers(),
    });
  }

  exportReport(type: string, params?: QueryParams) {
    const url = `${API_ROOT}/admin/stats/dashboard/${buildQueryString({ ...params, export_type: type })}`;
    return this.requestNormalized(url, {
      method: 'GET',
      headers: this.headers(),
    });
  }

  // Admin - Commissions (contrats) ----------------------------
  getContratsCommission(params?: QueryParams) {
    const url = `${API_ROOT}/admin/users/${buildQueryString({ ...params, role: 'gestionnaire' })}`;
    return this.requestNormalized(url, {
      method: 'GET',
      headers: this.headers(),
    });
  }

  createContratCommission(contratData: Record<string, unknown>) {
    const managerId = contratData.gestionnaire_id;
    const url = `${API_ROOT}/admin/users/${managerId}/`;
    return this.requestNormalized(url, {
      method: 'PATCH',
      headers: this.headers(),
      body: JSON.stringify({
        taux_commission_defaut: contratData.taux_commission,
      }),
    });
  }

  updateContratCommission(contratId: number, contratData: Record<string, unknown>) {
    const url = `${API_ROOT}/admin/users/${contratId}/`;
    return this.requestNormalized(url, {
      method: 'PATCH',
      headers: this.headers(),
      body: JSON.stringify({
        taux_commission_defaut: contratData.taux_commission,
      }),
    });
  }

  deleteContratCommission(contratId: number) {
    const url = `${API_ROOT}/admin/users/${contratId}/`;
    return this.requestNormalized(url, {
      method: 'PATCH',
      headers: this.headers(),
      body: JSON.stringify({ taux_commission_defaut: null }),
    });
  }

  // Admin - Notifications (send) ------------------------------
  createNotification(notifData: Record<string, unknown>) {
    const url = `${API_ROOT}/admin/notifications/`;
    return this.requestNormalized(url, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify(notifData),
    });
  }

  // Admin - Subscriptions -------------------------------------
  createSubscription(subData: Record<string, unknown>) {
    const url = `${API_ROOT}/admin/subscriptions/`;
    return this.requestNormalized(url, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify(subData),
    });
  }

  // Admin - System Config & Performance -----------------------
  getSystemConfig() {
    const url = `${API_ROOT}/admin/stats/dashboard/`;
    return this.requestNormalized(url, {
      method: 'GET',
      headers: this.headers(),
    });
  }

  updateSystemConfig(configData: Record<string, unknown>) {
    const url = `${API_ROOT}/admin/payment-config/`;
    return this.requestNormalized(url, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify(configData),
    });
  }

  getSystemPerformance() {
    const url = `${API_ROOT}/admin/stats/dashboard/`;
    return this.requestNormalized(url, {
      method: 'GET',
      headers: this.headers(),
    });
  }

  // Admin - Geo Import ----------------------------------------
  importGeoData(geoData: Record<string, unknown>) {
    const url = `${API_ROOT}/admin/terrains/`;
    return this.requestNormalized(url, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify(geoData),
    });
  }

  exportGeoData(params?: QueryParams) {
    const url = `${API_ROOT}/admin/terrains/${buildQueryString(params)}`;
    return this.requestNormalized(url, {
      method: 'GET',
      headers: this.headers(),
    });
  }

  validateDataIntegrity() {
    const url = `${API_ROOT}/admin/stats/dashboard/`;
    return this.requestNormalized(url, {
      method: 'GET',
      headers: this.headers(),
    });
  }

  // Admin - Create Terrain ------------------------------------
  createAdminTerrain(terrainData: Record<string, unknown>) {
    const url = `${API_ROOT}/admin/terrains/`;
    return this.requestNormalized(url, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify(terrainData),
    });
  }

  // Litiges - Create ----------------------------------------
  creerLitige(litigeData: Record<string, unknown>) {
    const url = `${API_ROOT}/litiges/litiges/`;
    return this.requestNormalized(url, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify(litigeData),
    });
  }

  // Tickets - Get single reservation ticket ------------------------------------
  getTicket(reservationId: number) {
    const url = `${API_ROOT}/reservations/${reservationId}/ticket/`;
    return this.requestNormalized(url, {
      method: 'GET',
      headers: this.headers(),
    });
  }

  // Terrains - Update ---------------------------------------
  updateTerrain(terrainId: number, terrainData: Record<string, unknown>) {
    const url = `${API_ROOT}/manager/terrains/${terrainId}/`;
    return this.requestNormalized(url, {
      method: 'PATCH',
      headers: this.headers(),
      body: JSON.stringify(terrainData),
    });
  }


  // Subscriptions - Recurring -------------------------------
  createRecurringSubscription(subData: Record<string, unknown>) {
    const url = `${ENDPOINTS.abonnements}souscrire/`;
    return this.requestNormalized(url, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify(subData),
    });
  }

  // Geo - PostGIS Stats -------------------------------------
  getPostGISStats() {
    const url = `${API_ROOT}/admin/stats/dashboard/`;
    return this.requestNormalized(url, {
      method: 'GET',
      headers: this.headers(),
    });
  }

  // Geo - KML Batch Import ----------------------------------
  importKMLBatch(kmlData: Record<string, unknown>) {
    const url = `${API_ROOT}/admin/terrains/`;
    return this.requestNormalized(url, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify(kmlData),
    });
  }

  // Subscriptions - Session Management ----------------------
  markSessionAbsent(sessionId: number, reason?: string) {
    const url = `${ENDPOINTS.abonnements}sessions/${sessionId}/absent/`;
    return this.requestNormalized(url, {
      method: 'POST',
      headers: this.headers(),
      body: reason ? JSON.stringify({ raison: reason }) : undefined,
    });
  }

  rescheduleSession(sessionId: number, payload: string | Record<string, unknown>) {
    const url = `${ENDPOINTS.abonnements}sessions/${sessionId}/reschedule/`;
    const body = typeof payload === 'string' ? { nouvelle_date: payload } : payload;
    return this.requestNormalized(url, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify(body),
    });
  }

  // Upload Images --------------------------------------------
  async uploadProfileImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('image', file);
    
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_ROOT}/accounts/profile/upload-image/`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Erreur upload image');
    }

    const data = await response.json();
    return data.image_url || data.url;
  }

  async uploadTerrainImages(terrainId: number, files: File[]): Promise<string[]> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append(`images`, file);
    });
    
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_ROOT}/manager/terrains/${terrainId}/upload-images/`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Erreur upload images');
    }

    const data = await response.json();
    return data.image_urls || data.urls || [];
  }

  async updateProfileImage(imageUrl: string) {
    return this.requestNormalized(`${API_ROOT}/accounts/me/`, {
      method: 'PATCH',
      headers: this.headers(),
      body: JSON.stringify({ photo_profil: imageUrl }),
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
