'use strict';
// Perfiles y ajustes en pantalla (ES5). Depende de ajustes.js y perfiles.js, y de las globales de juego.js
// (app, $, esc, chispa, ruta) solo cuando se llama a una pantalla, nunca al cargar.
// Todo se guarda en este teléfono; no se envía nada a ningún servidor.

var AJ_ACT = AJUSTES.ajustesDe({}); // ajustes del jugador activo (los leen los efectos y los niveles)

var PERF = (function () {
  var estado = PERFILES.cargar();
  var elegido = false; // ¿ya se eligió jugador en esta sesión?
  var MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  var COLORES = ['#ff9f43', '#3b82f6', '#ff5c8a', '#2fd18b'];
  var W = { nombre: '', anio: 0, mes: 0, apoyos: [], adulto: false, rol: 'estudiante' };
  var temporal = {};

  function actual() { return PERFILES.actual(estado); }
  function aj() { return AJUSTES.ajustesDe(actual() || {}); }
  function progreso() { var p = actual(); return p ? p.progreso : temporal; }
  function guardar() { PERFILES.guardar(estado); }

  function alternar(clase, si) {
    var c = document.body.classList;
    if (si) c.add(clase); else c.remove(clase);
  }

  /** Aplica los ajustes del jugador activo: clases del cuerpo y la copia que leen los niveles. */
  function aplicar() {
    var a = aj();
    AJ_ACT = a;
    alternar('calma', a.calma);
    alternar('contraste', a.contraste);
    alternar('t-grande', a.escala > 1.05 && a.escala < 1.45);
    alternar('t-muy', a.escala >= 1.45);
    alternar('toques', a.toquesGrandes);
    capaBrillo(a.brillo);
    var vistoFinal = (progreso() && progreso().finalVisto) || 0;
    alternar('cientifico', vistoFinal >= 3); // Chispa se pone la bata y las gafas
    alternar('estacion-dorada', vistoFinal >= 3);
    if (typeof recargarProgreso === 'function') recargarProgreso();
    return a;
  }

  /** Multiplicador del margen inicial de una idea según lo que el tutor sabe del jugador (1 si no hay datos o está apagado). */
  function margenTutor(id) {
    var p = actual();
    return p && aj().tutor ? TUTOR.margenInicial(p.maestria[id]) : 1;
  }

  /** Multiplicador del margen que Chispa aprendió de este jugador en un juego (×1 si no hay datos o la IA está apagada). */
  function margenAprendido(id) { return PERFILES.margenAprendido(actual(), id); }

  /** Chispa aprende de un intento de un juego de precisión y guarda lo aprendido en este teléfono. */
  function aprenderMargen(id, error, tolBase) {
    var p = actual();
    if (!p) return;
    PERFILES.registrarMargen(p, id, error, tolBase);
    guardar();
  }

  /** Id del juego que Chispa recomienda hoy, o null (sin datos, apagado o todo dominado). */
  function recomendado() {
    var p = actual();
    if (!p || !aj().tutor) return null;
    var ids = NIVELES.map(function (n) { return n.id; });
    if (aj().voz) ids = ['voz', 'globo'].concat(ids.filter(function (i) { return i !== 'voz' && i !== 'globo'; }));
    return TUTOR.recomendar(p.maestria, ids);
  }

  /** Capa fija y semitransparente que baja el brillo (un filtro en el body rompería las escenas de pantalla completa). */
  function capaBrillo(nivel) {
    var c = document.getElementById('capa-brillo');
    if (!nivel) { if (c && c.parentNode) c.parentNode.removeChild(c); return; }
    if (!c) { c = document.createElement('div'); c.id = 'capa-brillo'; c.setAttribute('aria-hidden', 'true'); document.body.appendChild(c); }
    c.className = 'brillo-' + nivel;
  }

  /** Lee el texto en voz alta si el jugador lo pidió y el teléfono puede. */
  function leer(texto) {
    try {
      if (!AJ_ACT.leerVoz || !window.speechSynthesis || !texto) return;
      VOZ.hablar(texto);
    } catch (e) {}
  }

  function irMenu() { if (location.hash === '#/' || !location.hash) ruta(); else location.hash = '#/'; }

  function nota(t) { return '<p class="nota">' + esc(t) + '</p>'; }

  // ---------- ¿Quién juega? ----------
  function quien() {
    var tarjetas = estado.perfiles.map(function (p, i) {
      var e = AJUSTES.edadDe(p.nac);
      return '<button class="tarjeta jugador" data-id="' + esc(p.id) + '" style="--c:' + COLORES[i % COLORES.length] + '"><span class="ico" aria-hidden="true">' +
        esc(p.nombre.charAt(0).toUpperCase()) + '</span><span><b>' + esc(p.nombre) + '</b><small>' + (p.rol === 'docente' ? '👩‍🏫 Docente' : (e !== null ? e + ' años' : '')) + '</small></span></button>';
    }).join('');
    app.innerHTML = '<h2>¿Quién va a jugar?</h2>' + chispa('¡Hola! Elige quién juega hoy.') + tarjetas +
      (estado.perfiles.length < PERFILES.MAX ? '<p class="accion"><button id="nuevo" class="sec">➕ Nuevo jugador</button></p>' : nota('Ya hay cuatro jugadores en este teléfono.')) +
      nota('Todo se queda en este teléfono. No se envía a nadie.');
    var cs = app.querySelectorAll('.jugador'), i;
    for (i = 0; i < cs.length; i++) cs[i].onclick = function () {
      estado = PERFILES.activar(estado, this.getAttribute('data-id')); guardar(); elegido = true; aplicar(); irMenu();
    };
    if ($('nuevo')) $('nuevo').onclick = function () { reiniciarAsistente(); paso0(); };
  }

  // ---------- Asistente de perfil nuevo (una cosa por pantalla) ----------
  function reiniciarAsistente() { var a = new Date().getFullYear(); W = { nombre: '', anio: a - 9, mes: 1, apoyos: [], adulto: false, rol: 'estudiante' }; }

  function atras(fn) { return '<p class="accion"><button class="sec chico" id="atras">← Atrás</button></p>'; }

  /** Primera pregunta: ¿estudiante o docente? Solo cambia lo que se ve en el menú; no es una cuenta ni una clave. */
  function paso0() {
    app.innerHTML = '<h2>¡Bienvenido!</h2>' + chispa('¡Hola! Soy Chispa. Antes de empezar, cuéntame: ¿quién eres?') +
      '<div class="roles" role="group" aria-label="¿Eres estudiante o docente?">' +
      '<button class="tarjeta rol" data-r="estudiante" style="--c:#2fd18b"><span class="ico" aria-hidden="true">🎒</span><span><b>Soy estudiante</b><small>Voy a jugar y aprender ciencias.</small></span></button>' +
      '<button class="tarjeta rol" data-r="docente" style="--c:#7c3aed"><span class="ico" aria-hidden="true">👩‍🏫</span><span><b>Soy docente</b><small>Quiero ver cómo avanzan mis alumnos.</small></span></button></div>' +
      (estado.perfiles.length ? '<p class="accion"><button class="sec chico" id="cancelar">Cancelar</button></p>' : '') +
      nota('Esto solo cambia lo que ves en el menú. No es una cuenta y no se envía a nadie.');
    var bs = app.querySelectorAll('.rol'), i;
    for (i = 0; i < bs.length; i++) bs[i].onclick = function () { W.rol = this.getAttribute('data-r') === 'docente' ? 'docente' : 'estudiante'; paso1(); };
    if ($('cancelar')) $('cancelar').onclick = quien;
  }

  function paso1() {
    app.innerHTML = '<h2>Vamos a conocernos</h2>' + chispa(W.rol === 'docente' ? '¡Hola, profe! Soy Chispa. ¿Cómo te llamas?' : '¡Hola! Soy Chispa. ¿Cómo te llamas? Puede ser tu apodo.') +
      '<p><label class="campo" for="nombre">Tu nombre</label><input id="nombre" type="text" maxlength="20" autocomplete="off" autocapitalize="words" value="' + esc(W.nombre) + '"></p>' +
      '<p id="error" class="error" role="alert"></p><p class="accion"><button id="sigue">Seguir</button></p>' +
      '<p class="accion"><button class="sec chico" id="atras">← Atrás</button></p>' +
      nota('Tu nombre se queda en este teléfono. No se envía a nadie.');
    $('atras').onclick = paso0;
    $('sigue').onclick = function () {
      var n = AJUSTES.limpiarNombre($('nombre').value);
      if (!n) { $('error').textContent = 'Escribe tu nombre con letras.'; return; }
      W.nombre = n; paso2();
    };
    $('nombre').onkeydown = function (e) { if (e.key === 'Enter') $('sigue').onclick(); };
    $('nombre').focus();
  }

  function paso2() {
    var hoy = new Date(), y, opM = '', opA = '';
    for (var m = 1; m <= 12; m++) opM += '<option value="' + m + '"' + (m === W.mes ? ' selected' : '') + '>' + MESES[m - 1] + '</option>';
    for (y = hoy.getFullYear() - 3; y >= hoy.getFullYear() - 90; y--) opA += '<option value="' + y + '"' + (y === W.anio ? ' selected' : '') + '>' + y + '</option>';
    app.innerHTML = '<h2>' + esc(W.nombre) + '</h2>' + chispa('¡Mucho gusto, ' + W.nombre + '! ¿Cuándo naciste? Así ajusto los retos a tu edad.') +
      '<p><label class="campo" for="mes">Mes</label><select id="mes">' + opM + '</select></p>' +
      '<p><label class="campo" for="anio">Año</label><select id="anio">' + opA + '</select></p>' +
      '<p id="error" class="error" role="alert"></p><p class="accion"><button id="sigue">Seguir</button></p>' + atras() +
      nota('Solo guardo el mes y el año. Se queda en este teléfono.');
    $('atras').onclick = paso1;
    $('sigue').onclick = function () {
      W.mes = parseInt($('mes').value, 10); W.anio = parseInt($('anio').value, 10);
      if (!AJUSTES.validarNac(W.anio, W.mes)) { $('error').textContent = 'Revisa la fecha.'; return; }
      paso3();
    };
  }

  function chipsApoyos(sel) {
    return '<div class="apoyos" role="group" aria-label="Qué te ayuda a jugar">' + AJUSTES.APOYOS.map(function (a) {
      return '<button class="sec apoyo" data-id="' + a.id + '" aria-pressed="' + (sel.indexOf(a.id) >= 0) + '"><span aria-hidden="true">' + a.icono + '</span> ' + esc(a.texto) + '</button>';
    }).join('') + '</div>';
  }

  function ligarApoyos(sel, alCambiar) {
    var bs = app.querySelectorAll('.apoyo'), i;
    for (i = 0; i < bs.length; i++) bs[i].onclick = function () {
      var id = this.getAttribute('data-id'), k = sel.indexOf(id);
      if (k >= 0) sel.splice(k, 1); else sel.push(id);
      this.setAttribute('aria-pressed', k < 0);
      alCambiar();
    };
  }

  function bloqueAdulto(nac, sel, marcado) {
    return PERFILES.necesitaAdulto(nac, sel) ? '<label class="adulto"><input type="checkbox" id="adulto"' + (marcado ? ' checked' : '') +
      '> Un adulto (mamá, papá, tutor o docente) está conmigo y está de acuerdo.</label>' : '';
  }

  function paso3() {
    var nac = AJUSTES.validarNac(W.anio, W.mes);
    function pintarAdulto() {
      $('zona-adulto').innerHTML = bloqueAdulto(nac, W.apoyos, W.adulto);
      if ($('adulto')) $('adulto').onchange = function () { W.adulto = this.checked; };
    }
    app.innerHTML = '<h2>¿Qué te ayuda?</h2>' + chispa(W.nombre + ', ¿qué te ayuda a jugar mejor? Elige lo que quieras, o nada.') + chipsApoyos(W.apoyos) +
      '<div id="zona-adulto"></div><p id="error" class="error" role="alert"></p><p class="accion"><button id="sigue">Seguir</button></p>' + atras() +
      nota('Esto solo sirve para ajustar el juego. Se queda en este teléfono, no se envía a nadie y lo puedes cambiar o borrar cuando quieras.');
    ligarApoyos(W.apoyos, function () { if (!PERFILES.necesitaAdulto(nac, W.apoyos)) W.adulto = false; pintarAdulto(); });
    pintarAdulto();
    $('atras').onclick = paso2;
    $('sigue').onclick = function () {
      if (PERFILES.necesitaAdulto(nac, W.apoyos) && !W.adulto) { $('error').textContent = 'Un adulto tiene que estar de acuerdo para guardar esto.'; return; }
      listo();
    };
  }

  function listo() {
    var r = PERFILES.crear(estado, { nombre: W.nombre, anio: W.anio, mes: W.mes, apoyos: W.apoyos, adulto: W.adulto, rol: W.rol }, new Date(), localStorage);
    if (!r.ok) {
      app.innerHTML = '<h2>Ups</h2>' + chispa(r.error === 'lleno' ? 'Ya hay cuatro jugadores en este teléfono. Borra uno en Ajustes para añadir otro.' : 'Algo no salió bien. Vuelve a intentarlo.') +
        '<p class="accion"><button id="volver">Volver</button></p>';
      $('volver').onclick = function () { estado.perfiles.length ? quien() : paso0(); };
      return;
    }
    estado = r.estado; guardar(); elegido = true;
    var a = aplicar();
    app.innerHTML = '<h2>¡Listo, ' + esc(W.nombre) + '!</h2>' + chispa('¡Todo listo! Así voy a ayudarte:') +
      '<ul class="resumen">' + AJUSTES.resumen(a).map(function (f) { return '<li>' + esc(f) + '</li>'; }).join('') + (W.rol === 'docente' ? '<li>👩‍🏫 En el menú tienes «Mis alumnos»: ahí guardas el avance de cada alumno escaneando su QR, sin internet.</li>' : '') + '</ul>' +
      '<p class="accion"><button id="jugar">¡A jugar!</button></p>' + nota('Puedes cambiar esto cuando quieras en ⚙ Ajustes.');
    $('jugar').onclick = irMenu;
  }

  /** Punto de entrada: asistente si no hay jugadores, selector si hay varios, menú si hay uno. */
  function entrar() {
    if (!estado.perfiles.length) { reiniciarAsistente(); paso0(); return; }
    if (estado.perfiles.length > 1 && !elegido) { quien(); return; }
    elegido = true; aplicar(); ruta();
  }

  aplicar();

  return {
    actual: actual, aj: aj, progreso: progreso, guardar: guardar, aplicar: aplicar, leer: leer, entrar: entrar,
    quien: quien, estado: function () { return estado; }, volver: irMenu, margenTutor: margenTutor, margenAprendido: margenAprendido, aprenderMargen: aprenderMargen, recomendado: recomendado,
    ajustes: function (aviso) { PANEL.abrir(null, aviso); },
    fijarEstado: function (e) { estado = e; },
    nuevo: function () { reiniciarAsistente(); paso0(); }
  };
})();
