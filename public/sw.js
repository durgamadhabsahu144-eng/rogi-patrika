const CACHE_NAME = 'rogi-patrika-v2';
const SHELL_URLS = ['/', '/index.html'];

// --- Install: cache the app shell -------------------------------------------
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_URLS))
  );
  self.skipWaiting();
});

// --- Activate: clean old caches ---------------------------------------------
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// --- Fetch: cache-first for same-origin assets, network for API -------------
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle GET requests
  if (request.method !== 'GET') return;

  // Never cache API / Convex calls — let them fail so offline-queue logic runs
  const url = new URL(request.url);
  if (
    url.hostname.includes('convex.cloud') ||
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/convex')
  ) {
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;

      return fetch(request)
        .then((response) => {
          // Only cache successful same-origin responses
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone before caching (response body can only be consumed once)
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });

          return response;
        })
        .catch(() => {
          // Offline fallback: for navigation requests, return cached index.html
          // so the React SPA can render its offline routes
          if (request.mode === 'navigate') {
            return caches.match('/index.html');
          }
          // For other requests (images, fonts, etc.), just fail
          return new Response('Offline', { status: 503, statusText: 'Offline' });
        });
    })
  );
});

// --- Background Sync: notify open tabs to flush their Dexie queues ----------
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-offline-queue') {
    event.waitUntil(notifyClients());
  }
});

async function notifyClients() {
  const clients = await self.clients.matchAll({ includeUncontrolled: true });
  clients.forEach((client) => client.postMessage({ type: 'SYNC_OFFLINE_QUEUE' }));
}
