'use strict';
// Nivel «Burbujas mágicas»: realidad aumentada ligera. Ves la cámara y revientas burbujas moviendo la mano.
// El movimiento se detecta comparando dos fotos seguidas (diferencia de píxeles); no hay IA ni se guarda nada.

function jugarBurbujas(pred) {
  var AJ = AJ_ACT;
  var FACTOR = AJ.edad <= 6 ? 0.6 : (AJ.edad <= 8 ? 0.8 : (AJ.edad >= 14 ? 1.3 : 1));
  var METAS = [6, 10, 14].map(function (m) { return Math.max(3, Math.round(m * FACTOR)); });
  var CX = 16, CY = 12, UMBRAL = 0.07, MAXB = AJ.calma ? 3 : 5;
  var GRANDE = (AJ.toquesGrandes ? 1.4 : 1) * (AJ.edad <= 8 ? 1.2 : 1);
  var fase = 'abriendo', modo = 'camara', cam = null, etapa = 0, hechas = 0, total = 0, tSpawn = 0, bubs = [], plazo = 0, timer = 0, mov = null, sacadas = 0, i;
  sfxOn = true;

  escena('🫧 Burbujas mágicas',
    '<button id="sincam" class="sec chico ancho" type="button">👆 Jugar sin cámara (tocando)</button>' +
    '<p id="info" role="status" aria-live="polite"></p>');
  function pedidos() { pintarPedidos(METAS.map(function (m) { return m + ' 🫧'; }), etapa, etapa); }
  function info() { $('info').textContent = (modo === 'camara' ? '🔴 Cámara encendida: la imagen se queda en tu teléfono. ' : '') + 'Meta ' + (Math.min(etapa, 2) + 1) + ' de 3: revienta ' + METAS[Math.min(etapa, 2)] + ' burbujas (' + hechas + ').'; }
  pedidos(); info();
  decir('Voy a usar la cámara para que veas tus manos en pantalla. Mueve la mano sobre una burbuja para reventarla. La imagen no se guarda ni se envía.');

  function empezar(conCamara) {
    clearTimeout(plazo);
    if (fase !== 'abriendo') return;
    modo = conCamara ? 'camara' : 'toque'; fase = 'jugar';
    if (!conCamara) $('sincam').hidden = true;
    info();
    decir(conCamara ? '¡Listo! Mueve la mano sobre las burbujas. También puedes tocarlas.' : 'Toca las burbujas para reventarlas.');
  }
  $('sincam').onclick = function () { if (cam) { cam.cerrar(); cam = null; } modo = 'toque'; $('sincam').hidden = true; if (fase === 'abriendo') empezar(false); else { info(); decir('Toca las burbujas para reventarlas.'); } };
  CAM.abrir({ frente: true }).then(function (c) {
    if (nivel === null || fase !== 'abriendo') { c.cerrar(); return; }
    cam = c; empezar(true);
  }).catch(function () {
    if (fase === 'abriendo') { decir('No pude usar la cámara, pero no pasa nada: toca las burbujas.', 'triste'); empezar(false); }
  });
  plazo = setTimeout(function () { if (fase === 'abriendo') { if (cam) { cam.cerrar(); cam = null; } empezar(false); } }, 12000);

  function nueva() {
    var r0 = (30 + Math.random() * 18) * GRANDE;
    bubs.push({ x: W * (0.12 + Math.random() * 0.76), y: H * 0.7, r: r0, v: (34 + Math.random() * 26) * (AJ.calma ? 0.6 : 1), ph: Math.random() * 6, m: 0 });
  }
  function reventar(b) {
    bubs.splice(bubs.indexOf(b), 1);
    hechas++; sacadas++;
    sonido('clic'); sonido('canica'); chisporroteo(b.x, b.y, 14, ['#ffffff', '#bfe7ff', '#ffd23f']); vibra(15);
    var pa = puntosPorAcierto(0.5, 1); sumar(Math.round(pa.ganados / 2), b.x, b.y); pintarCombo();
    info();
    if (hechas >= METAS[etapa]) {
      confeti(60); destello(); splash(elogio(60).t, '#2fd18b');
      etapa++; hechas = 0; pedidos();
      if (etapa >= METAS.length) { fase = 'fin'; decir('¡Todas las burbujas! Tu mano se volvió un sensor de movimiento.', 'alegre'); timer = setTimeout(function () { splash('¡NIVEL COMPLETADO!', '#ff5c8a'); timer = setTimeout(terminar, 1400); }, 900); return; }
      info(); decir('¡Meta lograda! La siguiente pide ' + METAS[etapa] + ' burbujas.', 'alegre');
    }
  }

  function terminar() {
    var est = 1 + (pred.ok ? 1 : 0) + (total <= 90 || AJ.sinTiempo ? 1 : 0);
    var filas = METAS.map(function (m, k) { return '<tr><td>' + (k + 1) + '</td><td>' + m + '</td></tr>'; }).join('');
    resultado(buscarNivel('burbujas'), pred, {
      estrellas: est, puntos: pts,
      motivos: ['Reventaste todas las burbujas de las 3 metas.',
        pred.ok ? 'Tu predicción fue correcta.' : 'Tu predicción no fue la correcta, y eso también enseña.',
        (total <= 90 || AJ.sinTiempo) ? 'Lo lograste con calma y a buen ritmo.' : 'Con menos de 90 segundos ganas la tercera estrella.'],
      pregunta: 'Si te quedas totalmente quieto frente a la cámara, ¿cuánto cambian los números de una foto a la siguiente? ¿Y si mueves la mano?',
      tabla: '<table><tr><th>Meta</th><th>Burbujas</th></tr>' + filas + '</table>',
      revela: 'Cada foto de la cámara es una cuadrícula de números. Si nada se mueve, dos fotos seguidas son casi iguales y la diferencia es casi cero. ' +
        'Tu mano cambia los números justo donde pasa, y así sabe Chispa dónde reventar la burbuja. La cámara no guarda ni envía nada.'
    });
  }

  var cv = $('cv');
  cv.onpointerdown = function (e) {
    if (fase !== 'jugar') return;
    var rect = cv.getBoundingClientRect(), px = e.clientX - rect.left, py = e.clientY - rect.top, j;
    for (j = bubs.length - 1; j >= 0; j--) if (Math.pow(bubs[j].x - px, 2) + Math.pow(bubs[j].y - py, 2) <= Math.pow(bubs[j].r * 1.15, 2)) { reventar(bubs[j]); break; }
  };

  arrancar({
    limpiar: function () { clearTimeout(timer); clearTimeout(plazo); if (cam) { cam.cerrar(); cam = null; } },
    actualizar: function (dt) {
      if (fase === 'abriendo') return;
      total += dt;
      if (fase !== 'jugar') return;
      tSpawn += dt;
      if (bubs.length < MAXB && tSpawn > (AJ.calma ? 1.4 : 0.9)) { tSpawn = 0; nueva(); }
      for (i = bubs.length - 1; i >= 0; i--) {
        var b = bubs[i];
        b.y -= b.v * dt; b.x += Math.sin(tt * 1.5 + b.ph) * 14 * dt;
        if (b.y < H * 0.1) { b.y = H * 0.7; b.x = W * (0.12 + Math.random() * 0.76); }
      }
      if (modo === 'camara' && cam && cam.actualizar()) {
        mov = cam.movimiento(CX, CY);
        if (mov) {
          for (i = bubs.length - 1; i >= 0; i--) {
            var bb = bubs[i], fx = bb.x / W, x0 = Math.floor(Math.max(0, fx - bb.r / W) * CX), x1 = Math.floor(Math.min(0.999, fx + bb.r / W) * CX);
            if (cam.frente) { var a0 = CX - 1 - x1, a1 = CX - 1 - x0; x0 = a0; x1 = a1; }
            var y0 = Math.floor(Math.max(0, (bb.y - bb.r) / H) * CY), y1 = Math.floor(Math.min(0.999, (bb.y + bb.r) / H) * CY), sum = 0, n = 0, cxx, cyy;
            for (cyy = y0; cyy <= y1; cyy++) for (cxx = x0; cxx <= x1; cxx++) { sum += mov[cyy * CX + cxx] || 0; n++; }
            if (n && sum / n > UMBRAL) { bb.m++; if (bb.m >= 2) reventar(bb); } else bb.m = 0;
          }
        }
      }
    },
    dibujar: function () {
      var k = Math.min(W / 390, H / 600), j;
      cx.fillStyle = grad(0, H, '#6cc8ff', '#b9e4ff'); cx.fillRect(0, 0, W, H);
      if (modo === 'camara' && cam && cam.listo()) {
        var vw = cam.video.videoWidth, vh = cam.video.videoHeight, esc2 = Math.max(W / vw, H / vh), sw = W / esc2, sh = H / esc2;
        cx.save(); if (cam.frente) { cx.translate(W, 0); cx.scale(-1, 1); }
        cx.drawImage(cam.video, (vw - sw) / 2, (vh - sh) / 2, sw, sh, 0, 0, W, H); cx.restore();
        cx.fillStyle = 'rgba(16,20,58,.15)'; cx.fillRect(0, 0, W, H);
      }
      if (fase === 'abriendo') { texto3d('Esperando la cámara…', W / 2, H * 0.4, 20 * k, 'center'); return; }
      for (j = 0; j < bubs.length; j++) {
        var b = bubs[j], g = cx.createRadialGradient(b.x - b.r * 0.35, b.y - b.r * 0.35, b.r * 0.1, b.x, b.y, b.r);
        g.addColorStop(0, 'rgba(255,255,255,.85)'); g.addColorStop(0.7, 'rgba(160,215,255,.35)'); g.addColorStop(1, 'rgba(120,180,255,.7)');
        cx.fillStyle = g; cx.beginPath(); cx.arc(b.x, b.y, b.r, 0, 7); cx.fill();
        cx.strokeStyle = 'rgba(255,255,255,.9)'; cx.lineWidth = 3; cx.stroke();
      }
      texto3d(hechas + ' / ' + METAS[Math.min(etapa, 2)], W / 2, H * 0.17, 26 * k, 'center');
    }
  });
}

NIVELES.push({
  id: 'burbujas', icono: '🫧', titulo: 'Burbujas mágicas', sub: 'Revienta con tus manos', color: '#29a0b1', sensor: 'camara', jugar: jugarBurbujas,
  historia: 'Las burbujas de la estación flotan por todas partes. Con la cámara te verás en pantalla: mueve la mano sobre una burbuja para reventarla. Tu cámara solo mira, la imagen se queda en tu teléfono y no se guarda.',
  pred: { q: 'Chispa detecta tu movimiento comparando dos fotos seguidas. Si te quedas totalmente quieto, la diferencia entre las dos fotos será…', ops: [
    { id: 'cero', t: 'Casi cero', ok: true }, { id: 'grande', t: 'Muy grande' }, { id: 'igual', t: 'Siempre la misma, te muevas o no' }] }
});
