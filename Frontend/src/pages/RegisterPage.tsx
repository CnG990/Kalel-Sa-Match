import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast, { Toaster } from 'react-hot-toast';
import SEOMetaTags from '../components/SEOMetaTags';

const RegisterPage: React.FC = () => {
  const { loginWithGoogle } = useAuth();
  const [loading, setLoading] = React.useState(false);

  const handleGoogleRegister = async () => {
    setLoading(true);
    try {
      const success = await loginWithGoogle();
      if (success) {
        toast.success('Inscription Google réussie !');
      } else {
        toast.error('L\'inscription Google a échoué');
      }
    } catch (error) {
      console.error('Google register error:', error);
      toast.error('Une erreur est survenue lors de l\'inscription Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEOMetaTags 
        title="Inscription - Créez votre compte gratuitement"
        description="Inscrivez-vous sur Kalél Sa Match pour réserver des terrains de football partout au Sénégal. Devenez joueur ou gestionnaire en quelques clics."
        url="https://kalelsamatch.com/register"
      />
      <Toaster position="top-right" />
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-full max-w-lg p-8 text-center bg-white rounded-lg shadow-lg">
          {/* Logo et lien de retour */}
          <div className="text-center mb-6">
            <Link to="/" className="inline-flex items-center justify-center hover:opacity-80 transition-opacity">
              <img src="/logo sans background.png" alt="Logo Kalél Sa Match" className="h-12 w-auto" />
              <div className="ml-3">
                <span className="text-2xl font-bold">
                  <span className="text-green-600">Kalél</span>
                  <span className="text-orange-500"> Sa Match</span>
                </span>
              </div>
            </Link>
          </div>

          <h2 className="text-3xl font-extrabold text-gray-900">
            Rejoignez-nous !
          </h2>
          <p className="mt-4 text-gray-600">
            Quel type de compte souhaitez-vous créer ?
          </p>
          
          {/* Option Google */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Ou inscrivez-vous rapidement avec</span>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <button
              type="button"
              onClick={handleGoogleRegister}
              disabled={loading}
              className="w-full flex justify-center items-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {loading ? 'Inscription...' : 'S\'inscrire avec Google'}
            </button>
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Ou créez un compte manuellement</span>
              </div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Option Client */}
            <Link to="/register/client" className="block p-6 border rounded-lg hover:shadow-xl hover:border-orange-500 transition-all">
              <div className="text-5xl">⚽</div>
              <h3 className="mt-4 text-xl font-bold text-gray-800">Je suis un Joueur</h3>
              <p className="mt-2 text-sm text-gray-600">Je veux trouver et réserver des terrains pour jouer.</p>
            </Link>

            {/* Option Gestionnaire */}
            <Link to="/register/manager" className="block p-6 border rounded-lg hover:shadow-xl hover:border-orange-500 transition-all">
              <div className="text-5xl">🏟️</div>
              <h3 className="mt-4 text-xl font-bold text-gray-800">Je suis un Gestionnaire</h3>
              <p className="mt-2 text-sm text-gray-600">Je veux lister mes terrains et gérer mes réservations.</p>
            </Link>

          </div>
          <p className="mt-8 text-sm text-gray-600">
            Déjà un compte ?{' '}
            <Link to="/login" className="font-medium text-orange-600 hover:text-orange-500">
              Connectez-vous
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default RegisterPage; 