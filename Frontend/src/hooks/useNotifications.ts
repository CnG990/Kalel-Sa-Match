import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/api';

interface Notification {
  id: number;
  type: string;
  data: any;
  read_at: string | null;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  created_at: string;
}

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: number) => Promise<void>;
  refresh: () => Promise<void>;
}

export const useNotifications = (): UseNotificationsReturn => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Calculer le nombre de notifications non lues
  const unreadCount = notifications.filter(n => !n.read_at).length;

  // Charger les notifications
  const loadNotifications = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const response = await apiService.getNotifications();
      if (response.success) {
        setNotifications(response.data);
      }
    } catch (error) {
      console.error('Erreur chargement notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Marquer une notification comme lue
  const markAsRead = useCallback(async (id: number) => {
    try {
      const response = await apiService.markNotificationAsRead(id);
      if (response.success) {
        setNotifications(prev => 
          prev.map(n => 
            n.id === id ? { ...n, read_at: new Date().toISOString() } : n
          )
        );
      }
    } catch (error) {
      console.error('Erreur marquage notification:', error);
    }
  }, []);

  // Marquer toutes les notifications comme lues
  const markAllAsRead = useCallback(async () => {
    try {
      const response = await apiService.markAllNotificationsAsRead();
      if (response.success) {
        setNotifications(prev => 
          prev.map(n => ({ ...n, read_at: new Date().toISOString() }))
        );
      }
    } catch (error) {
      console.error('Erreur marquage toutes notifications:', error);
    }
  }, []);

  // Supprimer une notification
  const deleteNotification = useCallback(async (id: number) => {
    try {
      const response = await apiService.deleteNotification(id);
      if (response.success) {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }
    } catch (error) {
      console.error('Erreur suppression notification:', error);
    }
  }, []);

  // Actualiser les notifications
  const refresh = useCallback(() => {
    return loadNotifications();
  }, [loadNotifications]);

  // Écouter les nouvelles notifications via WebSocket/SSE
  useEffect(() => {
    if (!user) return;

    // Connection WebSocket pour les notifications en temps réel
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/notifications`;
    
    let ws: WebSocket;
    
    try {
      ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log('WebSocket notifications connecté');
        // Authentifier la connexion
        ws.send(JSON.stringify({
          type: 'authenticate',
          token: localStorage.getItem('token')
        }));
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.type === 'new_notification') {
          setNotifications(prev => [data.notification, ...prev]);
          
          // Afficher notification navigateur si permission accordée
          if (Notification.permission === 'granted') {
            new Notification(data.notification.data.title || 'Nouvelle notification', {
              body: data.notification.data.message,
              icon: '/logo.png',
              tag: `notification-${data.notification.id}`
            });
          }
        }
      };

      ws.onerror = (error) => {
        console.error('Erreur WebSocket notifications:', error);
      };

      ws.onclose = () => {
        console.log('WebSocket notifications fermé');
        // Tentative de reconnexion après 5 secondes
        setTimeout(() => {
          if (user) {
            // Récréer la connexion
          }
        }, 5000);
      };

    } catch (error) {
      console.error('Impossible de créer WebSocket:', error);
      // Fallback: polling toutes les 30 secondes
      const interval = setInterval(refresh, 30000);
      return () => clearInterval(interval);
    }

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [user, refresh]);

  // Charger les notifications au montage
  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Demander permission pour les notifications navigateur
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refresh
  };
}; 