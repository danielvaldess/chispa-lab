// Detección de tono por el método YIN (diferencia normalizada). Sin DOM.

/**
 * @param {Float32Array} buf muestras de audio
 * @param {number} sampleRate frecuencia de muestreo
 * @returns {number|null} frecuencia en Hz, o null si no hay un tono claro
 */
export function detectarTono(buf, sampleRate, { minHz = 80, maxHz = 1400, umbral = 0.15 } = {}) {
  const n = buf.length;
  let energia = 0;
  for (let i = 0; i < n; i++) energia += buf[i] * buf[i];
  if (Math.sqrt(energia / n) < 0.01) return null; // silencio

  const maxLag = Math.min(Math.floor(sampleRate / minHz), Math.floor(n / 2));
  const minLag = Math.max(2, Math.floor(sampleRate / maxHz));
  const ventana = n - maxLag;
  const d = new Float32Array(maxLag + 1);
  for (let tau = 1; tau <= maxLag; tau++) {
    let suma = 0;
    for (let i = 0; i < ventana; i++) {
      const delta = buf[i] - buf[i + tau];
      suma += delta * delta;
    }
    d[tau] = suma;
  }
  // diferencia acumulada normalizada
  let acumulado = 0;
  d[0] = 1;
  for (let tau = 1; tau <= maxLag; tau++) {
    acumulado += d[tau];
    d[tau] = acumulado === 0 ? 1 : (d[tau] * tau) / acumulado;
  }
  for (let tau = minLag; tau < maxLag; tau++) {
    if (d[tau] < umbral) {
      while (tau + 1 < maxLag && d[tau + 1] < d[tau]) tau++;
      const a = d[tau - 1];
      const b = d[tau];
      const c = d[tau + 1];
      const denom = a - 2 * b + c;
      const ajuste = denom === 0 ? 0 : (a - c) / (2 * denom);
      return sampleRate / (tau + ajuste);
    }
  }
  return null;
}
