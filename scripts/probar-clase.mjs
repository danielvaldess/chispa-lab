// Prueba de extremo a extremo de la clase con dos teléfonos emulados (Chromium con perfil móvil):
// 1) un teléfono de ALUMNA muestra su QR; 2) un teléfono de DOCENTE, con una cámara virtual que enfoca ese QR, lo escanea y guarda al alumno;
// 3) el docente abre el detalle, agrupa una clase sembrada y quita a un alumno. Sin dependencias (Node 22 o más; no necesita ffmpeg).
// Uso: node scripts/probar-clase.mjs        (levanta su propio servidor; variable opcional CHROME=/ruta/al/chromium)
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const require = createRequire(import.meta.url);
const qrcode = require('../js/vendor/qrcode.min.js');
const CLASE = require('../js/clase.js');
const AGRUPAR = require('../js/agrupar.js');

const PUERTO_WEB = 8092;
const dormir = (ms) => new Promise((r) => setTimeout(r, ms));
let fallos = 0;
const ok = (nombre, cond, detalle) => { if (!cond) fallos++; console.log((cond ? 'OK   ' : 'FALLA'), nombre, detalle || ''); };

const servidor = spawn('node', ['scripts/serve.mjs'], { env: { ...process.env, PORT: String(PUERTO_WEB) }, stdio: 'ignore' });
const abiertos = [];
const salir = () => { abiertos.forEach((c) => { try { c.kill(); } catch (e) {} }); try { servidor.kill(); } catch (e) {} };
process.on('exit', salir);
await dormir(800);

/** Cámara virtual: un archivo .y4m con el QR centrado (blanco y negro, 640×480). */
function camaraConQR(texto) {
  const q = qrcode(0, 'M'); q.addData(texto); q.make();
  const n = q.getModuleCount(), quiet = 4, W = 640, H = 480, mod = Math.floor(440 / (n + 2 * quiet)), lado = (n + 2 * quiet) * mod;
  const x0 = Math.floor((W - lado) / 2), y0 = Math.floor((H - lado) / 2), Y = Buffer.alloc(W * H, 255);
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (q.isDark(r, c)) for (let y = 0; y < mod; y++) for (let x = 0; x < mod; x++) Y[(y0 + (r + quiet) * mod + y) * W + x0 + (c + quiet) * mod + x] = 0;
  const U = Buffer.alloc((W / 2) * (H / 2), 128), cuadro = Buffer.concat([Buffer.from('FRAME\n'), Y, U, U]);
  const partes = [Buffer.from('YUV4MPEG2 W' + W + ' H' + H + ' F10:1 Ip A1:1 C420jpeg\n')];
  for (let i = 0; i < 20; i++) partes.push(cuadro);
  const ruta = join(mkdtempSync(join(tmpdir(), 'chispa-cam-')), 'qr.y4m');
  writeFileSync(ruta, Buffer.concat(partes));
  return ruta;
}

async function telefono(puerto, perfiles, extra = []) {
  const chrome = spawn(process.env.CHROME || '/usr/bin/chromium', ['--headless=new', '--no-sandbox', '--disable-gpu', '--remote-debugging-port=' + puerto, '--window-size=390,844', '--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', '--user-data-dir=' + mkdtempSync(join(tmpdir(), 'chispa-tel-')), ...extra, 'about:blank'], { stdio: 'ignore' });
  abiertos.push(chrome);
  let lista = null;
  for (let i = 0; i < 60 && !lista; i++) { try { lista = await (await fetch('http://127.0.0.1:' + puerto + '/json')).json(); } catch (e) { await dormir(200); } }
  const ws = new WebSocket(lista.find((x) => x.type === 'page').webSocketDebuggerUrl);
  await new Promise((r) => (ws.onopen = r));
  let id = 0; const pend = {}, errores = [];
  ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && pend[d.id]) { pend[d.id](d); delete pend[d.id]; } else if (d.method === 'Runtime.exceptionThrown') errores.push((d.params.exceptionDetails.exception?.description || d.params.exceptionDetails.text).slice(0, 160)); };
  const cmd = (method, params = {}) => new Promise((r) => { const i = ++id; pend[i] = r; ws.send(JSON.stringify({ id: i, method, params })); });
  const ev = async (e) => (await cmd('Runtime.evaluate', { expression: e, returnByValue: true, awaitPromise: true })).result.result?.value;
  await cmd('Runtime.enable'); await cmd('Page.enable');
  await cmd('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  await cmd('Page.addScriptToEvaluateOnNewDocument', { source: "try{if(!localStorage.getItem('chispalab.perfiles.v1'))localStorage.setItem('chispalab.perfiles.v1'," + JSON.stringify(JSON.stringify(perfiles)) + ")}catch(e){}" });
  await cmd('Page.navigate', { url: 'http://localhost:' + PUERTO_WEB + '/' }); await dormir(2500);
  return {
    ev, errores,
    hash: async (h, ms = 900) => { await ev("location.hash='" + h + "'"); await dormir(ms); },
    clic: async (sel, ms = 700) => { const o = await ev('(function(){var e=document.querySelector(' + JSON.stringify(sel) + ');if(e&&!e.disabled){e.click();return true}return false})()'); await dormir(ms); return o; },
    texto: () => ev('document.body.innerText'),
    alumnos: () => ev("JSON.parse(localStorage.getItem('chispalab.perfiles.v1')).perfiles[0].alumnos"),
  };
}

const hoy = '2026-11-04';
const base = { extras: {}, apoyos: [], maestria: {}, creado: hoy };
const ana = { activo: 'pana', perfiles: [Object.assign({ id: 'pana', nombre: 'Ana', rol: 'estudiante', nac: '2016-05', progreso: { rampa: 3, pendulo: 2, voz: 1 }, aprendizaje: { rampa: { partidas: 4, predOk: 3, seg: 300, estrellas: 3 }, pendulo: { partidas: 5, predOk: 1, seg: 600, estrellas: 2 } } }, base)] };
const docente = (alumnos) => ({ activo: 'pdoc', perfiles: [Object.assign({ id: 'pdoc', nombre: 'Profe Rosa', rol: 'docente', alumnos, nac: '1985-03', aprendizaje: {}, progreso: {} }, base)] });

// ---- 1) la alumna muestra su QR
const alumna = await telefono(9481, ana);
ok('la alumna ve «Compartir con mi docente» y no «Mis alumnos»', (await alumna.texto()).includes('Compartir con mi docente') && !(await alumna.texto()).includes('Mis alumnos'));
await alumna.hash('#/compartir', 1200);
ok('antes de mostrar el QR dice qué verá el docente y qué no', (await alumna.texto()).includes('Tu docente verá') && (await alumna.texto()).includes('No verá'));
await alumna.clic('#mostrar', 2500);
const codigo = await alumna.ev("(document.getElementById('texto-cod')||{}).value");
ok('se dibuja el QR y el código de texto', /^CL1\|/.test(codigo || '') && await alumna.ev("!!document.querySelector('canvas.qr')"), codigo);
ok('sin errores de JavaScript en el teléfono de la alumna', alumna.errores.length === 0, alumna.errores.join(' | '));

// ---- 2) el docente lo escanea con una cámara virtual
const doc = await telefono(9482, docente([]), ['--use-file-for-fake-video-capture=' + camaraConQR(codigo)]);
ok('el docente ve «Mis alumnos» y no «Compartir con mi docente»', (await doc.texto()).includes('Mis alumnos') && !(await doc.texto()).includes('Compartir con mi docente'));
await doc.hash('#/alumnos/escanear', 1500);
for (let i = 0; i < 40 && (await doc.alumnos()).length < 1; i++) await dormir(300);
const guardados = await doc.alumnos();
ok('el docente ESCANEÓ el QR con la cámara y guardó a Ana', guardados.length === 1 && guardados[0].nombre === 'Ana', JSON.stringify(guardados[0] && { nombre: guardados[0].nombre, estrellas: guardados[0].e.slice(0, 3) }));
ok('lo guardado coincide con el avance de la alumna (6 estrellas, 9 partidas, 4 aciertos)', guardados[0] && guardados[0].e.slice(0, 3).join() === '3,2,1' && guardados[0].j.reduce((a, b) => a + b, 0) === 9 && guardados[0].k.reduce((a, b) => a + b, 0) === 4);
await doc.hash('#/alumnos', 900);
ok('la lista muestra a Ana', (await doc.texto()).includes('Ana') && (await doc.texto()).includes('6/18'));
await doc.clic('.alumno', 900);
ok('el detalle muestra juegos, aciertos y a qué le cuesta', (await doc.texto()).includes('Le cuesta más') && (await doc.texto()).includes('El péndulo'));
await doc.clic('#quitar', 400); await doc.clic('#si-quitar', 900);
ok('quitar a un alumno lo saca de la lista', (await doc.alumnos()).length === 0);
await doc.hash('#/alumnos/pegar', 800);
await doc.ev("document.getElementById('cod').value=" + JSON.stringify(codigo)); await doc.clic('#anadir', 900);
ok('pegar el código de texto también lo añade', (await doc.alumnos()).length === 1);
await doc.hash('#/alumnos/pegar', 700);
await doc.ev("document.getElementById('cod').value='CL1|abc|Ana|1|x'"); await doc.clic('#anadir', 500);
ok('un código dañado muestra un aviso claro y no añade nada', (await doc.texto()).includes('Ese código') && (await doc.alumnos()).length === 1);
ok('sin errores de JavaScript en el teléfono del docente', doc.errores.length === 0, doc.errores.join(' | '));

// ---- 3) agrupar una clase sembrada (dos tipos de alumnos)
const PERF = { A: [0.9, 0.9, 0.9, 0.9, 0.9, 0.9], B: [0.9, 0.15, 0.9, 0.9, 0.9, 0.9] };
const sembrada = [];
['A', 'B'].forEach((g) => { for (let i = 0; i < 9; i++) {
  const r = AGRUPAR.azar(7 * 31 + g.charCodeAt(0) * 13 + i), j = [], k = [], e = [];
  for (let q = 0; q < 6; q++) { const p = 3 + Math.floor(r() * 4); let a = 0; for (let t = 0; t < p; t++) if (r() < PERF[g][q]) a++; j.push(p); k.push(a); e.push(Math.max(0, Math.min(3, (g === 'A' ? 3 : 2) + (a / p > 0.7 ? 1 : -1)))); }
  sembrada.push({ id: 'z' + g + i, nombre: g + i, t: Date.now(), e: e.concat([0, 0, 0, 0, 0]), j, k, min: 20, d: '000000' });
} });
await doc.ev('localStorage.setItem("chispalab.perfiles.v1",' + JSON.stringify(JSON.stringify(docente(sembrada))) + ')');
await doc.ev('location.reload()'); await dormir(2500);
await doc.hash('#/alumnos', 1000);
ok('con 18 alumnos aparece «Agrupar mi clase»', (await doc.texto()).includes('Agrupar mi clase'));
await doc.clic('#agrupar', 1500);
const t = await doc.texto();
ok('muestra grupos con lo que les cuesta y una sugerencia, y cómo lo calculó', /Grupo 1/.test(t) && /Les cuesta más/.test(t) && /💡/.test(t) && t.includes('¿Cómo lo calculó Chispa?'));

console.log(fallos ? '\nHAY FALLOS: ' + fallos : '\nClase: todo bien');
salir();
process.exit(fallos ? 1 : 0);
