// Minimal, conservative service worker for installability + offline fallback.
// Pages are NETWORK-FIRST (never cached) so writing is always fresh; only the static
// shell (manifest, icons, offline page) is precached. Bump CACHE to invalidate.
const CACHE = 'oyparaploo-shell-v1';
const SHELL = [
  '/offline.html',
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-512-maskable.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  // Navigations: network-first, fall back to the offline page (no page caching -> never stale).
  if (req.mode === 'navigate') {
    event.respondWith(fetch(req).catch(() => caches.match('/offline.html')));
    return;
  }
  // Static shell assets: serve from cache if precached, else just fetch (no extra caching).
  event.respondWith(caches.match(req).then((hit) => hit || fetch(req)));
});
