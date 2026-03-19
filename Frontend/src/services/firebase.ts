import { initializeApp, FirebaseError } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  signOut, 
  type User as FirebaseUser,
  onAuthStateChanged
} from 'firebase/auth';
import { getMessaging, getToken, onMessage, type Messaging } from 'firebase/messaging';

// Configuration Firebase via variables d'environnement Vite
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Provider Google
const googleProvider = new GoogleAuthProvider();

// Types pour l'authentification
export interface AuthUser {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  isGoogleUser: boolean;
  token: string;
}

// Service d'authentification Firebase
export class FirebaseAuthService {
  private static instance: FirebaseAuthService;
  
  static getInstance(): FirebaseAuthService {
    if (!FirebaseAuthService.instance) {
      FirebaseAuthService.instance = new FirebaseAuthService();
    }
    return FirebaseAuthService.instance;
  }

  // Connexion avec Google
  async signInWithGoogle(): Promise<AuthUser> {
    try {
      return await this.signInWithPopupSafe();
    } catch (error) {
      if (this.isPopupBlockedError(error)) {
        console.warn('Popup bloquée, basculement vers signInWithRedirect');
        return await this.signInWithRedirectFlow();
      }

      console.error('Erreur connexion Google:', error);
      throw new Error('La connexion avec Google a échoué');
    }
  }

  // Déconnexion
  async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Erreur déconnexion:', error);
      throw new Error('La déconnexion a échoué');
    }
  }

  // Observer les changements d'état d'authentification
  onAuthStateChanged(callback: (user: AuthUser | null) => void): () => void {
    return onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        try {
          const token = await firebaseUser.getIdToken();
          callback(this.formatAuthUser(firebaseUser, token));
        } catch (error) {
          console.error('Erreur token:', error);
          callback(null);
        }
      } else {
        callback(null);
      }
    });
  }

  // Obtenir l'utilisateur courant
  getCurrentUser(): AuthUser | null {
    const firebaseUser = auth.currentUser;
    if (firebaseUser) {
      return {
        uid: firebaseUser.uid,
        email: firebaseUser.email!,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        isGoogleUser: true,
        token: '' // Token obtenu via getIdToken()
      };
    }
    return null;
  }

  // Obtenir le token ID
  async getIdToken(): Promise<string | null> {
    const firebaseUser = auth.currentUser;
    if (firebaseUser) {
      return await firebaseUser.getIdToken();
    }
    return null;
  }

  private async signInWithPopupSafe(): Promise<AuthUser> {
    const result = await signInWithPopup(auth, googleProvider);
    const firebaseUser = result.user;
    const token = await firebaseUser.getIdToken();
    return this.formatAuthUser(firebaseUser, token);
  }

  private async signInWithRedirectFlow(): Promise<AuthUser> {
    await signInWithRedirect(auth, googleProvider);
    const redirectResult = await getRedirectResult(auth);

    if (!redirectResult || !redirectResult.user) {
      throw new Error('La connexion via redirection a échoué');
    }

    const token = await redirectResult.user.getIdToken();
    return this.formatAuthUser(redirectResult.user, token);
  }

  private formatAuthUser(user: FirebaseUser, token: string): AuthUser {
    return {
      uid: user.uid,
      email: user.email!,
      displayName: user.displayName,
      photoURL: user.photoURL,
      isGoogleUser: true,
      token,
    };
  }

  private isPopupBlockedError(error: unknown): boolean {
    return error instanceof FirebaseError && error.code === 'auth/popup-blocked';
  }
}

// Exporter le service
export const firebaseAuthService = FirebaseAuthService.getInstance();

// Exporter l'instance auth pour les hooks React
export { auth };

// ==================== FIREBASE CLOUD MESSAGING (FCM) ====================

let messaging: Messaging | null = null;

// Initialiser FCM (uniquement dans le navigateur avec support)
const initMessaging = (): Messaging | null => {
  if (messaging) return messaging;
  
  if (typeof window === 'undefined' || !('Notification' in window)) {
    console.warn('Notifications non supportées dans cet environnement');
    return null;
  }
  
  try {
    messaging = getMessaging(app);
    return messaging;
  } catch (error) {
    console.error('Erreur initialisation FCM:', error);
    return null;
  }
};

// Service de notifications push
export class PushNotificationService {
  private static instance: PushNotificationService;
  private fcmToken: string | null = null;

  static getInstance(): PushNotificationService {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService();
    }
    return PushNotificationService.instance;
  }

  // Demander la permission et obtenir le token FCM
  async requestPermissionAndGetToken(): Promise<string | null> {
    const msg = initMessaging();
    if (!msg) return null;

    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.log('Permission notifications refusée');
        return null;
      }

      // VAPID key depuis les variables d'environnement
      const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
      
      const token = await getToken(msg, { 
        vapidKey,
        serviceWorkerRegistration: await navigator.serviceWorker.register('/firebase-messaging-sw.js')
      });
      
      this.fcmToken = token;
      console.log('FCM Token obtenu:', token?.substring(0, 20) + '...');
      return token;
    } catch (error) {
      console.error('Erreur obtention token FCM:', error);
      return null;
    }
  }

  // Écouter les messages en premier plan
  onForegroundMessage(callback: (payload: any) => void): () => void {
    const msg = initMessaging();
    if (!msg) return () => {};

    return onMessage(msg, (payload) => {
      console.log('Message reçu en premier plan:', payload);
      callback(payload);
    });
  }

  // Obtenir le token actuel
  getToken(): string | null {
    return this.fcmToken;
  }

  // Enregistrer le token sur le backend
  async registerTokenOnBackend(token: string, userId: number): Promise<boolean> {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/notifications/register-device/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({ fcm_token: token, user_id: userId })
      });
      return response.ok;
    } catch (error) {
      console.error('Erreur enregistrement token backend:', error);
      return false;
    }
  }
}

export const pushNotificationService = PushNotificationService.getInstance();
