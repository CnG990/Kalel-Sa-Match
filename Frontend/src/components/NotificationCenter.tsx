import React, { useState } from 'react';
import { Bell, X, Check, CheckCheck, Trash2, Clock, AlertCircle, Info, CheckCircle } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface NotificationCenterProps {
  className?: string;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, loading } = useNotifications();

  const getNotificationIcon = (type: string, priority: string) => {
    if (priority === 'urgent') {
      return <AlertCircle className="w-5 h-5 text-red-500" />;
    }

    switch (type) {
      case 'reservation_confirmed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'payment_received':
        return <CheckCircle className="w-5 h-5 text-blue-500" />;
      case 'reminder_upcoming_match':
        return <Clock className="w-5 h-5 text-orange-500" />;
      default:
        return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  const getNotificationTitle = (type: string) => {
    const titles = {
      'reservation_confirmed': 'Réservation confirmée',
      'payment_received': 'Paiement reçu',
      'reminder_upcoming_match': 'Match à venir',
      'manager_approved': 'Compte approuvé',
      'manager_rejected': 'Compte refusé',
      'new_message': 'Nouveau message',
      'price_changed': 'Prix modifié',
      'refund_processed': 'Remboursement traité'
    };
    return titles[type as keyof typeof titles] || 'Notification';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'border-l-red-500 bg-red-50';
      case 'high':
        return 'border-l-orange-500 bg-orange-50';
      case 'normal':
        return 'border-l-blue-500 bg-blue-50';
      case 'low':
        return 'border-l-gray-500 bg-gray-50';
      default:
        return 'border-l-gray-500 bg-white';
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Bouton de notification */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Panneau des notifications */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Panneau */}
          <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-lg shadow-xl border z-50 max-h-96 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b bg-gray-50">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Notifications {unreadCount > 0 && `(${unreadCount})`}
                </h3>
                <div className="flex items-center space-x-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-sm text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                      title="Marquer tout comme lu"
                    >
                      <CheckCheck className="w-4 h-4" />
                      <span>Tout lire</span>
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Liste des notifications */}
            <div className="max-h-80 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-gray-500">
                  Chargement des notifications...
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Aucune notification</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border-l-4 transition-colors hover:bg-gray-50 ${
                        notification.read_at ? 'opacity-60' : ''
                      } ${getPriorityColor(notification.priority)}`}
                    >
                      <div className="flex items-start space-x-3">
                        {/* Icône */}
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type, notification.priority)}
                        </div>

                        {/* Contenu */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                {getNotificationTitle(notification.type)}
                              </p>
                              <p className="text-sm text-gray-600 mt-1">
                                {notification.data.message}
                              </p>
                              <p className="text-xs text-gray-400 mt-2">
                                {formatDistanceToNow(new Date(notification.created_at), {
                                  addSuffix: true,
                                  locale: fr
                                })}
                              </p>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center space-x-1 ml-2">
                              {!notification.read_at && (
                                <button
                                  onClick={() => markAsRead(notification.id)}
                                  className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                                  title="Marquer comme lu"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => deleteNotification(notification.id)}
                                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                title="Supprimer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t bg-gray-50 text-center">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    // Naviguer vers la page complète des notifications
                    window.location.href = '/dashboard/notifications';
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Voir toutes les notifications
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationCenter; 