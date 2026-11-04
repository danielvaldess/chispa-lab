const F = require('../js/fisica.js');
let fallos = 0;
const ok = (nombre, cond, detalle) => { if (!cond) fallos++; console.log((cond ? 'OK   ' : 'FALLA'), nombre, detalle || ''); };
const cerca = (a, b, rel) => Math.abs(a - b) <= rel * Math.abs(b);
const O = F.OBJETOS_CAIDA, P = F.PLANETAS, H = 10;

// Sin aire, el tiempo es √(2h/g) para cualquier objeto (Galileo)
const teor = (g) => Math.sqrt(2 * H / g);
ok('en el vacío en la Tierra: t ≈ √(2·10/9,81) = 1,428 s', cerca(F.tiempoCaida(O.bola, H, 9.81, 0), teor(9.81), 0.005), F.tiempoCaida(O.bola, H, 9.81, 0));
ok('en la Luna (g = 1,62) tarda √(2·10/1,62) = 3,513 s', cerca(F.tiempoCaida(O.martillo, H, P.luna.g, P.luna.aire), teor(1.62), 0.005), F.tiempoCaida(O.martillo, H, P.luna.g, P.luna.aire));
const tm = F.tiempoCaida(O.martillo, H, P.luna.g, P.luna.aire), tp = F.tiempoCaida(O.pluma, H, P.luna.g, P.luna.aire);
ok('en la Luna el martillo y la pluma llegan a la vez (diferencia < 0,1 %)', Math.abs(tm - tp) / tm < 0.001, tm + ' / ' + tp);
ok('en la cámara sin aire (Tierra, aire 0) también caen a la vez', Math.abs(F.tiempoCaida(O.pluma, H, 9.81, 0) - F.tiempoCaida(O.martillo, H, 9.81, 0)) < 0.002);
// En la Tierra con aire
const tb = F.tiempoCaida(O.bola, H, 9.81, 1), tpl = F.tiempoCaida(O.pluma, H, 9.81, 1);
ok('en la Tierra la bola casi no nota el aire (< 1 % más lenta que en el vacío)', cerca(tb, teor(9.81), 0.01), tb);
ok('en la Tierra la pluma tarda mucho más que la bola (más de 5 veces)', tpl > 5 * tb, tpl.toFixed(2) + ' s vs ' + tb.toFixed(2) + ' s');
ok('la pluma cae casi a su velocidad terminal (~1 m/s): 10 m en ≈ 10 s', tpl > 9 && tpl < 11.5, tpl.toFixed(2));
ok('el papel arrugado cae más rápido que el papel plano', F.tiempoCaida(O.papelBola, H, 9.81, 1) < F.tiempoCaida(O.papel, H, 9.81, 1) / 3);
// Marte: poco aire: la pluma se acerca a caer como la bola pero no del todo
const tpm = F.tiempoCaida(O.pluma, H, P.marte.g, P.marte.aire), tbm = F.tiempoCaida(O.bola, H, P.marte.g, P.marte.aire);
ok('en Marte (aire muy tenue) la pluma tarda más que la bola, pero mucho menos que en la Tierra', tpm > tbm && tpm < tpl / 1.5, tpm.toFixed(2) + ' vs ' + tbm.toFixed(2));
ok('menos gravedad = más tiempo (Luna > Marte > Tierra, sin aire)', F.tiempoCaida(O.bola, H, 1.62, 0) > F.tiempoCaida(O.bola, H, 3.71, 0) && F.tiempoCaida(O.bola, H, 3.71, 0) > F.tiempoCaida(O.bola, H, 9.81, 0));
ok('la velocidad no supera la terminal', (() => { let e = { y: 0, v: 0 }; for (let i = 0; i < 40000; i++) e = F.pasoCaida(e, O.pluma, 9.81, 1, 0.001); return e.v <= O.pluma.vt * 1.001; })());
console.log(fallos ? '\n' + fallos + ' prueba(s) fallaron' : '\nTodas las pruebas pasan');
process.exit(fallos ? 1 : 0);
