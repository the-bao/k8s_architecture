/**
 * Service Worker for K8s Architect PWA
 * Provides offline caching for the app
 */
const CACHE_NAME = 'k8s-architect-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/progress-store.js',
  '/js/game.js',
  '/js/canvas-engine.js',
  '/js/animations.js',
  '/js/interactions.js',
  '/js/modules/architecture.js',
  '/js/modules/pod-lifecycle.js',
  '/js/modules/network.js',
  '/js/modules/storage-k8s.js',
  '/js/modules/security.js',
  '/js/app.js',
  '/manifest.json'
];

// Install: cache assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch: serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request).then((response) => {
        // Don't cache non-successful responses
        if (!response || response.status !== 200) return response;

        // Clone and cache the response
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });

        return response;
      }).catch(() => {
        // Offline fallback for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      });
    })
  );
});