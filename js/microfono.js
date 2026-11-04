// Micrófono para el nivel de la voz: entrega el tono (Hz) cada ~50 ms. Necesita permiso del usuario.
import { detectarTono } from './pitch.js?v=1';

const VIGENCIA = 200; // ms que se conserva la última lectura válida

/** Abre el micrófono. Lanza si no hay o se niega el permiso. */
export async function abrirMicrofono() {
  const flujo = await navigator.mediaDevices.getUserMedia({
    audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
  });
  const Ctx = window.AudioContext || window.webkitAudioContext;
  const contexto = new Ctx();
  await contexto.resume?.();
  const analizador = contexto.createAnalyser();
  analizador.fftSize = 2048;
  contexto.createMediaStreamSource(flujo).connect(analizador);
  const datos = new Float32Array(analizador.fftSize);
  let ultimo = null;
  let medidoEn = 0;
  let vistoEn = -Infinity;

  return {
    /** Tono actual en Hz, o null si no hay un sonido claro. */
    leer() {
      const ahora = performance.now();
      if (ahora - medidoEn >= 50) {
        medidoEn = ahora;
        analizador.getFloatTimeDomainData(datos);
        const hz = detectarTono(datos, contexto.sampleRate, { minHz: 80, maxHz: 1000 });
        if (hz) { ultimo = hz; vistoEn = ahora; }
      }
      return ahora - vistoEn < VIGENCIA ? ultimo : null;
    },
    cerrar() {
      flujo.getTracks().forEach((pista) => pista.stop());
      contexto.close().catch(() => {});
    },
  };
}
