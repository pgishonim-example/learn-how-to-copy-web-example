// Service worker for מערכת פגישונים.
//  - HTML / pages: ALWAYS fetched fresh from the network (no-store) so any update
//    shows up immediately, with no manual refresh. A copy is kept only for offline fallback.
//  - Heavy static assets (Firebase SDK, fonts, images, CSS): served fast from cache,
//    refreshed in the background.
const CACHE = 'pg-cache-v7';

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

  // Heavy static assets → cache-first (fast), refresh in background.
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

  // Leave cross-origin requests (e.g. the Firebase database) to the browser.
  if (url.indexOf(self.location.origin) !== 0) return;

  // Our own HTML / pages → ALWAYS fresh from the network (bypass every cache);
  // keep a copy only as an offline fallback.
  e.respondWith(
    fetch(e.request, { cache: 'no-store' }).then(function (resp) {
      if (resp && resp.ok) { var copy = resp.clone(); caches.open(CACHE).then(function (c) { c.put(e.request, copy); }); }
      return resp;
    }).catch(function () { return caches.match(e.request); })
  );
});
