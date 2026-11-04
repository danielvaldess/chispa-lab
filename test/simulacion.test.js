// SIMULACIÓN, NO PILOTO: alumnos sintéticos con una idea errónea conocida. Sirve para comprobar que el diagnóstico converge
// y no acusa a quien entiende, NO para afirmar que funciona con niños reales. Los alumnos simulados responden con probabilidades
// DISTINTAS de las que supone el modelo (así la prueba no es circular).
const DG = require('../js/diagnostico.js');
let fallos = 0;
const ok = (nombre, cond, detalle) => { if (!cond) fallos++; console.log((cond ? 'OK   ' : 'FALLA'), nombre, detalle || ''); };
const semilla = (s) => () => { s = (s * 1664525 + 1013904223) % 4294967296; return (s + 1) / 4294967298; };
const rnd = semilla(2026);
const ALUMNOS = 400;      // por juego e idea
const INTENTOS = 5;

// alumno con la idea errónea k: delata la idea con 55 % (el modelo supone 70 %), acierta por azar 25 % (el modelo supone 15 %)
function responderErronea(id, idea) {
  const c = DG.CATALOGO[id], delatoras = Object.keys(c.ideas).filter((o) => c.ideas[o] === idea), otras = Object.keys(c.ideas).filter((o) => c.ideas[o] !== idea);
  const u = rnd();
  if (u < 0.55) return delatoras[Math.floor(rnd() * delatoras.length)];
  if (u < 0.80 || !otras.length) return c.ok;
  return otras[Math.floor(rnd() * otras.length)];
}
// alumno que entiende: acierta 90 % (el modelo supone 80 %) y se equivoca por despiste en lo demás
function responderEntiende(id) {
  const c = DG.CATALOGO[id], malas = Object.keys(c.ideas);
  return rnd() < 0.9 ? c.ok : malas[Math.floor(rnd() * malas.length)];
}

const tabla = [];
let totalAciertos = 0, totalCasos = 0, totalFP = 0, totalEntiende = 0;
const aciertosPorIntento = new Array(INTENTOS).fill(0);
Object.keys(DG.CATALOGO).forEach((id) => {
  DG.ideasDe(id).forEach((idea) => {
    let bien = 0;
    for (let a = 0; a < ALUMNOS; a++) {
      let e = DG.nuevo(id);
      for (let k = 0; k < INTENTOS; k++) {
        e = DG.observar(e, id, responderErronea(id, idea));
        const pr = DG.probable(e);
        if (pr && pr.idea === idea) aciertosPorIntento[k]++;
      }
      const pr = DG.probable(e);
      if (pr && pr.idea === idea) bien++;
    }
    totalAciertos += bien; totalCasos += ALUMNOS;
    tabla.push(id + ' / ' + idea + ': ' + Math.round((100 * bien) / ALUMNOS) + ' %');
  });
  let fp = 0;
  for (let a = 0; a < ALUMNOS; a++) {
    let e = DG.nuevo(id);
    for (let k = 0; k < INTENTOS; k++) e = DG.observar(e, id, responderEntiende(id));
    if (DG.probable(e)) fp++;
  }
  totalFP += fp; totalEntiende += ALUMNOS;
  tabla.push(id + ' (entiende): falsos positivos ' + Math.round((100 * fp) / ALUMNOS) + ' %');
});
console.log('\nResultados de la simulación (' + ALUMNOS + ' alumnos por caso, ' + INTENTOS + ' respuestas):');
tabla.forEach((l) => console.log('  ' + l));
const curva = aciertosPorIntento.map((n) => Math.round((100 * n) / totalCasos));
console.log('  Acierto del diagnóstico tras 1…' + INTENTOS + ' respuestas: ' + curva.join(' % · ') + ' %');
console.log('  Falsos positivos (alumnos que entienden y se les señala una idea errónea): ' + Math.round((100 * totalFP) / totalEntiende) + ' %\n');

// el umbral es el mínimo aceptable, no un objetivo ajustado al resultado: lo medido se imprime arriba (los juegos con una sola idea errónea separan peor)
ok('con 5 respuestas identifica la idea errónea correcta en al menos el 60 % de los casos simulados', totalAciertos / totalCasos >= 0.6, Math.round((100 * totalAciertos) / totalCasos) + ' %');
ok('la precisión no baja al acumular respuestas (la curva sube)', curva[INTENTOS - 1] >= curva[0], curva.join(','));
ok('señala a menos del 20 % de los alumnos que sí entienden', totalFP / totalEntiende < 0.2, Math.round((100 * totalFP) / totalEntiende) + ' %');

console.log(fallos ? '\n' + fallos + ' prueba(s) fallaron' : '\nTodas las pruebas pasan');
process.exit(fallos ? 1 : 0);
