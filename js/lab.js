'use strict';
// Chispa Lab · laboratorio con sensores. Sin dependencias; evita sintaxis moderna por los celulares viejos.

var KEY = 'chispalab.lab.v1';
var app = document.getElementById('app');
var store = {};
try { store = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { store = {}; }

function guardar() { try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) {} }
function esc(s) {
  return String(s).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}
function corrida(id) {
  if (!store[id]) store[id] = { hip: null, puntos: [], concl: '' };
  return store[id];
}
function $(id) { return document.getElementById(id); }
function redondear(v, d) { var k = Math.pow(10, d); return Math.round(v * k) / k; }

// ---------- Definición de experimentos (datos, no código) ----------
var EXPERIMENTOS = [
  {
    id: 'pendulo', icono: '⏱', titulo: 'Péndulo', sensor: 'acelerómetro',
    pregunta: '¿De qué depende el tiempo que tarda un péndulo en ir y volver?',
    hipotesis: [
      { id: 'sube', texto: 'Mientras más largo el hilo, más tarda cada vaivén.' },
      { id: 'baja', texto: 'Mientras más largo el hilo, menos tarda cada vaivén.' },
      { id: 'igual', texto: 'El largo del hilo no cambia el tiempo del vaivén.' }
    ],
    montaje: [
      'Cuelga el teléfono de un hilo dentro de una bolsa o funda, bien sujeto, con la pantalla hacia ti.',
      'Mide el largo del hilo desde el punto de sujeción hasta el teléfono, en centímetros.',
      'Cambia solo el largo. Suelta con un ángulo pequeño, siempre parecido.'
    ],
    x: { nombre: 'Largo del hilo', unidad: 'cm', min: 10, max: 300, paso: 1, ejemplo: 50 },
    y: { nombre: 'Período', unidad: 's', dec: 2 }
  },
  {
    id: 'pulso', icono: '❤', titulo: 'Pulso', sensor: 'cámara',
    pregunta: '¿Qué le pasa al ritmo del corazón después de hacer ejercicio suave?',
    hipotesis: [
      { id: 'sube', texto: 'Después del ejercicio el pulso sube.' },
      { id: 'baja', texto: 'Después del ejercicio el pulso baja.' },
      { id: 'igual', texto: 'El ejercicio no cambia el pulso.' }
    ],
    montaje: [
      'Es una estimación educativa, no una medición médica. No se guarda ningún dato de salud fuera de este teléfono.',
      'Haz el ejercicio solo si quieres y te sientes bien: 20 saltos suaves o subir y bajar un escalón. Puedes elegir quedarte en reposo.',
      'Cubre la cámara trasera (y el flash, si hay) con la yema del dedo, sin apretar. Quédate quieto 20 segundos.'
    ],
    x: { etiquetas: ['Reposo', 'Después del ejercicio'] },
    y: { nombre: 'Pulso', unidad: 'latidos/min', dec: 0 }
  },
  {
    id: 'sonido', icono: '🔊', titulo: 'Sonido de la botella', sensor: 'micrófono',
    pregunta: '¿Cómo cambia el tono de una botella cuando cambia la cantidad de agua?',
    hipotesis: [
      { id: 'sube', texto: 'Con más agua el sonido es más agudo.' },
      { id: 'baja', texto: 'Con más agua el sonido es más grave.' },
      { id: 'igual', texto: 'La cantidad de agua no cambia el tono.' }
    ],
    montaje: [
      'Usa una botella transparente y agua. Mide la altura del agua desde el fondo, en centímetros.',
      'Sopla de lado sobre la boca de la botella, como silbando, con el teléfono cerca del cuello de la botella.',
      'Cambia solo el nivel del agua y sopla siempre de forma parecida.'
    ],
    x: { nombre: 'Altura del agua', unidad: 'cm', min: 0, max: 40, paso: 0.5, ejemplo: 5 },
    y: { nombre: 'Frecuencia', unidad: 'Hz', dec: 0 }
  }
];

function buscar(id) {
  for (var i = 0; i < EXPERIMENTOS.length; i++) if (EXPERIMENTOS[i].id === id) return EXPERIMENTOS[i];
  return null;
}

// ---------- Captura de sensores ----------
function esperar(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

async function capturarMovimiento(segundos, alTick) {
  if (typeof DeviceMotionEvent !== 'undefined' && DeviceMotionEvent.requestPermission) {
    try { await DeviceMotionEvent.requestPermission(); } catch (e) {}
  }
  var muestras = [], t0 = performance.now();
  function en(e) {
    var a = e.accelerationIncludingGravity;
    if (!a || a.x == null) return;
    var t = (performance.now() - t0) / 1000;
    muestras.push({ t: t, v: Math.sqrt(a.x * a.x + a.y * a.y + a.z * a.z) });
  }
  window.addEventListener('devicemotion', en);
  var inicio = performance.now();
  while (performance.now() - inicio < segundos * 1000) {
    await esperar(250);
    if (alTick) alTick((performance.now() - inicio) / 1000, muestras.length);
  }
  window.removeEventListener('devicemotion', en);
  return muestras;
}

async function capturarPulso(segundos, alTick) {
  var flujo = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: 'environment', width: { ideal: 160 }, height: { ideal: 120 } }, audio: false
  });
  var pista = flujo.getVideoTracks()[0], linterna = false;
  try {
    var caps = pista.getCapabilities ? pista.getCapabilities() : {};
    if (caps.torch) { await pista.applyConstraints({ advanced: [{ torch: true }] }); linterna = true; }
  } catch (e) {}
  var video = document.createElement('video');
  video.srcObject = flujo; video.muted = true; video.setAttribute('playsinline', '');
  await video.play();
  var c = document.createElement('canvas'); c.width = 24; c.height = 24;
  var cx = c.getContext('2d');
  var muestras = [], conDedo = 0, total = 0, t0 = performance.now();
  while (performance.now() - t0 < segundos * 1000) {
    cx.drawImage(video, 0, 0, 24, 24);
    var d = cx.getImageData(0, 0, 24, 24).data, r = 0, g = 0, n = d.length / 4;
    for (var i = 0; i < d.length; i += 4) { r += d[i]; g += d[i + 1]; }
    r /= n; g /= n;
    muestras.push({ t: (performance.now() - t0) / 1000, v: r });
    total++;
    if (r > 60 && r / (g + 1) > 1.5) conDedo++;
    if (alTick) alTick((performance.now() - t0) / 1000, r > 60 && r / (g + 1) > 1.5);
    await esperar(33);
  }
  flujo.getTracks().forEach(function (t) { t.stop(); });
  return { muestras: muestras, linterna: linterna, fraccionDedo: total ? conDedo / total : 0 };
}

async function capturarSonido(segundos, alTick) {
  var flujo = await navigator.mediaDevices.getUserMedia({
    audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false }
  });
  var AC = window.AudioContext || window.webkitAudioContext;
  var ctx = new AC();
  var an = ctx.createAnalyser();
  an.fftSize = 4096; an.smoothingTimeConstant = 0;
  ctx.createMediaStreamSource(flujo).connect(an);
  var buf = new Float32Array(an.frequencyBinCount), lecturas = [], t0 = performance.now();
  while (performance.now() - t0 < segundos * 1000) {
    an.getFloatFrequencyData(buf);
    var r = DSP.dominantFreq(buf, ctx.sampleRate, an.fftSize, 150, 3000);
    if (r.level > -55) lecturas.push(r.freq);
    if (alTick) alTick((performance.now() - t0) / 1000, r);
    await esperar(60);
  }
  flujo.getTracks().forEach(function (t) { t.stop(); });
  try { ctx.close(); } catch (e) {}
  return lecturas;
}

// ---------- Tutor local (sin red): hace preguntas, no da la conclusión ----------
function tendencia(ex, run) {
  var pts = run.puntos, rel;
  if (ex.id === 'pulso') {
    var rep = pts.filter(function (p) { return p.x === 0; }).map(function (p) { return p.y; });
    var eje = pts.filter(function (p) { return p.x === 1; }).map(function (p) { return p.y; });
    if (!rep.length || !eje.length) return null;
    rel = (DSP.mean(eje) - DSP.mean(rep)) / DSP.mean(rep);
  } else {
    var xs = pts.map(function (p) { return p.x; });
    if (pts.length < 3 || Math.max.apply(null, xs) === Math.min.apply(null, xs)) return null;
    var f = DSP.fit(pts);
    if (!f) return null;
    rel = f.m * (Math.max.apply(null, xs) - Math.min.apply(null, xs)) / DSP.mean(pts.map(function (p) { return p.y; }));
  }
  return Math.abs(rel) < 0.05 ? 'igual' : (rel > 0 ? 'sube' : 'baja');
}

function tutor(ex, run) {
  var m = [], n = run.puntos.length;
  if (!run.hip) return ['Antes de medir, elige una hipótesis. ¿Qué crees que va a pasar y por qué?'];
  if (n === 0) return ['Haz tu primera medición. Mientras tanto, piensa: ¿qué número esperas obtener?'];

  if (ex.id === 'pulso') {
    var tienen = [0, 1].map(function (v) { return run.puntos.some(function (p) { return p.x === v; }); });
    if (!tienen[0]) m.push('Te falta una medición en reposo. ¿Con qué vas a comparar?');
    if (!tienen[1]) m.push('Te falta una medición después del ejercicio. ¿Qué haría que las dos mediciones sean justas?');
    m.push('Repite cada condición al menos 2 veces. ¿Por qué una sola medición puede engañar?');
  } else if (n < 3) {
    m.push('Con ' + (n === 1 ? 'un solo valor' : 'dos valores') + ' es difícil ver una relación. ¿Qué otro valor probarías? Cambia solo ' + ex.x.nombre.toLowerCase() + '.');
  }

  var t = tendencia(ex, run);
  if (t) {
    if (t === run.hip) {
      m.push('Tus datos van en la misma dirección que tu hipótesis. ¿Es suficiente para estar seguro? ¿Qué otra explicación podría dar los mismos datos?');
    } else {
      m.push('Tus datos no coinciden con tu hipótesis. ¿Qué pudo cambiar además de lo que querías cambiar? ¿Vale la pena repetir alguna medición?');
    }
  }
  if (ex.id === 'pendulo' && n >= 3) {
    var g = DSP.gravityFromPendulum(run.puntos);
    if (g && Math.abs(g - 9.8) / 9.8 > 0.15) m.push('Tu estimación de g se aleja bastante de lo esperado. ¿Dónde pudo haber error: al medir el largo, al sujetar el teléfono, en el ángulo?');
    if (g) m.push('Si duplicas el largo, ¿el período también se duplica? Revisa tus números antes de decidir.');
  }
  if (ex.id === 'sonido' && n >= 3) m.push('¿La relación parece una línea recta o se curva? ¿Qué te dice eso?');
  if (!m.length) m.push('Revisa tus datos. ¿Qué conclusión puedes escribir, y qué evidencia la sostiene?');
  return m;
}

// ---------- Gráfica ----------
function dibujar(canvas, pts, ex) {
  var W = canvas.width, H = canvas.height, P = { l: 46, r: 12, t: 12, b: 34 };
  var cx = canvas.getContext('2d');
  var estilo = getComputedStyle(document.body), txt = estilo.color;
  cx.clearRect(0, 0, W, H);
  cx.font = '13px system-ui,sans-serif'; cx.fillStyle = txt; cx.strokeStyle = txt; cx.lineWidth = 1.5;
  if (!pts.length) { cx.fillText('Aún no hay datos', P.l, H / 2); return; }
  var xs = pts.map(function (p) { return p.x; }), ys = pts.map(function (p) { return p.y; });
  var x0 = Math.min.apply(null, xs), x1 = Math.max.apply(null, xs);
  var y0 = Math.min.apply(null, ys), y1 = Math.max.apply(null, ys);
  if (ex.id === 'pulso') { x0 = -0.4; x1 = 1.4; }
  else { var mx = (x1 - x0) * 0.1 || 1; x0 -= mx; x1 += mx; }
  var my = (y1 - y0) * 0.15 || Math.abs(y1) * 0.1 || 1; y0 -= my; y1 += my;
  function X(v) { return P.l + (v - x0) / (x1 - x0) * (W - P.l - P.r); }
  function Y(v) { return H - P.b - (v - y0) / (y1 - y0) * (H - P.t - P.b); }
  cx.beginPath(); cx.moveTo(P.l, P.t); cx.lineTo(P.l, H - P.b); cx.lineTo(W - P.r, H - P.b); cx.stroke();
  for (var i = 0; i <= 3; i++) {
    var v = y0 + (y1 - y0) * i / 3;
    cx.fillText(redondear(v, ex.y.dec + (ex.y.dec === 0 ? 0 : 0)), 4, Y(v) + 4);
  }
  if (ex.id === 'pulso') {
    cx.fillText('Reposo', X(0) - 20, H - 14); cx.fillText('Ejercicio', X(1) - 28, H - 14);
  } else {
    for (var j = 0; j <= 3; j++) {
      var u = x0 + (x1 - x0) * j / 3;
      cx.fillText(redondear(u, 0), X(u) - 10, H - 14);
    }
    cx.fillText(ex.x.nombre + ' (' + ex.x.unidad + ')', P.l, H - 1);
  }
  pts.forEach(function (p, k) {
    cx.beginPath(); cx.arc(X(p.x), Y(p.y), 6, 0, 7); cx.fillStyle = txt; cx.fill();
    cx.strokeStyle = estilo.backgroundColor; cx.lineWidth = 2; cx.stroke(); cx.strokeStyle = txt; cx.lineWidth = 1.5;
    if (ex.id !== 'pulso') cx.fillText(String(k + 1), X(p.x) + 8, Y(p.y) - 6);
  });
}

// ---------- Vistas ----------
function inicio() {
  var tarjetas = EXPERIMENTOS.map(function (ex) {
    var r = store[ex.id], n = r ? r.puntos.length : 0;
    var est = r && r.concl ? '<span class="estado-ok">✔ Conclusión escrita</span>' :
      (n ? n + ' medición(es)' : 'Sin empezar');
    return '<a class="tarjeta" href="#/e/' + ex.id + '"><b>' + ex.icono + ' ' + esc(ex.titulo) + '</b><br>' +
      esc(ex.pregunta) + '<br><span class="meta">Usa: ' + ex.sensor + ' · ' + est + '</span></a>';
  }).join('');
  app.innerHTML =
    '<h2>Laboratorio de ciencias en tu teléfono</h2>' +
    '<p>Elige un experimento. En cada uno haces una hipótesis, mides con el teléfono, miras tus datos y sacas tu propia conclusión. ' +
    'El tutor te hace preguntas; la respuesta la encuentras tú.</p>' + tarjetas;
}

function resumenTexto(ex, run) {
  var l = ['Chispa Lab · ' + ex.titulo, 'Pregunta: ' + ex.pregunta];
  var h = ex.hipotesis.filter(function (x) { return x.id === run.hip; })[0];
  l.push('Hipótesis: ' + (h ? h.texto : '(sin elegir)'));
  run.puntos.forEach(function (p, i) {
    var x = ex.id === 'pulso' ? ex.x.etiquetas[p.x] : p.x + ' ' + ex.x.unidad;
    l.push((i + 1) + '. ' + x + ' → ' + p.y + ' ' + ex.y.unidad);
  });
  l.push('Conclusión: ' + (run.concl || '(sin escribir)'));
  return l.join('\n');
}

function experimento(id) {
  var ex = buscar(id);
  if (!ex) { location.hash = '#/'; return; }
  var run = corrida(id);

  var hip = ex.hipotesis.map(function (h) {
    return '<label class="op"><input type="radio" name="hip" value="' + h.id + '"' + (run.hip === h.id ? ' checked' : '') + '>' + esc(h.texto) + '</label>';
  }).join('');
  var montaje = '<ol>' + ex.montaje.map(function (m) { return '<li>' + esc(m) + '</li>'; }).join('') + '</ol>';

  var entrada = ex.id === 'pulso'
    ? '<label for="cond">Condición</label><select id="cond"><option value="0">Reposo</option><option value="1">Después del ejercicio</option></select>'
    : '<label for="xval">' + esc(ex.x.nombre) + ' (' + ex.x.unidad + ')</label><input id="xval" type="number" inputmode="decimal" min="' + ex.x.min + '" max="' + ex.x.max + '" step="' + ex.x.paso + '" value="' + ex.x.ejemplo + '">';

  var botones = {
    pendulo: '<button id="medir">Medir con el acelerómetro (12 s)</button><button id="manual" class="sec">Medir tocando</button>',
    pulso: '<button id="medir">Medir pulso (20 s)</button>',
    sonido: '<button id="medir">Medir tono (4 s)</button>'
  }[id];

  app.innerHTML =
    '<a class="volver" href="#/">← Inicio</a><h2>' + ex.icono + ' ' + esc(ex.titulo) + '</h2>' +
    '<section><h3>1. Pregunta</h3><p>' + esc(ex.pregunta) + '</p></section>' +
    '<section><h3>2. Tu hipótesis</h3>' + hip + '</section>' +
    '<section><h3>3. Montaje</h3>' + montaje + '</section>' +
    '<section><h3>4. Medir</h3>' + entrada + botones +
    '<p id="estado-med" role="status" aria-live="polite"></p><div id="resultado-med"></div></section>' +
    '<section><h3>5. Tus datos</h3><div id="datos"></div></section>' +
    '<section><h3>6. El tutor pregunta</h3><div id="tutor"></div></section>' +
    '<section><h3>7. Tu conclusión</h3><label for="concl">¿Se cumplió tu hipótesis? ¿Qué datos lo muestran?</label>' +
    '<textarea id="concl">' + esc(run.concl) + '</textarea>' +
    '<button id="guardar-concl">Guardar conclusión</button><button id="copiar" class="sec">Copiar resumen</button>' +
    '<p id="estado-concl" role="status"></p></section>';

  var propuesta = null; // medición pendiente de guardar

  function xActual() {
    if (id === 'pulso') return parseInt($('cond').value, 10);
    return parseFloat($('xval').value);
  }
  function estado(t, aviso) { var e = $('estado-med'); e.textContent = t; e.className = aviso ? 'aviso' : ''; }
  function ocupado(b) { var m = $('medir'), mn = $('manual'); if (m) m.disabled = b; if (mn) mn.disabled = b; }

  function repintar() {
    var filas = run.puntos.map(function (p, i) {
      var x = id === 'pulso' ? ex.x.etiquetas[p.x] : p.x + ' ' + ex.x.unidad;
      return '<tr><td>' + (i + 1) + '</td><td>' + esc(x) + '</td><td>' + p.y + ' ' + ex.y.unidad + '</td>' +
        '<td><button class="sec" data-borrar="' + i + '" aria-label="Borrar medición ' + (i + 1) + '">Borrar</button></td></tr>';
    }).join('');
    var extra = '';
    if (id === 'pendulo' && run.puntos.length >= 3) {
      var g = DSP.gravityFromPendulum(run.puntos);
      if (g) extra = '<p>Con tus datos, g ≈ <b>' + redondear(g, 1) + ' m/s²</b>. Compáralo con lo que esperabas.</p>';
    }
    $('datos').innerHTML = run.puntos.length
      ? '<canvas id="grafica" width="360" height="240" role="img" aria-label="Gráfica de tus mediciones"></canvas>' +
        '<table><tr><th>#</th><th>' + esc(id === 'pulso' ? 'Condición' : ex.x.nombre) + '</th><th>' + esc(ex.y.nombre) + '</th><th></th></tr>' + filas + '</table>' + extra
      : '<p>Todavía no hay mediciones.</p>';
    if (run.puntos.length) dibujar($('grafica'), run.puntos, ex);
    $('tutor').innerHTML = tutor(ex, run).map(function (t) { return '<div class="tutor"><p>' + esc(t) + '</p></div>'; }).join('');
  }

  function ofrecer(valorTxt, y, nota) {
    propuesta = { x: xActual(), y: y };
    $('resultado-med').innerHTML = '<p class="cifra">' + valorTxt + '</p>' + (nota ? '<p class="aviso">' + esc(nota) + '</p>' : '') +
      '<button id="aceptar">Guardar esta medición</button><button id="descartar" class="sec">Descartar</button>';
    $('aceptar').onclick = function () {
      if (propuesta) { run.puntos.push(propuesta); propuesta = null; guardar(); $('resultado-med').innerHTML = ''; estado('Medición guardada.'); repintar(); }
    };
    $('descartar').onclick = function () { propuesta = null; $('resultado-med').innerHTML = ''; estado(''); };
  }

  function validarX() {
    if (id === 'pulso') return true;
    var v = xActual();
    if (isNaN(v) || v < ex.x.min || v > ex.x.max) { estado('Escribe un valor entre ' + ex.x.min + ' y ' + ex.x.max + ' ' + ex.x.unidad + '.', true); return false; }
    return true;
  }
  function hipElegida() {
    if (!run.hip) { estado('Primero elige tu hipótesis (paso 2).', true); return false; }
    return true;
  }

  Array.prototype.forEach.call(app.querySelectorAll('input[name=hip]'), function (r) {
    r.onchange = function () { run.hip = r.value; guardar(); repintar(); };
  });

  $('medir').onclick = async function () {
    if (!hipElegida() || !validarX()) return;
    ocupado(true); $('resultado-med').innerHTML = '';
    try {
      if (id === 'pendulo') {
        estado('Suelta el péndulo ahora. Midiendo…');
        var ms = await capturarMovimiento(12, function (t, n) { estado('Midiendo… ' + Math.max(0, Math.ceil(12 - t)) + ' s (' + n + ' lecturas)'); });
        if (ms.length < 30) { estado('No llegaron datos del acelerómetro. Prueba «Medir tocando».', true); }
        else {
          var r = DSP.pendulumPeriod(ms);
          if (!r) estado('No se detectó un movimiento regular. Revisa el montaje y repite.', true);
          else { estado('Listo.'); ofrecer(redondear(r.period, 2) + ' s', redondear(r.period, 2), r.quality < 0.6 ? 'La señal es débil: repite para estar seguro.' : ''); }
        }
      } else if (id === 'pulso') {
        estado('Cubre la cámara con el dedo y no te muevas.');
        var p = await capturarPulso(20, function (t, dedo) { estado((dedo ? 'Dedo detectado. ' : 'Cubre bien el lente. ') + Math.max(0, Math.ceil(20 - t)) + ' s'); });
        var hr = DSP.heartRate(p.muestras);
        if (!hr || p.fraccionDedo < 0.6) estado('No se pudo leer el pulso. Cubre todo el lente sin apretar y repite.', true);
        else {
          estado('Listo.');
          ofrecer(Math.round(hr.bpm) + ' latidos/min', Math.round(hr.bpm),
            (hr.quality < 0.7 ? 'La señal es irregular: repite. ' : '') + (p.linterna ? '' : 'Sin flash: la lectura puede ser menos precisa.'));
        }
      } else {
        estado('Sopla sobre la botella ahora…');
        var ls = await capturarSonido(4, function (t, r2) { estado('Escuchando… ' + Math.round(r2.freq) + ' Hz'); });
        if (ls.length < 8) estado('Casi no se oyó sonido. Acerca el teléfono y sopla más fuerte.', true);
        else { var f = Math.round(DSP.median(ls)); estado('Listo.'); ofrecer(f + ' Hz', f, ''); }
      }
    } catch (e) {
      estado('No se pudo usar el sensor (' + (e && e.name ? e.name : 'error') + '). Revisa los permisos del navegador.', true);
    }
    ocupado(false);
  };

  if ($('manual')) {
    $('manual').onclick = function () {
      if (!hipElegida() || !validarX()) return;
      var toques = [];
      $('resultado-med').innerHTML = '<p>Toca el botón cada vez que el péndulo vuelva a su punto de partida (un vaivén completo). Mínimo 6 toques.</p>' +
        '<button id="toque">Toque</button><button id="fin" class="sec">Terminar</button><p id="cuenta"></p>';
      $('toque').onclick = function () { toques.push(performance.now() / 1000); $('cuenta').textContent = toques.length + ' toques'; };
      $('fin').onclick = function () {
        if (toques.length < 6) { $('cuenta').textContent = 'Faltan toques (mínimo 6).'; return; }
        var iv = []; for (var i = 1; i < toques.length; i++) iv.push(toques[i] - toques[i - 1]);
        var T = redondear(DSP.median(iv), 2);
        $('resultado-med').innerHTML = ''; estado('Listo.'); ofrecer(T + ' s', T, 'Medición manual.');
      };
    };
  }

  $('datos').onclick = function (e) {
    var b = e.target.getAttribute && e.target.getAttribute('data-borrar');
    if (b !== null && b !== undefined) { run.puntos.splice(parseInt(b, 10), 1); guardar(); repintar(); }
  };
  $('guardar-concl').onclick = function () { run.concl = $('concl').value; guardar(); $('estado-concl').textContent = 'Conclusión guardada en este teléfono.'; };
  $('copiar').onclick = function () {
    run.concl = $('concl').value; guardar();
    var t = resumenTexto(ex, run);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(t).then(function () { $('estado-concl').textContent = 'Resumen copiado.'; },
        function () { $('estado-concl').textContent = 'No se pudo copiar.'; });
    } else { $('estado-concl').textContent = 'Tu navegador no permite copiar.'; }
  };
  repintar();
}

function ruta() {
  var h = location.hash || '#/', m = h.match(/^#\/e\/(\w+)/);
  window.scrollTo(0, 0);
  if (m) experimento(m[1]); else inicio();
}
window.addEventListener('hashchange', ruta);

function pintarEstado() {
  $('estado').textContent = navigator.onLine ? 'Con conexión' : 'Sin conexión (funciona igual)';
}
window.addEventListener('online', pintarEstado);
window.addEventListener('offline', pintarEstado);
pintarEstado();
ruta();

if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('sw.js').catch(function () {});
}
