// Service worker: guarda la app para jugar sin conexión. Sube VERSION al cambiar archivos.
const VERSION = 'chispalab-v1';
const ARCHIVOS = [
  './',
  'index.html',
  'manifest.webmanifest',
  'icon.svg',
  'css/styles.css?v=1',
  'js/main.js?v=1',
  'js/i18n.js?v=1',
  'js/ui.js?v=1',
  'js/audio.js?v=1',
  'js/progreso.js?v=1',
  'js/physics.js?v=1',
  'js/pitch.js?v=1',
  'js/microfono.js?v=1',
  'js/levels/rampa.js?v=1',
  'js/levels/pendulo.js?v=1',
  'js/levels/botella.js?v=1',
];

self.addEventListener('install', (evento) => {
  evento.waitUntil(
    caches.open(VERSION).then((cache) => cache.addAll(ARCHIVOS.map((a) => new Request(a, { cache: 'no-cache' })))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (evento) => {
  evento.waitUntil(
    caches.keys()
      .then((claves) => Promise.all(claves.filter((c) => c !== VERSION).map((c) => caches.delete(c))))
      .then(() => self.clients.claim()));
});

// Primero la red (para ver cambios nuevos); sin conexión, la copia guardada.
self.addEventListener('fetch', (evento) => {
  if (evento.request.method !== 'GET' || new URL(evento.request.url).origin !== location.origin) return;
  evento.respondWith(
    fetch(evento.request, { cache: 'no-cache' })
      .then((respuesta) => {
        if (respuesta.ok) {
          const copia = respuesta.clone();
          caches.open(VERSION).then((cache) => cache.put(evento.request, copia));
        }
        return respuesta;
      })
      .catch(() => caches.match(evento.request, { ignoreSearch: false }).then((r) => r || caches.match('index.html'))));
});
