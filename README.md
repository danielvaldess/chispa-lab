<h1 align="center">Chispa Lab</h1>

<p align="center">
  <b>Un laboratorio de ciencias donde no existe un laboratorio.</b><br/>
  Videojuego educativo para el teléfono: el estudiante predice, juega y descubre,
  con objetos de casa y los sensores de su propio móvil.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/licencia-MIT-green" alt="Licencia MIT" />
  <img src="https://img.shields.io/badge/hack4edu-2026-005588" alt="hack4edu 2026" />
  <img src="https://img.shields.io/badge/Reto-17-e8590c" alt="Reto 17" />
  <img src="https://img.shields.io/badge/idiomas-ES%20%C2%B7%20EN%20%C2%B7%20PT-blue" alt="Idiomas" />
  <img src="https://img.shields.io/badge/estado-en%20desarrollo-yellow" alt="En desarrollo" />
</p>

---

## ¿Qué es?

**Reto 17 de #hack4edu 2026 (sede UTP Veraguas).** Muchas escuelas no tienen laboratorio.
Chispa Lab convierte el teléfono y los objetos cotidianos (una rampa de cartón, una canica,
una moneda colgada de un hilo) en un laboratorio de física que se juega.

Cada nivel sigue el mismo ciclo, el del método científico:

1. **Predecir**: el estudiante dice qué cree que va a pasar.
2. **Jugar**: lo prueba con el teléfono (inclinándolo, tocando, usando el micrófono).
3. **Descubrir**: compara su predicción con sus propios datos y entiende por qué.

**Chispa**, un robot tutor, acompaña con preguntas en lugar de dar la respuesta.

## Principios de diseño

- **Aprender, no engancharse:** la recompensa premia afinar y comprobar; no hay cuentas
  regresivas que presionen, anuncios ni culpa por no volver.
- **Funciona en un móvil modesto:** sin motores pesados, con control táctil de respaldo si
  falta un sensor.
- **Tres idiomas:** español, inglés y portugués.
- **Privacidad:** sin cuentas y sin datos personales.

<p align="center"><a href="https://chispalab.sweetcode.studio"><b>Probar el juego</b></a> (en el móvil, en vertical)</p>

## Los tres niveles

| Nivel | Qué se aprende | Cómo se juega |
|---|---|---|
| 🔵 **La rampa** | Más inclinación, más aceleración: la canica llega antes | Elige el ángulo (o inclina el teléfono) y suelta la canica para que tarde un tiempo exacto |
| ⏱️ **El péndulo** | El periodo depende del largo del hilo, no de la masa | Construye un reloj de 1 segundo y cambia de objeto: moneda, llaves, manzana, lata |
| 🍾 **La botella** | Más agua, menos aire, nota más aguda | Afina una botella a una nota objetivo y, de bonus, tararea la nota con el micrófono |

Cada nivel termina con hasta 3 estrellas: una por completarlo, otra por acertar la predicción
y otra por afinar con pocos intentos (o, en la botella, con la voz).

## Cómo funciona

- **Física real:** las simulaciones usan las fórmulas del fenómeno (esfera rodando
  `a = 5/7·g·sen θ`, péndulo `T = 2π√(L/g)`, tubo cerrado `f = v / 4(L + 0,6r)`), en
  [`js/physics.js`](js/physics.js), con pruebas.
- **Micrófono:** el tono se detecta con el método YIN ([`js/pitch.js`](js/pitch.js)); el audio no se
  graba ni sale del teléfono.
- **Sin conexión:** es una PWA; un service worker guarda los archivos y el juego funciona sin internet.
- **Sin dependencias:** HTML, CSS y JavaScript puros (módulos ES). Sonidos generados con Web Audio.
- **Idiomas:** español, inglés y portugués; se elige según el navegador y se puede cambiar en el menú.
- **Privacidad:** sin cuentas ni datos personales. Solo se guardan en el dispositivo el idioma, el sonido
  y las estrellas.

## Ejecutar

Requiere Node 20 o superior (solo para el servidor estático y las pruebas).

```bash
npm start        # http://localhost:8080
npm test         # pruebas de física, tono, textos, progreso y PWA
```

El juego está pensado para el móvil en vertical; en el ordenador, abre las herramientas de
desarrollo y activa la vista de dispositivo.

## Estructura

```
index.html          punto de entrada
css/styles.css      sistema visual
js/main.js          menú, idioma, sonido
js/levels/          rampa.js · pendulo.js · botella.js
js/physics.js       modelos físicos (puros)
js/pitch.js         detector de tono YIN
js/microfono.js     escucha del micrófono
js/i18n.js          textos es/en/pt
js/ui.js            componentes y robot Chispa
js/audio.js         efectos con Web Audio
js/progreso.js      estrellas y ajustes locales
sw.js               modo sin conexión
test/               pruebas con node:test
```

## Estado

Escrito durante el hackatón #hack4edu 2026 (3–5 de noviembre); el historial de commits de este
repositorio es el registro del trabajo. Los tres niveles son jugables. Probado en Chromium
(escritorio emulando móvil); falta probar en teléfonos reales, el sensor de inclinación y el
micrófono en dispositivos físicos.

## Licencia

Código bajo licencia [MIT](LICENSE).
