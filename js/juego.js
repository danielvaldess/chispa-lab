'use strict';
// Chispa Lab · videojuego educativo. Sin dependencias; ES5 + async.
// Pantalla completa en vertical, objetos del hogar dibujados en canvas 2D con volumen (ligero para celulares baratos).

var app = document.getElementById('app');
var progreso = PERF.progreso(); // progreso del jugador activo (se guarda con su perfil)
function recargarProgreso() { progreso = PERF.progreso(); }

var REDUCIDO = false;
try { REDUCIDO = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
var LIGERO = REDUCIDO || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2);
var tt = 0; // reloj de animación
var PAL = { tinta: '#1d2250', amarillo: '#ffd23f', rosa: '#ff5c8a', verde: '#2fd18b', azul: '#3b82f6', naranja: '#ff9f43', morado: '#8a6cff' };
var CONF = ['#ffd23f', '#ff5c8a', '#2fd18b', '#3b82f6', '#ff9f43', '#8a6cff'];

function guardar() { PERF.guardar(); }
function $(id) { return document.getElementById(id); }
function esc(s) {
  return String(s).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}
function r(v, d) { var k = Math.pow(10, d || 0); return Math.round(v * k) / k; }
function estrellas(n) { var s = ''; for (var i = 0; i < 3; i++) s += i < n ? '★' : '☆'; return s; }
function vibra(p) { try { if (navigator.vibrate && !REDUCIDO && AJ_ACT.vibrar) navigator.vibrate(p); } catch (e) {} }

// ---------- Chispa, el robot (SVG animado con CSS) ----------
var ROBOT = '<svg class="robot" viewBox="0 0 100 100" aria-hidden="true">' +
  '<line x1="50" y1="12" x2="50" y2="24" stroke="#1d2250" stroke-width="4" stroke-linecap="round"/>' +
  '<circle class="luz" cx="50" cy="9" r="6" fill="#ffd23f" stroke="#1d2250" stroke-width="3"/>' +
  '<rect x="18" y="22" width="64" height="48" rx="18" fill="#e8f0ff" stroke="#1d2250" stroke-width="4"/>' +
  '<rect x="26" y="30" width="48" height="32" rx="12" fill="#2b3a8c"/>' +
  '<ellipse class="ojo" cx="39" cy="44" rx="6" ry="8" fill="#7cf0ff"/><ellipse class="ojo" cx="61" cy="44" rx="6" ry="8" fill="#7cf0ff"/>' +
  '<path class="boca sonrisa" d="M41 54 Q50 62 59 54" fill="none" stroke="#7cf0ff" stroke-width="3.5" stroke-linecap="round"/>' +
  '<path class="boca ceno" d="M41 59 Q50 51 59 59" fill="none" stroke="#7cf0ff" stroke-width="3.5" stroke-linecap="round"/>' +
  '<circle cx="31" cy="54" r="3" fill="#ff8fb1" opacity=".85"/><circle cx="69" cy="54" r="3" fill="#ff8fb1" opacity=".85"/>' +
  '<rect x="30" y="73" width="40" height="20" rx="10" fill="#ff9f43" stroke="#1d2250" stroke-width="4"/>' +
  '<circle class="luz" cx="50" cy="83" r="5" fill="#ffd23f"/></svg>';

function chispa(t, compacta) { return '<div class="chispa' + (compacta ? ' compacta' : '') + '">' + ROBOT + '<p id="chispa-txt">' + esc(t) + '</p></div>'; }
function decir(t, animo) {
  var e = $('chispa-txt');
  if (!e) return;
  e.textContent = t;
  PERF.leer(t);
  var b = e.parentNode, extra = b.className.indexOf('compacta') >= 0 ? ' compacta' : '';
  b.className = 'chispa' + extra;
  void b.offsetWidth; // reinicia la animación
  b.className = 'chispa habla' + extra + (animo === 'triste' ? ' triste' : '');
}

// ---------- Sonido generado (sin archivos) ----------
var sfx = null, sfxOn = true, ruido = null, rodando = null;
function audio() {
  if (!sfx) {
    try { var AC = window.AudioContext || window.webkitAudioContext; sfx = new AC(); } catch (e) { sfx = null; }
  }
  if (sfx && sfx.state === 'suspended') { try { sfx.resume(); } catch (e) {} }
  return sfx;
}
function pip(f, dur, tipo, vol, demora, f2) {
  var a = audio();
  if (!a || !sfxOn) return;
  var t0 = a.currentTime + (demora || 0), o = a.createOscillator(), g = a.createGain();
  o.type = tipo || 'sine'; o.frequency.setValueAtTime(f, t0);
  if (f2) o.frequency.exponentialRampToValueAtTime(f2, t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(Math.max(0.0002, (vol || 0.15) * AJ_ACT.volumen), t0 + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g); g.connect(a.destination);
  o.start(t0); o.stop(t0 + dur + 0.02);
}
function sonido(n) {
  if (n === 'ok') { pip(523, 0.12, 'triangle', 0.18, 0); pip(659, 0.12, 'triangle', 0.18, 0.1); pip(784, 0.22, 'triangle', 0.18, 0.2); }
  else if (n === 'mal') { pip(220, 0.18, 'sawtooth', 0.08, 0); pip(165, 0.25, 'sawtooth', 0.08, 0.12); }
  else if (n === 'clic') { pip(660, 0.06, 'square', 0.06, 0); }
  else if (n === 'fin') { [523, 659, 784, 1047].forEach(function (f, i) { pip(f, 0.2, 'triangle', 0.18, i * 0.12); }); }
  else if (n === 'canica') { pip(2100, 0.09, 'sine', 0.16, 0); pip(2900, 0.13, 'sine', 0.12, 0.04); pip(1500, 0.18, 'sine', 0.08, 0.1); }
  else if (n === 'madera') { pip(260, 0.07, 'triangle', 0.2, 0, 110); }
  else if (n === 'tic') { pip(1100, 0.04, 'square', 0.05, 0); }
  else if (n === 'tac') { pip(520, 0.05, 'triangle', 0.1, 0, 300); }
  else if (n === 'combo') { [659, 880, 1175].forEach(function (f, i) { pip(f, 0.1, 'square', 0.07, i * 0.06); }); }
}
// ruido filtrado para la canica rodando sobre cartón
function rodar(on, vel) {
  var a = audio();
  if (!a || !sfxOn) return;
  if (on) {
    if (!ruido) {
      ruido = a.createBuffer(1, a.sampleRate, a.sampleRate);
      var d = ruido.getChannelData(0);
      for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    if (!rodando) {
      var s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain();
      s.buffer = ruido; s.loop = true; f.type = 'bandpass'; f.Q.value = 1.2; g.gain.value = 0.0001;
      s.connect(f); f.connect(g); g.connect(a.destination); s.start();
      rodando = { s: s, f: f, g: g };
    }
    rodando.f.frequency.value = 350 + vel * 260;
    rodando.g.gain.value = Math.min(0.09, 0.012 + vel * 0.02);
  } else if (rodando) {
    try { rodando.g.gain.value = 0.0001; rodando.s.stop(); } catch (e) {}
    rodando = null;
  }
}

// ---------- Canvas a pantalla completa: utilidades de dibujo con volumen ----------
var cx, W, H, DPR = 1, parts = [], bgCache = null, shake = 0;
function prepararCanvas() {
  var e = $('escena'), c = $('cv');
  // el tamaño lo decide el CSS: en horizontal el lienzo deja un panel de controles a la derecha
  W = c.clientWidth || e.clientWidth || window.innerWidth; H = c.clientHeight || e.clientHeight || window.innerHeight;
  DPR = Math.min(window.devicePixelRatio || 1, LIGERO ? 1.5 : 2);
  c.width = Math.round(W * DPR); c.height = Math.round(H * DPR);
  cx = c.getContext('2d'); cx.setTransform(DPR, 0, 0, DPR, 0, 0);
  parts = []; bgCache = null;
}
// el fondo estático se dibuja una sola vez en un canvas aparte
function fondo(dibuja) {
  if (!bgCache || bgCache.w !== W || bgCache.h !== H) {
    var off = document.createElement('canvas'); off.width = Math.round(W * DPR); off.height = Math.round(H * DPR);
    var oc = off.getContext('2d'), guardado = cx;
    oc.setTransform(DPR, 0, 0, DPR, 0, 0); cx = oc; dibuja(); cx = guardado;
    bgCache = { c: off, w: W, h: H };
  }
  cx.drawImage(bgCache.c, -8, -8, W + 16, H + 16);
}
function grad(y0, y1, a, b) { var g = cx.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, a); g.addColorStop(1, b); return g; }
function gradH(x0, x1, a, b) { var g = cx.createLinearGradient(x0, 0, x1, 0); g.addColorStop(0, a); g.addColorStop(1, b); return g; }
function rr(x, y, w, h, rad) {
  cx.beginPath(); cx.moveTo(x + rad, y); cx.lineTo(x + w - rad, y); cx.arcTo(x + w, y, x + w, y + rad, rad);
  cx.lineTo(x + w, y + h - rad); cx.arcTo(x + w, y + h, x + w - rad, y + h, rad);
  cx.lineTo(x + rad, y + h); cx.arcTo(x, y + h, x, y + h - rad, rad);
  cx.lineTo(x, y + rad); cx.arcTo(x, y, x + rad, y, rad); cx.closePath();
}
function esfera(x, y, rad, claro, oscuro) {
  var g = cx.createRadialGradient(x - rad * 0.35, y - rad * 0.4, rad * 0.08, x, y, rad);
  g.addColorStop(0, '#ffffff'); g.addColorStop(0.22, claro); g.addColorStop(1, oscuro);
  cx.fillStyle = g; cx.beginPath(); cx.arc(x, y, rad, 0, 7); cx.fill();
}
function sombra(x, y, rx, ry, a) {
  cx.save(); cx.globalAlpha = a; cx.fillStyle = '#000'; cx.beginPath(); cx.ellipse(x, y, rx, ry, 0, 0, 7); cx.fill(); cx.restore();
}
function nube(x, y, s) {
  cx.fillStyle = 'rgba(255,255,255,.93)';
  [[0, 0, 14], [16, -9, 18], [34, 0, 14], [17, 4, 15]].forEach(function (c) { cx.beginPath(); cx.arc(x + c[0] * s, y + c[1] * s, c[2] * s, 0, 7); cx.fill(); });
}
function texto(t, x, y, tam, ancla, color) {
  cx.font = '700 ' + (tam || 16) + 'px system-ui,sans-serif'; cx.textAlign = ancla || 'left'; cx.fillStyle = color || PAL.tinta; cx.fillText(t, x, y);
}
function texto3d(t, x, y, tam, ancla, color) {
  cx.font = '900 ' + tam + 'px system-ui,sans-serif'; cx.textAlign = ancla || 'left';
  cx.fillStyle = 'rgba(29,34,80,.9)'; cx.fillText(t, x + 2, y + 3);
  cx.fillStyle = color || '#fff'; cx.fillText(t, x, y);
}

// Partículas (chispas, estela, polvo)
function chisporroteo(x, y, n, cols) {
  if (AJ_ACT.calma) return;
  if (LIGERO) n = Math.ceil(n / 2);
  cols = cols || CONF;
  for (var i = 0; i < n; i++) parts.push({ x: x, y: y, vx: (Math.random() - 0.5) * 340, vy: -Math.random() * 300 - 50, t: 0, vida: 0.7 + Math.random() * 0.5, c: cols[i % cols.length], r: 3 + Math.random() * 3.5 });
}
function actualizarParts(dt) {
  for (var i = parts.length - 1; i >= 0; i--) {
    var p = parts[i], gr = p.g === undefined ? 560 : p.g;
    p.t += dt; p.vy += gr * dt; p.x += p.vx * dt; p.y += p.vy * dt;
    if (p.t > p.vida) parts.splice(i, 1);
  }
}
function dibujarParts() {
  for (var i = 0; i < parts.length; i++) {
    var p = parts[i], k = 1 - p.t / p.vida;
    cx.globalAlpha = Math.max(0, k); cx.fillStyle = p.c;
    cx.beginPath(); cx.arc(p.x, p.y, Math.max(0.5, p.r * (0.5 + 0.5 * k)), 0, 7); cx.fill();
  }
  cx.globalAlpha = 1;
}

// Confeti de pantalla completa
var conf = { cv: null, cx: null, p: [], raf: 0 };
function confeti(n) {
  if (REDUCIDO || AJ_ACT.calma) return;
  if (LIGERO) n = Math.ceil(n / 2);
  if (!conf.cv) {
    conf.cv = document.createElement('canvas'); conf.cv.className = 'confeti'; document.body.appendChild(conf.cv);
    conf.cx = conf.cv.getContext('2d');
  }
  conf.cv.width = window.innerWidth; conf.cv.height = window.innerHeight;
  for (var i = 0; i < n; i++) {
    conf.p.push({ x: Math.random() * conf.cv.width, y: -10 - Math.random() * conf.cv.height * 0.4, vx: (Math.random() - 0.5) * 120,
      vy: 120 + Math.random() * 200, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 12, w: 6 + Math.random() * 6, h: 10 + Math.random() * 8, c: CONF[i % CONF.length] });
  }
  if (conf.raf) return;
  var t0 = performance.now();
  conf.raf = requestAnimationFrame(function paso(ts) {
    var dt = Math.min(0.05, (ts - t0) / 1000); t0 = ts;
    var c = conf.cx, i;
    c.clearRect(0, 0, conf.cv.width, conf.cv.height);
    for (i = conf.p.length - 1; i >= 0; i--) {
      var q = conf.p[i];
      q.x += q.vx * dt; q.y += q.vy * dt; q.rot += q.vr * dt;
      if (q.y > conf.cv.height + 20) { conf.p.splice(i, 1); continue; }
      c.save(); c.translate(q.x, q.y); c.rotate(q.rot); c.fillStyle = q.c; c.fillRect(-q.w / 2, -q.h / 2, q.w, q.h); c.restore();
    }
    if (conf.p.length) conf.raf = requestAnimationFrame(paso);
    else { conf.raf = 0; c.clearRect(0, 0, conf.cv.width, conf.cv.height); }
  });
}

// ---------- Interfaz de juego: HUD, puntos, combos, mensajes flotantes ----------
var pts = 0, combo = 0;
function flotante(txt, x, y, cls) {
  var c = $('flotantes'); if (!c) return;
  var s = document.createElement('span'); s.className = 'flot ' + (cls || ''); s.textContent = txt; s.style.left = x + 'px'; s.style.top = y + 'px';
  c.appendChild(s); setTimeout(function () { if (s.parentNode) s.parentNode.removeChild(s); }, 1200);
}
var splashT = 0;
function splash(txt, color) {
  var c = $('splash'); if (!c) return;
  c.innerHTML = '<span class="splash-t" style="--c:' + color + '">' + esc(txt) + '</span>';
  clearTimeout(splashT); splashT = setTimeout(function () { if (c) c.innerHTML = ''; }, 1150);
}
function destello() {
  var e = $('escena'); if (!e || REDUCIDO || AJ_ACT.sinDestellos) return;
  var d = document.createElement('div'); d.className = 'destello'; e.appendChild(d);
  setTimeout(function () { if (d.parentNode) d.parentNode.removeChild(d); }, 600);
}
function sumar(n, x, y) {
  pts += n;
  var e = $('ptsn'); if (e) { e.textContent = pts; var p = e.parentNode; p.className = 'hud-pts bump'; setTimeout(function () { p.className = 'hud-pts'; }, 220); }
  flotante('+' + n, x, y, 'pts');
}
function pintarCombo() {
  var c = $('combo'); if (!c) return;
  if (combo >= 2) { c.hidden = false; c.textContent = '🔥 x' + Math.min(combo, 5) + ' COMBO'; c.className = 'combo bump'; }
  else c.hidden = true;
}
function pintarPedidos(textos, hechas, actual) {
  var c = $('pedidos'); if (!c) return;
  c.innerHTML = textos.map(function (t, i) {
    return '<span class="ped' + (i < hechas ? ' hecha' : (i === actual ? ' act' : '')) + '">' + (i < hechas ? '✔ ' : (AJ_ACT.simbolos && i === actual ? '▶ ' : '')) + esc(t) + '</span>';
  }).join('');
}
/** Para quien no oye: cada tic o tac también se ve. */
function pulsoSonido(n) {
  if (!AJ_ACT.visualSonido) return;
  flotante(n === 'tic' ? '♪ tic' : '♪ tac', n === 'tic' ? W * 0.74 : W * 0.34, H * 0.3, '');
}
function sacudir(m) { if (!REDUCIDO && !AJ_ACT.calma) shake = m; }
function puntosPorAcierto(error, tol) {
  var bonus = Math.round(100 * Math.max(0, 1 - error / tol));
  combo++;
  var mult = Math.min(combo, 5), ganados = (100 + bonus) * mult;
  return { bonus: bonus, mult: mult, ganados: ganados };
}
function elogio(bonus) {
  if (bonus >= 80) return { t: '¡PERFECTO!', c: '#ffd23f' };
  if (bonus >= 40) return { t: '¡GENIAL!', c: '#2fd18b' };
  return { t: '¡BIEN!', c: '#4da3ff' };
}

// Pantalla completa (donde el navegador lo permita) y orientación vertical
function pantallaCompleta() {
  try {
    var el = document.documentElement;
    var rq = el.requestFullscreen || el.webkitRequestFullscreen;
    if (rq && !document.fullscreenElement) {
      var pr = rq.call(el);
      if (pr && pr.then) pr.then(function () {
        try { if (screen.orientation && screen.orientation.lock) screen.orientation.lock('portrait').catch(function () {}); } catch (e) {}
      }).catch(function () {});
    }
  } catch (e) {}
}

// Las barras (input range) pintan su relleno con --f (0..1); el estilo está en juego.css
function pintarBarras() {
  var rs = document.querySelectorAll('.escena input[type=range]');
  for (var i = 0; i < rs.length; i++) {
    var a = parseFloat(rs[i].min), b = parseFloat(rs[i].max);
    rs[i].style.setProperty('--f', ((rs[i].value - a) / (b - a)).toFixed(4));
  }
}
document.addEventListener('input', function (e) { if (e.target && e.target.type === 'range') pintarBarras(); });

// ---------- Sensores ----------
var sens = { theta: 0, activo: false, escuchando: false };
function pedirMovimiento() {
  try {
    if (typeof DeviceMotionEvent !== 'undefined' && DeviceMotionEvent.requestPermission) DeviceMotionEvent.requestPermission().catch(function () {});
  } catch (e) {}
  if (sens.escuchando) return;
  sens.escuchando = true;
  window.addEventListener('devicemotion', function (e) {
    var a = e.accelerationIncludingGravity;
    if (!a || a.x == null) return;
    var m = Math.sqrt(a.x * a.x + a.y * a.y + a.z * a.z);
    if (m < 1) return;
    var th = Math.acos(Math.min(1, Math.abs(a.z) / m)) * 180 / Math.PI;
    sens.theta = sens.activo ? sens.theta * 0.8 + th * 0.2 : th;
    sens.activo = true;
  });
}

var mic = { ctx: null, an: null, flujo: null, buf: null };
function abrirMic() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return Promise.resolve(false);
  return navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } }).then(function (f) {
    var AC = window.AudioContext || window.webkitAudioContext;
    mic.ctx = new AC(); mic.an = mic.ctx.createAnalyser(); mic.an.fftSize = 2048;
    mic.ctx.createMediaStreamSource(f).connect(mic.an);
    mic.flujo = f; mic.buf = new Float32Array(mic.an.fftSize);
    return true;
  }).catch(function () { return false; });
}
function cerrarMic() {
  if (mic.flujo) mic.flujo.getTracks().forEach(function (t) { t.stop(); });
  try { if (mic.ctx) mic.ctx.close(); } catch (e) {}
  mic.ctx = null; mic.an = null; mic.flujo = null; mic.buf = null;
}

// ---------- Bucle ----------
var nivel = null, raf = 0, ultimo = 0;
function detener() {
  if (raf) cancelAnimationFrame(raf);
  raf = 0;
  if (nivel && nivel.limpiar) nivel.limpiar();
  nivel = null; sfxOn = true;
  rodar(false);
  cerrarMic();
  var e = $('escena'); if (e && e.parentNode) e.parentNode.removeChild(e);
  document.body.classList.remove('en-juego');
}
function arrancar(n) { nivel = n; ultimo = performance.now(); raf = requestAnimationFrame(bucle); }
function bucle(ts) {
  if (!nivel) return;
  if (pausado) { ultimo = ts; raf = requestAnimationFrame(bucle); return; }
  var dt = Math.min(0.05, Math.max(0, (ts - ultimo) / 1000));
  ultimo = ts; tt += dt; shake = Math.max(0, shake - dt * 40);
  try {
    nivel.actualizar(dt);
    if (nivel) {
      actualizarParts(dt);
      cx.save();
      if (shake > 0.3) cx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
      nivel.dibujar(); dibujarParts();
      cx.restore();
      raf = requestAnimationFrame(bucle);
    }
  } catch (err) { mostrarError(err); }
}
window.addEventListener('resize', function () { if (nivel && $('cv')) { prepararCanvas(); } });
window.addEventListener('orientationchange', function () { setTimeout(function () { if (nivel && $('cv')) prepararCanvas(); }, 250); });

// Aviso de error visible en pantalla (para poder hacer una captura desde un teléfono sin consola)
function mostrarError(err) {
  try {
    var m = (err && (err.message || err.name)) ? (err.name + ': ' + err.message) : String(err);
    var d = $('error-juego');
    if (!d) { d = document.createElement('div'); d.id = 'error-juego'; document.body.appendChild(d); }
    d.innerHTML = '<b>Algo falló</b><p>' + esc(m) + '</p><p>Haz una captura de pantalla de este mensaje y envíala a tu equipo.</p><a class="btn" href="#/">Volver al menú</a>';
    if (raf) { cancelAnimationFrame(raf); raf = 0; }
  } catch (e) {}
}
window.addEventListener('error', function (e) { mostrarError(e.error || e.message); });

// Escena a pantalla completa con HUD
/** Botones − y + junto a un deslizador (más fáciles que arrastrar). */
function masMenos(id) {
  var inp = $(id); if (!inp || !AJ_ACT.masMenos) return;
  var paso = Math.max(parseFloat(inp.step) || 1, (parseFloat(inp.max) - parseFloat(inp.min)) / 30);
  function mover(d) { inp.value = Math.min(parseFloat(inp.max), Math.max(parseFloat(inp.min), parseFloat(inp.value) + d * paso)); inp.dispatchEvent(new Event('input')); pintarBarras(); sonido('clic'); }
  var fila = document.createElement('div'); fila.className = 'masmenos';
  fila.innerHTML = '<button class="sec chico" type="button" aria-label="Menos">−</button><button class="sec chico" type="button" aria-label="Más">+</button>';
  fila.children[0].onclick = function () { mover(-1); }; fila.children[1].onclick = function () { mover(1); };
  inp.parentNode.appendChild(fila);
}

// Pausa para descansar (apoyo de concentración)
var pausado = false;
function alternarPausa() {
  pausado = !pausado;
  var d = $('descanso'); if (d) d.hidden = !pausado;
}

var tInicioPartida = 0;
function escena(titulo, controles) {
  detener();
  tInicioPartida = performance.now();
  app.innerHTML = ''; // evita ids repetidos (la burbuja de Chispa de la pantalla anterior)
  pts = 0; combo = 0;
  var d = document.createElement('div');
  d.id = 'escena'; d.className = 'escena';
  d.innerHTML = '<canvas id="cv" role="img" aria-label="' + esc(titulo) + '"></canvas>' +
    '<div class="hud-top"><a class="hud-btn" href="#/" aria-label="Salir al menú">✕</a><div class="hud-titulo">' + esc(titulo) + '</div>' +
    (AJ_ACT.pausa ? '<button class="hud-btn" id="pausa" aria-label="Descansar un momento">⏸</button>' : '') + '<div class="hud-pts" aria-label="Puntos">⭐ <b id="ptsn">0</b></div></div>' +
    '<div class="pedidos" id="pedidos"></div><div class="combo" id="combo" hidden></div>' +
    '<div class="hud-abajo">' + chispa('', true) + '<div class="ctl" id="ctl">' + controles + '</div></div>' +
    '<div id="flotantes"></div><div id="splash" aria-live="polite"></div>' +
    '<div id="descanso" class="descanso" hidden><p>Descansa un momento. Respira tranquilo.</p><button id="seguir">Seguir jugando</button></div>';
  document.body.appendChild(d);
  pausado = false;
  if ($('pausa')) $('pausa').onclick = alternarPausa;
  if ($('seguir')) $('seguir').onclick = alternarPausa;
  document.body.classList.add('en-juego');
  prepararCanvas(); pintarBarras();
}

// ---------- Dibujo de objetos del hogar ----------
function canica(x, y, rad, rot) {
  esfera(x, y, rad, '#5ee0ff', '#0b5f8f');
  cx.save(); cx.beginPath(); cx.arc(x, y, rad, 0, 7); cx.clip(); cx.translate(x, y); cx.rotate(rot);
  cx.lineCap = 'round';
  cx.strokeStyle = 'rgba(255,255,255,.6)'; cx.lineWidth = rad * 0.24; cx.beginPath(); cx.arc(0, rad * 0.1, rad * 0.62, 0.3, 2.4); cx.stroke();
  cx.strokeStyle = 'rgba(255,214,64,.85)'; cx.lineWidth = rad * 0.2; cx.beginPath(); cx.arc(0, -rad * 0.15, rad * 0.5, 3.6, 5.6); cx.stroke();
  cx.strokeStyle = 'rgba(255,92,138,.7)'; cx.lineWidth = rad * 0.16; cx.beginPath(); cx.arc(rad * 0.1, 0, rad * 0.3, 1, 3.6); cx.stroke();
  cx.restore();
  cx.fillStyle = 'rgba(255,255,255,.92)'; cx.beginPath(); cx.ellipse(x - rad * 0.38, y - rad * 0.42, rad * 0.22, rad * 0.13, -0.6, 0, 7); cx.fill();
  cx.fillStyle = 'rgba(255,255,255,.35)'; cx.beginPath(); cx.arc(x + rad * 0.36, y + rad * 0.4, rad * 0.12, 0, 7); cx.fill();
}
// rampa de cartón corrugado: cara superior lisa, canto ondulado, cinta y letrero
function carton(g) {
  var k = g.k, t = 15 * k, nx = g.nx, ny = g.ny;
  var ax = g.bx, ay = g.by, bx = g.sx, by = g.sy;
  cx.beginPath(); cx.moveTo(ax, ay); cx.lineTo(bx, by); cx.lineTo(bx - nx * t, by - ny * t); cx.lineTo(ax - nx * t, ay - ny * t); cx.closePath();
  cx.fillStyle = grad(Math.min(ay, by) - t, Math.max(ay, by) + t, '#e2b06f', '#b07a3a'); cx.fill();
  // canto ondulado (flautas del cartón)
  cx.strokeStyle = 'rgba(110,64,18,.55)'; cx.lineWidth = 1.6 * k;
  var n = Math.floor(g.len / (6 * k)), i;
  cx.beginPath();
  for (i = 0; i <= n; i++) {
    var f = i / n, px = ax + (bx - ax) * f, py = ay + (by - ay) * f, w = (i % 2 ? 1 : -1) * 1.8 * k;
    cx.moveTo(px - nx * t * 0.12 + w, py - ny * t * 0.12); cx.lineTo(px - nx * t * 0.88 - w, py - ny * t * 0.88);
  }
  cx.stroke();
  // cara superior
  cx.lineCap = 'round'; cx.strokeStyle = '#f3cd94'; cx.lineWidth = 6 * k; cx.beginPath(); cx.moveTo(ax, ay); cx.lineTo(bx, by); cx.stroke();
  // cinta adhesiva
  var f1 = 0.4, f2 = 0.48, tx1 = ax + (bx - ax) * f1, ty1 = ay + (by - ay) * f1, tx2 = ax + (bx - ax) * f2, ty2 = ay + (by - ay) * f2;
  cx.fillStyle = 'rgba(215,200,160,.85)';
  cx.beginPath(); cx.moveTo(tx1 + nx * 4 * k, ty1 + ny * 4 * k); cx.lineTo(tx2 + nx * 4 * k, ty2 + ny * 4 * k);
  cx.lineTo(tx2 - nx * (t * 0.9), ty2 - ny * (t * 0.9)); cx.lineTo(tx1 - nx * (t * 0.9), ty1 - ny * (t * 0.9)); cx.closePath(); cx.fill();
  // letrero "FRÁGIL" y flecha pintados en el canto
  cx.save(); cx.translate(ax + (bx - ax) * 0.7 - nx * t * 0.55, ay + (by - ay) * 0.7 - ny * t * 0.55); cx.rotate(-g.th);
  cx.font = '900 ' + Math.round(8 * k) + 'px system-ui,sans-serif'; cx.textAlign = 'center'; cx.fillStyle = '#b3261e'; cx.fillText('FRÁGIL ↙', 0, 3 * k); cx.restore();
  // contorno
  cx.lineJoin = 'round'; cx.strokeStyle = '#6b3f17'; cx.lineWidth = 2.4 * k;
  cx.beginPath(); cx.moveTo(ax, ay); cx.lineTo(bx, by); cx.lineTo(bx - nx * t, by - ny * t); cx.lineTo(ax - nx * t, ay - ny * t); cx.closePath(); cx.stroke();
}
var LIBROS = ['#e0453a', '#3b82f6', '#2fd18b', '#ffb020', '#8a6cff'];
function libros(x, y, ancho, alto, k) {
  var h = 15 * k, n = Math.max(1, Math.ceil(alto / h)), i;
  for (i = 0; i < n; i++) {
    var hh = Math.min(h, alto - i * h), off = ((i * 37) % 7 - 3) * k, yy = y - (i + 1) * h + (h - hh);
    if (hh < 2) break;
    cx.fillStyle = gradH(x + off, x + off + ancho, LIBROS[i % 5], '#000'); cx.globalAlpha = 1;
    cx.fillStyle = LIBROS[i % 5]; rr(x + off, yy, ancho, hh, 3 * k); cx.fill();
    cx.fillStyle = 'rgba(255,255,255,.9)'; cx.fillRect(x + off + ancho * 0.82, yy + 2 * k, ancho * 0.16, Math.max(1, hh - 4 * k));
    cx.fillStyle = 'rgba(0,0,0,.18)'; cx.fillRect(x + off, yy + hh - 3 * k, ancho, 3 * k);
    cx.fillStyle = 'rgba(255,255,255,.35)'; cx.fillRect(x + off + 5 * k, yy + hh * 0.3, ancho * 0.45, 2 * k);
    cx.strokeStyle = 'rgba(0,0,0,.45)'; cx.lineWidth = 1.5 * k; rr(x + off, yy, ancho, hh, 3 * k); cx.stroke();
  }
}
// vaso de plástico tumbado, con la boca hacia la derecha
function vaso(mx, my, k, golpe) {
  var rx = 8 * k, ry = 24 * k, largo = 62 * k, rb = 16 * k, ox = Math.sin(golpe * 40) * golpe * 4 * k;
  cx.save(); cx.translate(ox, 0);
  cx.fillStyle = grad(my - ry, my + ry, '#ff6b5e', '#c62d22');
  cx.beginPath(); cx.moveTo(mx, my - ry); cx.lineTo(mx - largo, my - rb); cx.lineTo(mx - largo, my + rb); cx.lineTo(mx, my + ry); cx.closePath(); cx.fill();
  cx.fillStyle = 'rgba(255,255,255,.85)';
  for (var i = 1; i <= 2; i++) { var f = i / 3; cx.beginPath(); cx.moveTo(mx - largo * f, my - ry + (ry - rb) * f); cx.lineTo(mx - largo * f - 7 * k, my - ry + (ry - rb) * f + 0.4 * k); cx.lineTo(mx - largo * f - 7 * k, my + ry - (ry - rb) * f); cx.lineTo(mx - largo * f, my + ry - (ry - rb) * f); cx.closePath(); cx.fill(); }
  cx.fillStyle = '#7a120c'; cx.beginPath(); cx.ellipse(mx, my, rx, ry, 0, 0, 7); cx.fill();
  cx.lineWidth = 3 * k; cx.strokeStyle = '#ff9a8f'; cx.beginPath(); cx.ellipse(mx, my, rx, ry, 0, 0, 7); cx.stroke();
  cx.fillStyle = 'rgba(255,255,255,.28)'; cx.fillRect(mx - largo, my - ry * 0.7, largo, 4 * k);
  cx.restore();
}
function cronometro(x, y, R, t, obj, tol, activo) {
  var MAX = 5;
  var rim = cx.createLinearGradient(x - R, y - R, x + R, y + R); rim.addColorStop(0, '#f5f7fb'); rim.addColorStop(0.5, '#9aa4b8'); rim.addColorStop(1, '#e8ecf5');
  rr(x - 7, y - R - 13, 14, 12, 3); cx.fillStyle = '#e0453a'; cx.fill();
  cx.fillStyle = rim; cx.beginPath(); cx.arc(x, y, R, 0, 7); cx.fill();
  cx.fillStyle = '#fff'; cx.beginPath(); cx.arc(x, y, R * 0.86, 0, 7); cx.fill();
  var a0 = -Math.PI / 2 + (obj - tol) / MAX * 2 * Math.PI, a1 = -Math.PI / 2 + (obj + tol) / MAX * 2 * Math.PI;
  cx.strokeStyle = PAL.verde; cx.lineWidth = R * 0.22; cx.lineCap = 'butt'; cx.beginPath(); cx.arc(x, y, R * 0.66, a0, a1); cx.stroke();
  cx.strokeStyle = PAL.tinta; cx.lineWidth = 2;
  for (var i = 0; i < 10; i++) { var a = -Math.PI / 2 + i / 10 * 2 * Math.PI; cx.beginPath(); cx.moveTo(x + Math.cos(a) * R * 0.78, y + Math.sin(a) * R * 0.78); cx.lineTo(x + Math.cos(a) * R * 0.86, y + Math.sin(a) * R * 0.86); cx.stroke(); }
  var ah = -Math.PI / 2 + Math.min(t, MAX) / MAX * 2 * Math.PI;
  cx.strokeStyle = activo ? PAL.rosa : PAL.tinta; cx.lineWidth = 3; cx.lineCap = 'round'; cx.beginPath(); cx.moveTo(x, y); cx.lineTo(x + Math.cos(ah) * R * 0.72, y + Math.sin(ah) * R * 0.72); cx.stroke();
  cx.fillStyle = PAL.tinta; cx.beginPath(); cx.arc(x, y, 4, 0, 7); cx.fill();
  texto3d(r(t, 2) + ' s', x, y + R + 24, 18, 'center');
}

// ---------- Nivel 1: La rampa de cartón (acelerómetro) ----------
function jugarRampa(pred) {
  var OBJ = [3.0, 2.0, 1.4], TOLB = 0.3 * AJ_ACT.tol * PERF.margenTutor('rampa'), TOL = r(TOLB, 2), D = 3, MU = 0.02, din = AJUSTES.dinamicoInicial();
  var etapa = 0, fase = 'apuntar', s = 0, v = 0, t = 0, thL = 0, quieta = 0, tr = 0, intentos = [], aciertos = [], timer = 0;
  var xm = 0, vm = 0, rotM = 0, golpe = 0, tTiempo = 0, enVaso = false, avisoSensor = false, avisoT = 0;

  escena('🎢 La rampa',
    '<div class="fila"><div id="manual" class="ctl-caja"><label for="ang">Inclinación: <b id="vA">5</b>°</label><input id="ang" type="range" min="0" max="30" step="0.5" value="5"></div>' +
    '<div id="pista-incl" class="ctl-caja" hidden>📱 Inclina tu teléfono: sube o baja la rampa</div>' +
    '<button id="modo" class="sec chico" type="button" hidden aria-label="Cambiar entre sensor y barra">🎚</button>' +
    '<button id="soltar" class="btn-go"><span>▶</span>SOLTAR</button></div><p id="info" role="status" aria-live="polite"></p>');
  var textos = OBJ.map(function (o) { return o + ' s'; });
  function pedidos() { pintarPedidos(textos, etapa, etapa); }
  function ang() { return sens.activo && !sens.manual ? sens.theta : parseFloat($('ang').value); }
  function geom() {
    var k = Math.min(W / 390, H / 600) * 1.15, deg = fase === 'apuntar' ? ang() : thL, th = deg * Math.PI / 180;
    var bx = W * 0.36, by = H * 0.57, len = Math.min(W * 0.6, H * 0.62);
    return { k: k, deg: deg, th: th, bx: bx, by: by, len: len, sx: bx + len * Math.cos(th), sy: by - len * Math.sin(th), nx: -Math.sin(th), ny: -Math.cos(th) };
  }
  function posBola(g) {
    var p = s / D, rad = 13 * g.k;
    return { p: p, x: g.sx + (g.bx - g.sx) * p + g.nx * rad, y: g.sy + (g.by - g.sy) * p + g.ny * rad, rad: rad };
  }
  function info() { $('info').textContent = 'Pedido ' + (etapa + 1) + ' de 3: que la canica llegue al vaso en ' + OBJ[etapa] + ' s (margen ±' + TOL + ' s).'; }
  decir('¡Hola! Soy Chispa. Inclina el teléfono, suelta la canica y que llegue al vaso justo en el tiempo del pedido.');
  pedidos(); info(); masMenos('ang');
  sens.manual = !AJ_ACT.sensorInclinacion;
  $('modo').onclick = function () {
    if (!sens.manual) { $('ang').value = Math.min(30, Math.round(sens.theta * 2) / 2); $('vA').textContent = $('ang').value; pintarBarras(); }
    sens.manual = !sens.manual; decir(sens.manual ? 'Ahora inclinas con la barra.' : 'Ahora inclinas con el movimiento de tu teléfono.');
  };
  $('ang').addEventListener('input', function () { $('vA').textContent = this.value; });

  $('soltar').onclick = function () {
    audio();
    if (fase === 'apuntar') {
      thL = Math.max(0, ang()); fase = 'rodando'; s = v = t = quieta = 0; golpe = 0; enVaso = false; rotM = 0;
      $('soltar').disabled = true; sonido('madera'); vibra(15);
    } else if (fase === 'fin') {
      fase = 'apuntar'; s = v = t = 0; $('soltar').innerHTML = '<span>▶</span>SOLTAR'; info(); pedidos();
    }
  };

  function llegada() {
    var obj = OBJ[etapa], g = geom();
    rodar(false);
    intentos.push({ th: r(thL, 1), t: r(tTiempo, 2), obj: obj });
    var error = Math.abs(tTiempo - obj), tolUsada = TOL;
    din = AJUSTES.ajusteDinamico(din, error <= tolUsada); TOL = r(TOLB * din.mult, 2);
    fase = 'fin'; $('soltar').disabled = false;
    if (error <= tolUsada) {
      aciertos.push({ th: r(thL, 1), t: r(tTiempo, 2), obj: obj });
      var pa = puntosPorAcierto(error, tolUsada), el = elogio(pa.bonus);
      sonido('ok'); if (pa.mult >= 2) sonido('combo');
      chisporroteo(g.bx - 36 * g.k, g.by - 24 * g.k, 40); confeti(pa.bonus >= 80 ? 80 : 40); destello(); sacudir(10); vibra([30, 30, 60]);
      splash(el.t, el.c); sumar(pa.ganados, W / 2, H * 0.34); pintarCombo();
      etapa++; pedidos();
      if (etapa >= OBJ.length) {
        decir('¡Último pedido entregado! ¡La estación se enciende!', 'alegre'); $('soltar').disabled = true;
        timer = setTimeout(function () { splash('¡NIVEL COMPLETADO!', '#ff5c8a'); timer = setTimeout(terminar, 1400); }, 900); return;
      }
      decir('¡Pedido entregado! Llegó en ' + r(tTiempo, 2) + ' s con ' + r(thL, 1) + '°. El siguiente pide ' + OBJ[etapa] + ' s.', 'alegre');
      $('soltar').innerHTML = '<span>⏭</span>SIGUIENTE';
    } else {
      combo = 0; pintarCombo(); sonido('mal'); sacudir(7); vibra([60, 40, 60]);
      if (error <= tolUsada * 2) splash('¡CASI! 😮', '#ff9f43');
      decir('Llegó en ' + r(tTiempo, 2) + ' s y el pedido pide ' + obj + ' s. ' + (tTiempo > obj ? 'Fue más lenta.' : 'Fue más rápida.') + ' ¿Inclinas más o menos?' + (din.pista ? ' Pista: prueba con unos ' + r(Math.asin(Math.min(1, 2 * D / (obj * obj) / 9.81 + MU)) * 180 / Math.PI, 0) + '°.' : ''), 'triste');
      $('soltar').innerHTML = '<span>↻</span>OTRA VEZ';
    }
  }
  function sinMover() {
    rodar(false); intentos.push({ th: r(thL, 1), t: null, obj: OBJ[etapa] }); fase = 'fin'; combo = 0; pintarCombo();
    sonido('mal'); sacudir(6); vibra([60, 40, 60]); $('soltar').disabled = false; $('soltar').innerHTML = '<span>↻</span>OTRA VEZ';
    decir('La canica no se movió: el cartón la frena. ¿Qué podrías cambiar para que empiece a rodar?', 'triste');
  }

  function terminar() {
    var a = aciertos[0], b = aciertos[1], n = intentos.length;
    var est = 1 + (pred.ok ? 1 : 0) + (n <= 8 ? 1 : 0);
    var filas = intentos.map(function (x, i) {
      return '<tr><td>' + (i + 1) + '</td><td>' + x.th + '°</td><td>' + (x.t === null ? 'no se movió' : x.t + ' s') + '</td><td>' + x.obj + ' s</td></tr>';
    }).join('');
    resultado(NIVELES[0], pred, {
      estrellas: est, puntos: pts,
      motivos: ['Entregaste los 3 pedidos.',
        pred.ok ? 'Tu predicción fue correcta.' : 'Tu predicción no fue la correcta, y eso también enseña.',
        n <= 8 ? 'Lo lograste en pocos intentos (' + n + ').' : 'Usaste ' + n + ' intentos; con 8 o menos ganas la tercera estrella.'],
      pregunta: 'Mira tus pedidos 1 y 2: usaste ' + a.th + '° y ' + b.th + '° (el ángulo se multiplicó por ' + r(b.th / a.th, 1) +
        ') y el tiempo pasó de ' + a.t + ' s a ' + b.t + ' s. ¿Se redujo a la mitad? ¿Qué crees que pasa?',
      tabla: '<table><tr><th>#</th><th>Ángulo</th><th>Tiempo</th><th>Pedía</th></tr>' + filas + '</table>',
      revela: 'La canica acelera con a ≈ g·sen(θ), menos un poco de fricción. Al doblar el ángulo, la aceleración casi se duplica. ' +
        'Pero la distancia es d = ½·a·t², así que si a se duplica, el tiempo no baja a la mitad: se divide por √2, es decir, queda en ≈ 0,7 del tiempo. ' +
        'Por eso tus tiempos cambiaron menos de lo que parecía. Y con muy poca inclinación (menos de 1°) la fricción gana y la canica no se mueve.'
    });
  }

  function cuarto() {
    var k = Math.min(W / 390, H / 600) * 1.1, i, ty = H * 0.5;
    cx.fillStyle = grad(0, ty, '#cdeef3', '#a9dbe6'); cx.fillRect(0, 0, W, H);
    cx.fillStyle = 'rgba(255,255,255,.35)'; for (var x = 0; x < W; x += 34 * k) cx.fillRect(x, 0, 12 * k, ty);
    // ventana con cortinas
    var wx = W * 0.07, wy = H * 0.15, ww = W * 0.36, wh = H * 0.2;
    cx.fillStyle = '#fff'; rr(wx - 8 * k, wy - 8 * k, ww + 16 * k, wh + 16 * k, 10 * k); cx.fill();
    cx.fillStyle = grad(wy, wy + wh, '#6ec6ff', '#d9f2ff'); cx.fillRect(wx, wy, ww, wh);
    nube(wx + ww * 0.18, wy + wh * 0.42, 0.9 * k); esfera(wx + ww * 0.78, wy + wh * 0.28, 15 * k, '#fff3a0', '#ffc533');
    cx.fillStyle = '#fff'; cx.fillRect(wx + ww / 2 - 3 * k, wy, 6 * k, wh); cx.fillRect(wx, wy + wh / 2 - 3 * k, ww, 6 * k);
    for (i = 0; i < 5; i++) { cx.fillStyle = i % 2 ? '#ff8fb1' : '#ff6f9a'; cx.fillRect(wx - 8 * k + i * 6 * k, wy - 8 * k, 6 * k, wh + 40 * k); cx.fillRect(wx + ww - 22 * k + i * 6 * k, wy - 8 * k, 6 * k, wh + 40 * k); }
    // mesa de madera en perspectiva
    cx.fillStyle = '#e8d3b0'; cx.fillRect(0, ty - 12 * k, W, 12 * k);
    cx.fillStyle = grad(ty, H, '#d99a5b', '#9c6330'); cx.fillRect(0, ty, W, H - ty);
    cx.strokeStyle = 'rgba(80,40,10,.18)'; cx.lineWidth = 2;
    for (i = -6; i <= 6; i++) { cx.beginPath(); cx.moveTo(W / 2 + i * W * 0.05, ty); cx.lineTo(W / 2 + i * W * 0.32, H); cx.stroke(); }
    cx.fillStyle = 'rgba(255,255,255,.3)'; cx.fillRect(0, ty, W, 3 * k);
    // taza con lápices
    var mx = W * 0.86, my = ty + 26 * k;
    for (i = 0; i < 4; i++) { cx.strokeStyle = ['#ffd23f', '#ff5c8a', '#3b82f6', '#2fd18b'][i]; cx.lineWidth = 5 * k; cx.lineCap = 'round'; cx.beginPath(); cx.moveTo(mx + (i - 1.5) * 6 * k, my - 14 * k); cx.lineTo(mx + (i - 1.5) * 12 * k, my - 52 * k); cx.stroke(); }
    cx.fillStyle = grad(my - 30 * k, my + 4 * k, '#5aa9ff', '#1e5fb8'); rr(mx - 22 * k, my - 30 * k, 44 * k, 34 * k, 6 * k); cx.fill();
    cx.fillStyle = 'rgba(255,255,255,.4)'; cx.fillRect(mx - 16 * k, my - 26 * k, 5 * k, 26 * k);
  }

  arrancar({
    limpiar: function () { clearTimeout(timer); rodar(false); },
    actualizar: function (dt) {
      var porSensor = sens.activo && !sens.manual;
      $('modo').hidden = !sens.activo; $('modo').textContent = porSensor ? '🎚' : '📱';
      $('manual').hidden = porSensor; $('pista-incl').hidden = !sens.activo || !porSensor;
      if (!sens.activo && !avisoSensor && (avisoT += dt) > 2.5) { avisoSensor = true; decir('Tu teléfono no está enviando datos del sensor de movimiento. No pasa nada: usa la barra para inclinar la rampa.'); }
      if (golpe > 0) golpe = Math.max(0, golpe - dt * 2.5);
      if (fase === 'rodando') {
        var a = FIS.aceleracionRampa(thL * Math.PI / 180, MU);
        t += dt;
        if (a <= 0) { quieta += dt; if (quieta > 1.5) sinMover(); return; }
        v += a * dt; s += v * dt; tr += dt;
        var g = geom(), b = posBola(g);
        rotM -= (v * (g.len / D) * dt) / b.rad; rodar(true, v);
        if (tr > 0.035 && !LIGERO) { tr = 0; parts.push({ x: b.x, y: b.y, vx: 0, vy: 0, g: 0, t: 0, vida: 0.3, c: 'rgba(255,255,255,.7)', r: 6 }); }
        if (s >= D) {
          s = D; tTiempo = t; fase = 'entra'; xm = g.bx; vm = Math.max(170 * g.k, Math.min(420 * g.k, v * 70 * g.k));
        } else if (t > 8) { rodar(false); tTiempo = t; fase = 'fin'; intentos.push({ th: r(thL, 1), t: null, obj: OBJ[etapa] }); combo = 0; pintarCombo(); sonido('mal'); $('soltar').disabled = false; $('soltar').innerHTML = '<span>↻</span>OTRA VEZ'; decir('Tardó demasiado. ¿Inclinas más o menos?', 'triste'); }
      } else if (fase === 'entra') {
        var g2 = geom(), mouth = g2.bx - 36 * g2.k;
        xm -= vm * dt; rotM -= (vm * dt) / (13 * g2.k); vm *= 0.995; tr += dt;
        if (tr > 0.035 && !LIGERO) { tr = 0; parts.push({ x: xm, y: g2.by - 13 * g2.k, vx: 0, vy: 0, g: 0, t: 0, vida: 0.25, c: 'rgba(255,255,255,.6)', r: 5 }); }
        if (xm <= mouth - 10 * g2.k) { fase = 'dentro'; enVaso = true; golpe = 1; sonido('canica'); vibra(25); rodar(false); timer = setTimeout(llegada, 550); }
      }
    },
    dibujar: function () {
      var g = geom(), k = g.k, b = posBola(g), mouthX = g.bx - 36 * k, my = g.by - 24 * k;
      fondo(cuarto);
      // sombra de la rampa y de las cosas sobre la mesa
      sombra((g.bx + g.sx) / 2 + 10 * k, g.by + 12 * k, g.len * 0.52, 9 * k, 0.28);
      // pila de libros que sostiene el extremo alto (crece con la inclinación)
      var alto = g.by - (g.sy + 15 * k * Math.cos(g.th));
      if (alto > 6 * k) libros(g.sx - 58 * k, g.by + 8 * k, 66 * k, alto + 8 * k, k);
      carton(g);
      // arco del ángulo en la bisagra
      cx.strokeStyle = '#fff'; cx.lineWidth = 3 * k; cx.beginPath(); cx.arc(g.bx, g.by, 46 * k, -g.th, 0); cx.stroke();
      cx.fillStyle = PAL.tinta; rr(g.bx + 10 * k, g.by + 16 * k, 62 * k, 24 * k, 12 * k); cx.fill();
      texto(r(g.deg, 1) + '°', g.bx + 41 * k, g.by + 33 * k, 16 * k, 'center', '#fff');
      // vaso, y la canica (en la rampa, rodando hacia el vaso, o ya dentro)
      var rad = 13 * k, mx = fase === 'entra' ? xm : b.x, my2 = fase === 'entra' ? g.by - rad : b.y;
      if (fase === 'dentro') { vaso(mouthX, my, k, golpe); }
      else {
        vaso(mouthX, my, k, 0);
        if (enVaso) {
          // la canica quedó dentro del vaso: se ve su brillo en la boca
          var gl = cx.createRadialGradient(mouthX, my, 1, mouthX, my, 18 * k); gl.addColorStop(0, 'rgba(94,224,255,.9)'); gl.addColorStop(1, 'rgba(94,224,255,0)');
          cx.fillStyle = gl; cx.beginPath(); cx.arc(mouthX, my, 18 * k, 0, 7); cx.fill();
        } else {
          cx.save(); cx.globalAlpha = 0.28; cx.fillStyle = '#000'; cx.beginPath(); cx.ellipse(mx + 3 * k, my2 + rad + 1 * k, rad * 0.9, 4 * k, -g.th, 0, 7); cx.fill(); cx.restore();
          canica(mx, my2, rad, rotM);
        }
      }
      cronometro(W * 0.78, H * 0.235, 40 * k, fase === 'apuntar' ? 0 : (fase === 'rodando' ? t : tTiempo), OBJ[etapa < OBJ.length ? etapa : OBJ.length - 1], TOL, fase === 'rodando');
    }
  });
}

// ---------- Nivel 2: El péndulo del estante (simulación táctil) ----------
var ITEMS = [
  { n: 'Moneda', e: '🪙', g: 5, r: 11 }, { n: 'Llaves', e: '🔑', g: 50, r: 14 },
  { n: 'Manzana', e: '🍎', g: 200, r: 19 }, { n: 'Lata', e: '🥫', g: 400, r: 21 }
];
function objetoColgante(i, x, y, rad, ang) {
  cx.save(); cx.translate(x, y); cx.rotate(-ang);
  if (i === 0) { // moneda
    esfera(0, 0, rad, '#ffe27a', '#a8700b'); cx.strokeStyle = 'rgba(120,70,0,.7)'; cx.lineWidth = rad * 0.14; cx.beginPath(); cx.arc(0, 0, rad * 0.72, 0, 7); cx.stroke();
    texto('★', 0, rad * 0.33, rad * 0.95, 'center', 'rgba(120,70,0,.7)');
  } else if (i === 1) { // llavero
    cx.strokeStyle = '#cfd5e3'; cx.lineWidth = rad * 0.2; cx.beginPath(); cx.arc(0, -rad * 0.5, rad * 0.5, 0, 7); cx.stroke();
    [-0.5, 0.5].forEach(function (d) {
      cx.save(); cx.rotate(d); cx.fillStyle = grad(0, rad * 2, '#e9edf7', '#8993a8'); rr(-rad * 0.2, 0, rad * 0.4, rad * 1.6, rad * 0.15); cx.fill();
      cx.beginPath(); cx.arc(0, rad * 0.35, rad * 0.32, 0, 7); cx.fill(); cx.fillStyle = '#6b7388'; cx.beginPath(); cx.arc(0, rad * 0.35, rad * 0.14, 0, 7); cx.fill(); cx.restore();
    });
  } else if (i === 2) { // manzana
    esfera(0, rad * 0.05, rad, '#ff6b5e', '#a6160d');
    cx.fillStyle = 'rgba(90,10,5,.55)'; cx.beginPath(); cx.ellipse(0, -rad * 0.78, rad * 0.26, rad * 0.12, 0, 0, 7); cx.fill();
    cx.strokeStyle = '#5b3a1a'; cx.lineWidth = rad * 0.12; cx.beginPath(); cx.moveTo(0, -rad * 0.75); cx.lineTo(rad * 0.1, -rad * 1.1); cx.stroke();
    cx.fillStyle = '#2fd18b'; cx.beginPath(); cx.ellipse(rad * 0.4, -rad * 0.95, rad * 0.35, rad * 0.16, -0.5, 0, 7); cx.fill();
  } else { // lata
    var h = rad * 1.9, w = rad * 1.3;
    cx.fillStyle = gradH(-w, w, '#b9c2d3', '#6d7790'); cx.fillRect(-w, -h / 2, w * 2, h);
    cx.fillStyle = '#e0453a'; cx.fillRect(-w, -h * 0.22, w * 2, h * 0.44);
    cx.fillStyle = 'rgba(255,255,255,.4)'; cx.fillRect(-w * 0.6, -h / 2, w * 0.2, h);
    cx.fillStyle = '#dfe5f2'; cx.beginPath(); cx.ellipse(0, -h / 2, w, w * 0.3, 0, 0, 7); cx.fill();
    cx.strokeStyle = '#6d7790'; cx.lineWidth = 1.5; cx.stroke();
  }
  cx.restore();
}

function jugarPendulo(pred) {
  var OBJ = [1.4, 2.0, 2.6], TOLB = 0.05 * AJ_ACT.tol * PERF.margenTutor('pendulo'), TOL = r(TOLB, 3), din = AJUSTES.dinamicoInicial();
  var etapa = 0, fase = 'listo', est = { th: 0.35, w: 0 }, tSim = 0, cruces = [], L = 0.8, item = 2, intentos = [], tb = 0, medido = null, timer = 0, rastro = [], ultTic = -1;

  escena('⏱ El péndulo',
    '<div class="ctl-caja ancha"><label for="largo">Largo del hilo: <b id="vL">80</b> cm</label><input id="largo" type="range" min="20" max="200" step="1" value="80"></div>' +
    '<div class="fila"><div id="masas" role="group" aria-label="Objeto que cuelga">' +
    ITEMS.map(function (it, i) { return '<button class="sec masa" data-i="' + i + '" aria-pressed="' + (i === item) + '"><span>' + it.e + '</span>' + it.g + ' g</button>'; }).join('') +
    '</div><button id="soltar" class="btn-go"><span>▶</span>SOLTAR</button></div><p id="info" role="status" aria-live="polite"></p>');
  var textos = OBJ.map(function (o) { return o + ' s'; });
  function pedidos() { pintarPedidos(textos, etapa, etapa); }
  function info() { $('info').textContent = 'Luz ' + (etapa + 1) + ' de 3: el péndulo debe tardar ' + OBJ[etapa] + ' s en ir y volver (margen del ' + r(TOL * 100, 0) + ' %).'; }
  decir('La lámpara marca el ritmo del reloj. Escucha su tic y haz que tu péndulo haga tac al mismo ritmo. Cambia una sola cosa a la vez.');
  pedidos(); info(); masMenos('largo');

  function reiniciar() { fase = 'listo'; est = { th: 0.35, w: 0 }; cruces = []; medido = null; rastro = []; }
  $('largo').oninput = function () { L = parseInt(this.value, 10) / 100; $('vL').textContent = this.value; reiniciar(); };
  $('masas').onclick = function (e) {
    var el = e.target; while (el && el !== this && !(el.getAttribute && el.getAttribute('data-i') !== null)) el = el.parentNode;
    if (!el || el === this) return;
    item = parseInt(el.getAttribute('data-i'), 10); sonido('clic');
    Array.prototype.forEach.call($('masas').children, function (b) { b.setAttribute('aria-pressed', String(parseInt(b.getAttribute('data-i'), 10) === item)); });
    reiniciar();
  };
  $('soltar').onclick = function () { audio(); reiniciar(); fase = 'oscila'; tSim = 0; sonido('madera'); vibra(15); };

  function medir(T) {
    fase = 'medido'; medido = T;
    var obj = OBJ[etapa], error = Math.abs(T - obj) / obj, tolUsada = TOL;
    intentos.push({ L: r(L * 100, 0), m: ITEMS[item].g, T: r(T, 2), obj: obj });
    din = AJUSTES.ajusteDinamico(din, error <= tolUsada); TOL = r(TOLB * din.mult, 3);
    if (error <= tolUsada) {
      var pa = puntosPorAcierto(error, tolUsada), el = elogio(pa.bonus);
      sonido('ok'); if (pa.mult >= 2) sonido('combo');
      chisporroteo(W * 0.82, H * 0.42, 40); confeti(pa.bonus >= 80 ? 80 : 40); destello(); sacudir(8); vibra([30, 30, 60]);
      splash(el.t, el.c); sumar(pa.ganados, W / 2, H * 0.34); pintarCombo();
      etapa++; pedidos();
      if (etapa >= OBJ.length) {
        decir('¡Las tres luces sincronizadas! ¡El reloj de la estación funciona!', 'alegre');
        timer = setTimeout(function () { splash('¡NIVEL COMPLETADO!', '#ff5c8a'); timer = setTimeout(terminar, 1400); }, 900); return;
      }
      decir('¡Sincronizado! Tu péndulo tardó ' + r(T, 2) + ' s. La siguiente luz marca ' + OBJ[etapa] + ' s.', 'alegre'); info();
    } else {
      combo = 0; pintarCombo(); sonido('mal'); sacudir(6); vibra([60, 40, 60]);
      if (error <= tolUsada * 2.4) splash('¡CASI! 😮', '#ff9f43');
      decir('Tu péndulo tardó ' + r(T, 2) + ' s y la luz marca ' + obj + ' s. ' + (T < obj ? 'Va más rápido que la luz.' : 'Va más lento que la luz.') + ' ¿Qué cambiarías? Recuerda: una sola cosa a la vez.', 'triste');
    }
  }

  function terminar() {
    var par = null, i, j;
    for (i = 0; i < intentos.length; i++) for (j = i + 1; j < intentos.length; j++) {
      if (!par && Math.abs(intentos[i].L - intentos[j].L) <= 1 && intentos[i].m !== intentos[j].m) par = [intentos[i], intentos[j]];
    }
    var est2 = 1 + (pred.ok ? 1 : 0) + (par ? 1 : 0);
    var filas = intentos.map(function (x, k) { return '<tr><td>' + (k + 1) + '</td><td>' + x.L + ' cm</td><td>' + x.m + ' g</td><td>' + x.T + ' s</td></tr>'; }).join('');
    resultado(NIVELES[1], pred, {
      estrellas: est2, puntos: pts,
      motivos: ['Sincronizaste las 3 luces.',
        pred.ok ? 'Tu predicción fue correcta.' : 'Tu predicción no fue la correcta, y eso también enseña.',
        par ? 'Hiciste una prueba justa: mismo largo, distinto objeto.' : 'Te faltó una prueba justa con el peso (mismo largo, otro objeto) para la tercera estrella.'],
      pregunta: par
        ? 'Con el mismo largo (' + par[0].L + ' cm) probaste ' + par[0].m + ' g y ' + par[1].m + ' g, y mediste ' + par[0].T + ' s y ' + par[1].T + ' s. ¿Qué te dice eso sobre el peso del objeto?'
        : 'No hiciste una prueba justa para el peso. ¿Cómo la harías? ¿Qué esperas que salga? Vuelve a jugar y compruébalo.',
      tabla: '<table><tr><th>#</th><th>Largo</th><th>Objeto</th><th>Período</th></tr>' + filas + '</table>',
      revela: 'El período es T = 2π·√(L/g). El peso del objeto no aparece en la fórmula: una moneda y una lata colgadas del mismo largo tardan lo mismo (con ángulos pequeños). ' +
        'Lo que sí cambia el ritmo es el largo, y no de forma directa: para duplicar el período hay que cuadruplicar el largo.'
    });
  }

  function cuarto() {
    var k = Math.min(W / 390, H / 600), i, j, piso = H * 0.7;
    cx.fillStyle = grad(0, piso, '#ffe8c2', '#ffd1a3'); cx.fillRect(0, 0, W, H);
    cx.fillStyle = 'rgba(255,255,255,.4)'; for (i = 0; i < 9; i++) for (j = 0; j < 9; j++) { cx.beginPath(); cx.arc(W * (i + (j % 2) * 0.5) / 9 + 10, piso * (j + 0.5) / 9, 5 * k, 0, 7); cx.fill(); }
    // piso de madera con perspectiva y alfombra
    cx.fillStyle = grad(piso, H, '#c98f53', '#8f5a2c'); cx.fillRect(0, piso, W, H - piso);
    cx.strokeStyle = 'rgba(80,40,10,.2)'; cx.lineWidth = 2; for (i = -6; i <= 6; i++) { cx.beginPath(); cx.moveTo(W / 2 + i * W * 0.05, piso); cx.lineTo(W / 2 + i * W * 0.3, H); cx.stroke(); }
    cx.fillStyle = '#e8d3b0'; cx.fillRect(0, piso - 10 * k, W, 10 * k);
    cx.fillStyle = 'rgba(255,92,138,.55)'; cx.beginPath(); cx.ellipse(W * 0.4, piso + (H - piso) * 0.45, W * 0.34, (H - piso) * 0.22, 0, 0, 7); cx.fill();
    // estante de madera con cosas
    var ey = H * 0.2, ex0 = W * 0.06, ex1 = W * 0.74;
    cx.fillStyle = grad(ey, ey + 16 * k, '#c98f53', '#8f5a2c'); rr(ex0, ey, ex1 - ex0, 16 * k, 4 * k); cx.fill(); cx.lineWidth = 2; cx.strokeStyle = '#5a3412'; cx.stroke();
    [ex0 + 24 * k, ex1 - 40 * k].forEach(function (bx) { cx.fillStyle = '#7a4a1c'; cx.beginPath(); cx.moveTo(bx, ey + 16 * k); cx.lineTo(bx + 30 * k, ey + 16 * k); cx.lineTo(bx, ey + 46 * k); cx.closePath(); cx.fill(); });
    // maceta con planta, libros y reloj chiquito sobre el estante
    cx.fillStyle = grad(ey - 36 * k, ey, '#e0794a', '#b4501f'); cx.beginPath(); cx.moveTo(ex0 + 20 * k, ey - 30 * k); cx.lineTo(ex0 + 58 * k, ey - 30 * k); cx.lineTo(ex0 + 52 * k, ey); cx.lineTo(ex0 + 26 * k, ey); cx.closePath(); cx.fill();
    cx.fillStyle = '#2fd18b'; for (i = 0; i < 5; i++) { cx.beginPath(); cx.ellipse(ex0 + 39 * k + (i - 2) * 9 * k, ey - 42 * k - Math.abs(i - 2) * -4 * k, 6 * k, 18 * k, (i - 2) * 0.35, 0, 7); cx.fill(); }
    libros(ex1 - 96 * k, ey, 46 * k, 30 * k, k);
    // ventana nocturna al fondo
    var wx = W * 0.52, wy = H * 0.34, ww = W * 0.26, wh = H * 0.16;
    cx.fillStyle = '#fff'; rr(wx - 6 * k, wy - 6 * k, ww + 12 * k, wh + 12 * k, 8 * k); cx.fill();
    cx.fillStyle = grad(wy, wy + wh, '#1a2a6c', '#5b6fd8'); cx.fillRect(wx, wy, ww, wh); esfera(wx + ww * 0.7, wy + wh * 0.3, 12 * k, '#fff6c9', '#e8c85a');
    cx.fillStyle = '#fff'; for (i = 0; i < 6; i++) { cx.beginPath(); cx.arc(wx + ((i * 47) % 100) / 100 * ww * 0.6 + 6 * k, wy + ((i * 61) % 100) / 100 * wh, 1.5 * k, 0, 7); cx.fill(); }
    cx.fillRect(wx + ww / 2 - 2 * k, wy, 4 * k, wh);
    // mesita para la lámpara
    var tx = W * 0.84, ty = H * 0.52;
    cx.fillStyle = grad(ty, ty + 12 * k, '#d99a5b', '#9c6330'); rr(tx - 38 * k, ty, 76 * k, 12 * k, 4 * k); cx.fill();
    cx.fillStyle = '#7a4a1c'; cx.fillRect(tx - 32 * k, ty + 12 * k, 8 * k, piso - ty - 4 * k); cx.fillRect(tx + 24 * k, ty + 12 * k, 8 * k, piso - ty - 4 * k);
  }

  arrancar({
    limpiar: function () { clearTimeout(timer); },
    actualizar: function (dt) {
      tb += dt;
      var T = OBJ[etapa < OBJ.length ? etapa : OBJ.length - 1], nb = Math.floor(tb / T);
      if (nb !== ultTic) { ultTic = nb; sonido('tic'); pulsoSonido('tic'); }
      if (fase === 'listo') return;
      var n = Math.max(1, Math.ceil(dt / 0.002)), h = dt / n;
      for (var i = 0; i < n; i++) {
        var prev = est.th;
        FIS.pasoPendulo(est, L, h); tSim += h;
        if ((prev > 0) !== (est.th > 0) && prev !== 0) { sonido('tac'); pulsoSonido('tac'); }
        if (fase === 'oscila' && prev > 0 && est.th <= 0) cruces.push(tSim - h + h * prev / (prev - est.th));
        if (fase === 'oscila' && cruces.length >= 2) { medir(cruces[1] - cruces[0]); break; }
      }
    },
    dibujar: function () {
      var k = Math.min(W / 390, H / 600), oy = H * 0.2 + 16 * k, ox = W * 0.4, pxm = (H * 0.6 - oy) / 2.0;
      var it = ITEMS[item], rad = it.r * k;
      var bx = ox + L * pxm * Math.sin(est.th), by = oy + L * pxm * Math.cos(est.th);
      fondo(cuarto);
      // sombra en el piso y estela
      sombra(bx, H * 0.72 + 14 * k, rad * 1.4, 6 * k, 0.28);
      if (fase !== 'listo' && !LIGERO) { rastro.push({ x: bx, y: by }); if (rastro.length > 9) rastro.shift(); }
      for (var q = 0; q < rastro.length; q++) { cx.globalAlpha = 0.045 * (q + 1); cx.fillStyle = '#ffd23f'; cx.beginPath(); cx.arc(rastro[q].x, rastro[q].y, rad * (0.5 + q * 0.06), 0, 7); cx.fill(); }
      cx.globalAlpha = 1;
      // hilo
      cx.strokeStyle = '#6b4a2b'; cx.lineWidth = 2.5 * k; cx.lineCap = 'round'; cx.beginPath(); cx.moveTo(ox, oy); cx.lineTo(bx, by); cx.stroke();
      esfera(ox, oy, 6 * k, '#e5e7eb', '#6b7280');
      objetoColgante(item, bx, by, rad, est.th);
      // lámpara de mesa: un destello por período objetivo
      var T = OBJ[etapa < OBJ.length ? etapa : OBJ.length - 1], fl = Math.pow(Math.max(0, Math.cos(2 * Math.PI * tb / T)), 3);
      var lx = W * 0.84, ly = H * 0.52;
      cx.fillStyle = grad(ly - 8 * k, ly, '#4b5563', '#1f2937'); cx.beginPath(); cx.ellipse(lx, ly - 4 * k, 22 * k, 6 * k, 0, 0, 7); cx.fill();
      cx.strokeStyle = '#4b5563'; cx.lineWidth = 5 * k; cx.beginPath(); cx.moveTo(lx, ly - 6 * k); cx.lineTo(lx - 10 * k, ly - 60 * k); cx.lineTo(lx - 30 * k, ly - 96 * k); cx.stroke();
      var bxl = lx - 36 * k, byl = ly - 96 * k;
      if (fl > 0.02) { var gl = cx.createRadialGradient(bxl, byl + 14 * k, 4, bxl, byl + 14 * k, 90 * k); gl.addColorStop(0, 'rgba(255,235,130,' + (0.9 * fl) + ')'); gl.addColorStop(1, 'rgba(255,235,130,0)'); cx.fillStyle = gl; cx.beginPath(); cx.arc(bxl, byl + 14 * k, 90 * k, 0, 7); cx.fill(); }
      cx.fillStyle = grad(byl - 18 * k, byl + 8 * k, '#ff7a59', '#c23b22'); cx.beginPath(); cx.moveTo(bxl - 10 * k, byl - 20 * k); cx.lineTo(bxl + 10 * k, byl - 20 * k); cx.lineTo(bxl + 26 * k, byl + 8 * k); cx.lineTo(bxl - 26 * k, byl + 8 * k); cx.closePath(); cx.fill();
      esfera(bxl, byl + 14 * k, 10 * k, fl > 0.4 ? '#fff6b0' : '#d6dbe8', fl > 0.4 ? '#f59e0b' : '#7a8296');
      texto3d('Tic cada ' + T + ' s', lx - 10 * k, ly + 28 * k, 14 * k, 'center');
      texto3d('Largo: ' + r(L * 100, 0) + ' cm', 14, H * 0.66, 16 * k);
      if (medido !== null) texto3d('Tu período: ' + r(medido, 2) + ' s', 14, H * 0.66 + 24 * k, 16 * k);
    }
  });
}

// ---------- Nivel 3: La voz (micrófono) ----------
function jugarVoz(pred) {
  var RAT = [1.25, 1.5, 2.0], BANDAB = 0.04 * AJ_ACT.tol * AJ_ACT.bandaVoz * PERF.margenTutor('voz'), BANDA = r(BANDAB, 3), HOLD = 0.8 * AJ_ACT.hold, HOLD0 = 1.2 * AJ_ACT.hold, din = AJUSTES.dinamicoInicial();
  var fase = 'abriendo', ref = null, hold = 0, base = null, g = 0, f = null, fT = 0, sinAcierto = 0, total = 0, aciertos = [], usaMic = false, tPitch = 0, timer = 0;
  var yv = null, estrellasFondo = [], anillos = [], tAnillo = 0, xg = 0.3;
  sfxOn = false; // el micrófono escucharía los sonidos del juego

  escena('🎤 La voz',
    '<div id="manual" class="ctl-caja" hidden><label for="tono">Tono: <b id="vT">200</b> Hz (sin micrófono)</label><input id="tono" type="range" min="100" max="500" step="1" value="200"></div>' +
    '<button id="sinmic" class="sec chico ancho" type="button">🎚 Jugar sin micrófono (con la barra)</button>' +
    '<p id="info" role="status" aria-live="polite"></p>');
  for (var q = 0; q < (LIGERO ? 18 : 40); q++) estrellasFondo.push({ x: Math.random() * W, y: Math.random() * H * 0.6, s: 0.8 + Math.random() * 1.6, ph: Math.random() * 6 });
  var textos = ['Aro 1', 'Aro 2', 'Aro 3'];
  function pedidos() { pintarPedidos(textos, g, g); }
  pedidos(); masMenos('tono');
  decir('Hoy el globo sube con tu voz. Te pediré permiso para usar el micrófono; el sonido no sale de tu teléfono.');

  $('tono').addEventListener('input', function () { $('vT').textContent = this.value; });
  $('sinmic').onclick = function () {
    $('sinmic').hidden = true; cerrarMic();
    if (fase === 'abriendo') return empezar(false);
    usaMic = false; $('manual').hidden = false; decir('Listo: ahora el tono lo eliges con la barra.');
  };
  function empezar(ok) {
    usaMic = ok; fase = 'calibrar';
    if (!ok) { $('manual').hidden = false; $('sinmic').hidden = true; }
    decir(ok ? 'Canta una «aaa» cómoda y sostenida, sin cambiar el tono. Esa será tu nota base.' : 'Sin micrófono: usa el control para elegir un tono y mantenlo quieto. Esa será tu nota base.');
  }
  abrirMic().then(function (ok) {
    if (nivel === null || fase !== 'abriendo') { cerrarMic(); return; } // se fue del nivel o ya pasó el plazo
    empezar(ok);
  });
  // si el permiso nunca se responde, seguir con el control manual
  var plazo = setTimeout(function () { if (fase === 'abriendo') empezar(false); }, 10000);

  function frecuencia() {
    if (!usaMic) return fase === 'abriendo' ? null : parseFloat($('tono').value);
    return (performance.now() - fT < 200) ? f : null;
  }
  function Y(fr) {
    var o = Math.log(fr / (base || 200)) / Math.LN2;
    o = Math.max(-0.6, Math.min(1.4, o));
    return H * 0.66 - ((o + 0.6) / 2.0) * H * 0.5;
  }

  function terminar() {
    var ult = aciertos[aciertos.length - 1];
    var est = 1 + (pred.ok ? 1 : 0) + (total <= 90 ? 1 : 0);
    var filas = aciertos.map(function (x, i) { return '<tr><td>' + (i + 1) + '</td><td>×' + x.rat + '</td><td>' + x.meta + ' Hz</td><td>' + x.f + ' Hz</td></tr>'; }).join('');
    resultado(NIVELES[2], pred, {
      estrellas: est, puntos: pts,
      motivos: ['Pasaste el globo por los 3 aros.',
        pred.ok ? 'Tu predicción fue correcta.' : 'Tu predicción no fue la correcta, y eso también enseña.',
        total <= 90 ? 'Lo lograste en menos de 90 segundos.' : 'Con menos de 90 segundos ganas la tercera estrella.'],
      pregunta: 'Tu nota base fue de ' + r(base, 0) + ' Hz y en el último aro cantaste a ' + ult.f + ' Hz. ¿Cuánto da la última dividida entre la base? ¿Qué le pasa a la frecuencia cuando la nota se vuelve más aguda?',
      tabla: '<table><tr><th>Aro</th><th>Razón</th><th>Pedía</th><th>Lograste</th></tr>' + filas + '</table>',
      revela: 'Un sonido es una vibración y el tono depende de cuántas veces vibra por segundo (hercios, Hz): más agudo = más vibraciones por segundo. ' +
        'Cuando la frecuencia se duplica, la nota sube exactamente una octava: suena como la misma nota, pero más aguda. ' +
        'Es la misma idea de una botella con agua: con menos aire dentro, el aire vibra más rápido y el tono sube.'
    });
  }

  function aro(x, y, k, hecho, act) {
    var rx = 13 * k, ry = 25 * k;
    cx.lineWidth = 11 * k; cx.strokeStyle = '#8a5a26'; cx.beginPath(); cx.ellipse(x, y, rx, ry, 0, 0, 7); cx.stroke();
    cx.lineWidth = 8 * k; cx.strokeStyle = hecho ? '#2fd18b' : (act ? '#ffd23f' : '#d9a566'); cx.beginPath(); cx.ellipse(x, y, rx, ry, 0, 0, 7); cx.stroke();
    cx.lineWidth = 2; cx.strokeStyle = 'rgba(110,64,18,.5)'; for (var i = 0; i < 10; i++) { var a = i / 10 * 6.283; cx.beginPath(); cx.moveTo(x + Math.cos(a) * (rx - 4 * k), y + Math.sin(a) * (ry - 4 * k)); cx.lineTo(x + Math.cos(a) * (rx + 4 * k), y + Math.sin(a) * (ry + 4 * k)); cx.stroke(); }
    cx.fillStyle = 'rgba(215,200,160,.85)'; cx.fillRect(x - rx - 5 * k, y - ry * 0.2, 10 * k, 14 * k);
  }
  function cuarto() {
    var k = Math.min(W / 390, H / 600), i;
    cx.fillStyle = grad(0, H, '#1c1f5e', '#3d2f7d'); cx.fillRect(0, 0, W, H);
    // ventana con luna y ciudad
    var wx = W * 0.08, wy = H * 0.14, ww = W * 0.4, wh = H * 0.18;
    cx.fillStyle = '#ece8ff'; rr(wx - 7 * k, wy - 7 * k, ww + 14 * k, wh + 14 * k, 10 * k); cx.fill();
    cx.fillStyle = grad(wy, wy + wh, '#0d1450', '#3a56c8'); cx.fillRect(wx, wy, ww, wh);
    esfera(wx + ww * 0.72, wy + wh * 0.3, 16 * k, '#fff6c9', '#e8c85a');
    cx.fillStyle = '#10163f'; for (i = 0; i < 6; i++) { var bh = (0.25 + ((i * 37) % 50) / 100) * wh * 0.6; cx.fillRect(wx + i * ww / 6, wy + wh - bh, ww / 6 - 3 * k, bh); }
    cx.fillStyle = '#ffd23f'; for (i = 0; i < 10; i++) cx.fillRect(wx + ((i * 31) % 90) / 100 * ww + 4 * k, wy + wh * (0.65 + ((i * 17) % 30) / 100), 3 * k, 3 * k);
    cx.fillStyle = '#ece8ff'; cx.fillRect(wx + ww / 2 - 2 * k, wy, 4 * k, wh);
    // sofá
    var sy = H * 0.66;
    cx.fillStyle = grad(sy, H, '#ff7a9c', '#b8335a'); rr(-10 * k, sy + 20 * k, W + 20 * k, H - sy, 26 * k); cx.fill();
    cx.fillStyle = grad(sy - 8 * k, sy + 40 * k, '#ff93b0', '#cf4569'); rr(W * 0.05, sy - 10 * k, W * 0.9, 60 * k, 22 * k); cx.fill();
    cx.fillStyle = 'rgba(255,255,255,.18)'; for (i = 0; i < 3; i++) rr(W * (0.1 + i * 0.29), sy, W * 0.25, 40 * k, 16 * k), cx.fill();
    // lámpara de pie
    var lx = W * 0.9; cx.strokeStyle = '#d0c4a8'; cx.lineWidth = 5 * k; cx.beginPath(); cx.moveTo(lx, sy + 20 * k); cx.lineTo(lx, H * 0.32); cx.stroke();
    var gl = cx.createRadialGradient(lx, H * 0.3, 4, lx, H * 0.3, 80 * k); gl.addColorStop(0, 'rgba(255,225,140,.5)'); gl.addColorStop(1, 'rgba(255,225,140,0)'); cx.fillStyle = gl; cx.beginPath(); cx.arc(lx, H * 0.3, 80 * k, 0, 7); cx.fill();
    cx.fillStyle = '#ffe9a8'; cx.beginPath(); cx.moveTo(lx - 12 * k, H * 0.27); cx.lineTo(lx + 12 * k, H * 0.27); cx.lineTo(lx + 24 * k, H * 0.33); cx.lineTo(lx - 24 * k, H * 0.33); cx.closePath(); cx.fill();
  }

  arrancar({
    limpiar: function () { clearTimeout(timer); clearTimeout(plazo); },
    actualizar: function (dt) {
      if (fase === 'abriendo') return;
      total += dt; tPitch += dt;
      if (usaMic && mic.an && tPitch > 0.05) {
        tPitch = 0;
        mic.an.getFloatTimeDomainData(mic.buf);
        var res = DSP.pitchYIN(mic.buf, mic.ctx.sampleRate, 80, 1000, 0.01 * AJ_ACT.sensibilidadMic);
        if (res) { f = res.freq; fT = performance.now(); }
      }
      var fr = frecuencia();
      var objetivo = fr !== null ? Y(fr) : H * 0.68;
      yv = yv === null ? objetivo : yv + (objetivo - yv) * Math.min(1, dt * 8);
      tAnillo += dt;
      if (fr !== null && tAnillo > 0.22 && !LIGERO) { tAnillo = 0; anillos.push({ r: 22, t: 0 }); }
      for (var a = anillos.length - 1; a >= 0; a--) { anillos[a].t += dt; anillos[a].r += 80 * dt; if (anillos[a].t > 0.8) anillos.splice(a, 1); }
      estrellasFondo.forEach(function (e) { e.ph += dt; });

      if (fase === 'calibrar') {
        if (fr === null) { hold = 0; ref = null; return; }
        if (ref !== null && Math.abs(fr - ref) / ref < 0.04) hold += dt; else { ref = fr; hold = 0; }
        if (hold >= HOLD0) {
          base = ref; fase = 'puertas'; hold = 0; g = 0; sinAcierto = 0; chisporroteo(W * 0.3, yv, 24); sonido('ok'); vibra(30);
          decir('¡Nota base: ' + r(base, 0) + ' Hz! Ahora sube tu voz hasta cada aro y mantén el tono.', 'alegre'); pedidos();
        }
        return;
      }
      if (fase === 'puertas') {
        var meta = base * RAT[g];
        xg += ((0.3 + 0.32 * Math.min(1, hold / HOLD)) - xg) * Math.min(1, dt * 6);
        if (fr !== null && Math.abs(fr / meta - 1) <= BANDA) {
          hold += dt; sinAcierto = 0;
          if (hold >= HOLD) {
            var errorRel = Math.abs(fr / meta - 1), pa = puntosPorAcierto(errorRel, BANDA), el = elogio(pa.bonus);
            aciertos.push({ rat: RAT[g], meta: r(meta, 0), f: r(fr, 0) });
            din = AJUSTES.ajusteDinamico(din, true); BANDA = r(BANDAB * din.mult, 3);
            chisporroteo(W * 0.62, Y(meta), 40); confeti(pa.bonus >= 80 ? 70 : 35); destello(); vibra([30, 30, 60]); sonidoVozOk();
            splash(el.t, el.c); sumar(pa.ganados, W / 2, H * 0.34); pintarCombo();
            g++; hold = 0; xg = 0.3; pedidos();
            if (g >= RAT.length) { fase = 'fin'; decir('¡Los tres aros superados!', 'alegre'); timer = setTimeout(function () { splash('¡NIVEL COMPLETADO!', '#ff5c8a'); timer = setTimeout(terminar, 1400); }, 900); }
            else decir('¡Aro superado! El siguiente está más arriba. ¿Cuánto más agudo tendrá que ser tu tono?', 'alegre');
          }
        } else {
          hold = 0;
          if (fr !== null) {
            sinAcierto += dt;
            if (sinAcierto > 6) {
              sinAcierto = 0;
              din = AJUSTES.ajusteDinamico(din, false); BANDA = r(BANDAB * din.mult, 3);
              decir((din.pista ? 'Pista: tu meta está cerca de ' + r(meta, 0) + ' Hz. ' : '') + (fr < meta ? 'Tu tono está por debajo del aro. ¿Qué cambia en tu garganta cuando cantas más agudo?' : 'Te pasaste del aro. ¿Cómo bajarías tu tono con suavidad?'));
            }
          }
        }
      }
    },
    dibujar: function () {
      var k = Math.min(W / 390, H / 600), fr = frecuencia(), i;
      fondo(cuarto);
      estrellasFondo.forEach(function (e) { cx.globalAlpha = 0.4 + 0.6 * Math.abs(Math.sin(e.ph * 2)); cx.fillStyle = '#fff'; cx.beginPath(); cx.arc(e.x, e.y, e.s, 0, 7); cx.fill(); });
      cx.globalAlpha = 1;
      if (fase === 'abriendo') { texto3d('Esperando el micrófono…', W / 2, H * 0.4, 20 * k, 'center'); return; }
      if (fase === 'calibrar') {
        texto3d('Canta «aaa» y mantén el tono', W / 2, H * 0.42, 20 * k, 'center');
        var pulso = 1 + 0.08 * Math.sin(tt * 6);
        cx.font = Math.round(60 * k * pulso) + 'px system-ui,sans-serif'; cx.textAlign = 'center'; cx.fillStyle = '#fff'; cx.fillText('🎤', W / 2, H * 0.52);
        texto3d(fr === null ? 'No te escucho todavía' : r(fr, 0) + ' Hz', W / 2, H * 0.6, 28 * k, 'center');
        rr(W * 0.2, H * 0.64, W * 0.6, 16, 8); cx.fillStyle = 'rgba(255,255,255,.3)'; cx.fill();
        if (hold > 0) { rr(W * 0.2, H * 0.64, Math.max(16, W * 0.6 * Math.min(1, hold / 1.2)), 16, 8); cx.fillStyle = PAL.verde; cx.fill(); }
        return;
      }
      var ax = W * 0.66;
      for (i = 0; i < RAT.length; i++) {
        var y = Y(base * RAT[i]), act = (i === g && fase === 'puertas'), hecho = i < g;
        aro(ax, y, k, hecho, act);
        cx.fillStyle = '#fff7d6'; rr(ax + 22 * k, y - 12 * k, 72 * k, 24 * k, 6 * k); cx.fill(); cx.strokeStyle = '#8a5a26'; cx.lineWidth = 2; cx.stroke();
        texto((hecho ? '✔ ' : '') + r(base * RAT[i], 0) + ' Hz', ax + 58 * k, y + 5 * k, 13 * k, 'center');
      }
      var yb = Y(base);
      cx.strokeStyle = 'rgba(255,255,255,.55)'; cx.lineWidth = 2; cx.setLineDash([6, 6]); cx.beginPath(); cx.moveTo(W * 0.08, yb); cx.lineTo(W * 0.5, yb); cx.stroke(); cx.setLineDash([]);
      texto3d('Tu nota base · ' + r(base, 0) + ' Hz', W * 0.08, yb - 8, 13 * k);
      // globo de fiesta con hilo, ondas de sonido
      var gx = W * xg, gy = yv === null ? H * 0.68 : yv;
      anillos.forEach(function (an) { cx.globalAlpha = Math.max(0, 0.6 - an.t / 0.8 * 0.6); cx.strokeStyle = '#fff'; cx.lineWidth = 3; cx.beginPath(); cx.arc(gx, gy, an.r, 0, 7); cx.stroke(); });
      cx.globalAlpha = 1;
      cx.strokeStyle = '#fff'; cx.lineWidth = 2; cx.beginPath(); cx.moveTo(gx, gy + 28 * k);
      for (var w = 1; w <= 6; w++) cx.lineTo(gx + Math.sin(tt * 3 + w) * 5, gy + 28 * k + w * 8 * k);
      cx.stroke();
      var gg = cx.createRadialGradient(gx - 8 * k, gy - 10 * k, 3, gx, gy, 30 * k);
      gg.addColorStop(0, '#fff'); gg.addColorStop(0.2, '#ff9fbe'); gg.addColorStop(1, '#d11f5a');
      cx.fillStyle = gg; cx.beginPath(); cx.ellipse(gx, gy, 23 * k, 29 * k, 0, 0, 7); cx.fill();
      cx.fillStyle = '#b8174a'; cx.beginPath(); cx.moveTo(gx - 5 * k, gy + 30 * k); cx.lineTo(gx + 5 * k, gy + 30 * k); cx.lineTo(gx, gy + 23 * k); cx.closePath(); cx.fill();
      if (fr !== null) texto3d(r(fr, 0) + ' Hz', gx, gy + 62 * k, 14 * k, 'center');
      if (fase === 'puertas') {
        rr(W * 0.14, H * 0.69, W * 0.72, 12, 6); cx.fillStyle = 'rgba(255,255,255,.3)'; cx.fill();
        if (hold > 0) { rr(W * 0.14, H * 0.69, Math.max(12, W * 0.72 * Math.min(1, hold / HOLD)), 12, 6); cx.fillStyle = PAL.verde; cx.fill(); }
      }
    }
  });
}
function sonidoVozOk() { var prev = sfxOn; sfxOn = true; sonido('ok'); sfxOn = prev; }

// ---------- Niveles, menú y resultado ----------
var NIVELES = [
  {
    id: 'rampa', icono: '🎢', titulo: 'La rampa de cartón', sub: 'Inclina tu teléfono', color: '#ff9f43', sensor: 'mov', jugar: jugarRampa,
    historia: '¡Hola! Soy Chispa. La estación está apagada y necesito entregar tres pedidos: una canica debe caer en un vaso justo a tiempo. Tu teléfono será la rampa de cartón: inclínalo y suelta la canica.',
    pred: { q: 'Si inclinas el teléfono al DOBLE de ángulo, ¿cuánto tardará la canica en llegar?', ops: [
      { id: 'mitad', t: 'La mitad del tiempo' }, { id: 'menos', t: 'Menos tiempo, pero no la mitad', ok: true }, { id: 'igual', t: 'El mismo tiempo' }] }
  },
  {
    id: 'pendulo', icono: '⏱', titulo: 'El péndulo del estante', sub: 'Sincroniza el ritmo', color: '#3b82f6', sensor: 'tactil', jugar: jugarPendulo,
    historia: 'El reloj de la estación necesita un péndulo que vaya al ritmo de la lámpara. Puedes colgar una moneda, unas llaves, una manzana o una lata, y cambiar el largo del hilo. ¡A sincronizar!',
    pred: { q: 'Si cuelgas un objeto MÁS PESADO (mismo hilo), el péndulo tardará…', ops: [
      { id: 'mas', t: 'Más en ir y volver' }, { id: 'menos', t: 'Menos en ir y volver' }, { id: 'igual', t: 'Lo mismo', ok: true }] }
  },
  {
    id: 'voz', icono: '🎤', titulo: 'La voz y el globo', sub: 'Canta y pasa los aros', color: '#ff5c8a', sensor: 'mic', jugar: jugarVoz,
    historia: 'La última compuerta es sensible al sonido. Tu voz hace subir un globo de fiesta a través de aros de cartón. ¡Prepara la voz!',
    pred: { q: 'Cuando cantas una nota más AGUDA, la frecuencia de tu voz (vibraciones por segundo)…', ops: [
      { id: 'sube', t: 'Sube', ok: true }, { id: 'baja', t: 'Baja' }, { id: 'igual', t: 'Se queda igual' }] }
  }
];

function buscarNivel(id) {
  for (var i = 0; i < NIVELES.length; i++) if (NIVELES[i].id === id) return NIVELES[i];
  return null;
}

function ordenNiveles() {
  var l = NIVELES.slice(), i;
  if (AJ_ACT.voz) ['voz', 'globo'].forEach(function (id) {
    for (i = 0; i < l.length; i++) if (l[i].id === id) { l.unshift(l.splice(i, 1)[0]); break; }
  });
  var reco = PERF.recomendado();
  if (reco) for (i = 0; i < l.length; i++) if (l[i].id === reco) { l.unshift(l.splice(i, 1)[0]); break; }
  return l;
}

function menu() {
  var total = 0, puntosTotal = 0, jug = PERF.actual();
  var tarjetas = ordenNiveles().map(function (n, i) {
    var e = progreso[n.id] || 0, p = progreso[n.id + '_pts'] || 0; total += e; puntosTotal += p;
    return '<a class="tarjeta" style="--c:' + n.color + ';--d:' + (0.15 + i * 0.12) + 's" href="#/n/' + n.id + '"><span class="ico" aria-hidden="true">' + n.icono +
      '</span><span><b>' + esc(n.titulo) + '</b>' + (n.id === PERF.recomendado() ? '<span class="insignia">⭐ Para ti</span>' : '') + '<small>' + esc(n.sub) + (p ? ' · récord ' + p + ' ⭐' : '') + '</small><span class="est" aria-label="' + e + ' de 3 estrellas">' + estrellas(e) + '</span></span></a>';
  }).join('');
  var bombillas = '';
  for (var b = 0; b < NIVELES.length * 3; b++) bombillas += '<span class="b' + (b < total ? ' on' : '') + '"></span>';
  app.innerHTML = '<h2>Chispa y la estación apagada</h2>' +
    chispa('¡Hola' + (jug ? ', ' + jug.nombre : '') + '! Soy Chispa. Ayúdame a encender la estación científica. Cada sala es un reto: predices, juegas y descubres cómo funciona el mundo. ¡Solo necesitas tu teléfono!') +
    tarjetas + '<p>Energía de la estación: <b>' + total + ' de ' + (NIVELES.length * 3) + '</b><span class="bombillas" role="img" aria-label="' + total + ' de ' + (NIVELES.length * 3) + ' bombillas encendidas">' + bombillas + '</span></p>';
  app.insertAdjacentHTML('beforeend', '<p class="fila-menu"><button class="sec chico" id="m-ajustes">⚙ Ajustes</button> <button class="sec chico" id="m-quien">👤 Cambiar de jugador</button></p>');
  $('m-ajustes').onclick = function () { audio(); sonido('clic'); PERF.ajustes(); };
  $('m-quien').onclick = function () { audio(); sonido('clic'); PERF.quien(); };
  var cc = document.querySelector('.chispa'); if (cc) cc.className = 'chispa habla';
}

function intro(n) {
  detener();
  var letras = ['A', 'B', 'C'];
  app.innerHTML = '<a class="volver" href="#/">← Menú</a><br><h2>' + n.icono + ' ' + esc(n.titulo) + '</h2>' + chispa(n.historia) +
    '<h3>Antes de jugar, predice</h3><p>' + esc(n.pred.q) + '</p><div id="ops">' +
    n.pred.ops.map(function (o, i) { return '<button class="op" data-i="' + i + '"><span class="letra">' + letras[i] + '</span>' + esc(o.t) + '</button>'; }).join('') + '</div>' +
    (AJ_ACT.avisos ? '<p class="nota">Cuando elijas una respuesta, el juego se pone en pantalla completa. Para salir, toca la ✕ de arriba.</p>' : '');
  $('ops').onclick = function (e) {
    var el = e.target;
    while (el && el !== this && !(el.getAttribute && el.getAttribute('data-i') !== null)) el = el.parentNode;
    if (!el || el === this) return;
    var o = n.pred.ops[parseInt(el.getAttribute('data-i'), 10)];
    audio(); sonido('clic'); pantallaCompleta();
    if (n.sensor === 'mov') pedirMovimiento();
    n.jugar({ id: o.id, ok: !!o.ok });
  };
}

function resultado(n, pred, res) {
  detener();
  sonido('fin'); confeti(140); vibra([40, 40, 40, 40, 120]);
  var prev = progreso[n.id] || 0, prevP = progreso[n.id + '_pts'] || 0, record = res.puntos > prevP;
  if (res.estrellas > prev) progreso[n.id] = res.estrellas;
  if (record) progreso[n.id + '_pts'] = res.puntos;
  var jug = PERF.actual();
  if (jug) {
    PERFILES.registrarPartida(jug, n.id, { predOk: !!pred.ok, estrellas: res.estrellas, seg: (performance.now() - tInicioPartida) / 1000 });
    // el tutor aprende: la idea (¿predijo bien?) y la destreza (tercera estrella)
    PERFILES.registrarMaestria(jug, n.id, { predOk: !!pred.ok, habil: res.estrellas - 1 - (pred.ok ? 1 : 0) >= 1 });
  }
  guardar();
  var sig = NIVELES[NIVELES.indexOf(n) + 1], est = '', i;
  for (i = 0; i < 3; i++) {
    est += '<span class="e' + (i < res.estrellas ? ' on' : '') + '" style="--i:' + i + '">' + (i < res.estrellas ? '★' : '☆') + '</span>';
    if (i < res.estrellas) pip(660 + i * 180, 0.25, 'triangle', 0.16, 0.2 + i * 0.35 + 0.5);
  }
  app.innerHTML = '<h2>' + n.icono + ' ' + esc(n.titulo) + ': ¡completado!</h2>' +
    '<p class="estrellas" role="img" aria-label="' + res.estrellas + ' de 3 estrellas">' + est + '</p>' +
    '<p class="puntaje">⭐ ' + res.puntos + ' puntos' + (record && prevP ? ' · ¡NUEVO RÉCORD!' : '') + '</p>' +
    '<ul>' + res.motivos.map(function (m) { return '<li>' + esc(m) + '</li>'; }).join('') + '</ul>' +
    chispa(res.pregunta) + res.tabla +
    '<p><button id="revelar">Ver qué pasó</button></p><div id="revela" class="tutor" hidden><p>' + esc(res.revela) + '</p></div>' +
    '<p><button id="otra" class="sec">Jugar otra vez</button> ' + (sig ? '<a class="btn" href="#/n/' + sig.id + '">Siguiente nivel →</a>' : '<a class="btn" href="#/">Volver al menú</a>') + '</p>';
  var cc = document.querySelector('.chispa'); if (cc) cc.className = 'chispa habla';
  $('revelar').onclick = function () { $('revela').hidden = false; this.hidden = true; sonido('clic'); };
  $('otra').onclick = function () { intro(n); };
}

function ruta() {
  var h = location.hash || '#/', m = h.match(/^#\/n\/(\w+)/);
  window.scrollTo(0, 0);
  detener();
  if (!PERF.actual()) { PERF.entrar(); return; }
  var n = m ? buscarNivel(m[1]) : null;
  if (n) intro(n); else menu();
}
