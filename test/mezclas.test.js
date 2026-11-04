const M = require('../js/mezclas.js');
let fallos = 0;
const ok = (nombre, cond, detalle) => { if (!cond) fallos++; console.log((cond ? 'OK   ' : 'FALLA'), nombre, detalle || ''); };
const cerca = (a, b, tol = 0.05) => Math.abs(a - b) <= tol;
const echar = (v, ...ids) => { const ev = []; ids.forEach((i) => { const r = M.agregar(v, i); v = r.vaso; r.eventos.forEach((e) => ev.push(e.t)); }); return { v, ev, e: M.estado(v) }; };

// pH por fórmula: col + limón = 30 ml, acidez 3 → c = 3/2 = 1,5 → pH = 7 − 2,8·√1,5 = 3,57
let r = echar(M.nuevo(), 'col', 'limon');
ok('col + limón: pH ≈ 3,57 (fórmula a mano)', cerca(r.e.ph, 3.57, 0.06), r.e.ph);
ok('con ácido el jugo de col se ve rosado (rojo alto, verde bajo) y el vaso lo dice', r.e.color[0] > 150 && r.e.color[1] < 140 && r.e.clase === 'ácido', JSON.stringify(r.e.color));
ok('avisa del color ácido', r.ev.indexOf('color-acido') >= 0);
// agua + col sola es morada y neutra
r = echar(M.nuevo(), 'col', 'agua');
ok('col con agua: pH 7 y neutro', r.e.ph === 7 && r.e.clase === 'neutro');
// bicarbonato: col + bicarbonato: base 2, 15+15 ml?? col 15 ml, bicarbonato (polvo): c = 2/1 = 2 → 7 + 0,92·√2 = 8,30
r = echar(M.nuevo(), 'col', 'bicarbonato');
ok('col + bicarbonato: pH ≈ 8,3 y azulado', cerca(r.e.ph, 8.3, 0.05) && r.e.color[2] > r.e.color[0] && r.e.clase === 'base', r.e.ph + ' ' + JSON.stringify(r.e.color));
ok('avisa del color base', r.ev.indexOf('color-base') >= 0);
// sin indicador no se ve el pH
r = echar(M.nuevo(), 'agua', 'limon');
ok('sin jugo de col el pH no se ve (hace falta un indicador)', r.e.ph === null && r.e.clase === null && r.e.phReal < 7);
// ácido + bicarbonato: burbujas y se neutraliza (3 − 2 = 1 de ácido sobrante)
r = echar(M.nuevo(), 'col', 'limon', 'bicarbonato');
ok('limón + bicarbonato: hay burbujas', r.ev.indexOf('burbujas') >= 0);
ok('...y queda ácido sobrante 1 (3 − 2)', cerca(r.v.acido, 1, 0.001) && r.v.base === 0, r.v.acido);
r = echar(M.nuevo(), 'col', 'vinagre', 'bicarbonato');
ok('vinagre (2) + bicarbonato (2): se neutraliza del todo → pH 7 y avisa «neutraliza»', r.e.phReal === 7 && r.ev.indexOf('neutraliza') >= 0, r.e.phReal);
ok('el color vuelve al morado (rojo ≈ 122)', Math.abs(r.e.color[0] - 122) < 30, JSON.stringify(r.e.color));
r = echar(M.nuevo(), 'agua', 'bicarbonato');
ok('bicarbonato solo en agua: no hay burbujas', r.ev.indexOf('burbujas') < 0);
// el bicarbonato no se echa en un vaso vacío
r = M.agregar(M.nuevo(), 'bicarbonato');
ok('un polvo en un vaso vacío no se disuelve: se avisa', r.eventos[0].t === 'seco' && M.volumen(r.vaso) === 0);
// aceite: capas
r = echar(M.nuevo(), 'agua', 'aceite');
ok('agua + aceite: dos capas, el aceite arriba', r.e.capas.length === 2 && r.e.capas[0].id === 'aceite' && r.ev.indexOf('capas') >= 0);
// sal: se disuelve hasta saturar (36 g por 100 ml; 100 ml de agua = 6,67 dosis)
let v = M.nuevo(); for (let i = 0; i < 7; i++) v = M.agregar(v, 'agua').vaso;   // 105 ml → caben 37,8 g
let sed = 0; for (let i = 0; i < 6; i++) { v = M.agregar(v, 'sal').vaso; }          // 36 g
ok('36 g de sal en 105 ml se disuelven (cabe hasta 37,8 g)', M.estado(v).sedimento === 0, M.estado(v).sedimento);
v = M.agregar(v, 'sal').vaso;                                                       // 42 g
ok('con 42 g sobra sal en el fondo (≈ 4,2 g)', cerca(M.estado(v).sedimento, 4.2, 0.1), M.estado(v).sedimento);
const rs = M.agregar(v, 'sal'); ok('avisa que está saturado', rs.eventos.some((e) => e.t === 'saturado'));
// sal con jugo de col: no cambia el color
r = echar(M.nuevo(), 'col', 'agua', 'sal');
ok('la sal no cambia el color del jugo de col', r.ev.indexOf('sal-neutra') >= 0 && r.e.phReal === 7);
// azúcar
r = echar(M.nuevo(), 'agua', 'azucar');
ok('el azúcar se disuelve', r.ev.indexOf('disuelve-azucar') >= 0 && r.e.sedimento === 0);
// colorantes: rojo + amarillo = naranja; amarillo + azul = verde; rojo + azul = morado
const col3 = (...ids) => echar(M.nuevo(), 'agua', ...ids);
let n = col3('rojo', 'amarillo'); ok('rojo + amarillo = naranja', n.ev.indexOf('naranja') >= 0 && n.e.color[0] > 200 && n.e.color[2] < 150, JSON.stringify(n.e.color.map(Math.round)));
n = col3('amarillo', 'azul'); ok('amarillo + azul = verde', n.ev.indexOf('verde') >= 0 && n.e.color[1] > n.e.color[0] && n.e.color[1] > n.e.color[2], JSON.stringify(n.e.color.map(Math.round)));
n = col3('rojo', 'azul'); ok('rojo + azul = morado', n.ev.indexOf('morado') >= 0 && n.e.color[0] > n.e.color[1] && n.e.color[2] > n.e.color[1], JSON.stringify(n.e.color.map(Math.round)));
ok('el color de los colorantes es válido (0–255)', n.e.color.every((c) => c >= 0 && c <= 255 && isFinite(c)));
// desborde
v = M.nuevo(); let desb = false; for (let i = 0; i < 20; i++) { const x = M.agregar(v, 'agua'); v = x.vaso; if (x.eventos.some((e) => e.t === 'desborda')) desb = true; }
ok('el vaso nunca pasa de 250 ml y avisa si desborda', desb && M.volumen(v) <= 250.001, M.volumen(v));
// inmutabilidad y robustez
const base = M.nuevo(); M.agregar(base, 'limon');
ok('agregar no modifica el vaso original', M.volumen(base) === 0 && base.limon === 0);
ok('una sustancia desconocida no hace nada', M.agregar(base, 'veneno').eventos.length === 0);
ok('hay 11 sustancias, todas de cocina', M.ORDEN.length === 11 && M.ORDEN.every((id) => M.SUSTANCIAS[id]));
// rendimiento
const t0 = process.hrtime.bigint(); let w = M.nuevo(); for (let i = 0; i < 20000; i++) { w = M.agregar(i % 15 === 0 ? M.nuevo() : w, M.ORDEN[i % M.ORDEN.length]).vaso; M.estado(w); }
const ms = Number(process.hrtime.bigint() - t0) / 1e6 / 20000;
ok('una mezcla y su estado tardan menos de 0,1 ms', ms < 0.1, ms.toFixed(5) + ' ms');

console.log(fallos ? '\n' + fallos + ' prueba(s) fallaron' : '\nTodas las pruebas pasan');
process.exit(fallos ? 1 : 0);
