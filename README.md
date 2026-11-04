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
  <img src="https://img.shields.io/badge/idioma-espa%C3%B1ol-blue" alt="Idioma" />
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
| 🎢 **La rampa de cartón** | Al doblar el ángulo, la canica tarda menos, pero no la mitad | Inclina el teléfono (o la barra) y suelta la canica para que llegue al vaso en 3, 2 y 1,4 s |
| ⏱ **El péndulo del estante** | El periodo depende del largo del hilo, no de la masa | Iguala el ritmo de la lámpara cambiando el largo del hilo con una moneda, unas llaves, una manzana o una lata |
| 🎤 **La voz y el globo** | Más agudo = más vibraciones por segundo | Canta una nota base y súbela para pasar el globo por tres aros (con micrófono o con barra) |

Cada pedido da puntos según la precisión, con **combo**. Cada nivel da hasta 3 estrellas y, al final, una
pregunta con tus datos y una explicación de qué pasó. Además hay un **laboratorio real**
([`lab.html`](lab.html)) que mide con los sensores del teléfono (péndulo, pulso y sonido) y una página de
[prueba de sensores](sensores.html).

## Cómo funciona

- **Física real:** las escenas usan las fórmulas del fenómeno, en [`js/fisica.js`](js/fisica.js), y el
  tono se detecta con el método YIN en [`js/dsp.js`](js/dsp.js). El audio no se graba ni sale del teléfono.
- **Sin conexión:** es una PWA; un service worker guarda los archivos y el juego funciona sin internet.
- **Sin dependencias:** HTML, CSS y JavaScript puros (ES5, para celulares viejos). Las escenas se dibujan en
  canvas 2D con degradados y sombras para dar volumen sin motores 3D.
- **Privacidad:** sin cuentas ni datos personales. Solo se guardan en el dispositivo las estrellas y los récords.
- **Accesibilidad:** respeta `prefers-reduced-motion`, baja las partículas en móviles de pocos núcleos y cada
  nivel tiene alternativa sin sensor (barra) y sin micrófono.

## Ejecutar

Requiere Node 20 o superior (solo para el servidor estático y las pruebas).

```bash
npm start        # http://localhost:8080
npm test         # pruebas de procesamiento de señal y física
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
index.html          el videojuego
lab.html            laboratorio con sensores reales
sensores.html       prueba de sensores del teléfono
css/                style.css · juego.css
js/juego.js         menú, niveles, puntos y resultados
js/lab.js           laboratorio real
js/dsp.js           procesamiento de señal (tono YIN, filtros)
js/fisica.js        fórmulas de la rampa y el péndulo
sw.js               modo sin conexión
android/            proyecto nativo de Capacitor
scripts/            servidor estático y empaquetado
test/               pruebas
```

## Estado

Los tres niveles son jugables. Probado en Chromium (escritorio emulando móvil); falta probar en teléfonos
reales el sensor de inclinación, el micrófono y la vibración.

## Licencia

Código bajo licencia [MIT](LICENSE).
