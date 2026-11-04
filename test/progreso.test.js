import test from 'node:test';
import assert from 'node:assert/strict';
import { leer, guardar, registrarResultado, total } from '../js/progreso.js';

const falso = (inicial = null) => {
  let valor = inicial;
  return { getItem: () => valor, setItem: (_, v) => { valor = v; } };
};

test('sin datos devuelve el estado inicial', () => {
  const e = leer(falso());
  assert.equal(total(e), 0);
  assert.equal(e.sonido, true);
  assert.deepEqual(e.puntos, { rampa: 0, pendulo: 0, voz: 0 });
});

test('descarta valores corruptos o fuera de rango', () => {
  const e = leer(falso(JSON.stringify({ estrellas: { rampa: 9, pendulo: 'x', voz: 2 }, puntos: { rampa: -5, voz: 1200 } })));
  assert.deepEqual(e.estrellas, { rampa: 0, pendulo: 0, voz: 2 });
  assert.deepEqual(e.puntos, { rampa: 0, pendulo: 0, voz: 1200 });
});

test('JSON roto no rompe el juego', () => assert.equal(total(leer(falso('{no'))), 0));

test('solo guarda si mejora la marca y avisa del récord', () => {
  const almacen = falso();
  const e = leer(almacen);
  assert.equal(registrarResultado(e, 'rampa', 2, 500, almacen).record, true);
  const r = registrarResultado(e, 'rampa', 1, 300, almacen);
  assert.equal(r.record, false);
  assert.equal(r.anterior, 500);
  const guardado = leer(almacen);
  assert.equal(guardado.estrellas.rampa, 2);
  assert.equal(guardado.puntos.rampa, 500);
});

test('si el almacenamiento falla, no lanza', () => {
  const roto = { getItem: () => { throw new Error('x'); }, setItem: () => { throw new Error('x'); } };
  assert.equal(total(leer(roto)), 0);
  assert.doesNotThrow(() => guardar(leer(roto), roto));
});
