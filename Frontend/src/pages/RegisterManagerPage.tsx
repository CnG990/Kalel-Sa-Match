import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const RegisterManagerPage: React.FC = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    password: '',
    password_confirmation: '',
    telephone: '',
    nom_entreprise: '',
    numero_ninea: '',
    adresse_entreprise: '',
    accept_terms: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
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
      const response = await fetch('https://ad07ffba09ee.ngrok-free.app/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ ...formData, role: 'gestionnaire' }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Gérer les erreurs de validation de Laravel
        if (response.status === 422 && data.errors) {
            const errorMessages = Object.values(data.errors).flat().join(' ');
            throw new Error(errorMessages);
        }
        throw new Error(data.message || 'L\'inscription a échoué.');
      }

      setSuccess('Votre compte a bien été créé ! Vous serez redirigé vers la page de connexion. Votre compte est en attente de validation par notre équipe.');
      setTimeout(() => {
        navigate('/login');
      }, 5000);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-2xl p-8 space-y-6 bg-white rounded-lg shadow-lg">
        {/* Logo et lien de retour */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center justify-center mb-6 hover:opacity-80 transition-opacity">
            <img src="/logo.png" alt="Logo Kalél Sa Match" className="h-12 w-auto" />
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
              Devenez partenaire
            </h2>
            <p className="text-center text-gray-600">Inscrivez-vous en tant que gestionnaire de terrain.</p>
            
            {/* Indicateur d'étape */}
            <div className="flex justify-center items-center space-x-4">
                <div className={`flex items-center space-x-2 ${step >= 1 ? 'text-orange-600' : 'text-gray-400'}`}>
                    <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center">{step > 1 ? '✓' : '1'}</div>
                    <span>Personnel</span>
                </div>
                <div className="flex-grow h-px bg-gray-300"></div>
                 <div className={`flex items-center space-x-2 ${step >= 2 ? 'text-orange-600' : 'text-gray-400'}`}>
                    <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center">2</div>
                    <span>Entreprise</span>
                </div>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && <p className="p-3 text-sm text-center text-white bg-red-500 rounded-md">{error}</p>}
              
              {step === 1 && (
                <div className="space-y-4">
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
                  <button type="button" onClick={nextStep} className="w-full px-4 py-2 font-semibold text-white bg-orange-600 rounded-md hover:bg-orange-700">
                    Suivant
                  </button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <input name="nom_entreprise" type="text" placeholder="Nom de l'entreprise" required onChange={handleChange} value={formData.nom_entreprise} className="w-full px-4 py-2 border rounded-md" />
                  <input name="numero_ninea" type="text" placeholder="Numéro NINEA" required onChange={handleChange} value={formData.numero_ninea} className="w-full px-4 py-2 border rounded-md" />
                  <textarea name="adresse_entreprise" placeholder="Adresse de l'entreprise" required onChange={handleChange} value={formData.adresse_entreprise} className="w-full px-4 py-2 border rounded-md" />
                  
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
                      <Link to="/terms" target="_blank" className="text-green-600 hover:text-green-500 underline">
                        conditions d'utilisation
                      </Link>
                      {' '}et la{' '}
                      <Link to="/privacy" target="_blank" className="text-green-600 hover:text-green-500 underline">
                        politique de confidentialité
                      </Link>
                    </label>
                  </div>
                  
                  <div className="flex justify-between">
                     <button type="button" onClick={prevStep} className="px-4 py-2 font-semibold text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">
                        Précédent
                      </button>
                    <button type="submit" disabled={loading} className="px-4 py-2 font-semibold text-white bg-orange-600 rounded-md hover:bg-orange-700 disabled:opacity-50">
                      {loading ? 'Inscription en cours...' : 'Terminer l\'inscription'}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </>
        ) : (
            <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center text-5xl text-green-600">✓</div>
                <h2 className="text-2xl font-bold">Inscription réussie !</h2>
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

export default RegisterManagerPage; 