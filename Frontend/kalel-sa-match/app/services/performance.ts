import { Performance } from '@sentry/nextjs';
import { Performance as PerformanceMetrics } from 'web-vitals';

// Configuration de la surveillance des performances
export const performance = {
  // Mesure des métriques clés
  measure: (name: string, start: number, end: number) => {
    const duration = end - start;
    Performance.measure(name, duration);
  },

  // Surveillance des métriques Web Vitals
  trackWebVitals: (metric: PerformanceMetrics) => {
    Performance.trackWebVitals(metric);
  },

  // Surveillance des erreurs de rendu
  trackRenderErrors: (error: Error, componentStack: string) => {
    Performance.trackError(error, {
      componentStack,
      tags: {
        type: 'render-error',
      },
    });
  },

  // Surveillance des erreurs d'API
  trackApiErrors: (error: Error, endpoint: string, context?: Record<string, any>) => {
    Performance.trackError(error, {
      tags: {
        type: 'api-error',
        endpoint,
      },
      extra: context,
    });
  },

  // Surveillance des temps de chargement
  trackLoadingTimes: (name: string, time: number) => {
    Performance.trackLoadingTime(name, time);
  },
};

// Initialisation de la surveillance des performances
export function initializePerformance() {
  // Configuration des métriques clés
  Performance.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    tracesSampleRate: 1.0,
    profilesSampleRate: 1.0,
    integrations: [
      new Performance.Integrations.Http(),
      new Performance.Integrations.Breadcrumbs(),
    ],
  });

  // Configuration des métriques Web Vitals
  PerformanceMetrics.init({
    onPerfEntry: (entry) => {
      Performance.trackWebVitals(entry);
    },
  });
}
