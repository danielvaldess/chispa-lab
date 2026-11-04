// Tutor adaptativo: seguimiento bayesiano del conocimiento (Bayesian Knowledge Tracing). Aprendizaje automático
// clásico, pequeño y explicable; NO es IA generativa. Estima, por idea científica, la probabilidad de que el niño
// la domine. Corre en el teléfono, sin internet y sin enviar nada. Sin DOM: funciona en el navegador y en Node.
// Los parámetros son valores por defecto de la literatura de BKT, NO están ajustados con datos de niños.
(function (root) {
  'use strict';

  var P0 = 0.25;          // probabilidad inicial de dominar la idea
  var T = 0.15;           // probabilidad de aprender tras cada intento
  var MIN = 0.01, MAX = 0.99;
  var PARAMS = {
    concepto: { G: 0.33, S: 0.10 }, // predicción de tres opciones: adivinar = 1/3
    destreza: { G: 0.20, S: 0.15 }  // lograr el reto con soltura
  };
  var IDS_VOZ = ['voz', 'globo'];   // juegos que dependen del micrófono

  function acotar(p) { return Math.min(MAX, Math.max(MIN, p)); }

  /** Un paso del modelo: evidencia correcta o no, de tipo 'concepto' o 'destreza'. */
  function actualizar(p, correcto, tipo) {
    var q = PARAMS[tipo] || PARAMS.concepto;
    var posterior = correcto
      ? (p * (1 - q.S)) / (p * (1 - q.S) + (1 - p) * q.G)
      : (p * q.S) / (p * q.S + (1 - p) * (1 - q.G));
    return acotar(posterior + (1 - posterior) * T);
  }

  function nuevo() { return { p: P0, pn: 0, pok: 0, hn: 0, hok: 0 }; }

  /**
   * Anota una partida terminada de una idea.
   * partida: { predOk: bool, habil: bool, ignorarDestreza: bool }. Devuelve una entrada nueva.
   */
  function registrar(entrada, partida) {
    var e = entrada ? { p: entrada.p, pn: entrada.pn, pok: entrada.pok, hn: entrada.hn, hok: entrada.hok } : nuevo();
    e.p = actualizar(e.p, !!partida.predOk, 'concepto');
    e.pn += 1; if (partida.predOk) e.pok += 1;
    if (!partida.ignorarDestreza) {
      e.p = actualizar(e.p, !!partida.habil, 'destreza');
      e.hn += 1; if (partida.habil) e.hok += 1;
    }
    e.p = Math.round(e.p * 1000) / 1000;
    return e;
  }

  /** ¿Se ignora la destreza? Con el apoyo de voz, los juegos de micrófono no deben penalizar por la voz. */
  function ignorarDestreza(idNivel, apoyos) {
    return IDS_VOZ.indexOf(idNivel) >= 0 && (apoyos || []).indexOf('voz') >= 0;
  }

  /** Etiqueta para el adulto. */
  function etiqueta(p) { return p < 0.4 ? 'Empezando' : (p < 0.75 ? 'Avanzando' : 'Lo domina'); }

  /**
   * Juego que se recomienda: el de menor dominio entre los jugados que aún no domina;
   * si no hay, el primero sin jugar; si todo está dominado, null.
   */
  function recomendar(maestria, ids) {
    maestria = maestria || {};
    var peor = null, i, e;
    for (i = 0; i < ids.length; i++) {
      e = maestria[ids[i]];
      if (e && e.pn > 0 && e.p < 0.75 && (peor === null || e.p < maestria[peor].p)) peor = ids[i];
    }
    if (peor !== null) return peor;
    for (i = 0; i < ids.length; i++) if (!maestria[ids[i]] || maestria[ids[i]].pn === 0) return ids[i];
    return null;
  }

  /** Multiplicador del margen inicial de un pedido según el dominio (se combina con el ajuste dinámico). */
  function margenInicial(entrada) {
    if (!entrada || entrada.pn < 1) return 1;
    if (entrada.p < 0.35) return 1.25;
    if (entrada.p >= 0.8) return 0.9;
    return 1;
  }

  /** Por qué el tutor piensa eso, en palabras sencillas. */
  function porQue(entrada) {
    if (!entrada || entrada.pn === 0) return 'Todavía no hay partidas.';
    var t = 'Predijo bien ' + entrada.pok + ' de ' + entrada.pn;
    if (entrada.hn > 0) t += ' · lo logró con soltura ' + entrada.hok + ' de ' + entrada.hn;
    return t + '.';
  }

  var TUTOR = {
    P0: P0, T: T, PARAMS: PARAMS, actualizar: actualizar, nuevo: nuevo, registrar: registrar, ignorarDestreza: ignorarDestreza,
    etiqueta: etiqueta, recomendar: recomendar, margenInicial: margenInicial, porQue: porQue
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = TUTOR;
  else root.TUTOR = TUTOR;
})(typeof self !== 'undefined' ? self : this);
