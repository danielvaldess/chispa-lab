// Clase: el avance de un alumno viaja en un código corto (texto o QR) que su docente escanea o pega, sin internet, sin servidor y sin cuentas.
// Funciones puras (sin DOM): corren en el navegador y en Node (para pruebas).
//
// Formato (solo caracteres ASCII, unos 90 a 110 caracteres, cabe en un QR pequeño y fácil de leer con cámaras baratas):
//   CL1|id|nombre|t|e|j|k|min|d|crc
//   id      identificador aleatorio del jugador en su teléfono (no es su fecha de nacimiento ni su nombre real)
//   nombre  nombre o apodo (se codifica como URL; el espacio es «+»)
//   t       minuto del avance, contado desde el 1 de enero de 2026, en base 36
//   e       estrellas (0 a 3) de los 11 juegos y experimentos, una cifra cada uno
//   j       partidas de los 6 juegos de la estación, dos cifras cada uno
//   k       predicciones acertadas de esos 6 juegos, dos cifras cada uno
//   min     minutos jugados en total
//   d       descubrimientos de «Mi laboratorio», como máscara de bits en hexadecimal (6 caracteres)
//   crc     suma de comprobación (CRC-16) del resto, en base 36: detecta errores al copiar o escanear, no es una firma
// NO viajan: fecha de nacimiento, apoyos elegidos, sesiones de voz, cuaderno ni nada que identifique a la persona más que su apodo.
(function (root) {
  'use strict';
  var AJ = typeof require === 'function' && typeof module !== 'undefined' ? require('./ajustes.js') : root.AJUSTES;
  var DS = typeof require === 'function' && typeof module !== 'undefined' ? require('./descubrimientos.js') : root.DESCUBRIMIENTOS;

  var VERSION = 'CL1';
  var ROLES = ['estudiante', 'docente'];
  var JUEGOS = ['rampa', 'pendulo', 'voz', 'globo', 'luz', 'burbujas'];                 // los seis juegos de la estación
  var TODOS = JUEGOS.concat(['hilo', 'col', 'huevo', 'volcan', 'libre']);                 // más los experimentos y el laboratorio libre
  var TITULOS = {
    rampa: 'La rampa', pendulo: 'El péndulo', voz: 'La voz y el globo', globo: 'El globo largo', luz: 'Luz y color', burbujas: 'Burbujas mágicas',
    hilo: 'Péndulo de hilo', col: 'Chispa detective', huevo: 'El huevo y la sal', volcan: 'El volcán', libre: 'Mi laboratorio'
  };
  var MAX_ALUMNOS = 60;
  var MAX_LARGO = 300;
  var EPOCA = Date.UTC(2026, 0, 1);
  var DESCUBRIMIENTOS = DS.CATALOGO.length;

  function rolValido(r) { return ROLES.indexOf(r) >= 0 ? r : 'estudiante'; }

  function entero(v, max) { v = Math.floor(Number(v)); return isFinite(v) && v > 0 ? Math.min(v, max) : 0; }
  function pad(n, ancho) { var s = String(n); while (s.length < ancho) s = '0' + s; return s; }

  /** CRC-16/CCITT-FALSE de un texto ASCII. */
  function crc16(s) {
    var crc = 0xffff, i, b;
    for (i = 0; i < s.length; i++) {
      crc ^= (s.charCodeAt(i) & 0xff) << 8;
      for (b = 0; b < 8; b++) crc = (crc & 0x8000) ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
    return crc;
  }

  function nombreAURL(n) { return encodeURIComponent(n).replace(/%20/g, '+'); }
  function nombreDeURL(s) { try { return decodeURIComponent(s.replace(/\+/g, '%20')); } catch (e) { return ''; } }

  /** Máscara de bits (hex, 6 caracteres) de los descubrimientos que tiene el jugador, en el orden del catálogo. */
  function mascara(lista) {
    var ids = Array.isArray(lista) ? lista : [], bits = 0, i;
    for (i = 0; i < DESCUBRIMIENTOS && i < 24; i++) if (ids.indexOf(DS.CATALOGO[i].id) >= 0) bits |= (1 << i);
    return pad((bits >>> 0).toString(16), 6);
  }
  function contarBits(hex) { var n = parseInt(hex, 16) >>> 0, c = 0; while (n) { c += n & 1; n >>>= 1; } return c; }

  /** Lo que se comparte de un perfil: cifras acotadas. Devuelve un alumno { id, nombre, t, e, j, k, min, d }. */
  function resumirPerfil(perfil, ahora) {
    perfil = perfil || {};
    var prog = perfil.progreso || {}, ap = perfil.aprendizaje || {}, seg = 0;
    Object.keys(ap).forEach(function (k) { seg += Number(ap[k] && ap[k].seg) || 0; });
    var e = TODOS.map(function (id) { return Math.min(3, entero(prog[id], 3)); });
    var j = JUEGOS.map(function (id) { return entero(ap[id] && ap[id].partidas, 99); });
    var k = JUEGOS.map(function (id, i) { return Math.min(j[i], entero(ap[id] && ap[id].predOk, 99)); });
    return {
      id: String(perfil.id || '').replace(/[^A-Za-z0-9]/g, '').slice(0, 24),
      nombre: AJ.limpiarNombre(perfil.nombre),
      t: Math.floor(((ahora || Date.now()) - EPOCA) / 60000) * 60000 + EPOCA,
      e: e, j: j, k: k, min: Math.min(9999, Math.round(seg / 60)), d: mascara(perfil.descubrimientos)
    };
  }

  /** Código de texto de un alumno ya resumido, o null si le falta el nombre o el id. */
  function codificar(a) {
    if (!a || !a.id || !a.nombre) return null;
    var tMin = Math.max(0, Math.floor((a.t - EPOCA) / 60000));
    var cuerpo = [VERSION, a.id, nombreAURL(a.nombre), tMin.toString(36), a.e.join(''), a.j.map(function (n) { return pad(n, 2); }).join(''),
      a.k.map(function (n) { return pad(n, 2); }).join(''), String(a.min), a.d].join('|');
    return cuerpo + '|' + crc16(cuerpo).toString(36);
  }

  /** El código que muestra el teléfono del alumno ahora mismo. */
  function codigoDe(perfil, ahora) { return codificar(resumirPerfil(perfil, ahora)); }

  /** Valida un alumno (de un código o de lo guardado) y lo deja acotado. Devuelve el alumno o null. */
  function validarAlumno(a) {
    if (!a || typeof a !== 'object') return null;
    var id = String(a.id || ''), nombre = AJ.limpiarNombre(a.nombre), d = String(a.d || '');
    if (!/^[A-Za-z0-9]{1,24}$/.test(id) || !nombre || !/^[0-9a-f]{6}$/.test(d)) return null;
    var t = Number(a.t);
    if (!isFinite(t) || t < EPOCA || t > EPOCA + 1e12) return null;
    if (!Array.isArray(a.e) || a.e.length !== TODOS.length || !Array.isArray(a.j) || a.j.length !== JUEGOS.length || !Array.isArray(a.k) || a.k.length !== JUEGOS.length) return null;
    var e = a.e.map(function (n) { return Math.max(0, Math.min(3, Math.floor(Number(n) || 0))); });
    var j = a.j.map(function (n) { return Math.max(0, Math.min(99, Math.floor(Number(n) || 0))); });
    var k = a.k.map(function (n, i) { return Math.max(0, Math.min(j[i], Math.floor(Number(n) || 0))); });
    return { id: id, nombre: nombre, t: t, e: e, j: j, k: k, min: Math.max(0, Math.min(9999, Math.floor(Number(a.min) || 0))), d: d };
  }

  /** Lee un código de texto. Devuelve { ok: true, alumno } o { ok: false, error } (formato, version, crc, datos). */
  function leer(texto) {
    var t = String(texto == null ? '' : texto).replace(/\s+/g, '');
    if (!t || t.length > MAX_LARGO) return { ok: false, error: 'formato' };
    var p = t.split('|');
    if (p[0] !== VERSION) return { ok: false, error: /^CL\d/.test(p[0]) ? 'version' : 'formato' };
    if (p.length !== 10) return { ok: false, error: 'formato' };
    var cuerpo = p.slice(0, 9).join('|');
    if (crc16(cuerpo).toString(36) !== p[9]) return { ok: false, error: 'crc' };
    if (!/^[0-3]{11}$/.test(p[4]) || !/^\d{12}$/.test(p[5]) || !/^\d{12}$/.test(p[6]) || !/^\d{1,4}$/.test(p[7]) || !/^[0-9a-z]{1,8}$/.test(p[3])) return { ok: false, error: 'formato' };
    var tMin = parseInt(p[3], 36);
    var alumno = validarAlumno({
      id: p[1], nombre: nombreDeURL(p[2]), t: EPOCA + tMin * 60000,
      e: p[4].split('').map(Number), j: p[5].match(/\d\d/g).map(Number), k: p[6].match(/\d\d/g).map(Number), min: Number(p[7]), d: p[8]
    });
    return alumno ? { ok: true, alumno: alumno } : { ok: false, error: 'datos' };
  }

  /** Lista de alumnos guardada: solo los válidos, sin repetir id, ordenados por nombre y con un tope. */
  function normalizarAlumnos(lista) {
    var vistos = {}, out = [];
    (Array.isArray(lista) ? lista : []).forEach(function (a) {
      var v = validarAlumno(a);
      if (v && !vistos[v.id] && out.length < MAX_ALUMNOS) { vistos[v.id] = true; out.push(v); }
    });
    return ordenar(out);
  }

  function ordenar(l) { return l.slice().sort(function (a, b) { return a.nombre.localeCompare(b.nombre, 'es') || a.id.localeCompare(b.id); }); }

  /**
   * Añade o actualiza un alumno en la lista del docente. Mismo id: se queda el avance más nuevo.
   * Devuelve { alumnos, estado } con estado 'nuevo', 'actualizado', 'igual', 'antiguo' (ya había uno más nuevo) o 'lleno'.
   */
  function fundir(alumnos, nuevo) {
    var lista = normalizarAlumnos(alumnos), v = validarAlumno(nuevo), i;
    if (!v) return { alumnos: lista, estado: 'invalido' };
    for (i = 0; i < lista.length; i++) {
      if (lista[i].id !== v.id) continue;
      if (v.t > lista[i].t) { lista[i] = v; return { alumnos: ordenar(lista), estado: 'actualizado' }; }
      return { alumnos: lista, estado: v.t === lista[i].t ? 'igual' : 'antiguo' };
    }
    if (lista.length >= MAX_ALUMNOS) return { alumnos: lista, estado: 'lleno' };
    lista.push(v);
    return { alumnos: ordenar(lista), estado: 'nuevo' };
  }

  function quitar(alumnos, id) { return normalizarAlumnos(alumnos).filter(function (a) { return a.id !== id; }); }

  function iso(ms) { var d = new Date(ms); return d.getUTCFullYear() + '-' + pad(d.getUTCMonth() + 1, 2) + '-' + pad(d.getUTCDate(), 2); }

  /** Cifras para mostrar a un docente. juegoDificil: el juego con menos predicciones acertadas (con al menos una partida), o null. */
  function resumenAlumno(a) {
    var estrellas = 0, partidas = 0, aciertos = 0, peor = null, i;
    for (i = 0; i < JUEGOS.length; i++) {
      estrellas += a.e[i]; partidas += a.j[i]; aciertos += a.k[i];
      if (a.j[i] > 0) {
        var r = a.k[i] / a.j[i];
        if (!peor || r < peor.r || (r === peor.r && a.j[i] > peor.n)) peor = { id: JUEGOS[i], r: r, n: a.j[i] };
      }
    }
    return {
      estrellas: estrellas, estrellasMax: JUEGOS.length * 3, partidas: partidas, acierto: partidas ? Math.round(100 * aciertos / partidas) : null,
      minutos: a.min, descubrimientos: contarBits(a.d), descubrimientosMax: DESCUBRIMIENTOS,
      juegoDificil: peor && peor.r < 1 ? peor.id : null, fecha: iso(a.t)
    };
  }

  /** Cuántos días pasaron desde el avance del alumno (0 si es de hoy). */
  function diasDesde(a, ahora) { return Math.max(0, Math.floor(((ahora || Date.now()) - a.t) / 86400000)); }

  /** Texto para copiar y llevar a un computador o a otro docente. */
  function resumenClase(alumnos, ahora) {
    var l = normalizarAlumnos(alumnos), out = ['Chispa Lab · mis alumnos (' + l.length + ')',
      'Avance de cada alumno en el momento en que se escaneó su código. Es un juego de práctica, no una evaluación oficial.', ''];
    if (!l.length) out.push('Todavía no hay alumnos.');
    l.forEach(function (a) {
      var r = resumenAlumno(a);
      out.push(a.nombre + ' · ⭐ ' + r.estrellas + '/' + r.estrellasMax + ' · partidas ' + r.partidas + (r.acierto !== null ? ' · predicciones acertadas ' + r.acierto + ' %' : '') +
        ' · ' + r.minutos + ' min · descubrimientos ' + r.descubrimientos + '/' + r.descubrimientosMax + (r.juegoDificil ? ' · le cuesta: ' + TITULOS[r.juegoDificil] : '') + ' · avance del ' + r.fecha);
    });
    return out.join('\n');
  }

  var CLASE = {
    VERSION: VERSION, ROLES: ROLES, JUEGOS: JUEGOS, TODOS: TODOS, TITULOS: TITULOS, MAX_ALUMNOS: MAX_ALUMNOS, EPOCA: EPOCA, DESCUBRIMIENTOS: DESCUBRIMIENTOS,
    rolValido: rolValido, crc16: crc16, resumirPerfil: resumirPerfil, codificar: codificar, codigoDe: codigoDe, leer: leer, validarAlumno: validarAlumno,
    normalizarAlumnos: normalizarAlumnos, fundir: fundir, quitar: quitar, resumenAlumno: resumenAlumno, diasDesde: diasDesde, resumenClase: resumenClase, contarBits: contarBits
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = CLASE;
  else root.CLASE = CLASE;
})(typeof self !== 'undefined' ? self : this);
