// Invernadero: una maceta con una semilla de frijol y un MODELO CUALITATIVO Y SIMPLIFICADO de qué necesita para crecer (no predice centímetros reales).
// Sin agua la semilla no germina; con agua germina aunque no haya luz; con agua y luz crece sana; sin luz crece larga, delgada y pálida y se agota;
// sin agua una planta que ya creció se marchita. Un día por paso. Funciones puras, sin DOM ni internet.
(function (root) {
  'use strict';

  var DIAS_GERMINAR = 2;       // días con agua para que la semilla germine
  var ALTURA_MAX = 22;         // cm, con luz y agua (crecimiento que se frena al llegar)
  var CRECE_LUZ = 1.4;         // cm por día al principio, con luz
  var CRECE_OSCURO = 2.0;      // cm por día en la oscuridad (se estira buscando luz)
  var RESERVA_OSCURO = 8;      // días que la semilla puede crecer a oscuras con sus reservas
  var DIAS_SIN_AGUA = 3;       // días sin agua antes de marchitarse una planta ya germinada

  function nueva() {
    return { dia: 0, estado: 'semilla', altura: 0, diasHumedos: 0, diasSecos: 0, reserva: RESERVA_OSCURO, vivo: true, historial: [0] };
  }
  function copiar(p) { var o = {}, k; for (k in p) if (Object.prototype.hasOwnProperty.call(p, k)) o[k] = p[k]; o.historial = p.historial.slice(); return o; }

  /**
   * Pasa un día. agua y luz son true o false para ese día. estados: 'semilla' (seca), 'germino', 'sana', 'palida' (larga y delgada, sin luz), 'marchita'.
   * No modifica la planta original.
   */
  function paso(p, agua, luz) {
    var q = copiar(p);
    q.dia += 1;
    if (!q.vivo) { q.historial.push(q.altura); return q; }
    if (q.estado === 'semilla') {
      if (agua) q.diasHumedos += 1;
      if (q.diasHumedos >= DIAS_GERMINAR) { q.estado = 'germino'; q.altura = 0.5; }
      q.historial.push(q.altura); return q;
    }
    // ya germinó
    if (!agua) {
      q.diasSecos += 1;
      if (q.diasSecos >= DIAS_SIN_AGUA) { q.vivo = false; q.estado = 'marchita'; }
    } else {
      q.diasSecos = 0;
      if (luz) {
        q.altura += CRECE_LUZ * Math.max(0, 1 - q.altura / ALTURA_MAX);
        q.estado = q.altura >= 4 ? 'sana' : 'germino';
      } else {
        q.altura += CRECE_OSCURO; q.reserva -= 1; q.estado = 'palida';
        if (q.reserva <= 0) { q.vivo = false; q.estado = 'marchita'; }
      }
    }
    q.altura = Math.round(q.altura * 100) / 100;
    q.historial.push(q.altura);
    return q;
  }

  /** Pasa `n` días con las mismas condiciones. */
  function dias(p, n, agua, luz) {
    var q = p, i;
    for (i = 0; i < n; i++) q = paso(q, agua, luz);
    return q;
  }

  /** Cómo se dice el estado, con palabras. */
  function texto(p) {
    if (p.estado === 'semilla') return p.diasHumedos > 0 ? 'La semilla se está hinchando con la humedad.' : 'La semilla sigue seca y dormida.';
    if (p.estado === 'germino') return 'La semilla germinó: ya asoma un brote.';
    if (p.estado === 'sana') return 'La planta crece sana, verde y fuerte.';
    if (p.estado === 'palida') return 'Sin luz crece larga, delgada y pálida.';
    return 'La planta se marchitó.';
  }

  var PLANTA = { ALTURA_MAX: ALTURA_MAX, RESERVA_OSCURO: RESERVA_OSCURO, nueva: nueva, paso: paso, dias: dias, texto: texto };
  if (typeof module !== 'undefined' && module.exports) module.exports = PLANTA;
  else root.PLANTA = PLANTA;
})(typeof self !== 'undefined' ? self : this);
