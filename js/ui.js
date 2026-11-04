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

/** Robot Chispa (dibujo propio): cabeza ancha con pantalla azul oscuro, ojos cian, antena y cuerpo naranja. */
export function chispa(estado = 'feliz') {
  const ojos = {
    feliz: '<ellipse cx="38" cy="50" rx="6" ry="9"/><ellipse cx="62" cy="50" rx="6" ry="9"/>',
    asombro: '<ellipse cx="38" cy="50" rx="7.5" ry="10.5"/><ellipse cx="62" cy="50" rx="7.5" ry="10.5"/>',
    pensando: '<ellipse cx="35" cy="48" rx="6" ry="9"/><ellipse cx="59" cy="48" rx="6" ry="9"/>',
    triste: '<ellipse cx="38" cy="51" rx="6" ry="8"/><ellipse cx="62" cy="51" rx="6" ry="8"/>',
  };
  const bocas = {
    feliz: '<path d="M38 57q12 18 24 0" fill="none" stroke="#6df0ff" stroke-width="4.5" stroke-linecap="round"/>',
    asombro: '<ellipse cx="50" cy="65" rx="5" ry="6" fill="#6df0ff"/>',
    pensando: '<path d="M44 66h13" fill="none" stroke="#6df0ff" stroke-width="4.5" stroke-linecap="round"/>',
    triste: '<path d="M38 68q12-12 24 0" fill="none" stroke="#6df0ff" stroke-width="4.5" stroke-linecap="round"/>',
  };
  const contenedor = h('div', { class: 'chispa', 'aria-hidden': 'true' });
  contenedor.innerHTML = `
    <svg viewBox="0 0 100 112">
      <g fill="#1d2250" opacity=".2"><rect x="16" y="30" width="76" height="58" rx="22"/><rect x="36" y="92" width="36" height="20" rx="10"/><circle cx="54" cy="14" r="6"/></g>
      <line x1="50" y1="14" x2="50" y2="26" stroke="#1d2250" stroke-width="4" stroke-linecap="round"/>
      <circle class="chispita" cx="50" cy="11" r="6.5" fill="#ffd23f" stroke="#1d2250" stroke-width="3.5"/>
      <rect x="12" y="24" width="76" height="58" rx="22" fill="#eef0ff" stroke="#1d2250" stroke-width="5"/>
      <rect x="22" y="33" width="56" height="40" rx="15" fill="#2b3a8c"/>
      <g fill="#6df0ff">${ojos[estado] || ojos.feliz}</g>
      ${bocas[estado] || bocas.feliz}
      <circle cx="24" cy="64" r="4.5" fill="#ff8fb0" opacity=".85"/><circle cx="76" cy="64" r="4.5" fill="#ff8fb0" opacity=".85"/>
      <rect x="32" y="86" width="36" height="20" rx="10" fill="#ff9f43" stroke="#1d2250" stroke-width="5"/>
      <circle cx="50" cy="96" r="4" fill="#ffd23f"/>
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
