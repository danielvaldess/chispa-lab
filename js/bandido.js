// Bandido de Thompson (Beta-Bernoulli): decide, por jugador, si la pista llega de una vez («directo») o si Chispa
// pregunta primero y la pista se pide después («socratico»). Aprende de si la siguiente partida de esa misma idea
// sale bien (acierta la predicción o logra la tercera estrella). Corre en el teléfono, sin internet. Sin DOM.
// Es una aproximación: otros factores también influyen en la siguiente partida.
(function (root) {
  'use strict';

  var BRAZOS = ['directo', 'socratico'];

  function nuevo() {
    return { directo: { a: 1, b: 1 }, socratico: { a: 1, b: 1 }, ultimo: {} };
  }

  /** Número aleatorio con distribución normal (Box-Muller). `rnd` devuelve valores en (0,1). */
  function normal(rnd) {
    var u = Math.max(1e-12, rnd()), v = rnd();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }

  /** Muestra de una Gamma(forma, 1) con el método de Marsaglia y Tsang. */
  function gamma(forma, rnd) {
    if (forma < 1) return gamma(forma + 1, rnd) * Math.pow(Math.max(1e-12, rnd()), 1 / forma);
    var d = forma - 1 / 3, c = 1 / Math.sqrt(9 * d), x, v, u;
    for (var i = 0; i < 100; i++) {
      do { x = normal(rnd); v = 1 + c * x; } while (v <= 0);
      v = v * v * v; u = rnd();
      if (u < 1 - 0.0331 * x * x * x * x || Math.log(Math.max(1e-12, u)) < 0.5 * x * x + d * (1 - v + Math.log(v))) return d * v;
    }
    return d;
  }

  /** Muestra de una Beta(a, b). */
  function beta(a, b, rnd) {
    var x = gamma(a, rnd), y = gamma(b, rnd);
    return x / (x + y);
  }

  /** Elige el brazo con la mayor muestra de su Beta. `rnd` es opcional (Math.random por defecto). */
  function elegir(estado, rnd) {
    rnd = rnd || Math.random;
    var mejor = BRAZOS[0], mv = -1;
    BRAZOS.forEach(function (br) {
      var s = estado[br] || { a: 1, b: 1 }, m = beta(s.a, s.b, rnd);
      if (m > mv) { mv = m; mejor = br; }
    });
    return mejor;
  }

  /** Premio o castigo para un brazo. Devuelve un estado nuevo; la suma a+b se acota para que el modelo siga adaptándose. */
  function premiar(estado, brazo, bien) {
    if (BRAZOS.indexOf(brazo) < 0) return estado;
    var n = copiar(estado), s = n[brazo];
    if (bien) s.a += 1; else s.b += 1;
    if (s.a + s.b > 40) { s.a = s.a * 0.9; s.b = s.b * 0.9; }
    s.a = Math.round(s.a * 100) / 100; s.b = Math.round(s.b * 100) / 100;
    return n;
  }

  function copiar(e) {
    return { directo: { a: e.directo.a, b: e.directo.b }, socratico: { a: e.socratico.a, b: e.socratico.b }, ultimo: JSON.parse(JSON.stringify(e.ultimo || {})) };
  }

  /** Limpia un estado leído del almacenamiento. */
  function normalizar(e, idsNiveles) {
    var n = nuevo();
    if (!e || typeof e !== 'object') return n;
    BRAZOS.forEach(function (br) {
      var s = e[br];
      if (s && isFinite(Number(s.a)) && isFinite(Number(s.b)) && Number(s.a) >= 0.1 && Number(s.b) >= 0.1 && Number(s.a) <= 1e4 && Number(s.b) <= 1e4) n[br] = { a: Number(s.a), b: Number(s.b) };
    });
    var u = e.ultimo && typeof e.ultimo === 'object' ? e.ultimo : {};
    (idsNiveles || []).forEach(function (id) { if (BRAZOS.indexOf(u[id]) >= 0) n.ultimo[id] = u[id]; });
    return n;
  }

  /** Media de éxito estimada de cada brazo (para mostrar al adulto). */
  function medias(estado) {
    var o = {};
    BRAZOS.forEach(function (br) { var s = estado[br]; o[br] = s.a / (s.a + s.b); });
    return o;
  }

  var BANDIDO = { BRAZOS: BRAZOS, nuevo: nuevo, elegir: elegir, premiar: premiar, normalizar: normalizar, medias: medias, beta: beta };
  if (typeof module !== 'undefined' && module.exports) module.exports = BANDIDO;
  else root.BANDIDO = BANDIDO;
})(typeof self !== 'undefined' ? self : this);
