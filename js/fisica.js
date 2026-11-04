// Modelos físicos del juego, sin DOM: corren en el navegador y en Node (para pruebas).
(function (root) {
  'use strict';
  var G = 9.81;

  // Bola sobre una rampa con fricción de rodadura simple (μ). Ángulo en radianes.
  function aceleracionRampa(th, mu) { return G * (Math.sin(th) - mu * Math.cos(th)); }

  function tiempoRodar(th, d, mu) {
    var a = aceleracionRampa(th, mu);
    return a > 0 ? Math.sqrt(2 * d / a) : Infinity;
  }

  // Péndulo simple, integración semi-implícita. est = {th, w}. No depende de la masa.
  function pasoPendulo(est, L, dt) {
    est.w -= (G / L) * Math.sin(est.th) * dt;
    est.th += est.w * dt;
  }

  // Período medido entre dos cruces descendentes por cero, como lo hace el juego.
  function periodoSimulado(L, th0, dt) {
    var e = { th: th0, w: 0 }, t = 0, cruces = [], prev = e.th;
    while (cruces.length < 2 && t < 60) {
      pasoPendulo(e, L, dt);
      t += dt;
      if (prev > 0 && e.th <= 0) cruces.push(t - dt + dt * prev / (prev - e.th));
      prev = e.th;
    }
    return cruces.length === 2 ? cruces[1] - cruces[0] : null;
  }

  var FIS = {
    G: G, aceleracionRampa: aceleracionRampa, tiempoRodar: tiempoRodar,
    pasoPendulo: pasoPendulo, periodoSimulado: periodoSimulado
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = FIS;
  else root.FIS = FIS;
})(typeof self !== 'undefined' ? self : this);
