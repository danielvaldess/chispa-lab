const DSP = require('../js/dsp.js');
let fallos = 0;
const ok = (nombre, cond, detalle) => { if (!cond) fallos++; console.log((cond ? 'OK   ' : 'FALLA'), nombre, detalle || ''); };

// Aleatorio reproducible
let seed = 42;
const rnd = () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296 - 0.5; };

// Péndulo simulado: |a| = g cosθ + L θ'^2, θ = θ0 cos(ωt)
function pendulo(L, fs, seg, ruido) {
  const g = 9.81, w = Math.sqrt(g / L), th0 = 15 * Math.PI / 180, out = [];
  for (let t = 0; t < seg; t += 1 / fs) {
    const tj = t + rnd() * 0.3 / fs;
    const th = th0 * Math.cos(w * tj), thd = -th0 * w * Math.sin(w * tj);
    out.push({ t: tj, v: g * Math.cos(th) + L * thd * thd + ruido * rnd() });
  }
  return out;
}
[[0.3, 50], [0.5, 50], [1.0, 50], [0.5, 20], [1.5, 30]].forEach(([L, fs]) => {
  const esperado = 2 * Math.PI * Math.sqrt(L / 9.81);
  const r = DSP.pendulumPeriod(pendulo(L, fs, 12, 0.2));
  ok(`péndulo L=${L} m a ${fs} Hz`, r && Math.abs(r.period - esperado) < 0.05 * esperado,
    r ? `T=${r.period.toFixed(3)} esperado ${esperado.toFixed(3)} q=${r.quality.toFixed(2)}` : 'null');
});
ok('péndulo sin movimiento devuelve null', DSP.pendulumPeriod(Array.from({ length: 600 }, (_, i) => ({ t: i / 50, v: 9.81 }))) === null);

// Pulso simulado: 1.2 Hz (72 bpm) con segundo armónico, deriva y ruido, ~30 fps con jitter
function pulso(hz, seg, ruido) {
  const out = [];
  for (let t = 0; t < seg; t += 1 / 30) {
    const tj = t + rnd() * 0.01;
    out.push({ t: tj, v: 180 + 0.5 * tj + 2 * Math.sin(2 * Math.PI * hz * tj) + 0.6 * Math.sin(4 * Math.PI * hz * tj) + ruido * rnd() });
  }
  return out;
}
[[1.0, 0.8], [1.2, 0.8], [1.8, 0.8], [1.2, 2.5]].forEach(([hz, ruido]) => {
  const r = DSP.heartRate(pulso(hz, 20, ruido));
  ok(`pulso ${hz * 60} bpm ruido ${ruido}`, r && Math.abs(r.bpm - hz * 60) < 4,
    r ? `bpm=${r.bpm.toFixed(1)} q=${r.quality.toFixed(2)}` : 'null');
});
const plano = Array.from({ length: 600 }, (_, i) => ({ t: i / 30, v: 200 }));
ok('pulso con señal plana devuelve null', DSP.heartRate(plano) === null);

// Frecuencia dominante
const fftSize = 4096, sr = 48000, db = new Float32Array(fftSize / 2).fill(-100);
const f0 = 523.3, bin = sr / fftSize;
for (let i = 0; i < db.length; i++) db[i] = -100 + 60 * Math.exp(-Math.pow((i * bin - f0) / 25, 2));
const d = DSP.dominantFreq(db, sr, fftSize, 150, 3000);
ok('frecuencia dominante 523 Hz', Math.abs(d.freq - f0) < 3, `f=${d.freq.toFixed(1)}`);

// Ajuste y g
const pts = [30, 50, 70, 100].map(L => ({ x: L, y: 2 * Math.PI * Math.sqrt(L / 100 / 9.81) }));
const g = DSP.gravityFromPendulum(pts);
ok('g a partir de L y T', Math.abs(g - 9.81) < 0.05, `g=${g.toFixed(2)}`);
const f = DSP.fit([{ x: 1, y: 2 }, { x: 2, y: 4 }, { x: 3, y: 6 }]);
ok('regresión lineal', Math.abs(f.m - 2) < 1e-9 && Math.abs(f.r - 1) < 1e-9);

console.log(fallos ? `\n${fallos} prueba(s) fallaron` : '\nTodas las pruebas pasan');
process.exit(fallos ? 1 : 0);
