'use strict';
// Nivel «Luz y color»: la cámara como sensor de color y de sombra. Nada se guarda ni se envía.
// Usa las globales de juego.js (escena, decir, arrancar, sumar, resultado...) y CAM de camara.js.

function jugarLuz(pred) {
  var AJ = AJ_ACT;
  var TODAS = [
    { id: 'rojo', txt: 'ROJO', e: '🍎', hex: '#e63946' }, { id: 'verde', txt: 'VERDE', e: '🌿', hex: '#2fd18b' },
    { id: 'azul', txt: 'AZUL', e: '🫐', hex: '#3b82f6' }, { id: 'sombra', txt: 'SOMBRA', e: '✋', hex: '#64748b' }
  ];
  var ordenes = TODAS, etapa = 0, fase = 'abriendo', modo = 'camara', cam = null, hold = 0, total = 0, sinMatch = 0, tOrden = 0, tiempos = [], timer = 0, plazo = 0;
  var HOLD = 1.0 * AJ.hold, TOLSOMBRA = Math.min(0.3, 0.15 * AJ.tol), SOMBRA = 0.5, colorAhora = null, sombraAhora = 0;
  sfxOn = true;

  escena('🌈 Luz y color',
    '<div id="tarjetas" class="fila" hidden></div>' +
    '<button id="sincam" class="sec chico ancho" type="button">🃏 Jugar sin cámara (con tarjetas)</button>' +
    '<p id="info" role="status" aria-live="polite"></p>');
  function pedidos() { pintarPedidos(ordenes.map(function (o) { return o.id === 'sombra' ? 'sombra' : o.id; }), etapa, etapa); }
  function orden() { return ordenes[Math.min(etapa, ordenes.length - 1)]; }
  function info() { $('info').textContent = modo === 'camara' ? '🔴 Cámara encendida: la imagen se queda en tu teléfono; no se guarda ni se envía.' : 'Sin cámara: toca la tarjeta del color que pide Chispa.'; }
  pedidos(); info();
  decir('Voy a usar la cámara para ver colores y sombras. Lo que ve se queda en tu teléfono: no se guarda ni se envía a nadie.');

  function textoOrden() {
    var o = orden();
    return o.id === 'sombra' ? 'Ahora haz una sombra: tapa con la mano más o menos la mitad de la cámara y mantenla quieta.' :
      'Busca algo de color ' + o.txt + ' y apúntalo al centro de la pantalla. ¡Una prenda, un juguete, una fruta!';
  }

  function pintarTarjetas() {
    var c = $('tarjetas'); c.hidden = false;
    c.innerHTML = TODAS.slice(0, 3).map(function (o) { return '<button class="sec tcolor" data-id="' + o.id + '" style="border-bottom:10px solid ' + o.hex + '"><span style="font-size:30px">' + o.e + '</span> ' + o.txt.charAt(0) + o.txt.slice(1).toLowerCase() + '</button>'; }).join('');
    var bs = c.querySelectorAll('.tcolor'), i;
    for (i = 0; i < bs.length; i++) bs[i].onclick = function () {
      if (fase !== 'jugar') return;
      if (this.getAttribute('data-id') === orden().id) exito(0.1); else { fallo(); }
    };
  }

  function empezar(conCamara) {
    clearTimeout(plazo);
    if (fase !== 'abriendo') return;
    modo = conCamara ? 'camara' : 'tarjetas'; fase = 'jugar';
    if (!conCamara) { ordenes = TODAS.slice(0, 3); pintarTarjetas(); $('sincam').hidden = true; }
    etapa = 0; pedidos(); info(); tOrden = 0;
    decir(conCamara ? textoOrden() : 'Toca la tarjeta del color ' + orden().txt + '.');
  }
  $('sincam').onclick = function () { if (cam) { cam.cerrar(); cam = null; } if (fase === 'abriendo') empezar(false); else { modo = 'tarjetas'; ordenes = TODAS.slice(0, 3); etapa = Math.min(etapa, 2); pintarTarjetas(); $('sincam').hidden = true; pedidos(); info(); decir('Toca la tarjeta del color ' + orden().txt + '.'); } };
  CAM.abrir({ frente: false }).then(function (c) {
    if (nivel === null || fase !== 'abriendo') { c.cerrar(); return; }
    cam = c; empezar(true);
  }).catch(function () {
    if (fase === 'abriendo') { decir('No pude usar la cámara, pero no pasa nada: jugamos con tarjetas.', 'triste'); empezar(false); }
  });
  plazo = setTimeout(function () { if (fase === 'abriendo') { if (cam) { cam.cerrar(); cam = null; } empezar(false); } }, 12000);

  function fallo() { combo = 0; pintarCombo(); sonido('mal'); sacudir(6); vibra([60, 40, 60]); decir('Ese no es el color que pide Chispa. ¡Prueba otra tarjeta!', 'triste'); }

  function exito(error) {
    var o = orden();
    tiempos.push({ id: o.id, t: r(tOrden, 1) });
    var pa = puntosPorAcierto(error, 1), el = elogio(pa.bonus);
    sonido('ok'); if (pa.mult >= 2) sonido('combo');
    chisporroteo(W / 2, H * 0.4, 40); confeti(pa.bonus >= 80 ? 70 : 35); destello(); vibra([30, 30, 60]);
    splash(el.t, el.c); sumar(pa.ganados, W / 2, H * 0.34); pintarCombo();
    etapa++; hold = 0; sinMatch = 0; tOrden = 0; pedidos();
    if (etapa >= ordenes.length) { fase = 'fin'; decir('¡Todo encontrado! Tu teléfono ya es un detector de luz y color.', 'alegre'); timer = setTimeout(function () { splash('¡NIVEL COMPLETADO!', '#ff5c8a'); timer = setTimeout(terminar, 1400); }, 900); return; }
    decir('¡Muy bien! ' + (modo === 'camara' ? textoOrden() : 'Ahora toca la tarjeta ' + orden().txt + '.'), 'alegre');
  }

  function terminar() {
    var est = 1 + (pred.ok ? 1 : 0) + (total <= 90 || AJ.sinTiempo ? 1 : 0);
    var filas = tiempos.map(function (x, i) { return '<tr><td>' + (i + 1) + '</td><td>' + esc(x.id) + '</td><td>' + x.t + ' s</td></tr>'; }).join('');
    resultado(buscarNivel('luz'), pred, {
      estrellas: est, puntos: pts,
      motivos: [modo === 'camara' ? 'Encontraste los colores y la sombra con la cámara.' : 'Encontraste los tres colores.',
        pred.ok ? 'Tu predicción fue correcta.' : 'Tu predicción no fue la correcta, y eso también enseña.',
        (total <= 90 || AJ.sinTiempo) ? 'Lo lograste con calma y a buen ritmo.' : 'Con menos de 90 segundos ganas la tercera estrella.'],
      pregunta: '¿Por qué crees que la hoja de una planta se ve verde, si la luz que le llega es blanca?',
      tabla: '<table><tr><th>Pedido</th><th>Qué</th><th>Tiempo</th></tr>' + filas + '</table>',
      revela: 'La luz blanca tiene todos los colores mezclados. Un objeto verde absorbe casi todos y devuelve sobre todo el verde: por eso lo ven tus ojos y la cámara. ' +
        'Una sombra aparece cuando algo tapa la luz; cuanto más cerca está el objeto de la luz, más grande es su sombra. La cámara no guarda ni envía nada.'
    });
  }

  arrancar({
    limpiar: function () { clearTimeout(timer); clearTimeout(plazo); if (cam) { cam.cerrar(); cam = null; } },
    actualizar: function (dt) {
      if (fase === 'abriendo') return;
      total += dt; tOrden += dt;
      if (fase !== 'jugar' || modo !== 'camara' || !cam) return;
      if (!cam.actualizar()) return;
      var o = orden(), ok = false;
      if (o.id === 'sombra') { sombraAhora = cam.sombra(); ok = Math.abs(sombraAhora - SOMBRA) <= TOLSOMBRA; }
      else { var c = cam.color(); colorAhora = c ? c.nombre : null; ok = colorAhora === o.id; }
      if (ok) { hold += dt; sinMatch = 0; } else { hold = Math.max(0, hold - dt * 2); sinMatch += dt; }
      if (sinMatch > 12) { sinMatch = 0; decir(o.id === 'sombra' ? 'Tapa la mitad de la cámara con la mano. Si tapas todo, la imagen queda negra.' : 'Prueba con más luz, o acércate un poco al objeto.', 'pensando'); }
      if (hold >= HOLD) exito(o.id === 'sombra' ? Math.abs(sombraAhora - SOMBRA) / (TOLSOMBRA || 1) * 0.5 : 0.1);
    },
    dibujar: function () {
      var k = Math.min(W / 390, H / 600), o = orden();
      cx.fillStyle = '#10143a'; cx.fillRect(0, 0, W, H);
      if (modo === 'camara' && cam && cam.listo()) {
        var vw = cam.video.videoWidth, vh = cam.video.videoHeight, esc2 = Math.max(W / vw, H / vh), sw = W / esc2, sh = H / esc2;
        cx.drawImage(cam.video, (vw - sw) / 2, (vh - sh) / 2, sw, sh, 0, 0, W, H);
        cx.fillStyle = 'rgba(16,20,58,.25)'; cx.fillRect(0, 0, W, H);
      } else if (modo === 'camara') { texto3d('Esperando la cámara…', W / 2, H * 0.4, 20 * k, 'center'); return; }
      else { cx.fillStyle = grad(0, H, '#3b2f7d', '#1c1f5e'); cx.fillRect(0, 0, W, H); texto3d('Elige la tarjeta ' + o.txt, W / 2, H * 0.3, 24 * k, 'center'); return; }
      // mira central y progreso
      var cxm = W / 2, cym = H * 0.38, rad = 56 * k;
      cx.lineWidth = 6 * k; cx.strokeStyle = 'rgba(255,255,255,.85)'; cx.strokeRect(cxm - rad, cym - rad, rad * 2, rad * 2);
      if (hold > 0) { cx.strokeStyle = PAL.verde; cx.beginPath(); cx.arc(cxm, cym, rad * 1.35, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.min(1, hold / HOLD)); cx.stroke(); }
      if (o.id === 'sombra') {
        var bx = W * 0.15, bw = W * 0.7, by = H * 0.6;
        rr(bx, by, bw, 16, 8); cx.fillStyle = 'rgba(255,255,255,.35)'; cx.fill();
        rr(bx + bw * (SOMBRA - TOLSOMBRA), by, bw * TOLSOMBRA * 2, 16, 8); cx.fillStyle = PAL.verde; cx.fill();
        cx.fillStyle = '#fff'; cx.beginPath(); cx.arc(bx + bw * Math.min(1, sombraAhora), by + 8, 11 * k, 0, 7); cx.fill();
        texto3d('Sombra: ' + Math.round(sombraAhora * 100) + ' %', W / 2, by - 26 * k, 20 * k, 'center');
      } else {
        texto3d(colorAhora ? 'Veo: ' + colorAhora : 'Apunta al centro', W / 2, H * 0.58, 22 * k, 'center');
        cx.fillStyle = o.hex; rr(W / 2 - 60 * k, H * 0.62, 120 * k, 26 * k, 13 * k); cx.fill(); texto(o.txt, W / 2, H * 0.62 + 14 * k, 14 * k, 'center');
      }
    }
  });
}

NIVELES.push({
  id: 'luz', icono: '🌈', titulo: 'Luz y color', sub: 'Usa la cámara', color: '#8a6cff', sensor: 'camara', jugar: jugarLuz,
  historia: 'El cuarto de luces de la estación está sin colores. Tu cámara será mi ojo: busca cosas rojas, verdes y azules, y haz una sombra con la mano. La imagen se queda en tu teléfono: no se guarda ni se envía.',
  pred: { q: 'Una manzana roja se ve roja porque…', ops: [
    { id: 'refleja', t: 'Devuelve sobre todo la luz roja y absorbe las demás', ok: true }, { id: 'fabrica', t: 'Ella misma fabrica luz roja' }, { id: 'absorbe', t: 'Absorbe la luz roja y devuelve las demás' }] }
});
