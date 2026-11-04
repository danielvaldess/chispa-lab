const DSP = require('../js/dsp.js');
const FIS = require('../js/fisica.js');
let fallos = 0;
const ok = (n, c, d) => { if (!c) fallos++; console.log(c ? 'OK   ' : 'FALLA', n, d || ''); };

// --- Rampa: el tiempo no se reduce a la mitad al doblar el ángulo ---
const rad = g => g * Math.PI / 180, mu = 0.02, d = 3;
const t5 = FIS.tiempoRodar(rad(5), d, mu), t10 = FIS.tiempoRodar(rad(10), d, mu);
ok('rampa: 5° y 10° llegan, 10° es más rápido', t10 < t5, `t5=${t5.toFixed(2)} t10=${t10.toFixed(2)}`);
ok('rampa: doblar el ángulo NO reduce el tiempo a la mitad', t10 / t5 > 0.55 && t10 / t5 < 0.8, `razón=${(t10 / t5).toFixed(2)}`);
ok('rampa: bajo la fricción la bola no se mueve', FIS.tiempoRodar(rad(1), d, mu) === Infinity);
// Los tiempos objetivo del juego deben ser alcanzables con ángulos razonables
[3.0, 2.0, 1.4].forEach(T => {
  let lo = null;
  for (let a = 0; a <= 30; a += 0.1) if (Math.abs(FIS.tiempoRodar(rad(a), d, mu) - T) < 0.3) { lo = a; break; }
  ok(`rampa: objetivo ${T} s alcanzable`, lo !== null, lo !== null ? `desde ${lo.toFixed(1)}°` : '');
});

// --- Péndulo: período correcto y sin depender de la masa ---
[0.3, 0.5, 1.0, 1.7].forEach(L => {
  const esp = 2 * Math.PI * Math.sqrt(L / FIS.G) * (1 + 0.35 * 0.35 / 16);
  const T = FIS.periodoSimulado(L, 0.35, 0.002);
  ok(`péndulo L=${L} m`, Math.abs(T - esp) / esp < 0.01, `T=${T.toFixed(3)} esperado ${esp.toFixed(3)}`);
});
// Los períodos objetivo deben estar en el rango del control (20–200 cm)
[1.4, 2.0, 2.6].forEach(T => {
  const L = (T / (2 * Math.PI * 1.0077)) ** 2 * FIS.G;
  ok(`péndulo: objetivo ${T} s con L=${(L * 100).toFixed(0)} cm`, L >= 0.2 && L <= 2.0);
});

// --- YIN: tonos con armónicos fuertes, sin saltar de octava ---
function tono(f, sr, n, h2) {
  const b = new Float32Array(n);
  for (let i = 0; i < n; i++) b[i] = 0.3 * Math.sin(2 * Math.PI * f * i / sr) + h2 * 0.3 * Math.sin(4 * Math.PI * f * i / sr) + 0.02 * (Math.random() - 0.5);
  return b;
}
[[110, 48000], [220, 48000], [330, 44100], [440, 48000], [220, 16000]].forEach(([f, sr]) => {
  [0, 1.5].forEach(h2 => {
    const r = DSP.pitchYIN(tono(f, sr, 2048, h2), sr, 80, 1000);
    ok(`YIN ${f} Hz @${sr} armónico×${h2}`, r && Math.abs(r.freq - f) / f < 0.02, r ? `f=${r.freq.toFixed(1)}` : 'null');
  });
});
ok('YIN silencio devuelve null', DSP.pitchYIN(new Float32Array(2048), 48000, 80, 1000) === null);
const ruido = new Float32Array(2048).map(() => (Math.random() - 0.5) * 0.4);
const rr = DSP.pitchYIN(ruido, 48000, 80, 1000);
ok('YIN ruido blanco no da tono claro', rr === null || rr.clarity < 0.6, rr ? `clarity=${rr.clarity.toFixed(2)}` : 'null');

console.log(fallos ? `\n${fallos} prueba(s) fallaron` : '\nTodas las pruebas pasan');
process.exit(fallos ? 1 : 0);
