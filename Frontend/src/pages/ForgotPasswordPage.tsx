import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import apiService from '../services/api';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [resetUrl, setResetUrl] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Veuillez saisir votre adresse email');
      return;
    }

    setLoading(true);
    
    try {
      const response = await apiService.forgotPassword(email);
      
      if (response.success) {
        setEmailSent(true);
        // En développement, on affiche le lien
        if (response.data?.reset_url) {
          setResetUrl(response.data.reset_url);
        }
        toast.success('Lien de réinitialisation envoyé !');
      } else {
        toast.error(response.message || 'Erreur lors de l\'envoi');
      }
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de l\'envoi du lien');
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              Email envoyé !
            </h2>
          </div>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="text-center">
              <p className="text-gray-600 mb-6">
                Un lien de réinitialisation a été envoyé à :
              </p>
              <p className="font-semibold text-gray-900 mb-6">{email}</p>
              
              {resetUrl && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800 mb-2">
                    🚀 <strong>Mode développement</strong> - Lien direct :
                  </p>
                  <a
                    href={resetUrl}
                    className="text-blue-600 hover:text-blue-800 text-sm break-all underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {resetUrl}
                  </a>
                </div>
              )}
              
              <p className="text-sm text-gray-500 mb-6">
                Vérifiez votre boîte de réception et vos spams. Le lien expire dans 60 minutes.
              </p>

              <div className="space-y-4">
                <button
                  onClick={() => {
                    setEmailSent(false);
                    setEmail('');
                    setResetUrl('');
                  }}
                  className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Renvoyer un lien
                </button>
                
                <Link
                  to="/login"
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors inline-block text-center"
                >
                  Retour à la connexion
                </Link>
              </div>
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
          <Mail className="mx-auto h-12 w-12 text-orange-500" />
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Mot de passe oublié ?
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Saisissez votre email pour recevoir un lien de réinitialisation
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Adresse email
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                  placeholder="votre.email@exemple.com"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Envoi en cours...
                  </div>
                ) : (
                  'Envoyer le lien de réinitialisation'
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

          {/* Comptes de test pour développement */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              🧪 Comptes de test disponibles :
            </h3>
            <div className="space-y-2 text-xs text-gray-600">
              <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span>👑 Admin:</span>
                <span className="font-mono">admin@terrains-dakar.com</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span>🏢 Gestionnaire:</span>
                <span className="font-mono">gestionnaire@terrains-dakar.com</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span>👤 Client:</span>
                <span className="font-mono">client@terrains-dakar.com</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage; 