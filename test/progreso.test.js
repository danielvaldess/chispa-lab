import test from 'node:test';
import assert from 'node:assert/strict';
import { leer, guardar, registrarEstrellas, total } from '../js/progreso.js';

const falso = (inicial = null) => {
  let valor = inicial;
  return { getItem: () => valor, setItem: (_, v) => { valor = v; } };
};

test('sin datos devuelve el estado inicial', () => {
  const e = leer(falso());
  assert.equal(total(e), 0);
  assert.equal(e.sonido, true);
});

test('descarta valores corruptos o fuera de rango', () => {
  const e = leer(falso(JSON.stringify({ estrellas: { rampa: 9, pendulo: 'x', botella: 2 } })));
  assert.deepEqual(e.estrellas, { rampa: 0, pendulo: 0, botella: 2 });
});

test('JSON roto no rompe el juego', () => assert.equal(total(leer(falso('{no'))), 0));

test('solo guarda si mejora la marca', () => {
  const almacen = falso();
  const e = leer(almacen);
  registrarEstrellas(e, 'rampa', 2, almacen);
  registrarEstrellas(e, 'rampa', 1, almacen);
  assert.equal(leer(almacen).estrellas.rampa, 2);
});

test('si el almacenamiento falla, no lanza', () => {
  const roto = { getItem: () => { throw new Error('x'); }, setItem: () => { throw new Error('x'); } };
  assert.equal(total(leer(roto)), 0);
  assert.doesNotThrow(() => guardar(leer(roto), roto));
});
