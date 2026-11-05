// Margen que aprende cada niño: aprendizaje automático clásico (estimación bayesiana) que corre en el teléfono, sin internet.
// Para cada juego de precisión (rampa, péndulo) Chispa estima el error típico del niño, modelado como una distribución log-normal
// del error relativo a la tolerancia base (la de su edad y sus apoyos), y ajusta el margen para que acierte cerca del 70 % de las veces:
// ni tan fácil que se aburra ni tan difícil que se frustre (zona de flujo; ver docs/ia-etica.md).
// - Punto de partida (prior): la tolerancia base por edad, como si el niño promedio acertara el 70 % con ella. Se corrige solo con sus datos.
// - Nunca imposible: el margen queda entre ×0,6 y ×3 de la base. Se puede apagar con la IA de Chispa (entonces vale ×1 y no aprende).
// - Se guarda solo en el teléfono, no viaja en el QR y no se usa para calificar. Funciones puras, sin DOM.
(function (root) {
  'use strict';

  var OBJETIVO = 0.7;                    // proporción de aciertos que se busca
  var Z = 0.5244;                        // cuantil normal de 0,70
  var SIGMA0 = 0.6;                      // incertidumbre inicial del logaritmo del error relativo
  var N0 = 4;                            // el punto de partida pesa como 4 intentos: un solo mal intento no lo mueve de golpe
  var MU0 = -Z * SIGMA0;                 // con este prior, el margen inicial es exactamente ×1 (la base por edad)
  var MIN = 0.6, MAX = 3;                // recorte del multiplicador: nunca imposible, nunca regalado
  var PISO = 0.05;                       // el error relativo no baja de 0,05 (evita log de cero)
  var MAX_N = 500;

  function nuevo() { return { n: 0, s: 0, q: 0 }; }

  /** Estado válido o uno nuevo: números finitos y acotados. */
  function normalizar(m) {
    if (!m || typeof m !== 'object') return nuevo();
    var n = Math.floor(Number(m.n)), s = Number(m.s), q = Number(m.q);
    if (!(n >= 0) || n > MAX_N || !isFinite(s) || !isFinite(q) || q < 0 || Math.abs(s) > 1e5 || q > 1e6) return nuevo();
    return { n: n, s: Math.round(s * 1e6) / 1e6, q: Math.round(q * 1e6) / 1e6 };
  }

  /** Media y desviación del logaritmo del error relativo, mezclando el prior con lo observado. */
  function estimar(m) {
    m = normalizar(m);
    var n = m.n, media = n ? m.s / n : 0;
    var ss = Math.max(0, m.q - (n ? m.s * m.s / n : 0));                 // suma de cuadrados respecto a la media observada
    var mu = (N0 * MU0 + m.s) / (N0 + n);
    var var2 = (N0 * SIGMA0 * SIGMA0 + ss + (n ? N0 * n / (N0 + n) * (media - MU0) * (media - MU0) : 0)) / (N0 + n);
    return { mu: mu, sigma: Math.sqrt(Math.max(var2, 1e-6)) };
  }

  /** Multiplicador de la tolerancia base que da ≈ 70 % de aciertos, entre ×0,6 y ×3. */
  function mult(m) {
    var e = estimar(m), v = Math.exp(e.mu + Z * e.sigma);
    return Math.round(Math.min(MAX, Math.max(MIN, v)) * 1000) / 1000;
  }

  /** Anota un intento: error y tolerancia base en las mismas unidades. Devuelve un estado nuevo. */
  function registrar(m, error, tolBase) {
    var e = Number(error), b = Number(tolBase);
    m = normalizar(m);
    if (!isFinite(e) || !isFinite(b) || b <= 0 || e < 0) return m;
    var x = Math.log(Math.max(e / b, PISO));
    if (m.n >= MAX_N) return m;
    return normalizar({ n: m.n + 1, s: m.s + x, q: m.q + x * x });
  }

  /** Texto para un adulto: qué aprendió Chispa de este niño en este juego. */
  function describir(m) {
    m = normalizar(m);
    if (m.n < 3) return 'Todavía está empezando a conocer a este niño en este juego (' + m.n + (m.n === 1 ? ' intento' : ' intentos') + ').';
    var k = mult(m);
    return 'Con ' + m.n + ' intentos, Chispa ajustó el margen a ×' + String(k).replace('.', ',') + ' de la base para su edad: ' +
      (k > 1.05 ? 'un poco más amplio, para que acierte más a menudo.' : (k < 0.95 ? 'un poco más exigente, porque ya acierta con facilidad.' : 'casi igual que la base.'));
  }

  var MARGEN = { OBJETIVO: OBJETIVO, MIN: MIN, MAX: MAX, MU0: MU0, SIGMA0: SIGMA0, N0: N0, nuevo: nuevo, normalizar: normalizar, estimar: estimar, mult: mult, registrar: registrar, describir: describir };
  if (typeof module !== 'undefined' && module.exports) module.exports = MARGEN;
  else root.MARGEN = MARGEN;
})(typeof self !== 'undefined' ? self : this);
