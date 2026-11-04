const C = require('../js/camara.js');
let fallos = 0;
const ok = (nombre, cond, detalle) => { if (!cond) fallos++; console.log((cond ? 'OK   ' : 'FALLA'), nombre, detalle || ''); };

ok('rojo', C.clasificarColor(230, 30, 30) === 'rojo');
ok('rojo cerca del límite de 360°', C.clasificarColor(240, 20, 60) === 'rojo');
ok('verde', C.clasificarColor(30, 200, 60) === 'verde');
ok('azul', C.clasificarColor(30, 60, 230) === 'azul');
ok('amarillo', C.clasificarColor(240, 220, 20) === 'amarillo');
ok('gris no es ningún color', C.clasificarColor(128, 128, 128) === null);
ok('blanco no es ningún color', C.clasificarColor(250, 250, 250) === null);
ok('negro no es ningún color', C.clasificarColor(10, 10, 10) === null);
ok('morado no está en la lista', C.clasificarColor(150, 40, 200) === null);

const N = C.COLS * C.FILAS;
const mitad = new Float32Array(N).map((_, i) => ((i % C.COLS) < C.COLS / 2 ? 200 : 20));
ok('sombra: mitad de la imagen tapada ≈ 0,5', Math.abs(C.fraccionSombra(mitad) - 0.5) < 0.05, C.fraccionSombra(mitad));
ok('sombra: imagen pareja = 0', C.fraccionSombra(new Float32Array(N).fill(180)) === 0);
ok('sombra: cámara tapada (todo oscuro) = 1', C.fraccionSombra(new Float32Array(N).fill(3)) === 1);
ok('sombra: no depende del brillo absoluto (mismo reparto, más oscuro)', Math.abs(C.fraccionSombra(mitad.map((v) => v * 0.4)) - 0.5) < 0.05);

const a = new Float32Array(N).fill(100);
const b = a.slice();
ok('movimiento: fotos iguales = 0', C.energiaCeldas(a, b, C.COLS, C.FILAS, 16, 12).every((v) => v === 0));
for (let y = 0; y < 12; y++) for (let x = 0; x < 16; x++) b[y * C.COLS + x] = 255; // cambio arriba a la izquierda
const e = C.energiaCeldas(b, a, C.COLS, C.FILAS, 16, 12);
ok('movimiento: la celda que cambió se activa', e[0] > 0.3 && e[e.length - 1] === 0, e[0]);
ok('movimiento: tamaño de la cuadrícula', e.length === 16 * 12);

const rgba = new Uint8ClampedArray(N * 4);
for (let i = 0; i < N; i++) { rgba[i * 4] = 200; rgba[i * 4 + 1] = 30; rgba[i * 4 + 2] = 30; rgba[i * 4 + 3] = 255; }
const c = C.colorCentral(rgba, C.COLS, C.FILAS);
ok('color central de una imagen roja', C.clasificarColor(c.r, c.g, c.b) === 'rojo');
ok('grises: largo correcto', C.grises(rgba).length === N);

console.log(fallos ? '\n' + fallos + ' prueba(s) fallaron' : '\nTodas las pruebas pasan');
process.exit(fallos ? 1 : 0);
