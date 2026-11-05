// Prueba de navegación en un teléfono emulado (Chromium con perfil móvil): desde el menú abre cada pantalla y comprueba que
// «← Menú» y el botón «atrás» (history.back, lo que hace el de Android) vuelven al menú. Sin dependencias (Node 22 o más).
// Uso: node scripts/probar-navegacion.mjs        (levanta su propio servidor; variable opcional CHROME=/ruta/al/chromium)
import { spawn } from 'node:child_process';

const PUERTO_WEB = 8091, PUERTO_CDP = 9391;
const dormir = (ms) => new Promise((r) => setTimeout(r, ms));
let fallos = 0;
const ok = (nombre, cond, detalle) => { if (!cond) fallos++; console.log((cond ? 'OK   ' : 'FALLA'), nombre, detalle || ''); };

const servidor = spawn('node', ['scripts/serve.mjs'], { env: { ...process.env, PORT: String(PUERTO_WEB) }, stdio: 'ignore' });
const chrome = spawn(process.env.CHROME || '/usr/bin/chromium', ['--headless=new', '--no-sandbox', '--disable-gpu', '--remote-debugging-port=' + PUERTO_CDP, '--window-size=390,844', '--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', '--user-data-dir=/tmp/chispa-nav-' + process.pid, 'about:blank'], { stdio: 'ignore' });
const salir = () => { try { chrome.kill(); } catch (e) {} try { servidor.kill(); } catch (e) {} };
process.on('exit', salir);

let lista = null;
for (let i = 0; i < 60 && !lista; i++) { try { lista = await (await fetch('http://127.0.0.1:' + PUERTO_CDP + '/json')).json(); } catch (e) { await dormir(200); } }
const ws = new WebSocket(lista.find((x) => x.type === 'page').webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let id = 0; const pend = {}, errores = [];
ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && pend[d.id]) { pend[d.id](d); delete pend[d.id]; } else if (d.method === 'Runtime.exceptionThrown') errores.push((d.params.exceptionDetails.exception?.description || d.params.exceptionDetails.text).slice(0, 160)); };
const cmd = (method, params = {}) => new Promise((r) => { const i = ++id; pend[i] = r; ws.send(JSON.stringify({ id: i, method, params })); });
const ev = async (e) => (await cmd('Runtime.evaluate', { expression: e, returnByValue: true, awaitPromise: true })).result.result?.value;
const hash = () => ev('location.hash || "#/"');
const texto = () => ev('document.body.innerText');
const clic = async (sel, ms = 700) => { const o = await ev('(function(){var e=document.querySelector(' + JSON.stringify(sel) + ');if(e&&!e.disabled){e.click();return true}return false})()'); await dormir(ms); return o; };
const atras = async (ms = 700) => { await ev('history.back()'); await dormir(ms); };
const irMenu = async () => { await ev("location.hash='#/'"); await dormir(700); };

await cmd('Runtime.enable'); await cmd('Page.enable');
await cmd('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
const hoy = '2026-11-04';
const base = { extras: {}, apoyos: [], maestria: {}, creado: hoy };
const estudiante = { activo: 'pa', perfiles: [Object.assign({ id: 'pa', nombre: 'Ana', rol: 'estudiante', nac: '2016-05', aprendizaje: {}, progreso: { rampa: 1, pendulo: 1, voz: 1, globo: 1, luz: 1, burbujas: 1 }, cuaderno: [{ n: 'hilo', f: hoy, h: 'Si cambio el largo, cambia el tiempo', d: '3 largos', c: 'Depende del largo' }] }, base)] };
const docente = { activo: 'pd', perfiles: [Object.assign({ id: 'pd', nombre: 'Profe Rosa', rol: 'docente', alumnos: [], nac: '1985-03', aprendizaje: {}, progreso: {} }, base)] };
const guardarPerfiles = (o) => ev('localStorage.setItem("chispalab.perfiles.v1",' + JSON.stringify(JSON.stringify(o)) + ')');
const recargar = async (ms = 2500) => { await cmd('Page.navigate', { url: 'http://localhost:' + PUERTO_WEB + '/' }); await dormir(ms); };
await cmd('Page.navigate', { url: 'http://localhost:' + PUERTO_WEB + '/about:blank' }).catch(() => {});
await recargar(1000); await guardarPerfiles(estudiante); await recargar(3000);

ok('el menú abre', (await texto()).includes('Mi laboratorio') && (await hash()) === '#/');

// pantalla -> [botón del menú, hash esperado, texto esperado, cómo volver con la pantalla]
const pantallas = [
  ['Mi cuaderno', '#m-cuaderno', '#/cuaderno', 'Mi cuaderno de laboratorio', '.volver'],
  ['Ajustes', '#m-ajustes', '#/ajustes', 'Jugador:', '#atras'],
  ['Cambiar de jugador', '#m-quien', '#/jugadores', '¿Quién va a jugar?', '.jugador'],
  ['Compartir con mi docente', '#m-compartir', '#/compartir', 'Tu docente verá', '.volver'],
  ['La estación (final)', '#m-final', '#/final/1', 'La estación está encendida', '#seguir'],
];
for (const [nombre, boton, hashEsperado, textoEsperado, volver] of pantallas) {
  await irMenu();
  const abre = await clic(boton, 900);
  ok(nombre + ': el botón del menú existe', abre);
  ok(nombre + ': tiene su propia dirección', (await hash()) === hashEsperado, await hash());
  ok(nombre + ': muestra su pantalla', (await texto()).includes(textoEsperado));
  await clic(volver, 900);
  ok(nombre + ': el botón de volver de la pantalla regresa al menú', (await hash()) === '#/' && (await texto()).includes('Mi laboratorio'), await hash());
  if (hashEsperado.startsWith('#/final')) { await guardarPerfiles(estudiante); await recargar(2500); }
  await irMenu(); await clic(boton, 900);
  await atras(900);
  ok(nombre + ': «atrás» (como el de Android) regresa al menú', (await hash()) === '#/' && (await texto()).includes('Mi laboratorio'), await hash());
}

// el cuaderno muestra lo que el estudiante desarrolló y se puede copiar
await irMenu(); await clic('#m-cuaderno', 900);
const cuaderno = await texto();
ok('el cuaderno muestra la hipótesis, los datos y la conclusión', cuaderno.includes('Hipótesis') && cuaderno.includes('Datos') && cuaderno.includes('Conclusión'));

// docente: Mis alumnos, escáner y pegar código, cada uno con su «volver»
await guardarPerfiles(docente); await recargar(3000);
ok('docente: el menú tiene «Mis alumnos»', (await texto()).includes('Mis alumnos'));
for (const [nombre, destino, volverAHash] of [['Mis alumnos', '#/alumnos', '#/'], ['Escanear', '#/alumnos/escanear', '#/alumnos'], ['Pegar un código', '#/alumnos/pegar', '#/alumnos'], ['Agrupar mi clase', '#/alumnos/grupos', '#/alumnos']]) {
  await irMenu(); await ev("location.hash='#/alumnos'"); await dormir(700);
  if (destino !== '#/alumnos') { await ev("location.hash='" + destino + "'"); await dormir(1200); }
  ok(nombre + ': abre en ' + destino, (await hash()) === destino);
  await clic('.volver', 900);
  ok(nombre + ': «← volver» regresa a ' + volverAHash, (await hash()) === volverAHash, await hash());
  await ev("location.hash='" + destino + "'"); await dormir(1000);
  await atras(900);
  ok(nombre + ': «atrás» regresa a la pantalla anterior', (await hash()) !== destino, await hash());
}
// fluidez adaptable: con un teléfono rápido no se activa el modo ligero; con uno muy lento se activa solo, se recuerda y «Borrar todos los datos» lo olvida
await guardarPerfiles(estudiante); await ev('localStorage.removeItem("chispalab.ligero")');
await cmd('Emulation.setCPUThrottlingRate', { rate: 1 }); await recargar(2500);
await ev("location.hash='#/n/rampa'"); await dormir(1200); await clic('.op[data-i="1"]', 1000); await dormir(7000);
ok('fluidez: con un teléfono rápido el modo ligero no se activa', (await ev('LIGERO')) === false && (await ev('localStorage.getItem("chispalab.ligero")')) === null);
await cmd('Emulation.setCPUThrottlingRate', { rate: 8 }); await dormir(12000);
ok('fluidez: con la CPU 8 veces más lenta Chispa activa sola el modo ligero y lo recuerda', (await ev('LIGERO')) === true && (await ev('localStorage.getItem("chispalab.ligero")')) === '1');
await cmd('Emulation.setCPUThrottlingRate', { rate: 1 });
ok('fluidez: «Borrar todos los datos» lo olvida', (await ev('PERFILES.borrarTodo(), localStorage.getItem("chispalab.ligero")')) === null);
ok('sin errores de JavaScript', errores.length === 0, errores.join(' | '));
console.log(fallos ? '\nHAY FALLOS: ' + fallos : '\nNavegación: todo bien');
salir();
process.exit(fallos ? 1 : 0);
