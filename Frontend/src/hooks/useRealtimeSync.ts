import { useState, useEffect, useCallback, useRef } from 'react';
// Supprimer l'import manquant et utiliser un type local
// import { RealtimeUpdate } from '../types';

interface RealtimeUpdate {
  type: string;
  data: any;
  timestamp?: number;
  has_updates?: boolean;
  terrains_principaux?: any[];
  sous_terrains?: any[];
  nouvelles_reservations?: any[];
}

interface TerrainUpdate {
  id: number;
  nom: string;
  est_actif: boolean;
  est_disponible: boolean;
}

interface RealtimeSync {
  terrainUpdates: TerrainUpdate[];
  isConnected: boolean;
}

interface UseRealtimeSyncOptions {
  enabled?: boolean;
  interval?: number; // en millisecondes
  onTerrainUpdate?: (terrain: any) => void;
  onReservationUpdate?: (reservation: any) => void;
  onError?: (error: any) => void;
}

export const useRealtimeSync = (options: UseRealtimeSyncOptions = {}) => {
  const {
    enabled = true,
    interval = 30000, // 30 secondes par défaut
    onTerrainUpdate,
    onReservationUpdate,
    onError
  } = options;

  const [lastUpdate, setLastUpdate] = useState<string>(new Date().toISOString());
  const [isPolling, setIsPolling] = useState(false);
  const [updates, setUpdates] = useState<RealtimeUpdate | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateRef = useRef<string>(lastUpdate);

  // Fonction pour récupérer les mises à jour
  const fetchUpdates = useCallback(async () => {
    if (!enabled) return;

    try {
      setIsPolling(true);
      setError(null);

      const response = await fetch(`http://127.0.0.1:8000/api/terrains/realtime-updates?last_update=${encodeURIComponent(lastUpdateRef.current)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        const updateData: RealtimeUpdate = data.data;
        setUpdates(updateData);
        
        // Corriger les erreurs de type
        if (updateData.timestamp) {
          const newTimestamp = updateData.timestamp.toString();
          setLastUpdate(newTimestamp);
          lastUpdateRef.current = newTimestamp;
        }

        // Notifier les changements (mode silencieux)
        // Corriger les propriétés optionnelles
        if (updateData.has_updates && updateData.terrains_principaux && updateData.sous_terrains) {
          [...updateData.terrains_principaux, ...updateData.sous_terrains].forEach(terrain => {
            if (onTerrainUpdate) {
              onTerrainUpdate(terrain);
            }
          });
        }

        // Corriger les propriétés optionnelles
        if (updateData.nouvelles_reservations) {
          updateData.nouvelles_reservations.forEach((reservation: any) => {
            if (onReservationUpdate) {
              onReservationUpdate(reservation);
            }
          });
        }

        // Notifications supprimées pour fluidité
        // Plus de notifications gênantes
      }
    } catch (error: any) {
      console.error('❌ Erreur synchronisation temps réel:', error);
      setError(error.message);
      
      if (onError) {
        onError(error);
      }
    } finally {
      setIsPolling(false);
    }
  }, [enabled, onTerrainUpdate, onReservationUpdate, onError]);

  // Démarrer le polling
  const startPolling = useCallback(() => {
    if (!enabled || pollingRef.current) return;

    console.log(`🔄 Démarrage synchronisation temps réel (${interval}ms)`);
    
    // Première récupération immédiate
    fetchUpdates();
    
    // Puis polling régulier
    pollingRef.current = setInterval(fetchUpdates, interval);
  }, [enabled, interval, fetchUpdates]);

  // Arrêter le polling
  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      console.log('⏹️ Arrêt synchronisation temps réel');
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  // Forcer une mise à jour manuelle
  const forceUpdate = useCallback(() => {
    console.log('🔄 Mise à jour forcée');
    fetchUpdates();
  }, [fetchUpdates]);

  // Effet pour gérer le cycle de vie du polling
  useEffect(() => {
    if (enabled) {
      startPolling();
    } else {
      stopPolling();
    }

    return () => {
      stopPolling();
    };
  }, [enabled, startPolling, stopPolling]);

  // Effet pour gérer la visibilité de la page
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopPolling();
      } else if (enabled) {
        startPolling();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled, startPolling, stopPolling]);

  // Nettoyage à la fin
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  return {
    isPolling,
    updates,
    error,
    lastUpdate,
    startPolling,
    stopPolling,
    forceUpdate,
    isEnabled: enabled
  };
};

// Interface mise à jour pour inclure reservationUpdates
interface RealtimeSyncComplete extends RealtimeSync {
  reservationUpdates: any[];
}

// Hook spécialisé pour la carte
export const useMapRealtimeSync = (): RealtimeSyncComplete => {
  const [terrainUpdates, setTerrainUpdates] = useState<TerrainUpdate[]>([]);
  const [reservationUpdates, ] = useState<any[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const lastUpdateRef = useRef<number>(0);
  const pendingUpdatesRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    const checkForUpdates = async () => {
      try {
        const now = Date.now();
        
        // Éviter les requêtes trop fréquentes (minimum 1 seconde pour plus de fluidité)
        if (now - lastUpdateRef.current < 1000) {
          return;
        }
        
        const response = await fetch('http://127.0.0.1:8000/api/terrains/realtime-updates', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setIsConnected(true);
          
          if (data.success && data.updates && data.updates.length > 0) {
            const newUpdates = data.updates.filter((update: TerrainUpdate) => 
              !pendingUpdatesRef.current.has(update.id)
            );
            
            if (newUpdates.length > 0) {
              // Marquer les mises à jour comme en cours
              newUpdates.forEach((update: TerrainUpdate) => {
                pendingUpdatesRef.current.add(update.id);
              });
              
              setTerrainUpdates(newUpdates);
              lastUpdateRef.current = now;
              
              // PLUS DE NOTIFICATIONS TOAST - Mise à jour silencieuse
              // Les changements seront visibles directement sur la carte
              
              // Nettoyer les IDs après un délai
              setTimeout(() => {
                newUpdates.forEach((update: TerrainUpdate) => {
                  pendingUpdatesRef.current.delete(update.id);
                });
              }, 500);
            }
          }
        } else {
          setIsConnected(false);
        }
      } catch (error) {
        // Mode silencieux - pas d'erreurs visibles
        setIsConnected(false);
      }
    };

    // Synchronisation plus rapide (2 secondes) pour plus de fluidité
    intervalId = setInterval(checkForUpdates, 2000);
    
    // Première vérification immédiate
    checkForUpdates();

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return {
    terrainUpdates,
    reservationUpdates,
    isConnected
  };
};

// Hook pour synchronisation gestionnaire (plus fréquent mais sans notifications)
export const useManagerRealtimeSync = (): RealtimeSync => {
  const [terrainUpdates, setTerrainUpdates] = useState<TerrainUpdate[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const lastUpdateRef = useRef<number>(0);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    const checkForUpdates = async () => {
      try {
        const now = Date.now();
        
        // Pour le gestionnaire, plus fréquent (1 seconde minimum)
        if (now - lastUpdateRef.current < 1000) {
          return;
        }
        
        const response = await fetch('/api/manager/terrains/updates', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
        });

        if (response.ok) {
          const data = await response.json();
          setIsConnected(true);
          
          if (data.success && data.updates && data.updates.length > 0) {
            setTerrainUpdates(data.updates);
            lastUpdateRef.current = now;
            
            // PAS de notifications pour le gestionnaire (il fait les changements)
          }
        } else {
          setIsConnected(false);
        }
      } catch (error) {
        setIsConnected(false);
      }
    };

    // Sync gestionnaire plus fréquente (2 secondes)
    intervalId = setInterval(checkForUpdates, 2000);
    checkForUpdates();

    return () => clearInterval(intervalId);
  }, []);

  return {
    terrainUpdates,
    isConnected
  };
}; 