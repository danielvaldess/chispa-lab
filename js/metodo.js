// Método científico: el ciclo hipótesis → prueba justa → datos → conclusión → cuaderno, común a todos los experimentos con materiales.
// Funciones puras y sin DOM (se prueban en Node). Todo se calcula y guarda en el teléfono; nada se envía.
(function (root) {
  'use strict';

  var MAX_CUADERNO = 20;     // entradas que se guardan por jugador
  var MAX_TEXTO = 320;       // caracteres por campo del cuaderno

  function limpiarTexto(t) { return String(t === undefined || t === null ? '' : t).replace(/[<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, MAX_TEXTO); }

  // ---------- Hipótesis: «Si cambio ___, entonces ___ porque ___» ----------
  /** sel = { cambio, entonces, porque } con los textos elegidos. Devuelve la frase, o '' si falta alguna casilla. */
  function hipotesis(sel) {
    sel = sel || {};
    var c = limpiarTexto(sel.cambio), e = limpiarTexto(sel.entonces), p = limpiarTexto(sel.porque);
    if (!c || !e || !p) return '';
    return 'Si cambio ' + c + ', entonces ' + e + ' porque ' + p + '.';
  }

  // ---------- Prueba justa: solo cambia una cosa a la vez ----------
  /** Claves cuyo valor no es el mismo en todas las corridas. corridas: [{ largo: 25, objeto: 'moneda', ... }]. */
  function variablesQueCambian(corridas, claves) {
    var out = [];
    (claves || []).forEach(function (k) {
      var vistos = {}, n = 0;
      (corridas || []).forEach(function (c) { var v = String(c && c[k]); if (!vistos[v]) { vistos[v] = true; n++; } });
      if (n > 1) out.push(k);
    });
    return out;
  }

  /** ¿Solo cambió `cambia` y todo lo demás se mantuvo igual? Hacen falta al menos 2 corridas. */
  function esPruebaJusta(corridas, claves, cambia) {
    if (!corridas || corridas.length < 2) return false;
    var cambian = variablesQueCambian(corridas, claves);
    return cambian.length === 1 && cambian[0] === cambia;
  }

  // ---------- Datos ----------
  function promedio(a) {
    if (!a || !a.length) return null;
    var s = 0, i; for (i = 0; i < a.length; i++) s += a[i];
    return s / a.length;
  }

  /** Desviación estándar de la muestra (n − 1). Con una sola medida no hay dispersión que calcular. */
  function desviacion(a) {
    if (!a || a.length < 2) return null;
    var m = promedio(a), s = 0, i; for (i = 0; i < a.length; i++) s += (a[i] - m) * (a[i] - m);
    return Math.sqrt(s / (a.length - 1));
  }

  /** Resumen de una serie de medidas repetidas. */
  function resumen(a) {
    var v = (a || []).filter(function (x) { return x !== null && x !== '' && x !== undefined && isFinite(Number(x)); }).map(Number);
    if (!v.length) return null;
    return { n: v.length, media: promedio(v), desv: desviacion(v), min: Math.min.apply(null, v), max: Math.max.apply(null, v) };
  }

  /** ¿Las medidas repetidas se parecen? (desviación pequeña respecto a la media). Con una sola medida no se puede saber. */
  function sonParecidas(a, tolerancia) {
    var d = desviacion(a), m = promedio(a);
    if (d === null || !m) return null;
    return d / Math.abs(m) <= (tolerancia === undefined ? 0.1 : tolerancia);
  }

  // ---------- Cuaderno de laboratorio ----------
  /** Una entrada del cuaderno: { n: juego, f: fecha, h: hipótesis, d: datos, c: conclusión }. Los textos se limpian y acotan. */
  function entrada(nivelId, datos, fecha) {
    datos = datos || {};
    return { n: String(nivelId || '').slice(0, 16), f: String(fecha || '').slice(0, 10), h: limpiarTexto(datos.hipotesis), d: limpiarTexto(datos.datos), c: limpiarTexto(datos.conclusion) };
  }

  /** Añade una entrada a una lista de entradas (la lista nueva conserva las últimas MAX_CUADERNO). No modifica la original. */
  function agregar(lista, nueva) {
    var l = (Array.isArray(lista) ? lista : []).concat([nueva]);
    return l.slice(-MAX_CUADERNO);
  }

  /** Limpia un cuaderno leído del almacenamiento. */
  function normalizarCuaderno(lista, idsValidos) {
    if (!Array.isArray(lista)) return [];
    return lista.slice(-MAX_CUADERNO).map(function (x) {
      if (!x || typeof x !== 'object') return null;
      return { n: String(x.n || '').slice(0, 16), f: String(x.f || '').slice(0, 10), h: limpiarTexto(x.h), d: limpiarTexto(x.d), c: limpiarTexto(x.c) };
    }).filter(function (x) { return x && x.n && (!idsValidos || idsValidos.indexOf(x.n) >= 0) && (x.h || x.d || x.c); });
  }

  /** Texto plano de una entrada, para copiar o llevar al docente. */
  function textoEntrada(e, titulo) {
    return [(titulo || e.n) + (e.f ? ' · ' + e.f : ''), e.h ? 'Hipótesis: ' + e.h : '', e.d ? 'Datos: ' + e.d : '', e.c ? 'Conclusión: ' + e.c : ''].filter(Boolean).join('\n');
  }

  var METODO = {
    MAX_CUADERNO: MAX_CUADERNO, hipotesis: hipotesis, variablesQueCambian: variablesQueCambian, esPruebaJusta: esPruebaJusta,
    promedio: promedio, desviacion: desviacion, resumen: resumen, sonParecidas: sonParecidas,
    entrada: entrada, agregar: agregar, normalizarCuaderno: normalizarCuaderno, textoEntrada: textoEntrada, limpiarTexto: limpiarTexto
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = METODO;
  else root.METODO = METODO;
})(typeof self !== 'undefined' ? self : this);
