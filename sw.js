// Red primero (para recibir cambios) y caché como respaldo sin conexión.
var VERSION = 'chispalab-v9';
var ARCHIVOS = ['./', 'index.html', 'css/style.css', 'css/juego.css?v=5', 'css/perfil.css?v=5', 'css/finales.css?v=2', 'js/ajustes.js?v=3', 'js/tutor.js?v=1', 'js/perfiles.js?v=4', 'js/perfil.js?v=4', 'js/panel.js?v=4', 'js/finales.js?v=1', 'js/juego.js?v=9', 'js/niveles/globo.js?v=1', 'js/niveles/luz.js?v=1', 'js/niveles/burbujas.js?v=1', 'js/camara.js?v=1', 'js/inicio.js?v=1', 'js/fisica.js', 'js/dsp.js', 'manifest.webmanifest', 'icon.svg', 'icon-180.png', 'icon-192.png', 'icon-512.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(VERSION).then(function (c) { return c.addAll(ARCHIVOS); }));
  self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== VERSION; }).map(function (k) { return caches.delete(k); }));
  }));
  self.clients.claim();
});

self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then(function (r) {
      var copia = r.clone();
      caches.open(VERSION).then(function (c) { c.put(e.request, copia); });
      return r;
    }).catch(function () { return caches.match(e.request); })
  );
});
