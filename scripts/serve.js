// Servidor estático mínimo para desarrollo y demo. Sin dependencias.
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = resolve(fileURLToPath(new URL('..', import.meta.url)));
const PUBLICO = ['index.html', 'manifest.webmanifest', 'icon.svg', 'icon-180.png', 'icon-512.png', 'sw.js', 'css', 'js'];
const TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webmanifest': 'application/manifest+json',
};

const servidor = createServer(async (req, res) => {
  const ruta = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  const relativa = normalize(ruta === '/' ? 'index.html' : ruta.slice(1));
  const permitido = PUBLICO.some((p) => relativa === p || relativa.startsWith(p + '/'));
  const archivo = join(RAIZ, relativa);
  try {
    if (!permitido || !archivo.startsWith(RAIZ) || !(await stat(archivo)).isFile()) throw new Error('no');
    res.writeHead(200, {
      'content-type': TIPOS[extname(archivo)] || 'application/octet-stream',
      'cache-control': 'no-cache',
      'x-content-type-options': 'nosniff',
    });
    res.end(await readFile(archivo));
  } catch {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    res.end('No encontrado');
  }
});

const puerto = Number(process.env.PORT) || 8080;
servidor.listen(puerto, () => console.log(`Chispa Lab en http://localhost:${puerto}`));
