const TU = require('../js/tutor.js');
let fallos = 0;
const ok = (nombre, cond, detalle) => { if (!cond) fallos++; console.log((cond ? 'OK   ' : 'FALLA'), nombre, detalle || ''); };
const cerca = (a, b, tol = 0.001) => Math.abs(a - b) <= tol;

// Cálculos hechos a mano
// concepto, acierto desde 0,25: posterior = .25*.9 / (.25*.9 + .75*.33) = .47619; + (1-.47619)*.15 = .55476
ok('concepto acertado desde 0,25 ≈ 0,5548', cerca(TU.actualizar(0.25, true, 'concepto'), 0.55476), TU.actualizar(0.25, true, 'concepto'));
// destreza, acierto desde 0,25: .2125/(.2125+.15) = .58621; + .41379*.15 = .64828
ok('destreza lograda desde 0,25 ≈ 0,6483', cerca(TU.actualizar(0.25, true, 'destreza'), 0.64828));
// concepto, fallo desde 0,55: .055/(.055+.45*.67) = .15423; + .84577*.15 = .28110
ok('concepto fallado desde 0,55 ≈ 0,2811', cerca(TU.actualizar(0.55, false, 'concepto'), 0.2811, 0.001), TU.actualizar(0.55, false, 'concepto'));

// Propiedades
let p = TU.P0;
const subidas = [];
for (let i = 0; i < 6; i++) { p = TU.actualizar(p, true, 'concepto'); subidas.push(p); }
ok('los aciertos seguidos suben el dominio (hasta el tope)', subidas.slice(0, 4).every((v, i) => i === 0 || v > subidas[i - 1]) && subidas.every((v, i) => i === 0 || v >= subidas[i - 1]));
ok('el dominio nunca pasa de 0,99', subidas.every((v) => v <= 0.99));
p = 0.5; for (let i = 0; i < 40; i++) p = TU.actualizar(p, false, 'concepto');
ok('los fallos no lo llevan por debajo de 0,01 (y el aprendizaje evita que se hunda a cero)', p >= 0.01 && p < 0.5, p);
ok('un fallo baja el dominio respecto a un acierto', TU.actualizar(0.5, false, 'concepto') < TU.actualizar(0.5, true, 'concepto'));
ok('adivinar la destreza es menos probable que adivinar una predicción de tres opciones', TU.PARAMS.destreza.G < TU.PARAMS.concepto.G);

// Registro de una partida
let e = TU.registrar(undefined, { predOk: true, habil: true });
ok('registrar crea la entrada y cuenta concepto y destreza', e.pn === 1 && e.pok === 1 && e.hn === 1 && e.hok === 1 && e.p > TU.P0, JSON.stringify(e));
e = TU.registrar(e, { predOk: false, habil: false });
ok('registrar acumula los conteos', e.pn === 2 && e.pok === 1 && e.hn === 2 && e.hok === 1);
const sinDestreza = TU.registrar(undefined, { predOk: true, habil: false, ignorarDestreza: true });
ok('con destreza ignorada solo cuenta el concepto', sinDestreza.hn === 0 && cerca(sinDestreza.p, 0.555, 0.002), JSON.stringify(sinDestreza));
ok('la entrada original no se modifica', (() => { const a = TU.nuevo(); TU.registrar(a, { predOk: true, habil: true }); return a.pn === 0 && a.p === 0.25; })());

// Voz
ok('con el apoyo de voz se ignora la destreza en voz y globo', TU.ignorarDestreza('voz', ['voz']) && TU.ignorarDestreza('globo', ['voz', 'ver']));
ok('sin el apoyo de voz no se ignora, ni en otros juegos', !TU.ignorarDestreza('voz', ['ver']) && !TU.ignorarDestreza('rampa', ['voz']) && !TU.ignorarDestreza('voz', undefined));

// Etiquetas
ok('etiquetas por umbrales', TU.etiqueta(0.2) === 'Empezando' && TU.etiqueta(0.4) === 'Avanzando' && TU.etiqueta(0.74) === 'Avanzando' && TU.etiqueta(0.75) === 'Lo domina');

// Recomendación
const ids = ['rampa', 'pendulo', 'voz', 'globo', 'luz', 'burbujas'];
ok('sin datos recomienda el primero', TU.recomendar({}, ids) === 'rampa');
ok('recomienda el jugado con menor dominio', TU.recomendar({ rampa: { p: 0.6, pn: 2 }, pendulo: { p: 0.3, pn: 1 } }, ids) === 'pendulo');
ok('si lo jugado está dominado, recomienda el primero sin jugar', TU.recomendar({ rampa: { p: 0.9, pn: 3 }, pendulo: { p: 0.8, pn: 2 } }, ids) === 'voz');
const todo = {}; ids.forEach((i) => { todo[i] = { p: 0.9, pn: 2 }; });
ok('si todo está dominado no recomienda nada', TU.recomendar(todo, ids) === null);
ok('tolera datos ausentes', TU.recomendar(undefined, ids) === 'rampa');

// Margen inicial
ok('margen inicial: más ayuda si domina poco, algo menos si domina mucho, normal en medio o sin datos',
  TU.margenInicial({ p: 0.2, pn: 2 }) === 1.25 && TU.margenInicial({ p: 0.85, pn: 3 }) === 0.9 && TU.margenInicial({ p: 0.5, pn: 2 }) === 1 && TU.margenInicial(undefined) === 1 && TU.margenInicial({ p: 0.1, pn: 0 }) === 1);

// Explicación
ok('porQue explica con palabras sencillas', /Predijo bien 1 de 2/.test(TU.porQue(e)) && /soltura 1 de 2/.test(TU.porQue(e)) && /Todavía no/.test(TU.porQue(undefined)));

console.log(fallos ? '\n' + fallos + ' prueba(s) fallaron' : '\nTodas las pruebas pasan');
process.exit(fallos ? 1 : 0);
