// Corriger les imports manquants
// import { ApiResponse, PaginatedData, Terrain } from '../types';

// Définir les types localement
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

interface PaginatedData<T = any> {
  data: T[];
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
}

interface Terrain {
  id: number;
  nom: string;
  adresse: string;
  prix_heure: number;
  capacite_spectateurs: number;
  description?: string;
  images?: string[];
  latitude?: number;
  longitude?: number;
}

// Configuration de base
const BASE_URL = 'http://127.0.0.1:8000';
const API_BASE = `${BASE_URL}/api`;

class ApiService {
  // Configuration de base
  baseURL: string;
  apiURL: string;

  constructor() {
    this.baseURL = BASE_URL;
    this.apiURL = API_BASE;
  }

  // Headers par défaut
  getHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
    }
    
  // Gestionnaire d'erreurs amélioré
  async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const contentType = response.headers.get('content-type');
    
    if (!contentType?.includes('application/json')) {
      throw new Error(`Réponse non-JSON reçue (${response.status})`);
    }

    const data = await response.json();
    
    if (!response.ok) {
      // Ne pas afficher d'erreur pour les erreurs 401 (non authentifié) qui sont normales
      if (response.status === 401) {
        throw new Error('Unauthenticated');
      }
      throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    return data;
  }

  // Méthode pour récupérer les terrains (optimisée)
  async getTerrains(params: {
    per_page?: number;
    page?: number;
    search?: string;
    sort_by?: string;
    sort_direction?: 'asc' | 'desc';
  } = {}): Promise<ApiResponse<PaginatedData<Terrain>>> {
    try {
      const queryParams = new URLSearchParams();
      
      // Paramètres par défaut optimisés
      queryParams.set('per_page', (params.per_page || 50).toString());
      queryParams.set('page', (params.page || 1).toString());
      
      if (params.search) {
        queryParams.set('search', params.search);
      }
      
      if (params.sort_by) {
        queryParams.set('sort_by', params.sort_by);
        queryParams.set('sort_direction', params.sort_direction || 'asc');
      }

      console.log(`🔄 API Call: ${this.apiURL}/terrains?${queryParams.toString()}`);

      const response = await fetch(`${this.apiURL}/terrains?${queryParams.toString()}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      const result = await this.handleResponse<PaginatedData<Terrain>>(response);
      
      console.log(`✅ API Success: ${result.data?.data?.length || 0} terrains loaded`);
      
      return result;
    } catch (error: any) {
      console.error('❌ API Error getTerrains:', error);
      throw error;
    }
  }

  // Terrains pour affichage carte (retourne un tableau simple avec latitude/longitude)
  async getTerrainsForMap(): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.apiURL}/terrains/all-for-map`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      const result = await this.handleResponse(response);
      return result;
    } catch (error: any) {
      console.error('❌ API Error getTerrainsForMap:', error);
      throw error;
    }
  }

  // Authentification
  async login(email: string, password: string): Promise<ApiResponse> {
    const response = await fetch(`${this.apiURL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ 
        email, 
        password, 
        device_name: 'web_app' 
      }),
    });

    return this.handleResponse(response);
  }

  async register(userData: any): Promise<ApiResponse> {
    const response = await fetch(`${this.apiURL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    return this.handleResponse(response);
  }

  async getProfile(): Promise<ApiResponse> {
    const response = await fetch(`${this.apiURL}/user/profile`, {
      headers: this.getHeaders(),
    });

    return this.handleResponse(response);
  }

  async logout(): Promise<void> {
    await fetch(`${this.apiURL}/auth/logout`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
  }

  // Terrains
  async getTerrain(id: string): Promise<ApiResponse> {
    const response = await fetch(`${this.apiURL}/terrains/${id}`, {
      headers: this.getHeaders(),
    });

    return this.handleResponse(response);
  }

  async getNearbyTerrains(latitude: number, longitude: number, radius: number = 10): Promise<ApiResponse> {
    const response = await fetch(`${this.apiURL}/terrains/nearby?latitude=${latitude}&longitude=${longitude}&radius=${radius}`, {
      headers: this.getHeaders(),
    });

    return this.handleResponse(response);
  }

  async searchTerrainsByLocation(location: string): Promise<ApiResponse> {
    const response = await fetch(`${this.apiURL}/terrains/search/by-location?location=${encodeURIComponent(location)}`, {
      headers: this.getHeaders(),
    });

    return this.handleResponse(response);
  }

  async getPopularTerrains(): Promise<ApiResponse> {
    const response = await fetch(`${this.apiURL}/terrains/popular`, {
      headers: this.getHeaders(),
    });

    return this.handleResponse(response);
  }

  // Fonction pour obtenir la position géographique de l'utilisateur
  async getUserLocation(): Promise<{ latitude: number; longitude: number } | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Erreur de géolocalisation:', error);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        }
      );
    });
  }

  // Réservations
  async createReservation(reservationData: {
    terrain_id: number;
    date_debut: string;
    duree_heures: number;
    notes?: string;
  }): Promise<ApiResponse> {
    const response = await fetch(`${this.apiURL}/reservations`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(reservationData),
    });

    return this.handleResponse(response);
  }

  async getMyReservations(): Promise<ApiResponse> {
    const response = await fetch(`${this.apiURL}/reservations/my-reservations`, {
      headers: this.getHeaders(),
    });

    return this.handleResponse(response);
  }

  async checkAvailability(terrainId: number, date: string, duree: number): Promise<ApiResponse> {
    const response = await fetch(`${this.apiURL}/reservations/check-availability`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        terrain_id: terrainId,
        date_debut: date, // Correction: le backend attend date_debut, pas date
        duree_heures: duree
      }),
    });

    return this.handleResponse(response);
  }

  // Paiements
  async createPayment(paymentData: {
    reservation_id: number;
    methode: string;
    montant: number;
  }): Promise<ApiResponse> {
    const response = await fetch(`${this.apiURL}/paiements`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(paymentData),
    });

    return this.handleResponse(response);
  }

  // Support
  async createSupportTicket(ticketData: {
    sujet: string;
    description: string;
    priorite?: string;
  }): Promise<ApiResponse> {
    const response = await fetch(`${this.apiURL}/support/tickets`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(ticketData),
    });

    return this.handleResponse(response);
  }

  async updateProfile(formData: FormData): Promise<ApiResponse> {
    const token = localStorage.getItem('token');
    const headers: HeadersInit = {
        'Accept': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };
    
    const response = await fetch(`${this.apiURL}/user/profile`, {
        method: 'POST',
        headers: headers,
        body: formData,
    });

    return this.handleResponse(response);
  }

  // Abonnements
  async getAbonnements(): Promise<ApiResponse> {
    const response = await fetch(`${this.apiURL}/abonnements`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async souscrireAbonnement(abonnementId: number, preferences: any): Promise<ApiResponse> {
    const response = await fetch(`${this.apiURL}/abonnements/${abonnementId}/subscribe`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(preferences),
    });
    return this.handleResponse(response);
  }

  async requestRefund(reservationId: number, refundData?: {
    refund_type: string;
    reason: string;
    weather_evidence?: string;
  }) {
    const response = await fetch(`${this.apiURL}/reservations/${reservationId}/request-refund`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(refundData || {
        refund_type: 'refund_full',
        reason: 'Annulation client'
      }),
    });
    return this.handleResponse(response);
  }

  async getRefundOptions(reservationId: number) {
    const response = await fetch(`${this.apiURL}/reservations/${reservationId}/refund-options`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async rescheduleReservation(reservationId: number, rescheduleData: {
    nouvelle_date_debut: string;
    reason: string;
  }) {
    const response = await fetch(`${this.apiURL}/reservations/${reservationId}/reschedule`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(rescheduleData),
    });
    return this.handleResponse(response);
  }

  // --- Admin ---
  async getPendingManagers() {
    const response = await fetch(`${this.apiURL}/admin/pending-managers`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async approveManager(managerId: number, tauxCommission: number = 10, commentaires?: string) {
    const response = await fetch(`${this.apiURL}/admin/managers/${managerId}/approve`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify({ 
        taux_commission: tauxCommission,
        commentaires: commentaires 
      }),
    });
    return this.handleResponse(response);
  }

  async rejectManager(managerId: number, raison?: string) {
    const response = await fetch(`${this.apiURL}/admin/managers/${managerId}/reject`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify({ raison: raison || 'Rejeté par l\'administrateur' }),
    });
    return this.handleResponse(response);
  }

  // Méthodes génériques pour les pages admin
  async get(endpoint: string): Promise<ApiResponse> {
    const response = await fetch(`${this.apiURL}${endpoint}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async post(endpoint: string, data?: any): Promise<ApiResponse> {
    const response = await fetch(`${this.apiURL}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });
    return this.handleResponse(response);
  }

  async put(endpoint: string, data?: any): Promise<ApiResponse> {
    const response = await fetch(`${this.apiURL}${endpoint}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });
    return this.handleResponse(response);
  }

  async delete(endpoint: string): Promise<ApiResponse> {
    const response = await fetch(`${this.apiURL}${endpoint}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  // === MÉTHODES ADMIN MANQUANTES ===

  // Dashboard admin
  async getDashboardStats(): Promise<ApiResponse> {
    const response = await fetch(`${this.apiURL}/admin/dashboard-stats`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  // Gestion des utilisateurs
  async getAllUsers(params?: any): Promise<ApiResponse> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, value.toString());
        }
      });
    }
    const response = await fetch(`${this.apiURL}/admin/users?${searchParams}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async getUser(id: number): Promise<ApiResponse> {
    const response = await fetch(`${this.apiURL}/admin/users/${id}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async updateUser(id: number, userData: any): Promise<ApiResponse> {
    const response = await fetch(`${this.apiURL}/admin/users/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(userData),
    });
    return this.handleResponse(response);
  }

  async deleteUser(id: number): Promise<ApiResponse> {
    const response = await fetch(`${this.apiURL}/admin/users/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async createUser(userData: any): Promise<ApiResponse> {
    const response = await fetch(`${this.apiURL}/admin/users`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(userData),
    });
    return this.handleResponse(response);
  }

  async resetUserPassword(id: number, password: string): Promise<ApiResponse> {
    const response = await fetch(`${this.apiURL}/admin/users/${id}/reset-password`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ nouveau_mot_de_passe: password }),
    });
    return this.handleResponse(response);
  }

  async getUserReservations(id: number): Promise<ApiResponse> {
    const response = await fetch(`${this.apiURL}/admin/users/${id}/reservations`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async getUserPaiements(id: number): Promise<ApiResponse> {
    const response = await fetch(`${this.apiURL}/admin/users/${id}/paiements`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  // Gestion des litiges
  async getDisputes(params?: any): Promise<ApiResponse> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, value.toString());
        }
      });
    }
    const response = await fetch(`${this.apiURL}/admin/disputes?${searchParams}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  // Gestion des tickets de support
  async getSupportTickets(params?: any): Promise<ApiResponse> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, value.toString());
        }
      });
    }
    const response = await fetch(`${this.apiURL}/admin/support/tickets?${searchParams}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  // Gestion des terrains admin
  async getAllTerrains(params?: any): Promise<ApiResponse> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, value.toString());
        }
      });
    }
    const response = await fetch(`${this.apiURL}/admin/terrains?${searchParams}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async createTerrain(terrainData: any): Promise<ApiResponse> {
    const response = await fetch(`${this.apiURL}/admin/terrains`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(terrainData),
    });
    return this.handleResponse(response);
  }

  async updateTerrain(id: number, terrainData: any): Promise<ApiResponse> {
    const response = await fetch(`${this.apiURL}/admin/terrains/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(terrainData),
    });
    return this.handleResponse(response);
  }

  async deleteTerrain(id: number): Promise<ApiResponse> {
    const response = await fetch(`${this.apiURL}/admin/terrains/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  // Finances admin
  async getAdminFinances(params?: any): Promise<ApiResponse> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, value.toString());
        }
      });
    }
    const response = await fetch(`${this.apiURL}/admin/finances?${searchParams}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  // Import de données géospatiales (KoboCollect, KML, Shape, etc.)
  async importGeoData(formData: FormData): Promise<ApiResponse> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${this.apiURL}/admin/terrains/import-geo`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: formData,
    });
    return this.handleResponse(response);
  }

  async exportGeoData(format: 'kml' | 'geojson' | 'csv' | 'shp'): Promise<ApiResponse> {
    const response = await fetch(`${this.apiURL}/admin/terrains/export-geo?format=${format}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  // Import KML Google Earth batch
  async importKMLBatch(formData: FormData): Promise<ApiResponse> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${this.apiURL}/admin/terrains/import-kml-batch`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: formData,
    });
    return this.handleResponse(response);
  }

  // Statistiques PostGIS
  async getPostGISStats(): Promise<ApiResponse> {
    const response = await fetch(`${this.apiURL}/admin/terrains/postgis-stats`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  // Vérification de l'intégrité des données
  async validateDataIntegrity(): Promise<ApiResponse> {
    const response = await fetch(`${this.apiURL}/admin/data/validate`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  // === MÉTHODES ADMIN COMPLÉMENTAIRES ===

  // Réservations admin
  async getAllReservations(params?: any): Promise<ApiResponse> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, value.toString());
        }
      });
    }
    const response = await fetch(`${this.apiURL}/admin/reservations?${searchParams}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async deleteReservation(id: number): Promise<ApiResponse> {
    const response = await fetch(`${this.apiURL}/admin/reservations/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async updateReservationNotes(id: number, notes: string): Promise<ApiResponse> {
    const response = await fetch(`${this.apiURL}/admin/reservations/${id}/notes`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify({ notes }),
    });
    return this.handleResponse(response);
  }

  // Commissions
  async getContratsCommission(params?: any): Promise<ApiResponse> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, value.toString());
        }
      });
    }
    const response = await fetch(`${this.apiURL}/admin/contrats-commission?${searchParams}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async createContratCommission(data: any): Promise<ApiResponse> {
    const response = await fetch(`${this.apiURL}/admin/contrats-commission`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  async updateContratCommission(id: number, data: any): Promise<ApiResponse> {
    const response = await fetch(`${this.apiURL}/admin/contrats-commission/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  async deleteContratCommission(id: number): Promise<ApiResponse> {
    const response = await fetch(`${this.apiURL}/admin/contrats-commission/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  // === NOUVELLES MÉTHODES POUR FONCTIONNALITÉS AVANCÉES ===

  // Abonnements avancés
  async createSubscription(subscriptionData: any): Promise<ApiResponse> {
    const response = await fetch(`${this.apiURL}/admin/subscriptions`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(subscriptionData),
    });
    return this.handleResponse(response);
  }

  async updateSubscription(id: number, subscriptionData: any): Promise<ApiResponse> {
    const response = await fetch(`${this.apiURL}/admin/subscriptions/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(subscriptionData),
    });
    return this.handleResponse(response);
  }

  async deleteSubscription(id: number): Promise<ApiResponse> {
    const response = await fetch(`${this.apiURL}/admin/subscriptions/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  // Notifications avancées
  // User notification methods
  async getNotifications(): Promise<ApiResponse> {
    const response = await fetch(`${this.apiURL}/notifications`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async markNotificationAsRead(id: number): Promise<ApiResponse> {
    const response = await fetch(`${this.apiURL}/notifications/${id}/mark-read`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async markAllNotificationsAsRead(): Promise<ApiResponse> {
    const response = await fetch(`${this.apiURL}/notifications/mark-all-read`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  // Admin notification methods
  async createNotification(notificationData: any): Promise<ApiResponse> {
    const response = await fetch(`${this.apiURL}/admin/notifications`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(notificationData),
    });
    return this.handleResponse(response);
  }

  async updateNotification(id: number, notificationData: any): Promise<ApiResponse> {
    const response = await fetch(`${this.apiURL}/admin/notifications/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(notificationData),
    });
    return this.handleResponse(response);
  }

  async deleteNotification(id: number): Promise<ApiResponse> {
    const response = await fetch(`${this.apiURL}/admin/notifications/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async sendNotification(id: number): Promise<ApiResponse> {
    const response = await fetch(`${this.apiURL}/admin/notifications/${id}/send`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async scheduleRecurringNotification(scheduleData: any): Promise<ApiResponse> {
    const response = await fetch(`${this.apiURL}/admin/notifications/schedule-recurring`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(scheduleData),
    });
    return this.handleResponse(response);
  }

  // Templates de notifications
  async getNotificationTemplates(): Promise<ApiResponse> {
    const response = await fetch(`${this.apiURL}/admin/notification-templates`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async createNotificationTemplate(templateData: any): Promise<ApiResponse> {
    const response = await fetch(`${this.apiURL}/admin/notification-templates`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(templateData),
    });
    return this.handleResponse(response);
  }

  async updateNotificationTemplate(id: number, templateData: any): Promise<ApiResponse> {
    const response = await fetch(`${this.apiURL}/admin/notification-templates/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(templateData),
    });
    return this.handleResponse(response);
  }

  async deleteNotificationTemplate(id: number): Promise<ApiResponse> {
    const response = await fetch(`${this.apiURL}/admin/notification-templates/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  // Rapports avancés
  async generateCustomReport(reportData: any): Promise<ApiResponse> {
    const response = await fetch(`${this.apiURL}/admin/reports/custom`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(reportData),
    });
    return this.handleResponse(response);
  }

  async getSystemPerformance(): Promise<ApiResponse> {
    const response = await fetch(`${this.apiURL}/admin/system/performance`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  // Calculer automatiquement les surfaces des terrains avec PostGIS
  async calculateTerrainSurfaces(): Promise<ApiResponse> {
    const response = await fetch(`${this.apiURL}/admin/terrains/calculate-surfaces`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  // === NOUVELLES APIS ADMIN MANQUANTES ===

  // Logs système
  async getAllLogs(params?: any): Promise<ApiResponse> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, value.toString());
        }
      });
    }
    const response = await fetch(`${this.apiURL}/admin/logs?${searchParams}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async getLog(id: number): Promise<ApiResponse> {
    const response = await fetch(`${this.apiURL}/admin/logs/${id}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async exportLogs(params?: any): Promise<ApiResponse> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, value.toString());
        }
      });
    }
    const response = await fetch(`${this.apiURL}/admin/logs/export?${searchParams}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  // Rapports avancés
  async getRevenueReport(params?: any): Promise<ApiResponse> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, value.toString());
        }
      });
    }
    const response = await fetch(`${this.apiURL}/admin/reports/revenue?${searchParams}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async getUsersReport(params?: any): Promise<ApiResponse> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, value.toString());
        }
      });
    }
    const response = await fetch(`${this.apiURL}/admin/reports/users?${searchParams}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async getTerrainsReport(params?: any): Promise<ApiResponse> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, value.toString());
        }
      });
    }
    const response = await fetch(`${this.apiURL}/admin/reports/terrains?${searchParams}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async getReservationsReport(params?: any): Promise<ApiResponse> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, value.toString());
        }
      });
    }
    const response = await fetch(`${this.apiURL}/admin/reports/reservations?${searchParams}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async exportReport(params: any, type: string): Promise<ApiResponse> {
    const response = await fetch(`${this.apiURL}/admin/reports/export/${type}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(params),
    });
    return this.handleResponse(response);
  }

  // Configuration système
  async getSystemConfig(): Promise<ApiResponse> {
    const response = await fetch(`${this.apiURL}/admin/config`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async updateSystemConfig(config: any): Promise<ApiResponse> {
    const response = await fetch(`${this.apiURL}/admin/config`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(config),
    });
    return this.handleResponse(response);
  }

  // Nettoyage des logs
  async clearLogs(params: any): Promise<ApiResponse> {
    const response = await fetch(`${this.apiURL}/admin/logs/cleanup`, {
      method: 'DELETE',
      headers: this.getHeaders(),
      body: JSON.stringify(params),
    });
    return this.handleResponse(response);
  }

  // Validation automatique des contrats de commission
  async approveManagerWithContract(managerId: number, data: any): Promise<ApiResponse> {
    const response = await fetch(`${this.apiURL}/admin/managers/${managerId}/approve`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify({
        taux_commission: data?.taux_commission || 10,
        commentaires: data?.commentaires || 'Approuvé avec contrat personnalisé',
        ...data
      }),
    });
    return this.handleResponse(response);
  }

  // Rapports avancés avec paramètres
  async getReports(params?: any): Promise<ApiResponse> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    // CONNECT TO REAL DATABASE - NO MORE MOCK DATA
    const response = await fetch(`${this.apiURL}/admin/reports?${searchParams}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  // === MÉTHODES GESTIONNAIRE ===

  // Dashboard gestionnaire
  async getManagerStats(): Promise<ApiResponse> {
    const response = await fetch(`${this.apiURL}/manager/stats/dashboard`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  // Terrains du gestionnaire
  async getManagerTerrains(): Promise<ApiResponse> {
    const response = await fetch(`${this.apiURL}/manager/terrains`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  // Toggle disponibilité terrain (pour gestionnaire)
  async toggleTerrainDisponibilite(terrainId: number): Promise<ApiResponse> {
    const response = await fetch(`${this.apiURL}/manager/terrains/${terrainId}/toggle-disponibilite`, {
      method: 'PUT',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  // Réservations du gestionnaire
  async getManagerReservations(): Promise<ApiResponse> {
    const response = await fetch(`${this.apiURL}/manager/reservations`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  // Mettre à jour statut réservation (gestionnaire)
  async updateManagerReservationStatus(reservationId: number, status: string): Promise<ApiResponse> {
    const response = await fetch(`${this.apiURL}/manager/reservations/${reservationId}/status`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify({ statut: status }),
    });
    return this.handleResponse(response);
  }

  // Mettre à jour statut réservation (admin)
  async updateAdminReservationStatus(reservationId: number, status: string): Promise<ApiResponse> {
    const response = await fetch(`${this.apiURL}/admin/reservations/${reservationId}/status`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify({ status: status }),
    });
    return this.handleResponse(response);
  }

  // Revenus du gestionnaire
  async getManagerRevenue(period: string = '30'): Promise<ApiResponse> {
    const response = await fetch(`${this.apiURL}/manager/stats/revenue?period=${period}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  // Stats de revenus détaillées
  async getRevenueStats(): Promise<ApiResponse> {
    const response = await fetch(`${this.apiURL}/manager/stats/revenue`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  // === GESTION AVANCÉE DES TICKETS ===

  // Validation d'un code ticket
  async validateTicketCode(ticketCode: string): Promise<ApiResponse> {
    const response = await fetch(`${this.apiURL}/manager/validate-ticket`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ code_ticket: ticketCode }),
    });
    return this.handleResponse(response);
  }

  // Historique des validations
  async getValidationHistory(params?: any): Promise<ApiResponse> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, value.toString());
        }
      });
    }
    const response = await fetch(`${this.apiURL}/manager/validation-history?${searchParams}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  // Liste des codes de tickets
  async getTicketCodes(params?: any): Promise<ApiResponse> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, value.toString());
        }
      });
    }
    const response = await fetch(`${this.apiURL}/manager/ticket-codes?${searchParams}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  // Générer un ticket pour une réservation
  async generateTicketForReservation(reservationId: number): Promise<ApiResponse> {
    const response = await fetch(`${this.apiURL}/manager/reservations/${reservationId}/generate-ticket`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  // === GESTION AVANCÉE DES TERRAINS ===

  // Mettre à jour le prix d'un terrain
  async updateTerrainPrix(terrainId: number, nouveauPrix: number): Promise<ApiResponse> {
    const response = await fetch(`${this.apiURL}/terrains/${terrainId}/prix`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify({ prix_heure: nouveauPrix }),
    });
    return this.handleResponse(response);
  }

  // Upload d'image pour un terrain admin (TerrainSynthetiquesDakar)
  async uploadAdminTerrainImage(terrainId: number, imageFile: File): Promise<ApiResponse> {
    const formData = new FormData();
    formData.append('image_principale', imageFile);
    
    const token = localStorage.getItem('token');
    const response = await fetch(`${this.apiURL}/admin/terrains/${terrainId}/image`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: formData,
    });
    return this.handleResponse(response);
  }

  // Statistiques d'un terrain spécifique
  async getTerrainStatistiques(terrainId: number): Promise<ApiResponse> {
    const response = await fetch(`${this.apiURL}/terrains/${terrainId}/statistiques`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  // Réservations du jour
  async getTodayReservations(): Promise<ApiResponse> {
    const response = await fetch(`${this.apiURL}/manager/reservations/today`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  // User settings methods
  async getUserSettings() {
    try {
      const response = await fetch(`${this.apiURL}/user/settings`, {
        method: 'GET',
        headers: this.getHeaders(),
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Erreur getUserSettings:', error);
      return { 
        success: false, 
        message: 'Erreur lors de la récupération des paramètres',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async updateUserSettings(settings: any) {
    try {
      const response = await fetch(`${this.apiURL}/user/settings`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(settings),
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Erreur updateUserSettings:', error);
      return { 
        success: false, 
        message: 'Erreur lors de la mise à jour des paramètres',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async getUserSecurity() {
    try {
      const response = await fetch(`${this.apiURL}/user/security`, {
        method: 'GET',
        headers: this.getHeaders(),
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Erreur getUserSecurity:', error);
      return { 
        success: false, 
        message: 'Erreur lors de la récupération des paramètres de sécurité',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // === SYSTÈME D'ABONNEMENTS RÉCURRENTS ===

  // Créer un abonnement récurrent
  async createRecurringSubscription(subscriptionData: {
    terrain_id: number;
    type_recurrence: 'hebdomadaire' | 'mensuel';
    jours_semaine?: number[]; // [1,5] pour lundi et vendredi
    heure_debut: string;
    heure_fin: string;
    date_debut: string;
    date_fin: string;
    mode_paiement: 'acompte' | 'apres_match';
    pourcentage_acompte?: number; // 40 par défaut
  }): Promise<ApiResponse> {
    const response = await fetch(`${this.apiURL}/abonnements/recurring`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(subscriptionData),
    });
    return this.handleResponse(response);
  }

  // Obtenir les abonnements récurrents du client
  async getMyRecurringSubscriptions(): Promise<ApiResponse> {
    const response = await fetch(`${this.apiURL}/abonnements/my-recurring`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  // Obtenir les abonnements récurrents du gestionnaire
  async getManagerRecurringSubscriptions(): Promise<ApiResponse> {
    const response = await fetch(`${this.apiURL}/manager/abonnements/recurring`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  // Marquer une séance comme absente (génère une amende)
  async markSessionAbsent(sessionId: number, reason?: string): Promise<ApiResponse> {
    const response = await fetch(`${this.apiURL}/abonnements/sessions/${sessionId}/absent`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ reason }),
    });
    return this.handleResponse(response);
  }

  // Reporter une séance à une autre date
  async rescheduleSession(sessionId: number, rescheduleData: {
    nouvelle_date: string;
    nouvelle_heure_debut: string;
    nouvelle_heure_fin: string;
    reason: string;
  }): Promise<ApiResponse> {
    const response = await fetch(`${this.apiURL}/abonnements/sessions/${sessionId}/reschedule`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(rescheduleData),
    });
    return this.handleResponse(response);
  }

  // Obtenir les séances programmées d'un abonnement
  async getSubscriptionSessions(subscriptionId: number): Promise<ApiResponse> {
    const response = await fetch(`${this.apiURL}/abonnements/${subscriptionId}/sessions`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  // Payer une amende
  async payFine(fineId: number, paymentData: {
    methode: string;
    montant: number;
  }): Promise<ApiResponse> {
    const response = await fetch(`${this.apiURL}/amendes/${fineId}/pay`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(paymentData),
    });
    return this.handleResponse(response);
  }

  // Obtenir les amendes du client
  async getMyFines(): Promise<ApiResponse> {
    const response = await fetch(`${this.apiURL}/amendes/my-fines`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  // Obtenir les amendes du gestionnaire
  async getManagerFines(): Promise<ApiResponse> {
    const response = await fetch(`${this.apiURL}/manager/amendes`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  // Annuler un abonnement récurrent
  async cancelRecurringSubscription(subscriptionId: number, reason: string): Promise<ApiResponse> {
    const response = await fetch(`${this.apiURL}/abonnements/${subscriptionId}/cancel`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify({ reason }),
    });
    return this.handleResponse(response);
  }

  // Suspendre un abonnement temporairement
  async suspendRecurringSubscription(subscriptionId: number, suspendData: {
    date_debut_suspension: string;
    date_fin_suspension: string;
    reason: string;
  }): Promise<ApiResponse> {
    const response = await fetch(`${this.apiURL}/abonnements/${subscriptionId}/suspend`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(suspendData),
    });
    return this.handleResponse(response);
  }

  // Réactiver un abonnement suspendu
  async reactivateRecurringSubscription(subscriptionId: number): Promise<ApiResponse> {
    const response = await fetch(`${this.apiURL}/abonnements/${subscriptionId}/reactivate`, {
      method: 'PUT',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  // Payer l'acompte d'un abonnement
  async paySubscriptionDeposit(subscriptionId: number, paymentData: {
    methode: string;
    montant: number;
  }): Promise<ApiResponse> {
    const response = await fetch(`${this.apiURL}/abonnements/${subscriptionId}/pay-deposit`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(paymentData),
    });
    return this.handleResponse(response);
  }

  // Payer après un match
  async payAfterMatch(sessionId: number, paymentData: {
    methode: string;
    montant: number;
  }): Promise<ApiResponse> {
    const response = await fetch(`${this.apiURL}/abonnements/sessions/${sessionId}/pay`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(paymentData),
    });
    return this.handleResponse(response);
  }

  // Obtenir les créneaux disponibles pour report
  async getAvailableRescheduleSlots(terrainId: number, dateDebut: string, dateFin: string): Promise<ApiResponse> {
    const response = await fetch(`${this.apiURL}/terrains/${terrainId}/available-slots?date_debut=${dateDebut}&date_fin=${dateFin}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  // Auth - Mot de passe oublié
  async forgotPassword(email: string): Promise<ApiResponse> {
    const response = await fetch(`${this.apiURL}/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
    return this.handleResponse(response);
  }

  // Auth - Réinitialiser le mot de passe
  async resetPassword(email: string, token: string, password: string, password_confirmation: string): Promise<ApiResponse> {
    const response = await fetch(`${this.apiURL}/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        email, 
        token, 
        password, 
        password_confirmation 
      }),
    });
    return this.handleResponse(response);
  }

  // Créer un litige
  async creerLitige(data: {
    terrain_id: number;
    reservation_id?: number;
    type_litige: string;
    sujet: string;
    description: string;
    priorite: string;
    preuves?: string[];
  }): Promise<ApiResponse> {
    const response = await fetch(`${this.apiURL}/litiges`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  // Obtenir un ticket
  async getTicket(reservationId: number): Promise<ApiResponse> {
    const response = await fetch(`${this.apiURL}/tickets/${reservationId}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }
}

const apiService = new ApiService();
export default apiService; 