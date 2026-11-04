const A = require('../js/ajustes.js');
let fallos = 0;
const ok = (nombre, cond, detalle) => { if (!cond) fallos++; console.log((cond ? 'OK   ' : 'FALLA'), nombre, detalle || ''); };
const hoy = new Date(2026, 10, 4); // 4 nov 2026

// edad
ok('edad: cumple años este mes ya contado', A.edadDe('2016-11', hoy) === 10);
ok('edad: aún no llega su mes', A.edadDe('2016-12', hoy) === 9);
ok('edad: entrada inválida', A.edadDe('hola', hoy) === null && A.edadDe('2016-13', hoy) === null);
ok('edad: año bisiesto no rompe', A.edadDe('2020-02', new Date(2024, 1, 29)) === 4);

// nombre y fecha
ok('nombre: limpia símbolos y recorta a 20', A.limpiarNombre('  Ana <b>María</b> 123 ') === 'Ana bMaríab');
ok('nombre: acentos y ñ se conservan', A.limpiarNombre('Íñigo') === 'Íñigo');
ok('nombre: vacío si no queda nada', A.limpiarNombre('1234') === '');
ok('nombre: máximo 20', A.limpiarNombre('a'.repeat(40)).length === 20);
ok('fecha: válida', A.validarNac(2016, 5, hoy) === '2016-05');
ok('fecha: menor de 3 años o futura se rechaza', A.validarNac(2025, 1, hoy) === null && A.validarNac(2030, 1, hoy) === null);

// bandas
ok('bandas: más pequeño, más margen', A.ajustesDe({ nac: '2021-01' }, hoy).tol > A.ajustesDe({ nac: '2016-01' }, hoy).tol);
ok('bandas: mayor de 14 más exigente', A.ajustesDe({ nac: '2010-01' }, hoy).tol < 1);
ok('sin fecha usa una edad media', A.ajustesDe({}, hoy).edad === 10);

// apoyos
const voz = A.ajustesDe({ nac: '2016-01', apoyos: ['voz'] }, hoy);
ok('voz: banda ancha, sin tiempo y globo largo', voz.bandaVoz > 1 && voz.sinTiempo && voz.globoLargo && voz.sensibilidadMic < 1);
const calma = A.ajustesDe({ nac: '2016-01', apoyos: ['sensorial'] }, hoy);
ok('sensorial: calma, sin destellos, volumen bajo', calma.calma && calma.sinDestellos && calma.volumen < 1 && !calma.vibrar);
const leer = A.ajustesDe({ nac: '2016-01', apoyos: ['leer'] }, hoy);
ok('leer: texto grande, voz alta, minúsculas', leer.escala >= 1.3 && leer.leerVoz && leer.minusculas && leer.interlineado >= 1.5);
const manos = A.ajustesDe({ nac: '2016-01', apoyos: ['manos'] }, hoy);
ok('manos: botones grandes, más margen, sin inclinación por defecto', manos.toquesGrandes && manos.masMenos && manos.sensorInclinacion === false && manos.tol > A.ajustesDe({ nac: '2016-01' }, hoy).tol);
ok('oír: equivalente visual del sonido', A.ajustesDe({ apoyos: ['oir'] }, hoy).visualSonido);
ok('ver: contraste y símbolos', A.ajustesDe({ apoyos: ['ver'] }, hoy).contraste && A.ajustesDe({ apoyos: ['ver'] }, hoy).simbolos);
ok('apoyos desconocidos se descartan', A.ajustesDe({ apoyos: ['x', 'voz', 'voz'] }, hoy).apoyos.length === 1);
ok('extras: escala acotada a 1–1,6', A.ajustesDe({ extras: { escala: 9 } }, hoy).escala === 1.6 && A.ajustesDe({ extras: { escala: 0.1 } }, hoy).escala === 1);
ok('calma implica sin destellos', A.ajustesDe({ extras: { calma: true } }, hoy).sinDestellos);
ok('resumen nunca está vacío', A.resumen(A.ajustesDe({ nac: '2016-01' }, hoy)).length >= 1);

// dinámica
let d = A.dinamicoInicial();
d = A.ajusteDinamico(d, false); d = A.ajusteDinamico(d, false);
ok('dinámica: 2 fallos aún no cambian nada', d.mult === 1 && !d.pista);
d = A.ajusteDinamico(d, false);
ok('dinámica: 3 fallos suben el margen un 25 % y piden pista', d.mult === 1.25 && d.pista);
for (let i = 0; i < 12; i++) d = A.ajusteDinamico(d, false);
ok('dinámica: tope ×2 (nunca imposible)', d.mult <= 2);
d = A.dinamicoInicial();
d = A.ajusteDinamico(d, true); d = A.ajusteDinamico(d, true);
ok('dinámica: nunca baja de la base', d.mult === 1);
d = { fallos: 0, aciertos: 0, mult: 1.5, pista: false };
d = A.ajusteDinamico(d, true); d = A.ajusteDinamico(d, true);
ok('dinámica: 2 aciertos seguidos bajan el margen un 10 %', Math.abs(d.mult - 1.35) < 1e-9, d.mult);
ok('tolerancia efectiva = base × dinámica', Math.abs(A.tolEfectiva({ tol: 1.4 }, { mult: 1.25 }) - 1.75) < 1e-9);

console.log(fallos ? '\n' + fallos + ' prueba(s) fallaron' : '\nTodas las pruebas pasan');
process.exit(fallos ? 1 : 0);
