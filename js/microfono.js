// Escucha el micrófono y comprueba si la voz sostiene una nota. Necesita permiso del usuario.
import { detectarTono, plegarOctava } from './pitch.js?v=1';

const TOLERANCIA = 0.04; // 4 % de la frecuencia (~70 centésimas de tono)
const SEGUIDAS = 8; // lecturas buenas seguidas (~0,5 s)

/**
 * @returns {Promise<boolean>} true si el usuario afinó la nota; false si se acabó el tiempo.
 * Lanza si no hay micrófono o se niega el permiso.
 */
export async function escucharNota(objetivo, { duracion = 10000, alMedir = () => {} } = {}) {
  const flujo = await navigator.mediaDevices.getUserMedia({
    audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
  });
  const Ctx = window.AudioContext || window.webkitAudioContext;
  const contexto = new Ctx();
  const analizador = contexto.createAnalyser();
  analizador.fftSize = 4096;
  contexto.createMediaStreamSource(flujo).connect(analizador);
  const datos = new Float32Array(analizador.fftSize);
  const fin = performance.now() + duracion;
  let buenas = 0;

  return new Promise((resolver) => {
    const cerrar = (resultado) => {
      clearInterval(reloj);
      flujo.getTracks().forEach((pista) => pista.stop());
      contexto.close().catch(() => {});
      resolver(resultado);
    };
    const reloj = setInterval(() => {
      analizador.getFloatTimeDomainData(datos);
      const hz = detectarTono(datos.subarray(0, 2048), contexto.sampleRate);
      alMedir(hz);
      const afinado = hz != null && Math.abs(plegarOctava(hz, objetivo) - objetivo) / objetivo <= TOLERANCIA;
      buenas = afinado ? buenas + 1 : 0;
      if (buenas >= SEGUIDAS) cerrar(true);
      else if (performance.now() > fin) cerrar(false);
    }, 60);
  });
}
