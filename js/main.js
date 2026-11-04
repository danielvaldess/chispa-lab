// Punto de entrada: menú de niveles, idioma y sonido.
import { IDIOMAS, NOMBRES_IDIOMA, detectarIdioma, fijarIdioma, idiomaActual, t } from './i18n.js?v=1';
import { h, mostrar, tutor, estrellas } from './ui.js?v=1';
import { fijarSilencio, sfx } from './audio.js?v=1';
import { leer, guardar, registrarEstrellas, total } from './progreso.js?v=1';
import rampa from './levels/rampa.js?v=1';
import pendulo from './levels/pendulo.js?v=1';
import botella from './levels/botella.js?v=1';

const NIVELES = [rampa, pendulo, botella];
const CLASES = ['n1', 'n2', 'n3'];

const estado = leer();
fijarIdioma(estado.idioma || detectarIdioma(navigator.languages || [navigator.language]));
fijarSilencio(!estado.sonido);

function cambiarIdioma(idioma) {
  fijarIdioma(idioma);
  estado.idioma = idioma;
  guardar(estado);
  document.documentElement.lang = idioma;
  menu();
}

function menu() {
  document.title = t('app.nombre');
  document.documentElement.lang = idiomaActual();
  const selector = h('select', { class: 'idioma', 'aria-label': t('menu.idioma'), onchange: (ev) => cambiarIdioma(ev.target.value) },
    IDIOMAS.map((id) => h('option', { value: id, selected: id === idiomaActual() }, NOMBRES_IDIOMA[id])));
  const sonido = h('button', {
    type: 'button',
    class: 'btn suave chico',
    onclick: () => {
      estado.sonido = !estado.sonido;
      fijarSilencio(!estado.sonido);
      guardar(estado);
      menu();
    },
  }, t(estado.sonido ? 'sonido.si' : 'sonido.no'));

  mostrar(
    h('header', { class: 'portada' }, h('h1', {}, t('app.nombre')), h('p', { class: 'nota' }, t('menu.total', { n: total(estado) }))),
    tutor(t('menu.saludo')),
    h('nav', { class: 'niveles' }, NIVELES.map((nivel, i) =>
      h('button', { type: 'button', class: `nivel ${CLASES[i]}`, onclick: () => jugar(nivel) },
        h('span', { class: 'icono', 'aria-hidden': 'true' }, nivel.icono),
        h('span', { class: 'texto' }, h('b', {}, t(nivel.nombre)), h('small', {}, t(nivel.sub))),
        estrellas(estado.estrellas[nivel.id])))),
    h('div', { class: 'menu-pie' }, selector, sonido));
}

async function jugar(nivel) {
  sfx.toque();
  const estrellasLogradas = await new Promise((resolver) => {
    nivel.jugar({ salir: () => resolver(null) }).then(resolver, (error) => {
      console.error(error);
      resolver(null);
    });
  });
  if (estrellasLogradas != null) registrarEstrellas(estado, nivel.id, estrellasLogradas);
  menu();
}

menu();

if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('sw.js').catch(() => { /* sin sw: el juego funciona igual con red */ });
}
