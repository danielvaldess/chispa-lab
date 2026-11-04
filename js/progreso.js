// Progreso local: idioma, sonido y estrellas por nivel. Solo vive en este dispositivo.
const CLAVE = 'chispalab.v1';
const NIVELES = ['rampa', 'pendulo', 'botella'];

const vacio = () => ({ idioma: null, sonido: true, estrellas: { rampa: 0, pendulo: 0, botella: 0 } });

function normalizar(crudo) {
  const base = vacio();
  if (!crudo || typeof crudo !== 'object') return base;
  if (typeof crudo.idioma === 'string') base.idioma = crudo.idioma;
  if (typeof crudo.sonido === 'boolean') base.sonido = crudo.sonido;
  for (const nivel of NIVELES) {
    const n = Number(crudo.estrellas?.[nivel]);
    base.estrellas[nivel] = Number.isInteger(n) && n >= 0 && n <= 3 ? n : 0;
  }
  return base;
}

export function leer(almacen = globalThis.localStorage) {
  try {
    return normalizar(JSON.parse(almacen.getItem(CLAVE)));
  } catch {
    return vacio();
  }
}

export function guardar(estado, almacen = globalThis.localStorage) {
  try {
    almacen.setItem(CLAVE, JSON.stringify(estado));
  } catch { /* modo privado o sin espacio: el juego sigue sin guardar */ }
}

/** Guarda solo si mejora la marca del nivel. */
export function registrarEstrellas(estado, nivel, n, almacen) {
  if (n > (estado.estrellas[nivel] || 0)) estado.estrellas[nivel] = n;
  guardar(estado, almacen);
  return estado;
}

export const total = (estado) => NIVELES.reduce((suma, nivel) => suma + estado.estrellas[nivel], 0);
