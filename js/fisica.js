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

  // ---------- Caída libre con resistencia del aire ----------
  /** Dónde se juega: g en m/s² y cuánto aire hay (1 = como en la Tierra; la Luna no tiene; Marte tiene muy poco). */
  var PLANETAS = {
    tierra: { nombre: 'Tierra', g: 9.81, aire: 1 },
    luna: { nombre: 'Luna', g: 1.62, aire: 0 },
    marte: { nombre: 'Marte', g: 3.71, aire: 0.01 }
  };
  /** Objetos con su masa (kg) y su velocidad terminal en la Tierra (m/s), valores APROXIMADOS: de ahí sale el roce con el aire, kd = m·g/vt². */
  var OBJETOS_CAIDA = {
    martillo: { nombre: 'Martillo', emoji: '🔨', m: 1.0, vt: 80 },
    bola: { nombre: 'Bola de acero', emoji: '⚫', m: 0.5, vt: 90 },
    pluma: { nombre: 'Pluma', emoji: '🪶', m: 0.003, vt: 1.0 },
    papel: { nombre: 'Papel plano', emoji: '📄', m: 0.005, vt: 1.2 },
    papelBola: { nombre: 'Papel arrugado', emoji: '📰', m: 0.005, vt: 7 }
  };

  function kdDe(obj) { return obj.m * G / (obj.vt * obj.vt); }

  /** Un paso de caída: devuelve { y, v } nuevos (y = metros recorridos hacia abajo, v = m/s). `aire` 0 es el vacío. */
  function pasoCaida(est, obj, g, aire, dt) {
    var a = g - (kdDe(obj) * aire / obj.m) * est.v * Math.abs(est.v);
    var v = est.v + a * dt;
    return { y: est.y + v * dt, v: v };
  }

  /** Tiempo que tarda un objeto en caer una altura h (m) en un lugar con gravedad g y cantidad de aire `aire`. */
  function tiempoCaida(obj, h, g, aire) {
    var est = { y: 0, v: 0 }, t = 0, dt = 0.001;
    while (est.y < h && t < 600) { est = pasoCaida(est, obj, g, aire, dt); t += dt; }
    return t;
  }

  var FIS = {
    G: G, aceleracionRampa: aceleracionRampa, tiempoRodar: tiempoRodar,
    pasoPendulo: pasoPendulo, periodoSimulado: periodoSimulado,
    PLANETAS: PLANETAS, OBJETOS_CAIDA: OBJETOS_CAIDA, pasoCaida: pasoCaida, tiempoCaida: tiempoCaida
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = FIS;
  else root.FIS = FIS;
})(typeof self !== 'undefined' ? self : this);
