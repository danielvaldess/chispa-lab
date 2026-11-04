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
  var W = { nombre: '', anio: 0, mes: 0, apoyos: [], adulto: false };
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
    if (typeof recargarProgreso === 'function') recargarProgreso();
    return a;
  }

  /** Lee el texto en voz alta si el jugador lo pidió y el teléfono puede. */
  function leer(texto) {
    try {
      if (!AJ_ACT.leerVoz || !window.speechSynthesis || !texto) return;
      window.speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(String(texto));
      u.lang = 'es-ES'; u.rate = 0.95;
      window.speechSynthesis.speak(u);
    } catch (e) {}
  }

  function irMenu() { if (location.hash === '#/' || !location.hash) ruta(); else location.hash = '#/'; }

  function nota(t) { return '<p class="nota">' + esc(t) + '</p>'; }

  // ---------- ¿Quién juega? ----------
  function quien() {
    var tarjetas = estado.perfiles.map(function (p, i) {
      var e = AJUSTES.edadDe(p.nac);
      return '<button class="tarjeta jugador" data-id="' + esc(p.id) + '" style="--c:' + COLORES[i % COLORES.length] + '"><span class="ico" aria-hidden="true">' +
        esc(p.nombre.charAt(0).toUpperCase()) + '</span><span><b>' + esc(p.nombre) + '</b><small>' + (e !== null ? e + ' años' : '') + '</small></span></button>';
    }).join('');
    app.innerHTML = '<h2>¿Quién va a jugar?</h2>' + chispa('¡Hola! Elige quién juega hoy.') + tarjetas +
      (estado.perfiles.length < PERFILES.MAX ? '<p class="accion"><button id="nuevo" class="sec">➕ Nuevo jugador</button></p>' : nota('Ya hay cuatro jugadores en este teléfono.')) +
      nota('Todo se queda en este teléfono. No se envía a nadie.');
    var cs = app.querySelectorAll('.jugador'), i;
    for (i = 0; i < cs.length; i++) cs[i].onclick = function () {
      estado = PERFILES.activar(estado, this.getAttribute('data-id')); guardar(); elegido = true; aplicar(); irMenu();
    };
    if ($('nuevo')) $('nuevo').onclick = function () { reiniciarAsistente(); paso1(); };
  }

  // ---------- Asistente de perfil nuevo (una cosa por pantalla) ----------
  function reiniciarAsistente() { var a = new Date().getFullYear(); W = { nombre: '', anio: a - 9, mes: 1, apoyos: [], adulto: false }; }

  function atras(fn) { return '<p class="accion"><button class="sec chico" id="atras">← Atrás</button></p>'; }

  function paso1() {
    app.innerHTML = '<h2>Vamos a conocernos</h2>' + chispa('¡Hola! Soy Chispa. ¿Cómo te llamas? Puede ser tu apodo.') +
      '<p><label class="campo" for="nombre">Tu nombre</label><input id="nombre" type="text" maxlength="20" autocomplete="off" autocapitalize="words" value="' + esc(W.nombre) + '"></p>' +
      '<p id="error" class="error" role="alert"></p><p class="accion"><button id="sigue">Seguir</button></p>' +
      (estado.perfiles.length ? '<p class="accion"><button class="sec chico" id="cancelar">Cancelar</button></p>' : '') +
      nota('Tu nombre se queda en este teléfono. No se envía a nadie.');
    $('sigue').onclick = function () {
      var n = AJUSTES.limpiarNombre($('nombre').value);
      if (!n) { $('error').textContent = 'Escribe tu nombre con letras.'; return; }
      W.nombre = n; paso2();
    };
    $('nombre').onkeydown = function (e) { if (e.key === 'Enter') $('sigue').onclick(); };
    if ($('cancelar')) $('cancelar').onclick = quien;
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
    var r = PERFILES.crear(estado, { nombre: W.nombre, anio: W.anio, mes: W.mes, apoyos: W.apoyos, adulto: W.adulto }, new Date(), localStorage);
    if (!r.ok) {
      app.innerHTML = '<h2>Ups</h2>' + chispa(r.error === 'lleno' ? 'Ya hay cuatro jugadores en este teléfono. Borra uno en Ajustes para añadir otro.' : 'Algo no salió bien. Vuelve a intentarlo.') +
        '<p class="accion"><button id="volver">Volver</button></p>';
      $('volver').onclick = function () { estado.perfiles.length ? quien() : paso1(); };
      return;
    }
    estado = r.estado; guardar(); elegido = true;
    var a = aplicar();
    app.innerHTML = '<h2>¡Listo, ' + esc(W.nombre) + '!</h2>' + chispa('¡Todo listo! Así voy a ayudarte:') +
      '<ul class="resumen">' + AJUSTES.resumen(a).map(function (f) { return '<li>' + esc(f) + '</li>'; }).join('') + '</ul>' +
      '<p class="accion"><button id="jugar">¡A jugar!</button></p>' + nota('Puedes cambiar esto cuando quieras en ⚙ Ajustes.');
    $('jugar').onclick = irMenu;
  }

  // ---------- Ajustes ----------
  function ajustes(aviso) {
    var p = actual();
    if (!p) { entrar(); return; }
    var sel = p.apoyos.slice(), a = aj(), ex = p.extras, confirmar = '';
    function interruptor(id, texto, valor) {
      return '<button class="sec interruptor" data-k="' + id + '" aria-pressed="' + !!valor + '">' + esc(texto) + '</button>';
    }
    var esc3 = [['Normal', 1], ['Grande', 1.3], ['Muy grande', 1.6]].map(function (o) {
      return '<button class="sec escala" data-v="' + o[1] + '" aria-pressed="' + (Math.abs(a.escala - o[1]) < 0.05) + '">' + o[0] + '</button>';
    }).join('');
    var voz = (p.sesionesVoz.length || a.voz) ? '<h3>Mi práctica de voz</h3><pre class="resumen-voz" id="resumen-voz">' + esc(PERFILES.resumenSesiones(p)) + '</pre><p><button class="sec" id="copiar">Copiar resumen</button></p>' : '';
    app.innerHTML = '<a class="volver" href="#/">← Menú</a><h2>⚙ Ajustes de ' + esc(p.nombre) + '</h2>' + (aviso ? '<p class="ok" role="status">' + esc(aviso) + '</p>' : '') +
      '<h3>Qué te ayuda a jugar</h3>' + chipsApoyos(sel) + '<div id="zona-adulto"></div><p id="error" class="error" role="alert"></p><p class="accion"><button id="guardar-apoyos">Guardar</button></p>' +
      '<h3>Cómo se ve y suena</h3><div class="apoyos" id="escalas" role="group" aria-label="Tamaño del texto">' + esc3 + '</div>' +
      '<div class="apoyos">' + interruptor('calma', 'Menos luces y movimiento', a.calma) + interruptor('contraste', 'Más contraste', a.contraste) +
      interruptor('leerVoz', 'Leer en voz alta', a.leerVoz) + interruptor('vibrar', 'Vibración', a.vibrar) + interruptor('suave', 'Sonidos suaves', a.volumen < 1) + '</div>' +
      voz + '<h3>Mis datos</h3>' + nota('Todo se guarda solo en este teléfono. Chispa Lab no envía nada a ningún servidor.') +
      '<p class="accion"><button class="sec" id="borrar-uno">Borrar a ' + esc(p.nombre) + '</button></p><p><button class="sec" id="borrar-todo">Borrar todos los datos</button></p><div id="confirmar"></div>' +
      nota('Chispa Lab es un juego de práctica. No es un aparato médico ni da diagnósticos.');

    function pintarAdulto() {
      $('zona-adulto').innerHTML = bloqueAdulto(p.nac, sel, false);
    }
    ligarApoyos(sel, pintarAdulto);
    pintarAdulto();
    $('guardar-apoyos').onclick = function () {
      var r = PERFILES.cambiarApoyos(estado, p.id, sel, !!($('adulto') && $('adulto').checked), new Date());
      if (!r.ok) { $('error').textContent = r.error === 'adulto' ? 'Un adulto tiene que estar de acuerdo para guardar esto.' : 'No se pudo guardar.'; return; }
      estado = r.estado; guardar(); aplicar(); ajustes('Guardado.');
    };
    var es = app.querySelectorAll('.escala'), i;
    for (i = 0; i < es.length; i++) es[i].onclick = function () { cambiarExtra('escala', parseFloat(this.getAttribute('data-v'))); };
    var is = app.querySelectorAll('.interruptor');
    for (i = 0; i < is.length; i++) is[i].onclick = function () {
      var k = this.getAttribute('data-k'), on = this.getAttribute('aria-pressed') !== 'true';
      if (k === 'suave') cambiarExtra('volumen', on ? 0.4 : 1); else cambiarExtra(k, on);
    };
    function cambiarExtra(k, v) { var q = actual(); q.extras[k] = v; guardar(); aplicar(); ajustes('Guardado.'); }
    if ($('copiar')) $('copiar').onclick = function () {
      var t = PERFILES.resumenSesiones(actual());
      try { navigator.clipboard.writeText(t).then(function () { $('copiar').textContent = '¡Copiado!'; }); } catch (e) { $('copiar').textContent = 'Selecciona el texto y cópialo'; }
    };
    $('borrar-uno').onclick = function () {
      $('confirmar').innerHTML = chispa('¿Seguro? Se borra a ' + p.nombre + ' y todo su progreso de este teléfono.') + '<p class="accion"><button id="si-uno">Sí, borrar</button> <button class="sec" id="no">No</button></p>';
      $('no').onclick = function () { $('confirmar').innerHTML = ''; };
      $('si-uno').onclick = function () { estado = PERFILES.borrar(estado, p.id); guardar(); aplicar(); elegido = false; entrar(); };
    };
    $('borrar-todo').onclick = function () {
      $('confirmar').innerHTML = chispa('¿Seguro? Se borran todos los jugadores y todo el progreso de este teléfono.') + '<p class="accion"><button id="si-todo">Sí, borrar todo</button> <button class="sec" id="no">No</button></p>';
      $('no').onclick = function () { $('confirmar').innerHTML = ''; };
      $('si-todo').onclick = function () { PERFILES.borrarTodo(); estado = { activo: null, perfiles: [] }; aplicar(); elegido = false; entrar(); };
    };
  }

  /** Punto de entrada: asistente si no hay jugadores, selector si hay varios, menú si hay uno. */
  function entrar() {
    if (!estado.perfiles.length) { reiniciarAsistente(); paso1(); return; }
    if (estado.perfiles.length > 1 && !elegido) { quien(); return; }
    elegido = true; aplicar(); ruta();
  }

  aplicar();

  return {
    actual: actual, aj: aj, progreso: progreso, guardar: guardar, aplicar: aplicar, leer: leer, entrar: entrar,
    quien: quien, ajustes: ajustes, estado: function () { return estado; }
  };
})();
