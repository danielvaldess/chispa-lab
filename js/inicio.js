'use strict';
// Arranque: se carga al final, cuando ya están registrados todos los niveles (NIVELES.push en js/niveles/*).

window.addEventListener('hashchange', ruta);

// Solo se avisa cuando no hay internet, y para tranquilizar: el juego funciona igual.
function pintarEstado() { $('estado').textContent = navigator.onLine ? '' : 'Sin internet: todo funciona igual'; }
window.addEventListener('online', pintarEstado);
window.addEventListener('offline', pintarEstado);
pintarEstado();

PERF.entrar();

if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('sw.js').catch(function () {});
}
