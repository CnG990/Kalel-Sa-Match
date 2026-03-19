const CACHE_NAME = 'terrains-synthetiques-v1.0.0';
const STATIC_CACHE = 'static-v1.0.0';
const DYNAMIC_CACHE = 'dynamic-v1.0.0';

// Ressources à mettre en cache immédiatement
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/logo.png',
  '/terrain-foot.jpg',
  '/offline.html',
  // Ajouter d'autres assets critiques
];

// URLs des API à mettre en cache
const API_CACHE_PATTERNS = [
  /\/api\/terrains/,
  /\/api\/user\/profile/,
  /\/api\/reservations\/my-reservations/
];

// Installation du Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: Installed successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Installation failed', error);
      })
  );
});

// Activation du Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activated successfully');
        return self.clients.claim();
      })
  );
});

// Intercepter les requêtes
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorer les requêtes non-GET
  if (request.method !== 'GET') return;

  // Ignorer les requêtes vers d'autres domaines (CDN, APIs externes)
  if (url.origin !== self.location.origin && !url.pathname.startsWith('/api')) return;

  // Stratégie Cache First pour les assets statiques
  if (isStaticAsset(request)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Stratégie Network First pour les APIs
  if (isAPIRequest(request)) {
    event.respondWith(networkFirstWithCache(request));
    return;
  }

  // Stratégie Stale While Revalidate pour les pages
  event.respondWith(staleWhileRevalidate(request));
});

// Vérifier si c'est un asset statique
function isStaticAsset(request) {
  const url = new URL(request.url);
  return url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot|ico)$/);
}

// Vérifier si c'est une requête API
function isAPIRequest(request) {
  const url = new URL(request.url);
  return url.pathname.startsWith('/api/') || 
         API_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname));
}

// Stratégie Cache First
async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('Cache First failed:', error);
    return getOfflinePage();
  }
}

// Stratégie Network First avec cache de secours
async function networkFirstWithCache(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('Network failed, trying cache:', request.url);
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Retourner une réponse d'erreur JSON pour les APIs
    return new Response(JSON.stringify({
      success: false,
      message: 'Pas de connexion internet',
      offline: true
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 503
    });
  }
}

// Stratégie Stale While Revalidate
async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cachedResponse = await cache.match(request);

  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => {
    return getOfflinePage();
  });

  return cachedResponse || fetchPromise;
}

// Page hors ligne
async function getOfflinePage() {
  const cache = await caches.open(STATIC_CACHE);
  return cache.match('/offline.html') || new Response('Pas de connexion internet', {
    status: 503,
    headers: { 'Content-Type': 'text/plain' }
  });
}

// Gestion des messages du client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CACHE_URLS') {
    const urlsToCache = event.data.payload;
    caches.open(DYNAMIC_CACHE).then((cache) => {
      cache.addAll(urlsToCache);
    });
  }
});

// Synchronisation en arrière-plan
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  console.log('Service Worker: Background sync triggered');
  
  // Synchroniser les données en attente
  try {
    // Exemple: envoyer les réservations en attente
    const pendingReservations = await getFromIndexedDB('pendingReservations');
    for (const reservation of pendingReservations) {
      await fetch('/api/reservations', {
        method: 'POST',
        body: JSON.stringify(reservation),
        headers: { 'Content-Type': 'application/json' }
      });
    }
    await clearFromIndexedDB('pendingReservations');
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Helpers pour IndexedDB (simplifié)
async function getFromIndexedDB(storeName) {
  // Implémentation simplifiée - utiliser idb library en production
  return [];
}

async function clearFromIndexedDB(storeName) {
  // Implémentation simplifiée
  return true;
}

// Push notifications
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/logo.png',
    badge: '/icons/badge.png',
    vibrate: [100, 50, 100],
    data: data.data,
    actions: [
      {
        action: 'view',
        title: 'Voir',
        icon: '/icons/view.png'
      },
      {
        action: 'dismiss',
        title: 'Ignorer',
        icon: '/icons/dismiss.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Gestion des clics sur les notifications
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow(event.notification.data.url || '/')
    );
  }
}); 