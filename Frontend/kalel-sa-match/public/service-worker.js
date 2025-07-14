self.addEventListener('push', function(event) {
  const data = event.data.json()
  
  const notification = {
    title: data.title || 'Notification',
    body: data.message,
    icon: '/icon.png',
    data: data.data || {}
  }

  event.waitUntil(
    self.registration.showNotification(notification.title, notification)
  )
})

self.addEventListener('notificationclick', function(event) {
  event.notification.close()
  
  // Ouvrir la page correspondante
  event.waitUntil(
    clients.matchAll({
      type: 'window'
    }).then(function(clientList) {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i]
        if (client.url === '/' && 'focus' in client) {
          return client.focus()
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/')
      }
    })
  )
})

// Gérer la mise à jour du service worker
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open('kalesamatch-v1').then(function(cache) {
      return cache.addAll([
        '/',
        '/index.html',
        '/manifest.json',
        '/icon.png',
        '/favicon.ico'
      ])
    })
  )
})

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      return response || fetch(event.request)
    })
  )
})
