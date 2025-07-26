import axios, { AxiosResponse } from 'axios';

// Configuration de base pour l'API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://ad07ffba09ee.ngrok-free.app/api';

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

// Intercepteur pour gérer les erreurs d'authentification
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expiré ou invalide, déconnecter l'utilisateur
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      window.location.href = '/connexion';
    }
    return Promise.reject(error);
  }
);

export interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  role: 'client' | 'gestionnaire' | 'admin';
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
  nom_complet: string;
  role_label: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
  user: User;
  token: string;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
  device_name: string;
}

export interface RegisterRequest {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  password: string;
  password_confirmation: string;
  role: 'client' | 'gestionnaire';
  accept_terms: boolean;
}

export class AuthService {
  private static instance: AuthService;
  private token: string | null = null;
  private user: User | null = null;

  private constructor() {
    // Charger les données depuis localStorage au démarrage
    this.loadFromStorage();
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  private loadFromStorage(): void {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
      const userData = localStorage.getItem('user_data');
      if (userData) {
        try {
          this.user = JSON.parse(userData);
        } catch (error) {
          console.error('Erreur lors du parsing des données utilisateur:', error);
          localStorage.removeItem('user_data');
        }
      }
    }
  }

  private saveToStorage(token: string, user: User): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user_data', JSON.stringify(user));
    }
  }

  private clearStorage(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
    }
  }

  public async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const loginData: LoginRequest = {
          email,
          password,
          device_name: 'web_browser'
      };

      const response: AxiosResponse<AuthResponse> = await apiClient.post('/auth/login', loginData);
      
      if (response.data.success) {
        this.token = response.data.data.token;
        this.user = response.data.data.user;
        this.saveToStorage(this.token, this.user);
      }

      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Erreur lors de la connexion';
      throw new Error(errorMessage);
    }
  }

  public async register(formData: RegisterRequest): Promise<AuthResponse> {
    try {
      const response: AxiosResponse<AuthResponse> = await apiClient.post('/auth/register', formData);
      
      if (response.data.success) {
        this.token = response.data.data.token;
        this.user = response.data.data.user;
        this.saveToStorage(this.token, this.user);
      }

      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Erreur lors de l\'inscription';
      const errors = error.response?.data?.errors || {};
      throw new Error(errorMessage + (Object.keys(errors).length > 0 ? ': ' + JSON.stringify(errors) : ''));
    }
  }

  public async logout(): Promise<void> {
    try {
      if (this.token) {
        await apiClient.post('/auth/logout');
      }
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      this.token = null;
      this.user = null;
      this.clearStorage();
    }
  }

  public async getCurrentUser(): Promise<User | null> {
    if (!this.token) return null;

    try {
      const response: AxiosResponse<{ success: boolean; data: User }> = await apiClient.get('/auth/me');
      
      if (response.data.success) {
        this.user = response.data.data;
        this.saveToStorage(this.token, this.user);
        return this.user;
      }
      
      return null;
    } catch (error) {
      console.error('Erreur lors de la récupération du profil:', error);
      return null;
    }
  }

  public async updateProfile(formData: Partial<User>): Promise<User> {
    try {
      const response: AxiosResponse<{ success: boolean; data: User; message: string }> = 
        await apiClient.put('/auth/update-profile', formData);
      
      if (response.data.success) {
        this.user = response.data.data;
        if (this.token) {
          this.saveToStorage(this.token, this.user);
        }
        return this.user;
      }
      
      throw new Error(response.data.message || 'Erreur lors de la mise à jour du profil');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Erreur lors de la mise à jour du profil';
      throw new Error(errorMessage);
      }
  }

  public async changePassword(currentPassword: string, newPassword: string, confirmPassword: string): Promise<void> {
    try {
      const response = await apiClient.post('/auth/change-password', {
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirmation: confirmPassword
      });
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Erreur lors du changement de mot de passe');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Erreur lors du changement de mot de passe';
      throw new Error(errorMessage);
    }
  }

  public async forgotPassword(email: string): Promise<void> {
    try {
      const response = await apiClient.post('/auth/forgot-password', { email });
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Erreur lors de l\'envoi de l\'email de réinitialisation');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Erreur lors de l\'envoi de l\'email de réinitialisation';
      throw new Error(errorMessage);
    }
  }

  public async resetPassword(token: string, email: string, password: string, confirmPassword: string): Promise<void> {
    try {
      const response = await apiClient.post('/auth/reset-password', {
        token,
        email,
        password,
        password_confirmation: confirmPassword
      });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Erreur lors de la réinitialisation du mot de passe');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Erreur lors de la réinitialisation du mot de passe';
      throw new Error(errorMessage);
    }
  }

  public isAuthenticated(): boolean {
    return !!this.token && !!this.user;
  }

  public hasRole(role: User['role']): boolean {
    return this.user?.role === role;
  }

  public hasAnyRole(roles: User['role'][]): boolean {
    return this.user ? roles.includes(this.user.role) : false;
  }

  public getToken(): string | null {
    return this.token;
  }

  public getUser(): User | null {
    return this.user;
  }

  // Méthode utilitaire pour vérifier si le token est valide
  public async validateToken(): Promise<boolean> {
    if (!this.token) return false;

    try {
      const user = await this.getCurrentUser();
      return !!user;
    } catch (error) {
      return false;
    }
  }
}

export const authService = AuthService.getInstance();
