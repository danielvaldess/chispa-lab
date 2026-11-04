import test from 'node:test';
import assert from 'node:assert/strict';
import {
  tiempoRampa, anguloParaTiempo, distanciaRampa, periodoPendulo, largoParaPeriodo,
  frecuenciaBotella, aireParaFrecuencia, errorRelativo,
} from '../js/physics.js';

const cerca = (a, b, tol) => assert.ok(Math.abs(a - b) <= tol, `${a} no está a ${tol} de ${b}`);

test('más inclinación, menos tiempo en la rampa', () => {
  assert.ok(tiempoRampa(30) < tiempoRampa(10));
});

test('rampa de 10° y 1 m: ~1,28 s', () => cerca(tiempoRampa(10), 1.283, 0.01));

test('la distancia al tiempo total es el largo de la rampa', () => {
  cerca(distanciaRampa(25, tiempoRampa(25)), 1, 1e-9);
});

test('anguloParaTiempo invierte tiempoRampa', () => {
  cerca(tiempoRampa(anguloParaTiempo(0.95)), 0.95, 1e-9);
});

test('péndulo de 24,8 cm: ~1 s, y largoParaPeriodo lo invierte', () => {
  cerca(periodoPendulo(0.248), 1, 0.005);
  cerca(periodoPendulo(largoParaPeriodo(1.7)), 1.7, 1e-9);
});

test('el periodo del péndulo crece con el largo', () => {
  assert.ok(periodoPendulo(0.8) > periodoPendulo(0.2));
});

test('más agua en la botella = menos aire = nota más aguda', () => {
  assert.ok(frecuenciaBotella(0.1) > frecuenciaBotella(0.18));
});

test('aireParaFrecuencia invierte frecuenciaBotella', () => {
  cerca(frecuenciaBotella(aireParaFrecuencia(523.25)), 523.25, 1e-6);
});

test('errorRelativo', () => cerca(errorRelativo(530, 500), 0.06, 1e-9));
