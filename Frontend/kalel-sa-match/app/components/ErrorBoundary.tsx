'use client'

import { Component, ErrorInfo, ReactNode } from 'react';
import { log } from '../services/logger';
import { handleRenderError } from '../services/errorHandler';
import { toast } from 'react-toastify';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  errorStack?: string;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Met à jour l'état pour afficher le message d'erreur
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log l'erreur
    log.error(error, {
      componentStack: errorInfo.componentStack,
      type: 'boundary-error',
    });

    // Track l'erreur
    handleRenderError(error, errorInfo.componentStack);

    // Affiche un message d'erreur
    toast.error('Une erreur est survenue. Veuillez réessayer plus tard.');
  }

  public render() {
    if (this.state.hasError) {
      // Affiche une page d'erreur personnalisée
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full space-y-8">
            <div className="text-center">
              <h1 className="text-4xl font-extrabold text-red-600">Erreur</h1>
              <p className="mt-2 text-base text-gray-600">
                Une erreur est survenue. Veuillez réessayer plus tard ou contacter le support.
              </p>
            </div>
            <div className="mt-8">
              <button
                onClick={() => window.location.reload()}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Réessayer
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
