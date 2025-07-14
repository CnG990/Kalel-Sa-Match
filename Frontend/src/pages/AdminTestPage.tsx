import React, { useState, useEffect } from 'react';
import apiService from '../services/api';

const AdminTestPage: React.FC = () => {
  const [authStatus, setAuthStatus] = useState<string>('Checking...');
  const [userProfile, setUserProfile] = useState<any>(null);
  const [usersData, setUsersData] = useState<any>(null);
  const [error, setError] = useState<string>('');

  const testAdminLogin = async () => {
    try {
      setError('');
      console.log('🔐 Tentative de connexion admin...');
      
      // Essayer de se connecter avec les credentials admin par défaut
      const loginResponse = await apiService.login('admin@terrasyn.sn', 'password');
      
      if (loginResponse.success) {
        console.log('✅ Connexion admin réussie');
        setAuthStatus('Connecté comme admin');
        
        // Stocker le token
        if (loginResponse.data?.token) {
          localStorage.setItem('token', loginResponse.data.token);
        }
        
        // Récupérer le profil
        const profileResponse = await apiService.getProfile();
        if (profileResponse.success) {
          setUserProfile(profileResponse.data);
          console.log('👤 Profil admin récupéré:', profileResponse.data);
        }
        
        // Tester l'API getAllUsers
        const usersResponse = await apiService.getAllUsers();
        if (usersResponse.success) {
          setUsersData(usersResponse.data);
          console.log('👥 Utilisateurs récupérés:', usersResponse.data);
        } else {
          setError(`Erreur getAllUsers: ${usersResponse.message}`);
        }
        
      } else {
        setError(`Erreur connexion: ${loginResponse.message}`);
        console.error('❌ Erreur de connexion:', loginResponse.message);
      }
    } catch (err: any) {
      console.error('🚨 Erreur générale:', err);
      setError(`Erreur: ${err.message}`);
    }
  };

  const testWithStoredToken = async () => {
    try {
      setError('');
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Aucun token stocké');
        return;
      }
      
      console.log('🎟️ Test avec token stocké...');
      
      // Vérifier le profil
      const profileResponse = await apiService.getProfile();
      if (profileResponse.success) {
        setUserProfile(profileResponse.data);
        setAuthStatus('Token valide');
        
        // Tester l'API getAllUsers
        const usersResponse = await apiService.getAllUsers();
        if (usersResponse.success) {
          setUsersData(usersResponse.data);
          console.log('👥 Utilisateurs récupérés avec token:', usersResponse.data);
        } else {
          setError(`Erreur getAllUsers avec token: ${usersResponse.message}`);
        }
      } else {
        setError('Token invalide ou expiré');
      }
    } catch (err: any) {
      setError(`Erreur token test: ${err.message}`);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setAuthStatus('Déconnecté');
    setUserProfile(null);
    setUsersData(null);
    setError('');
  };

  useEffect(() => {
    // Vérifier automatiquement s'il y a un token au chargement
    testWithStoredToken();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            🔧 Test Admin API - Diagnostic
          </h1>

          {/* Status Section */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h2 className="text-lg font-semibold text-blue-900 mb-2">Status d'authentification</h2>
            <p className="text-blue-800">{authStatus}</p>
            {error && (
              <div className="mt-2 p-2 bg-red-100 text-red-800 rounded">
                ❌ {error}
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="mb-6 flex flex-wrap gap-4">
            <button
              onClick={testAdminLogin}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              🔐 Se connecter admin@terrasyn.sn
            </button>
            
            <button
              onClick={testWithStoredToken}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              🎟️ Tester token stocké
            </button>
            
            <button
              onClick={logout}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              🚪 Déconnexion
            </button>
          </div>

          {/* User Profile Section */}
          {userProfile && (
            <div className="mb-6 p-4 bg-green-50 rounded-lg">
              <h2 className="text-lg font-semibold text-green-900 mb-2">👤 Profil utilisateur</h2>
              <div className="text-green-800">
                <p><strong>Nom:</strong> {userProfile.prenom} {userProfile.nom}</p>
                <p><strong>Email:</strong> {userProfile.email}</p>
                <p><strong>Rôle:</strong> {userProfile.role}</p>
                <p><strong>Statut:</strong> {userProfile.statut_validation}</p>
              </div>
            </div>
          )}

          {/* Users Data Section */}
          {usersData && (
            <div className="mb-6 p-4 bg-purple-50 rounded-lg">
              <h2 className="text-lg font-semibold text-purple-900 mb-2">
                👥 Données getAllUsers ({usersData.data?.length || 0} utilisateurs)
              </h2>
              
              {usersData.data && usersData.data.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full table-auto text-sm">
                    <thead>
                      <tr className="bg-purple-100">
                        <th className="px-4 py-2 text-left">ID</th>
                        <th className="px-4 py-2 text-left">Nom</th>
                        <th className="px-4 py-2 text-left">Email</th>
                        <th className="px-4 py-2 text-left">Rôle</th>
                        <th className="px-4 py-2 text-left">Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usersData.data.slice(0, 10).map((user: any) => (
                        <tr key={user.id} className="border-b">
                          <td className="px-4 py-2">{user.id}</td>
                          <td className="px-4 py-2">{user.prenom} {user.nom}</td>
                          <td className="px-4 py-2">{user.email}</td>
                          <td className="px-4 py-2">
                            <span className={`px-2 py-1 rounded text-xs ${
                              user.role === 'admin' ? 'bg-red-100 text-red-800' :
                              user.role === 'gestionnaire' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-4 py-2">
                            <span className={`px-2 py-1 rounded text-xs ${
                              user.statut_validation === 'approuve' ? 'bg-green-100 text-green-800' :
                              user.statut_validation === 'en_attente' ? 'bg-orange-100 text-orange-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {user.statut_validation}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {usersData.data.length > 10 && (
                    <p className="mt-2 text-purple-700 text-sm">
                      ... et {usersData.data.length - 10} autres utilisateurs
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-purple-700">Aucun utilisateur trouvé</p>
              )}
            </div>
          )}

          {/* Debug Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">🔍 Informations de debug</h2>
            <div className="text-gray-700 text-sm space-y-1">
              <p><strong>API URL:</strong> {apiService.apiURL}</p>
              <p><strong>Token stocké:</strong> {localStorage.getItem('token') ? '✅ Présent' : '❌ Absent'}</p>
              <p><strong>Timestamp:</strong> {new Date().toLocaleString()}</p>
            </div>
          </div>

          {/* Navigation */}
          <div className="mt-8 pt-4 border-t border-gray-200">
            <div className="flex flex-wrap gap-4">
              <a
                href="/"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                🏠 Retour à l'accueil
              </a>
              <a
                href="/admin"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                👑 Dashboard Admin
              </a>
              <a
                href="/admin/users"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                👥 Gestion utilisateurs
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminTestPage; 