import React from 'react';
import { Bell, BellOff, Loader2 } from 'lucide-react';
import { usePushNotifications } from '../hooks/usePushNotifications';

interface NotificationToggleProps {
  className?: string;
}

export const NotificationToggle: React.FC<NotificationToggleProps> = ({ className = '' }) => {
  const { isSupported, isEnabled, isLoading, enableNotifications, disableNotifications } = usePushNotifications();

  if (!isSupported) {
    return null;
  }

  const handleToggle = async () => {
    if (isEnabled) {
      await disableNotifications();
    } else {
      await enableNotifications();
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`relative p-2 rounded-lg transition-colors ${
        isEnabled
          ? 'bg-green-100 text-green-600 hover:bg-green-200'
          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
      } ${className}`}
      title={isEnabled ? 'Notifications activées' : 'Activer les notifications'}
    >
      {isLoading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : isEnabled ? (
        <Bell className="w-5 h-5" />
      ) : (
        <BellOff className="w-5 h-5" />
      )}
      {isEnabled && (
        <span className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full" />
      )}
    </button>
  );
};

export default NotificationToggle;
