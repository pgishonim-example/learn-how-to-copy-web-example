// KILL-SWITCH service worker.
// Older versions of this app cached the pages (including the pre-gate login page),
// which made devices keep showing a stale version. This SW purges ALL caches,
// unregisters itself, and reloads open windows so every device drops the old
// cached pages and loads the current pages fresh from the network.
self.addEventListener('install', function (e) { self.skipWaiting(); });

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys()
      .then(function (keys) { return Promise.all(keys.map(function (k) { return caches.delete(k); })); })
      .then(function () { return self.registration.unregister(); })
      .then(function () { return self.clients.matchAll({ type: 'window' }); })
      .then(function (clients) {
        clients.forEach(function (c) { try { c.navigate(c.url); } catch (err) {} });
      })
      .catch(function () {})
  );
});

// Never serve from cache — always let the request go to the network.
self.addEventListener('fetch', function (e) { /* pass-through to network */ });
