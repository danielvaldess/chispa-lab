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
  feliz: '<path d="M48 70q12 12 24 0" fill="none" stroke="#1f2352" stroke-width="4" stroke-linecap="round"/>',
  pensando: '<path d="M52 72h16" fill="none" stroke="#1f2352" stroke-width="4" stroke-linecap="round"/>',
  asombro: '<ellipse cx="60" cy="72" rx="6" ry="7" fill="#1f2352"/>',
  triste: '<path d="M48 76q12-10 24 0" fill="none" stroke="#1f2352" stroke-width="4" stroke-linecap="round"/>',
};

/** Robot Chispa (dibujo propio). estado: feliz | pensando | asombro | triste */
export function chispa(estado = 'feliz') {
  const ojo = estado === 'asombro' ? 8 : 6.5;
  const mira = estado === 'pensando' ? 'cx="50" cy="52"' : null;
  const contenedor = h('div', { class: 'chispa', 'aria-hidden': 'true' });
  contenedor.innerHTML = `
    <svg viewBox="0 0 120 120">
      <g class="chispita">
        <path d="M60 2l4 8 8 1-6 6 2 8-8-4-8 4 2-8-6-6 8-1z" fill="#ffd43b" stroke="#e0a800" stroke-width="2" stroke-linejoin="round"/>
      </g>
      <line x1="60" y1="24" x2="60" y2="32" stroke="#3730a3" stroke-width="4" stroke-linecap="round"/>
      <rect x="20" y="30" width="80" height="62" rx="24" fill="#6366f1" stroke="#3730a3" stroke-width="4"/>
      <rect x="29" y="40" width="62" height="42" rx="18" fill="#fff"/>
      <circle ${mira || 'cx="47" cy="56"'} r="${ojo}" fill="#1f2352"/>
      <circle cx="${mira ? 70 : 73}" cy="${mira ? 52 : 56}" r="${ojo}" fill="#1f2352"/>
      <circle cx="43" cy="64" r="4" fill="#ffb3c1" opacity=".8"/><circle cx="77" cy="64" r="4" fill="#ffb3c1" opacity=".8"/>
      ${BOCAS[estado] || BOCAS.feliz}
      <rect x="38" y="94" width="44" height="22" rx="10" fill="#4f46e5" stroke="#3730a3" stroke-width="4"/>
      <circle cx="60" cy="105" r="4" fill="#ffd43b"/>
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
