const C = require('../js/color-ml.js');
let fallos = 0;
const ok = (nombre, cond, detalle) => { if (!cond) fallos++; console.log((cond ? 'OK   ' : 'FALLA'), nombre, detalle || ''); };
const cerca = (a, b, tol) => Math.abs(a - b) <= tol;
const semilla = (s) => () => { s = (s * 1664525 + 1013904223) % 4294967296; return (s + 1) / 4294967298; };
const rnd = semilla(42);
const gauss = () => Math.sqrt(-2 * Math.log(rnd())) * Math.cos(2 * Math.PI * rnd());

// Valores de referencia conocidos del espacio Lab (D65)
let l = C.rgbALab(255, 255, 255);
ok('blanco ≈ L 100, a 0, b 0', cerca(l.L, 100, 0.2) && cerca(l.a, 0, 0.3) && cerca(l.b, 0, 0.3), JSON.stringify(l));
l = C.rgbALab(0, 0, 0);
ok('negro ≈ L 0', cerca(l.L, 0, 0.1) && cerca(l.a, 0, 0.1));
l = C.rgbALab(255, 0, 0);
ok('rojo puro ≈ L 53,2 · a 80,1 · b 67,2', cerca(l.L, 53.24, 0.3) && cerca(l.a, 80.09, 0.4) && cerca(l.b, 67.2, 0.4), JSON.stringify(l));
l = C.rgbALab(0, 0, 255);
ok('azul puro ≈ L 32,3 · a 79,2 · b −107,9', cerca(l.L, 32.3, 0.3) && cerca(l.a, 79.19, 0.5) && cerca(l.b, -107.86, 0.6), JSON.stringify(l));
l = C.rgbALab(128, 128, 128);
ok('gris medio: sin color (a, b ≈ 0)', cerca(l.a, 0, 0.3) && cerca(l.b, 0, 0.3));

// Promedio
ok('promediar', C.promediar([{ r: 10, g: 20, b: 30 }, { r: 20, g: 40, b: 50 }]).g === 30 && C.promediar([]) === null && C.promediar([{ r: NaN, g: 1, b: 1 }]) === null);

// Modelo
let m = C.nuevo();
ok('sin muestras no clasifica', C.clasificar(m, { r: 1, g: 2, b: 3 }) === null && !C.listo(m));
const AGUA = { r: 122, g: 79, b: 176 }, LIMON = { r: 224, g: 80, b: 154 }, BICARB = { r: 74, g: 111, b: 208 };
m = C.ensenar(C.ensenar(C.ensenar(m, 'neutro', AGUA), 'acido', LIMON), 'base', BICARB);
ok('tres clases enseñadas', C.listo(m) && Object.keys(m.clases).length === 3);
ok('el modelo original no se modifica', Object.keys(C.nuevo().clases).length === 0);
ok('ensenar con datos raros no cambia nada', C.ensenar(m, '', AGUA) === m && C.ensenar(m, 'x', { r: NaN, g: 1, b: 1 }) === m);
let c = C.clasificar(m, AGUA);
ok('lo que se enseñó se reconoce con confianza alta', c.clase === 'neutro' && c.confianza > 0.9 && c.seguro, JSON.stringify(c));

// Con ruido de cámara (desviación de 8 sobre 255) y con distinta luz (×0,7 a ×1,3)
function ruido(rgb, sigma, luz) { const f = (v) => Math.max(0, Math.min(255, v * luz + gauss() * sigma)); return { r: f(rgb.r), g: f(rgb.g), b: f(rgb.b) }; }
let bien = 0, total = 0; const pors = {};
[['neutro', AGUA], ['acido', LIMON], ['base', BICARB]].forEach(([k, rgb]) => {
  let b = 0; for (let i = 0; i < 500; i++) { const luz = 0.7 + rnd() * 0.6; const r = C.clasificar(m, ruido(rgb, 8, luz)); if (r.clase === k) b++; total++; }
  bien += b; pors[k] = Math.round(b / 5);
});
console.log('  Acierto con ruido ±8 y luz ×0,7–×1,3 (simulado): ' + JSON.stringify(pors) + ' %  · total ' + Math.round(100 * bien / total) + ' %');
ok('con ruido y distinta luz acierta más del 90 % (colores sintéticos)', bien / total > 0.9, Math.round(100 * bien / total) + ' %');

// Un color que no se parece a nada de lo enseñado → baja la confianza
const verde = C.clasificar(m, { r: 60, g: 180, b: 80 });
const medio = C.clasificar(m, { r: (AGUA.r + LIMON.r) / 2, g: (AGUA.g + LIMON.g) / 2, b: (AGUA.b + LIMON.b) / 2 });
ok('justo entre dos clases la confianza es baja y no está segura', medio.confianza < 0.5 && !medio.seguro, JSON.stringify(medio));
ok('el ranking trae todas las clases ordenadas', verde.ranking.length === 3 && verde.ranking[0].distancia <= verde.ranking[1].distancia);
// Más muestras de una clase mueven su centroide (aprende)
const m2 = C.ensenar(m, 'neutro', { r: 130, g: 85, b: 170 });
ok('otra muestra de la misma clase promedia el centroide', m2.clases.neutro.n === 2 && m2.clases.neutro.a !== m.clases.neutro.a);
ok('distanciaTono: igual = 0 y el rosa se nota lejos del azul', C.distanciaTono(AGUA, AGUA) === 0 && C.distanciaTono(LIMON, BICARB) > 30);
// Tiempo de una clasificación
const t0 = process.hrtime.bigint(); for (let i = 0; i < 20000; i++) C.clasificar(m, AGUA);
const ms = Number(process.hrtime.bigint() - t0) / 1e6 / 20000;
ok('clasificar tarda menos de 0,1 ms', ms < 0.1, ms.toFixed(5) + ' ms');

console.log(fallos ? '\n' + fallos + ' prueba(s) fallaron' : '\nTodas las pruebas pasan');
process.exit(fallos ? 1 : 0);
