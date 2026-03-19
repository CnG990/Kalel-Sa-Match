interface AnalyticsEvent {
  name: string;
  category?: string;
  properties?: Record<string, any>;
  value?: number;
  userId?: number;
}

interface PerformanceMetric {
  name: string;
  value: number;
  context?: string;
  metadata?: Record<string, any>;
}

class AnalyticsService {
  private sessionId: string;
  private userId: number | null = null;
  private queue: AnalyticsEvent[] = [];
  private isOnline = navigator.onLine;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.initializeEventListeners();
    this.trackPageView();
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeEventListeners(): void {
    // Tracker les changements de connexion
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.flushQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    // Tracker les erreurs JavaScript
    window.addEventListener('error', (event) => {
      this.trackError({
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack
      });
    });

    // Tracker les erreurs de promesses non gérées
    window.addEventListener('unhandledrejection', (event) => {
      this.trackError({
        message: event.reason?.message || 'Unhandled Promise Rejection',
        stack: event.reason?.stack,
        type: 'unhandled_promise'
      });
    });

    // Tracker la performance
    if ('performance' in window) {
      window.addEventListener('load', () => {
        setTimeout(() => this.trackPerformanceMetrics(), 1000);
      });
    }
  }

  setUserId(userId: number): void {
    this.userId = userId;
  }

  /**
   * Tracker un événement
   */
  track(event: AnalyticsEvent): void {
    const enrichedEvent = {
      ...event,
      userId: this.userId,
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      referrer: document.referrer,
      userAgent: navigator.userAgent
    };

    if (this.isOnline) {
      this.sendEvent(enrichedEvent as any);
    } else {
      this.queue.push(enrichedEvent as any);
      this.saveToLocalStorage();
    }
  }

  /**
   * Tracker une vue de page
   */
  trackPageView(page?: string): void {
    this.track({
      name: 'page_view',
      category: 'navigation',
      properties: {
        page: page || window.location.pathname,
        title: document.title
      }
    });
  }

  /**
   * Tracker une action utilisateur
   */
  trackUserAction(action: string, properties?: Record<string, any>): void {
    this.track({
      name: action,
      category: 'user_action',
      properties
    });
  }

  /**
   * Tracker une conversion (réservation, paiement, etc.)
   */
  trackConversion(type: string, value: number, properties?: Record<string, any>): void {
    this.track({
      name: `conversion_${type}`,
      category: 'conversion',
      value,
      properties
    });
  }

  /**
   * Tracker une erreur
   */
  trackError(error: any): void {
    this.track({
      name: 'javascript_error',
      category: 'error',
      properties: {
        message: error.message,
        filename: error.filename,
        lineno: error.lineno,
        stack: error.stack,
        type: error.type || 'javascript'
      }
    });
  }

  /**
   * Tracker les métriques de performance
   */
  trackPerformanceMetrics(): void {
    if (!('performance' in window)) return;

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const paint = performance.getEntriesByType('paint');

    // Temps de chargement de la page
    if (navigation) {
      this.trackPerformance('page_load_time', navigation.loadEventEnd - navigation.fetchStart);
      this.trackPerformance('dom_content_loaded', navigation.domContentLoadedEventEnd - navigation.fetchStart);
      this.trackPerformance('first_byte', navigation.responseStart - navigation.fetchStart);
    }

    // First Paint et First Contentful Paint
    paint.forEach((entry) => {
      this.trackPerformance(entry.name.replace('-', '_'), entry.startTime);
    });

    // Core Web Vitals
    this.trackCoreWebVitals();
  }

  /**
   * Tracker une métrique de performance
   */
  trackPerformance(name: string, value: number, context?: string): void {
    const metric: PerformanceMetric = {
      name,
      value,
      context,
      metadata: {
        sessionId: this.sessionId,
        userId: this.userId,
        timestamp: new Date().toISOString()
      }
    };

    this.sendPerformanceMetric(metric);
  }

  /**
   * Tracker les Core Web Vitals
   */
  private trackCoreWebVitals(): void {
    // Largest Contentful Paint (LCP)
    if ('getLCP' in window) {
      (window as any).getLCP((lcp: any) => {
        this.trackPerformance('largest_contentful_paint', lcp.value);
      });
    }

    // First Input Delay (FID)
    if ('getFID' in window) {
      (window as any).getFID((fid: any) => {
        this.trackPerformance('first_input_delay', fid.value);
      });
    }

    // Cumulative Layout Shift (CLS)
    if ('getCLS' in window) {
      (window as any).getCLS((cls: any) => {
        this.trackPerformance('cumulative_layout_shift', cls.value);
      });
    }
  }

  /**
   * Envoyer un événement au serveur
   */
  private async sendEvent(event: AnalyticsEvent): Promise<void> {
    try {
      const response = await fetch('/api/analytics/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(event)
      });

      if (!response.ok) {
        throw new Error(`Analytics failed: ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to send analytics event:', error);
      // Ajouter à la queue pour retry
      this.queue.push(event);
      this.saveToLocalStorage();
    }
  }

  /**
   * Envoyer une métrique de performance
   */
  private async sendPerformanceMetric(metric: PerformanceMetric): Promise<void> {
    try {
      const response = await fetch('/api/analytics/performance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(metric)
      });

      if (!response.ok) {
        throw new Error(`Performance tracking failed: ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to send performance metric:', error);
    }
  }

  /**
   * Vider la queue des événements en attente
   */
  private async flushQueue(): Promise<void> {
    if (this.queue.length === 0) return;

    const events = [...this.queue];
    this.queue = [];

    try {
      const response = await fetch('/api/analytics/events/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ events })
      });

      if (response.ok) {
        this.clearLocalStorage();
      } else {
        // Remettre les événements dans la queue
        this.queue.unshift(...events);
      }
    } catch (error) {
      console.error('Failed to flush analytics queue:', error);
      this.queue.unshift(...events);
    }
  }

  /**
   * Sauvegarder la queue dans le localStorage
   */
  private saveToLocalStorage(): void {
    try {
      localStorage.setItem('analytics_queue', JSON.stringify(this.queue));
    } catch (error) {
      console.error('Failed to save analytics queue:', error);
    }
  }

  /**
   * Charger la queue depuis le localStorage
   */
  private (): void {
    try {
      const stored = localStorage.getItem('analytics_queue');
      if (stored) {
        this.queue = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load analytics queue:', error);
    }
  }

  /**
   * Vider le localStorage
   */
  private clearLocalStorage(): void {
    localStorage.removeItem('analytics_queue');
  }
}

// Instance globale
const analytics = new AnalyticsService();

// Événements prédéfinis pour faciliter l'usage
export const trackEvents = {
  // Navigation
  pageView: (page?: string) => analytics.trackPageView(page),
  
  // Authentification
  login: (method: string) => analytics.trackUserAction('login', { method }),
  logout: () => analytics.trackUserAction('logout'),
  register: (role: string) => analytics.trackUserAction('register', { role }),
  
  // Réservations
  reservationStarted: (terrainId: number) => analytics.trackUserAction('reservation_started', { terrainId }),
  reservationCompleted: (reservationId: number, amount: number) => analytics.trackConversion('reservation', amount, { reservationId }),
  reservationCancelled: (reservationId: number) => analytics.trackUserAction('reservation_cancelled', { reservationId }),
  
  // Paiements
  paymentStarted: (method: string, amount: number) => analytics.trackUserAction('payment_started', { method, amount }),
  paymentCompleted: (method: string, amount: number) => analytics.trackConversion('payment', amount, { method }),
  paymentFailed: (method: string, error: string) => analytics.trackUserAction('payment_failed', { method, error }),
  
  // Terrains
  terrainViewed: (terrainId: number) => analytics.trackUserAction('terrain_viewed', { terrainId }),
  terrainFavorited: (terrainId: number) => analytics.trackUserAction('terrain_favorited', { terrainId }),
  terrainUnfavorited: (terrainId: number) => analytics.trackUserAction('terrain_unfavorited', { terrainId }),
  
  // Carte
  mapViewed: () => analytics.trackUserAction('map_viewed'),
  locationRequested: () => analytics.trackUserAction('location_requested'),
  routeCalculated: (mode: string, distance: number) => analytics.trackUserAction('route_calculated', { mode, distance }),
  
  // Performance
  performance: (name: string, value: number, context?: string) => analytics.trackPerformance(name, value, context),
  
  // Erreurs
  error: (error: any) => analytics.trackError(error)
};

export default analytics; 