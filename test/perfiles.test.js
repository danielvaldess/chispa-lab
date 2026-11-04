const P = require('../js/perfiles.js');
let fallos = 0;
const ok = (nombre, cond, detalle) => { if (!cond) fallos++; console.log((cond ? 'OK   ' : 'FALLA'), nombre, detalle || ''); };
const hoy = new Date(2026, 10, 4);
const falso = (ini = {}) => { const d = Object.assign({}, ini); return { getItem: (k) => (k in d ? d[k] : null), setItem: (k, v) => { d[k] = String(v); }, removeItem: (k) => { delete d[k]; }, _d: d }; };

let al = falso();
let est = P.cargar(al, hoy);
ok('sin datos: lista vacía', est.perfiles.length === 0 && est.activo === null);

let r = P.crear(est, { nombre: '  Ana ', anio: 2018, mes: 3, apoyos: [] }, hoy, al);
ok('crea un perfil sin apoyos', r.ok && r.estado.perfiles.length === 1 && r.perfil.nombre === 'Ana' && r.estado.activo === r.perfil.id);
ok('guarda solo año y mes', r.perfil.nac === '2018-03' && !('dia' in r.perfil));
est = r.estado;

r = P.crear(est, { nombre: 'Luis', anio: 2018, mes: 3, apoyos: ['voz'] }, hoy, al);
ok('menor con apoyos sin adulto: se rechaza', !r.ok && r.error === 'adulto');
r = P.crear(est, { nombre: 'Luis', anio: 2018, mes: 3, apoyos: ['voz'], adulto: true }, hoy, al);
ok('menor con apoyos y adulto: se guarda', r.ok && r.perfil.apoyos[0] === 'voz');
est = r.estado;
r = P.crear(est, { nombre: 'Marta', anio: 2000, mes: 3, apoyos: ['voz'] }, hoy, al);
ok('mayor de edad no necesita adulto', r.ok);
est = r.estado;
r = P.crear(est, { nombre: '', anio: 2018, mes: 3 }, hoy, al);
ok('nombre vacío se rechaza', !r.ok && r.error === 'nombre');
r = P.crear(est, { nombre: 'X', anio: 1800, mes: 3 }, hoy, al);
ok('fecha inválida se rechaza', !r.ok && r.error === 'fecha');
r = P.crear(est, { nombre: 'Cuarto', anio: 2015, mes: 1 }, hoy, al);
est = r.estado;
r = P.crear(est, { nombre: 'Quinto', anio: 2015, mes: 1 }, hoy, al);
ok('máximo 4 perfiles', !r.ok && r.error === 'lleno' && est.perfiles.length === 4);

P.guardar(est, al);
const otra = P.cargar(al, hoy);
ok('persiste y se vuelve a cargar', otra.perfiles.length === 4 && otra.activo === est.activo);

// perfil dañado o manipulado
al = falso({ [P.CLAVE]: JSON.stringify({ activo: 'zz', perfiles: [{ id: 'a', nombre: '<script>', nac: '2016-05', apoyos: ['voz', 'mal'], progreso: { rampa: 3, x: 'no' } }, { id: 'b', nombre: '', nac: '2016-05' }, 7] }) });
est = P.cargar(al, hoy);
ok('normaliza: descarta inválidos y limpia texto', est.perfiles.length === 1 && est.perfiles[0].nombre === 'script' && est.perfiles[0].apoyos.length === 1 && est.perfiles[0].progreso.x === undefined && est.perfiles[0].progreso.rampa === 3);
ok('activo inexistente cae al primero', est.activo === 'a');
al = falso({ [P.CLAVE]: '{roto' });
ok('JSON roto no rompe', P.cargar(al, hoy).perfiles.length === 0);

// migración del progreso anterior
al = falso({ [P.LEGADO]: JSON.stringify({ rampa: 3, rampa_pts: 1144 }) });
r = P.crear(P.cargar(al, hoy), { nombre: 'Ana', anio: 2016, mes: 1 }, hoy, al);
ok('el primer perfil hereda el progreso anterior', r.perfil.progreso.rampa === 3 && r.perfil.progreso.rampa_pts === 1144);
r = P.crear(r.estado, { nombre: 'Beto', anio: 2016, mes: 1 }, hoy, al);
ok('el segundo perfil empieza de cero', Object.keys(r.perfil.progreso).length === 0);

// cambiar apoyos, activar, borrar
est = r.estado;
const idAna = est.perfiles[0].id;
let c = P.cambiarApoyos(est, idAna, ['ver'], false, hoy);
ok('cambiar apoyos de un menor exige adulto', !c.ok && c.error === 'adulto');
c = P.cambiarApoyos(est, idAna, ['ver'], true, hoy);
ok('con adulto cambia apoyos', c.ok && c.estado.perfiles[0].apoyos[0] === 'ver');
ok('activar cambia el jugador', P.actual(P.activar(est, idAna)).id === idAna);
const sin = P.borrar(est, est.activo);
ok('borrar el activo elige otro', sin.perfiles.length === 1 && sin.activo === sin.perfiles[0].id);
const todo = P.borrarTodo(al);
ok('borrar todo quita las claves', todo && al.getItem(P.CLAVE) === null && al.getItem(P.LEGADO) === null);

// sesiones de voz
let p = est.perfiles[0];
P.registrarSesionVoz(p, { max: 4.26, hzMin: 180.2, hzMax: 320.8 }, hoy);
ok('registra una sesión redondeada', p.sesionesVoz[0].max === 4.3 && p.sesionesVoz[0].hzMax === 321);
for (let i = 0; i < 80; i++) P.registrarSesionVoz(p, { max: 1, hzMin: 0, hzMax: 0 }, hoy);
ok('guarda como máximo 60 sesiones', p.sesionesVoz.length === 60);
ok('el resumen aclara que no es un diagnóstico', /no un diagnóstico/.test(P.resumenSesiones(p)));

// aprendizaje
let q = P.crear(P.cargar(falso(), hoy), { nombre: 'Lia', anio: 2016, mes: 1 }, hoy, falso()).perfil;
P.registrarPartida(q, 'rampa', { predOk: false, estrellas: 2, seg: 120 });
P.registrarPartida(q, 'rampa', { predOk: true, estrellas: 3, seg: 90 });
P.registrarPartida(q, 'pendulo', { predOk: true, estrellas: 1, seg: 200 });
ok('aprendizaje: acumula partidas, aciertos y tiempo', q.aprendizaje.rampa.partidas === 2 && q.aprendizaje.rampa.predOk === 1 && q.aprendizaje.rampa.seg === 210);
ok('aprendizaje: guarda las mejores estrellas', q.aprendizaje.rampa.estrellas === 3);
const rs = P.resumenAprendizaje(q);
ok('resumen: lista los niveles jugados y suma minutos', rs.filas.length === 2 && rs.minutosTotal === 7, rs.minutosTotal);
ok('resumen: la idea más difícil es la que menos acierta', rs.masDificil === 'rampa');
P.registrarPartida(q, 'nivel-raro', { predOk: true, estrellas: 3, seg: 10 });
ok('aprendizaje: ignora niveles desconocidos', !q.aprendizaje['nivel-raro']);
P.registrarPartida(q, 'luz', { predOk: true, estrellas: 99, seg: 99999 });
ok('aprendizaje: acota estrellas y tiempo', q.aprendizaje.luz.estrellas === 3 && q.aprendizaje.luz.seg <= 3600);
const solo = P.crear(P.cargar(falso(), hoy), { nombre: 'Ana', anio: 2016, mes: 1 }, hoy, falso()).perfil;
P.registrarPartida(solo, 'voz', { predOk: true, estrellas: 3, seg: 60 });
ok('resumen: si acertó todo no marca ninguna idea difícil', P.resumenAprendizaje(solo).masDificil === null);
al = falso({ [P.CLAVE]: JSON.stringify({ activo: 'a', perfiles: [{ id: 'a', nombre: 'Ana', nac: '2016-05', aprendizaje: { rampa: { partidas: 3, predOk: 9, seg: -5, estrellas: 8 }, voz: 'x', globo: { partidas: 0 } } }] }) });
const raro = P.cargar(al, hoy).perfiles[0].aprendizaje;
ok('aprendizaje: normaliza datos corruptos', raro.rampa.predOk === 3 && raro.rampa.estrellas === 3 && !raro.voz && !raro.globo);

console.log(fallos ? '\n' + fallos + ' prueba(s) fallaron' : '\nTodas las pruebas pasan');
process.exit(fallos ? 1 : 0);
