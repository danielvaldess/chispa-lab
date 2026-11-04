import test from 'node:test';
import assert from 'node:assert/strict';
import { detectarTono } from '../js/pitch.js';

const SR = 44100;
const seno = (hz, n = 4096, amp = 0.5) =>
  Float32Array.from({ length: n }, (_, i) => amp * Math.sin((2 * Math.PI * hz * i) / SR));

for (const hz of [220, 440, 523.25, 880]) {
  test(`detecta ${hz} Hz`, () => {
    const medido = detectarTono(seno(hz), SR);
    assert.ok(medido && Math.abs(medido - hz) / hz < 0.01, `medido: ${medido}`);
  });
}

test('el silencio no tiene tono', () => assert.equal(detectarTono(new Float32Array(4096), SR), null));

test('con un armónico aún encuentra la fundamental', () => {
  const a = seno(300);
  const b = seno(600, 4096, 0.25);
  const mezcla = a.map((v, i) => v + b[i]);
  const medido = detectarTono(mezcla, SR);
  assert.ok(Math.abs(medido - 300) / 300 < 0.01, `medido: ${medido}`);
});
