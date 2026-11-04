const D = require('../js/densidad.js');
let fallos = 0;
const ok = (nombre, cond, detalle) => { if (!cond) fallos++; console.log((cond ? 'OK   ' : 'FALLA'), nombre, detalle || ''); };
const pos = (obj, forma, ids, sal) => D.posicion(obj, forma, D.torre(ids, sal));

ok('densidad del agua salada: 4 cucharaditas = 1,068', D.densidadSalada(4) === 1.068, D.densidadSalada(4));
ok('la sal se acota entre 0 y 15 cucharaditas', D.densidadSalada(-3) === 1 && D.densidadSalada(99) === D.densidadSalada(15));
// el huevo: se hunde en agua dulce y flota con suficiente sal: (1,075 − 1)/0,017 = 4,41 → 4,5
ok('el huevo se hunde en agua', pos('huevo', null, ['agua']).tipo === 'hunde');
ok('el huevo necesita unas 4,5 cucharaditas para flotar (fórmula a mano)', D.cucharaditasParaFlotar('huevo') === 4.5, D.cucharaditasParaFlotar('huevo'));
ok('con 4 cucharaditas todavía se hunde y con 5 flota', pos('huevo', null, ['salada'], 4).tipo === 'hunde' && pos('huevo', null, ['salada'], 5).tipo === 'flota');
ok('la uva necesita ≈ 3,6 cucharaditas', D.cucharaditasParaFlotar('uva') === 3.6, D.cucharaditasParaFlotar('uva'));
ok('un objeto que ya flota no necesita sal (0)', D.cucharaditasParaFlotar('manzana') === 0 && D.cucharaditasParaFlotar('corcho') === 0);
ok('una moneda no flota ni con el vaso saturado (null)', D.cucharaditasParaFlotar('moneda') === null);
// objetos famosos
ok('la naranja con cáscara flota y pelada se hunde (cáscara con aire)', pos('naranja', null, ['agua']).tipo === 'flota' && pos('naranjaPelada', null, ['agua']).tipo === 'hunde');
ok('la plastilina en bola se hunde y en barquito flota (la forma importa)', pos('plastilina', 'bola', ['agua']).tipo === 'hunde' && pos('plastilina', 'barquito', ['agua']).tipo === 'flota');
ok('la moneda se hunde en todo, incluso en miel', pos('moneda', null, ['agua', 'miel', 'aceite']).tipo === 'hunde');
ok('el hielo flota en agua (0,92 < 1) pero se hunde en aceite', pos('hielo', null, ['agua']).tipo === 'flota' && pos('hielo', null, ['aceite']).tipo === 'hunde');
// torre: aceite arriba, agua, miel abajo
const t = D.torre(['miel', 'aceite', 'agua'], 0);
ok('la torre se ordena de abajo arriba por densidad (miel, agua, aceite)', t.map((c) => c.id).join() === 'miel,agua,aceite');
let p = D.posicion('uva', null, t);
ok('la uva (1,06) queda entre el agua y la miel', p.tipo === 'entre' && p.sobre === 'miel', JSON.stringify(p));
p = D.posicion('corcho', null, t);
ok('el corcho flota sobre el aceite, en la superficie', p.tipo === 'flota' && p.sobre === 'aceite');
p = D.posicion('huevo', null, D.torre(['agua', 'salada', 'aceite'], 6));
ok('huevo en torre agua + agua salada (6 cdtas = 1,102) + aceite: queda entre las dos capas', p.tipo === 'entre', JSON.stringify(p));
ok('objeto o torre desconocidos devuelven null', D.posicion('x', null, t) === null && D.posicion('uva', null, []) === null && D.torre(['zzz']).length === 0);
ok('la densidad de un objeto con forma desconocida usa la base', D.densidadObjeto('plastilina', 'rara') === 1.5 && D.densidadObjeto('huevo') === 1.075);
console.log(fallos ? '\n' + fallos + ' prueba(s) fallaron' : '\nTodas las pruebas pasan');
process.exit(fallos ? 1 : 0);
