// Agenda Juridică – Service Worker
// Permite folosirea aplicației offline după prima încărcare

const CACHE_NAME = 'agenda-juridica-v1';
const ASSETS = [
  './index.html',
  './manifest.json',
  './icon-152.png',
  './icon-192.png',
  './icon-512.png',
];

// Instalare: pune fișierele în cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// Activare: șterge cache-urile vechi
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Fetch: răspunde din cache dacă există, altfel din rețea
// IMPORTANT: cererile către backend-ul Vercel (api/portal) merg DIRECT la rețea
// nu prin cache, ca sincronizarea să funcționeze întotdeauna cu date live
self.addEventListener('fetch', (event) => {
  const url = event.request.url;

  // Lasă cererile API (Vercel backend) să meargă direct la rețea
  if (
    url.includes('vercel.app') ||
    url.includes('/api/') ||
    url.includes('portalquery.just.ro')
  ) {
    return; // browser gestionează direct
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request);
    })
  );
});
