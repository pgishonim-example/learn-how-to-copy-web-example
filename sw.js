// Service worker for מערכת פגישונים (PWA)
const CACHE = 'pgishonim-v2';

self.addEventListener('install', function (e) {
  self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

// Network-first for our OWN pages only. Never touch cross-origin requests
// (Firebase / gstatic / Firestore) — let the browser handle those directly.
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  if (e.request.url.indexOf(self.location.origin) !== 0) return;
  e.respondWith(
    fetch(e.request)
      .then(function (resp) {
        if (resp && resp.ok) {
          var copy = resp.clone();
          caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
        }
        return resp;
      })
      .catch(function () { return caches.match(e.request); })
  );
});
