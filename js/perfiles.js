// Almacén de perfiles locales (sin DOM, para probarlo en Node). Todo vive en el dispositivo:
// nada se envía a ningún servidor. Solo se guarda año y mes de nacimiento, no el día.
(function (root) {
  'use strict';
  var AJ = typeof require === 'function' && typeof module !== 'undefined' ? require('./ajustes.js') : root.AJUSTES;
  var TU = typeof require === 'function' && typeof module !== 'undefined' ? require('./tutor.js') : root.TUTOR;

  var CLAVE = 'chispalab.perfiles.v1';
  var LEGADO = 'chispalab.juego.v1';
  var MAX = 4;
  var MAX_SESIONES = 60;
  var NIVELES_IDS = ['rampa', 'pendulo', 'voz', 'globo', 'luz', 'burbujas'];

  function almacenar(a) { return a || (typeof localStorage !== 'undefined' ? localStorage : null); }

  function objetoPlano(o) { return o && typeof o === 'object' && !Array.isArray(o) ? o : {}; }

  function numeros(o) {
    var out = {};
    Object.keys(objetoPlano(o)).forEach(function (k) {
      var n = Number(o[k]);
      if (isFinite(n) && n >= 0 && n < 1e7) out[k] = n;
    });
    return out;
  }

  function normalizarPerfil(p, hoy) {
    p = objetoPlano(p);
    var nombre = AJ.limpiarNombre(p.nombre);
    var m = /^(\d{4})-(\d{2})$/.exec(String(p.nac || ''));
    var nac = m ? AJ.validarNac(m[1], m[2], hoy) : null;
    if (!nombre || !nac || typeof p.id !== 'string' || !p.id) return null;
    var ex = objetoPlano(p.extras);
    return {
      id: p.id.slice(0, 24),
      nombre: nombre,
      nac: nac,
      apoyos: AJ.apoyosValidos(p.apoyos),
      extras: {
        escala: typeof ex.escala === 'number' ? ex.escala : undefined,
        calma: typeof ex.calma === 'boolean' ? ex.calma : undefined,
        contraste: typeof ex.contraste === 'boolean' ? ex.contraste : undefined,
        leerVoz: typeof ex.leerVoz === 'boolean' ? ex.leerVoz : undefined,
        vibrar: typeof ex.vibrar === 'boolean' ? ex.vibrar : undefined,
        volumen: typeof ex.volumen === 'number' ? ex.volumen : undefined,
        brillo: ex.brillo === 0 || ex.brillo === 1 || ex.brillo === 2 ? ex.brillo : undefined,
        tutor: typeof ex.tutor === 'boolean' ? ex.tutor : undefined
      },
      progreso: normalizarProgreso(p.progreso),
      aprendizaje: normalizarAprendizaje(p.aprendizaje),
      maestria: normalizarMaestria(p.maestria),
      sesionesVoz: (Array.isArray(p.sesionesVoz) ? p.sesionesVoz : []).slice(-MAX_SESIONES).map(function (s) {
        s = objetoPlano(s);
        return { f: String(s.f || '').slice(0, 10), max: Number(s.max) || 0, hzMin: Number(s.hzMin) || 0, hzMax: Number(s.hzMax) || 0 };
      }),
      creado: String(p.creado || '').slice(0, 10)
    };
  }

  /** Progreso del jugador (estrellas y récords por juego, y el último final que vio, de 0 a 3). */
  function normalizarProgreso(o) {
    var out = numeros(o);
    if (out.finalVisto !== undefined) out.finalVisto = Math.max(0, Math.min(3, Math.floor(out.finalVisto)));
    return out;
  }

  /** Registro de aprendizaje por nivel: partidas, predicciones acertadas, segundos jugados y mejores estrellas. */
  function normalizarAprendizaje(a) {
    var out = {};
    a = objetoPlano(a);
    NIVELES_IDS.forEach(function (id) {
      var x = objetoPlano(a[id]);
      var n = numeros(x);
      if (n.partidas > 0) out[id] = { partidas: Math.floor(n.partidas), predOk: Math.min(Math.floor(n.predOk || 0), Math.floor(n.partidas)), seg: Math.min(n.seg || 0, 1e6), estrellas: Math.min(3, Math.floor(n.estrellas || 0)) };
    });
    return out;
  }

  /** Dominio estimado por idea (lo calcula el tutor): se acota y se descartan valores raros. */
  function normalizarMaestria(m) {
    var out = {};
    m = objetoPlano(m);
    NIVELES_IDS.forEach(function (id) {
      var x = objetoPlano(m[id]), n = numeros(x);
      if (!(n.pn > 0) || !(Number(x.p) > 0)) return;
      var pn = Math.floor(n.pn), hn = Math.floor(n.hn || 0);
      out[id] = { p: Math.min(0.99, Math.max(0.01, Number(x.p) || 0.25)), h: Math.min(0.99, Math.max(0.01, Number(x.h) || 0.25)), pn: pn, pok: Math.min(Math.floor(n.pok || 0), pn), hn: hn, hok: Math.min(Math.floor(n.hok || 0), hn) };
    });
    return out;
  }

  function vacio() { return { activo: null, perfiles: [] }; }

  function cargar(almacen, hoy) {
    try {
      var crudo = JSON.parse(almacenar(almacen).getItem(CLAVE));
      var perfiles = (crudo && Array.isArray(crudo.perfiles) ? crudo.perfiles : []).map(function (p) { return normalizarPerfil(p, hoy); }).filter(Boolean).slice(0, MAX);
      var activo = crudo && perfiles.some(function (p) { return p.id === crudo.activo; }) ? crudo.activo : (perfiles[0] ? perfiles[0].id : null);
      return { activo: activo, perfiles: perfiles };
    } catch (e) { return vacio(); }
  }

  function guardar(estado, almacen) {
    try { almacenar(almacen).setItem(CLAVE, JSON.stringify(estado)); return true; } catch (e) { return false; }
  }

  function leerLegado(almacen) {
    try { return numeros(JSON.parse(almacenar(almacen).getItem(LEGADO))); } catch (e) { return {}; }
  }

  function idNuevo() { return 'p' + Date.now().toString(36) + Math.floor(Math.random() * 1296).toString(36); }

  function fechaISO(hoy) { hoy = hoy || new Date(); return hoy.getFullYear() + '-' + ('0' + (hoy.getMonth() + 1)).slice(-2) + '-' + ('0' + hoy.getDate()).slice(-2); }

  /** Un menor de 18 años necesita que un adulto confirme antes de guardar cualquier apoyo. */
  function necesitaAdulto(nac, apoyos, hoy) {
    var e = AJ.edadDe(nac, hoy);
    return AJ.apoyosValidos(apoyos).length > 0 && e !== null && e < 18;
  }

  /** Crea un perfil. datos: { nombre, anio, mes, apoyos, adulto }. Devuelve { ok, estado, perfil } o { ok:false, error }. */
  function crear(estado, datos, hoy, almacen) {
    datos = datos || {};
    var nombre = AJ.limpiarNombre(datos.nombre);
    if (!nombre) return { ok: false, error: 'nombre' };
    var nac = AJ.validarNac(datos.anio, datos.mes, hoy);
    if (!nac) return { ok: false, error: 'fecha' };
    if (estado.perfiles.length >= MAX) return { ok: false, error: 'lleno' };
    var apoyos = AJ.apoyosValidos(datos.apoyos);
    if (necesitaAdulto(nac, apoyos, hoy) && !datos.adulto) return { ok: false, error: 'adulto' };
    var primero = estado.perfiles.length === 0;
    var perfil = {
      id: idNuevo(), nombre: nombre, nac: nac, apoyos: apoyos, extras: {},
      progreso: primero ? leerLegado(almacen) : {}, aprendizaje: {}, maestria: {}, sesionesVoz: [], creado: fechaISO(hoy)
    };
    return { ok: true, perfil: perfil, estado: { activo: perfil.id, perfiles: estado.perfiles.concat([perfil]) } };
  }

  function activar(estado, id) {
    return estado.perfiles.some(function (p) { return p.id === id; }) ? { activo: id, perfiles: estado.perfiles } : estado;
  }

  function actual(estado) {
    for (var i = 0; i < estado.perfiles.length; i++) if (estado.perfiles[i].id === estado.activo) return estado.perfiles[i];
    return null;
  }

  /** Cambia los apoyos de un perfil, con la misma regla del adulto. */
  function cambiarApoyos(estado, id, apoyos, adulto, hoy) {
    var p = estado.perfiles.filter(function (x) { return x.id === id; })[0];
    if (!p) return { ok: false, error: 'no existe' };
    var nuevos = AJ.apoyosValidos(apoyos);
    if (necesitaAdulto(p.nac, nuevos, hoy) && !adulto) return { ok: false, error: 'adulto' };
    var copia = JSON.parse(JSON.stringify(p));
    copia.apoyos = nuevos;
    return { ok: true, estado: { activo: estado.activo, perfiles: estado.perfiles.map(function (x) { return x.id === id ? copia : x; }) } };
  }

  function borrar(estado, id) {
    var perfiles = estado.perfiles.filter(function (p) { return p.id !== id; });
    var activo = estado.activo === id ? (perfiles[0] ? perfiles[0].id : null) : estado.activo;
    return { activo: activo, perfiles: perfiles };
  }

  /** Borra TODOS los datos de la app en este dispositivo. */
  function borrarTodo(almacen) {
    try { almacenar(almacen).removeItem(CLAVE); almacenar(almacen).removeItem(LEGADO); return true; } catch (e) { return false; }
  }

  /** Añade una sesión de voz (tiempo sostenido máximo y rango de tono) al perfil activo. */
  function registrarSesionVoz(perfil, sesion, hoy) {
    perfil.sesionesVoz.push({ f: fechaISO(hoy), max: Math.round(sesion.max * 10) / 10, hzMin: Math.round(sesion.hzMin) || 0, hzMax: Math.round(sesion.hzMax) || 0 });
    if (perfil.sesionesVoz.length > MAX_SESIONES) perfil.sesionesVoz.shift();
    return perfil;
  }

  /**
   * Nivel de la estación: la menor cantidad de estrellas entre todos los juegos (0 a 3).
   * 1 = estación encendida, 2 = a toda potencia, 3 = de las estrellas. Si falta algún juego, 0.
   */
  function finalAlcanzado(progreso, ids) {
    var min = 3;
    (ids || NIVELES_IDS).forEach(function (id) {
      var e = Number(progreso && progreso[id]) || 0;
      if (e < min) min = e;
    });
    return Math.max(0, Math.min(3, Math.floor(min)));
  }

  /** Anota una partida terminada de un nivel (solo en el teléfono). resultado: { predOk, estrellas, seg }. */
  function registrarPartida(perfil, nivelId, resultado) {
    if (NIVELES_IDS.indexOf(nivelId) < 0) return perfil;
    var a = perfil.aprendizaje[nivelId] || { partidas: 0, predOk: 0, seg: 0, estrellas: 0 };
    a.partidas += 1;
    if (resultado.predOk) a.predOk += 1;
    a.seg = Math.min(1e6, a.seg + Math.max(0, Math.min(3600, Number(resultado.seg) || 0)));
    a.estrellas = Math.max(a.estrellas, Math.min(3, Number(resultado.estrellas) || 0));
    perfil.aprendizaje[nivelId] = a;
    return perfil;
  }

  /**
   * El tutor anota la partida terminada de una idea (solo si el adulto no lo apagó).
   * partida: { predOk, habil }. Con el apoyo de voz se ignora la destreza en los juegos de micrófono.
   */
  function registrarMaestria(perfil, nivelId, partida) {
    if (NIVELES_IDS.indexOf(nivelId) < 0 || (perfil.extras && perfil.extras.tutor === false)) return perfil;
    perfil.maestria[nivelId] = TU.registrar(perfil.maestria[nivelId], {
      predOk: !!partida.predOk, habil: !!partida.habil, ignorarDestreza: TU.ignorarDestreza(nivelId, perfil.apoyos)
    });
    return perfil;
  }

  /** El adulto puede borrar lo que el tutor sabe de este jugador. */
  function reiniciarMaestria(perfil) { perfil.maestria = {}; return perfil; }

  /** Resumen para un adulto: por nivel, y cuál es la idea que más le cuesta (la que menos predice bien). */
  function resumenAprendizaje(perfil) {
    var filas = [], peor = null;
    NIVELES_IDS.forEach(function (id) {
      var a = perfil.aprendizaje[id];
      if (!a) return;
      var fila = { id: id, partidas: a.partidas, predOk: a.predOk, minutos: Math.round(a.seg / 60), estrellas: a.estrellas, acierto: a.predOk / a.partidas };
      filas.push(fila);
      if (!peor || fila.acierto < peor.acierto || (fila.acierto === peor.acierto && fila.partidas > peor.partidas)) peor = fila;
    });
    var totalSeg = Object.keys(perfil.aprendizaje).reduce(function (t, k) { return t + perfil.aprendizaje[k].seg; }, 0);
    return { filas: filas, masDificil: peor && peor.acierto < 1 ? peor.id : null, minutosTotal: Math.round(totalSeg / 60) };
  }

  /** Texto para copiar y llevar al terapeuta o al docente. */
  function resumenSesiones(perfil) {
    var l = ['Chispa Lab · práctica de voz de ' + perfil.nombre, 'Es un juego de práctica, no un diagnóstico ni una medición clínica.', ''];
    if (!perfil.sesionesVoz.length) l.push('Todavía no hay sesiones.');
    perfil.sesionesVoz.forEach(function (s) {
      l.push(s.f + ' · «aaa» sostenida: ' + s.max + ' s' + (s.hzMin ? ' · tono entre ' + s.hzMin + ' y ' + s.hzMax + ' Hz' : ''));
    });
    return l.join('\n');
  }

  var PERFILES = {
    CLAVE: CLAVE, LEGADO: LEGADO, MAX: MAX, cargar: cargar, guardar: guardar, crear: crear, activar: activar, actual: actual,
    cambiarApoyos: cambiarApoyos, borrar: borrar, borrarTodo: borrarTodo, necesitaAdulto: necesitaAdulto,
    registrarSesionVoz: registrarSesionVoz, resumenSesiones: resumenSesiones, finalAlcanzado: finalAlcanzado, registrarMaestria: registrarMaestria, reiniciarMaestria: reiniciarMaestria, registrarPartida: registrarPartida, resumenAprendizaje: resumenAprendizaje, NIVELES_IDS: NIVELES_IDS
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = PERFILES;
  else root.PERFILES = PERFILES;
})(typeof self !== 'undefined' ? self : this);
