// Nivel 2: el péndulo. La masa no cambia el periodo; el largo del hilo sí.
import { t } from '../i18n.js?v=1';
import { h, s, mostrar, tutor, barra, boton, pregunta, estrellas, confeti, animar, esperar } from '../ui.js?v=1';
import { sfx, vibrar } from '../audio.js?v=1';
import { periodoPendulo } from '../physics.js?v=1';

const PIVOTE = { x: 150, y: 26 };
const PX_POR_METRO = 200;
const AMPLITUD = 0.35; // rad
const OBJETOS = [
  { id: 'moneda', emoji: '🪙', masa: '5\u00a0g' },
  { id: 'llaves', emoji: '🔑', masa: '40\u00a0g' },
  { id: 'manzana', emoji: '🍎', masa: '180\u00a0g' },
  { id: 'lata', emoji: '🥫', masa: '400\u00a0g' },
];
const OBJETIVO = { min: 0.95, max: 1.05 };

/** Viga, hilo y objeto colgante. `oscilar()` avanza la fase y devuelve cuántos extremos se cruzaron. */
function escena() {
  const hilo = s('line', { x1: PIVOTE.x, y1: PIVOTE.y, x2: PIVOTE.x, y2: PIVOTE.y + 100, stroke: '#5b5f8a', 'stroke-width': 2.5 });
  const objeto = s('text', { x: PIVOTE.x, y: PIVOTE.y + 116, 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-size': 34 }, OBJETOS[0].emoji);
  const pendulo = s('g', {}, hilo, objeto);
  const svg = s('svg', { viewBox: '0 0 300 250', role: 'img', 'aria-label': t('pendulo.nombre') },
    s('rect', { x: 40, y: 14, width: 220, height: 12, rx: 5, fill: '#b9803f' }),
    s('circle', { cx: PIVOTE.x, cy: PIVOTE.y, r: 5, fill: '#5b5f8a' }),
    pendulo);
  let fase = 0;
  let largo = 0.5;
  const poner = (metros, emoji) => {
    largo = metros;
    const y = PIVOTE.y + metros * PX_POR_METRO;
    hilo.setAttribute('y2', y);
    objeto.setAttribute('y', y + 16);
    if (emoji) objeto.textContent = emoji;
  };
  return {
    svg,
    poner,
    /** dt en ms; devuelve el número de extremos cruzados (para tic y tac). */
    oscilar(dt) {
      const antes = Math.floor(fase / Math.PI);
      fase += (2 * Math.PI * dt) / 1000 / periodoPendulo(largo);
      const angulo = AMPLITUD * Math.cos(fase);
      pendulo.setAttribute('transform', `rotate(${(angulo * 180) / Math.PI} ${PIVOTE.x} ${PIVOTE.y})`);
      return Math.floor(fase / Math.PI) - antes;
    },
    get fase() { return fase; },
  };
}

async function predecir(salir) {
  const e = escena();
  e.poner(0.5, OBJETOS[2].emoji);
  e.oscilar(0);
  const { caja, respuesta } = pregunta(['pendulo.a1', 'pendulo.a2', 'pendulo.a3']);
  mostrar(
    barra(t('pendulo.nombre'), 0, salir),
    tutor(t('pendulo.intro')),
    h('div', { class: 'escena' }, e.svg),
    h('h2', {}, t('pendulo.pregunta')),
    caja);
  animar(e.svg, (dt) => { e.oscilar(dt); });
  const eleccion = await respuesta;
  sfx.toque();
  await esperar(250);
  return eleccion === 1;
}

function experimentar(salir) {
  return new Promise((resolver) => {
    const e = escena();
    const probados = new Set([OBJETOS[0].id]);
    let largoCm = 50;
    let alterna = false;
    const ayuda = tutor(t('pendulo.mision'), 'pensando');
    const etiqueta = h('div', { class: 'dato' });
    const periodo = h('div', { class: 'dato' });
    const estado = h('div', { class: 'estado', role: 'status' });
    const rango = h('input', { type: 'range', min: 10, max: 100, step: 1, value: largoCm, 'aria-label': t('pendulo.hilo', { n: '' }) });
    const botones = OBJETOS.map((o) => h('button', {
      type: 'button',
      class: 'objeto',
      'aria-pressed': o.id === OBJETOS[0].id ? 'true' : 'false',
      onclick: () => elegir(o),
    }, h('span', { 'aria-hidden': 'true' }, o.emoji), `${t(`pendulo.${o.id}`)} · ${o.masa}`));

    const periodoActual = () => Math.round(periodoPendulo(largoCm / 100) * 100) / 100;
    function actualizar() {
      e.poner(largoCm / 100);
      etiqueta.textContent = t('pendulo.hilo', { n: largoCm });
      periodo.textContent = t('pendulo.periodo', { n: periodoActual().toFixed(2) });
    }
    function elegir(objeto) {
      probados.add(objeto.id);
      botones.forEach((b, i) => b.setAttribute('aria-pressed', String(OBJETOS[i].id === objeto.id)));
      e.poner(largoCm / 100, objeto.emoji);
      sfx.toque();
    }
    async function comprobar() {
      const p = periodoActual();
      const dentro = p >= OBJETIVO.min && p <= OBJETIVO.max;
      if (dentro && probados.size < 2) {
        estado.className = 'estado';
        estado.textContent = t('pendulo.prueba');
        ayuda.decir(estado.textContent, 'pensando');
        sfx.toque();
        return;
      }
      if (dentro) {
        estado.className = 'estado bien';
        estado.textContent = t('pendulo.acierto');
        ayuda.decir(estado.textContent, 'asombro');
        sfx.acierto();
        vibrar(30);
        confeti(18);
        await esperar(1500);
        resolver(probados.size);
        return;
      }
      estado.className = 'estado mal';
      estado.textContent = t(p > OBJETIVO.max ? 'pendulo.largo' : 'pendulo.corto', { n: p.toFixed(2) });
      ayuda.decir(estado.textContent, 'triste');
      sfx.error();
    }

    rango.addEventListener('input', () => { largoCm = Number(rango.value); actualizar(); estado.textContent = ''; });
    actualizar();
    mostrar(
      barra(t('pendulo.nombre'), 1, salir),
      ayuda,
      h('div', { class: 'escena' }, e.svg),
      h('div', { class: 'tarjeta' },
        h('div', { class: 'objetos' }, botones),
        etiqueta, rango, periodo, estado,
        boton(t('pendulo.comprobar'), comprobar, 'verde grande')));
    animar(e.svg, (dt) => {
      const cruces = e.oscilar(dt);
      for (let i = 0; i < cruces; i++) { alterna = !alterna; (alterna ? sfx.tic : sfx.tac)(); }
    });
  });
}

function descubrir(salir, acerto, probados) {
  return new Promise((resolver) => {
    const n = 1 + (acerto ? 1 : 0) + (probados >= 3 ? 1 : 0);
    mostrar(
      barra(t('pendulo.nombre'), 2, salir),
      tutor(`${t(acerto ? 'comun.prediccionOk' : 'comun.prediccionNo')} ${t('pendulo.aprendido')}`, 'asombro'),
      h('div', { class: 'tarjeta' }, h('p', { class: 'dato' }, t('pendulo.probados', { n: probados }))),
      h('div', { class: 'tarjeta final' }, h('h2', {}, t('comun.nivelListo')), estrellas(n, true), boton(t('comun.menu'), () => resolver(n), 'verde grande')));
    sfx.acierto();
    confeti();
  });
}

export default {
  id: 'pendulo',
  icono: '⏱️',
  nombre: 'pendulo.nombre',
  sub: 'pendulo.sub',
  async jugar({ salir }) {
    const acerto = await predecir(salir);
    const probados = await experimentar(salir);
    return descubrir(salir, acerto, probados);
  },
};
