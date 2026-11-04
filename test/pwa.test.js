import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const raiz = new URL('..', import.meta.url).pathname;
const leer = (ruta) => readFileSync(join(raiz, ruta), 'utf8');

const archivosJs = (dir) => readdirSync(join(raiz, dir), { withFileTypes: true })
  .flatMap((e) => (e.isDirectory() ? archivosJs(join(dir, e.name)) : e.name.endsWith('.js') ? [join(dir, e.name)] : []));

test('todas las importaciones relativas llevan ?v= (evita mezclar versiones en caché)', () => {
  for (const archivo of archivosJs('js')) {
    for (const [, ruta] of leer(archivo).matchAll(/from '(\.[^']+)'/g)) {
      assert.match(ruta, /\?v=\d+$/, `${archivo}: ${ruta}`);
    }
  }
});

test('todos los módulos de js/ están precacheados en sw.js con la misma versión', () => {
  const sw = leer('sw.js');
  const version = leer('index.html').match(/main\.js\?v=(\d+)/)[1];
  for (const archivo of archivosJs('js')) {
    assert.ok(sw.includes(`'${archivo}?v=${version}'`), `falta ${archivo}?v=${version} en sw.js`);
  }
  assert.ok(sw.includes(`css/styles.css?v=${version}'`));
});

test('index.html y sw.js usan la misma versión de los archivos', () => {
  const html = leer('index.html');
  const v = html.match(/styles\.css\?v=(\d+)/)[1];
  assert.equal(html.match(/main\.js\?v=(\d+)/)[1], v);
});

test('el manifiesto declara pantalla completa en vertical', () => {
  const m = JSON.parse(leer('manifest.webmanifest'));
  assert.equal(m.display, 'fullscreen');
  assert.equal(m.orientation, 'portrait');
});
