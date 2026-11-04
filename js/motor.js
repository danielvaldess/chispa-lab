// Motor de las escenas de juego: lienzo a pantalla completa, bucle, partículas, puntos y combo,
// y el HUD (cerrar, título, puntos, pedidos, tutor y controles).
import { t } from './i18n.js?v=1';
import { h, chispa, esperar } from './ui.js?v=1';
import { sfx, vibrar } from './audio.js?v=1';

export const PALETA = {
  tinta: '#1d2250', amarillo: '#ffd23f', rosa: '#ff5c8a', verde: '#2fd18b',
  azul: '#3b82f6', naranja: '#ff9f43', morado: '#8a6cff',
};
const COLORES = Object.values(PALETA).slice(1);

const reducido = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
export const esLigero = () => reducido() || (navigator.hardwareConcurrency || 4) <= 2;

/** Pinta el relleno de un control deslizante según su valor (variable CSS --p). */
export function ajustarRango(input) {
  const min = Number(input.min) || 0;
  const max = Number(input.max) || 100;
  input.style.setProperty('--p', `${((Number(input.value) - min) / (max - min)) * 100}%`);
}

/** Puntos de un acierto: 100 + hasta 100 de precisión, por un multiplicador de combo (máx. 5). */
export function calcularPuntos(error, tolerancia, combo) {
  const precision = Math.round(100 * Math.max(0, 1 - error / tolerancia));
  const multiplicador = Math.min(combo, 5);
  return { precision, multiplicador, ganados: (100 + precision) * multiplicador };
}

export function elogio(precision) {
  if (precision >= 80) return { clave: 'juego.perfecto', color: PALETA.amarillo };
  if (precision >= 40) return { clave: 'juego.genial', color: PALETA.verde };
  return { clave: 'juego.bien', color: '#4da3ff' };
}

/**
 * Crea la pantalla de juego. `pedidos` son las etiquetas de los tres pedidos.
 * Devuelve la API para que cada nivel dibuje, hable, puntúe y se cierre.
 */
export function crearJuego({ titulo, icono, pedidos, tema = '', alSalir }) {
  const lienzo = h('canvas', { class: 'lienzo', 'aria-hidden': 'true' });
  const cx = lienzo.getContext('2d');
  const puntosEl = h('b', {}, '0');
  const comboEl = h('span', { class: 'combo', hidden: true });
  const chips = pedidos.map((p) => h('span', { class: 'chip' }, p));
  const textoTutor = h('p', { role: 'status', 'aria-live': 'polite' });
  const info = h('p', { class: 'info-juego', role: 'status', 'aria-live': 'polite' });
  const controles = h('div', { class: 'controles' });
  const animoTutor = h('div', { class: 'mini-chispa' }, chispa('feliz'));
  const capaEfectos = h('div', { class: 'capa-efectos', 'aria-hidden': 'true' });
  const destelloEl = h('div', { class: 'destello', 'aria-hidden': 'true' });
  const raiz = h('div', { class: `juego ${tema}` },
    lienzo,
    h('div', { class: 'hud' },
      h('button', { type: 'button', class: 'cerrar', 'aria-label': t('juego.salir'), onclick: () => alSalir?.() }, '✕'),
      h('div', { class: 'titulo-juego' }, `${icono} ${titulo}`),
      h('div', { class: 'puntos' }, '⭐ ', puntosEl, comboEl)),
    h('div', { class: 'pedidos' }, chips),
    capaEfectos, destelloEl,
    h('div', { class: 'mando' },
      h('div', { class: 'tutor-juego' }, animoTutor, textoTutor),
      controles, info));

  const juego = {
    raiz, cx, controles, W: 0, H: 0, k: 1, puntos: 0, combo: 0, sacudida: 0, activo: false,
  };
  const particulas = [];
  let dpr = 1;

  function medir() {
    dpr = Math.min(window.devicePixelRatio || 1, esLigero() ? 1.5 : 2);
    juego.W = window.innerWidth;
    juego.H = window.innerHeight;
    juego.k = Math.min(juego.W / 390, juego.H / 600);
    lienzo.width = Math.round(juego.W * dpr);
    lienzo.height = Math.round(juego.H * dpr);
  }
  medir();
  window.addEventListener('resize', medir);

  juego.decir = (texto, animo = 'feliz') => {
    textoTutor.textContent = texto;
    animoTutor.replaceChildren(chispa(animo));
  };
  juego.info = (texto) => { info.textContent = texto; };

  /** Marca el pedido actual (amarillo) y los hechos (verde). */
  juego.pedido = (actual) => chips.forEach((c, i) => {
    c.className = `chip${i < actual ? ' hecho' : i === actual ? ' actual' : ''}`;
  });

  function efecto(clase, texto, x, y, estilo = {}) {
    const el = h('div', { class: clase }, texto);
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    Object.assign(el.style, estilo);
    capaEfectos.append(el);
    setTimeout(() => el.remove(), 1400);
  }
  juego.flotante = (texto, x, y) => efecto('flotante', texto, x, y);
  juego.splash = (texto, color) => efecto('splash', texto, juego.W / 2, juego.H * 0.32, { color });
  juego.destello = () => {
    if (reducido()) return;
    destelloEl.classList.remove('on');
    void destelloEl.offsetWidth;
    destelloEl.classList.add('on');
  };
  juego.sacudir = (m) => { if (!reducido()) juego.sacudida = m; };

  juego.chispas = (x, y, n = 18, colores = COLORES) => {
    if (esLigero()) n = Math.ceil(n / 2);
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const v = 60 + Math.random() * 220;
      particulas.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 60, vida: 0.7 + Math.random() * 0.5, t: 0, r: 2 + Math.random() * 3, color: colores[i % colores.length], g: 380 });
    }
  };
  juego.confeti = (n = 80) => {
    if (esLigero()) n = Math.ceil(n / 2);
    for (let i = 0; i < n; i++) {
      particulas.push({ x: Math.random() * juego.W, y: -10 - Math.random() * 80, vx: (Math.random() - 0.5) * 140, vy: 80 + Math.random() * 160, vida: 2.4 + Math.random(), t: 0, r: 4 + Math.random() * 4, color: COLORES[i % COLORES.length], g: 120, rect: true, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 10 });
    }
  };

  /** Registra un acierto: suma puntos con combo, y lanza el festejo. Devuelve el cálculo. */
  juego.acierto = (error, tolerancia, x, y) => {
    juego.combo += 1;
    const r = calcularPuntos(error, tolerancia, juego.combo);
    juego.puntos += r.ganados;
    puntosEl.textContent = String(juego.puntos);
    comboEl.hidden = juego.combo < 2;
    comboEl.textContent = `🔥×${Math.min(juego.combo, 5)}`;
    const e = elogio(r.precision);
    juego.splash(t(e.clave), e.color);
    juego.flotante(`+${r.ganados}`, x ?? juego.W / 2, y ?? juego.H / 2);
    juego.destello();
    juego.chispas(x ?? juego.W / 2, y ?? juego.H / 2, 28);
    juego.confeti(40);
    sfx.acierto();
    vibrar([30, 30, 60]);
    return r;
  };
  juego.fallo = () => {
    juego.combo = 0;
    comboEl.hidden = true;
    juego.sacudir(8);
    sfx.error();
    vibrar(80);
  };

  /** Bucle: actualizar(dt en s) y dibujar(cx, W, H, k). Se detiene al salir la pantalla del documento. */
  juego.iniciar = ({ actualizar, dibujar }) => {
    juego.activo = true;
    let previo = performance.now();
    const cuadro = (ahora) => {
      if (!juego.activo || !raiz.isConnected) { juego.detener(); return; }
      const dt = Math.min(0.05, (ahora - previo) / 1000);
      previo = ahora;
      actualizar?.(dt);
      cx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cx.save();
      if (juego.sacudida > 0.3) {
        cx.translate((Math.random() - 0.5) * juego.sacudida, (Math.random() - 0.5) * juego.sacudida);
        juego.sacudida *= 0.9;
      }
      dibujar(cx, juego.W, juego.H, juego.k);
      for (let i = particulas.length - 1; i >= 0; i--) {
        const p = particulas[i];
        p.t += dt;
        if (p.t > p.vida) { particulas.splice(i, 1); continue; }
        p.vy += p.g * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        cx.globalAlpha = Math.max(0, 1 - p.t / p.vida);
        cx.fillStyle = p.color;
        if (p.rect) {
          p.rot += p.vr * dt;
          cx.save(); cx.translate(p.x, p.y); cx.rotate(p.rot); cx.fillRect(-p.r, -p.r * 0.6, p.r * 2, p.r * 1.2); cx.restore();
        } else {
          cx.beginPath(); cx.arc(p.x, p.y, p.r, 0, Math.PI * 2); cx.fill();
        }
      }
      cx.globalAlpha = 1;
      cx.restore();
      requestAnimationFrame(cuadro);
    };
    requestAnimationFrame(cuadro);
  };
  juego.detener = () => {
    juego.activo = false;
    window.removeEventListener('resize', medir);
  };
  juego.esperar = esperar;
  return juego;
}

/** Pantalla completa y vertical donde el navegador lo permita (se ignora si falla). */
export function pantallaCompleta() {
  try {
    const el = document.documentElement;
    const pedir = el.requestFullscreen || el.webkitRequestFullscreen;
    if (pedir && !document.fullscreenElement) {
      Promise.resolve(pedir.call(el)).then(() => screen.orientation?.lock?.('portrait')).catch(() => {});
    }
  } catch { /* sin pantalla completa */ }
}

export function salirPantallaCompleta() {
  try {
    if (document.fullscreenElement) document.exitFullscreen?.();
  } catch { /* nada */ }
}
