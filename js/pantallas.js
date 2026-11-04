// Pantallas fuera del juego: menú, predicción (con la historia del nivel) y resultado.
import { t, IDIOMAS, NOMBRES_IDIOMA, idiomaActual } from './i18n.js?v=1';
import { h, mostrar } from './ui.js?v=1';
import { chispa } from './ui.js?v=1';
import { sfx, vibrar } from './audio.js?v=1';
import { NIVELES, total } from './progreso.js?v=1';

const LETRAS = ['A', 'B', 'C'];

/** Tarjeta con Chispa hablando. */
function tarjetaChispa(texto, animo = 'feliz') {
  return h('div', { class: 'tarjeta-chispa' }, chispa(animo), h('p', {}, texto));
}

const estadoRed = () => h('span', { class: 'estado-red', role: 'status' }, t(navigator.onLine ? 'estado.con' : 'estado.sin'));

const estrellasTexto = (n) => [0, 1, 2].map((i) => h('span', { class: i < n ? '' : 'vacia' }, i < n ? '★' : '☆'));

/** Menú principal. `abrir(nivel)` entra a la predicción; `cambiarIdioma` y `alternarSonido` ajustan preferencias. */
export function menu({ niveles, estado, abrir, cambiarIdioma, alternarSonido }) {
  const energia = total(estado);
  const maximo = niveles.length * 3;
  const tarjetas = niveles.map((nivel) => {
    const pts = estado.puntos[nivel.id] || 0;
    return h('button', { type: 'button', class: 'nivel', style: `--c:${nivel.color}`, onclick: () => abrir(nivel) },
      h('span', { class: 'ico', 'aria-hidden': 'true' }, nivel.icono),
      h('span', {},
        h('b', {}, t(nivel.titulo)),
        h('small', {}, t(nivel.sub) + (pts ? ` · ${t('menu.record', { n: pts })}` : '')),
        h('span', { class: 'est', role: 'img', 'aria-label': t('comun.estrellas', { n: estado.estrellas[nivel.id] }) }, estrellasTexto(estado.estrellas[nivel.id]))));
  });
  const bombillas = Array.from({ length: maximo }, (_, i) => h('span', { class: i < energia ? 'on' : '' }));
  const selector = h('select', { class: 'idioma', 'aria-label': t('menu.idioma'), onchange: (ev) => cambiarIdioma(ev.target.value) },
    IDIOMAS.map((id) => h('option', { value: id, selected: id === idiomaActual() }, NOMBRES_IDIOMA[id])));
  mostrar(
    h('div', { class: 'cabecera' }, h('span', { class: 'marca' }, t('app.nombre')), estadoRed()),
    h('h2', { class: 'titulo-pill' }, t('menu.titulo')),
    tarjetaChispa(t('menu.bienvenida')),
    h('nav', { class: 'niveles' }, tarjetas),
    h('p', { class: 'energia' }, t('menu.energia', { n: energia, total: maximo }), h('span', { class: 'bombillas', role: 'img', 'aria-label': t('menu.energia', { n: energia, total: maximo }) }, bombillas)),
    h('div', { class: 'pie' }, selector, h('button', { type: 'button', class: 'btn-pie', onclick: alternarSonido }, t(estado.sonido ? 'sonido.si' : 'sonido.no'))));
}

/** Historia del nivel y pregunta de predicción. `jugar(opcion)` recibe la opción elegida. */
export function intro({ nivel, volver, jugar }) {
  mostrar(
    h('button', { type: 'button', class: 'volver', onclick: volver }, `← ${t('comun.menu')}`),
    h('h2', { class: 'titulo-pill' }, `${nivel.icono} ${t(nivel.titulo)}`),
    tarjetaChispa(t(nivel.historia)),
    h('h3', { class: 'etiqueta-pill' }, t('pred.titulo')),
    h('p', { class: 'pregunta' }, t(nivel.pred.pregunta)),
    h('div', { class: 'opciones' }, nivel.pred.opciones.map((op, i) =>
      h('button', { type: 'button', class: 'op', onclick: () => { sfx.toque(); jugar(op); } },
        h('span', { class: 'letra' }, LETRAS[i]), t(op.clave)))));
}

/**
 * Resultado de un nivel. `res` trae estrellas, puntos, motivos, pregunta, tabla (nodo) y revela.
 * `siguiente` es el nivel que sigue (o null).
 */
export function resultado({ nivel, res, record, siguiente, otra, abrirSiguiente, menu: irMenu }) {
  sfx.acierto();
  vibrar([40, 40, 40, 40, 120]);
  const estrellas = h('div', { class: 'estrellas-grandes', role: 'img', 'aria-label': t('comun.estrellas', { n: res.estrellas }) },
    [0, 1, 2].map((i) => h('span', { class: i < res.estrellas ? 'on' : '', style: `--i:${i}` }, i < res.estrellas ? '★' : '☆')));
  const revela = h('div', { class: 'revela', hidden: true }, res.revela);
  const ver = h('button', { type: 'button', class: 'btn sec', onclick: () => { revela.hidden = false; ver.hidden = true; sfx.toque(); } }, t('res.ver'));
  mostrar(
    h('h2', { class: 'titulo-pill' }, `${nivel.icono} ${t('res.completado', { nombre: t(nivel.titulo) })}`),
    estrellas,
    h('p', { class: 'puntaje' }, t('res.puntos', { n: res.puntos }), record.record && record.anterior ? ` · ${t('res.record')}` : ''),
    h('ul', { class: 'motivos' }, res.motivos.map((m) => h('li', {}, m))),
    tarjetaChispa(res.pregunta, 'pensando'),
    res.tabla,
    ver, revela,
    h('div', { class: 'acciones' },
      siguiente
        ? h('button', { type: 'button', class: 'btn', onclick: abrirSiguiente }, t('res.siguiente'))
        : h('button', { type: 'button', class: 'btn', onclick: irMenu }, t('res.menu')),
      h('button', { type: 'button', class: 'btn sec', onclick: otra }, t('res.otra'))));
}
