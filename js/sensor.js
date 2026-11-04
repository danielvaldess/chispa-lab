// Inclinación del teléfono por el sensor de orientación (gamma = ladeo). Si no hay sensor, no emite nada.
const estado = { escuchando: false, visto: false, grados: 0 };

function alMover(ev) {
  if (ev.gamma == null) return;
  estado.visto = true;
  const objetivo = Math.abs(ev.gamma);
  estado.grados += (objetivo - estado.grados) * 0.35; // suaviza el ruido del sensor
}

/** Pide permiso (iOS) y empieza a escuchar. Hay que llamarlo desde un toque del usuario. */
export async function pedirMovimiento() {
  if (estado.escuchando) return true;
  try {
    if (typeof DeviceOrientationEvent === 'undefined') return false;
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      if ((await DeviceOrientationEvent.requestPermission()) !== 'granted') return false;
    }
    window.addEventListener('deviceorientation', alMover);
    estado.escuchando = true;
    return true;
  } catch {
    return false;
  }
}

export function detenerMovimiento() {
  window.removeEventListener('deviceorientation', alMover);
  estado.escuchando = false;
  estado.visto = false;
}

export const inclinacion = {
  get visto() { return estado.visto; },
  get grados() { return estado.grados; },
};
