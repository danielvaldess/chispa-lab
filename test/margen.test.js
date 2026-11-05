// Margen que aprende cada niño: estimación bayesiana log-normal con prior por edad y meta de ≈ 70 % de aciertos.
const M = require('../js/margen.js');
const AJ = require('../js/ajustes.js');
const AG = require('../js/agrupar.js');
const P = require('../js/perfiles.js');
let fallos = 0;
const ok = (nombre, cond, detalle) => { if (!cond) fallos++; console.log((cond ? 'OK   ' : 'FALLA'), nombre, detalle || ''); };
const hoy = new Date(2026, 10, 4);
const falso = (ini = {}) => { const d = Object.assign({}, ini); return { getItem: (k) => (k in d ? d[k] : null), setItem: (k, v) => { d[k] = String(v); }, removeItem: (k) => { delete d[k]; } }; };

// ---------- piezas ----------
ok('el punto de partida es exactamente la base por edad (×1)', M.mult(M.nuevo()) === 1, M.mult(M.nuevo()));
ok('estado raro o dañado se vuelve un estado nuevo', M.mult({ n: -5, s: 'x', q: NaN }) === 1 && M.normalizar(null).n === 0 && M.normalizar({ n: 1e9, s: 0, q: 0 }).n === 0);
let m = M.nuevo(); for (let i = 0; i < 8; i++) m = M.registrar(m, 3, 1);
ok('si el niño falla siempre por 3 veces la base, el margen sube pero nunca pasa de ×3', M.mult(m) > 1.5 && M.mult(m) <= M.MAX, M.mult(m));
m = M.nuevo(); for (let i = 0; i < 12; i++) m = M.registrar(m, 0.05, 1);
ok('si acierta con muchísima holgura, el margen baja pero nunca de ×0,6', M.mult(m) >= M.MIN && M.mult(m) < 1, M.mult(m));
ok('un error o tolerancia inválidos no cambian nada', M.registrar(M.nuevo(), NaN, 1).n === 0 && M.registrar(M.nuevo(), 1, 0).n === 0 && M.registrar(M.nuevo(), -1, 1).n === 0);
ok('con 1 o 2 intentos pesa más el punto de partida (no se mueve de golpe)', Math.abs(M.mult(M.registrar(M.nuevo(), 5, 1)) - 1) < 0.9);
ok('describir: con pocos intentos dice que está conociendo al niño', /empezando a conocer/.test(M.describir(M.registrar(M.nuevo(), 1, 1))));
ok('describir: con datos explica el ajuste en palabras', /Chispa ajustó el margen a ×/.test(M.describir(m)));

// ---------- simulación: niños de distinta destreza ----------
function normal(r) { let u = 0, v = 0; while (!u) u = r(); while (!v) v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
const DESTREZAS = [0.35, 0.6, 1, 1.6, 2.5, 4];          // error típico / tolerancia base (0,35 muy hábil; 4 le cuesta mucho)
function simular(destreza, semilla, modo) {
  const r = AG.azar(semilla); let est = M.nuevo(), din = AJ.dinamicoInicial(); const res = [];
  for (let i = 0; i < 18; i++) {
    if (i % 3 === 0) din = AJ.dinamicoInicial();            // la regla actual se olvida al terminar cada partida (3 pedidos)
    const mult = modo === 'ml' ? Math.max(M.mult(est), din.mult) : (modo === 'regla' ? din.mult : 1);
    const err = Math.exp(Math.log(destreza) + 0.5 * normal(r)), acierto = err <= mult;
    res.push(acierto ? 1 : 0); est = M.registrar(est, err, 1); din = AJ.ajusteDinamico(din, acierto);
  }
  return res;
}
const SEM = Array.from({ length: 300 }, (_, i) => 1000 + i);
function tasas(modo) {
  return DESTREZAS.map((d) => {
    const ts = SEM.map((s) => { const x = simular(d, s, modo).slice(6); return x.reduce((a, b) => a + b, 0) / x.length; });
    return { d, media: ts.reduce((a, b) => a + b, 0) / ts.length, enBanda: ts.filter((t) => t >= 0.55 && t <= 0.85).length / ts.length };
  });
}
const fija = tasas('fija'), regla = tasas('regla'), ml = tasas('ml');
const fmt = (l) => l.map((x) => Math.round(x.media * 100) + '%').join(' ');
console.log('     acierto medio (intentos 7 a 18) por destreza ' + DESTREZAS.join(' / ') + ':\n       margen fijo   ' + fmt(fija) + '\n       regla actual  ' + fmt(regla) + '\n       aprendido     ' + fmt(ml));
const medio = (l) => l.filter((x) => x.d >= 0.6 && x.d <= 2.5);
ok('con el margen fijo el acierto depende por completo del niño: de ≈ 98 % a ≈ 0 %', fija[0].media > 0.9 && fija[5].media < 0.05);
ok('con el margen aprendido, niños de destreza media o baja aciertan entre 50 % y 90 %', medio(ml).every((x) => x.media >= 0.5 && x.media <= 0.9), medio(ml).map((x) => Math.round(x.media * 100)).join(', '));
const dif = (l) => Math.max.apply(null, medio(l).map((x) => x.media)) - Math.min.apply(null, medio(l).map((x) => x.media));
ok('la diferencia de acierto entre niños de destreza media o baja baja de ≈ 80 puntos (fijo) a menos de 35 (aprendido)', dif(fija) > 0.6 && dif(ml) < 0.35, Math.round(dif(fija) * 100) + ' → ' + Math.round(dif(ml) * 100) + ' puntos');
const banda = (l) => l.reduce((a, x) => a + x.enBanda, 0) / l.length;
ok('más niños quedan en la zona de 55 a 85 % de aciertos que con el margen fijo o con la regla actual (al menos el doble)', banda(ml) >= 2 * banda(fija) && banda(ml) >= 2 * banda(regla), Math.round(banda(fija) * 100) + '% / ' + Math.round(banda(regla) * 100) + '% → ' + Math.round(banda(ml) * 100) + '%');

// ---------- equidad ----------
const brecha = (l) => Math.abs(l.find((x) => x.d === 1).media - l.find((x) => x.d === 2.5).media);
ok('equidad: un niño que necesita 2,5 veces más margen (por ejemplo, con apoyo motor) acierta casi igual que uno que no lo necesita (brecha < 15 puntos; con margen fijo ≥ 40)', brecha(ml) < 0.15 && brecha(fija) >= 0.4, Math.round(brecha(fija) * 100) + ' → ' + Math.round(brecha(ml) * 100) + ' puntos');
ok('nunca imposible: el margen aprendido no baja de ×0,6 ni sube de ×3 en ninguna simulación', DESTREZAS.every((d) => { let e = M.nuevo(); const r = AG.azar(7); for (let i = 0; i < 60; i++) { e = M.registrar(e, Math.exp(Math.log(d) + 0.5 * normal(r)), 1); const k = M.mult(e); if (k < M.MIN || k > M.MAX) return false; } return true; }));

// ---------- en el perfil ----------
let al = falso(), est = P.cargar(al, hoy);
let r = P.crear(est, { nombre: 'Ana', anio: 2016, mes: 5 }, hoy, al); const ana = r.perfil;
ok('un perfil nuevo no ha aprendido nada: ×1', P.margenAprendido(ana, 'rampa') === 1 && Object.keys(ana.margen).length === 0);
for (let i = 0; i < 8; i++) P.registrarMargen(ana, 'rampa', 3, 1);
ok('tras varios intentos difíciles, el margen de la rampa sube y el del péndulo sigue en ×1', P.margenAprendido(ana, 'rampa') > 1.3 && P.margenAprendido(ana, 'pendulo') === 1);
ok('un juego que no es de precisión no aprende margen', P.registrarMargen(ana, 'voz', 3, 1) === ana && !ana.margen.voz);
P.guardar({ activo: ana.id, perfiles: [ana] }, al);
const vuelto = P.cargar(al, hoy).perfiles[0];
ok('lo aprendido sobrevive a guardar y cargar', Math.abs(P.margenAprendido(vuelto, 'rampa') - P.margenAprendido(ana, 'rampa')) < 1e-9 && vuelto.margen.rampa.n === 8);
ok('con la IA apagada no aprende y el margen vale ×1', (() => { const b = JSON.parse(JSON.stringify(ana)); b.extras.tutor = false; P.registrarMargen(b, 'rampa', 3, 1); return P.margenAprendido(b, 'rampa') === 1 && b.margen.rampa.n === 8; })());
ok('«Reiniciar lo que Chispa sabe» también borra el margen', (() => { const b = JSON.parse(JSON.stringify(ana)); P.reiniciarMaestria(b); return Object.keys(b.margen).length === 0 && P.margenAprendido(b, 'rampa') === 1; })());
const crudo = JSON.parse(al.getItem(P.CLAVE)); crudo.perfiles[0].margen = { rampa: { n: -3, s: 'x', q: 9 }, pendulo: { n: 4, s: 1, q: 2 }, voz: { n: 9, s: 0, q: 0 } };
al.setItem(P.CLAVE, JSON.stringify(crudo));
const limpio = P.cargar(al, hoy).perfiles[0];
ok('al cargar se descarta el margen dañado y los juegos que no corresponden', !limpio.margen.rampa && limpio.margen.pendulo && limpio.margen.pendulo.n === 4 && !limpio.margen.voz);
ok('un perfil guardado antes de esta función se carga sin margen', Object.keys(P.cargar(falso({ [P.CLAVE]: JSON.stringify({ activo: 'p1', perfiles: [{ id: 'p1', nombre: 'Viejo', nac: '2016-05', apoyos: [], extras: {}, progreso: {}, aprendizaje: {}, maestria: {} }] }) }), hoy).perfiles[0].margen).length === 0);
const q = JSON.stringify(ana); ok('el margen no viaja en el código de la clase (privacidad)', !require('../js/clase.js').codigoDe(ana, Date.now()).includes('margen') && /"margen"/.test(q));

console.log(fallos ? '\nHAY FALLOS: ' + fallos : '\nTodas las pruebas pasan');
process.exit(fallos ? 1 : 0);
