// Nivel 3: la voz y el globo. Tu tono (micrófono o barra) sube el globo por tres aros: ×1,25, ×1,5 y ×2 sobre tu nota base.
import { t, idiomaActual } from '../i18n.js?v=1';
import { h } from '../ui.js?v=1';
import { crearJuego, ajustarRango, PALETA, esLigero } from '../motor.js?v=1';
import { grad, rr, esfera, texto3d } from '../dibujo.js?v=1';
import { sfx, fijarSilencio, estaSilenciado, sonarAunSilenciado } from '../audio.js?v=1';
import { abrirMicrofono } from '../microfono.js?v=1';

const RAZONES = [1.25, 1.5, 2.0];
const BANDA = 0.04; // 4 % de la frecuencia
const RETENER = 0.8; // s manteniendo el tono
const razonTexto = (r) => r.toLocaleString(idiomaActual());

function dibujarCuarto(cx, W, H, k, estrellas, tiempo) {
  cx.fillStyle = grad(cx, 0, H, '#1c1f5e', '#3d2f7d');
  cx.fillRect(0, 0, W, H);
  for (const e of estrellas) {
    cx.globalAlpha = 0.4 + 0.6 * Math.abs(Math.sin(tiempo * 2 + e.ph));
    cx.fillStyle = '#fff';
    cx.beginPath(); cx.arc(e.x, e.y, e.s, 0, 7); cx.fill();
  }
  cx.globalAlpha = 1;
  // ventana con luna y ciudad
  const wx = W * 0.08, wy = H * 0.14, ww = W * 0.4, wh = H * 0.18;
  cx.fillStyle = '#ece8ff';
  rr(cx, wx - 7 * k, wy - 7 * k, ww + 14 * k, wh + 14 * k, 10 * k); cx.fill();
  cx.fillStyle = grad(cx, wy, wy + wh, '#0d1450', '#3a56c8');
  cx.fillRect(wx, wy, ww, wh);
  esfera(cx, wx + ww * 0.72, wy + wh * 0.3, 16 * k, '#fff6c9', '#e8c85a');
  cx.fillStyle = '#10163f';
  for (let i = 0; i < 6; i++) {
    const alto = (0.25 + ((i * 37) % 50) / 100) * wh * 0.6;
    cx.fillRect(wx + (i * ww) / 6, wy + wh - alto, ww / 6 - 3 * k, alto);
  }
  cx.fillStyle = PALETA.amarillo;
  for (let i = 0; i < 10; i++) cx.fillRect(wx + (((i * 31) % 90) / 100) * ww + 4 * k, wy + wh * (0.65 + ((i * 17) % 30) / 100), 3 * k, 3 * k);
  cx.fillStyle = '#ece8ff';
  cx.fillRect(wx + ww / 2 - 2 * k, wy, 4 * k, wh);
  // sofá
  const sy = H * 0.66;
  cx.fillStyle = grad(cx, sy, H, '#ff7a9c', '#b8335a');
  rr(cx, -10 * k, sy + 20 * k, W + 20 * k, H - sy, 26 * k); cx.fill();
  cx.fillStyle = grad(cx, sy - 8 * k, sy + 40 * k, '#ff93b0', '#cf4569');
  rr(cx, W * 0.05, sy - 10 * k, W * 0.9, 60 * k, 22 * k); cx.fill();
  cx.fillStyle = 'rgba(255,255,255,.18)';
  for (let i = 0; i < 3; i++) { rr(cx, W * (0.1 + i * 0.29), sy, W * 0.25, 40 * k, 16 * k); cx.fill(); }
  // lámpara de pie
  const lx = W * 0.9;
  cx.strokeStyle = '#d0c4a8'; cx.lineWidth = 5 * k;
  cx.beginPath(); cx.moveTo(lx, sy + 20 * k); cx.lineTo(lx, H * 0.32); cx.stroke();
  const brillo = cx.createRadialGradient(lx, H * 0.3, 4, lx, H * 0.3, 80 * k);
  brillo.addColorStop(0, 'rgba(255,225,140,.5)'); brillo.addColorStop(1, 'rgba(255,225,140,0)');
  cx.fillStyle = brillo; cx.beginPath(); cx.arc(lx, H * 0.3, 80 * k, 0, 7); cx.fill();
  cx.fillStyle = '#ffe9a8';
  cx.beginPath(); cx.moveTo(lx - 12 * k, H * 0.27); cx.lineTo(lx + 12 * k, H * 0.27); cx.lineTo(lx + 24 * k, H * 0.33); cx.lineTo(lx - 24 * k, H * 0.33); cx.closePath(); cx.fill();
}

function dibujarAro(cx, x, y, k, estado) {
  const rx = 14 * k, ry = 27 * k;
  const color = estado === 'hecho' ? PALETA.verde : estado === 'actual' ? PALETA.amarillo : '#d9a566';
  if (estado === 'actual') {
    cx.shadowColor = PALETA.amarillo; cx.shadowBlur = 18 * k;
  }
  cx.lineWidth = 11 * k; cx.strokeStyle = '#8a5a26';
  cx.beginPath(); cx.ellipse(x, y, rx, ry, 0, 0, 7); cx.stroke();
  cx.shadowBlur = 0;
  cx.lineWidth = 8 * k; cx.strokeStyle = color;
  cx.beginPath(); cx.ellipse(x, y, rx, ry, 0, 0, 7); cx.stroke();
  cx.lineWidth = 2; cx.strokeStyle = 'rgba(110,64,18,.5)';
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    cx.beginPath();
    cx.moveTo(x + Math.cos(a) * (rx - 4 * k), y + Math.sin(a) * (ry - 4 * k));
    cx.lineTo(x + Math.cos(a) * (rx + 4 * k), y + Math.sin(a) * (ry + 4 * k));
    cx.stroke();
  }
}

function dibujarGlobo(cx, x, y, k, t0) {
  cx.strokeStyle = 'rgba(255,255,255,.8)'; cx.lineWidth = 2;
  cx.beginPath(); cx.moveTo(x, y + 36 * k);
  cx.bezierCurveTo(x + 10 * k, y + 52 * k + Math.sin(t0 * 3) * 4, x - 10 * k, y + 66 * k, x + Math.sin(t0 * 2) * 6 * k, y + 84 * k);
  cx.stroke();
  cx.fillStyle = '#c2255c';
  cx.beginPath(); cx.moveTo(x - 6 * k, y + 42 * k); cx.lineTo(x + 6 * k, y + 42 * k); cx.lineTo(x, y + 32 * k); cx.fill();
  const g = cx.createRadialGradient(x - 8 * k, y - 12 * k, 3, x, y, 34 * k);
  g.addColorStop(0, '#ff9db6'); g.addColorStop(1, '#d62f63');
  cx.fillStyle = g;
  cx.beginPath(); cx.ellipse(x, y, 27 * k, 33 * k, 0, 0, 7); cx.fill();
  cx.fillStyle = 'rgba(255,255,255,.55)';
  cx.beginPath(); cx.ellipse(x - 10 * k, y - 14 * k, 6 * k, 10 * k, -0.5, 0, 7); cx.fill();
}

export default {
  id: 'voz',
  icono: '🎤',
  color: PALETA.rosa,
  titulo: 'voz.titulo',
  sub: 'voz.subtitulo',
  sensor: 'mic',
  historia: 'voz.historia',
  pred: { pregunta: 'voz.pred', opciones: [{ clave: 'voz.p1', ok: true }, { clave: 'voz.p2' }, { clave: 'voz.p3' }] },

  jugar({ pred, salir, terminar }) {
    const silencioPrevio = estaSilenciado();
    let mic = null;
    let plazo = null;
    function limpiar() {
      clearTimeout(plazo);
      mic?.cerrar();
      mic = null;
      fijarSilencio(silencioPrevio);
    }
    const salirSeguro = () => { limpiar(); salir(); };
    const juego = crearJuego({ titulo: t('voz.corto'), icono: '🎤', pedidos: RAZONES.map((_, i) => t('voz.aro', { n: i + 1 })), tema: 'tema-voz', alSalir: salirSeguro });

    let fase = 'abriendo'; // abriendo | calibrar | aros | fin
    let usaMic = false;
    let base = null;
    let ref = null;
    let retener = 0;
    let g = 0;
    let total = 0;
    let yv = null;
    let xg = juego.W * 0.3;
    let reloj = 0;
    let tAnillo = 0;
    let ultimaFr = null;
    const aciertos = [];
    const anillos = [];
    const estrellas = Array.from({ length: esLigero() ? 18 : 40 }, () => ({ x: Math.random() * juego.W, y: Math.random() * juego.H * 0.6, s: 0.8 + Math.random() * 1.6, ph: Math.random() * 6 }));

    const rango = h('input', { type: 'range', min: 100, max: 500, step: 1, value: 200, id: 'tono', 'aria-label': t('voz.tono', { n: '' }) });
    const [pre, post] = t('voz.tono', { n: '|' }).split('|');
    const valor = h('b', {}, '200');
    const manual = h('div', { class: 'caja-ctl', hidden: true }, h('label', { for: 'tono' }, pre, valor, post), rango);
    const sinMic = h('button', { type: 'button', class: 'btn-sec', onclick: usarBarra }, `🎚 ${t('voz.sinMic')}`);
    juego.controles.append(manual, sinMic);
    ajustarRango(rango);
    rango.addEventListener('input', () => { valor.textContent = rango.value; ajustarRango(rango); });

    const meta = (i) => base * RAZONES[i];
    const posX = (i) => juego.W * (0.3 + i * 0.22);
    const Y = (fr) => {
      const o = Math.max(-0.6, Math.min(1.4, Math.log2(fr / (base || 200))));
      return juego.H * 0.66 - ((o + 0.6) / 2) * juego.H * 0.5;
    };

    function empezar(ok) {
      clearTimeout(plazo);
      if (fase !== 'abriendo') return;
      usaMic = ok;
      fase = 'calibrar';
      if (ok) fijarSilencio(true); // el micrófono oiría los sonidos del juego
      else { manual.hidden = false; sinMic.hidden = true; }
      juego.decir(t(ok ? 'voz.calibrar' : 'voz.calibrarSin'), 'pensando');
    }
    function usarBarra() {
      sinMic.hidden = true;
      mic?.cerrar();
      mic = null;
      fijarSilencio(silencioPrevio);
      if (fase === 'abriendo') { empezar(false); return; }
      usaMic = false;
      manual.hidden = false;
      juego.decir(t('voz.barraOk'));
    }

    plazo = setTimeout(() => empezar(false), 10000);
    abrirMicrofono().then((m) => {
      if (fase !== 'abriendo' || !juego.raiz.isConnected) { m.cerrar(); return; }
      mic = m;
      empezar(true);
    }).catch(() => {
      if (fase === 'abriendo') { juego.decir(t('voz.sinMicAviso'), 'pensando'); empezar(false); }
    });

    const frecuencia = () => {
      if (fase === 'abriendo') return null;
      return usaMic ? mic?.leer() ?? null : Number(rango.value);
    };

    function pasarAro(fr) {
      const objetivo = meta(g);
      const error = Math.abs(fr - objetivo) / objetivo;
      juego.acierto(error, BANDA, posX(g), Y(objetivo));
      if (usaMic) sonarAunSilenciado(sfx.acierto);
      aciertos.push({ razon: RAZONES[g], meta: Math.round(objetivo), f: Math.round(fr) });
      g += 1;
      retener = 0;
      juego.pedido(g);
      if (g >= RAZONES.length) {
        fase = 'fin';
        juego.decir(t('voz.aroOk', { n: RAZONES.length }), 'asombro');
        setTimeout(finalizar, 1900);
      } else {
        juego.decir(`${t('voz.aroOk', { n: g })} ${t('voz.meta', { n: g + 1, meta: Math.round(meta(g)), r: razonTexto(RAZONES[g]) })}`, 'asombro');
      }
    }

    function finalizar() {
      limpiar();
      juego.confeti(120);
      const estrellasGanadas = 1 + (pred.ok ? 1 : 0) + (total <= 90 ? 1 : 0);
      const ultimo = aciertos[aciertos.length - 1];
      const filas = aciertos.map((a, i) => h('tr', {}, h('td', {}, i + 1), h('td', {}, `×${razonTexto(a.razon)}`), h('td', {}, `${a.meta} Hz`), h('td', {}, `${a.f} Hz`)));
      terminar({
        estrellas: estrellasGanadas,
        puntos: juego.puntos,
        motivos: [t('voz.m1'), t(pred.ok ? 'res.predOk' : 'res.predNo'), t(total <= 90 ? 'voz.tOk' : 'voz.tNo')],
        pregunta: t('voz.analisis', { base: Math.round(base), f: ultimo.f }),
        tabla: h('table', { class: 'tabla' }, h('tr', {}, ['tabla.aro', 'tabla.razon', 'tabla.meta', 'tabla.tono'].map((c) => h('th', {}, t(c)))), filas),
        revela: t('voz.revela'),
      });
    }

    function actualizar(dt) {
      reloj += dt;
      if (fase === 'abriendo') return;
      total += dt;
      const fr = fase === 'fin' ? ultimaFr : frecuencia();
      ultimaFr = fr ?? ultimaFr;
      const destinoY = fr !== null && fase !== 'fin' ? Y(fr) : juego.H * 0.68;
      yv = yv === null ? destinoY : yv + (destinoY - yv) * Math.min(1, dt * 8);
      const destinoX = fase === 'calibrar' ? juego.W * 0.3 : posX(Math.min(g, RAZONES.length - 1));
      xg += (destinoX - xg) * Math.min(1, dt * 3);
      tAnillo += dt;
      if (fr !== null && tAnillo > 0.22 && !esLigero() && fase !== 'fin') { tAnillo = 0; anillos.push({ r: 22, t: 0 }); }
      for (let i = anillos.length - 1; i >= 0; i--) { anillos[i].t += dt; anillos[i].r += 80 * dt; if (anillos[i].t > 0.8) anillos.splice(i, 1); }

      if (fase === 'calibrar') {
        if (fr !== null && ref !== null && Math.abs(fr - ref) / ref <= BANDA) retener += dt;
        else { ref = fr; retener = 0; }
        if (retener >= RETENER) {
          base = ref; fase = 'aros'; g = 0; retener = 0;
          juego.pedido(0);
          juego.decir(`${t('voz.base', { n: Math.round(base) })} ${t('voz.meta', { n: 1, meta: Math.round(meta(0)), r: razonTexto(RAZONES[0]) })}`, 'asombro');
          sfx.toque();
        }
      } else if (fase === 'aros') {
        const objetivo = meta(g);
        if (fr !== null && Math.abs(fr - objetivo) / objetivo <= BANDA) retener += dt; else retener = 0;
        if (retener >= RETENER) pasarAro(fr);
      }
    }

    function dibujar(cx, W, H, k) {
      dibujarCuarto(cx, W, H, k, estrellas, reloj);
      const fr = fase === 'fin' ? null : frecuencia();
      if (fase === 'abriendo' || fase === 'calibrar') {
        texto3d(cx, t('voz.cartel'), W / 2, H * 0.37, 21 * k);
        cx.font = `${86 * k}px serif`; cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.fillStyle = '#fff';
        cx.fillText('🎤', W / 2, H * 0.48);
        texto3d(cx, fr ? t('voz.escucho', { n: Math.round(fr) }) : t('voz.noEscucho'), W / 2, H * 0.59, 30 * k);
      }
      if (base) {
        RAZONES.forEach((_, i) => {
          const y = Y(meta(i));
          dibujarAro(cx, posX(i), y, k, i < g ? 'hecho' : i === g ? 'actual' : 'pendiente');
          if (i === g && fase === 'aros') texto3d(cx, `${Math.round(meta(i))} Hz`, posX(i), y - 38 * k, 15 * k);
        });
      }
      if (yv !== null) {
        for (const a of anillos) {
          cx.globalAlpha = Math.max(0, 1 - a.t / 0.8);
          cx.strokeStyle = '#fff'; cx.lineWidth = 3;
          cx.beginPath(); cx.arc(xg, yv, a.r * k, 0, 7); cx.stroke();
        }
        cx.globalAlpha = 1;
        dibujarGlobo(cx, xg, yv, k, reloj);
        if (fr !== null && fase !== 'calibrar') texto3d(cx, `${Math.round(fr)} Hz`, xg + 42 * k, yv, 14 * k, 'left');
      }
      // barra de retención
      const bx = W * 0.2, bw = W * 0.6, by = H * 0.655;
      cx.fillStyle = 'rgba(255,255,255,.28)'; rr(cx, bx, by - 8 * k, bw, 16 * k, 8 * k); cx.fill();
      if (retener > 0) { cx.fillStyle = PALETA.verde; rr(cx, bx, by - 8 * k, Math.max(16 * k, bw * Math.min(1, retener / RETENER)), 16 * k, 8 * k); cx.fill(); }
    }

    juego.decir(t('voz.abriendo'));
    juego.iniciar({ actualizar, dibujar });
    return juego.raiz;
  },
};
