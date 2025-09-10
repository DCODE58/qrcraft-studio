const CACHE_NAME = 'qr-studio-v1';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/favicon.ico'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache).catch((error) => {
          console.warn('Service worker cache failed, continuing without offline support:', error);
        });
      })
  );
  // Take control immediately
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Skip non-GET requests and chrome-extension requests
  if (event.request.method !== 'GET' || event.request.url.startsWith('chrome-extension://')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        
        // For network requests, try fetch with error handling
        return fetch(event.request).catch((error) => {
          console.warn('Fetch failed, serving offline fallback if available:', error);
          // Could return a generic offline page here if needed
          throw error;
        });
      })
      .catch((error) => {
        console.warn('Service worker fetch failed:', error);
        // Fallback to network without cache for critical requests
        return fetch(event.request);
      })
  );
});