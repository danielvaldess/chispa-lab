'use strict';
// Pantallas de la clase (ES5): el alumno muestra su avance en un QR y el docente lo escanea o lo pega, sin internet.
// Depende de clase.js, perfiles.js y de las globales de juego.js (app, $, esc, chispa) solo cuando se abre una pantalla.
// Las librerías de QR (js/vendor) se cargan solo aquí, la primera vez que se necesitan, y quedan guardadas para usarlas sin conexión.
// Todo se queda en el teléfono: no se envía nada a ningún servidor.

var ALUMNOS = (function () {
  var flujo = null, temporizador = 0, detector = null, lienzo = null, ultimo = { texto: '', t: 0 }, cargando = {}, pendiente = '';

  function perfil() { return PERF.actual(); }
  function nota(t) { return '<p class="nota">' + esc(t) + '</p>'; }
  function sonar() { try { if (typeof audio === 'function') audio(); if (typeof sonido === 'function') sonido('clic'); } catch (e) {} }
  function vibrar(p) { try { if (navigator.vibrate && AJ_ACT.vibrar) navigator.vibrate(p); } catch (e) {} }

  var MENSAJES = {
    formato: 'Ese código no es de Chispa Lab.',
    version: 'Ese código es de otra versión de Chispa Lab. Actualiza la app en los dos teléfonos.',
    crc: 'El código está incompleto o tiene un error. Pídele al alumno que lo vuelva a mostrar.',
    datos: 'El código trae datos que no entiendo.'
  };
  var ESTADOS = {
    nuevo: 'añadido a tu lista', actualizado: 'avance actualizado', igual: 'ya tenías este mismo avance',
    antiguo: 'ya tenías un avance más nuevo de este alumno', lleno: 'tu lista está llena (60 alumnos)', invalido: 'no se pudo añadir'
  };

  /** Carga un script una sola vez. Devuelve una promesa. */
  function cargar(src, global) {
    if (window[global]) return Promise.resolve();
    if (cargando[src]) return cargando[src];
    cargando[src] = new Promise(function (ok, mal) {
      var s = document.createElement('script');
      s.src = src; s.onload = function () { window[global] ? ok() : mal(new Error('sin ' + global)); };
      s.onerror = function () { delete cargando[src]; mal(new Error('No se pudo cargar ' + src)); };
      document.head.appendChild(s);
    });
    return cargando[src];
  }

  // ---------- Cámara ----------
  function cerrarCamara() {
    clearTimeout(temporizador); temporizador = 0;
    if (flujo) { try { flujo.getTracks().forEach(function (t) { t.stop(); }); } catch (e) {} flujo = null; }
    var v = $('visor'); if (v) { try { v.pause(); v.srcObject = null; } catch (e) {} }
  }

  function estrellasTxt(n) { var t = '', i; for (i = 0; i < 3; i++) t += i < n ? '★' : '☆'; return t; }
  function estrellasSolo(n) { var t = '', i; for (i = 0; i < n; i++) t += '★'; return t; }

  function haceCuanto(a) {
    var d = CLASE.diasDesde(a);
    return d === 0 ? 'de hoy' : d === 1 ? 'de ayer' : 'de hace ' + d + ' días';
  }

  // ---------- QR del alumno ----------
  function dibujarQR(texto, cont) {
    var q = qrcode(0, 'M'); q.addData(texto); q.make();
    var n = q.getModuleCount(), quiet = 4, ancho = Math.min(window.innerWidth - 56, 340), mod = Math.max(4, Math.floor(ancho / (n + 2 * quiet))), px = (n + 2 * quiet) * mod;
    var c = document.createElement('canvas'); c.width = px; c.height = px; c.className = 'qr';
    c.style.width = px + 'px'; c.style.height = px + 'px';
    c.setAttribute('role', 'img'); c.setAttribute('aria-label', 'Código QR con tu avance para tu docente');
    var g = c.getContext('2d'), r, k;
    g.fillStyle = '#fff'; g.fillRect(0, 0, px, px); g.fillStyle = '#000';
    for (r = 0; r < n; r++) for (k = 0; k < n; k++) if (q.isDark(r, k)) g.fillRect((k + quiet) * mod, (r + quiet) * mod, mod, mod);
    cont.innerHTML = ''; cont.appendChild(c);
  }

  /** Pantalla del alumno: qué se comparte y el QR. */
  function compartir() {
    var p = perfil();
    if (!p) { PERF.entrar(); return; }
    var r = CLASE.resumenAlumno(CLASE.resumirPerfil(p));
    app.innerHTML = '<a class="volver" href="#/">← Menú</a><h2>📤 Compartir con mi docente</h2>' +
      chispa('Tu docente puede ver cómo vas, sin internet. Se lo muestras tú, cuando quieras.') +
      '<div class="caja-info"><b>Tu docente verá:</b><ul>' +
      '<li>Tu nombre: <b>' + esc(p.nombre) + '</b></li><li>Estrellas: <b>' + r.estrellas + ' de ' + r.estrellasMax + '</b></li><li>Partidas: <b>' + r.partidas + '</b>' +
      (r.acierto !== null ? ' y predicciones acertadas: <b>' + r.acierto + ' %</b>' : '') + '</li><li>Minutos jugados: <b>' + r.minutos + '</b></li>' +
      '<li>Descubrimientos: <b>' + r.descubrimientos + ' de ' + r.descubrimientosMax + '</b></li></ul>' +
      '<b>No verá:</b> tu fecha de nacimiento, lo que te ayuda a jugar, tus sesiones de voz ni tu cuaderno.</div>' +
      '<p class="accion"><button id="mostrar">Mostrar mi código QR</button></p><div id="zona-qr" aria-live="polite"></div>' +
      nota('El código se hace en este momento con tu avance de hoy. Solo se lo enseñas a tu docente.');
    $('mostrar').onclick = function () {
      sonar();
      var codigo = CLASE.codigoDe(p), z = $('zona-qr');
      if (!codigo) { z.innerHTML = '<p class="error" role="alert">No se pudo hacer el código.</p>'; return; }
      $('mostrar').disabled = true;
      z.innerHTML = '<p>Preparando…</p>';
      cargar('js/vendor/qrcode.min.js', 'qrcode').then(function () {
        dibujarQR(codigo, z);
        try { z.scrollIntoView({ block: 'center' }); } catch (e) {}
        var hora = new Date(); var hh = ('0' + hora.getHours()).slice(-2) + ':' + ('0' + hora.getMinutes()).slice(-2);
        z.insertAdjacentHTML('beforeend', '<p class="nota">Código hecho a las ' + hh + '. Sube el brillo de la pantalla para que se lea mejor.</p>' +
          '<p class="accion"><button id="copiar-cod" class="sec">📋 Copiar el código</button> <button id="enviar-cod" class="sec">📨 Enviar el código</button></p>' +
          '<p class="nota">Si el QR no se lee, copia el código o envíalo por WhatsApp, Bluetooth o Nearby Share, y tu docente lo pega en «Mis alumnos».</p>' +
          '<p><textarea id="texto-cod" class="codigo" readonly rows="3" aria-label="Código de tu avance">' + esc(codigo) + '</textarea></p>');
        $('mostrar').textContent = 'Hacer otro código con mi avance de ahora'; $('mostrar').disabled = false;
        $('copiar-cod').onclick = function () {
          sonar();
          var ok = function () { $('copiar-cod').textContent = '✔ Copiado'; };
          try { navigator.clipboard.writeText(codigo).then(ok, function () { $('texto-cod').select(); }); } catch (e) { $('texto-cod').select(); }
        };
        if (navigator.share) $('enviar-cod').onclick = function () { sonar(); try { navigator.share({ title: 'Mi avance en Chispa Lab', text: codigo }).catch(function () {}); } catch (e) {} };
        else $('enviar-cod').hidden = true;
      }).catch(function () {
        z.innerHTML = '<p class="error" role="alert">No se pudo preparar el QR. Usa el código de texto.</p><p><textarea class="codigo" readonly rows="3">' + esc(codigo) + '</textarea></p>';
        $('mostrar').disabled = false;
      });
    };
  }

  // ---------- Lista del docente ----------
  function filaAlumno(a) {
    var r = CLASE.resumenAlumno(a);
    return '<button class="tarjeta alumno" data-id="' + esc(a.id) + '" style="--c:#7c3aed"><span class="ico" aria-hidden="true">' + esc(a.nombre.charAt(0).toUpperCase()) + '</span><span><b>' + esc(a.nombre) +
      '</b><small>⭐ ' + r.estrellas + '/' + r.estrellasMax + (r.acierto !== null ? ' · aciertos ' + r.acierto + ' %' : '') + ' · ' + esc(haceCuanto(a)) + '</small></span></button>';
  }

  function ir(h) {
    cerrarCamara();
    var m = /^#\/alumnos\/ver\/([A-Za-z0-9]+)$/.exec(h);
    if (h === '#/compartir') compartir();
    else if (h === '#/alumnos/escanear') escanear();
    else if (h === '#/alumnos/pegar') pegar();
    else if (h === '#/alumnos/grupos') grupos();
    else if (m) detalle(m[1]);
    else lista();
  }

  function irA(h) { if (location.hash === h) ir(h); else location.hash = h; }

  function lista() {
    cerrarCamara();
    var aviso = pendiente; pendiente = '';
    var p = perfil();
    if (!p) { PERF.entrar(); return; }
    if (!PERFILES.esDocente(p)) {
      app.innerHTML = '<a class="volver" href="#/">← Menú</a><h2>👩‍🏫 Mis alumnos</h2>' + chispa('Esta opción es para docentes. Si eres docente, crea un jugador nuevo y elige «Soy docente».') +
        '<p class="accion"><a class="btn" href="#/compartir">📤 Compartir mi avance con mi docente</a></p>';
      return;
    }
    var n = p.alumnos.length;
    app.innerHTML = '<a class="volver" href="#/">← Menú</a><h2>👩‍🏫 Mis alumnos</h2>' +
      chispa(n ? 'Tienes ' + n + (n === 1 ? ' alumno' : ' alumnos') + '. Escanea su QR otra vez para ver cómo avanzan.' : 'Cada alumno te muestra su QR desde «Compartir con mi docente», y tú lo escaneas. No hace falta internet.') +
      (aviso ? '<p class="ok" role="status">' + esc(aviso) + '</p>' : '') +
      '<p class="accion"><button id="escanear">📷 Escanear el QR de un alumno</button> <button id="pegar" class="sec">⌨ Pegar un código</button></p>' +
      (n ? p.alumnos.map(filaAlumno).join('') + '<p class="accion">' + (n >= AGRUPAR.MIN_ALUMNOS ? '<button id="agrupar">🤖 Agrupar mi clase</button> ' : '') + '<button id="copiar-clase" class="sec chico">📋 Copiar el resumen de la clase</button></p>' +
        (n < AGRUPAR.MIN_ALUMNOS ? '<p class="nota">Con ' + AGRUPAR.MIN_ALUMNOS + ' alumnos o más, Chispa puede agruparlos según lo que les cuesta.</p>' : '') : '') +
      nota('La lista se guarda solo en este teléfono, con el avance del momento en que escaneaste cada código. Si borras la app, se pierde.');
    $('escanear').onclick = function () { sonar(); irA('#/alumnos/escanear'); };
    $('pegar').onclick = function () { sonar(); irA('#/alumnos/pegar'); };
    if ($('agrupar')) $('agrupar').onclick = function () { sonar(); irA('#/alumnos/grupos'); };
    var bs = app.querySelectorAll('.alumno'), i;
    for (i = 0; i < bs.length; i++) bs[i].onclick = function () { sonar(); irA('#/alumnos/ver/' + this.getAttribute('data-id')); };
    if ($('copiar-clase')) $('copiar-clase').onclick = function () {
      sonar();
      var t = CLASE.resumenClase(p.alumnos);
      try { navigator.clipboard.writeText(t).then(function () { $('copiar-clase').textContent = '✔ Copiado'; }); } catch (e) { $('copiar-clase').textContent = 'No se pudo copiar'; }
    };
  }

  function detalle(id) {
    var p = perfil(), a = p && p.alumnos.filter(function (x) { return x.id === id; })[0];
    if (!a) { irA('#/alumnos'); return; }
    var r = CLASE.resumenAlumno(a);
    var filas = CLASE.JUEGOS.map(function (j, i) {
      var pct = a.j[i] ? Math.round(100 * a.k[i] / a.j[i]) + ' %' : '–';
      return '<tr><td>' + esc(CLASE.TITULOS[j]) + '</td><td>' + estrellasTxt(a.e[i]) + '</td><td>' + a.j[i] + '</td><td>' + pct + '</td></tr>';
    }).join('');
    var exps = CLASE.TODOS.slice(CLASE.JUEGOS.length).map(function (j, i) {
      var e = a.e[CLASE.JUEGOS.length + i]; return e ? esc(CLASE.TITULOS[j]) + ' ' + estrellasSolo(e) : '';
    }).filter(Boolean);
    app.innerHTML = '<a class="volver" href="#/alumnos">← Mis alumnos</a><h2>' + esc(a.nombre) + '</h2>' +
      chispa('Avance ' + haceCuanto(a) + ' (' + r.fecha + '). Es un juego de práctica, no una evaluación.') +
      '<div class="caja-info"><b>⭐ ' + r.estrellas + ' de ' + r.estrellasMax + '</b> · partidas ' + r.partidas + (r.acierto !== null ? ' · predicciones acertadas <b>' + r.acierto + ' %</b>' : '') +
      ' · ' + r.minutos + ' min · descubrimientos ' + r.descubrimientos + '/' + r.descubrimientosMax +
      (r.juegoDificil ? '<br>Le cuesta más: <b>' + esc(CLASE.TITULOS[r.juegoDificil]) + '</b>. Conviene conversarlo con preguntas, sin dar la respuesta.' : '') + '</div>' +
      '<table class="tabla-al"><thead><tr><th>Juego</th><th>Estrellas</th><th>Partidas</th><th>Aciertos</th></tr></thead><tbody>' + filas + '</tbody></table>' +
      (exps.length ? '<p class="nota">Experimentos: ' + exps.join(' · ') + '</p>' : '') +
      '<p class="accion"><button id="quitar" class="sec">🗑 Quitar de mi lista</button></p>';
    $('quitar').onclick = function () {
      sonar();
      this.outerHTML = '<p class="adulto">¿Quitar a ' + esc(a.nombre) + ' de tu lista? Su teléfono no cambia.</p><p class="accion"><button id="si-quitar">Sí, quitar</button> <button id="no-quitar" class="sec">No</button></p>';
      $('si-quitar').onclick = function () { PERFILES.quitarAlumno(p, a.id); PERF.guardar(); pendiente = a.nombre + ' se quitó de tu lista.'; irA('#/alumnos'); };
      $('no-quitar').onclick = function () { detalle(a.id); };
    };
  }

  /** Procesa un código leído (de la cámara o pegado). Devuelve { ok, texto } con un mensaje para el docente. */
  function recibir(texto) {
    var p = perfil(), r = CLASE.leer(texto);
    if (!r.ok) return { ok: false, texto: MENSAJES[r.error] || MENSAJES.formato };
    var res = PERFILES.agregarAlumno(p, r.alumno);
    if (res.ok) PERF.guardar();
    return { ok: res.ok, texto: r.alumno.nombre + ': ' + (ESTADOS[res.estado] || res.estado), alumno: r.alumno };
  }

  // ---------- Agrupar la clase (aprendizaje automático en el teléfono del docente) ----------
  var COLORES_GRUPO = ['#ef4444', '#f59e0b', '#22c55e'];
  function grupos() {
    var p = perfil();
    if (!p || !PERFILES.esDocente(p)) { irA('#/alumnos'); return; }
    var r = AGRUPAR.agrupar(p.alumnos);
    var cab = '<a class="volver" href="#/alumnos">← Mis alumnos</a><h2>🤖 Agrupar mi clase</h2>';
    if (!r.ok) {
      app.innerHTML = cab + chispa('Necesito al menos ' + r.minimo + ' alumnos para compararlos. Escanea el QR de unos cuantos más.');
      return;
    }
    var tarjetas = r.grupos.map(function (g, i) {
      var color = r.claro ? COLORES_GRUPO[Math.min(i, 2)] : '#3b82f6';
      return '<div class="grupo" style="--c:' + color + '"><h3>' + esc(g.etiqueta) + ' <small>(' + g.ids.length + ')</small></h3>' +
        '<p class="nombres">' + g.nombres.map(esc).join(' · ') + '</p>' +
        '<p>' + (g.acierto !== null ? 'Predicciones acertadas: <b>' + Math.round(100 * g.acierto) + ' %</b> · ' : '') + 'Estrellas: <b>' + Math.round(g.estrellas) + ' de ' + g.estrellasMax + '</b></p>' +
        (g.juegoDificil ? '<p>Les cuesta más: <b>' + esc(CLASE.TITULOS[g.juegoDificil]) + '</b></p>' : '') +
        '<p class="idea">💡 ' + esc(g.sugerencia) + '</p></div>';
    }).join('');
    app.innerHTML = cab +
      chispa(r.claro ? 'Veo ' + r.k + ' grupos que se diferencian de verdad. Son sugerencias: tú decides cómo usarlas.' : 'Tu clase va pareja: no veo grupos claros, y prefiero no inventarlos. Aquí tienes un resumen de todos.') +
      tarjetas +
      '<details class="como"><summary>¿Cómo lo calculó Chispa?</summary><p>' + esc(r.explicacion) + '</p></details>' +
      '<p class="nota">Esto se calcula en tu teléfono, en el momento, y no se guarda ni se envía. No es una calificación.</p>';
  }

  // ---------- Pegar un código ----------
  function pegar() {
    app.innerHTML = '<a class="volver" href="#/alumnos">← Mis alumnos</a><h2>⌨ Pegar un código</h2>' +
      chispa('Si un alumno te mandó su código por mensaje, Bluetooth o Nearby Share, pégalo aquí.') +
      '<p><label class="campo" for="cod">Código del alumno</label><textarea id="cod" class="codigo" rows="4" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="CL1|…"></textarea></p>' +
      '<p id="resultado" role="status"></p><p class="accion"><button id="anadir">Añadir a mi lista</button></p>';
    $('anadir').onclick = function () {
      sonar();
      var r = recibir($('cod').value);
      if (r.ok) { pendiente = '✔ ' + r.texto; irA('#/alumnos'); return; }
      $('resultado').className = 'error'; $('resultado').textContent = r.texto;
    };
  }

  // ---------- Escáner ----------
  function mensajeEscaner(texto, bien) {
    var e = $('estado-esc'); if (!e) return;
    e.className = bien ? 'ok' : 'error'; e.textContent = texto;
  }

  function procesarLectura(texto) {
    var ahora = Date.now();
    if (!texto || (texto === ultimo.texto && ahora - ultimo.t < 4000)) return;
    ultimo = { texto: texto, t: ahora };
    var r = recibir(texto);
    if (r.ok) {
      vibrar(60); sonar();
      mensajeEscaner('✔ ' + r.texto, true);
      var l = $('leidos'); if (l) l.insertAdjacentHTML('afterbegin', '<li>' + esc(r.texto) + '</li>');
    } else if (/^CL\d/.test(texto) || ahora - (procesarLectura.avisado || 0) > 3000) {
      procesarLectura.avisado = ahora; vibrar([40, 40, 40]); mensajeEscaner(r.texto, false);
    }
  }

  function paso() {
    if (!flujo) return;
    var v = $('visor');
    if (v && v.readyState >= 2 && v.videoWidth) {
      if (detector) {
        detector.detect(v).then(function (res) { if (res && res[0]) procesarLectura(res[0].rawValue); }).catch(function () { detector = null; });
      } else if (window.jsQR) {
        var w = Math.min(480, v.videoWidth), h = Math.round(w * v.videoHeight / v.videoWidth);
        if (!lienzo) lienzo = document.createElement('canvas');
        lienzo.width = w; lienzo.height = h;
        var g = lienzo.getContext('2d', { willReadFrequently: true });
        g.drawImage(v, 0, 0, w, h);
        var d = g.getImageData(0, 0, w, h), c = window.jsQR(d.data, w, h, { inversionAttempts: 'dontInvert' });
        if (c) procesarLectura(c.data);
      }
    }
    temporizador = setTimeout(paso, detector ? 160 : 240);
  }

  function escanear() {
    ultimo = { texto: '', t: 0 };
    app.innerHTML = '<a class="volver" href="#/alumnos">← Mis alumnos</a><h2>📷 Escanear</h2>' +
      chispa('Apunta la cámara al QR del alumno. Puedes escanear uno detrás de otro.') +
      '<div class="visor"><video id="visor" playsinline muted autoplay></video></div>' +
      '<p id="estado-esc" role="status" aria-live="polite" class="ok">Abriendo la cámara…</p><ul id="leidos" class="leidos"></ul>' +
      '<p class="accion"><button id="terminar">Terminar</button> <button id="pegar2" class="sec">⌨ Pegar un código</button></p>' +
      nota('La imagen se queda en este teléfono: no se guarda ni se envía.');
    $('terminar').onclick = function () { sonar(); irA('#/alumnos'); };
    $('pegar2').onclick = function () { sonar(); irA('#/alumnos/pegar'); };
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { mensajeEscaner('Este teléfono no deja usar la cámara aquí. Pega el código de texto.', false); return; }
    var usarDetector = Promise.resolve(null);
    if ('BarcodeDetector' in window && window.BarcodeDetector.getSupportedFormats) {
      usarDetector = window.BarcodeDetector.getSupportedFormats().then(function (f) { return f.indexOf('qr_code') >= 0 ? new window.BarcodeDetector({ formats: ['qr_code'] }) : null; }).catch(function () { return null; });
    }
    usarDetector.then(function (d) {
      detector = d;
      return d ? null : cargar('js/vendor/jsQR.min.js', 'jsQR');
    }).then(function () {
      return navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' }, width: { ideal: 640 }, height: { ideal: 480 } }, audio: false });
    }).then(function (f) {
      if (!$('visor')) { try { f.getTracks().forEach(function (t) { t.stop(); }); } catch (e) {} return; }
      flujo = f;
      var v = $('visor'); v.srcObject = f; v.muted = true;
      var jugar = v.play(); if (jugar && jugar.catch) jugar.catch(function () {});
      mensajeEscaner('Apunta al QR del alumno.', true);
      paso();
    }).catch(function (e) {
      var denegado = e && (e.name === 'NotAllowedError' || e.name === 'SecurityError');
      mensajeEscaner(denegado ? 'No diste permiso para usar la cámara. Puedes pegar el código de texto.' : 'No se pudo abrir la cámara o cargar el lector. Puedes pegar el código de texto.', false);
    });
  }

  return { ir: ir, grupos: grupos, compartir: compartir, lista: lista, detalle: detalle, escanear: escanear, pegar: pegar, cerrarCamara: cerrarCamara, recibir: recibir };
})();
