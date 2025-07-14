import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast, { Toaster } from 'react-hot-toast';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  useEffect(() => {
    if (isAuthenticated && user) {
      // Redirection basée sur le rôle de l'utilisateur
      let redirectPath = '/dashboard';
      
      switch (user.role) {
        case 'admin':
          redirectPath = '/admin';
          break;
        case 'gestionnaire':
          redirectPath = '/manager';
          break;
        case 'client':
          redirectPath = '/dashboard';
          break;
        default:
          redirectPath = '/dashboard';
      }
      
      // Utiliser le chemin de redirection ou celui défini par le rôle
      const targetPath = from !== '/dashboard' ? from : redirectPath;
      
      toast.success('Connexion réussie ! Redirection...');
      setTimeout(() => {
        navigate(targetPath, { replace: true });
      }, 1000);
    }
  }, [isAuthenticated, user, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        // La redirection sera gérée par useEffect
        console.log('Connexion réussie, redirection en cours...');
      } else {
        toast.error('Email ou mot de passe incorrect');
      }
    } catch (error: any) {
      console.error('Erreur de connexion:', error);
      toast.error('Une erreur est survenue lors de la connexion');
    } finally {
      setLoading(false);
    }
  };

  // Si l'utilisateur est déjà connecté, ne pas afficher la page de connexion
  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Redirection en cours...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" />
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 p-10 bg-white shadow-lg rounded-xl">
          <div>
            <div className="flex justify-center mb-6">
              <img src="/logo.svg" alt="Logo" className="h-12 w-auto" />
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Connectez-vous à votre compte
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Ou{' '}
              <Link to="/register" className="font-medium text-orange-600 hover:text-orange-500">
                créez un nouveau compte
              </Link>
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="email-address" className="sr-only">
                  Adresse e-mail
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                  placeholder="Adresse e-mail"
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">
                  Mot de passe
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                  placeholder="Mot de passe"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Connexion...' : 'Se connecter'}
              </button>
            </div>

            {/* Lien mot de passe oublié */}
            <div className="text-center">
              <Link
                to="/forgot-password"
                className="text-sm text-orange-600 hover:text-orange-500 transition-colors"
              >
                Mot de passe oublié ?
              </Link>
            </div>

            <div className="text-sm text-center">
              <span className="text-gray-600">Pas encore de compte ? </span>
              <Link to="/register" className="font-medium text-orange-600 hover:text-orange-500">
                S'inscrire
              </Link>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default LoginPage; 