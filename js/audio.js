// Efectos de sonido generados con Web Audio: no hay archivos de audio que descargar.
let contexto = null;
let silencio = false;

function ac() {
  if (!contexto) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    contexto = new Ctx();
  }
  if (contexto.state === 'suspended') contexto.resume();
  return contexto;
}

function nota(frecuencia, inicio, duracion, tipo = 'sine', volumen = 0.15) {
  const a = silencio ? null : ac();
  if (!a) return;
  const osc = a.createOscillator();
  const ganancia = a.createGain();
  const t0 = a.currentTime + inicio;
  osc.type = tipo;
  osc.frequency.value = frecuencia;
  ganancia.gain.setValueAtTime(0.0001, t0);
  ganancia.gain.exponentialRampToValueAtTime(volumen, t0 + 0.02);
  ganancia.gain.exponentialRampToValueAtTime(0.0001, t0 + duracion);
  osc.connect(ganancia).connect(a.destination);
  osc.start(t0);
  osc.stop(t0 + duracion + 0.05);
}

export const fijarSilencio = (valor) => { silencio = Boolean(valor); };
export const hayAudio = () => Boolean(window.AudioContext || window.webkitAudioContext);

export function vibrar(ms) {
  try { navigator.vibrate?.(ms); } catch { /* sin vibración */ }
}

export const sfx = {
  toque: () => nota(660, 0, 0.08, 'triangle'),
  acierto: () => [523.25, 659.25, 783.99].forEach((f, i) => nota(f, i * 0.09, 0.28, 'triangle')),
  error: () => nota(220, 0, 0.2, 'sawtooth', 0.07),
  tic: () => nota(1200, 0, 0.04, 'square', 0.05),
  tac: () => nota(800, 0, 0.05, 'square', 0.05),
  /** Nota sostenida (Hz) para la botella. */
  tono: (hz, duracion = 0.9) => nota(hz, 0, duracion, 'sine', 0.22),
  /** Canica rodando: ruido filtrado que sube de volumen durante `duracion` s. */
  rodar(duracion) {
    const a = silencio ? null : ac();
    if (!a) return;
    const largo = Math.max(1, Math.floor(a.sampleRate * duracion));
    const buffer = a.createBuffer(1, largo, a.sampleRate);
    const datos = buffer.getChannelData(0);
    for (let i = 0; i < largo; i++) datos[i] = Math.random() * 2 - 1;
    const fuente = a.createBufferSource();
    const filtro = a.createBiquadFilter();
    const ganancia = a.createGain();
    fuente.buffer = buffer;
    filtro.type = 'lowpass';
    filtro.frequency.setValueAtTime(300, a.currentTime);
    filtro.frequency.linearRampToValueAtTime(1400, a.currentTime + duracion);
    ganancia.gain.setValueAtTime(0.02, a.currentTime);
    ganancia.gain.linearRampToValueAtTime(0.2, a.currentTime + duracion);
    fuente.connect(filtro).connect(ganancia).connect(a.destination);
    fuente.start();
  },
  /** Clic de vidrio al llegar la canica. */
  vidrio: () => { nota(1800, 0, 0.12, 'triangle', 0.1); nota(2400, 0.03, 0.1, 'sine', 0.06); },
};

export const estaSilenciado = () => silencio;

/** Ejecuta `fn` aunque el sonido esté silenciado (p. ej. un aviso mientras se escucha el micrófono). */
export function sonarAunSilenciado(fn) {
  const previo = silencio;
  silencio = false;
  try { fn(); } finally { silencio = previo; }
}
