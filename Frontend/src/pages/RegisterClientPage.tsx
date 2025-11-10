import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

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
      const response = await fetch('http://127.0.0.1:8000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ ...formData, role: 'client' }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 422 && data.errors) {
            const errorMessages = Object.values(data.errors).flat().join(' ');
            throw new Error(errorMessages);
        }
        throw new Error(data.message || 'L\'inscription a échoué.');
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
      <div className="w-full max-w-lg p-8 space-y-6 bg-white rounded-lg shadow-lg">
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
            <h2 className="text-3xl font-extrabold text-center text-gray-900">
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
                <input name="password" type="password" placeholder="Mot de passe" required onChange={handleChange} value={formData.password} className="w-full px-4 py-2 border rounded-md" />
                <input name="password_confirmation" type="password" placeholder="Confirmer le mot de passe" required onChange={handleChange} value={formData.password_confirmation} className="w-full px-4 py-2 border rounded-md" />
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