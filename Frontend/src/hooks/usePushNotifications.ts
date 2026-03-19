import { useEffect, useState, useCallback } from 'react';
import { pushNotificationService } from '../services/firebase';
import toast from 'react-hot-toast';

interface UsePushNotificationsReturn {
  isSupported: boolean;
  isEnabled: boolean;
  isLoading: boolean;
  enableNotifications: () => Promise<boolean>;
  disableNotifications: () => Promise<void>;
}

export function usePushNotifications(): UsePushNotificationsReturn {
  const [isSupported, setIsSupported] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Vérifier le support des notifications
  useEffect(() => {
    const supported = 'Notification' in window && 'serviceWorker' in navigator;
    setIsSupported(supported);
    
    if (supported && Notification.permission === 'granted') {
      setIsEnabled(true);
    }
  }, []);

  // Écouter les messages en premier plan
  useEffect(() => {
    if (!isEnabled) return;

    const unsubscribe = pushNotificationService.onForegroundMessage((payload: any) => {
      const title = payload.notification?.title || 'Nouvelle notification';
      const body = payload.notification?.body || '';
      
      // Afficher un toast pour les notifications en premier plan
      toast(`${title}: ${body}`, { duration: 5000, icon: '🔔' });
    });

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [isEnabled]);

  const enableNotifications = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      toast.error('Les notifications ne sont pas supportées sur cet appareil');
      return false;
    }

    setIsLoading(true);
    try {
      const token = await pushNotificationService.requestPermissionAndGetToken();
      
      if (token) {
        // Récupérer l'ID utilisateur depuis localStorage
        const storedUser = localStorage.getItem('user');
        const userId = storedUser ? JSON.parse(storedUser)?.id : null;
        
        if (userId) {
          const success = await pushNotificationService.registerTokenOnBackend(token, userId);
          
          if (success) {
            setIsEnabled(true);
            toast.success('Notifications activées !');
            return true;
          } else {
            toast.error('Erreur lors de l\'enregistrement');
            return false;
          }
        }
        
        // Même sans backend, activer localement
        setIsEnabled(true);
        toast.success('Notifications activées !');
        return true;
      } else {
        toast.error('Permission refusée ou erreur');
        return false;
      }
    } catch (error) {
      console.error('Erreur activation notifications:', error);
      toast.error('Erreur lors de l\'activation des notifications');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported]);

  const disableNotifications = useCallback(async (): Promise<void> => {
    setIsEnabled(false);
    toast.success('Notifications désactivées');
  }, []);

  return {
    isSupported,
    isEnabled,
    isLoading,
    enableNotifications,
    disableNotifications,
  };
}

export default usePushNotifications;
