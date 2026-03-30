import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import apiService from '../services/api';

const RegisterClientPage: React.FC = () => {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    password: '',
    password_confirmation: '',
    telephone: '',
    accept_terms: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.password_confirmation) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const payload = { ...formData, role: 'client' };
      const { data, meta } = await apiService.register(payload);

      if (!data) {
        const message = (meta?.message as string | undefined) || "L'inscription a échoué.";
        throw new Error(message);
      }

      setSuccess('Votre compte a été créé avec succès ! Vous allez être redirigé vers la page de connexion.');
      setTimeout(() => {
        navigate('/login');
      }, 3000);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-lg p-5 sm:p-8 space-y-6 bg-white rounded-lg shadow-lg mx-4 sm:mx-auto">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center justify-center mb-6 hover:opacity-80 transition-opacity">
            <img src="/logo sans background.png" alt="Logo Kalél Sa Match" className="h-12 w-auto" />
            <div className="ml-3">
              <span className="text-2xl font-bold">
                <span className="text-green-600">Kalél</span>
                <span className="text-orange-500"> Sa Match</span>
              </span>
            </div>
          </Link>
        </div>

        {!success ? (
          <>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-center text-gray-900">
              Créer un compte Joueur
            </h2>
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && <p className="p-3 text-sm text-center text-white bg-red-500 rounded-md">{error}</p>}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input name="prenom" type="text" placeholder="Prénom" required onChange={handleChange} value={formData.prenom} className="w-full px-4 py-2 border rounded-md" />
                <input name="nom" type="text" placeholder="Nom" required onChange={handleChange} value={formData.nom} className="w-full px-4 py-2 border rounded-md" />
              </div>
              <input name="email" type="email" placeholder="Adresse e-mail" required onChange={handleChange} value={formData.email} className="w-full px-4 py-2 border rounded-md" />
              <input name="telephone" type="tel" placeholder="Téléphone" required onChange={handleChange} value={formData.telephone} className="w-full px-4 py-2 border rounded-md" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Mot de passe"
                    required
                    onChange={handleChange}
                    value={formData.password}
                    className="w-full px-4 py-2 border rounded-md pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-gray-700"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <div className="relative">
                  <input
                    name="password_confirmation"
                    type={showPasswordConfirm ? 'text' : 'password'}
                    placeholder="Confirmer le mot de passe"
                    required
                    onChange={handleChange}
                    value={formData.password_confirmation}
                    className="w-full px-4 py-2 border rounded-md pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordConfirm(v => !v)}
                    className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-gray-700"
                    tabIndex={-1}
                  >
                    {showPasswordConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  name="accept_terms"
                  id="accept_terms"
                  checked={formData.accept_terms}
                  onChange={handleChange}
                  required
                  className="mt-1 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="accept_terms" className="text-sm text-gray-700">
                  J'accepte les{' '}
                  <Link to="/terms" target="_blank" className="text-green-600 hover:text-green-500 underline font-semibold">
                    conditions d'utilisation
                  </Link>
                  {' '}et la{' '}
                  <Link to="/privacy" target="_blank" className="text-green-600 hover:text-green-500 underline font-semibold">
                    politique de confidentialité
                  </Link>
                  {' '}et je comprends toutes les règles de réservation, d'annulation et de pénalités.
                </label>
              </div>
              
              <button type="submit" disabled={loading} className="w-full px-4 py-2 font-semibold text-white bg-orange-600 rounded-md hover:bg-orange-700 disabled:opacity-50">
                {loading ? 'Création en cours...' : 'Créer mon compte'}
              </button>
            </form>
          </>
        ) : (
            <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center text-5xl text-green-600">✓</div>
                <h2 className="text-2xl font-bold">Compte créé !</h2>
                <p className="text-gray-600">{success}</p>
            </div>
        )}
         <p className="text-sm text-center text-gray-600">
          Déjà un compte ?{' '}
          <Link to="/login" className="font-medium text-orange-600 hover:text-orange-500">
            Connectez-vous
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterClientPage; 