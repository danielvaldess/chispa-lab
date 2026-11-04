// Copia la web a www/ para que Capacitor la empaquete en la app de Android.
import { cpSync, rmSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const raiz = fileURLToPath(new URL('..', import.meta.url));
const destino = join(raiz, 'www');
rmSync(destino, { recursive: true, force: true });
mkdirSync(destino);
for (const ruta of ['index.html', 'lab.html', 'sensores.html', 'manifest.webmanifest', 'icon.svg', 'icon-180.png', 'icon-192.png', 'icon-512.png', 'sw.js', 'css', 'js']) {
  cpSync(join(raiz, ruta), join(destino, ruta), { recursive: true });
}
console.log('www/ listo');
