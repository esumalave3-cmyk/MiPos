const CACHE_NAME = 'mipos-v6-NOCACHE-HTML';
const ASSETS_TO_CACHE = ['./manifest.json', './icon.svg'];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      console.log('Cache v6 abierto');
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.filter(function(name) {
          return name !== CACHE_NAME;
        }).map(function(name) {
          console.log('Borrando caché viejo:', name);
          return caches.delete(name);
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', function(event) {
  const url = event.request.url;
  
  // NUNCA cachear el index.html - siempre fresco desde el servidor
  if (url.endsWith('index.html') || url.endsWith('/')) {
    event.respondWith(
      fetch(event.request, { cache: 'no-store' }).catch(function() {
        return caches.match(event.request);
      })
    );
    return;
  }
  
  // NUNCA cachear licencias.json - siempre fresco
  if (url.includes('licencias.json')) {
    event.respondWith(fetch(event.request, { cache: 'no-store' }));
    return;
  }
  
  // Para lo demás (manifest, icon, sw): usar caché
  event.respondWith(
    caches.match(event.request).then(function(response) {
      return response || fetch(event.request);
    })
  );
});
