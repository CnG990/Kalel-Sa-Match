import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Key, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import apiService from '../services/api';

const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    // Récupérer les paramètres de l'URL
    const urlToken = searchParams.get('token');
    const urlEmail = searchParams.get('email');
    
    if (urlToken) setToken(urlToken);
    if (urlEmail) setEmail(decodeURIComponent(urlEmail));
    
    if (!urlToken || !urlEmail) {
      toast.error('Lien de réinitialisation invalide');
      navigate('/forgot-password');
    }
  }, [searchParams, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password || !passwordConfirmation) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    if (password.length < 8) {
      toast.error('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    if (password !== passwordConfirmation) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    setLoading(true);
    
    try {
      const response = await apiService.resetPassword(email, token, password, passwordConfirmation);
      
      if (response.success) {
        setSuccess(true);
        toast.success('Mot de passe réinitialisé avec succès !');
        
        // Rediriger vers la page de connexion après 3 secondes
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        toast.error(response.message || 'Erreur lors de la réinitialisation');
      }
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la réinitialisation du mot de passe');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              Mot de passe réinitialisé !
            </h2>
          </div>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="text-center">
              <p className="text-gray-600 mb-6">
                Votre mot de passe a été réinitialisé avec succès.
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Vous allez être redirigé vers la page de connexion dans quelques secondes...
              </p>

              <Link
                to="/login"
                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors inline-block text-center"
              >
                Se connecter maintenant
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <Key className="mx-auto h-12 w-12 text-orange-500" />
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Nouveau mot de passe
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Saisissez votre nouveau mot de passe
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Email (lecture seule) */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Adresse email
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  readOnly
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 sm:text-sm"
                />
              </div>
            </div>

            {/* Nouveau mot de passe */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Nouveau mot de passe
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                  placeholder="Minimum 8 caractères"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {password && (
                <div className="mt-2">
                  <div className={`text-xs ${password.length >= 8 ? 'text-green-600' : 'text-red-600'}`}>
                    {password.length >= 8 ? '✅' : '❌'} Au moins 8 caractères
                  </div>
                </div>
              )}
            </div>

            {/* Confirmation mot de passe */}
            <div>
              <label htmlFor="passwordConfirmation" className="block text-sm font-medium text-gray-700">
                Confirmer le mot de passe
              </label>
              <div className="mt-1">
                <input
                  id="passwordConfirmation"
                  name="passwordConfirmation"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                  placeholder="Confirmer le mot de passe"
                  disabled={loading}
                />
              </div>
              {passwordConfirmation && (
                <div className="mt-2">
                  <div className={`text-xs ${password === passwordConfirmation ? 'text-green-600' : 'text-red-600'}`}>
                    {password === passwordConfirmation ? '✅' : '❌'} Les mots de passe correspondent
                  </div>
                </div>
              )}
            </div>

            {/* Avertissement expiration */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-yellow-400" />
                <div className="ml-3">
                  <p className="text-sm text-yellow-800">
                    Ce lien expire dans 60 minutes après sa génération.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading || !password || !passwordConfirmation || password !== passwordConfirmation}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Réinitialisation...
                  </div>
                ) : (
                  'Réinitialiser le mot de passe'
                )}
              </button>
            </div>

            <div className="flex items-center justify-center">
              <Link
                to="/login"
                className="flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Retour à la connexion
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage; 