// Service Worker pour Amanah GO PWA
const CACHE_NAME = 'amanah-go-v1';
const RUNTIME_CACHE = 'amanah-go-runtime';

// Fichiers à mettre en cache au premier chargement
const PRECACHE_URLS = [
  '/',
  '/voyageur',
  '/expediteur',
  '/search',
  '/static/i18n.js',
  '/static/lang-switcher.js',
  '/static/locales/fr.json',
  '/static/locales/ar.json',
  '/static/locales/en.json',
  'https://cdn.tailwindcss.com',
  'https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css'
];

// Installation du Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Installation...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Pré-cache des fichiers...');
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activation du Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activation...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            console.log('[SW] Suppression ancien cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Stratégie de cache: Network First, fallback sur Cache
self.addEventListener('fetch', (event) => {
  // Ignorer les requêtes non-GET
  if (event.request.method !== 'GET') {
    return;
  }

  // Ignorer les requêtes API (toujours network)
  if (event.request.url.includes('/api/')) {
    return;
  }

  event.respondWith(
    caches.open(RUNTIME_CACHE).then((cache) => {
      return fetch(event.request)
        .then((response) => {
          // Mettre en cache la réponse pour utilisation future
          if (response.status === 200) {
            cache.put(event.request, response.clone());
          }
          return response;
        })
        .catch(() => {
          // Si network fail, essayer le cache
          return caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            
            // Si pas en cache non plus, retourner page offline
            if (event.request.mode === 'navigate') {
              return caches.match('/');
            }
            
            return new Response('Offline - Pas de connexion internet', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({
                'Content-Type': 'text/plain'
              })
            });
          });
        });
    })
  );
});

// Gestion des notifications push (optionnel)
self.addEventListener('push', (event) => {
  console.log('[SW] Push reçu:', event);
  
  const options = {
    body: event.data ? event.data.text() : 'Nouvelle notification Amanah GO',
    icon: '/static/icons/icon-192x192.png',
    badge: '/static/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    tag: 'amanah-notification',
    actions: [
      {
        action: 'open',
        title: 'Ouvrir'
      },
      {
        action: 'close',
        title: 'Fermer'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Amanah GO', options)
  );
});

// Gestion du clic sur notification
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Clic notification:', event);
  event.notification.close();

  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Sync en arrière-plan (optionnel)
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  
  if (event.tag === 'sync-data') {
    event.waitUntil(
      // Logique de synchronisation ici
      Promise.resolve()
    );
  }
});

console.log('[SW] Service Worker Amanah GO chargé ✅');
