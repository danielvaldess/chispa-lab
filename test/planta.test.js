const P = require('../js/planta.js');
let fallos = 0;
const ok = (nombre, cond, detalle) => { if (!cond) fallos++; console.log((cond ? 'OK   ' : 'FALLA'), nombre, detalle || ''); };

let p = P.dias(P.nueva(), 10, false, true);
ok('sin agua la semilla no germina, aunque haya luz', p.estado === 'semilla' && p.altura === 0 && p.vivo, JSON.stringify([p.estado, p.altura]));
p = P.dias(P.nueva(), 1, true, true);
ok('un día de agua no basta para germinar', p.estado === 'semilla' && p.diasHumedos === 1);
p = P.dias(P.nueva(), 2, true, true);
ok('con agua germina al segundo día (altura 0,5)', p.estado === 'germino' && p.altura === 0.5);
p = P.dias(P.nueva(), 2, true, false);
ok('con agua germina también a oscuras (la luz no hace falta para germinar)', p.estado === 'germino');
// con agua y luz: crece sana, con tope de 22 cm
const sana = P.dias(P.nueva(), 14, true, true);
ok('con agua y luz a los 14 días está sana y mide entre 8 y 20 cm', sana.estado === 'sana' && sana.altura > 8 && sana.altura < 20 && sana.vivo, sana.altura);
const larga = P.dias(P.nueva(), 60, true, true);
ok('nunca pasa de la altura máxima (22 cm)', larga.altura <= P.ALTURA_MAX && larga.altura > 20, larga.altura);
ok('la altura nunca baja mientras crece', sana.historial.every((h, i) => i === 0 || h >= sana.historial[i - 1]));
// a oscuras: más larga al principio, pálida y se agota
const oscura = P.dias(P.nueva(), 8, true, false);   // 2 días germinando + 6 creciendo a 2 cm
ok('a oscuras crece más rápido que con luz (más alta tras 8 días)', oscura.altura > P.dias(P.nueva(), 8, true, true).altura, oscura.altura + ' vs ' + P.dias(P.nueva(), 8, true, true).altura);
ok('a oscuras está pálida', oscura.estado === 'palida');
const muerta = P.dias(P.nueva(), 20, true, false);
ok('a oscuras se agota y se marchita (8 días de reserva)', !muerta.vivo && muerta.estado === 'marchita', muerta.estado);
ok('una planta marchita ya no cambia de altura', P.dias(muerta, 5, true, true).altura === muerta.altura);
// sin agua después de crecer
let q = P.dias(P.nueva(), 8, true, true);
const h = q.altura; q = P.dias(q, 2, false, true);
ok('2 días sin agua: todavía no se marchita y no crece', q.vivo && q.altura === h);
q = P.dias(q, 1, false, true);
ok('al tercer día sin agua se marchita', !q.vivo && q.estado === 'marchita');
q = P.dias(P.dias(P.nueva(), 8, true, true), 2, false, true); q = P.paso(q, true, true);
ok('si vuelve el agua a tiempo, se recupera y sigue creciendo', q.vivo && q.altura > h);
// inmutabilidad
const base = P.nueva(); P.dias(base, 5, true, true);
ok('paso y días no modifican la planta original', base.dia === 0 && base.historial.length === 1);
ok('los textos describen cada estado', ['semilla', 'germino', 'sana', 'palida', 'marchita'].every((e) => P.texto(Object.assign(P.nueva(), { estado: e })).length > 10));
console.log(fallos ? '\n' + fallos + ' prueba(s) fallaron' : '\nTodas las pruebas pasan');
process.exit(fallos ? 1 : 0);
