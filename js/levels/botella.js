// Nivel 3: la botella. Más agua, menos aire, nota más aguda. Bonus: afinar con la voz.
import { t } from '../i18n.js?v=1';
import { h, s, mostrar, tutor, barra, boton, pregunta, estrellas, confeti, animar, esperar } from '../ui.js?v=1';
import { sfx, vibrar, hayAudio } from '../audio.js?v=1';
import { frecuenciaBotella, errorRelativo } from '../physics.js?v=1';
import { escucharNota } from '../microfono.js?v=1';

const ALTO = 0.2; // m de botella (aire + agua)
const Y_ARRIBA = 40;
const Y_ABAJO = 226;
const TOLERANCIA = 0.03;
const NOTAS = [
  { clave: 'nota.do', hz: 523.25 },
  { clave: 'nota.mi', hz: 659.25 },
];

const FORMA = 'M135 30h30v50q0 8 14 14t21 22v92q0 18-18 18h-64q-18 0-18-18v-92q7-16 21-22t14-14z';

const aireDe = (porcentaje) => ALTO * (1 - porcentaje / 100);
const hzDe = (porcentaje) => frecuenciaBotella(aireDe(porcentaje));

/** Botella con agua y ondas de sonido sobre el cuello. */
function escena() {
  const agua = s('rect', { x: 80, y: Y_ABAJO, width: 140, height: 0, fill: '#4aa8ff', opacity: 0.85 });
  const ondas = s('g');
  const svg = s('svg', { viewBox: '0 0 300 250', role: 'img', 'aria-label': t('botella.nombre') },
    s('defs', {}, s('clipPath', { id: 'forma-botella' }, s('path', { d: FORMA }))),
    s('g', { 'clip-path': 'url(#forma-botella)' }, s('rect', { x: 80, y: 20, width: 140, height: 220, fill: '#eaf6ff' }), agua),
    s('path', { d: FORMA, fill: 'none', stroke: '#5b5f8a', 'stroke-width': 4, 'stroke-linejoin': 'round' }),
    s('rect', { x: 131, y: 24, width: 38, height: 10, rx: 4, fill: '#e4572e' }),
    ondas);
  return {
    svg,
    poner(porcentaje) {
      const alto = (porcentaje / 100) * (Y_ABAJO - Y_ARRIBA);
      agua.setAttribute('y', Y_ABAJO - alto);
      agua.setAttribute('height', alto + 6);
    },
    /** Tres anillos que se expanden desde la boca de la botella. */
    sonar() {
      const anillos = [0, 1, 2].map(() => {
        const c = s('circle', { cx: 150, cy: 26, r: 4, fill: 'none', stroke: '#4f46e5', 'stroke-width': 3, opacity: 0 });
        ondas.append(c);
        return c;
      });
      let transcurrido = 0;
      animar(svg, (dt) => {
        transcurrido += dt;
        anillos.forEach((c, i) => {
          const p = (transcurrido - i * 160) / 800;
          c.setAttribute('r', 4 + Math.max(0, p) * 36);
          c.setAttribute('opacity', p < 0 || p > 1 ? 0 : 1 - p);
        });
        if (transcurrido > 1100) { anillos.forEach((c) => c.remove()); return false; }
        return true;
      });
    },
  };
}

async function predecir(salir) {
  const e = escena();
  e.poner(30);
  const { caja, respuesta } = pregunta(['botella.a1', 'botella.a2', 'botella.a3']);
  mostrar(
    barra(t('botella.nombre'), 0, salir),
    tutor(t('botella.intro')),
    h('div', { class: 'escena' }, e.svg),
    h('h2', {}, t('botella.pregunta')),
    caja);
  const eleccion = await respuesta;
  sfx.toque();
  await esperar(250);
  return eleccion === 0;
}

function mision(nota, contador, salir) {
  return new Promise((resolver) => {
    const e = escena();
    let agua = 10;
    const ayuda = tutor(t('botella.mision', { nota: t(nota.clave) }), 'pensando');
    const etiqueta = h('div', { class: 'dato' });
    const estado = h('div', { class: 'estado', role: 'status' });
    const rango = h('input', { type: 'range', min: 0, max: 90, step: 1, value: agua, 'aria-label': t('botella.agua', { n: '' }) });

    const sonar = () => { sfx.tono(hzDe(agua)); e.sonar(); };
    function comprobar() {
      contador.n += 1;
      sonar();
      const medida = hzDe(agua);
      if (errorRelativo(medida, nota.hz) <= TOLERANCIA) {
        estado.className = 'estado bien';
        estado.textContent = t('botella.acierto');
        ayuda.decir(estado.textContent, 'asombro');
        setTimeout(() => { sfx.acierto(); vibrar(30); confeti(18); }, 700);
        setTimeout(resolver, 2200);
        return;
      }
      estado.className = 'estado mal';
      estado.textContent = t(medida < nota.hz ? 'botella.masAgua' : 'botella.menosAgua');
      ayuda.decir(estado.textContent, 'triste');
    }

    rango.addEventListener('input', () => {
      agua = Number(rango.value);
      e.poner(agua);
      etiqueta.textContent = t('botella.agua', { n: agua });
      estado.textContent = '';
    });
    e.poner(agua);
    etiqueta.textContent = t('botella.agua', { n: agua });
    mostrar(
      barra(t('botella.nombre'), 1, salir),
      ayuda,
      h('div', { class: 'escena' }, e.svg),
      h('div', { class: 'tarjeta' },
        etiqueta, rango,
        h('div', { class: 'fila' },
          boton(`🎯 ${t('botella.objetivo')}`, () => { sfx.tono(nota.hz); e.sonar(); }, 'chispa'),
          boton(`🔊 ${t('botella.sonar')}`, sonar, 'suave')),
        estado,
        boton(t('botella.comprobar'), comprobar, 'verde grande')));
  });
}

async function experimentar(salir) {
  const contador = { n: 0 };
  for (const nota of NOTAS) await mision(nota, contador, salir);
  return contador.n;
}

function descubrir(salir, acerto, intentos) {
  return new Promise((resolver) => {
    let micro = false;
    const base = 1 + (acerto ? 1 : 0);
    const estrellasDe = () => base + (micro || intentos <= 4 ? 1 : 0);
    const marco = h('div', { class: 'tarjeta final' });
    const lectura = h('div', { class: 'estado', role: 'status' });
    const pintarFinal = () => marco.replaceChildren(
      h('h2', {}, t('comun.nivelListo')),
      estrellas(estrellasDe(), true),
      boton(t('comun.menu'), () => resolver(estrellasDe()), 'verde grande'));
    pintarFinal();

    const bonus = hayAudio() && navigator.mediaDevices?.getUserMedia
      ? boton(`🎤 ${t('botella.micro')}`, async () => {
        bonus.disabled = true;
        try {
          const ok = await escucharNota(NOTAS[0].hz, {
            alMedir: (hz) => { lectura.className = 'estado'; lectura.textContent = hz ? t('botella.escuchando', { n: Math.round(hz) }) : '…'; },
          });
          if (ok) {
            micro = true;
            lectura.className = 'estado bien';
            lectura.textContent = t('botella.afinado');
            sfx.acierto();
            confeti(24);
            pintarFinal();
          }
        } catch {
          lectura.className = 'estado mal';
          lectura.textContent = t('botella.microNo');
        }
        bonus.disabled = false;
      }, 'chispa grande')
      : null;

    mostrar(
      barra(t('botella.nombre'), 2, salir),
      tutor(`${t(acerto ? 'comun.prediccionOk' : 'comun.prediccionNo')} ${t('botella.aprendido')}`, 'asombro'),
      bonus && h('div', { class: 'tarjeta' }, bonus, lectura),
      marco);
    sfx.acierto();
    confeti();
  });
}

export default {
  id: 'botella',
  icono: '🍾',
  nombre: 'botella.nombre',
  sub: 'botella.sub',
  async jugar({ salir }) {
    const acerto = await predecir(salir);
    const intentos = await experimentar(salir);
    return descubrir(salir, acerto, intentos);
  },
};
