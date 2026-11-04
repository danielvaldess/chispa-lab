// Componentes de interfaz sin dependencias: elementos, tutor Chispa, botones y confeti.
import { t } from './i18n.js?v=1';

/** Crea un elemento HTML. Las props `on…` registran eventos; `class` fija la clase. */
export function h(tag, props = {}, ...hijos) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(props || {})) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2).toLowerCase(), v);
    else el.setAttribute(k, v === true ? '' : v);
  }
  el.append(...hijos.flat(Infinity).filter((x) => x != null && x !== false));
  return el;
}

const SVG_NS = 'http://www.w3.org/2000/svg';

/** Crea un elemento SVG. */
export function s(tag, attrs = {}, ...hijos) {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  el.append(...hijos.flat(Infinity).filter((x) => x != null && x !== false));
  return el;
}

/** Sustituye el contenido de la pantalla. */
export function mostrar(...nodos) {
  document.getElementById('app').replaceChildren(...nodos.flat(Infinity).filter(Boolean));
  window.scrollTo(0, 0);
}

export const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

export function boton(texto, alTocar, clase = '') {
  return h('button', { type: 'button', class: `btn ${clase}`.trim(), onclick: alTocar }, texto);
}

/* ---------- Chispa, el robot tutor ---------- */
const BOCAS = {
  feliz: '<path d="M38 74q12 11 24 0" fill="none" stroke="#7df9ff" stroke-width="4" stroke-linecap="round"/>',
  pensando: '<path d="M43 76h14" fill="none" stroke="#7df9ff" stroke-width="4" stroke-linecap="round"/>',
  asombro: '<ellipse cx="50" cy="76" rx="5" ry="6" fill="#7df9ff"/>',
  triste: '<path d="M38 80q12-10 24 0" fill="none" stroke="#7df9ff" stroke-width="4" stroke-linecap="round"/>',
};

/** Robot Chispa (dibujo propio): cabeza con pantalla azul, antena amarilla y cuerpo naranja. */
export function chispa(estado = 'feliz') {
  const ojoR = estado === 'asombro' ? 7 : 5.5;
  const desvio = estado === 'pensando' ? -3 : 0;
  const contenedor = h('div', { class: 'chispa', 'aria-hidden': 'true' });
  contenedor.innerHTML = `
    <svg viewBox="0 0 100 130">
      <ellipse cx="50" cy="124" rx="26" ry="5" fill="rgba(29,34,80,.25)"/>
      <line x1="50" y1="14" x2="50" y2="26" stroke="#1d2250" stroke-width="4" stroke-linecap="round"/>
      <circle class="chispita" cx="50" cy="10" r="7" fill="#ffd23f" stroke="#1d2250" stroke-width="3"/>
      <rect x="14" y="24" width="72" height="66" rx="30" fill="#eef3ff" stroke="#1d2250" stroke-width="5"/>
      <rect x="22" y="34" width="56" height="46" rx="22" fill="#2f6df0"/>
      <ellipse cx="${37 + desvio}" cy="${55 - (estado === 'pensando' ? 3 : 0)}" rx="${ojoR}" ry="${ojoR + 1.5}" fill="#eaffff"/>
      <ellipse cx="${63 + desvio}" cy="${55 - (estado === 'pensando' ? 3 : 0)}" rx="${ojoR}" ry="${ojoR + 1.5}" fill="#eaffff"/>
      <circle cx="30" cy="68" r="4" fill="#ff8fb0" opacity=".8"/><circle cx="70" cy="68" r="4" fill="#ff8fb0" opacity=".8"/>
      ${BOCAS[estado] || BOCAS.feliz}
      <rect x="30" y="92" width="40" height="24" rx="12" fill="#ff9f43" stroke="#1d2250" stroke-width="5"/>
      <circle cx="50" cy="104" r="4.5" fill="#ffd23f"/>
    </svg>`;
  return contenedor;
}

/** Tutor con globo de diálogo. Devuelve el elemento; `decir()` cambia el texto y el ánimo. */
export function tutor(texto, estado = 'feliz') {
  const globo = h('div', { class: 'globo', role: 'status', 'aria-live': 'polite' }, texto);
  const el = h('div', { class: 'tutor' }, chispa(estado), globo);
  el.decir = (nuevo, nuevoEstado = estado) => {
    globo.textContent = nuevo;
    el.querySelector('.chispa').replaceWith(chispa(nuevoEstado));
  };
  return el;
}

/** Barra superior con botón atrás, título y los tres pasos (predice, experimenta, descubre). */
export function barra(titulo, paso, alVolver) {
  const puntos = [0, 1, 2].map((i) => h('i', { class: i < paso ? 'hecho' : i === paso ? 'actual' : '' }));
  return h('div', { class: 'barra' },
    h('button', { type: 'button', class: 'atras', 'aria-label': t('comun.atras'), onclick: alVolver }, '←'),
    h('div', { class: 'titulo' }, titulo),
    h('div', { class: 'pasos' }, puntos));
}

/** Estrellas (0–3) como texto accesible. */
export function estrellas(n, oscuras = false) {
  const el = h('span', { class: `estrellas${oscuras ? ' oscuras' : ''}`, role: 'img', 'aria-label': t('comun.estrellas', { n }) });
  for (let i = 0; i < 3; i++) el.append(h('span', { class: i < n ? '' : 'vacia' }, '★'));
  return el;
}

/** Pregunta de predicción: devuelve { caja, respuesta }; `respuesta` resuelve con el índice elegido. */
export function pregunta(claves) {
  let resolver;
  const respuesta = new Promise((r) => { resolver = r; });
  const caja = h('div', { class: 'opciones' }, claves.map((clave, i) =>
    boton(t(clave), () => {
      caja.querySelectorAll('button').forEach((b) => { b.disabled = true; });
      resolver(i);
    }, i === 0 ? '' : 'suave')));
  return { caja, respuesta };
}

export function confeti(cantidad = 36) {
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
  const colores = ['#ffd43b', '#f0506e', '#4f46e5', '#2fbf71', '#ff7a45'];
  for (let i = 0; i < cantidad; i++) {
    const pieza = h('div', { class: 'confeti' });
    pieza.style.left = `${Math.random() * 100}vw`;
    pieza.style.background = colores[i % colores.length];
    pieza.style.setProperty('--dx', `${Math.random() * 160 - 80}px`);
    pieza.style.animationDelay = `${Math.random() * 0.4}s`;
    document.body.append(pieza);
    setTimeout(() => pieza.remove(), 2400);
  }
}

/**
 * Bucle de animación ligado a un nodo: se detiene solo cuando el nodo sale de la página.
 * `cuadro(dt, ahora)` devuelve false para terminar. Devuelve una función para cancelar.
 */
export function animar(nodo, cuadro) {
  let activo = true;
  let previo = null;
  const paso = (ahora) => {
    if (!activo || !nodo.isConnected) return;
    const dt = previo == null ? 0 : ahora - previo;
    previo = ahora;
    if (cuadro(dt, ahora) !== false) requestAnimationFrame(paso);
  };
  requestAnimationFrame(paso);
  return () => { activo = false; };
}
