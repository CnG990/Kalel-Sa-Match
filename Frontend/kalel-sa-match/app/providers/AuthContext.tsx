'use client'

import { createContext, useContext, useEffect, useState } from 'react';
import { authService, User, RegisterRequest } from '../services/auth';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (formData: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (formData: Partial<User>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string, confirmPassword: string) => Promise<void>;
  hasRole: (role: User['role']) => boolean;
  hasAnyRole: (roles: User['role'][]) => boolean;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Vérifier l'authentification au chargement
    const checkAuth = async () => {
      try {
        setIsLoading(true);
      const currentUser = await authService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        setToken(authService.getToken());
      }
      } catch (err) {
        console.error('Erreur lors de la vérification de l\'authentification:', err);
        // Ne pas afficher d'erreur si l'utilisateur n'est simplement pas connecté
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  const clearError = () => {
    setError(null);
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await authService.login(email, password);
      
      if (response.success) {
        setUser(response.data.user);
        setToken(response.data.token);
      } else {
        throw new Error(response.message || 'Erreur lors de la connexion');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la connexion';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (formData: RegisterRequest) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await authService.register(formData);
      
      if (response.success) {
        setUser(response.data.user);
        setToken(response.data.token);
      } else {
        throw new Error(response.message || 'Erreur lors de l\'inscription');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'inscription';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
    await authService.logout();
    setUser(null);
    setToken(null);
      setError(null);
    } catch (err) {
      console.error('Erreur lors de la déconnexion:', err);
      // Même en cas d'erreur, on déconnecte l'utilisateur côté frontend
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (formData: Partial<User>) => {
    try {
      setIsLoading(true);
      setError(null);
      
    const updatedUser = await authService.updateProfile(formData);
    setUser(updatedUser);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour du profil';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string, confirmPassword: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      await authService.changePassword(currentPassword, newPassword, confirmPassword);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du changement de mot de passe';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const hasRole = (role: User['role']) => {
    return authService.hasRole(role);
  };

  const hasAnyRole = (roles: User['role'][]) => {
    return authService.hasAnyRole(roles);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: authService.isAuthenticated(),
        isLoading,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
        hasRole,
        hasAnyRole,
        error,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
}
