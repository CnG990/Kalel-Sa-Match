import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import apiService, { type UserDTO } from '../services/api';
import { firebaseAuthService } from '../services/firebase';

export type User = UserDTO;

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
  loginWithGoogle: () => Promise<boolean>;
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
  const [isGoogleUser, setIsGoogleUser] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('token');
      if (savedToken) {
        try {
          const { data } = await apiService.getProfile();
          if (data) {
            setUser(data);
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
      const jwtResponse = response as any;
      if (jwtResponse.access && jwtResponse.refresh && jwtResponse.user) {
        const { access: userToken, user: userData } = jwtResponse;
        localStorage.setItem('token', userToken);
        setUser(userData as UserDTO);
        setToken(userToken);
        return true;
      }
      console.error('Login failed - Invalid response structure:', response);
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (userData: RegisterData): Promise<{ success: boolean; message?: string; }> => {
    try {
      const { meta } = await apiService.register({ ...userData } as Record<string, unknown>);
      return {
        success: true,
        message: (meta?.message as string | undefined) ?? 'Inscription réussie'
      };
    } catch (error) {
      console.error('Register error:', error);
      return {
        success: false,
        message: 'Erreur lors de l\'inscription'
      };
    }
  };

  // Connexion avec Google
  const loginWithGoogle = async (): Promise<boolean> => {
    try {
      // 1. Authentification Firebase
      const firebaseUser = await firebaseAuthService.signInWithGoogle();
      
      // 2. Créer ou connecter l'utilisateur sur le backend
      const response = await apiService.googleLogin({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        nom: firebaseUser.displayName?.split(' ').pop() || '',
        prenom: firebaseUser.displayName?.split(' ').slice(0, -1).join(' ') || '',
        photo_url: firebaseUser.photoURL,
        firebase_token: firebaseUser.token
      });
      
      const jwtResponse = response as any;
      if (jwtResponse.access && jwtResponse.user) {
        const { access: userToken, user: userData } = jwtResponse;
        localStorage.setItem('token', userToken);
        setUser(userData as UserDTO);
        setToken(userToken);
        setIsGoogleUser(true);
        return true;
      }
      
      console.error('Google login failed - Invalid response structure:', response);
      return false;
    } catch (error) {
      console.error('Google login error:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
    setIsGoogleUser(false);
    
    // Déconnexion Firebase si utilisateur Google
    if (isGoogleUser) {
      firebaseAuthService.signOut().catch(console.error);
    }
    
    apiService.logout();
  };

  const refreshUser = async () => {
    if (!token) return;
    
    try {
      const { data } = await apiService.getProfile();
      if (data) {
        setUser(data);
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
    loginWithGoogle,
    logout,
    refreshUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 