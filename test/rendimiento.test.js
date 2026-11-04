// Presupuesto de la IA en el teléfono: pequeña (bytes) y rápida (ms por partida). Estas mediciones son de Node en un
// ordenador de escritorio; en un teléfono de gama baja hay que multiplicarlas (ver scripts/medir-navegador.mjs).
const fs = require('fs');
const path = require('path');
const P = require('../js/perfiles.js');
const PI = require('../js/pistas.js');
const DG = require('../js/diagnostico.js');
let fallos = 0;
const ok = (nombre, cond, detalle) => { if (!cond) fallos++; console.log((cond ? 'OK   ' : 'FALLA'), nombre, detalle || ''); };

const raiz = path.join(__dirname, '..', 'js');
const bytes = ['diagnostico.js', 'bandido.js', 'pistas.js'].map((f) => fs.statSync(path.join(raiz, f)).size);
const total = bytes.reduce((a, b) => a + b, 0);
console.log('  Peso de la IA: diagnostico ' + bytes[0] + ' B · bandido ' + bytes[1] + ' B · pistas ' + bytes[2] + ' B · total ' + total + ' B');
ok('los tres módulos de la IA pesan menos de 30 KB sin comprimir', total < 30 * 1024, total + ' B');

const hoy = new Date(2026, 10, 4);
const perfil = P.crear(P.cargar({ getItem: () => null, setItem() {}, removeItem() {} }, hoy), { nombre: 'Ana', anio: 2018, mes: 3, apoyos: [] }, hoy, null).perfil;
const N = 20000, ids = Object.keys(DG.CATALOGO);
let t0 = process.hrtime.bigint();
for (let i = 0; i < N; i++) {
  const id = ids[i % ids.length], c = DG.CATALOGO[id], ops = Object.keys(c.ideas).concat([c.ok]), op = ops[i % ops.length];
  P.registrarIA(perfil, id, { opcion: op, ok: op === c.ok, estrellas: 2, seg: 30, habil: false });
}
const msReg = Number(process.hrtime.bigint() - t0) / 1e6 / N;
t0 = process.hrtime.bigint();
for (let i = 0; i < N; i++) {
  const id = ids[i % ids.length], c = DG.CATALOGO[id], ops = Object.keys(c.ideas).concat([c.ok]), op = ops[i % ops.length];
  PI.crear(id, { ok: op === c.ok, opcion: op, datos: { th1: 5, th2: 10, t1: 1.5, t2: 1.1, base: 200, f: 400, par: { L: 40, m1: 5, m2: 150, T1: 1.27, T2: 1.28 } } });
}
const msPistas = Number(process.hrtime.bigint() - t0) / 1e6 / N;
console.log('  registrarIA: ' + msReg.toFixed(4) + ' ms por partida · pistas.crear: ' + msPistas.toFixed(4) + ' ms');
ok('registrarIA tarda menos de 2 ms por partida', msReg < 2, msReg.toFixed(4) + ' ms');
ok('pistas.crear tarda menos de 2 ms', msPistas < 2, msPistas.toFixed(4) + ' ms');
const json = JSON.stringify(perfil.ia).length;
console.log('  Lo que la IA guarda por jugador: ' + json + ' B');
ok('el estado de la IA de un jugador cabe en menos de 20 KB', json < 20 * 1024, json + ' B');

console.log(fallos ? '\n' + fallos + ' prueba(s) fallaron' : '\nTodas las pruebas pasan');
process.exit(fallos ? 1 : 0);
