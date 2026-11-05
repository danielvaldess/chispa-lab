// Red primero (para recibir cambios) y caché como respaldo sin conexión.
var VERSION = 'chispalab-v23';
var ARCHIVOS = ['./', 'index.html', 'css/style.css', 'css/juego.css?v=12', 'css/perfil.css?v=8', 'css/finales.css?v=4', 'js/ajustes.js?v=3', 'js/voz.js?v=1', 'js/tutor.js?v=1', 'js/margen.js?v=1', 'js/diagnostico.js?v=3', 'js/bandido.js?v=1', 'js/pistas.js?v=3', 'js/descubrimientos.js?v=1', 'js/metodo.js?v=1', 'js/mezclas.js?v=1', 'js/densidad.js?v=1', 'js/planta.js?v=1', 'js/libre.js?v=4', 'js/color-ml.js?v=1', 'js/experimento.js?v=1', 'js/niveles/hilo.js?v=2', 'js/niveles/col.js?v=1', 'js/niveles/huevo.js?v=1', 'js/niveles/volcan.js?v=1', 'js/clase.js?v=1', 'js/agrupar.js?v=1', 'js/perfiles.js?v=11', 'js/perfil.js?v=7', 'js/alumnos.js?v=2', 'js/vendor/qrcode.min.js', 'js/vendor/jsQR.min.js', 'js/panel.js?v=10', 'js/finales.js?v=1', 'js/juego.js?v=16', 'js/niveles/globo.js?v=1', 'js/niveles/luz.js?v=1', 'js/niveles/burbujas.js?v=1', 'js/camara.js?v=1', 'js/inicio.js?v=1', 'js/fisica.js?v=2', 'js/dsp.js', 'manifest.webmanifest', 'icon.svg', 'icon-180.png', 'icon-192.png', 'icon-512.png'];

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
