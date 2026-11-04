// La interfaz es un videojuego para niños: no debe filtrar mensajes de desarrollador o de la organización del evento.
const fs = require('fs');
const path = require('path');
let fallos = 0;
const ok = (nombre, cond, detalle) => { if (!cond) fallos++; console.log((cond ? 'OK   ' : 'FALLA'), nombre, detalle || ''); };

const raiz = path.join(__dirname, '..');
const PROHIBIDAS = /hack4edu|reto\s*17|reto17|prototipo|spike|debug|laboratorio real/i;
const archivos = ['index.html'];
(function recorrer(dir) {
  fs.readdirSync(path.join(raiz, dir), { withFileTypes: true }).forEach((e) => {
    const ruta = path.join(dir, e.name);
    if (e.isDirectory()) recorrer(ruta); else if (e.name.endsWith('.js') && e.name !== 'lab.js') archivos.push(ruta);
  });
})('js');

archivos.forEach((f) => {
  const m = PROHIBIDAS.exec(fs.readFileSync(path.join(raiz, f), 'utf8'));
  ok('sin mensajes de desarrollador en ' + f, !m, m ? '«' + m[0] + '»' : '');
});
const html = fs.readFileSync(path.join(raiz, 'index.html'), 'utf8');
ok('la portada no tiene pie de página', !/<footer/i.test(html));
ok('la portada no enlaza al laboratorio ni a la prueba de sensores', !/lab\.html|sensores\.html/.test(html));

console.log(fallos ? '\n' + fallos + ' prueba(s) fallaron' : '\nTodas las pruebas pasan');
process.exit(fallos ? 1 : 0);
