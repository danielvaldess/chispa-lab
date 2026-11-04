const V = require('../js/voz.js');
let fallos = 0;
const ok = (nombre, cond, detalle) => { if (!cond) fallos++; console.log((cond ? 'OK   ' : 'FALLA'), nombre, detalle || ''); };
const voz = (name, lang, localService = true) => ({ name, lang, localService });

// Un teléfono Android típico
const android = [voz('English United States', 'en-US'), voz('Spanish Spain', 'es-ES'), voz('Spanish United States', 'es-US'), voz('French', 'fr-FR')];
ok('Android: elige la voz en español latino', V.elegir(android).name === 'Spanish United States', V.elegir(android).name);
// Windows: mujer latina > mujer de España > hombre
const win = [voz('Microsoft Pablo - Spanish (Spain)', 'es-ES'), voz('Microsoft Helena - Spanish (Spain)', 'es-ES'), voz('Microsoft Sabina - Spanish (Mexico)', 'es-MX'), voz('Microsoft Raul - Spanish (Mexico)', 'es-MX')];
ok('Windows: prefiere una voz femenina latina', V.elegir(win).name.indexOf('Sabina') >= 0, V.elegir(win).name);
ok('las voces masculinas quedan al final', V.ordenadas(win).slice(-2).every((v) => /Pablo|Raul/.test(v.name)), V.ordenadas(win).map((v) => v.name).join(' > '));
// Sin internet: una voz local gana a una de red aunque la de red tenga buen nombre
const red = [voz('Google español de Estados Unidos', 'es-US', false), voz('Spanish Mexico', 'es-MX', true)];
ok('prefiere la voz que funciona sin internet', V.elegir(red).name === 'Spanish Mexico', V.elegir(red).name);
ok('si solo hay voces de red, igual las usa', V.elegir([voz('Google español', 'es-ES', false)]).name === 'Google español');
// Preferencia del jugador
ok('respeta la voz que el jugador eligió', V.elegir(win, 'Microsoft Helena - Spanish (Spain)').name.indexOf('Helena') >= 0);
ok('si la elegida ya no existe, vuelve a la mejor', V.elegir(win, 'ya no existe').name.indexOf('Sabina') >= 0);
// Casos vacíos
ok('sin voces en español devuelve null', V.elegir([voz('English', 'en-US')]) === null && V.elegir([]) === null && V.elegir(null) === null);
ok('puntos de una voz que no es española: -Infinity', V.puntos(voz('English', 'en-US')) === -Infinity);
// Cambiar de voz da la vuelta
const l = V.ordenadas(win), n1 = V.siguiente(win, l[0].name), n2 = V.siguiente(win, l[l.length - 1].name);
ok('«otra voz» pasa a la siguiente y da la vuelta', n1.name === l[1].name && n2.name === l[0].name);
ok('con una sola voz, «otra voz» devuelve esa misma', V.siguiente([voz('Unica', 'es-ES')], 'Unica').name === 'Unica');
ok('la lista original no se modifica', win[0].name.indexOf('Pablo') >= 0);
// Tono amigable pero no chillón
ok('tono entre 1,0 y 1,3 (más alto que lo normal, sin chillar)', V.TONO > 1 && V.TONO <= 1.3, V.TONO);
ok('ritmo tranquilo (menos de 1)', V.RITMO < 1 && V.RITMO >= 0.85, V.RITMO);

console.log(fallos ? '\n' + fallos + ' prueba(s) fallaron' : '\nTodas las pruebas pasan');
process.exit(fallos ? 1 : 0);
