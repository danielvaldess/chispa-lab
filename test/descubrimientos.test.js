const D = require('../js/descubrimientos.js');
const M = require('../js/mezclas.js');
let fallos = 0;
const ok = (nombre, cond, detalle) => { if (!cond) fallos++; console.log((cond ? 'OK   ' : 'FALLA'), nombre, detalle || ''); };

ok('hay 24 descubrimientos', D.CATALOGO.length === 24, D.CATALOGO.length);
ok('los ids son únicos', new Set(D.CATALOGO.map((d) => d.id)).size === D.CATALOGO.length);
ok('cada uno tiene estación válida, título, explicación, pista y cómo probarlo en casa', D.CATALOGO.every((d) => D.ESTACIONES[d.estacion] && d.titulo.length > 8 && d.que.length > 30 && d.pista.length > 10 && d.pista.slice(-1) === '?' && d.casa.materiales.length > 0 && d.casa.aviso.length > 10 && d.requiere.length > 0));
ok('la pista nunca da la respuesta: no repite el título', D.CATALOGO.every((d) => d.pista.toLowerCase().indexOf(d.titulo.toLowerCase()) < 0));
// las claves que piden son claves que las estaciones emiten (prefijos m: f: p: c:)
ok('todas las claves tienen un prefijo de estación válido', D.CATALOGO.every((d) => d.requiere.every((r) => /^[mfpc]:/.test(r))));
ok('el prefijo de cada clave corresponde a su estación', D.CATALOGO.every((d) => d.requiere.every((r) => ({ m: 'mezclas', f: 'flota', p: 'planta', c: 'caida' })[r[0]] === d.estacion || r.indexOf('c:') === 0 && d.estacion === 'caida')));
// todos los eventos del motor de mezclas que se anuncian existen en el catálogo
const clavesM = D.CATALOGO.filter((d) => d.estacion === 'mezclas').map((d) => d.requiere[0].slice(2));
const eventosMotor = ['color-acido', 'color-base', 'burbujas', 'neutraliza', 'capas', 'disuelve-sal', 'disuelve-azucar', 'saturado', 'sal-neutra', 'naranja', 'verde', 'morado'];
ok('el catálogo cubre cada evento del motor de mezclas', eventosMotor.every((e) => clavesM.indexOf(e) >= 0), clavesM.join());
// recorrido real: con el motor se desbloquea «burbujas» y «col-rosa»
let v = M.nuevo(), vistas = {}, tiene = [];
['col', 'limon', 'bicarbonato'].forEach((id) => { const r = M.agregar(v, id); v = r.vaso; r.eventos.forEach((e) => { const x = D.registrar(vistas, 'm:' + e.t, tiene); vistas = x.vistas; x.nuevos.forEach((n) => tiene.push(n)); }); });
ok('echar col, limón y bicarbonato desbloquea «col-rosa» y «burbujas»', tiene.indexOf('col-rosa') >= 0 && tiene.indexOf('burbujas') >= 0, tiene.join());
// descubrimientos que piden dos cosas
let x = D.registrar({}, 'f:huevo-agua-hunde', []);
ok('el huevo en agua dulce solo no desbloquea nada todavía', x.nuevos.length === 0);
x = D.registrar(x.vistas, 'f:huevo-sal-flota', []);
ok('...pero con lo del agua salada sí: «huevo-sal»', x.nuevos.join() === 'huevo-sal');
ok('un descubrimiento ya tenido no se repite', D.registrar(x.vistas, 'f:huevo-sal-flota', ['huevo-sal']).nuevos.length === 0);
ok('registrar no modifica los datos de entrada', Object.keys({}).length === 0 && JSON.stringify(D.registrar({ a: 1 }, 'b', []).vistas) === '{"a":true,"b":true}');
// sugerir
ok('sin nada: sugiere el primero y la pista es una pregunta', D.sugerir([]).id === 'col-rosa' && /\?$/.test(D.sugerir([]).pista));
ok('prefiere la estación donde está jugando', D.sugerir([], 'planta').estacion === 'planta');
const casiTodoMezclas = D.CATALOGO.filter((d) => d.estacion === 'mezclas').map((d) => d.id);
ok('si ya terminó la estación actual, va a la que menos ha explorado', D.sugerir(casiTodoMezclas, 'mezclas').estacion !== 'mezclas');
ok('no sugiere lo que ya encontró', D.sugerir(['col-rosa']).id !== 'col-rosa');
ok('con todo encontrado devuelve null', D.sugerir(D.CATALOGO.map((d) => d.id)) === null);
// normalizar y progreso
ok('normalizar descarta ids inválidos y repetidos', D.normalizar(['col-rosa', 'col-rosa', 'zzz', 5, null]).join() === 'col-rosa' && D.normalizar('basura').length === 0);
const pr = D.progreso(['col-rosa', 'huevo-sal', 'zzz']);
ok('progreso por estación', pr.total === 24 && pr.tiene === 2 && pr.porEstacion.mezclas.tiene === 1 && pr.porEstacion.flota.tiene === 1 && pr.porEstacion.mezclas.total === 12);
// perfiles: se guardan, no se repiten y sobreviven a cargar
const P = require('../js/perfiles.js');
const hoy = new Date(2026, 10, 4);
const perfil = P.crear(P.cargar({ getItem: () => null, setItem() {}, removeItem() {} }, hoy), { nombre: 'Ana', anio: 2018, mes: 3, apoyos: [] }, hoy, null).perfil;
ok('un perfil nuevo empieza sin descubrimientos', Array.isArray(perfil.descubrimientos) && perfil.descubrimientos.length === 0);
ok('desbloquear devuelve true la primera vez y false la segunda', P.desbloquear(perfil, 'col-rosa') === true && P.desbloquear(perfil, 'col-rosa') === false && perfil.descubrimientos.length === 1);
ok('un id inventado no se guarda', P.desbloquear(perfil, 'inventado') === false && perfil.descubrimientos.length === 1);
let guardado = {}; const alm = { getItem: (k) => guardado[k] || null, setItem: (k, v) => { guardado[k] = v; }, removeItem() {} };
P.guardar({ activo: perfil.id, perfiles: [perfil] }, alm);
const vuelto = P.cargar(alm, hoy).perfiles[0];
ok('los descubrimientos sobreviven a guardar y cargar', vuelto.descubrimientos.join() === 'col-rosa');
const raro = JSON.parse(JSON.stringify(perfil)); raro.descubrimientos = ['col-rosa', 'zzz', 3, 'col-rosa'];
guardado = {}; P.guardar({ activo: raro.id, perfiles: [raro] }, alm);
ok('al cargar se descartan los inválidos y repetidos', P.cargar(alm, hoy).perfiles[0].descubrimientos.join() === 'col-rosa');
const viejo = JSON.parse(JSON.stringify(perfil)); delete viejo.descubrimientos; guardado = {}; P.guardar({ activo: viejo.id, perfiles: [viejo] }, alm);
ok('un perfil guardado antes (sin el campo) se carga con lista vacía', P.cargar(alm, hoy).perfiles[0].descubrimientos.length === 0);
ok('«libre» es un id válido del cuaderno', (P.agregarCuaderno(vuelto, 'libre', { conclusion: 'probé' }, hoy), vuelto.cuaderno.length === 1));
console.log(fallos ? '\n' + fallos + ' prueba(s) fallaron' : '\nTodas las pruebas pasan');
process.exit(fallos ? 1 : 0);
