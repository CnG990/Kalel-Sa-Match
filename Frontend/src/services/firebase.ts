import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  type User as FirebaseUser,
  onAuthStateChanged
} from 'firebase/auth';

// Configuration Firebase (remplacez avec vos vraies valeurs)
const firebaseConfig = {
  apiKey: "AIzaSyYOUR_API_KEY",
  authDomain: "kalelsamatch.firebaseapp.com",
  projectId: "kalelsamatch",
  storageBucket: "kalelsamatch.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
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
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;
      
      // Obtenir le token ID pour le backend
      const token = await firebaseUser.getIdToken();
      
      return {
        uid: firebaseUser.uid,
        email: firebaseUser.email!,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        isGoogleUser: true,
        token
      };
    } catch (error) {
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
          callback({
            uid: firebaseUser.uid,
            email: firebaseUser.email!,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            isGoogleUser: true,
            token
          });
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
}

// Exporter le service
export const firebaseAuthService = FirebaseAuthService.getInstance();

// Exporter l'instance auth pour les hooks React
export { auth };
