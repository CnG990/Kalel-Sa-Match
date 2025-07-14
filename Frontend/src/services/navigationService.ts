import { toast } from 'react-hot-toast';

export interface NavigationState {
  isNavigating: boolean;
  currentStep: string;
  distanceRemaining: string;
  timeRemaining: string;
  trafficCondition: 'smooth' | 'moderate' | 'heavy';
}

export interface Terrain {
  id: number;
  nom: string;
  latitude: number;
  longitude: number;
  isReservedByUser?: boolean;
  reservationTime?: string;
  prix_heure?: number;
}

class NavigationService {
  private watchPositionId: number | null = null;
  private navigationCallback?: (state: NavigationState) => void;
  private GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  // Démarrer la navigation vers un terrain
  async startNavigation(
    terrain: Terrain, 
    userLocation: { latitude: number; longitude: number },
    callback: (state: NavigationState) => void
  ): Promise<boolean> {
    this.navigationCallback = callback;

    try {
      // Utiliser Google Directions API pour l'itinéraire optimisé
      const directionsUrl = `https://maps.googleapis.com/maps/api/directions/json?` +
        `origin=${userLocation.latitude},${userLocation.longitude}&` +
        `destination=${terrain.latitude},${terrain.longitude}&` +
        `mode=driving&` +
        `traffic_model=best_guess&` +
        `departure_time=now&` +
        `key=${this.GOOGLE_MAPS_API_KEY}`;

      const response = await fetch(directionsUrl);
      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const leg = route.legs[0];

        // Mettre à jour l'état initial
        const initialState: NavigationState = {
          isNavigating: true,
          currentStep: this.cleanHtmlInstructions(leg.steps[0]?.html_instructions || 'Démarrage...'),
          distanceRemaining: leg.distance.text,
          timeRemaining: leg.duration_in_traffic?.text || leg.duration.text,
          trafficCondition: this.getTrafficCondition(
            leg.duration_in_traffic?.value, 
            leg.duration.value
          )
        };

        callback(initialState);

        // Démarrer le suivi GPS
        this.startRealTimeTracking(terrain);

        toast.success(`🧭 Navigation démarrée vers ${terrain.nom}`, {
          icon: '🚗',
          duration: 4000
        });

        return true;
      }

      toast.error('Impossible de calculer l\'itinéraire');
      return false;
    } catch (error) {
      console.error('Erreur navigation:', error);
      toast.error('Erreur lors du démarrage de la navigation');
      return false;
    }
  }

  // Suivi GPS en temps réel
  private startRealTimeTracking(terrain: Terrain) {
    if (!navigator.geolocation) {
      toast.error('Géolocalisation non disponible');
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    };

    this.watchPositionId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        
        // Calculer la distance restante
        const distance = this.calculateDistance(
          latitude, longitude, 
          terrain.latitude, terrain.longitude
        );

        // Mettre à jour l'état de navigation
        if (this.navigationCallback) {
          this.navigationCallback({
            isNavigating: true,
            currentStep: `Distance: ${distance < 1 ? Math.round(distance * 1000) + 'm' : distance.toFixed(1) + 'km'}`,
            distanceRemaining: distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`,
            timeRemaining: this.calculateETA(distance),
            trafficCondition: 'smooth'
          });
        }

        // Vérifier si arrivé (50 mètres)
        if (distance < 0.05) {
          this.stopNavigation();
          toast.success(`🎉 Vous êtes arrivé à ${terrain.nom}!`, {
            icon: '🏁',
            duration: 6000
          });
        }
      },
      (error) => {
        console.error('Erreur géolocalisation:', error);
        toast.error('Erreur de géolocalisation');
      },
      options
    );
  }

  // Arrêter la navigation
  stopNavigation() {
    if (this.watchPositionId) {
      navigator.geolocation.clearWatch(this.watchPositionId);
      this.watchPositionId = null;
    }

    if (this.navigationCallback) {
      this.navigationCallback({
        isNavigating: false,
        currentStep: '',
        distanceRemaining: '',
        timeRemaining: '',
        trafficCondition: 'smooth'
      });
    }

    toast.success('Navigation arrêtée');
  }

  // Utilitaires
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Rayon de la Terre en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private calculateETA(distanceKm: number): string {
    // Vitesse moyenne 30 km/h en ville
    const averageSpeed = 30;
    const timeHours = distanceKm / averageSpeed;
    const minutes = Math.round(timeHours * 60);
    
    if (minutes < 1) return '< 1 min';
    if (minutes < 60) return `${minutes} min`;
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}min`;
  }

  private getTrafficCondition(trafficTime?: number, normalTime?: number): 'smooth' | 'moderate' | 'heavy' {
    if (!trafficTime || !normalTime) return 'smooth';
    const ratio = trafficTime / normalTime;
    if (ratio > 1.5) return 'heavy';
    if (ratio > 1.2) return 'moderate';
    return 'smooth';
  }

  private cleanHtmlInstructions(html: string): string {
    return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ');
  }

  // Générer des marqueurs différenciés pour terrains réservés
  static createTerrainMarker(terrain: Terrain): HTMLElement {
    const isReserved = terrain.isReservedByUser;
    
    const markerElement = document.createElement('div');
    markerElement.className = 'terrain-marker';
    
    // Style selon le statut de réservation
    const baseStyle = `
      width: ${isReserved ? '50px' : '40px'};
      height: ${isReserved ? '50px' : '40px'};
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: ${isReserved ? '20px' : '16px'};
      position: relative;
      transition: all 0.3s ease;
    `;

    if (isReserved) {
      // Terrain réservé - Vert avec animation
      markerElement.style.cssText = baseStyle + `
        background: linear-gradient(45deg, #22c55e, #16a34a);
        animation: pulse-reserved 2s infinite;
      `;
      markerElement.innerHTML = '⭐';
      
      // Ajouter l'animation CSS
      if (!document.getElementById('terrain-marker-styles')) {
        const style = document.createElement('style');
        style.id = 'terrain-marker-styles';
        style.textContent = `
          @keyframes pulse-reserved {
            0% { transform: scale(1); box-shadow: 0 4px 12px rgba(34, 197, 94, 0.4); }
            50% { transform: scale(1.1); box-shadow: 0 6px 20px rgba(34, 197, 94, 0.8); }
            100% { transform: scale(1); box-shadow: 0 4px 12px rgba(34, 197, 94, 0.4); }
          }
          
          .terrain-marker:hover {
            transform: scale(1.1) !important;
          }
        `;
        document.head.appendChild(style);
      }
    } else {
      // Terrain normal - Bleu
      markerElement.style.cssText = baseStyle + `
        background: linear-gradient(45deg, #3b82f6, #2563eb);
      `;
      markerElement.innerHTML = '🏟️';
    }

    return markerElement;
  }

  // Créer popup enrichi pour terrain
  static createTerrainPopup(terrain: Terrain): string {
    const isReserved = terrain.isReservedByUser;
    
    return `
      <div style="padding: 16px; min-width: 280px; font-family: system-ui, sans-serif;">
        <div style="display: flex; items-center; gap: 8px; margin-bottom: 12px;">
          <span style="font-size: 24px;">${isReserved ? '⭐' : '🏟️'}</span>
          <h3 style="margin: 0; color: #1f2937; font-size: 18px; font-weight: 600;">
            ${terrain.nom}
          </h3>
        </div>
        
        ${isReserved ? `
          <div style="background: linear-gradient(135deg, #dcfce7, #bbf7d0); padding: 12px; border-radius: 8px; margin-bottom: 12px; border-left: 4px solid #22c55e;">
            <div style="color: #15803d; font-weight: 600; margin-bottom: 4px;">
              ✅ Votre réservation confirmée
            </div>
            <div style="color: #166534; font-size: 14px;">
              Créneaux: ${terrain.reservationTime || 'Voir dans vos réservations'}
            </div>
          </div>
        ` : ''}
        
        ${terrain.prix_heure ? `
          <div style="margin-bottom: 12px;">
            <span style="background: linear-gradient(45deg, #f59e0b, #d97706); color: white; padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: 600;">
              💰 ${terrain.prix_heure.toLocaleString()} FCFA/h
            </span>
          </div>
        ` : ''}
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px;">
          <button onclick="window.startNavigationTo(${terrain.id})" 
            style="background: linear-gradient(45deg, #3b82f6, #2563eb); color: white; border: none; padding: 10px 12px; border-radius: 8px; cursor: pointer; font-size: 12px; font-weight: 600; transition: all 0.2s;">
            🧭 Naviguer
          </button>
          <button onclick="window.callTerrain(${terrain.id})" 
            style="background: linear-gradient(45deg, #10b981, #059669); color: white; border: none; padding: 10px 12px; border-radius: 8px; cursor: pointer; font-size: 12px; font-weight: 600; transition: all 0.2s;">
            📞 Appeler
          </button>
        </div>
        
        <button onclick="window.shareTerrainLocation(${terrain.id})" 
          style="width: 100%; background: linear-gradient(45deg, #6366f1, #4f46e5); color: white; border: none; padding: 10px; border-radius: 8px; cursor: pointer; font-size: 12px; font-weight: 600; transition: all 0.2s;">
          📍 Partager l'emplacement
        </button>
      </div>
    `;
  }
}

export const navigationService = new NavigationService();
export default navigationService; 