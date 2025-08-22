import axios, { AxiosResponse } from 'axios';

// Configuration de base pour l'API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

// Configuration d'axios avec intercepteurs
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Intercepteur pour ajouter le token automatiquement
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface Terrain {
  id: number;
  nom: string;
  adresse: string;
  description: string | null;
  latitude: number;
  longitude: number;
  prix_heure: number;
  type_terrain: string;
  surface: number;
  eclairage: boolean;
  vestiaires: boolean;
  parking: boolean;
  douches: boolean;
  etat: string;
  telephone: string | null;
  gestionnaire_id: number | null;
  created_at: string;
  updated_at: string;
  distance?: number;
}

export interface TerrainResponse {
  success: boolean;
  message: string;
  data: {
    terrains: Terrain[];
    pagination?: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  };
}

export interface TerrainDetailResponse {
  success: boolean;
  message: string;
  data: Terrain;
}

export interface TerrainSearchParams {
  nom?: string;
  type_terrain?: string;
  prix_max?: number;
  eclairage?: boolean;
  vestiaires?: boolean;
  parking?: boolean;
  douches?: boolean;
  etat?: string;
  latitude?: number;
  longitude?: number;
  rayon?: number;
  sort_by?: 'nom' | 'prix_heure' | 'distance';
  sort_direction?: 'asc' | 'desc';
  per_page?: number;
}

export interface TerrainAvailabilityParams {
  date: string;
  heure_debut: string;
  heure_fin: string;
}

export interface DisponibiliteSlot {
  heure_debut: string;
  heure_fin: string;
  disponible: boolean;
  prix: number;
}

export interface DisponibiliteResponse {
  success: boolean;
  message: string;
  data: {
    terrain: Terrain;
    date: string;
    slots: DisponibiliteSlot[];
  };
}

export class TerrainService {
  private static instance: TerrainService;

  private constructor() {}

  public static getInstance(): TerrainService {
    if (!TerrainService.instance) {
      TerrainService.instance = new TerrainService();
    }
    return TerrainService.instance;
  }

  public async getAllTerrains(params?: TerrainSearchParams): Promise<Terrain[]> {
    try {
      const response: AxiosResponse<TerrainResponse> = await apiClient.get('/terrains', {
        params
      });
      
      if (response.data.success) {
        return response.data.data.terrains;
      }
      
      throw new Error(response.data.message || 'Erreur lors de la récupération des terrains');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Erreur lors de la récupération des terrains';
      throw new Error(errorMessage);
    }
  }

  public async getTerrainById(id: number): Promise<Terrain> {
    try {
      const response: AxiosResponse<TerrainDetailResponse> = await apiClient.get(`/terrains/${id}`);
      
      if (response.data.success) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Erreur lors de la récupération du terrain');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Erreur lors de la récupération du terrain';
      throw new Error(errorMessage);
    }
  }

  public async searchNearbyTerrains(latitude: number, longitude: number, rayon: number = 5): Promise<Terrain[]> {
    try {
      const response = await apiClient.get('/terrains/nearby', {
        params: {
          latitude,
          longitude,
          radius: rayon // Le backend attend 'radius' et non 'rayon'
        }
      });
      
      console.log('🔍 Réponse API nearby:', response.data);
      
      if (response.data.success) {
        // L'API retourne directement les terrains dans data, pas dans data.terrains
        const terrainsData = response.data.data;
        
        // Vérifier si terrainsData est un tableau
        if (Array.isArray(terrainsData)) {
          return terrainsData;
        } else if (terrainsData && terrainsData.terrains && Array.isArray(terrainsData.terrains)) {
          return terrainsData.terrains;
        } else {
          console.warn('⚠️ Format de données inattendu:', terrainsData);
          return [];
        }
      }
      
      throw new Error(response.data.message || 'Erreur lors de la recherche de terrains à proximité');
    } catch (error: any) {
      console.error('❌ Erreur API nearby:', error);
      const errorMessage = error.response?.data?.message || 'Erreur lors de la recherche de terrains à proximité';
      throw new Error(errorMessage);
    }
  }

  public async getTerrainAvailability(terrainId: number, date: string): Promise<DisponibiliteSlot[]> {
    try {
      const response: AxiosResponse<DisponibiliteResponse> = await apiClient.get(`/terrains/${terrainId}/disponibilite`, {
        params: { date }
      });
      
      if (response.data.success) {
        return response.data.data.slots;
      }
      
      throw new Error(response.data.message || 'Erreur lors de la vérification des disponibilités');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Erreur lors de la vérification des disponibilités';
      throw new Error(errorMessage);
    }
  }

  public async checkTerrainAvailability(terrainId: number, params: TerrainAvailabilityParams): Promise<boolean> {
    try {
      const response = await apiClient.post(`/terrains/${terrainId}/check-availability`, params);
      
      if (response.data.success) {
        return response.data.data.disponible;
      }
      
      return false;
    } catch (error: any) {
      console.error('Erreur lors de la vérification de disponibilité:', error);
      return false;
    }
  }

  // Méthodes pour les gestionnaires
  public async createTerrain(terrainData: Partial<Terrain>): Promise<Terrain> {
    try {
      const response: AxiosResponse<TerrainDetailResponse> = await apiClient.post('/terrains', terrainData);
      
      if (response.data.success) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Erreur lors de la création du terrain');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Erreur lors de la création du terrain';
      throw new Error(errorMessage);
    }
  }

  public async updateTerrain(id: number, terrainData: Partial<Terrain>): Promise<Terrain> {
    try {
      const response: AxiosResponse<TerrainDetailResponse> = await apiClient.put(`/terrains/${id}`, terrainData);
      
      if (response.data.success) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Erreur lors de la mise à jour du terrain');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Erreur lors de la mise à jour du terrain';
      throw new Error(errorMessage);
    }
  }

  public async deleteTerrain(id: number): Promise<void> {
    try {
      const response = await apiClient.delete(`/terrains/${id}`);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Erreur lors de la suppression du terrain');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Erreur lors de la suppression du terrain';
      throw new Error(errorMessage);
    }
  }

  public async getMyTerrains(): Promise<Terrain[]> {
    try {
      const response: AxiosResponse<TerrainResponse> = await apiClient.get('/terrains/my-terrains');
      
      if (response.data.success) {
        return response.data.data.terrains;
      }
      
      throw new Error(response.data.message || 'Erreur lors de la récupération de vos terrains');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Erreur lors de la récupération de vos terrains';
      throw new Error(errorMessage);
    }
  }

  // Méthodes utilitaires
  public formatPrice(price: number): string {
    return new Intl.NumberFormat('fr-SN', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(price);
  }

  public calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Rayon de la Terre en kilomètres
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance en kilomètres
    return Math.round(distance * 100) / 100; // Arrondi à 2 décimales
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }

  public getTerrainTypeLabel(type: string): string {
    const types: { [key: string]: string } = {
      'football': 'Football',
      'basketball': 'Basketball',
      'tennis': 'Tennis',
      'volleyball': 'Volleyball',
      'futsal': 'Futsal',
      'multisport': 'Multisport'
    };
    return types[type] || type;
  }

  public getEtatLabel(etat: string): string {
    const etats: { [key: string]: string } = {
      'Excellent état': 'Excellent',
      'Très bon état': 'Très bon',
      'Bon état': 'Bon',
      'État correct': 'Correct',
      'À rénover': 'À rénover'
    };
    return etats[etat] || etat;
  }
}

export const terrainService = TerrainService.getInstance(); 