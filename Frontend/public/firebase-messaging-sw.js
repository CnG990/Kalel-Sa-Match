// Firebase Messaging Service Worker
// Ce fichier doit être à la racine du domaine pour recevoir les notifications en arrière-plan

importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

// Configuration Firebase (doit correspondre à celle de l'app)
firebase.initializeApp({
  apiKey: self.FIREBASE_API_KEY || 'AIzaSyDYourApiKey',
  authDomain: self.FIREBASE_AUTH_DOMAIN || 'your-project.firebaseapp.com',
  projectId: self.FIREBASE_PROJECT_ID || 'your-project-id',
  storageBucket: self.FIREBASE_STORAGE_BUCKET || 'your-project.appspot.com',
  messagingSenderId: self.FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: self.FIREBASE_APP_ID || '1:123456789:web:abc123'
});

const messaging = firebase.messaging();

// Gestion des messages en arrière-plan
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Message reçu en arrière-plan:', payload);

  const notificationTitle = payload.notification?.title || 'Kalel Sa Match';
  const notificationOptions = {
    body: payload.notification?.body || 'Vous avez une nouvelle notification',
    icon: '/icon-192x192.png',
    badge: '/icon-72x72.png',
    tag: payload.data?.tag || 'default',
    data: payload.data,
    vibrate: [200, 100, 200],
    actions: [
      { action: 'open', title: 'Voir' },
      { action: 'close', title: 'Fermer' }
    ]
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Gestion du clic sur la notification
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Clic sur notification:', event);
  
  event.notification.close();

  if (event.action === 'close') return;

  // Ouvrir l'URL appropriée selon le type de notification
  const urlToOpen = event.notification.data?.url || '/admin/subscriptions';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Chercher une fenêtre déjà ouverte
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus();
          client.navigate(urlToOpen);
          return;
        }
      }
      // Sinon ouvrir une nouvelle fenêtre
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Installation du service worker
self.addEventListener('install', (event) => {
  console.log('[firebase-messaging-sw.js] Service Worker installé');
  self.skipWaiting();
});

// Activation du service worker
self.addEventListener('activate', (event) => {
  console.log('[firebase-messaging-sw.js] Service Worker activé');
  event.waitUntil(clients.claim());
});
