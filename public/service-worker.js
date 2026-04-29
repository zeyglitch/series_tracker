const CACHE_NAME = 'manwha-tracker-v1'
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
]

// Installation du service worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Cache opened')
      return cache.addAll(urlsToCache)
    })
  )
})

// Activation du service worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Cache supprimé:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
})

// Stratégie: Network first, fallback to cache
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache les réponses
        if (event.request.method === 'GET') {
          const clonedResponse = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clonedResponse)
          })
        }
        return response
      })
      .catch(() => {
        // Fallback au cache si offline
        return caches.match(event.request)
      })
  )
})

// Notification de mise à jour
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})
