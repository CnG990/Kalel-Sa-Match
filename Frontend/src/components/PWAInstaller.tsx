import React, { useEffect, useState } from 'react';
import { Download, X, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const PWAInstaller: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Détecter iOS
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(ios);

    // Détecter si déjà installé en mode standalone
    const standalone = window.matchMedia('(display-mode: standalone)').matches;
    setIsStandalone(standalone);

    // Écouter l'événement beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Afficher le prompt après 3 secondes si pas déjà installé
      setTimeout(() => {
        if (!standalone && !localStorage.getItem('pwa-install-dismissed')) {
          setShowInstallPrompt(true);
        }
      }, 3000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Détecter l'installation réussie
    window.addEventListener('appinstalled', () => {
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
      console.log('PWA installée avec succès');
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('Installation acceptée');
    } else {
      console.log('Installation refusée');
    }
    
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  // Ne pas afficher si déjà installé ou si pas de prompt disponible
  if (isStandalone || (!deferredPrompt && !isIOS) || !showInstallPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50">
      <div className="bg-white rounded-lg shadow-xl border p-4 animate-slide-up">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-orange-500 rounded-lg flex items-center justify-center">
              <Smartphone className="w-6 h-6 text-white" />
            </div>
          </div>
          
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">
              Installer l'application
            </h3>
            <p className="text-xs text-gray-600 mb-3">
              {isIOS 
                ? "Ajoutez cette app à votre écran d'accueil pour un accès rapide"
                : "Installez notre app pour une meilleure expérience et un accès hors ligne"
              }
            </p>
            
            <div className="flex space-x-2">
              {isIOS ? (
                <div className="text-xs text-gray-500">
                  Appuyez sur <span className="font-semibold">⎋</span> puis "Ajouter à l'écran d'accueil"
                </div>
              ) : (
                <button
                  onClick={handleInstallClick}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-gradient-to-r from-green-600 to-orange-500 text-white text-xs font-medium rounded-md hover:from-green-700 hover:to-orange-600 transition-colors"
                >
                  <Download className="w-3 h-3" />
                  <span>Installer</span>
                </button>
              )}
              
              <button
                onClick={handleDismiss}
                className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors"
              >
                Plus tard
              </button>
            </div>
          </div>
          
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PWAInstaller; 