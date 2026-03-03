/* eslint-disable @typescript-eslint/no-explicit-any */

export interface ApiResponse<T = unknown> {
  success?: boolean;
  message?: string;
  detail?: string;
  data?: T;
  results?: T;
}

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
  latitude?: string;
  longitude?: string;
  image_principale?: string;
}

export interface ReservationPayload {
  terrain: number;
  date_debut: string;
  date_fin: string;
  notes?: string;
}

const BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'https://kalelsamatch.duckdns.org').replace(/\/$/, '');
const API_ROOT = `${BASE_URL}/api`;

const ENDPOINTS = {
  auth: {
    login: `${API_ROOT}/accounts/login/`,
    register: `${API_ROOT}/accounts/register/`,
    profile: `${API_ROOT}/accounts/me/`,
  },
  terrains: `${API_ROOT}/terrains/terrains/`,
  reservations: `${API_ROOT}/terrains/reservations/`,
  paiements: `${API_ROOT}/terrains/paiements/`,
  tickets: `${API_ROOT}/terrains/tickets/`,
  notifications: `${API_ROOT}/terrains/notifications/`,
};

type QueryParams = Record<string, string | number | boolean | null | undefined>;

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

  private async request<T = ApiResponse<any>>(url: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(url, options);
    const contentType = response.headers.get('content-type');
    const payload = contentType?.includes('application/json') ? await response.json() : undefined;

    if (!response.ok) {
      const message = payload?.detail || payload?.message || response.statusText;
      throw new Error(message);
    }

    return (payload as T) ?? ({} as T);
  }

  // Generic helpers retained for legacy callers -----------------
  get<T = ApiResponse<any>>(path: string, params?: QueryParams) {
    return this.request<T>(`${API_ROOT}${path}${buildQueryString(params)}`, {
      method: 'GET',
      headers: this.headers(),
    });
  }

  post<T = ApiResponse<any>>(path: string, body?: unknown) {
    return this.request<T>(`${API_ROOT}${path}`, {
      method: 'POST',
      headers: this.headers(),
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  put<T = ApiResponse<any>>(path: string, body?: unknown) {
    return this.request<T>(`${API_ROOT}${path}`, {
      method: 'PUT',
      headers: this.headers(),
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  delete<T = ApiResponse<any>>(path: string) {
    return this.request<T>(`${API_ROOT}${path}`, {
      method: 'DELETE',
      headers: this.headers(),
    });
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
    return this.request(ENDPOINTS.auth.register, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify(data),
    });
  }

  getProfile() {
    return this.request(ENDPOINTS.auth.profile, {
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

    return this.request(ENDPOINTS.auth.profile, {
      method: 'PATCH',
      headers,
      body: isFormData ? data : JSON.stringify(data),
    });
  }

  // Terrains ----------------------------------------------
  listTerrains(params?: QueryParams) {
    return this.request<PaginatedResponse<TerrainDTO>>(
      `${ENDPOINTS.terrains}${buildQueryString(params)}`,
      { headers: this.headers() },
    );
  }

  getTerrain(id: number | string) {
    return this.request<TerrainDTO>(`${ENDPOINTS.terrains}${id}/`, {
      headers: this.headers(),
    });
  }

  // Reservations -----------------------------------------
  listReservations(params?: QueryParams) {
    return this.request(`${ENDPOINTS.reservations}${buildQueryString(params)}`, {
      headers: this.headers(),
    });
  }

  createReservation(payload: ReservationPayload) {
    return this.request(ENDPOINTS.reservations, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify(payload),
    });
  }

  // Paiements --------------------------------------------
  listPaiements(params?: QueryParams) {
    return this.request(`${ENDPOINTS.paiements}${buildQueryString(params)}`, {
      headers: this.headers(),
    });
  }

  createPaiement(payload: Record<string, unknown>) {
    return this.request(ENDPOINTS.paiements, {
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
    return this.request(`${ENDPOINTS.notifications}${buildQueryString(params)}`, {
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
