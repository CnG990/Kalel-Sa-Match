import { createLogger } from 'next-logger';
import { captureException, captureMessage, configureScope } from '@sentry/nextjs';

// Configuration du logger
const logger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: process.env.NODE_ENV === 'production' ? 'json' : 'pretty',
});

// Configuration de Sentry
export function initializeSentry() {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    configureScope((scope) => {
      scope.setUser({
        id: localStorage.getItem('user_id'),
        email: localStorage.getItem('user_email'),
      });
    });
  }
}

// Fonctions de log personnalisées
export const log = {
  // Logs d'information
  info: (message: string, context?: Record<string, any>) => {
    logger.info(message, context);
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      captureMessage(message, {
        level: 'info',
        extra: context,
      });
    }
  },

  // Logs de débogage
  debug: (message: string, context?: Record<string, any>) => {
    logger.debug(message, context);
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      captureMessage(message, {
        level: 'debug',
        extra: context,
      });
    }
  },

  // Logs d'avertissement
  warn: (message: string, context?: Record<string, any>) => {
    logger.warn(message, context);
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      captureMessage(message, {
        level: 'warning',
        extra: context,
      });
    }
  },

  // Logs d'erreur
  error: (error: Error | string, context?: Record<string, any>) => {
    logger.error(error, context);
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      captureException(error instanceof Error ? error : new Error(error as string), {
        extra: context,
      });
    }
  },
};
