import { log } from './logger';
import { performance } from './performance';
import { toast } from 'react-toastify';

// Gestion des erreurs API
export const handleApiError = (error: any, endpoint: string, context?: Record<string, any>) => {
  const errorMessage = error?.response?.data?.message || error?.message || 'Une erreur est survenue';
  
  // Log l'erreur
  log.error(errorMessage, {
    ...context,
    endpoint,
    status: error?.response?.status,
    data: error?.response?.data,
  });

  // Track l'erreur en performance
  performance.trackApiErrors(error, endpoint, context);

  // Affiche un message d'erreur à l'utilisateur
  toast.error(errorMessage);

  // Renvoie un objet d'erreur formaté
  return {
    error: true,
    message: errorMessage,
    status: error?.response?.status,
    data: error?.response?.data,
  };
};

// Gestion des erreurs de rendu
export const handleRenderError = (error: Error, componentStack: string) => {
  // Log l'erreur
  log.error(error, {
    componentStack,
    type: 'render-error',
  });

  // Track l'erreur en performance
  performance.trackRenderErrors(error, componentStack);

  // Affiche un message d'erreur à l'utilisateur
  toast.error('Une erreur est survenue lors du rendu de la page');

  // Renvoie un objet d'erreur formaté
  return {
    error: true,
    message: error.message,
    componentStack,
  };
};

// Gestion des erreurs de réseau
export const handleNetworkError = (error: Error) => {
  // Log l'erreur
  log.error(error, {
    type: 'network-error',
  });

  // Track l'erreur en performance
  performance.trackApiErrors(error, 'network', {
    type: 'network-error',
  });

  // Affiche un message d'erreur à l'utilisateur
  toast.error('Une erreur de réseau est survenue');

  // Renvoie un objet d'erreur formaté
  return {
    error: true,
    message: error.message,
    type: 'network-error',
  };
};

// Gestion des erreurs de validation
export const handleValidationError = (errors: Record<string, string[]>) => {
  // Log l'erreur
  log.warn('Validation error', {
    errors,
    type: 'validation-error',
  });

  // Affiche les messages d'erreur à l'utilisateur
  Object.entries(errors).forEach(([field, messages]) => {
    messages.forEach(message => {
      toast.warning(`${field}: ${message}`);
    });
  });

  // Renvoie un objet d'erreur formaté
  return {
    error: true,
    errors,
    type: 'validation-error',
  };
};
