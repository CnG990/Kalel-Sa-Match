import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import apiService from '../services/api';

export interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  role: 'client' | 'gestionnaire' | 'admin';
  statut_validation?: 'en_attente' | 'approuve' | 'rejete' | 'suspendu';
  nom_entreprise?: string;
  numero_ninea?: string;
  numero_registre_commerce?: string;
  adresse_entreprise?: string;
  adresse?: string;
  entreprise?: string;
  description?: string;
  documents_legaux?: string[];
  taux_commission_defaut?: number;
  date_validation?: string;
  valide_par?: number;
  notes_admin?: string;
  email_verified_at?: string;
  created_at?: string;
  updated_at?: string;
}

interface RegisterData {
  nom: string;
  prenom: string;
  email: string;
  password: string;
  telephone?: string;
  role: 'client' | 'gestionnaire';
  nom_entreprise?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<{ success: boolean; message?: string; }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('token');
      if (savedToken) {
        try {
          const response = await apiService.getProfile();
          if (response.success && response.data) {
            setUser(response.data);
            setToken(savedToken);
          } else {
            localStorage.removeItem('token');
          }
        } catch (error: any) {
          // Ne pas afficher d'erreur pour les erreurs d'authentification normales
          if (error.message !== 'Unauthenticated') {
            console.error('Auth initialization error:', error);
          }
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await apiService.login(email, password);
      if (response.success && response.data) {
        const { token: userToken, user: userData } = response.data;
        localStorage.setItem('token', userToken);
        setUser(userData);
        setToken(userToken);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (userData: RegisterData): Promise<{ success: boolean; message?: string; }> => {
    try {
      const response = await apiService.register(userData);
      return {
        success: response.success,
        message: response.message
      };
    } catch (error) {
      console.error('Register error:', error);
      return {
        success: false,
        message: 'Erreur lors de l\'inscription'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
    apiService.logout();
  };

  const refreshUser = async () => {
    if (!token) return;
    
    try {
      const response = await apiService.getProfile();
      if (response.success && response.data) {
        setUser(response.data);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading: loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 