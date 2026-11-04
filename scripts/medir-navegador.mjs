// Mide la IA de Chispa dentro de Chromium con la CPU frenada (simula un teléfono lento). Sin dependencias (Node 22+).
// Uso: node scripts/serve.mjs   (en otra terminal)  y luego   node scripts/medir-navegador.mjs [frenado=6] [url]
// Variable opcional: CHROME=/ruta/al/chromium
import { spawn } from 'node:child_process';
const FRENO = Number(process.argv[2]) || 6, URL_ = process.argv[3] || 'http://localhost:8080/', PUERTO = 9334;
const chrome = spawn(process.env.CHROME || '/usr/bin/chromium', ['--headless=new', '--no-sandbox', '--disable-gpu', '--remote-debugging-port=' + PUERTO, 'about:blank'], { stdio: 'ignore' });
const dormir = (ms) => new Promise((r) => setTimeout(r, ms));
let lista = null;
for (let i = 0; i < 50 && !lista; i++) { try { lista = await (await fetch('http://127.0.0.1:' + PUERTO + '/json')).json(); } catch (e) { await dormir(200); } }
const ws = new WebSocket(lista.find((x) => x.type === 'page').webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let id = 0; const pend = {};
ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && pend[d.id]) { pend[d.id](d); delete pend[d.id]; } };
const cmd = (method, params = {}) => new Promise((r) => { const i = ++id; pend[i] = r; ws.send(JSON.stringify({ id: i, method, params })); });
const ev = async (expr) => (await cmd('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true })).result.result.value;
await cmd('Runtime.enable'); await cmd('Page.enable');
const perfil = { activo: 'p1', perfiles: [{ id: 'p1', nombre: 'Ana', nac: '2018-03', apoyos: [], extras: {}, progreso: {}, aprendizaje: {}, maestria: {}, creado: '2026-11-04' }] };
await cmd('Page.addScriptToEvaluateOnNewDocument', { source: "try{localStorage.setItem('chispalab.perfiles.v1'," + JSON.stringify(JSON.stringify(perfil)) + ")}catch(e){}" });
await cmd('Page.navigate', { url: URL_ });
await dormir(1500);
await cmd('Emulation.setCPUThrottlingRate', { rate: FRENO });
const med = await ev(`(function(){
  var p = PERF.actual(), ids = ['rampa','pendulo','voz','globo','luz','burbujas'], N = 2000, i, t0, r = {};
  t0 = performance.now();
  for (i = 0; i < N; i++) { var id = ids[i % 6], c = DIAGNOSTICO.CATALOGO[id], ops = Object.keys(c.ideas).concat([c.ok]), op = ops[i % ops.length];
    PERFILES.registrarIA(p, id, { opcion: op, ok: op === c.ok, estrellas: 2, seg: 20, habil: false }); }
  r.registrarIA_ms = (performance.now() - t0) / N;
  t0 = performance.now();
  for (i = 0; i < N; i++) PISTAS.crear('rampa', { ok: false, opcion: 'mitad', datos: { th1: 5, th2: 10, t1: 1.5, t2: 1.1 } });
  r.pistas_ms = (performance.now() - t0) / N;
  t0 = performance.now(); for (i = 0; i < 200; i++) JSON.stringify(PERF.actual()); r.guardar_ms = (performance.now() - t0) / 200;
  r.nucleos = navigator.hardwareConcurrency;
  return r; })()`);
console.log('CPU frenada ×' + FRENO + ' (Chromium headless):', JSON.stringify(med, null, 1));
ws.close(); chrome.kill();
