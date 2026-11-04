// Nivel 1: la rampa de cartón. Tres pedidos: que la canica llegue al vaso en un tiempo exacto.
import { t } from '../i18n.js?v=1';
import { h } from '../ui.js?v=1';
import { crearJuego, ajustarRango, PALETA } from '../motor.js?v=1';
import { grad, rr, esfera, sombra, texto, texto3d, radianes } from '../dibujo.js?v=1';
import { sfx } from '../audio.js?v=1';
import { inclinacion } from '../sensor.js?v=1';
import { tiempoCanica } from '../physics.js?v=1';

const LARGO_M = 3; // metros de rampa
const OBJETIVOS = [3.0, 2.0, 1.4];
const TOLERANCIA = 0.3;
const ESFERA = 13; // radio de la canica (px a escala 1)
const COLORES_LIBROS = ['#e4572e', '#29a0b1', '#f2b134', '#7a5af8'];

/** Sala: pared a rayas, ventana con cortinas, piso de madera. */
function dibujarSala(cx, W, H, k) {
  const piso = H * 0.486;
  cx.fillStyle = grad(cx, 0, piso, '#cfe9f5', '#b5d6e6');
  cx.fillRect(0, 0, W, piso);
  cx.fillStyle = 'rgba(255,255,255,.28)';
  for (let x = 0; x < W; x += 34 * k) cx.fillRect(x, 0, 17 * k, piso);
  // ventana con cortinas: ocupa del 3 % al 45 % del ancho
  const x0 = W * 0.03, x1 = W * 0.45, cw = W * 0.085;
  const wx = x0 + cw, ww = x1 - x0 - 2 * cw, wy = H * 0.133, wh = H * 0.255;
  cx.fillStyle = '#fff';
  cx.fillRect(wx, wy, ww, wh);
  cx.fillStyle = grad(cx, wy, wy + wh, '#69c6ff', '#d9f1ff');
  cx.fillRect(wx + 5 * k, wy + 5 * k, ww - 10 * k, wh - 10 * k);
  esfera(cx, wx + ww * 0.9, wy + wh * 0.26, 16 * k, '#fff2a8', '#ffc83a');
  cx.fillStyle = 'rgba(255,255,255,.92)';
  for (const [dx, dy, r] of [[0.22, 0.34, 15], [0.42, 0.38, 19], [0.12, 0.4, 11]]) {
    cx.beginPath(); cx.arc(wx + ww * dx, wy + wh * dy, r * k, 0, 7); cx.fill();
  }
  cx.fillStyle = '#fff';
  cx.fillRect(wx + ww / 2 - 3 * k, wy, 6 * k, wh);
  cx.fillRect(wx, wy + wh * 0.52, ww, 6 * k);
  for (const x of [x0, x1 - cw]) {
    cx.fillStyle = grad(cx, wy, wy + wh, '#ff7aa5', '#ff5c8a');
    cx.fillRect(x, wy, cw, wh);
    cx.fillStyle = 'rgba(255,255,255,.22)';
    for (let i = 1; i < 3; i++) cx.fillRect(x + (cw / 3) * i - 1.5 * k, wy, 3 * k, wh);
  }
  cx.fillStyle = '#e6d3a8';
  cx.fillRect(0, piso - 6 * k, W, 14 * k);
  cx.fillStyle = grad(cx, piso, H, '#d89a5a', '#b36f33');
  cx.fillRect(0, piso + 8 * k, W, H - piso);
  cx.strokeStyle = 'rgba(90,50,15,.28)';
  cx.lineWidth = 2;
  for (let i = 0; i < 9; i++) {
    const y = piso + 8 * k + ((H - piso) / 9) * i * 1.05;
    cx.beginPath(); cx.moveTo(0, y); cx.lineTo(W, y); cx.stroke();
  }
}

/** Vaso de lápices azul con lápices de colores, al fondo a la derecha. */
function dibujarLapicero(cx, x, yBase, k) {
  const w = 51 * k, alto = 40 * k;
  [['#ffd23f', -14, -0.3], ['#ff5c8a', -4, -0.1], ['#3b82f6', 6, 0.1], ['#2fd18b', 16, 0.3]].forEach(([c, dx, a]) => {
    cx.save(); cx.translate(x + dx * k, yBase - alto); cx.rotate(a);
    cx.fillStyle = c; rr(cx, -3 * k, -34 * k, 6 * k, 38 * k, 3 * k); cx.fill(); cx.restore();
  });
  cx.fillStyle = '#3b82f6';
  rr(cx, x - w / 2, yBase - alto, w, alto, 8 * k); cx.fill();
  cx.fillStyle = 'rgba(255,255,255,.4)';
  rr(cx, x - w / 2 + 6 * k, yBase - alto + 6 * k, 8 * k, alto - 12 * k, 4 * k); cx.fill();
}

function dibujarVaso(cx, x, y, k, golpe) {
  const w = 74 * k, alto = 50 * k;
  cx.save();
  cx.translate(x, y + Math.sin(golpe * 30) * golpe * 3);
  sombra(cx, w * 0.4, alto * 0.62, w * 0.62, 8 * k);
  cx.fillStyle = '#e63946';
  rr(cx, -w, -alto / 2, w, alto, 6 * k); cx.fill();
  cx.fillStyle = 'rgba(255,255,255,.85)';
  cx.fillRect(-w * 0.78, -alto / 2, 9 * k, alto);
  cx.fillRect(-w * 0.48, -alto / 2, 9 * k, alto);
  cx.fillStyle = '#7a1620';
  cx.beginPath(); cx.ellipse(0, 0, 11 * k, alto / 2, 0, 0, 7); cx.fill();
  cx.strokeStyle = '#ff8c94'; cx.lineWidth = 4 * k;
  cx.beginPath(); cx.ellipse(0, 0, 11 * k, alto / 2, 0, 0, 7); cx.stroke();
  cx.restore();
}

function dibujarLibros(cx, x, yAlto, yPiso, k) {
  const alto = Math.max(8 * k, yPiso - yAlto);
  const n = COLORES_LIBROS.length;
  COLORES_LIBROS.forEach((color, i) => {
    const y = yAlto + (alto / n) * i;
    cx.fillStyle = color;
    rr(cx, x - 36 * k, y, 72 * k, alto / n - 1.5 * k, 5 * k); cx.fill();
    cx.fillStyle = 'rgba(255,255,255,.55)';
    cx.fillRect(x - 30 * k, y + (alto / n) * 0.4, 44 * k, 3 * k);
  });
}

function dibujarTablon(cx, g, k) {
  cx.save();
  cx.translate(g.bx, g.by);
  cx.rotate(-g.th);
  const largo = g.len;
  sombra(cx, largo / 2, 14 * k, largo / 2, 7 * k, 0.22);
  cx.fillStyle = '#d9a066';
  rr(cx, 0, -9 * k, largo, 10 * k, 3 * k); cx.fill();
  cx.strokeStyle = '#a8723a'; cx.lineWidth = 2; cx.stroke();
  cx.strokeStyle = 'rgba(120,70,25,.55)'; cx.lineWidth = 1.5;
  for (let x = 8 * k; x < largo - 4 * k; x += 9 * k) {
    cx.beginPath(); cx.moveTo(x, -8 * k); cx.lineTo(x + 4 * k, -1 * k); cx.stroke();
  }
  cx.fillStyle = 'rgba(246,226,122,.85)';
  cx.fillRect(largo * 0.4, -11 * k, 24 * k, 14 * k);
  cx.fillStyle = '#c0392b';
  cx.font = `800 ${9 * k}px system-ui, sans-serif`;
  cx.textAlign = 'left'; cx.textBaseline = 'middle';
  cx.fillText('FRÁGIL ✓', largo * 0.62, -4 * k);
  cx.restore();
}

function dibujarCanica(cx, x, y, r, giro) {
  cx.save();
  cx.translate(x, y);
  cx.rotate(giro);
  esfera(cx, 0, 0, r, '#8fd0ff', '#1f6fd1');
  cx.strokeStyle = 'rgba(255,255,255,.75)'; cx.lineWidth = r * 0.22;
  cx.beginPath(); cx.arc(0, 0, r * 0.55, 0.3, 2.3); cx.stroke();
  cx.strokeStyle = '#ffd23f';
  cx.beginPath(); cx.arc(0, 0, r * 0.55, 3.4, 5.4); cx.stroke();
  cx.restore();
}

function dibujarCronometro(cx, x, y, R, tiempo, objetivo, activo) {
  const DIAL = 4; // segundos que da una vuelta
  const ang = (s) => -Math.PI / 2 + (s / DIAL) * Math.PI * 2;
  cx.fillStyle = '#e04a3a';
  rr(cx, x - R * 0.12, y - R * 1.28, R * 0.24, R * 0.2, 3); cx.fill();
  cx.fillStyle = grad(cx, y - R, y + R, '#f3f5f8', '#aab2c2');
  cx.beginPath(); cx.arc(x, y, R * 1.08, 0, 7); cx.fill();
  cx.fillStyle = '#fff';
  cx.beginPath(); cx.arc(x, y, R * 0.92, 0, 7); cx.fill();
  cx.strokeStyle = activo ? PALETA.verde : '#2fd18b'; cx.lineWidth = R * 0.16; cx.lineCap = 'butt';
  cx.beginPath(); cx.arc(x, y, R * 0.74, ang(objetivo - TOLERANCIA), ang(objetivo + TOLERANCIA)); cx.stroke();
  cx.strokeStyle = PALETA.tinta; cx.lineWidth = 2;
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    cx.beginPath();
    cx.moveTo(x + Math.cos(a) * R * 0.82, y + Math.sin(a) * R * 0.82);
    cx.lineTo(x + Math.cos(a) * R * 0.9, y + Math.sin(a) * R * 0.9);
    cx.stroke();
  }
  const a = ang(Math.min(tiempo, DIAL));
  cx.strokeStyle = PALETA.tinta; cx.lineWidth = R * 0.07; cx.lineCap = 'round';
  cx.beginPath(); cx.moveTo(x, y); cx.lineTo(x + Math.cos(a) * R * 0.7, y + Math.sin(a) * R * 0.7); cx.stroke();
  cx.fillStyle = PALETA.tinta;
  cx.beginPath(); cx.arc(x, y, R * 0.08, 0, 7); cx.fill();
}
export default {
  id: 'rampa',
  icono: '🎢',
  color: PALETA.naranja,
  titulo: 'rampa.titulo',
  sub: 'rampa.subtitulo',
  sensor: 'mov',
  historia: 'rampa.historia',
  pred: { pregunta: 'rampa.pred', opciones: [{ clave: 'rampa.p1' }, { clave: 'rampa.p2', ok: true }, { clave: 'rampa.p3' }] },

  /** Construye la escena. `terminar(resultado)` entrega el resumen a la pantalla de resultado. */
  jugar({ pred, salir, terminar }) {
    const juego = crearJuego({ titulo: t('rampa.corto'), icono: '🎢', pedidos: OBJETIVOS.map((o) => `${o} s`), tema: 'tema-rampa', alSalir: salir });
    let etapa = 0;
    let fase = 'apuntar'; // apuntar | rodando | vaso | espera
    let intentos = 0;
    let tiempoMarcha = 0;
    let duracion = 0;
    let anguloLanzado = 0;
    let giro = 0;
    let golpe = 0;
    let enVasoT = 0;
    let usaSensor = false;
    let avisoSensor = false;
    const hechos = [];

    const rango = h('input', { type: 'range', min: 0, max: 30, step: 0.5, value: 10, id: 'angulo', 'aria-label': t('rampa.incl', { n: '' }).trim() });
    const valor = h('b', {}, '10');
    const [pre, post] = t('rampa.incl', { n: '|' }).split('|');
    const manual = h('div', { class: 'caja-ctl' }, h('label', { for: 'angulo' }, pre, valor, post), rango);
    const pistaIncl = h('div', { class: 'caja-ctl', hidden: true }, t('rampa.pistaIncl'));
    const modo = h('button', { type: 'button', class: 'btn-sec', hidden: true, 'aria-label': t('rampa.modo'), onclick: cambiarModo }, '🎚');
    const soltar = h('button', { type: 'button', class: 'soltar', onclick: lanzar }, h('span', {}, '▶'), t('juego.soltar'));
    juego.controles.append(h('div', { class: 'fila-mando' }, manual, pistaIncl, modo, soltar));
    ajustarRango(rango);
    rango.addEventListener('input', () => { valor.textContent = rango.value; ajustarRango(rango); sfx.toque(); });

    const objetivo = () => OBJETIVOS[Math.min(etapa, OBJETIVOS.length - 1)];
    const angulo = () => (usaSensor ? Math.min(30, inclinacion.grados) : Number(rango.value));
    function mostrarPedido() {
      juego.pedido(etapa);
      juego.info(t('rampa.info', { n: etapa + 1, obj: objetivo(), tol: TOLERANCIA }));
    }
    function cambiarModo() {
      usaSensor = !usaSensor;
      if (!usaSensor) { rango.value = Math.round(Math.min(30, inclinacion.grados) * 2) / 2; valor.textContent = rango.value; ajustarRango(rango); }
      manual.hidden = usaSensor;
      pistaIncl.hidden = !usaSensor;
      juego.decir(t(usaSensor ? 'rampa.sensorOk' : 'rampa.barraOk'));
    }
    function reiniciar() {
      fase = 'apuntar'; tiempoMarcha = 0; golpe = 0; enVasoT = 0;
      soltar.disabled = false;
      mostrarPedido();
    }

    function lanzar() {
      if (fase !== 'apuntar') return;
      anguloLanzado = Math.max(0, angulo());
      duracion = tiempoCanica(anguloLanzado, LARGO_M);
      if (!Number.isFinite(duracion)) { juego.decir(t('rampa.nomueve'), 'pensando'); sfx.error(); return; }
      intentos += 1;
      fase = 'rodando';
      tiempoMarcha = 0;
      soltar.disabled = true;
      sfx.rodar(Math.min(duracion, 8));
    }

    function llego() {
      fase = 'vaso';
      enVasoT = 0;
      golpe = 1;
      sfx.vidrio();
      const error = Math.abs(duracion - objetivo());
      const x = juego.W * 0.3;
      const y = juego.H * 0.5;
      if (error <= TOLERANCIA) {
        juego.acierto(error, TOLERANCIA, x, y);
        hechos.push({ angulo: anguloLanzado, tiempo: duracion, objetivo: objetivo() });
        juego.decir(t('rampa.entregado', { t: duracion.toFixed(2) }), 'asombro');
        etapa += 1;
        setTimeout(() => { if (etapa >= OBJETIVOS.length) finalizar(); else { juego.decir(t('rampa.tutor')); reiniciar(); } }, 1800);
      } else {
        juego.fallo();
        juego.decir(t(duracion < objetivo() ? 'rampa.muyRapida' : 'rampa.muyLenta', { t: duracion.toFixed(2) }), 'triste');
        setTimeout(reiniciar, 1700);
      }
    }

    function finalizar() {
      juego.confeti(120);
      const estrellas = 1 + (pred.ok ? 1 : 0) + (intentos <= 5 ? 1 : 0);
      const [a, b] = hechos;
      const filas = hechos.map((f, i) => h('tr', {}, h('td', {}, i + 1), h('td', {}, `${f.angulo}°`), h('td', {}, `${f.tiempo.toFixed(2)} s`)));
      terminar({
        estrellas,
        puntos: juego.puntos,
        motivos: [t('rampa.m1'), t(pred.ok ? 'res.predOk' : 'res.predNo'), t(intentos <= 5 ? 'res.intentosOk' : 'res.intentosNo')],
        pregunta: t('rampa.analisis', { a: a.angulo, b: b.angulo, r: (b.angulo / a.angulo).toFixed(1), t1: a.tiempo.toFixed(2), t2: b.tiempo.toFixed(2) }),
        tabla: h('table', { class: 'tabla' }, h('tr', {}, h('th', {}, t('tabla.pedido')), h('th', {}, t('tabla.angulo')), h('th', {}, t('tabla.tiempo'))), filas),
        revela: t('rampa.revela'),
      });
    }

    function actualizar(dt) {
      if (!avisoSensor && inclinacion.visto && !usaSensor) {
        avisoSensor = true;
        modo.hidden = false;
        cambiarModo();
      }
      if (fase === 'rodando') {
        tiempoMarcha += dt;
        if (tiempoMarcha >= duracion) { tiempoMarcha = duracion; llego(); }
      } else if (fase === 'vaso') {
        enVasoT += dt;
        golpe = Math.max(0, golpe - dt * 2);
      }
    }

    function dibujar(cx, W, H, k) {
      dibujarSala(cx, W, H, k);
      const deg = fase === 'apuntar' ? angulo() : anguloLanzado;
      const th = radianes(deg);
      const len = Math.min(W * 0.615, H * 0.62);
      const g = { bx: W * 0.354, by: H * 0.58, len, th };
      const sx = g.bx + len * Math.cos(th);
      const sy = g.by - len * Math.sin(th);
      dibujarLapicero(cx, W * 0.875, H * 0.545, k);
      if (g.by - sy > 36 * k) dibujarLibros(cx, sx - 8 * k, sy + 2 * k, g.by + 6 * k, k);
      dibujarVaso(cx, g.bx - 30 * k, g.by - 28 * k, k, golpe);
      dibujarTablon(cx, g, k);
      // canica
      const r = ESFERA * k * 1.15;
      const nx = -Math.sin(th);
      const ny = -Math.cos(th);
      let p = fase === 'apuntar' ? 0 : Math.min(1, (tiempoMarcha / duracion) ** 2);
      if (fase === 'vaso') p = 1;
      let mx = sx + (g.bx - sx) * p + nx * r;
      let my = sy + (g.by - sy) * p + ny * r;
      giro = -(p * len) / r;
      if (fase === 'vaso') {
        const caida = Math.min(1, enVasoT / 0.35);
        mx = g.bx - 8 * k - 44 * k * caida;
        my = g.by - 28 * k + 8 * k * caida;
      }
      sombra(cx, mx, g.by + 8 * k, r * 0.9, 4 * k, 0.25);
      dibujarCanica(cx, mx, my, r, giro);
      // ángulo y cronómetro
      cx.fillStyle = PALETA.tinta;
      rr(cx, g.bx + 12 * k, g.by + 10 * k, 70 * k, 27 * k, 13 * k); cx.fill();
      texto(cx, `${deg.toFixed(deg % 1 ? 1 : 0)}°`, g.bx + 47 * k, g.by + 24 * k, 17 * k);
      const R = W * 0.112;
      dibujarCronometro(cx, W * 0.78, H * 0.235, R, tiempoMarcha, objetivo(), fase === 'rodando');
      texto3d(cx, tiempoMarcha === 0 ? '0 s' : `${tiempoMarcha.toFixed(1)} s`, W * 0.78, H * 0.235 + R * 1.45, 16 * k);
    }

    juego.decir(t('rampa.tutor'));
    mostrarPedido();
    setTimeout(() => { if (juego.raiz.isConnected && !inclinacion.visto && !avisoSensor) juego.decir(t('rampa.sinSensor'), 'pensando'); }, 4500);
    juego.iniciar({ actualizar, dibujar });
    return juego.raiz;
  },
};
