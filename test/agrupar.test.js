// Agrupar la clase: primero una prueba estadística (¿hay diferencias reales?), después k-means++. Se mide con clases sintéticas de
// grupos conocidos (100 clases por escenario, con semillas distintas a las usadas para elegir el método) y con casos límite.
const A = require('../js/agrupar.js');
const C = require('../js/clase.js');
let fallos = 0;
const ok = (nombre, cond, detalle) => { if (!cond) fallos++; console.log((cond ? 'OK   ' : 'FALLA'), nombre, detalle || ''); };

const PERFILES = {
  A: { acc: [0.9, 0.9, 0.9, 0.9, 0.9, 0.9], estr: 3 },   // van adelantados
  B: { acc: [0.9, 0.15, 0.9, 0.9, 0.9, 0.9], estr: 2 },  // les cuesta el péndulo
  C: { acc: [0.85, 0.85, 0.85, 0.85, 0.2, 0.2], estr: 2 }, // les cuesta luz y burbujas
  D: { acc: [0.5, 0.5, 0.5, 0.5, 0.5, 0.5], estr: 1 },   // a medias
  E: { acc: [0.3, 0.3, 0.3, 0.3, 0.3, 0.3], estr: 1 },   // les cuesta todo
};
function clase(grupos, porGrupo, semilla) {
  const r = A.azar(semilla), out = [], etiquetas = {};
  grupos.forEach((g, gi) => {
    for (let n = 0; n < porGrupo; n++) {
      const j = [], k = [], e = [];
      for (let q = 0; q < 6; q++) {
        const partidas = 3 + Math.floor(r() * 4); let aciertos = 0;
        for (let t = 0; t < partidas; t++) if (r() < PERFILES[g].acc[q]) aciertos++;
        j.push(partidas); k.push(aciertos);
        e.push(Math.max(0, Math.min(3, PERFILES[g].estr + (aciertos / partidas > 0.7 ? 1 : -1) + (r() < 0.2 ? -1 : 0))));
      }
      const id = 'a' + g + gi + '_' + n + '_' + semilla;
      out.push({ id, nombre: g + n, t: C.EPOCA + 1e6, e: e.concat([0, 0, 0, 0, 0]), j, k, min: 20, d: '000000' });
      etiquetas[id] = g;
    }
  });
  return { alumnos: out, etiquetas };
}
function pureza(res, etiquetas) {
  let bien = 0, total = 0;
  res.grupos.forEach((g) => { const cuenta = {}; g.ids.forEach((id) => { cuenta[etiquetas[id]] = (cuenta[etiquetas[id]] || 0) + 1; }); bien += Math.max.apply(null, Object.values(cuenta)); total += g.ids.length; });
  return bien / total;
}
const SEMILLAS = Array.from({ length: 100 }, (_, i) => (101 + i) * 17);
function escenario(grupos, porGrupo) {
  const ks = [], pur = [];
  SEMILLAS.forEach((s) => { const c = clase(grupos, porGrupo, s), r = A.agrupar(c.alumnos); ks.push(r.k); if (r.k > 1) pur.push(pureza(r, c.etiquetas)); });
  return { ks, frac: (k) => ks.filter((x) => x === k).length / ks.length, fracMin: (k) => ks.filter((x) => x >= k).length / ks.length, max: Math.max.apply(null, ks), pureza: pur.length ? pur.reduce((a, b) => a + b, 0) / pur.length : 1 };
}

// ---------- casos límite ----------
ok('con menos de 4 alumnos no agrupa y lo dice', A.agrupar(clase(['A'], 3, 1).alumnos).ok === false && A.agrupar(clase(['A'], 3, 1).alumnos).motivo === 'pocos');
ok('sin datos', A.agrupar([]).ok === false && A.agrupar(null).ok === false);
const iguales = []; for (let i = 0; i < 6; i++) iguales.push({ id: 'i' + i, nombre: 'I' + i, t: C.EPOCA + 1, e: [2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0], j: [4, 4, 4, 4, 4, 4], k: [3, 3, 3, 3, 3, 3], min: 5, d: '000000' });
const ri = A.agrupar(iguales);
ok('alumnos idénticos: no inventa grupos (un solo grupo, «no hay grupos claros»)', ri.ok && ri.claro === false && ri.k === 1 && ri.grupos[0].ids.length === 6);
const sinJugar = clase(['A', 'B'], 5, 3).alumnos; sinJugar[0].j = [0, 0, 0, 0, 0, 0]; sinJugar[0].k = [0, 0, 0, 0, 0, 0]; sinJugar[0].e = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
const rs = A.agrupar(sinJugar);
ok('un alumno que no ha jugado no rompe el agrupamiento', rs.ok && rs.grupos.reduce((s, g) => s + g.ids.length, 0) === 10);

// ---------- no inventa grupos en clases parejas (lo más importante con niños) ----------
const n18 = escenario(['A'], 18), nD = escenario(['D'], 18), n40 = escenario(['A'], 40), n8 = escenario(['A'], 8);
ok('clase pareja de 18 alumnos que aciertan mucho: dice «no hay grupos claros» en ≥ 95 % de 100 clases', n18.frac(1) >= 0.95, (n18.frac(1) * 100).toFixed(0) + ' %');
ok('clase pareja de 18 alumnos a medias: ≥ 95 %', nD.frac(1) >= 0.95, (nD.frac(1) * 100).toFixed(0) + ' %');
ok('clase pareja de 40 alumnos: ≥ 95 % (el tamaño no hace aparecer grupos)', n40.frac(1) >= 0.95, (n40.frac(1) * 100).toFixed(0) + ' %');
ok('clase pareja de 8 alumnos: ≥ 95 %', n8.frac(1) >= 0.95, (n8.frac(1) * 100).toFixed(0) + ' %');

// ---------- encuentra los grupos que sí existen ----------
const dosAB = escenario(['A', 'B'], 9), dosAE = escenario(['A', 'E'], 9), dosAB30 = escenario(['A', 'B'], 15);
ok('2 grupos (uno con dificultad solo en el péndulo), 18 alumnos: encuentra 2 en ≥ 85 % de 100 clases', dosAB.frac(2) >= 0.85, (dosAB.frac(2) * 100).toFixed(0) + ' %');
ok('2 grupos (arriba y abajo), 18 alumnos: ≥ 95 %', dosAE.frac(2) >= 0.95, (dosAE.frac(2) * 100).toFixed(0) + ' %');
ok('2 grupos, 30 alumnos: ≥ 90 %', dosAB30.frac(2) >= 0.9, (dosAB30.frac(2) * 100).toFixed(0) + ' %');
ok('cuando separa 2 grupos, los separa bien: pureza media ≥ 0,95', dosAB.pureza >= 0.95 && dosAE.pureza >= 0.95, dosAB.pureza.toFixed(3) + ' / ' + dosAE.pureza.toFixed(3));
const tresPocos = escenario(['A', 'B', 'C'], 6), tresMuchos = escenario(['A', 'B', 'C'], 15);
ok('3 grupos, 18 alumnos: encuentra 3 en ≥ 75 % y nunca los junta en uno solo (≥ 95 % ven al menos 2)', tresPocos.frac(3) >= 0.75 && tresPocos.fracMin(2) >= 0.95, (tresPocos.frac(3) * 100).toFixed(0) + ' % / ' + (tresPocos.fracMin(2) * 100).toFixed(0) + ' %');
ok('3 grupos, 45 alumnos: encuentra 3 en ≥ 90 %', tresMuchos.frac(3) >= 0.9, (tresMuchos.frac(3) * 100).toFixed(0) + ' %');
ok('con 3 grupos la pureza media es ≥ 0,9', tresPocos.pureza >= 0.9 && tresMuchos.pureza >= 0.9, tresPocos.pureza.toFixed(3) + ' / ' + tresMuchos.pureza.toFixed(3));
const cuatro = escenario(['A', 'B', 'C', 'E'], 6);
ok('aunque haya 4 tipos de alumnos, nunca da más de 3 grupos', cuatro.max <= 3 && [n18, nD, n40, dosAB, tresPocos, tresMuchos].every((e) => e.max <= 3), 'máximo ' + cuatro.max);

// ---------- lo que dice de cada grupo ----------
const c3 = clase(['A', 'B', 'C'], 15, 77 * 17), r3 = A.agrupar(c3.alumnos);
const grupoDe = (et) => r3.grupos.find((g) => g.ids.filter((id) => c3.etiquetas[id] === et).length >= 12);
ok('con 45 alumnos, 3 grupos con sus etiquetas', r3.k === 3 && r3.claro === true);
ok('el grupo al que le cuesta el péndulo lo muestra («pendulo») y se le sugiere el experimento del hilo', grupoDe('B') && grupoDe('B').juegoDificil === 'pendulo' && /péndulo de hilo/.test(grupoDe('B').sugerencia));
ok('el grupo de luz y burbujas: le cuesta luz o burbujas', grupoDe('C') && ['luz', 'burbujas'].includes(grupoDe('C').juegoDificil));
ok('el grupo que va bien es «avanzado» y se le sugiere Mi laboratorio', grupoDe('A') && grupoDe('A').nivel === 'avanzado' && /Mi laboratorio/.test(grupoDe('A').sugerencia));
ok('la etiqueta y la sugerencia hablan del juego que cuesta, y un grupo que va bien no señala ninguno por ruido', grupoDe('B').etiqueta.includes('péndulo') === true || /pendulo|péndulo|El péndulo/i.test(grupoDe('B').etiqueta), grupoDe('B') && grupoDe('B').etiqueta);
ok('el grupo que va bien no marca un «juego que cuesta» solo por ruido', grupoDe('A').juegoDificil === null && /adelantados/.test(grupoDe('A').etiqueta), grupoDe('A') && grupoDe('A').etiqueta);
ok('los grupos salen ordenados: primero el que más necesita refuerzo', r3.grupos.every((g, i) => i === 0 || r3.grupos[i - 1].acierto <= g.acierto));
ok('cada alumno está en un solo grupo', r3.grupos.reduce((s, g) => s + g.ids.length, 0) === 45 && new Set([].concat(...r3.grupos.map((g) => g.ids))).size === 45);
ok('la silueta (calidad de la separación) está entre -1 y 1', r3.silueta > 0 && r3.silueta <= 1, r3.silueta.toFixed(3));
ok('explica cómo lo calculó, que no inventa grupos y que no envía nada', /no inventa ninguno/.test(r3.explicacion) && /k-means/.test(r3.explicacion) && /No se envía nada/.test(r3.explicacion));

// ---------- repetible y no depende del orden de escaneo ----------
const firma = (r) => r.grupos.map((g) => g.ids.slice().sort().join(',')).sort().join(' | ');
ok('mismo curso, mismo resultado, aunque se haya escaneado en otro orden', firma(r3) === firma(A.agrupar(c3.alumnos.slice().reverse())));
ok('repetir el cálculo da lo mismo', firma(A.agrupar(c3.alumnos)) === firma(r3));

// ---------- rendimiento ----------
const grande = clase(['A', 'B', 'C'], 20, 5).alumnos; // 60 alumnos: el tope de la lista
const t0 = process.hrtime.bigint(); A.agrupar(grande); const ms = Number(process.hrtime.bigint() - t0) / 1e6;
ok('60 alumnos (el tope) se agrupan en menos de 250 ms en este equipo (un teléfono modesto es unas 5 a 10 veces más lento)', ms < 250, ms.toFixed(1) + ' ms');

// ---------- equidad ----------
const conApoyos = c3.alumnos.map((a) => Object.assign({}, a, { apoyos: ['voz', 'manos'], nac: '2016-05' }));
ok('equidad: el resultado no depende de apoyos ni de la edad (no viajan ni se usan)', firma(A.agrupar(conApoyos)) === firma(r3));

console.log(fallos ? '\nHAY FALLOS: ' + fallos : '\nTodas las pruebas pasan');
process.exit(fallos ? 1 : 0);
