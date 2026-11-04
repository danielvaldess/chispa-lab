import test from 'node:test';
import assert from 'node:assert/strict';
import { TEXTOS, IDIOMAS, t, fijarIdioma, detectarIdioma } from '../js/i18n.js';

const variables = (s) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort().join(',');

test('los tres idiomas tienen exactamente las mismas claves', () => {
  const claves = Object.keys(TEXTOS.es).sort();
  for (const idioma of IDIOMAS) assert.deepEqual(Object.keys(TEXTOS[idioma]).sort(), claves, idioma);
});

test('ningún texto está vacío y las {variables} coinciden entre idiomas', () => {
  for (const [clave, es] of Object.entries(TEXTOS.es)) {
    for (const idioma of IDIOMAS) {
      const texto = TEXTOS[idioma][clave];
      assert.ok(texto && texto.trim(), `${idioma}:${clave} vacío`);
      assert.equal(variables(texto), variables(es), `${idioma}:${clave} variables`);
    }
  }
});

test('t() sustituye variables y cae a la clave si no existe', () => {
  fijarIdioma('en');
  assert.equal(t('menu.energia', { n: 4, total: 9 }), 'Station energy: 4 of 9');
  assert.equal(t('no.existe'), 'no.existe');
  fijarIdioma('es');
});

test('detectarIdioma', () => {
  assert.equal(detectarIdioma(['pt-BR', 'en']), 'pt');
  assert.equal(detectarIdioma(['fr-FR', 'en-US']), 'en');
  assert.equal(detectarIdioma(['fr']), 'es');
});

import { readFileSync } from 'node:fs';

test('no hay claves repetidas dentro de un mismo idioma', () => {
  const fuente = readFileSync(new URL('../js/i18n.js', import.meta.url), 'utf8');
  for (const bloque of fuente.split(/\n  (?:es|en|pt): \{/).slice(1)) {
    const cuerpo = bloque.split('\n  },')[0];
    const claves = [...cuerpo.matchAll(/^ {4}'([^']+)':/gm)].map((m) => m[1]);
    assert.equal(new Set(claves).size, claves.length, `repetidas: ${claves.filter((c, i) => claves.indexOf(c) !== i)}`);
  }
});
