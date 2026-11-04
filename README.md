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
Chispa Lab convierte el teléfono y los objetos cotidianos (una rampa de cartón, una moneda colgada de un
hilo, tu propia voz) en un laboratorio de física que se juega. En la historia, **Chispa** necesita ayuda para
encender la estación científica: cada sala es un nivel.

Cada nivel sigue el ciclo del método científico: **predices**, **juegas** y **descubres** qué pasó con tus
propios datos.

## Los tres niveles

| Nivel | Qué se aprende | Cómo se juega |
|---|---|---|
| 🎢 **La rampa de cartón** | Más inclinación, menos tiempo, pero no la mitad | Inclina el teléfono (o la barra) y suelta la canica para que llegue al vaso en 3, 2 y 1,4 s |
| ⏱ **El péndulo del estante** | El periodo depende del largo del hilo, no de la masa | Iguala el ritmo de la lámpara cambiando el largo del hilo; cuelga una moneda, unas llaves, una manzana o una lata |
| 🎤 **La voz y el globo** | Más agudo = más vibraciones por segundo | Canta una nota base y súbela ×1,25, ×1,5 y ×2 para pasar el globo por tres aros (con micrófono o con barra) |

Cada pedido da puntos según la precisión, con **combo** (hasta ×5). Cada nivel da hasta 3 estrellas, y al
final una pregunta con tus datos y una explicación de qué pasó.

## Cómo funciona

- **Física real:** las simulaciones usan las fórmulas del fenómeno (canica que rueda `a = 5/7·g·sen θ`,
  péndulo `T = 2π√(L/g)`), en [`js/physics.js`](js/physics.js), con pruebas.
- **Micrófono:** el tono se detecta con el método YIN ([`js/pitch.js`](js/pitch.js)). El audio no se
  graba ni sale del teléfono, y el juego avisa antes de pedir el permiso.
- **Sin conexión:** es una PWA; un service worker guarda los archivos y el juego funciona sin internet.
- **Sin dependencias:** HTML, CSS y JavaScript puros (módulos ES), con las escenas dibujadas en canvas 2D
  con degradados y sombras para dar volumen sin motores 3D, de modo que corra en móviles modestos.
  Sonidos generados con Web Audio.
- **Idiomas:** español, inglés y portugués; se elige según el navegador y se cambia en el menú.
- **Privacidad:** sin cuentas ni datos personales. Solo se guardan en el dispositivo el idioma, el sonido,
  las estrellas y los récords.
- **Accesibilidad:** respeta `prefers-reduced-motion`, reduce partículas en móviles de pocos núcleos y
  cada nivel tiene alternativa sin sensor (barra) y sin micrófono.

## Ejecutar

Requiere Node 20 o superior (solo para el servidor estático y las pruebas).

```bash
npm start        # http://localhost:8080
npm test         # pruebas de física, tono, textos, progreso y PWA
```

### App de Android

La misma web se empaqueta como app nativa con [Capacitor](https://capacitorjs.com) (Android 6.0 o superior).
Requiere JDK 21 y el SDK de Android (`ANDROID_HOME`):

```bash
npm install
npm run android   # genera android/app/build/outputs/apk/debug/app-debug.apk
```

El APK de la última versión está en [Releases](../../releases). En el iPhone, el juego se instala desde
Safari con «Añadir a pantalla de inicio».

El juego está pensado para el móvil en vertical; en el ordenador, abre las herramientas de
desarrollo y activa la vista de dispositivo.

## Estructura

```
index.html          punto de entrada
css/                styles.css (menú y pantallas) · juego.css (escena, HUD y mandos)
js/main.js          navegación, idioma y sonido
js/pantallas.js     menú, predicción y resultado
js/motor.js         lienzo, partículas, puntos con combo y HUD
js/dibujo.js        primitivas de dibujo (degradados, esferas, sombras)
js/niveles/         rampa.js · pendulo.js · voz.js
js/physics.js       modelos físicos (puros)
js/pitch.js         detector de tono YIN
js/microfono.js     lectura del micrófono
js/sensor.js        inclinación del teléfono
js/i18n.js          textos es/en/pt
js/ui.js            componentes y robot Chispa
js/audio.js         efectos con Web Audio
js/progreso.js      estrellas, récords y ajustes locales
sw.js               modo sin conexión
android/            proyecto nativo de Capacitor
scripts/            servidor estático y empaquetado
test/               pruebas con node:test
```

## Estado

Escrito durante el hackatón #hack4edu 2026 (3–5 de noviembre); el historial de commits de este
repositorio es el registro del trabajo. Los tres niveles son jugables. Probado en Chromium
(escritorio emulando móvil); falta probar en teléfonos reales, el sensor de inclinación y el
micrófono en dispositivos físicos.

## Licencia

Código bajo licencia [MIT](LICENSE).
