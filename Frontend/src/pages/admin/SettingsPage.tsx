import React, { useState, useEffect } from 'react';
import apiService from '../../services/api';
import toast from 'react-hot-toast';
import { Save, RefreshCw, Bell, CreditCard, Globe, Loader2, FileText } from 'lucide-react';
import NotificationsPage from './NotificationsPage';
import LogsPage from './LogsPage';

interface SystemSettings {
  general: {
    site_name: string;
    default_currency: string;
    timezone: string;
    maintenance_mode: boolean;
  };
  payments: {
    commission_rate: number;
    refund_policy_days: number;
  };
  notifications: {
    email_notifications: boolean;
    sms_notifications: boolean;
  };
}

const SettingsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('general');
  const [settings, setSettings] = useState<SystemSettings>({
    general: {
      site_name: 'Terrains Synthétiques Dakar',
      default_currency: 'FCFA',
      timezone: 'Africa/Dakar',
      maintenance_mode: false
    },
    payments: {
      commission_rate: 10,
      refund_policy_days: 7
    },
    notifications: {
      email_notifications: true,
      sms_notifications: false
    }
  });

  const [systemPerformance, setSystemPerformance] = useState({
    cpu_usage: 0,
    memory_usage: 0,
    disk_usage: 0,
    database_connections: 0,
    response_time: 0,
    uptime: 0
  });

  useEffect(() => {
    loadSettings();
    loadSystemPerformance();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await apiService.getSystemConfig();
      if (response.success) {
        const apiData = response.data;
        setSettings({
          general: {
            site_name: apiData.general?.nom_application || 'Terrains Synthétiques Dakar',
            default_currency: apiData.general?.devise || 'FCFA',
            timezone: apiData.general?.timezone || 'Africa/Dakar',
            maintenance_mode: apiData.maintenance?.mode_maintenance || false
          },
          payments: {
            commission_rate: apiData.paiements?.commission_defaut || 10,
            refund_policy_days: apiData.paiements?.delai_remboursement || 7
          },
          notifications: {
            email_notifications: apiData.notifications?.email_notifications || true,
            sms_notifications: apiData.notifications?.sms_notifications || false
          }
        });
        toast.success('Paramètres chargés avec succès');
      }
    } catch (error) {
      toast.error('Erreur lors du chargement des paramètres');
    } finally {
      setLoading(false);
    }
  };

  const loadSystemPerformance = async () => {
    try {
      const response = await apiService.getSystemPerformance();
      if (response.success) {
        setSystemPerformance(response.data);
      }
    } catch (error) {
      // Erreur silencieuse pour les métriques de performance
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      
      // Convertir les paramètres au format API backend réel
      const configData = {
        general: {
          nom_application: settings.general.site_name,
          devise: settings.general.default_currency,
          timezone: settings.general.timezone
        },
        paiements: {
          commission_defaut: settings.payments.commission_rate,
          delai_remboursement: settings.payments.refund_policy_days
        },
        notifications: {
          email_notifications: settings.notifications.email_notifications,
          sms_notifications: settings.notifications.sms_notifications
        },
        maintenance: {
          mode_maintenance: settings.general.maintenance_mode
        }
      };

      const response = await apiService.updateSystemConfig(configData);
      if (response.success) {
        toast.success('Paramètres sauvegardés avec succès');
      } else {
        toast.error('Erreur lors de la sauvegarde');
      }
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (category: keyof SystemSettings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const tabs = [
    { id: 'general', name: 'Général', icon: Globe },
    { id: 'payments', name: 'Paiements', icon: CreditCard },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'performance', name: 'Performance', icon: RefreshCw }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2">Chargement des paramètres...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Paramètres Système</h1>
          <p className="text-gray-600">Configuration et performance du système</p>
        </div>
        <button
          onClick={saveSettings}
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{saving ? 'Sauvegarde...' : 'Sauvegarder'}</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-lg">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'performance' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Performance du Système</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-800 mb-2">Utilisation CPU</h4>
                  <p className="text-2xl font-bold text-blue-900">{systemPerformance.cpu_usage}%</p>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-green-800 mb-2">Utilisation Mémoire</h4>
                  <p className="text-2xl font-bold text-green-900">{systemPerformance.memory_usage}%</p>
                </div>
                
                <div className="bg-orange-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-orange-800 mb-2">Utilisation Disque</h4>
                  <p className="text-2xl font-bold text-orange-900">{systemPerformance.disk_usage}%</p>
                </div>
                
                <div className="bg-purple-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-purple-800 mb-2">Connexions DB</h4>
                  <p className="text-2xl font-bold text-purple-900">{systemPerformance.database_connections}</p>
                </div>
                
                <div className="bg-red-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-red-800 mb-2">Temps de Réponse</h4>
                  <p className="text-2xl font-bold text-red-900">{systemPerformance.response_time}ms</p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-800 mb-2">Uptime</h4>
                  <p className="text-2xl font-bold text-gray-900">{Math.floor(systemPerformance.uptime / 24)}j</p>
                </div>
              </div>

              <button
                onClick={loadSystemPerformance}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Actualiser</span>
              </button>
            </div>
          )}

          {activeTab !== 'performance' && (
            <div>
              {/* Onglet Général */}
              {activeTab === 'general' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900">Paramètres Généraux</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom de l'application
                      </label>
                      <input
                        type="text"
                        value={settings.general.site_name}
                        onChange={(e) => updateSetting('general', 'site_name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Devise par défaut
                      </label>
                      <select
                        value={settings.general.default_currency}
                        onChange={(e) => updateSetting('general', 'default_currency', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="FCFA">FCFA</option>
                        <option value="EUR">Euro</option>
                        <option value="USD">Dollar US</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fuseau horaire
                      </label>
                      <select
                        value={settings.general.timezone}
                        onChange={(e) => updateSetting('general', 'timezone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Africa/Dakar">Africa/Dakar</option>
                        <option value="GMT">GMT</option>
                        <option value="UTC">UTC</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="maintenance-mode"
                      checked={settings.general.maintenance_mode}
                      onChange={(e) => updateSetting('general', 'maintenance_mode', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="maintenance-mode" className="text-sm font-medium text-gray-700">
                      Mode maintenance activé
                    </label>
                  </div>
                </div>
              )}

              {/* Onglet Paiements */}
              {activeTab === 'payments' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900">Paramètres des Paiements</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Taux de commission par défaut (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="50"
                        step="0.1"
                        value={settings.payments.commission_rate}
                        onChange={(e) => updateSetting('payments', 'commission_rate', parseFloat(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Délai de remboursement (jours)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="30"
                        value={settings.payments.refund_policy_days}
                        onChange={(e) => updateSetting('payments', 'refund_policy_days', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Onglet Notifications */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900">Paramètres des Notifications</h3>
                  
                  <div className="space-y-4">
                    <h4 className="text-md font-medium text-gray-900">Canaux de notification</h4>
                    
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id="email-notif"
                          checked={settings.notifications.email_notifications}
                          onChange={(e) => updateSetting('notifications', 'email_notifications', e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="email-notif" className="text-sm font-medium text-gray-700">
                          Notifications par email
                        </label>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id="sms-notif"
                          checked={settings.notifications.sms_notifications}
                          onChange={(e) => updateSetting('notifications', 'sms_notifications', e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="sms-notif" className="text-sm font-medium text-gray-700">
                          Notifications par SMS
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>


    </div>
  );
};

export default SettingsPage; 