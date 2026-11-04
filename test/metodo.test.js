const M = require('../js/metodo.js');
let fallos = 0;
const ok = (nombre, cond, detalle) => { if (!cond) fallos++; console.log((cond ? 'OK   ' : 'FALLA'), nombre, detalle || ''); };
const cerca = (a, b, tol = 0.001) => Math.abs(a - b) <= tol;

// Hipótesis
ok('arma la frase con las tres casillas', M.hipotesis({ cambio: 'el largo del hilo', entonces: 'el péndulo tardará más', porque: 'recorre más camino' }) === 'Si cambio el largo del hilo, entonces el péndulo tardará más porque recorre más camino.');
ok('con una casilla vacía no hay hipótesis', M.hipotesis({ cambio: 'x', entonces: 'y' }) === '' && M.hipotesis() === '');
const h = M.hipotesis({ cambio: ' <b>a</b>  b ', entonces: 'c', porque: 'd' });
ok('quita « < » y « > » y los espacios de más', h === 'Si cambio ba/b b, entonces c porque d.', h);
ok('recorta los textos largos a 140 caracteres', M.limpiarTexto('a'.repeat(500)).length === 140);

// Prueba justa
const claves = ['largo', 'objeto', 'angulo'];
const justa = [{ largo: 25, objeto: 'moneda', angulo: 'poco' }, { largo: 50, objeto: 'moneda', angulo: 'poco' }, { largo: 100, objeto: 'moneda', angulo: 'poco' }];
ok('solo cambia el largo → prueba justa', M.esPruebaJusta(justa, claves, 'largo') && M.variablesQueCambian(justa, claves).join() === 'largo');
const injusta = [{ largo: 25, objeto: 'moneda', angulo: 'poco' }, { largo: 50, objeto: 'llaves', angulo: 'poco' }];
ok('cambian el largo y el objeto → no es prueba justa', !M.esPruebaJusta(injusta, claves, 'largo') && M.variablesQueCambian(injusta, claves).join() === 'largo,objeto');
ok('con una sola corrida no hay prueba justa', !M.esPruebaJusta([justa[0]], claves, 'largo'));
ok('si no cambia nada tampoco', !M.esPruebaJusta([justa[0], justa[0]], claves, 'largo'));

// Datos: cálculos a mano. [2, 4, 4, 4, 5, 5, 7, 9]: media 5, suma de cuadrados 32, desv. muestral = √(32/7) = 2,138
const v = [2, 4, 4, 4, 5, 5, 7, 9];
ok('promedio = 5', cerca(M.promedio(v), 5));
ok('desviación de la muestra ≈ 2,138', cerca(M.desviacion(v), Math.sqrt(32 / 7)), M.desviacion(v));
ok('una sola medida no tiene dispersión', M.desviacion([3]) === null && M.promedio([]) === null);
const rs = M.resumen([1.9, 2.0, 2.1]);
ok('resumen: n, media, mín. y máx.', rs.n === 3 && cerca(rs.media, 2) && rs.min === 1.9 && rs.max === 2.1 && cerca(rs.desv, 0.1));
ok('el resumen ignora lo que no es número', M.resumen(['a', 2, NaN]).n === 1 && M.resumen(['a']) === null);
ok('medidas parecidas (desv/media ≤ 10 %)', M.sonParecidas([1.9, 2.0, 2.1]) === true && M.sonParecidas([1, 2, 3]) === false && M.sonParecidas([2]) === null);

// Cuaderno
const e1 = M.entrada('hilo', { hipotesis: 'Si cambio el largo…', datos: 'T = 1,0 s', conclusion: 'Más largo, más lento.' }, '2026-11-04');
ok('entrada del cuaderno', e1.n === 'hilo' && e1.f === '2026-11-04' && e1.h && e1.d && e1.c);
let lista = [];
for (let i = 0; i < 30; i++) lista = M.agregar(lista, M.entrada('hilo', { conclusion: 'c' + i }, '2026-11-04'));
ok('el cuaderno guarda solo las últimas 20 entradas', lista.length === 20 && lista[19].c === 'c29' && lista[0].c === 'c10');
ok('agregar no modifica la lista original', M.agregar([], e1).length === 1 && lista.length === 20);
const n = M.normalizarCuaderno([e1, null, 5, { n: '', c: 'x' }, { n: 'zzz', c: 'x' }, { n: 'hilo' }], ['hilo', 'col']);
ok('normalizar descarta basura, juegos desconocidos y entradas vacías', n.length === 1 && n[0].n === 'hilo');
ok('texto de la entrada', M.textoEntrada(e1, 'El péndulo de hilo').split('\n').length === 4);

console.log(fallos ? '\n' + fallos + ' prueba(s) fallaron' : '\nTodas las pruebas pasan');
process.exit(fallos ? 1 : 0);
