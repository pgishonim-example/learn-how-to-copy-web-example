// Service worker for מערכת פגישונים (PWA)
const CACHE = 'pgishonim-v1';

self.addEventListener('install', function (e) {
  self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  e.waitUntil(self.clients.claim());
});

// Network-first for same-origin GETs, falling back to cache when offline.
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then(function (resp) {
        if (resp && resp.ok && e.request.url.indexOf(self.location.origin) === 0) {
          var copy = resp.clone();
          caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
        }
        return resp;
      })
      .catch(function () { return caches.match(e.request); })
  );
});
