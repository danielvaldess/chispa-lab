// Nivel 2: el péndulo del estante. Tres luces: igualar el ritmo de la lámpara cambiando el largo del hilo.
import { t } from '../i18n.js?v=1';
import { h } from '../ui.js?v=1';
import { crearJuego, ajustarRango, PALETA } from '../motor.js?v=1';
import { grad, rr, esfera, sombra, texto3d } from '../dibujo.js?v=1';
import { sfx } from '../audio.js?v=1';
import { periodoPendulo } from '../physics.js?v=1';

const OBJETIVOS = [1.4, 2.0, 2.6]; // segundos por ida y vuelta
const TOLERANCIA = 0.05; // 5 %
const AMPLITUD = 0.35; // rad
const OBJETOS = [
  { id: 'moneda', emoji: '🪙', masa: 5 },
  { id: 'llaves', emoji: '🔑', masa: 50 },
  { id: 'manzana', emoji: '🍎', masa: 200 },
  { id: 'lata', emoji: '🥫', masa: 400 },
];

function dibujarEscena(cx, W, H, k) {
  cx.fillStyle = grad(cx, 0, H, '#ffe6c8', '#ffd2a3');
  cx.fillRect(0, 0, W, H);
  cx.fillStyle = 'rgba(255,255,255,.4)';
  for (let y = 20 * k, f = 0; y < H; y += 56 * k, f++) {
    for (let x = (f % 2 ? 28 : 0) * k; x < W; x += 56 * k) { cx.beginPath(); cx.arc(x, y, 9 * k, 0, 7); cx.fill(); }
  }
  // ventana nocturna
  const wx = W * 0.5, wy = H * 0.33, ww = W * 0.3, wh = H * 0.27;
  cx.fillStyle = '#fff';
  rr(cx, wx - 6 * k, wy - 6 * k, ww + 12 * k, wh + 12 * k, 10 * k); cx.fill();
  cx.fillStyle = grad(cx, wy, wy + wh, '#1f2a7a', '#5b6fe0');
  cx.fillRect(wx, wy, ww, wh);
  esfera(cx, wx + ww * 0.82, wy + wh * 0.25, 13 * k, '#fff6c9', '#e8c85a');
  cx.fillStyle = '#fff';
  for (const [dx, dy] of [[0.15, 0.2], [0.4, 0.6], [0.7, 0.45], [0.25, 0.8], [0.6, 0.15]]) cx.fillRect(wx + ww * dx, wy + wh * dy, 3 * k, 3 * k);
  cx.fillRect(wx + ww / 2 - 2 * k, wy, 4 * k, wh);
  // estante, planta y libros
  const ey = H * 0.22;
  cx.fillStyle = '#7a4a1c';
  cx.beginPath(); cx.moveTo(W * 0.1, ey + 12 * k); cx.lineTo(W * 0.1 + 46 * k, ey + 12 * k); cx.lineTo(W * 0.1, ey + 70 * k); cx.fill();
  cx.beginPath(); cx.moveTo(W * 0.68, ey + 12 * k); cx.lineTo(W * 0.68 - 46 * k, ey + 12 * k); cx.lineTo(W * 0.68, ey + 70 * k); cx.fill();
  cx.fillStyle = '#c98b46';
  rr(cx, W * 0.04, ey - 4 * k, W * 0.68, 18 * k, 6 * k); cx.fill();
  cx.strokeStyle = '#7a4a1c'; cx.lineWidth = 2; cx.stroke();
  cx.fillStyle = '#c4622d';
  cx.beginPath(); cx.moveTo(W * 0.09, ey - 4 * k); cx.lineTo(W * 0.17, ey - 4 * k); cx.lineTo(W * 0.155, ey - 38 * k); cx.lineTo(W * 0.105, ey - 38 * k); cx.fill();
  cx.fillStyle = '#2fd18b';
  for (const [dx, dy, a] of [[-0.03, -75, -0.6], [0, -86, 0], [0.03, -75, 0.6]]) {
    cx.save(); cx.translate(W * 0.13 + dx * W, ey - 38 * k); cx.rotate(a);
    cx.beginPath(); cx.ellipse(0, dy * k * 0.5, 9 * k, 28 * k, 0, 0, 7); cx.fill(); cx.restore();
  }
  cx.fillStyle = '#e63946'; rr(cx, W * 0.37, ey - 30 * k, 56 * k, 14 * k, 3 * k); cx.fill();
  cx.fillStyle = '#3b82f6'; rr(cx, W * 0.38, ey - 46 * k, 56 * k, 14 * k, 3 * k); cx.fill();
}

function dibujarLampara(cx, W, H, k, angulo) {
  const bx = W * 0.84, by = H * 0.52;
  cx.fillStyle = '#8a5a26'; rr(cx, bx - 62 * k, by, 124 * k, 12 * k, 4 * k); cx.fill();
  cx.fillStyle = '#6b4219'; cx.fillRect(bx - 54 * k, by + 12 * k, 8 * k, 70 * k); cx.fillRect(bx + 46 * k, by + 12 * k, 8 * k, 70 * k);
  cx.fillStyle = '#2d3a4e'; cx.beginPath(); cx.ellipse(bx + 8 * k, by - 2 * k, 26 * k, 7 * k, 0, 0, 7); cx.fill();
  cx.strokeStyle = '#3d4d63'; cx.lineWidth = 6 * k; cx.lineCap = 'round';
  cx.beginPath(); cx.moveTo(bx + 8 * k, by - 4 * k); cx.lineTo(bx + 14 * k, by - 80 * k); cx.lineTo(bx - 26 * k, by - 108 * k); cx.stroke();
  cx.fillStyle = '#ff6b4a';
  cx.beginPath(); cx.moveTo(bx - 46 * k, by - 100 * k); cx.lineTo(bx - 4 * k, by - 100 * k); cx.lineTo(bx - 14 * k, by - 134 * k); cx.lineTo(bx - 36 * k, by - 134 * k); cx.closePath(); cx.fill();
  // bolita de acero que marca el ritmo
  const px = bx - 25 * k, py = by - 100 * k, L = 46 * k;
  const x = px + Math.sin(angulo) * L, y = py + Math.cos(angulo) * L;
  cx.strokeStyle = '#4a5568'; cx.lineWidth = 2; cx.beginPath(); cx.moveTo(px, py); cx.lineTo(x, y); cx.stroke();
  esfera(cx, x, y, 9 * k, '#f1f5f9', '#64748b');
}

function dibujarObjeto(cx, id, x, y, r, giro) {
  cx.save(); cx.translate(x, y); cx.rotate(giro);
  if (id === 'moneda') {
    esfera(cx, 0, 0, r, '#fff1a8', '#d9a400');
    cx.strokeStyle = '#b07f00'; cx.lineWidth = r * 0.12; cx.beginPath(); cx.arc(0, 0, r * 0.68, 0, 7); cx.stroke();
    cx.fillStyle = '#b07f00'; cx.fillRect(-r * 0.12, -r * 0.4, r * 0.24, r * 0.8);
  } else if (id === 'llaves') {
    cx.strokeStyle = '#9aa4b2'; cx.lineWidth = r * 0.16; cx.beginPath(); cx.arc(0, -r * 0.2, r * 0.45, 0, 7); cx.stroke();
    for (const [dx, a] of [[-0.35, 0.25], [0.35, -0.25]]) {
      cx.save(); cx.translate(dx * r, r * 0.1); cx.rotate(a);
      cx.fillStyle = '#e0b43a'; cx.fillRect(-r * 0.12, 0, r * 0.24, r * 0.95);
      cx.fillRect(-r * 0.12, r * 0.6, r * 0.34, r * 0.14); cx.fillRect(-r * 0.12, r * 0.8, r * 0.28, r * 0.12);
      cx.restore();
    }
  } else if (id === 'manzana') {
    esfera(cx, 0, 0, r, '#ff6a6a', '#b3121d');
    cx.strokeStyle = '#6b4219'; cx.lineWidth = r * 0.12; cx.beginPath(); cx.moveTo(0, -r * 0.8); cx.lineTo(r * 0.1, -r * 1.15); cx.stroke();
    cx.fillStyle = '#2fd18b'; cx.beginPath(); cx.ellipse(r * 0.45, -r * 1.0, r * 0.4, r * 0.18, -0.4, 0, 7); cx.fill();
  } else {
    cx.fillStyle = grad(cx, -r, r, '#f4f6f8', '#aeb6c2'); rr(cx, -r * 0.7, -r * 0.9, r * 1.4, r * 1.8, r * 0.15); cx.fill();
    cx.fillStyle = '#e5533d'; cx.fillRect(-r * 0.7, -r * 0.35, r * 1.4, r * 0.7);
    cx.fillStyle = '#fff'; cx.beginPath(); cx.arc(0, 0, r * 0.22, 0, 7); cx.fill();
    cx.fillStyle = '#c9d0da'; cx.beginPath(); cx.ellipse(0, -r * 0.9, r * 0.7, r * 0.16, 0, 0, 7); cx.fill();
  }
  cx.restore();
}

export default {
  id: 'pendulo',
  icono: '⏱',
  color: PALETA.azul,
  titulo: 'pend.titulo',
  sub: 'pend.subtitulo',
  sensor: 'tactil',
  historia: 'pend.historia',
  pred: { pregunta: 'pend.pred', opciones: [{ clave: 'pend.p1' }, { clave: 'pend.p2' }, { clave: 'pend.p3', ok: true }] },

  jugar({ pred, salir, terminar }) {
    const juego = crearJuego({ titulo: t('pend.corto'), icono: '⏱', pedidos: OBJETIVOS.map((o) => `${o} s`), tema: 'tema-pendulo', alSalir: salir });
    let etapa = 0;
    let objeto = OBJETOS[0];
    let largoCm = 80;
    let fase = 'ajustar'; // ajustar | midiendo | espera
    let faseLampara = 0;
    let fasePendulo = 0;
    let tiempo = 0;
    let intentos = 0;
    let periodoLanzado = 0;
    const hechos = [];

    const objetivo = () => OBJETIVOS[Math.min(etapa, OBJETIVOS.length - 1)];
    const periodo = () => periodoPendulo(largoCm / 100);

    const rango = h('input', { type: 'range', min: 20, max: 200, step: 1, value: largoCm, id: 'hilo', 'aria-label': t('pend.hilo', { n: '' }).replace(/[:\s]+$/, '') });
    const valor = h('b', {}, String(largoCm));
    const [pre, post] = t('pend.hilo', { n: '|' }).split('|');
    const botones = OBJETOS.map((o) => h('button', { type: 'button', class: 'obj', 'aria-pressed': String(o.id === objeto.id), onclick: () => elegir(o) },
      h('span', { 'aria-hidden': 'true' }, o.emoji), `${o.masa} g`));
    const soltar = h('button', { type: 'button', class: 'soltar', onclick: lanzar }, h('span', {}, '▶'), t('juego.soltar'));
    juego.controles.append(
      h('div', { class: 'caja-ctl' }, h('label', { for: 'hilo' }, pre, valor, post), rango),
      h('div', { class: 'fila-mando' }, h('div', { class: 'objetos-juego' }, botones), soltar));
    ajustarRango(rango);
    rango.addEventListener('input', () => { largoCm = Number(rango.value); valor.textContent = String(largoCm); ajustarRango(rango); });

    function elegir(o) {
      if (fase !== 'ajustar') return;
      objeto = o;
      botones.forEach((b, i) => b.setAttribute('aria-pressed', String(OBJETOS[i].id === o.id)));
      sfx.toque();
    }
    function mostrarPedido() {
      juego.pedido(etapa);
      juego.info(t('pend.info', { n: etapa + 1, obj: objetivo(), tol: TOLERANCIA * 100 }));
    }
    function reiniciar() {
      fase = 'ajustar'; tiempo = 0; soltar.disabled = false; rango.disabled = false;
      mostrarPedido();
    }

    function lanzar() {
      if (fase !== 'ajustar') return;
      intentos += 1;
      periodoLanzado = periodo();
      fase = 'midiendo'; tiempo = 0; faseLampara = 0; fasePendulo = 0;
      soltar.disabled = true; rango.disabled = true;
      juego.chispas(juego.W * 0.4, juego.H * 0.3, 10);
    }

    function evaluar() {
      fase = 'espera';
      const error = Math.abs(periodoLanzado - objetivo()) / objetivo();
      if (error <= TOLERANCIA) {
        juego.acierto(error, TOLERANCIA, juego.W * 0.4, juego.H * 0.4);
        hechos.push({ objeto, largo: largoCm, periodo: periodoLanzado });
        juego.decir(t('pend.sincro', { t: periodoLanzado.toFixed(2) }), 'asombro');
        etapa += 1;
        setTimeout(() => { if (etapa >= OBJETIVOS.length) finalizar(); else { juego.decir(t('pend.tutor')); reiniciar(); } }, 1900);
      } else {
        juego.fallo();
        juego.decir(t(periodoLanzado < objetivo() ? 'pend.rapido' : 'pend.lento', { t: periodoLanzado.toFixed(2) }), 'triste');
        setTimeout(reiniciar, 1700);
      }
    }

    function finalizar() {
      juego.confeti(120);
      const estrellas = 1 + (pred.ok ? 1 : 0) + (intentos <= 5 ? 1 : 0);
      const filas = hechos.map((f, i) => h('tr', {}, h('td', {}, i + 1), h('td', {}, `${f.objeto.emoji} ${f.objeto.masa} g`), h('td', {}, `${f.largo} cm`), h('td', {}, `${f.periodo.toFixed(2)} s`)));
      terminar({
        estrellas,
        puntos: juego.puntos,
        motivos: [t('pend.m1'), t(pred.ok ? 'res.predOk' : 'res.predNo'), t(intentos <= 5 ? 'res.intentosOk' : 'res.intentosNo')],
        pregunta: t('pend.analisis'),
        tabla: h('table', { class: 'tabla' }, h('tr', {}, ['tabla.luz', 'tabla.objeto', 'tabla.largo', 'tabla.periodo'].map((c) => h('th', {}, t(c)))), filas),
        revela: t('pend.revela'),
      });
    }

    function actualizar(dt) {
      const antesL = Math.floor(faseLampara / Math.PI);
      faseLampara += (2 * Math.PI * dt) / objetivo();
      if (Math.floor(faseLampara / Math.PI) !== antesL && fase !== 'espera') sfx.tic();
      if (fase === 'midiendo') {
        tiempo += dt;
        const antesP = Math.floor(fasePendulo / Math.PI);
        fasePendulo += (2 * Math.PI * dt) / periodoLanzado;
        if (Math.floor(fasePendulo / Math.PI) !== antesP) sfx.tac();
        if (tiempo >= objetivo() * 2) evaluar();
      }
    }

    function dibujar(cx, W, H, k) {
      dibujarEscena(cx, W, H, k);
      dibujarLampara(cx, W, H, k, AMPLITUD * Math.cos(faseLampara));
      const px = W * 0.4, py = H * 0.222;
      const largoPx = (largoCm / 100) * H * 0.2;
      const ang = fase === 'ajustar' ? AMPLITUD : AMPLITUD * Math.cos(fasePendulo);
      const x = px + Math.sin(ang) * largoPx;
      const y = py + Math.cos(ang) * largoPx;
      cx.strokeStyle = '#6b4a2a'; cx.lineWidth = 2.5 * k;
      cx.beginPath(); cx.moveTo(px, py); cx.lineTo(x, y); cx.stroke();
      esfera(cx, px, py, 7 * k, '#e2e8f0', '#64748b');
      sombra(cx, x, y + 28 * k, 20 * k, 5 * k, 0.12);
      dibujarObjeto(cx, objeto.id, x, y + 4 * k, 24 * k, ang);
      texto3d(cx, t('pend.tic', { n: objetivo() }), W * 0.97, H * 0.55, 17 * k, 'right');
    }

    juego.decir(t('pend.tutor'));
    mostrarPedido();
    juego.iniciar({ actualizar, dibujar });
    return juego.raiz;
  },
};
