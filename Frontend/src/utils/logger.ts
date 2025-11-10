/**
 * Logger utilitaire pour remplacer console.log/error/warn
 * En production, les logs peuvent être désactivés ou envoyés à un service externe
 */

const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = {
  log: (...args: any[]) => {
    if (isDevelopment) {
      console.log('[LOG]', ...args);
    }
  },
  
  error: (...args: any[]) => {
    // Les erreurs sont toujours loggées, même en production
    console.error('[ERROR]', ...args);
    // TODO: En production, envoyer à un service de monitoring (Sentry, LogRocket, etc.)
  },
  
  warn: (...args: any[]) => {
    if (isDevelopment) {
      console.warn('[WARN]', ...args);
    }
  },
  
  info: (...args: any[]) => {
    if (isDevelopment) {
      console.info('[INFO]', ...args);
    }
  },
  
  debug: (...args: any[]) => {
    if (isDevelopment) {
      console.debug('[DEBUG]', ...args);
    }
  }
};

