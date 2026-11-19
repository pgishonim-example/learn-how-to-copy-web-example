// Service worker for מערכת פגישונים (PWA)
// Strategy:
//  - Heavy static files (Firebase SDK, CSS, fonts, images): serve INSTANTLY from cache,
//    refresh in the background. These survive even when the app clears its network cache.
//  - HTML pages: network-first (always fresh), fall back to cache when offline.
const CACHE = 'pgishonim-v5';

self.addEventListener('install', function (e) { self.skipWaiting(); });

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

function isStatic(url) {
  return url.indexOf('gstatic.com') !== -1 ||
         /\.(css|woff2?|ttf|otf|png|jpe?g|webp|svg|ico|gif)(\?|$)/i.test(url);
}

self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  var url = e.request.url;

  // Heavy static assets → stale-while-revalidate (instant from cache, refresh in background).
  if (isStatic(url)) {
    e.respondWith(
      caches.open(CACHE).then(function (cache) {
        return cache.match(e.request).then(function (hit) {
          var net = fetch(e.request).then(function (resp) {
            if (resp && (resp.ok || resp.type === 'opaque')) { cache.put(e.request, resp.clone()); }
            return resp;
          }).catch(function () { return hit; });
          return hit || net;
        });
      })
    );
    return;
  }

  // Leave other cross-origin requests (e.g. Firestore API) alone.
  if (url.indexOf(self.location.origin) !== 0) return;

  // Our own HTML/pages → network-first (always fresh), cache as offline fallback.
  e.respondWith(
    fetch(e.request).then(function (resp) {
      if (resp && resp.ok) { var copy = resp.clone(); caches.open(CACHE).then(function (c) { c.put(e.request, copy); }); }
      return resp;
    }).catch(function () { return caches.match(e.request); })
  );
});
