import React from 'react';
import { Link } from 'react-router-dom';

const RegisterPage: React.FC = () => {
  return (
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
  );
};

export default RegisterPage; 