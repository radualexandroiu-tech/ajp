// Agenda Juridica - Service Worker v4
// Schimbarea numelui cache-ului forteaza stergerea versiunii vechi

const CACHE = 'agenda-juridica-v4';
const FILES = [
  './index.html',
  './manifest.json',
  './icon-152.png',
  './icon-192.png',
  './icon-512.png',
];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(cache) {
      return cache.addAll(FILES);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE; })
            .map(function(k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(e) {
  var url = e.request.url;
  if (url.indexOf('vercel.app') !== -1 ||
      url.indexOf('/api/') !== -1 ||
      url.indexOf('portalquery.just.ro') !== -1) {
    return;
  }
  e.respondWith(
    caches.match(e.request).then(function(cached) {
      return cached || fetch(e.request);
    })
  );
});
