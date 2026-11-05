// Clase: código del alumno, errores, fusión en la lista del docente, privacidad, roles y QR (se genera y se lee de vuelta).
const C = require('../js/clase.js');
const P = require('../js/perfiles.js');
const qrcode = require('../js/vendor/qrcode.min.js');
const jsQR = require('../js/vendor/jsQR.min.js');
let fallos = 0;
const ok = (nombre, cond, detalle) => { if (!cond) fallos++; console.log((cond ? 'OK   ' : 'FALLA'), nombre, detalle || ''); };
const hoy = new Date(2026, 10, 4);
const AHORA = Date.UTC(2026, 10, 4, 20, 0, 0);
const falso = (ini = {}) => { const d = Object.assign({}, ini); return { getItem: (k) => (k in d ? d[k] : null), setItem: (k, v) => { d[k] = String(v); }, removeItem: (k) => { delete d[k]; }, _d: d }; };

function alumnoDemo(nombre, extra) {
  const r = P.crear({ activo: null, perfiles: [] }, { nombre, anio: 2016, mes: 5, apoyos: ['voz', 'manos'], adulto: true }, hoy, falso());
  const p = r.perfil;
  p.progreso = { rampa: 3, pendulo: 2, voz: 1, hilo: 3, finalVisto: 1 };
  p.aprendizaje = { rampa: { partidas: 4, predOk: 3, seg: 300, estrellas: 3 }, pendulo: { partidas: 5, predOk: 1, seg: 600, estrellas: 2 }, voz: { partidas: 2, predOk: 2, seg: 120, estrellas: 1 } };
  p.descubrimientos = [require('../js/descubrimientos.js').CATALOGO[0].id, require('../js/descubrimientos.js').CATALOGO[5].id];
  p.sesionesVoz = [{ f: '2026-11-03', max: 3, hzMin: 100, hzMax: 200 }];
  Object.assign(p, extra || {});
  return p;
}

// ---------- CRC y formato ----------
ok('CRC-16/CCITT-FALSE de «123456789» = 0x29B1 (valor de referencia)', C.crc16('123456789') === 0x29b1);
const ana = alumnoDemo('Ana');
const cod = C.codigoDe(ana, AHORA);
ok('el código empieza por CL1 y es solo ASCII imprimible', /^CL1\|/.test(cod) && /^[\x21-\x7e]+$/.test(cod), cod);
ok('el código es corto (≤ 110 caracteres) para un QR pequeño', cod.length <= 110, cod.length + ' caracteres');
const lec = C.leer(cod);
ok('ida y vuelta: el docente lee lo que el alumno mostró', lec.ok && lec.alumno.nombre === 'Ana' && lec.alumno.id === ana.id);
ok('estrellas, partidas y aciertos viajan bien', lec.alumno.e[0] === 3 && lec.alumno.e[1] === 2 && lec.alumno.e[6] === 3 && lec.alumno.j[0] === 4 && lec.alumno.k[0] === 3 && lec.alumno.j[1] === 5 && lec.alumno.k[1] === 1);
ok('minutos: (300+600+120)/60 = 17', lec.alumno.min === 17, lec.alumno.min);
ok('el momento del avance se conserva al minuto', lec.alumno.t === Math.floor(AHORA / 60000) * 60000);

const nu = alumnoDemo('Dani Núñez-Ñandú');
const cn = C.codigoDe(nu, AHORA), ln = C.leer(cn);
ok('nombre con espacios, tildes y eñe: el código sigue siendo ASCII', /^[\x21-\x7e]+$/.test(cn));
ok('nombre con tildes vuelve igual', ln.ok && ln.alumno.nombre === 'Dani Núñez-Ñandú', ln.ok && ln.alumno.nombre);
ok('se tolera que el código llegue con saltos de línea o espacios (WhatsApp)', C.leer(cod.replace(/\|/g, '|\n ')).ok);

// ---------- Privacidad ----------
const cuerpo = Object.keys(C.resumirPerfil(ana, AHORA)).sort().join(',');
ok('solo se comparten id, nombre, t, e, j, k, min y d', cuerpo === 'd,e,id,j,k,min,nombre,t', cuerpo);
ok('el código NO trae fecha de nacimiento, apoyos ni voz', !cod.includes('2016') && !/voz|manos|apoyo|hz/i.test(cod.replace(/^CL1\|[^|]*\|/, '')));

// ---------- Errores ----------
const cambiar = (s, i, ch) => s.slice(0, i) + ch + s.slice(i + 1);
ok('un solo carácter cambiado se detecta (CRC)', ['formato', 'crc', 'datos'].includes(C.leer(cambiar(cod, 20, cod[20] === 'a' ? 'b' : 'a')).error) && !C.leer(cambiar(cod, 20, cod[20] === 'a' ? 'b' : 'a')).ok);
let detectados = 0, probados = 0;
for (let i = 4; i < cod.length - 1; i++) { if (cod[i] === '|') continue; const m = cambiar(cod, i, cod[i] === '7' ? '8' : '7'); if (m === cod) continue; probados++; if (!C.leer(m).ok) detectados++; }
ok('cambiar cualquier carácter del código se detecta siempre', detectados === probados, detectados + ' de ' + probados);
ok('texto vacío', C.leer('').error === 'formato');
ok('un QR cualquiera (un enlace) no es de Chispa Lab', C.leer('https://example.com/qr').error === 'formato');
ok('otra versión del formato avisa de la versión', C.leer(cod.replace(/^CL1/, 'CL2')).error === 'version');
ok('código demasiado largo se rechaza', C.leer('CL1|' + 'a'.repeat(400)).error === 'formato');
ok('faltan campos', C.leer('CL1|abc|Ana').error === 'formato');
function conCrc(campos) { const c = campos.join('|'); return c + '|' + C.crc16(c).toString(36); }
const base = cod.split('|');
ok('estrellas fuera de rango con CRC válido: formato', C.leer(conCrc(base.slice(0, 4).concat(['44000000000'], base.slice(5, 9)))).error === 'formato');
ok('id raro con CRC válido: datos', C.leer(conCrc(['CL1', 'a%b', 'Ana'].concat(base.slice(3, 9)))).error === 'datos');
ok('nombre vacío con CRC válido: datos', C.leer(conCrc(['CL1', base[1], ''].concat(base.slice(3, 9)))).error === 'datos');
const exagerado = C.leer(conCrc(base.slice(0, 5).concat(['990000000000', '990000000000'], base.slice(7, 9))));
ok('aciertos no pueden pasar de partidas (se acotan)', exagerado.ok && exagerado.alumno.k.every((k, i) => k <= exagerado.alumno.j[i]));

// ---------- Fusión en la lista del docente ----------
let l = [];
let f = C.fundir(l, lec.alumno); l = f.alumnos;
ok('primer escaneo: nuevo', f.estado === 'nuevo' && l.length === 1);
f = C.fundir(l, lec.alumno);
ok('mismo código otra vez: igual, sin duplicar', f.estado === 'igual' && f.alumnos.length === 1);
const masNuevo = C.leer(C.codigoDe(Object.assign(alumnoDemo('Ana'), { id: ana.id, progreso: { rampa: 3, pendulo: 3, voz: 3 } }), AHORA + 600000)).alumno;
f = C.fundir(l, masNuevo); l = f.alumnos;
ok('avance más nuevo del mismo alumno: actualizado, sin duplicar', f.estado === 'actualizado' && l.length === 1 && l[0].e[1] === 3 && l[0].t === masNuevo.t);
f = C.fundir(l, lec.alumno);
ok('un código viejo no pisa el avance más nuevo', f.estado === 'antiguo' && f.alumnos[0].e[1] === 3);
ok('alumno inválido', C.fundir(l, { id: '!!', nombre: 'x' }).estado === 'invalido');
let grande = [];
for (let i = 0; i < 60; i++) grande = C.fundir(grande, Object.assign({}, lec.alumno, { id: 'x' + i, nombre: 'A' + String(i).padStart(2, '0') })).alumnos;
ok('tope de 60 alumnos', grande.length === 60 && C.fundir(grande, Object.assign({}, lec.alumno, { id: 'otro', nombre: 'Zeta' })).estado === 'lleno');
ok('quitar un alumno', C.quitar(grande, 'x3').length === 59 && !C.quitar(grande, 'x3').some((a) => a.id === 'x3'));
const mezclados = C.normalizarAlumnos([lec.alumno, lec.alumno, { id: '?', nombre: 'mal' }, ln.alumno, null, 5]);
ok('normalizar: sin repetidos ni inválidos y ordenado por nombre', mezclados.length === 2 && mezclados[0].nombre === 'Ana' && mezclados[1].nombre.startsWith('Dani'));

// ---------- Resúmenes ----------
const r = C.resumenAlumno(lec.alumno);
ok('resumen: estrellas 3+2+1 = 6 de 18', r.estrellas === 6 && r.estrellasMax === 18);
ok('resumen: predicciones acertadas (3+1+2)/(4+5+2) = 55 %', r.partidas === 11 && r.acierto === 55, r.acierto);
ok('resumen: le cuesta el péndulo (1 de 5)', r.juegoDificil === 'pendulo', r.juegoDificil);
ok('resumen: dos descubrimientos', r.descubrimientos === 2 && r.descubrimientosMax === C.DESCUBRIMIENTOS);
ok('resumen: fecha de hoy', r.fecha === '2026-11-04', r.fecha);
const sinPartidas = C.resumenAlumno(C.leer(C.codigoDe(alumnoDemo('Sol', { aprendizaje: {}, progreso: {} }), AHORA)).alumno);
ok('alumno sin partidas: sin porcentaje y sin juego difícil', sinPartidas.acierto === null && sinPartidas.juegoDificil === null);
ok('días desde el avance', C.diasDesde(lec.alumno, AHORA) === 0 && C.diasDesde(lec.alumno, AHORA + 3 * 86400000) === 3);
const texto = C.resumenClase(mezclados, AHORA);
ok('resumen de clase con nombres y aviso de que no es evaluación oficial', texto.includes('Ana') && texto.includes('Dani') && texto.includes('no una evaluación oficial'));
ok('resumen de clase vacío', C.resumenClase([], AHORA).includes('Todavía no hay alumnos'));

// ---------- Roles en el almacén ----------
let al = falso();
let est = P.cargar(al, hoy);
let rr = P.crear(est, { nombre: 'Profe Rosa', anio: 1985, mes: 3, rol: 'docente' }, hoy, al);
ok('se crea un perfil docente', rr.ok && rr.perfil.rol === 'docente' && Array.isArray(rr.perfil.alumnos) && P.esDocente(rr.perfil));
est = rr.estado;
rr = P.crear(est, { nombre: 'Luis', anio: 2016, mes: 3 }, hoy, al);
ok('sin rol: estudiante por defecto', rr.ok && rr.perfil.rol === 'estudiante' && !P.esDocente(rr.perfil));
est = rr.estado;
rr = P.crear(est, { nombre: 'Rara', anio: 2016, mes: 3, rol: 'director' }, hoy, al);
ok('un rol inventado se vuelve estudiante', rr.ok && rr.perfil.rol === 'estudiante');
est = rr.estado;
const profe = est.perfiles[0], luis = est.perfiles[1];
ok('un estudiante no puede guardar alumnos', !P.agregarAlumno(luis, lec.alumno).ok && luis.alumnos.length === 0);
ok('un docente guarda alumnos', P.agregarAlumno(profe, lec.alumno).ok && P.agregarAlumno(profe, ln.alumno).ok && profe.alumnos.length === 2);
ok('el mismo alumno dos veces no se duplica', (P.agregarAlumno(profe, lec.alumno), profe.alumnos.length === 2));
P.guardar(est, al);
const vuelto = P.cargar(al, hoy);
ok('los alumnos sobreviven a guardar y cargar', vuelto.perfiles[0].alumnos.length === 2 && vuelto.perfiles[0].alumnos[0].nombre === 'Ana');
ok('el rol sobrevive a guardar y cargar', vuelto.perfiles[0].rol === 'docente' && vuelto.perfiles[1].rol === 'estudiante');
const crudo = JSON.parse(al.getItem(P.CLAVE)); crudo.perfiles[1].alumnos = [lec.alumno]; crudo.perfiles[0].alumnos.push({ id: '!', nombre: 'basura' });
al.setItem(P.CLAVE, JSON.stringify(crudo));
const limpio = P.cargar(al, hoy);
ok('al cargar: un estudiante no conserva alumnos y se descarta la basura', limpio.perfiles[1].alumnos.length === 0 && limpio.perfiles[0].alumnos.length === 2);
const viejo = { activo: 'p1', perfiles: [{ id: 'p1', nombre: 'Viejo', nac: '2016-05', apoyos: [], extras: {}, progreso: {}, aprendizaje: {}, maestria: {} }] };
const al2 = falso({ [P.CLAVE]: JSON.stringify(viejo) });
ok('un perfil guardado antes (sin rol) se carga como estudiante', P.cargar(al2, hoy).perfiles[0].rol === 'estudiante');
ok('quitar un alumno de un docente', P.quitarAlumno(profe, lec.alumno.id).alumnos.length === 1);

// ---------- QR: se genera y se lee de vuelta ----------
function pintar(texto, mod, quiet) {
  const q = qrcode(0, 'M'); q.addData(texto); q.make(); const n = q.getModuleCount(), W = (n + 2 * quiet) * mod;
  const img = new Uint8ClampedArray(W * W * 4).fill(255);
  for (let rr2 = 0; rr2 < n; rr2++) for (let c = 0; c < n; c++) if (q.isDark(rr2, c)) for (let y = 0; y < mod; y++) for (let x = 0; x < mod; x++) { const i = (((rr2 + quiet) * mod + y) * W + (c + quiet) * mod + x) * 4; img[i] = img[i + 1] = img[i + 2] = 0; }
  return { img, W, n };
}
function reducir(o, factor) { // promedio de cajas: imita una cámara de baja resolución
  const W2 = Math.floor(o.W * factor), out = new Uint8ClampedArray(W2 * W2 * 4);
  for (let y = 0; y < W2; y++) for (let x = 0; x < W2; x++) {
    const x0 = Math.floor(x / factor), x1 = Math.max(x0 + 1, Math.floor((x + 1) / factor)), y0 = Math.floor(y / factor), y1 = Math.max(y0 + 1, Math.floor((y + 1) / factor)); let s = 0, c = 0;
    for (let yy = y0; yy < y1 && yy < o.W; yy++) for (let xx = x0; xx < x1 && xx < o.W; xx++) { s += o.img[(yy * o.W + xx) * 4]; c++; }
    const v = s / Math.max(1, c), i = (y * W2 + x) * 4; out[i] = out[i + 1] = out[i + 2] = v; out[i + 3] = 255;
  }
  return { img: out, W: W2 };
}
const codigos = [cod, cn, C.codigoDe(alumnoDemo('X'), AHORA), C.codigoDe(alumnoDemo('Nombre Largo De Veinte', { aprendizaje: { rampa: { partidas: 99, predOk: 99, seg: 6e5, estrellas: 3 }, voz: { partidas: 99, predOk: 50, seg: 6e5, estrellas: 3 } }, progreso: { rampa: 3, pendulo: 3, voz: 3, globo: 3, luz: 3, burbujas: 3, hilo: 3, col: 3, huevo: 3, volcan: 3, libre: 3 } }), AHORA)];
let leidos = 0;
codigos.forEach((c) => { const o = pintar(c, 6, 4); const d = jsQR(o.img, o.W, o.W, { inversionAttempts: 'dontInvert' }); if (d && d.data === c) leidos++; });
ok('el QR se lee de vuelta con el código exacto (4 casos, incluido el nombre más largo y todo al máximo)', leidos === codigos.length, leidos + ' de ' + codigos.length);
const mayor = pintar(codigos[3], 4, 4);
ok('el QR más grande es pequeño: ≤ 45 módulos de lado', mayor.n <= 45, mayor.n + ' módulos (versión ' + ((mayor.n - 17) / 4) + ')');
let pobres = 0, intentos = 0;
codigos.forEach((c) => { const o = pintar(c, 8, 4); [0.5, 0.4, 0.35].forEach((fac) => { const rd = reducir(o, fac); intentos++; const d = jsQR(rd.img, rd.W, rd.W, { inversionAttempts: 'dontInvert' }); if (d && d.data === c) pobres++; }); });
ok('con cámara de baja resolución (≈ 4 a 2,8 píxeles por módulo) se sigue leyendo', pobres >= intentos - 2, pobres + ' de ' + intentos);
const t0 = Date.now(); for (let i = 0; i < 10; i++) { const o = pintar(cod, 5, 4); jsQR(o.img, o.W, o.W, { inversionAttempts: 'dontInvert' }); }
console.log('     (decodificar un cuadro: ' + Math.round((Date.now() - t0) / 10) + ' ms en este equipo)');
ok('un QR de otra app no se confunde con uno de Chispa Lab', (() => { const o = pintar('https://example.com', 6, 4); const d = jsQR(o.img, o.W, o.W, { inversionAttempts: 'dontInvert' }); return d && !C.leer(d.data).ok; })());

console.log(fallos ? '\nHAY FALLOS: ' + fallos : '\nTodas las pruebas pasan');
process.exit(fallos ? 1 : 0);
