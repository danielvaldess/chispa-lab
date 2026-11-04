'use strict';
// Ajustes: una pantalla principal con secciones que se llaman por su nombre (Pantalla, Sonido y vibración...)
// y una pantalla por sección, con migas, controles que dicen su estado (Sí/No o el valor) y «Guardado» en la misma fila.
// Usa PERF (perfil.js), AJUSTES, PERFILES y las globales de juego.js (app, $, esc, chispa).

var PANEL = (function () {
  var COLORES = { pantalla: '#3b82f6', sonido: '#ff9f43', ayuda: '#8a6cff', voz: '#ff5c8a', jugadores: '#2fd18b', datos: '#64748b', adultos: '#29a0b1' };
  var TAMANOS = [['Normal', 1], ['Grande', 1.3], ['Muy grande', 1.6]];
  var BRILLOS = [['Normal', 0], ['Suave', 1], ['Muy suave', 2]];
  var SONIDOS = [['Normales', 1], ['Suaves', 0.4]];
  var temporizador = 0;

  function perfil() { return PERF.actual(); }
  function nombreDe(lista, valor) {
    for (var i = 0; i < lista.length; i++) if (Math.abs(lista[i][1] - valor) < 0.05) return lista[i][0];
    return lista[0][0];
  }
  function sino(v) { return v ? 'Sí' : 'No'; }

  // ---------- piezas ----------
  function migas(seccion) { return '<nav class="migas" aria-label="Dónde estás">Ajustes › <b>' + esc(seccion) + '</b></nav>'; }
  function cabecera(titulo, icono, color, seccion) {
    return '<p class="accion"><button class="sec chico" id="atras">← ' + (seccion ? 'Ajustes' : 'Menú') + '</button></p>' +
      (seccion ? migas(seccion) : '') + '<h2 class="titulo-aj" style="--c:' + color + '"><span aria-hidden="true">' + icono + '</span> ' + esc(titulo) + '</h2>';
  }
  function interruptor(k, valor) {
    return '<button type="button" class="sw" role="switch" data-k="' + k + '" aria-checked="' + !!valor + '"><span class="perilla" aria-hidden="true"></span><span class="sw-txt">' + sino(valor) + '</span></button>';
  }
  function segmentado(k, opciones, actual) {
    return '<div class="seg" role="radiogroup" data-k="' + k + '">' + opciones.map(function (o) {
      var on = Math.abs(o[1] - actual) < 0.05;
      return '<button type="button" class="sec" role="radio" data-v="' + o[1] + '" aria-checked="' + on + '">' + (on ? '✔ ' : '') + esc(o[0]) + '</button>';
    }).join('') + '</div>';
  }
  function fila(titulo, desc, control, extra) {
    return '<div class="fila-aj"><div class="txt"><b>' + esc(titulo) + '</b><small>' + esc(desc) + '</small></div><div class="ctl-aj">' + control + '</div>' +
      '<span class="guardado" role="status" aria-live="polite"></span>' + (extra || '') + '</div>';
  }
  function avisarGuardado(el) {
    var f = el; while (f && !(f.className || '').match(/fila-aj/)) f = f.parentNode;
    var g = f && f.querySelector('.guardado'); if (!g) return;
    g.textContent = '✔ Guardado'; clearTimeout(temporizador);
    temporizador = setTimeout(function () { g.textContent = ''; }, 2200);
  }
  function ponerAtras(fn) { $('atras').onclick = fn; }

  /** Cambia un ajuste de este jugador, lo guarda y lo aplica sin volver a dibujar la pantalla. */
  function cambiarExtra(k, v) {
    var p = perfil(); p.extras[k] = v; PERF.guardar(); PERF.aplicar();
  }
  function ligarInterruptores(clave) {
    var sw = app.querySelectorAll('.sw'), i;
    for (i = 0; i < sw.length; i++) sw[i].onclick = function () {
      var on = this.getAttribute('aria-checked') !== 'true', k = this.getAttribute('data-k');
      cambiarExtra(k, on);
      this.setAttribute('aria-checked', on); this.querySelector('.sw-txt').textContent = sino(on);
      avisarGuardado(this);
      if (k === 'leerVoz' && on) hablar('Así te leeré lo que dice Chispa.');
    };
  }
  function ligarSegmentos(listas) {
    var gs = app.querySelectorAll('.seg'), i;
    for (i = 0; i < gs.length; i++) {
      (function (g) {
        var k = g.getAttribute('data-k'), bs = g.querySelectorAll('button'), j;
        for (j = 0; j < bs.length; j++) bs[j].onclick = function () {
          var v = parseFloat(this.getAttribute('data-v')); cambiarExtra(k, v);
          var todos = g.querySelectorAll('button'), m;
          for (m = 0; m < todos.length; m++) {
            var on = todos[m] === this; todos[m].setAttribute('aria-checked', on);
            todos[m].textContent = (on ? '✔ ' : '') + todos[m].textContent.replace('✔ ', '');
          }
          avisarGuardado(this);
        };
      })(gs[i]);
    }
  }
  function hablar(t) {
    VOZ.hablar(t);
  }

  // ---------- pantalla principal ----------
  function principal(aviso) {
    var p = perfil(); if (!p) { PERF.entrar(); return; }
    var a = PERF.aj(), est = PERF.estado();
    var ayudas = a.apoyos.map(function (id) { var x = AJUSTES.APOYOS.filter(function (ap) { return ap.id === id; })[0]; return x ? x.texto : id; });
    var tarjetas = [
      { id: 'pantalla', ico: '🖥', t: 'Pantalla', s: nombreDe(TAMANOS, a.escala) + ' · ' + (a.contraste ? 'Contraste alto' : 'Contraste normal') + ' · Brillo ' + nombreDe(BRILLOS, a.brillo).toLowerCase() },
      { id: 'sonido', ico: '🔊', t: 'Sonido y vibración', s: 'Sonidos ' + (a.volumen < 1 ? 'suaves' : 'normales') + ' · Vibración: ' + sino(a.vibrar) + ' · Leer en voz alta: ' + sino(a.leerVoz) },
      { id: 'ayuda', ico: '🧩', t: 'Qué me ayuda a jugar', s: ayudas.length ? ayudas.join(', ') : 'Nada marcado' },
      (p.sesionesVoz.length || a.voz) ? { id: 'voz', ico: '🗣', t: 'Mi práctica de voz', s: p.sesionesVoz.length ? p.sesionesVoz.length + ' sesiones guardadas' : 'Todavía no hay sesiones' } : null,
      { id: 'jugadores', ico: '👤', t: 'Jugadores', s: p.nombre + (est.perfiles.length > 1 ? ' + ' + (est.perfiles.length - 1) + ' más' : '') },
      { id: 'datos', ico: '🔒', t: 'Mis datos', s: 'Solo en este teléfono' }
    ].filter(Boolean);
    if (PANEL.adultos) tarjetas.push({ id: 'adultos', ico: '👩‍🏫', t: 'Para adultos y docentes', s: 'Cómo va ' + p.nombre + ' y una guía breve' });
    app.innerHTML = cabecera('Ajustes', '⚙', '#1d2250', '') + '<p class="sub-aj">Jugador: <b>' + esc(p.nombre) + '</b></p>' + (aviso ? '<p class="ok" role="status">' + esc(aviso) + '</p>' : '') +
      '<div class="hub">' + tarjetas.map(function (c) {
        return '<button class="tarjeta seccion" data-s="' + c.id + '" style="--c:' + COLORES[c.id] + '"><span class="ico" aria-hidden="true">' + c.ico + '</span><span><b>' + esc(c.t) + '</b><small>' + esc(c.s) + '</small></span></button>';
      }).join('') + '</div>';
    ponerAtras(function () { document.body.classList.remove('en-ajustes'); PERF.volver(); });
    var bs = app.querySelectorAll('.seccion'), i;
    for (i = 0; i < bs.length; i++) bs[i].onclick = function () { abrir(this.getAttribute('data-s')); };
  }

  // ---------- secciones ----------
  function pantalla() {
    var a = PERF.aj();
    app.innerHTML = cabecera('Pantalla', '🖥', COLORES.pantalla, 'Pantalla') +
      fila('Tamaño de letra', 'Para leer mejor los textos del juego.', segmentado('escala', TAMANOS, a.escala), '<p class="muestra">Así se ve el texto en el juego.</p>') +
      fila('Contraste alto', 'Colores más fuertes para ver mejor.', interruptor('contraste', a.contraste)) +
      fila('Brillo de la pantalla', 'Oscurece un poco la pantalla si la luz te molesta.', segmentado('brillo', BRILLOS, a.brillo)) +
      fila('Menos luces y movimiento', 'Sin destellos, sacudidas ni confeti.', interruptor('calma', a.calma));
    ponerAtras(function () { abrir(); }); ligarInterruptores(); ligarSegmentos();
  }
  function sonido() {
    var a = PERF.aj();
    app.innerHTML = cabecera('Sonido y vibración', '🔊', COLORES.sonido, 'Sonido y vibración') +
      fila('Sonidos', 'Qué tan fuertes suenan los efectos del juego.', segmentado('volumen', SONIDOS, a.volumen)) +
      fila('Vibración', 'El teléfono vibra cuando aciertas.', interruptor('vibrar', a.vibrar)) +
      fila('Leer en voz alta', 'Chispa te lee lo que dice. Funciona si tu teléfono tiene voz en español.', interruptor('leerVoz', a.leerVoz), '<button class="sec chico" id="probar" type="button">▶ Probar la voz</button> <button class="sec chico" id="otra-voz" type="button">🔁 Otra voz</button>');
    ponerAtras(function () { abrir(); }); ligarInterruptores(); ligarSegmentos();
    $('probar').onclick = function () { hablar('Hola, soy Chispa. Así te leeré los mensajes.'); };
    $('otra-voz').onclick = function () { VOZ.cambiar(); hablar('Hola, soy Chispa. ¿Te gusta cómo suena esta voz?'); };
  }
  function ayuda() {
    var p = perfil(), sel = p.apoyos.slice();
    var chips = AJUSTES.APOYOS.map(function (ap) {
      return '<button class="sec apoyo" type="button" data-id="' + ap.id + '" aria-pressed="' + (sel.indexOf(ap.id) >= 0) + '"><span aria-hidden="true">' + ap.icono + '</span> ' + esc(ap.texto) + '</button>';
    }).join('');
    app.innerHTML = cabecera('Qué me ayuda a jugar', '🧩', COLORES.ayuda, 'Qué me ayuda a jugar') +
      '<p class="sub-aj">Marca lo que quieras. Así el juego se adapta a ti. No hace falta marcar nada.</p><div class="apoyos">' + chips + '</div>' +
      '<div id="vista-previa" class="previa"></div><div id="zona-adulto"></div><p id="error" class="error" role="alert"></p>' +
      '<p class="accion"><button id="guardar-apoyos" type="button">Guardar</button></p>';
    ponerAtras(function () { abrir(); });
    function previa() {
      var f = AJUSTES.resumen(AJUSTES.ajustesDe({ nac: p.nac, apoyos: sel }));
      $('vista-previa').innerHTML = '<b>Con esto, el juego:</b><ul>' + f.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>';
      $('zona-adulto').innerHTML = PERFILES.necesitaAdulto(p.nac, sel) ? '<label class="adulto"><input type="checkbox" id="adulto"> Un adulto (mamá, papá, tutor o docente) está conmigo y está de acuerdo.</label>' : '';
    }
    var bs = app.querySelectorAll('.apoyo'), i;
    for (i = 0; i < bs.length; i++) bs[i].onclick = function () {
      var id = this.getAttribute('data-id'), k = sel.indexOf(id);
      if (k >= 0) sel.splice(k, 1); else sel.push(id);
      this.setAttribute('aria-pressed', k < 0); previa();
    };
    previa();
    $('guardar-apoyos').onclick = function () {
      var r = PERFILES.cambiarApoyos(PERF.estado(), p.id, sel, !!($('adulto') && $('adulto').checked), new Date());
      if (!r.ok) { $('error').textContent = r.error === 'adulto' ? 'Un adulto tiene que estar de acuerdo para guardar esto.' : 'No se pudo guardar.'; return; }
      PERF.fijarEstado(r.estado); PERF.guardar(); PERF.aplicar(); principal('✔ Guardado. Ya cambié el juego para ti.');
    };
  }
  function voz() {
    var p = perfil();
    app.innerHTML = cabecera('Mi práctica de voz', '🗣', COLORES.voz, 'Mi práctica de voz') +
      '<p class="sub-aj">Aquí queda el registro de «El globo largo». Un adulto puede copiarlo para llevarlo a un especialista.</p>' +
      '<pre class="resumen-voz">' + esc(PERFILES.resumenSesiones(p)) + '</pre><p class="accion"><button class="sec" id="copiar" type="button">Copiar resumen</button></p>';
    ponerAtras(function () { abrir(); });
    $('copiar').onclick = function () {
      try { navigator.clipboard.writeText(PERFILES.resumenSesiones(perfil())).then(function () { $('copiar').textContent = '✔ Copiado'; }); } catch (e) { $('copiar').textContent = 'Selecciona el texto y cópialo'; }
    };
  }
  function jugadores() {
    var est = PERF.estado(), activo = est.activo;
    app.innerHTML = cabecera('Jugadores', '👤', COLORES.jugadores, 'Jugadores') +
      '<div id="lista">' + est.perfiles.map(function (p) {
        var e = AJUSTES.edadDe(p.nac);
        return '<div class="fila-aj"><div class="txt"><b>' + esc(p.nombre) + (p.id === activo ? ' · jugando ahora' : '') + '</b><small>' + (e !== null ? e + ' años' : '') + '</small></div>' +
          '<div class="ctl-aj">' + (p.id === activo ? '' : '<button class="sec chico cambiar" type="button" data-id="' + esc(p.id) + '">Jugar con ' + esc(p.nombre) + '</button> ') +
          '<button class="sec chico quitar" type="button" data-id="' + esc(p.id) + '">Borrar</button></div></div>';
      }).join('') + '</div>' + (est.perfiles.length < PERFILES.MAX ? '<p class="accion"><button id="nuevo-j" type="button">➕ Nuevo jugador</button></p>' : '<p class="nota">Ya hay cuatro jugadores en este teléfono.</p>') + '<div id="confirmar"></div>';
    ponerAtras(function () { abrir(); });
    var cs = app.querySelectorAll('.cambiar'), qs = app.querySelectorAll('.quitar'), i;
    for (i = 0; i < cs.length; i++) cs[i].onclick = function () { PERF.fijarEstado(PERFILES.activar(PERF.estado(), this.getAttribute('data-id'))); PERF.guardar(); PERF.aplicar(); jugadores(); };
    for (i = 0; i < qs.length; i++) qs[i].onclick = function () {
      var id = this.getAttribute('data-id'), q = PERF.estado().perfiles.filter(function (x) { return x.id === id; })[0];
      $('confirmar').innerHTML = chispa('¿Seguro? Se borra a ' + q.nombre + ' y todo su progreso de este teléfono.') + '<p class="accion"><button id="si-uno" type="button">Sí, borrar</button> <button class="sec" id="no" type="button">No</button></p>';
      $('no').onclick = function () { $('confirmar').innerHTML = ''; };
      $('si-uno').onclick = function () {
        PERF.fijarEstado(PERFILES.borrar(PERF.estado(), id)); PERF.guardar(); PERF.aplicar();
        if (!PERF.estado().perfiles.length) { PERF.entrar(); return; }
        jugadores();
      };
    };
    if ($('nuevo-j')) $('nuevo-j').onclick = function () { PERF.nuevo(); };
  }
  function datos() {
    app.innerHTML = cabecera('Mis datos', '🔒', COLORES.datos, 'Mis datos') +
      '<div class="fila-aj"><div class="txt"><b>Dónde se guarda</b><small>Tu nombre, el mes y año en que naciste, lo que te ayuda y tu progreso se guardan solo en este teléfono. Chispa Lab no envía nada a ningún sitio, y la cámara y el micrófono no guardan nada.</small></div></div>' +
      '<p class="accion"><button class="sec" id="borrar-todo" type="button">Borrar todos los datos</button></p><div id="confirmar"></div>' +
      '<p class="nota">Chispa Lab es un juego de práctica. No es un aparato médico ni da diagnósticos.</p>';
    ponerAtras(function () { abrir(); });
    $('borrar-todo').onclick = function () {
      $('confirmar').innerHTML = chispa('¿Seguro? Se borran todos los jugadores y todo el progreso de este teléfono.') + '<p class="accion"><button id="si-todo" type="button">Sí, borrar todo</button> <button class="sec" id="no" type="button">No</button></p>';
      $('no').onclick = function () { $('confirmar').innerHTML = ''; };
      $('si-todo').onclick = function () { PERFILES.borrarTodo(); PERF.fijarEstado({ activo: null, perfiles: [] }); PERF.aplicar(); PERF.entrar(); };
    };
  }

  // ---------- para adultos y docentes ----------
  var IDEAS = {
    rampa: 'Al doblar el ángulo de la rampa, la canica tarda menos, pero no la mitad.',
    pendulo: 'Un péndulo tarda lo mismo con objetos de distinto peso: solo cambia con el largo del hilo.',
    voz: 'Una nota más aguda vibra más veces por segundo.',
    globo: 'Al sostener una vocal, el tono se mantiene casi plano.',
    luz: 'Un objeto se ve de un color porque devuelve esa luz; una sombra aparece cuando algo tapa la luz.',
    burbujas: 'Una cámara detecta el movimiento comparando fotos seguidas.',
    hilo: 'El tiempo de un péndulo depende del largo del hilo, y crece más despacio que el largo (4 veces más hilo, el doble de tiempo).',
    col: 'La col morada es un indicador: cambia de color según sea ácido o base lo que se le echa.',
    huevo: 'Un objeto flota si es menos denso que el líquido; al disolver sal, el agua se vuelve más densa y puede hacer flotar un huevo.',
    volcan: 'El vinagre y el bicarbonato reaccionan y sueltan gas; la reacción para cuando se acaba uno de los dos (reactivo limitante), por eso hay un tope.'
  };
  function nivelDe(id) { return buscarNivel(id); }
  function estrellasTxt(n) { var s = ''; for (var i = 0; i < 3; i++) s += i < n ? '★' : '☆'; return s; }

  function adultos() {
    var p = perfil(), r = PERFILES.resumenAprendizaje(p), n;
    var filas = r.filas.map(function (f) {
      n = nivelDe(f.id);
      return '<li><b>' + (n ? n.icono + ' ' + esc(n.titulo) : esc(f.id)) + '</b><br><small>' + f.partidas + (f.partidas === 1 ? ' partida' : ' partidas') + ' · predijo bien ' + f.predOk + ' de ' + f.partidas + ' · ' + (f.minutos < 1 ? 'menos de 1 min' : f.minutos + ' min') + ' · ' + estrellasTxt(f.estrellas) + '</small></li>';
    }).join('');
    var dificil = '';
    if (r.masDificil) {
      n = nivelDe(r.masDificil);
      dificil = '<div class="previa"><b>Lo que más le cuesta a ' + esc(p.nombre) + '</b><p>' + esc(IDEAS[r.masDificil] || '') + '</p>' +
        (n ? '<p><b>Para conversar:</b> ' + esc(n.pred.q) + '</p>' : '') + '</div>';
    }
    var tutorOn = PERF.aj().tutor;
    var dominio = NIVELES.map(function (nv) {
      var m = p.maestria[nv.id]; if (!m) return '';
      var pc = Math.round(m.p * 100);
      return '<li><b>' + nv.icono + ' ' + esc(nv.titulo) + '</b> · ' + TUTOR.etiqueta(m.p) + '<div class="barra" role="img" aria-label="Dominio estimado ' + pc + ' por ciento"><i style="width:' + pc + '%"></i></div><small>' + esc(TUTOR.porQue(m)) + '</small></li>';
    }).join('');
    var porReforzar = PERFILES.ideasPorReforzar(p).map(function (x) {
      var nv = nivelDe(x.nivel);
      return '<li><b>' + (nv ? nv.icono + ' ' + esc(nv.titulo) : esc(x.nivel)) + '</b><br><small>' + esc(x.texto) + ' (Chispa lo estima con ' + Math.round(x.p * 100) + ' % de probabilidad, tras ' + x.n + (x.n === 1 ? ' respuesta' : ' respuestas') + '.)</small></li>';
    }).join('');
    var bloqueIdeas = '<div class="fila-aj"><div class="txt"><b>Ideas por reforzar</b><small>Las respuestas de ' + esc(p.nombre) + ' dejan pistas de qué idea puede estar confundiendo. Es una estimación para conversar, no un diagnóstico.</small></div>' +
      (porReforzar ? '<ul class="lista-aprendizaje">' + porReforzar + '</ul>' : '<p class="muestra">Todavía no hay ideas que reforzar. Aparecerán si alguna respuesta se repite.</p>') + '</div>';
    var prog = DESCUBRIMIENTOS.progreso(p.descubrimientos || []);
    var bloqueLibre = '<div class="fila-aj"><div class="txt"><b>Mi laboratorio (juego libre)</b><small>' + esc(p.nombre) + ' lleva ' + prog.tiene + ' de ' + prog.total + ' descubrimientos: ' +
      Object.keys(DESCUBRIMIENTOS.ESTACIONES).map(function (k) { return DESCUBRIMIENTOS.ESTACIONES[k].emoji + ' ' + DESCUBRIMIENTOS.ESTACIONES[k].nombre + ' ' + prog.porEstacion[k].tiene + '/' + prog.porEstacion[k].total; }).join(' · ') +
      '. Es juego sin notas ni tiempo: sirve para conversar sobre qué probó y por qué cree que pasó.</small></div></div>';
    var bloqueTutor = '<div class="fila-aj"><div class="txt"><b>Dominio de ideas</b><small>Lo que Chispa estima de cada idea, con un cálculo de probabilidades que se hace solo en este teléfono. No es una nota ni un diagnóstico.</small></div>' +
      (dominio ? '<ul class="lista-aprendizaje">' + dominio + '</ul>' : '<p class="muestra">Todavía no hay datos. Aparecerán cuando termine algún juego.</p>') + '</div>' +
      bloqueLibre + bloqueIdeas +
      fila('IA de Chispa', 'Chispa sugiere el siguiente juego, ajusta el margen al empezar y arma preguntas y pistas con los datos de ' + esc(p.nombre) + '. Todo se calcula en este teléfono. Si la apagas, deja de recordar lo que aprende y usa mensajes fijos.', interruptor('tutor', tutorOn)) +
      '<p class="accion"><button class="sec" id="reiniciar-tutor" type="button">Reiniciar lo que Chispa sabe de ' + esc(p.nombre) + '</button></p><div id="confirmar"></div>' +
      '<div class="fila-aj"><div class="txt"><b>¿Cómo decide Chispa?</b><small>Cada vez que termina un juego, suma una pista: si ' + esc(p.nombre) + ' predijo bien y si logró el reto con soltura. Con esas pistas sube o baja su estimación de cada idea. Después recomienda el juego donde hay más por aprender y da un poco más de margen al empezar si le cuesta. ' +
      'También calcula, con probabilidades, qué idea puede estar confundiendo según las respuestas que elige, y aprende si a ' + esc(p.nombre) + ' le sirve más una pista de una vez o que Chispa pregunte primero. No usa internet ni guarda nada fuera de este teléfono. Un adulto siempre puede apagarlo o borrarlo.</small></div></div>';
    app.innerHTML = cabecera('Para adultos y docentes', '👩‍🏫', COLORES.adultos, 'Para adultos y docentes') +
      '<p class="sub-aj">Un resumen sencillo para acompañar a ' + esc(p.nombre) + '. Es una guía de observación, no una evaluación oficial.</p>' +
      '<div class="fila-aj"><div class="txt"><b>Cómo va ' + esc(p.nombre) + '</b><small>' + (r.filas.length ? 'Tiempo jugado: ' + (r.minutosTotal < 1 ? 'menos de 1 min' : r.minutosTotal + ' min') : 'Todavía no hay partidas. Cuando termine un juego aparecerá aquí.') + '</small></div>' +
      (filas ? '<ul class="lista-aprendizaje">' + filas + '</ul>' : '') + '</div>' + dificil + bloqueTutor +
      '<div class="fila-aj"><div class="txt"><b>Guía breve para el aula</b></div><ol class="guia">' +
      '<li><b>Un teléfono por grupo</b> de 2 o 3 niños. Una vez abierta, la app funciona sin internet.</li>' +
      '<li><b>Primero predicen.</b> Antes de jugar piden a los niños que digan qué creen que pasará y por qué.</li>' +
      '<li><b>Después comparan</b> con lo que pasó. Cada juego termina con una pregunta para conversar.</li>' +
      '<li><b>Comparte la app sin internet:</b> pasa el archivo de la app de un teléfono a otro o ábrela desde un solo enlace.</li></ol></div>' +
      '<p class="nota">Los datos se quedan en este teléfono. Para llevar el registro de voz a un especialista, usa «Mi práctica de voz».</p>';
    ponerAtras(function () { abrir(); });
    ligarInterruptores();
    $('reiniciar-tutor').onclick = function () {
      $('confirmar').innerHTML = chispa('¿Seguro? Chispa olvida lo que sabe de ' + p.nombre + '. Su progreso y sus estrellas no se borran.') + '<p class="accion"><button id="si-tutor" type="button">Sí, reiniciar</button> <button class="sec" id="no" type="button">No</button></p>';
      $('no').onclick = function () { $('confirmar').innerHTML = ''; };
      $('si-tutor').onclick = function () { PERFILES.reiniciarMaestria(perfil()); PERF.guardar(); adultos(); };
    };
  }

  var VISTAS = { adultos: adultos, pantalla: pantalla, sonido: sonido, ayuda: ayuda, voz: voz, jugadores: jugadores, datos: datos };
  function abrir(vista, aviso) {
    clearTimeout(temporizador); window.scrollTo(0, 0);
    if (vista && PANEL.vistas[vista]) PANEL.vistas[vista](); else principal(aviso);
  }

  return { abrir: abrir, vistas: VISTAS, adultos: true, cabecera: cabecera, fila: fila, ideas: IDEAS };
})();
