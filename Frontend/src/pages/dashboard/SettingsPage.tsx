import React, { useState } from 'react';
import { User, Shield, Bell, CreditCard, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/api';
import toast from 'react-hot-toast';

const SettingsPage: React.FC = () => {
  const { } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [notifications, setNotifications] = useState({
    reservations: true,
    promotions: true,
    reminders: false,
  });

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    try {
      const response = await apiService.post('/auth/change-password', {
        current_password: '', // À compléter avec l'ancien mot de passe
        new_password: newPassword,
        new_password_confirmation: confirmPassword
      });
      
      if (response.success) {
        toast.success('Mot de passe modifié avec succès');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        toast.error('Erreur lors du changement de mot de passe');
      }
    } catch (error) {
      toast.error('Erreur lors du changement de mot de passe');
    } finally {
      // setLoading(false); // Supprimer la variable loading inutilisée
    }
  };

  const handleNotificationToggle = (key: keyof typeof notifications) => {
    const newNotifications = { ...notifications, [key]: !notifications[key] };
    setNotifications(newNotifications);
    localStorage.setItem('notifications', JSON.stringify(newNotifications));
    toast.success('Préférences de notifications mises à jour');
  };

  const ToggleSwitch = ({ label, enabled, onToggle }: { label: string, enabled: boolean, onToggle: () => void }) => (
    <div className="flex items-center justify-between py-2">
      <span className="text-gray-700 dark:text-gray-300">{label}</span>
      <button 
        onClick={onToggle} 
        className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${enabled ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
      >
        <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  );

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-8">Paramètres</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Section Sécurité */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3 text-gray-900 dark:text-gray-100">
                <Shield className="w-6 h-6 text-red-600" />
                <span>Sécurité</span>
              </h2>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nouveau mot de passe</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="********"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Confirmer le mot de passe</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="********"
                  />
                </div>
                <div className="text-right">
                  <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
                    Changer le mot de passe
                  </button>
                </div>
              </form>
            </div>

            {/* Section Notifications */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3 text-gray-900 dark:text-gray-100">
                <Bell className="w-6 h-6 text-blue-600" />
                <span>Notifications</span>
              </h2>
              <div className="space-y-2">
                <ToggleSwitch label="Confirmations de réservation" enabled={notifications.reservations} onToggle={() => handleNotificationToggle('reservations')} />
                <ToggleSwitch label="Promotions et offres" enabled={notifications.promotions} onToggle={() => handleNotificationToggle('promotions')} />
                <ToggleSwitch label="Rappels de match" enabled={notifications.reminders} onToggle={() => handleNotificationToggle('reminders')} />
              </div>
            </div>
          </div>

          {/* Colonne de droite */}
          <div className="space-y-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
               <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3 text-gray-900 dark:text-gray-100">
                <User className="w-6 h-6 text-green-600" />
                <span>Profil</span>
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mb-4">Mettez à jour votre photo, nom et slogan.</p>
              <Link to="/dashboard/profile" className="font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-2">
                Modifier mon profil <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Section Gestion des Remboursements */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3 text-gray-900 dark:text-gray-100">
                <CreditCard className="w-6 h-6 text-red-600" />
                <span>Remboursements</span>
              </h2>
              
              <div className="space-y-4">
                <p className="text-gray-600 dark:text-gray-400">
                  Gérez vos demandes de remboursement et vos préférences de paiement.
                </p>
                
                <div className="grid grid-cols-1 gap-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Demandes en cours</h4>
                    <p className="text-2xl font-bold text-orange-600">0</p>
                    <p className="text-sm text-gray-500">remboursements en attente</p>
                  </div>
                  
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Total remboursé</h4>
                    <p className="text-2xl font-bold text-green-600">0 CFA</p>
                    <p className="text-sm text-gray-500">ce mois-ci</p>
                  </div>
                </div>
                
                <button className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                  Voir l'historique
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage; 