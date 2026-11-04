// Punto de entrada: navegación entre menú, predicción, juego y resultado; idioma y sonido.
import { detectarIdioma, fijarIdioma, idiomaActual, t } from './i18n.js?v=1';
import { mostrar } from './ui.js?v=1';
import { fijarSilencio, sfx } from './audio.js?v=1';
import { leer, guardar, registrarResultado } from './progreso.js?v=1';
import { pantallaCompleta, salirPantallaCompleta } from './motor.js?v=1';
import { pedirMovimiento, detenerMovimiento } from './sensor.js?v=1';
import * as pantallas from './pantallas.js?v=1';
import rampa from './niveles/rampa.js?v=1';
import pendulo from './niveles/pendulo.js?v=1';

const NIVELES = [rampa, pendulo];

const estado = leer();
fijarIdioma(estado.idioma || detectarIdioma(navigator.languages || [navigator.language]));
fijarSilencio(!estado.sonido);

function menu() {
  detenerMovimiento();
  document.title = t('app.nombre');
  document.documentElement.lang = idiomaActual();
  pantallas.menu({
    niveles: NIVELES,
    estado,
    abrir: abrirNivel,
    cambiarIdioma: (idioma) => { fijarIdioma(idioma); estado.idioma = idioma; guardar(estado); menu(); },
    alternarSonido: () => { estado.sonido = !estado.sonido; fijarSilencio(!estado.sonido); guardar(estado); menu(); },
  });
}

function abrirNivel(nivel) {
  sfx.toque();
  pantallas.intro({ nivel, volver: menu, jugar: (opcion) => empezar(nivel, opcion) });
}

/** Arranca el juego del nivel. Se llama desde un toque, que es lo que permiten el audio, la pantalla completa y el sensor. */
function empezar(nivel, opcion) {
  pantallaCompleta();
  if (nivel.sensor === 'mov') pedirMovimiento();
  const salir = () => { salirPantallaCompleta(); menu(); };
  const terminar = (res) => {
    const record = registrarResultado(estado, nivel.id, res.estrellas, res.puntos);
    const siguiente = NIVELES[NIVELES.indexOf(nivel) + 1] || null;
    pantallas.resultado({
      nivel, res, record, siguiente,
      otra: () => abrirNivel(nivel),
      abrirSiguiente: () => abrirNivel(siguiente),
      menu,
    });
  };
  mostrar(nivel.jugar({ pred: opcion, salir, terminar }));
}

window.addEventListener('online', () => document.querySelector('.estado-red')?.replaceChildren(t('estado.con')));
window.addEventListener('offline', () => document.querySelector('.estado-red')?.replaceChildren(t('estado.sin')));

menu();

if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('sw.js').catch(() => { /* sin sw: el juego funciona igual con red */ });
}
