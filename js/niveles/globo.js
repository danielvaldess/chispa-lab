'use strict';
// Nivel «El globo largo»: practicar una «aaa» sostenida. Es un juego de práctica (por ejemplo para acompañar
// ejercicios de voz que ya indica un especialista), no una medición clínica ni un tratamiento.
// Usa las globales de juego.js (escena, decir, arrancar, abrirMic, sumar, resultado...), por eso se carga después.

function jugarGlobo(pred) {
  var AJ = AJ_ACT;
  var FACTOR = AJ.edad <= 6 ? 0.6 : (AJ.edad <= 8 ? 0.8 : (AJ.edad >= 14 ? 1.2 : 1));
  var METAS = [3, 5, 8].map(function (m) { return Math.max(1.5, Math.round(m * FACTOR * 2) / 2); });
  var HUECO = 0.5; // s sin sonido que se perdonan
  var fase = 'abriendo', usaMic = false, etapa = 0, sostenido = 0, hueco = 0, total = 0, tPitch = 0, f = null, fT = 0, apretado = false, vol = 0;
  var mejor = 0, hzMin = 0, hzMax = 0, estables = [], enMeta = [], altura = 0, timer = 0, plazo = 0, anillos = [], tAnillo = 0, nubes = [], i;
  sfxOn = false; // el micrófono escucharía los sonidos del juego

  escena('🎈 El globo largo',
    '<div class="ctl-caja" id="zona-mant" hidden><button id="mantener" class="sec ancho" type="button">🎤 Mantén pulsado para «cantar»</button></div>' +
    '<button id="sinmic" class="sec chico ancho" type="button">🎚 Jugar sin micrófono (mantén pulsado)</button>' +
    '<p id="info" role="status" aria-live="polite"></p>');
  for (i = 0; i < 5; i++) nubes.push({ x: Math.random() * W, y: H * (0.12 + Math.random() * 0.4), s: 0.7 + Math.random() * 0.8, v: 6 + Math.random() * 8 });
  var textos = METAS.map(function (m) { return m + ' s'; });
  function pedidos() { pintarPedidos(textos, etapa, etapa); }
  function info() { $('info').textContent = 'Meta ' + (etapa + 1) + ' de 3: mantén la «aaa» durante ' + METAS[etapa] + ' segundos. Si te quedas sin aire, respira y sigue.'; }
  pedidos(); info();
  decir('Mi globo necesita viento para subir. Tu voz es el viento: canta una «aaa» larga y tranquila, sin prisa.');

  function empezar(ok) {
    clearTimeout(plazo);
    if (fase !== 'abriendo') return;
    usaMic = ok; fase = 'jugar';
    if (!ok) { $('zona-mant').hidden = false; $('sinmic').hidden = true; }
    decir(ok ? '¡Cuando quieras! Canta «aaa» y mira cómo sube el globo.' : 'Sin micrófono: mantén pulsado el botón mientras «cantas». El globo sube mientras lo mantienes.');
    PERF.leer(ok ? 'Canta aaa y mira cómo sube el globo.' : '');
  }
  $('sinmic').onclick = function () { $('sinmic').hidden = true; cerrarMic(); usaMic = false; if (fase === 'abriendo') return empezar(false); $('zona-mant').hidden = false; decir('Listo: mantén pulsado el botón mientras «cantas».'); };
  var m = $('mantener');
  m.onpointerdown = function (e) { apretado = true; try { m.setPointerCapture(e.pointerId); } catch (x) {} };
  m.onpointerup = m.onpointercancel = function () { apretado = false; };
  abrirMic().then(function (ok) {
    if (nivel === null || fase !== 'abriendo') { cerrarMic(); return; }
    empezar(ok);
  });
  plazo = setTimeout(function () { if (fase === 'abriendo') empezar(false); }, 10000);

  function leerVoz(dt) {
    if (!usaMic) { vol = apretado ? 0.5 : 0; return apretado ? 220 : null; }
    tPitch += dt;
    if (mic.an && tPitch > 0.05) {
      tPitch = 0; mic.an.getFloatTimeDomainData(mic.buf);
      var s = 0, j; for (j = 0; j < mic.buf.length; j++) s += mic.buf[j] * mic.buf[j];
      vol = Math.min(1, Math.sqrt(s / mic.buf.length) * 8);
      var res = DSP.pitchYIN(mic.buf, mic.ctx.sampleRate, 80, 1000, 0.01 * AJ.sensibilidadMic);
      if (res) { f = res.freq; fT = performance.now(); }
    }
    return (performance.now() - fT < 200) ? f : null;
  }

  function meta() {
    var obj = METAS[etapa], estab = 1;
    if (enMeta.length > 3) {
      var med = enMeta.slice().sort(function (a, b) { return a - b; })[enMeta.length >> 1], dentro = 0;
      enMeta.forEach(function (h) { if (Math.abs(h / med - 1) <= 0.12) dentro++; });
      estab = dentro / enMeta.length;
    }
    estables.push(estab);
    var pa = puntosPorAcierto(1 - estab, 1), el = elogio(pa.bonus);
    sonidoVozOk(); chisporroteo(W * 0.5, H * 0.3, 40); confeti(pa.bonus >= 80 ? 70 : 35); destello(); vibra([30, 30, 60]);
    splash(el.t, el.c); sumar(pa.ganados, W / 2, H * 0.34); pintarCombo();
    etapa++; sostenido = 0; hueco = 0; enMeta = []; pedidos();
    if (etapa >= METAS.length) { fase = 'fin'; decir('¡Tres metas! Tu globo llegó muy alto.', 'alegre'); timer = setTimeout(function () { splash('¡NIVEL COMPLETADO!', '#ff5c8a'); timer = setTimeout(terminar, 1400); }, 900); return; }
    decir('¡Meta lograda! Respira tranquilo. La siguiente es de ' + METAS[etapa] + ' segundos.', 'alegre'); info();
  }

  function terminar() {
    var estMedia = estables.reduce(function (a, b) { return a + b; }, 0) / (estables.length || 1);
    var est = 1 + (pred.ok ? 1 : 0) + (estMedia >= 0.7 ? 1 : 0);
    var p = PERF.actual();
    if (p) { PERFILES.registrarSesionVoz(p, { max: mejor, hzMin: hzMin, hzMax: hzMax }); PERF.guardar(); }
    var filas = METAS.map(function (mt, k) { return '<tr><td>' + (k + 1) + '</td><td>' + mt + ' s</td><td>' + Math.round((estables[k] || 0) * 100) + ' %</td></tr>'; }).join('');
    resultado(buscarNivel('globo'), pred, {
      estrellas: est, puntos: pts,
      motivos: ['Lograste las 3 metas de voz sostenida.',
        pred.ok ? 'Tu predicción fue correcta.' : 'Tu predicción no fue la correcta, y eso también enseña.',
        estMedia >= 0.7 ? 'Tu tono se mantuvo muy parejo.' : 'Si mantienes el tono más parejo ganas la tercera estrella.'],
      pregunta: 'Tu «aaa» más larga duró ' + r(mejor, 1) + ' segundos' + (hzMax ? ' y tu tono estuvo entre ' + Math.round(hzMin) + ' y ' + Math.round(hzMax) + ' Hz' : '') + '. ¿Qué crees que pasa con la frecuencia cuando mantienes el sonido muy parejo?',
      tabla: '<table><tr><th>Meta</th><th>Pedía</th><th>Tono parejo</th></tr>' + filas + '</table>',
      revela: 'Al sostener una vocal, tus cuerdas vocales vibran a un ritmo casi constante, por eso la frecuencia queda casi plana. ' +
        'Es un juego de práctica: no mide ni trata nada. Si haces ejercicios de voz con un especialista, él decide cómo practicar.'
    });
  }

  arrancar({
    limpiar: function () { clearTimeout(timer); clearTimeout(plazo); },
    actualizar: function (dt) {
      for (var n = 0; n < nubes.length; n++) { nubes[n].x += nubes[n].v * dt; if (nubes[n].x > W + 80) nubes[n].x = -80; }
      if (fase === 'abriendo') return;
      total += dt;
      for (var a = anillos.length - 1; a >= 0; a--) { anillos[a].t += dt; anillos[a].r += 70 * dt; if (anillos[a].t > 0.8) anillos.splice(a, 1); }
      if (fase !== 'jugar') return;
      var fr = leerVoz(dt);
      if (fr !== null) {
        sostenido += dt; hueco = 0; enMeta.push(fr);
        if (!hzMin || fr < hzMin) hzMin = fr; if (fr > hzMax) hzMax = fr;
        tAnillo += dt; if (tAnillo > 0.25 && !LIGERO && !AJ.calma) { tAnillo = 0; anillos.push({ r: 20, t: 0 }); }
        if (sostenido > mejor) mejor = sostenido;
        if (sostenido >= METAS[etapa]) meta();
      } else if (sostenido > 0) {
        hueco += dt;
        if (hueco > HUECO) { sostenido = Math.max(0, sostenido - dt * 1.5); if (sostenido === 0) { enMeta = []; } }
      }
      altura += ((sostenido / METAS[Math.min(etapa, METAS.length - 1)]) - altura) * Math.min(1, dt * 5);
    },
    dibujar: function () {
      var k = Math.min(W / 390, H / 600), i2;
      cx.fillStyle = grad(0, H, '#6cc8ff', '#d9f1ff'); cx.fillRect(0, 0, W, H);
      esfera(W * 0.82, H * 0.14, 24 * k, '#fff2a8', '#ffc83a');
      for (i2 = 0; i2 < nubes.length; i2++) nube(nubes[i2].x, nubes[i2].y, nubes[i2].s * k);
      cx.fillStyle = grad(H * 0.66, H, '#6fd36f', '#2f9e44'); cx.fillRect(0, H * 0.66, W, H * 0.34);
      var topeY = H * 0.2, baseY = H * 0.6, gx = W * 0.5, h2 = Math.min(1, altura);
      cx.strokeStyle = 'rgba(29,34,80,.35)'; cx.lineWidth = 6 * k; cx.beginPath(); cx.moveTo(gx, baseY + 30 * k); cx.lineTo(gx, topeY - 10 * k); cx.stroke();
      cx.fillStyle = '#ffd23f'; cx.beginPath(); cx.moveTo(gx + 6 * k, topeY - 10 * k); cx.lineTo(gx + 52 * k, topeY + 4 * k); cx.lineTo(gx + 6 * k, topeY + 18 * k); cx.closePath(); cx.fill();
      texto(fase === 'fin' ? '✔' : METAS[Math.min(etapa, METAS.length - 1)] + ' s', gx + 28 * k, topeY + 6 * k, 13 * k, 'center');
      var gy = baseY - (baseY - topeY) * h2 + Math.sin(tt * 2) * 3 * k;
      anillos.forEach(function (an) { cx.globalAlpha = Math.max(0, 1 - an.t / 0.8); cx.strokeStyle = '#fff'; cx.lineWidth = 3; cx.beginPath(); cx.arc(gx, gy, an.r * k, 0, 7); cx.stroke(); });
      cx.globalAlpha = 1;
      cx.strokeStyle = '#fff'; cx.lineWidth = 2; cx.beginPath(); cx.moveTo(gx, gy + 38 * k); cx.quadraticCurveTo(gx + 10 * k, gy + 60 * k, gx - 4 * k, gy + 78 * k); cx.stroke();
      cx.fillStyle = '#ff5c8a'; cx.beginPath(); cx.ellipse(gx, gy, 30 * k, 37 * k, 0, 0, 7); cx.fill();
      cx.fillStyle = 'rgba(255,255,255,.55)'; cx.beginPath(); cx.ellipse(gx - 10 * k, gy - 14 * k, 6 * k, 11 * k, -0.5, 0, 7); cx.fill();
      cx.fillStyle = '#c2255c'; cx.beginPath(); cx.moveTo(gx - 6 * k, gy + 44 * k); cx.lineTo(gx + 6 * k, gy + 44 * k); cx.lineTo(gx, gy + 34 * k); cx.fill();
      if (fase === 'abriendo') { texto3d('Esperando el micrófono…', W / 2, H * 0.74, 20 * k, 'center'); return; }
      var ver = Math.min(etapa, METAS.length - 1);
      texto3d(r(sostenido, 1) + ' / ' + METAS[ver] + ' s', W / 2, H * 0.72, 28 * k, 'center');
      rr(W * 0.2, H * 0.76, W * 0.6, 14, 7); cx.fillStyle = 'rgba(255,255,255,.5)'; cx.fill();
      if (vol > 0.02) { rr(W * 0.2, H * 0.76, Math.max(14, W * 0.6 * vol), 14, 7); cx.fillStyle = PAL.azul; cx.fill(); }
      var fr2 = (performance.now() - fT < 200 && usaMic) ? f : null;
      texto3d(usaMic ? (fr2 === null ? 'Canta «aaa»' : r(fr2, 0) + ' Hz') : (apretado ? '🎶' : 'Mantén pulsado'), W / 2, H * 0.805, 16 * k, 'center');
    }
  });
}

NIVELES.push({
  id: 'globo', icono: '🎈', titulo: 'El globo largo', sub: 'Canta «aaa» sin prisa', color: '#2fd18b', sensor: 'mic', jugar: jugarGlobo,
  historia: 'Mi globo necesita viento para subir y tu voz es el viento. Canta una «aaa» larga y tranquila, sin prisa: el globo sube mientras sigues sonando. Si te quedas sin aire, respira y vuelve a intentarlo.',
  pred: { q: 'Si mantienes la «aaa» muy parejo, la frecuencia de tu voz que mide Chispa será…', ops: [
    { id: 'igual', t: 'Casi siempre la misma', ok: true }, { id: 'sube', t: 'Cada vez más aguda' }, { id: 'baja', t: 'Cada vez más grave' }] }
});
