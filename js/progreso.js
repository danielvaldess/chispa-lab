// Progreso local: idioma, sonido, estrellas y mejor puntaje por nivel. Solo vive en este dispositivo.
const CLAVE = 'chispalab.v2';
export const NIVELES = ['rampa', 'pendulo', 'voz'];

const vacio = () => ({
  idioma: null,
  sonido: true,
  estrellas: { rampa: 0, pendulo: 0, voz: 0 },
  puntos: { rampa: 0, pendulo: 0, voz: 0 },
});

function entero(valor, max) {
  const n = Number(valor);
  return Number.isInteger(n) && n >= 0 && n <= max ? n : 0;
}

function normalizar(crudo) {
  const base = vacio();
  if (!crudo || typeof crudo !== 'object') return base;
  if (typeof crudo.idioma === 'string') base.idioma = crudo.idioma;
  if (typeof crudo.sonido === 'boolean') base.sonido = crudo.sonido;
  for (const nivel of NIVELES) {
    base.estrellas[nivel] = entero(crudo.estrellas?.[nivel], 3);
    base.puntos[nivel] = entero(crudo.puntos?.[nivel], 1_000_000);
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

/** Guarda estrellas y puntos solo si mejoran la marca. Devuelve si hubo récord de puntos previo superado. */
export function registrarResultado(estado, nivel, estrellas, puntos, almacen) {
  const anterior = estado.puntos[nivel] || 0;
  if (estrellas > (estado.estrellas[nivel] || 0)) estado.estrellas[nivel] = estrellas;
  const record = puntos > anterior;
  if (record) estado.puntos[nivel] = puntos;
  guardar(estado, almacen);
  return { record, anterior };
}

export const total = (estado) => NIVELES.reduce((suma, nivel) => suma + estado.estrellas[nivel], 0);
