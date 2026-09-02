const CACHE_NAME = 'rogi-patrika-shell-v1';

// Add any other static shell assets you know the exact hashed filenames for
// at build time (or generate this list with a build plugin like
// vite-plugin-pwa, which does this automatically).
const APP_SHELL = ['/', '/index.html', '/manifest.json'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

// Cache-first for GET requests, with runtime caching of new same-origin
// assets as they're fetched (so the built JS/CSS bundles get cached on
// first visit without hardcoding their hashed filenames here).
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  // Never cache API calls — those should hit the network or fail explicitly
  // so the app's offline-queue logic can catch the failure.
  if (request.url.includes('/api/')) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match('/index.html'));
    })
  );
});

// Background Sync: fired by the browser once connectivity returns, for any
// tag registered via reg.sync.register(). We don't touch IndexedDB directly
// here — we notify open tabs, which flush the Dexie queue themselves.
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-offline-queue') {
    event.waitUntil(notifyClients());
  }
});

async function notifyClients() {
  const clients = await self.clients.matchAll({ includeUncontrolled: true });
  clients.forEach((client) => client.postMessage({ type: 'SYNC_OFFLINE_QUEUE' }));
}
