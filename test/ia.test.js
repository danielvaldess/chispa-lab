const DG = require('../js/diagnostico.js');
const BD = require('../js/bandido.js');
const PI = require('../js/pistas.js');
const P = require('../js/perfiles.js');
let fallos = 0;
const ok = (nombre, cond, detalle) => { if (!cond) fallos++; console.log((cond ? 'OK   ' : 'FALLA'), nombre, detalle || ''); };
const cerca = (a, b, tol = 0.002) => Math.abs(a - b) <= tol;
const suma = (o) => Object.keys(o).reduce((t, k) => t + o[k], 0);
// generador pseudoaleatorio con semilla (para que las pruebas sean repetibles)
const semilla = (s) => () => { s = (s * 1664525 + 1013904223) % 4294967296; return (s + 1) / 4294967298; };

// ---------- Diagnóstico: cálculo a mano ----------
// prior de la rampa: ok .4, y .3 por idea. «mitad» una vez: ok .04, proporcional .21, no-importa .045 → total .295
let e = DG.observar(DG.nuevo('rampa'), 'rampa', 'mitad');
ok('rampa, «mitad»: entiende ≈ 0,136', cerca(e.post.ok, 0.04 / 0.295), e.post.ok);
ok('rampa, «mitad»: proporcional ≈ 0,712', cerca(e.post['rampa-proporcional'], 0.21 / 0.295), e.post['rampa-proporcional']);
ok('rampa, «mitad»: no-importa ≈ 0,153', cerca(e.post['rampa-no-importa'], 0.045 / 0.295), e.post['rampa-no-importa']);
ok('las probabilidades suman 1', cerca(suma(e.post), 1, 0.01), suma(e.post));
ok('cuenta las respuestas', e.n === 1);
const pr = DG.probable(e);
ok('detecta la idea errónea probable', pr && pr.idea === 'rampa-proporcional' && pr.p > 0.7, JSON.stringify(pr));
ok('el estado original no se modifica', DG.nuevo('rampa').n === 0 && DG.observar(DG.nuevo('rampa'), 'rampa', 'mitad').n === 1);

// acertar sube «entiende»
e = DG.nuevo('rampa'); const antes = e.post.ok;
e = DG.observar(e, 'rampa', 'menos');
// ok .4*.8=.32, y cada idea errónea .3*.15=.045 → total .41 → .32/.41 ≈ 0,78
ok('acertar sube la probabilidad de entender (≈ 0,78)', e.post.ok > antes && cerca(e.post.ok, 0.32 / 0.41), e.post.ok);
ok('si entiende, no hay idea errónea probable', DG.probable(e) === null);
// la misma idea errónea repetida refuerza; acertar después la baja
let r = DG.nuevo('rampa'); for (let i = 0; i < 3; i++) r = DG.observar(r, 'rampa', 'mitad');
ok('repetir la misma respuesta errónea refuerza la idea (> 0,95)', r.post['rampa-proporcional'] > 0.95, r.post['rampa-proporcional']);
const luegoOk = DG.observar(r, 'rampa', 'menos');
ok('acertar después baja la idea errónea', luegoOk.post['rampa-proporcional'] < r.post['rampa-proporcional']);
// opción desconocida
ok('una opción desconocida no cambia nada', JSON.stringify(DG.observar(DG.nuevo('voz'), 'voz', 'zzz').post) === JSON.stringify(DG.nuevo('voz').post));
ok('un juego desconocido no rompe', DG.observar(null, 'no-existe', 'x').n === 0);
// todos los juegos: la verosimilitud suma 1 por hipótesis
Object.keys(DG.CATALOGO).forEach((id) => {
  const c = DG.CATALOGO[id], ops = Object.keys(c.ideas).concat([c.ok]);
  [DG.OK].concat(DG.ideasDe(id)).forEach((h) => {
    const s = ops.reduce((t, o) => t + DG.verosimilitud(id, h, o), 0);
    ok('verosimilitud suma 1 en ' + id + ' / ' + h, cerca(s, 1, 0.001), s);
  });
});
// textos para cada idea
Object.keys(DG.CATALOGO).forEach((id) => DG.ideasDe(id).forEach((i) => ok('hay texto para la idea ' + i, DG.texto(i).length > 10)));
// normalizar datos raros
ok('normalizar descarta basura', DG.normalizar({ n: 'x', post: {} }, 'rampa') === null && DG.normalizar(null, 'rampa') === null && DG.normalizar({ n: 2, post: { ok: 5, falsa: 1 } }, 'noexiste') === null);
const nz = DG.normalizar({ n: 3, post: { ok: 0.2, 'rampa-proporcional': 0.6, 'rampa-no-importa': 0.2, colado: 9 } }, 'rampa');
ok('normalizar ignora hipótesis desconocidas y suma 1', nz && !('colado' in nz.post) && cerca(suma(nz.post), 1, 0.01));

// ---------- Bandido ----------
let b = BD.nuevo();
ok('el bandido empieza sin preferencia', b.directo.a === 1 && b.socratico.b === 1);
ok('premiar suma un éxito', BD.premiar(b, 'directo', true).directo.a === 2 && BD.premiar(b, 'directo', false).directo.b === 2);
ok('premiar no modifica el original', b.directo.a === 1);
ok('un brazo desconocido no cambia nada', BD.premiar(b, 'otro', true).directo.a === 1);
const rnd = semilla(7);
for (let i = 0; i < 200; i++) { const m = BD.beta(2, 5, rnd); if (!(m > 0 && m < 1)) { ok('beta en (0,1)', false, m); break; } }
let media = 0; for (let i = 0; i < 4000; i++) media += BD.beta(2, 5, rnd); media /= 4000;
ok('la media de Beta(2,5) ≈ 2/7', cerca(media, 2 / 7, 0.02), media);
// el brazo que funciona mejor termina elegido casi siempre
let est = BD.nuevo(); const g = semilla(11); let eleg = 0;
for (let i = 0; i < 300; i++) {
  const br = BD.elegir(est, g);
  const exito = br === 'socratico' ? g() < 0.8 : g() < 0.3; // en este niño, preguntar primero funciona mejor
  est = BD.premiar(est, br, exito);
  if (i >= 200 && br === 'socratico') eleg++;
}
ok('el bandido aprende cuál estilo funciona mejor en este niño (> 80 % en las últimas 100)', eleg > 80, eleg + ' de 100');
ok('los éxitos acumulados se acotan (sigue adaptándose)', est.directo.a + est.directo.b <= 41 && est.socratico.a + est.socratico.b <= 41);
ok('normalizar el bandido ignora basura', BD.normalizar({ directo: { a: -1, b: 'x' }, ultimo: { rampa: 'raro' } }, ['rampa']).directo.a === 1);

// ---------- Pistas ----------
const dRampa = { th1: 5, th2: 10, t1: 1.5, t2: 1.1 };
let t = PI.crear('rampa', { ok: false, opcion: 'mitad', idea: 'rampa-proporcional', datos: dRampa });
ok('pistas: usa los datos del jugador', t && /5° y 10°/.test(t.pregunta) && /1,5 s a 1,1 s/.test(t.pregunta), t && t.pregunta);
ok('pistas: la pista calcula el cociente', /1,1 ÷ 1,5 = 0,73/.test(t.pista), t.pista);
t = PI.crear('rampa', { ok: false, opcion: 'mitad' });
ok('pistas: sin la idea probable usa la que delata la opción', t && t.clave === 'rampa-proporcional');
t = PI.crear('rampa', { ok: false, opcion: 'mitad', datos: {} });
ok('pistas: sin datos sigue siendo una frase completa', t && !/NaN|undefined/.test(t.pregunta + t.pista + t.explicacion));
t = PI.crear('rampa', { ok: true, opcion: 'menos', datos: dRampa });
ok('pistas: acertar celebra y plantea otra pregunta', t && t.clave === 'ok' && /¡Bien!/.test(t.pregunta));
t = PI.crear('pendulo', { ok: false, opcion: 'mas', datos: { par: { L: 40, m1: 5, m2: 150, T1: 1.27, T2: 1.28 } } });
ok('pistas del péndulo con la prueba justa', /40 cm/.test(t.pregunta) && /0,01 s/.test(t.pista), t.pregunta + ' | ' + t.pista);
t = PI.crear('voz', { ok: false, opcion: 'baja', datos: { base: 200, f: 400 } });
ok('pistas de la voz: calcula la razón', /400 Hz/.test(t.pregunta) && /2/.test(t.pista), t.pista);
ok('un juego sin plantillas devuelve null', PI.crear('x', { ok: true }) === null);
// toda combinación juego/opción tiene frases completas y cortas
Object.keys(DG.CATALOGO).forEach((id) => {
  const c = DG.CATALOGO[id];
  [c.ok].concat(Object.keys(c.ideas)).forEach((op) => {
    const x = PI.crear(id, { ok: op === c.ok, opcion: op, datos: {} });
    const bien = x && x.pregunta.length > 20 && x.pista.length > 20 && x.explicacion.length > 10 && (x.pregunta + x.pista + x.explicacion).indexOf('undefined') < 0 && x.pregunta.length <= PI.LIMITE;
    ok('pistas completas y cortas: ' + id + ' / ' + op, bien, x ? x.pregunta.length + ' car.' : 'null');
  });
});

// ---------- Perfiles: la IA guarda y aprende ----------
const hoy = new Date(2026, 10, 4);
const mk = () => P.crear(P.cargar({ getItem: () => null, setItem() {}, removeItem() {} }, hoy), { nombre: 'Ana', anio: 2018, mes: 3, apoyos: [] }, hoy, null).perfil;
let perfil = mk();
ok('un perfil nuevo trae la IA vacía', perfil.ia && Object.keys(perfil.ia.diag).length === 0 && perfil.ia.bandido.directo.a === 1);
const g1 = semilla(3);
let res = P.registrarIA(perfil, 'rampa', { opcion: 'mitad', ok: false, estrellas: 1, seg: 40, habil: false, rnd: g1 });
ok('registrarIA devuelve idea y brazo', res && res.idea && res.idea.idea === 'rampa-proporcional' && P.ideasPorReforzar(perfil).length === 1 && ['directo', 'socratico'].indexOf(res.brazo) >= 0);
ok('guarda el intento', perfil.ia.intentos.rampa.length === 1 && perfil.ia.intentos.rampa[0].o === 'mitad' && perfil.ia.intentos.rampa[0].b === res.brazo);
const aAntes = JSON.stringify(perfil.ia.bandido[res.brazo]);
P.registrarIA(perfil, 'rampa', { opcion: 'menos', ok: true, estrellas: 3, seg: 30, habil: true, rnd: g1 });
ok('la siguiente partida del mismo juego premia al brazo usado antes', JSON.stringify(perfil.ia.bandido[res.brazo]) !== aAntes && perfil.ia.bandido[res.brazo].a > JSON.parse(aAntes).a);
for (let i = 0; i < 80; i++) P.registrarIA(perfil, 'pendulo', { opcion: 'igual', ok: true, estrellas: 2, seg: 10, rnd: g1 });
ok('guarda solo los últimos 30 intentos por juego', perfil.ia.intentos.pendulo.length === 30);
perfil.extras.tutor = false;
ok('con la IA apagada no registra nada', P.registrarIA(perfil, 'voz', { opcion: 'baja', ok: false }) === null && !perfil.ia.diag.voz);
perfil.extras.tutor = undefined;
ok('un juego desconocido se ignora', P.registrarIA(perfil, 'zzz', { opcion: 'a' }) === null);
// recarga desde el almacenamiento: sobrevive y se limpia
const copia = P.normalizarIA(JSON.parse(JSON.stringify(perfil.ia)));
ok('la IA sobrevive a guardar y cargar', copia.diag.rampa && copia.intentos.pendulo.length === 30 && copia.bandido.directo.a >= 1);
ok('un perfil viejo sin IA se carga sin romper', P.normalizarIA(undefined).diag && Object.keys(P.normalizarIA('basura').intentos).length === 0);
ok('datos raros se descartan', P.normalizarIA({ diag: { rampa: { n: -3, post: {} } }, intentos: { rampa: [{ o: '' }, 5, { o: 'x', k: 1, e: 99, s: -4, b: 'raro' }] } }).intentos.rampa[0].e === 3);
P.reiniciarMaestria(perfil);
ok('el adulto puede reiniciar todo lo que Chispa sabe', Object.keys(perfil.ia.diag).length === 0 && Object.keys(perfil.ia.intentos).length === 0 && Object.keys(perfil.maestria).length === 0);

console.log(fallos ? '\n' + fallos + ' prueba(s) fallaron' : '\nTodas las pruebas pasan');
process.exit(fallos ? 1 : 0);
