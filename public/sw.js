const CACHE_NAME = 'qr-studio-v2';
const STATIC_ASSETS = [
  // Do NOT cache '/': caching stale index.html can cause white screens after deploys
  '/manifest.json',
  '/favicon.ico',
  '/qr-studio-icon-192.png',
  '/qr-studio-icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .catch((error) => {
        console.warn('Service worker pre-cache failed, continuing without full offline support:', error);
      })
  );
  // Take control immediately
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    // Clean up old caches and take control
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Skip non-GET requests and chrome-extension requests
  if (event.request.method !== 'GET' || event.request.url.startsWith('chrome-extension://')) {
    return;
  }

  const request = event.request;

  // Network-first for HTML navigations to avoid stale index.html
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .catch((error) => {
          console.warn('Navigation fetch failed, trying cache:', error);
          // We intentionally don't cache '/', but if an index.html exists in cache, use it
          return caches.match('/index.html');
        })
    );
    return;
  }

  // Cache-first for static assets; network fallback and opportunistic caching
  event.respondWith(
    caches.match(request)
      .then((cached) => {
        if (cached) return cached;
        return fetch(request)
          .then((response) => {
            const url = new URL(request.url);
            const isStatic = STATIC_ASSETS.includes(url.pathname) || /\.(png|svg|ico|jpg|jpeg|webp|gif|css)$/i.test(url.pathname);
            if (isStatic && response.status === 200) {
              const clone = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, clone)).catch(() => {});
            }
            return response;
          })
          .catch((error) => {
            console.warn('Fetch failed and no cache available:', error);
            throw error;
          });
      })
  );
});