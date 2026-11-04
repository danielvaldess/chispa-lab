// Modelos físicos puros (sin DOM) para que se puedan probar en Node.

export const G = 9.81; // m/s²
export const VELOCIDAD_SONIDO = 343; // m/s a ~20 °C

const rad = (grados) => (grados * Math.PI) / 180;

/** Aceleración de una esfera maciza que rueda sin deslizar por una rampa: (5/7)·g·sen θ. */
export function aceleracionRampa(anguloGrados) {
  return (5 / 7) * G * Math.sin(rad(anguloGrados));
}

/** Tiempo (s) que tarda en recorrer `largo` metros partiendo del reposo. */
export function tiempoRampa(anguloGrados, largo = 1) {
  return Math.sqrt((2 * largo) / aceleracionRampa(anguloGrados));
}

/** Distancia (m) recorrida a lo largo de la rampa tras `t` segundos. */
export function distanciaRampa(anguloGrados, t) {
  return 0.5 * aceleracionRampa(anguloGrados) * t * t;
}

/** Ángulo (°) para que la canica tarde `tiempo` s en 1 m. */
export function anguloParaTiempo(tiempo, largo = 1) {
  const a = (2 * largo) / (tiempo * tiempo);
  return (Math.asin(a / ((5 / 7) * G)) * 180) / Math.PI;
}

/** Periodo (s) de un péndulo simple de `largo` metros; no depende de la masa. */
export function periodoPendulo(largo) {
  return 2 * Math.PI * Math.sqrt(largo / G);
}

/** Longitud (m) para un periodo dado. */
export function largoParaPeriodo(periodo) {
  return G * (periodo / (2 * Math.PI)) ** 2;
}

/** Ángulo (rad) del péndulo en el instante t, en la aproximación de ángulos pequeños. */
export function anguloPendulo(t, largo, amplitud) {
  return amplitud * Math.cos((2 * Math.PI * t) / periodoPendulo(largo));
}

/** Frecuencia fundamental (Hz) de una botella (tubo cerrado) con `aire` metros de columna de aire. */
export function frecuenciaBotella(aire, radio = 0.01) {
  return VELOCIDAD_SONIDO / (4 * (aire + 0.6 * radio));
}

/** Columna de aire (m) que produce la frecuencia `hz`. */
export function aireParaFrecuencia(hz, radio = 0.01) {
  return VELOCIDAD_SONIDO / (4 * hz) - 0.6 * radio;
}

/** Diferencia relativa entre dos frecuencias. */
export function errorRelativo(medida, objetivo) {
  return Math.abs(medida - objetivo) / objetivo;
}

export const limitar = (v, min, max) => Math.min(max, Math.max(min, v));

/** Duración (s) de la bajada de una canica que rueda `largo` metros por una rampa de `grados`; Infinity si no se mueve. */
export function tiempoCanica(anguloGrados, largo = 3) {
  const a = aceleracionRampa(anguloGrados);
  return a < 0.02 ? Infinity : Math.sqrt((2 * largo) / a);
}
