// Nivel 1: la rampa. Predecir, soltar la canica con distintas inclinaciones y descubrir la relación.
import { t } from '../i18n.js?v=1';
import { h, s, mostrar, tutor, barra, boton, pregunta, estrellas, confeti, animar, esperar } from '../ui.js?v=1';
import { sfx, vibrar } from '../audio.js?v=1';
import { tiempoRampa, distanciaRampa, limitar } from '../physics.js?v=1';

const LARGO = 230; // px que representan 1 m de rampa
const PIVOTE = { x: 262, y: 160 };
const SUELO = 170;
const RADIO = 8;
const MISIONES = [{ min: 1.1, max: 1.2 }, { min: 0.7, max: 0.8 }];
const COLORES_LIBROS = ['#e4572e', '#29a0b1', '#f2b134', '#7a5af8'];

const rad = (g) => (g * Math.PI) / 180;

/** Dibuja la rampa de cartón sobre libros, la canica y el vaso. */
function escena() {
  const libros = s('g');
  const canica = s('g');
  const tablon = s('g',
    s('rect', { x: -LARGO, y: -5, width: LARGO, height: 10, rx: 4, fill: '#d9a066', stroke: '#a8723a', 'stroke-width': 1.5 }),
    ...Array.from({ length: 22 }, (_, i) => s('line', { x1: -LARGO + 8 + i * 10, y1: -3, x2: -LARGO + 8 + i * 10, y2: 3, stroke: '#b9803f', 'stroke-width': 1 })),
    s('rect', { x: -LARGO + 2, y: -7, width: 22, height: 14, fill: '#f6e27a', opacity: 0.8 }),
    canica);
  canica.append(
    s('circle', { r: RADIO, fill: '#2f80ed', stroke: '#1b4f9c', 'stroke-width': 1.5 }),
    s('path', { d: 'M-5 -2q3-6 8-4', fill: 'none', stroke: '#fff', 'stroke-width': 2, 'stroke-linecap': 'round' }));
  const svg = s('svg', { viewBox: '0 0 300 190', role: 'img', 'aria-label': t('rampa.nombre') },
    s('rect', { x: 0, y: SUELO, width: 300, height: 20, fill: '#e7d9b8' }),
    libros,
    s('path', { d: 'M256 138 L260 170 L292 170 L296 138', fill: 'rgba(160,210,255,.5)', stroke: '#7aa7d9', 'stroke-width': 3, 'stroke-linejoin': 'round' }),
    tablon);

  return {
    svg,
    /** Inclina la rampa y reacomoda los libros bajo el extremo alto. */
    poner(grados) {
      tablon.setAttribute('transform', `translate(${PIVOTE.x} ${PIVOTE.y}) rotate(${grados})`);
      const xAlto = PIVOTE.x - LARGO * Math.cos(rad(grados));
      const yAlto = PIVOTE.y - LARGO * Math.sin(rad(grados)) + 5;
      const alto = SUELO - yAlto;
      libros.replaceChildren(...COLORES_LIBROS.map((color, i) =>
        s('rect', { x: xAlto - 22, y: yAlto + (alto / 4) * i, width: 44, height: alto / 4 - 1, rx: 3, fill: color })));
    },
    /** Coloca la canica: `fraccion` de 0 a 1 del recorrido. */
    mover(fraccion) {
      const x = -LARGO + fraccion * LARGO;
      const giro = ((fraccion * LARGO) / RADIO) * (180 / Math.PI);
      canica.setAttribute('transform', `translate(${x} ${-5 - RADIO}) rotate(${giro})`);
    },
  };
}

async function predecir(salir) {
  const e = escena();
  e.poner(20);
  e.mover(0);
  const { caja, respuesta } = pregunta(['rampa.a1', 'rampa.a2', 'rampa.a3']);
  mostrar(
    barra(t('rampa.nombre'), 0, salir),
    tutor(t('rampa.intro')),
    h('div', { class: 'escena' }, e.svg),
    h('h2', {}, t('rampa.pregunta')),
    caja);
  const eleccion = await respuesta;
  sfx.toque();
  await esperar(250);
  return eleccion === 0;
}

function mision(indice, intentos, salir) {
  return new Promise((resolver) => {
    const { min, max } = MISIONES[indice];
    const e = escena();
    const ayuda = tutor(t('rampa.mision', { min: min.toFixed(1), max: max.toFixed(1) }), 'pensando');
    const etiqueta = h('div', { class: 'dato' });
    const lectura = h('div', { class: 'dato' }, ' ');
    const estado = h('div', { class: 'estado', role: 'status' });
    const rango = h('input', { type: 'range', min: 8, max: 40, step: 0.5, value: 20, 'aria-label': t('rampa.angulo', { n: '' }) });
    const soltar = boton(t('rampa.soltar'), lanzar, 'verde grande');
    const sensor = typeof DeviceOrientationEvent === 'undefined' ? null : boton(t('rampa.sensor'), activarSensor, 'suave chico');

    const actualizar = () => {
      e.poner(Number(rango.value));
      e.mover(0);
      etiqueta.textContent = t('rampa.angulo', { n: Number(rango.value).toFixed(1) });
    };
    const bloquear = (si) => { rango.disabled = si; soltar.disabled = si; };

    function alInclinar(ev) {
      if (!e.svg.isConnected) { window.removeEventListener('deviceorientation', alInclinar); return; }
      if (ev.beta == null) return;
      rango.value = limitar(Math.abs(ev.beta), 8, 40);
      actualizar();
    }
    async function activarSensor() {
      try {
        if (typeof DeviceOrientationEvent.requestPermission === 'function') {
          if ((await DeviceOrientationEvent.requestPermission()) !== 'granted') throw new Error('permiso');
        }
        window.addEventListener('deviceorientation', alInclinar);
        estado.className = 'estado';
        estado.textContent = t('rampa.sensorAyuda');
      } catch {
        estado.className = 'estado mal';
        estado.textContent = t('rampa.sensorNo');
      }
    }

    async function lanzar() {
      const angulo = Number(rango.value);
      const duracion = tiempoRampa(angulo);
      bloquear(true);
      estado.textContent = '';
      lectura.textContent = ' ';
      sfx.rodar(duracion);
      const inicio = performance.now();
      await new Promise((fin) => animar(e.svg, (_, ahora) => {
        const fraccion = Math.min(1, distanciaRampa(angulo, Math.max(0, (ahora - inicio) / 1000)));
        e.mover(fraccion);
        if (fraccion >= 1) { fin(); return false; }
        return true;
      }));
      sfx.vidrio();
      vibrar(30);
      const segundos = Math.round(duracion * 100) / 100;
      intentos.push({ angulo, tiempo: segundos });
      lectura.textContent = t('rampa.tiempo', { n: segundos.toFixed(2) });
      if (segundos >= min && segundos <= max) {
        estado.className = 'estado bien';
        estado.textContent = t('rampa.acierto');
        ayuda.decir(t('rampa.acierto'), 'asombro');
        sfx.acierto();
        confeti(18);
        await esperar(1400);
        resolver();
        return;
      }
      estado.className = 'estado mal';
      estado.textContent = t(segundos < min ? 'rampa.rapida' : 'rampa.lenta');
      ayuda.decir(estado.textContent, 'triste');
      sfx.error();
      await esperar(700);
      e.mover(0);
      bloquear(false);
    }

    rango.addEventListener('input', () => { actualizar(); sfx.toque(); });
    actualizar();
    mostrar(
      barra(t('rampa.nombre'), 1, salir),
      ayuda,
      h('div', { class: 'escena' }, e.svg),
      h('div', { class: 'tarjeta' },
        etiqueta, rango, sensor, lectura, estado, soltar));
  });
}

async function experimentar(salir) {
  const intentos = [];
  for (let i = 0; i < MISIONES.length; i++) await mision(i, intentos, salir);
  return intentos;
}

function descubrir(salir, acerto, intentos) {
  return new Promise((resolver) => {
    const n = 1 + (acerto ? 1 : 0) + (intentos.length <= 4 ? 1 : 0);
    const filas = intentos.map((i) => h('tr', {}, h('td', {}, `${i.angulo.toFixed(1)}°`), h('td', {}, `${i.tiempo.toFixed(2)} s`)));
    mostrar(
      barra(t('rampa.nombre'), 2, salir),
      tutor(`${t(acerto ? 'comun.prediccionOk' : 'comun.prediccionNo')} ${t('rampa.aprendido')}`, 'asombro'),
      h('div', { class: 'tarjeta' }, h('h2', {}, t('rampa.tabla')), h('table', { class: 'tabla' }, filas)),
      h('div', { class: 'tarjeta final' }, h('h2', {}, t('comun.nivelListo')), estrellas(n, true), boton(t('comun.menu'), () => resolver(n), 'verde grande')));
    sfx.acierto();
    confeti();
  });
}

export default {
  id: 'rampa',
  icono: '🔵',
  nombre: 'rampa.nombre',
  sub: 'rampa.sub',
  async jugar({ salir }) {
    const acerto = await predecir(salir);
    const intentos = await experimentar(salir);
    return descubrir(salir, acerto, intentos);
  },
};
