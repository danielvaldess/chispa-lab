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

## Los niveles

| Nivel | Qué se aprende | Cómo se juega |
|---|---|---|
| 🎢 **La rampa de cartón** | Al doblar el ángulo, la canica tarda menos, pero no la mitad | Inclina el teléfono (o la barra) y suelta la canica para que llegue al vaso en 3, 2 y 1,4 s |
| ⏱ **El péndulo del estante** | El periodo depende del largo del hilo, no de la masa | Iguala el ritmo de la lámpara cambiando el largo del hilo con una moneda, unas llaves, una manzana o una lata |
| 🎤 **La voz y el globo** | Más agudo = más vibraciones por segundo | Canta una nota base y súbela para pasar el globo por tres aros (con micrófono o con barra) |
| 🎈 **El globo largo** | Una vocal sostenida mantiene un tono casi plano | Canta «aaa» sin prisa y el globo sube mientras suenas; práctica de voz con un registro de sesiones para llevar al especialista |
| 🌈 **Luz y color** | Un objeto se ve de un color porque devuelve esa luz; las sombras tapan la luz | La cámara busca algo rojo, verde y azul, y una sombra de media imagen (o tarjetas si no hay cámara) |
| 🫧 **Burbujas mágicas** | Una cámara detecta movimiento comparando fotos seguidas | Ves la cámara y revientas burbujas moviendo la mano (o tocándolas) |

Cada pedido da puntos según la precisión, con **combo**. Cada nivel da hasta 3 estrellas y, al final, una pregunta con tus datos y una
explicación de qué pasó. 

## Por qué importa

Muchas escuelas no tienen laboratorio. Chispa Lab lleva la experimentación a cualquier salón con un teléfono, sin internet, sin cuentas y gratis.
Es un videojuego que enseña a **formular una hipótesis, probarla y comparar con los datos propios**, y que se adapta a cada niño. Cómo encaja con
la misión de ProFuturo y con el reto 17, con sus brechas y límites dichos con claridad, está en
[`docs/alineacion-profuturo.md`](docs/alineacion-profuturo.md).

## Finales y recompensas

La historia es **encender la estación científica**, y tiene tres finales según las estrellas (la menor cantidad entre los seis juegos):

| Estrellas en cada juego | Qué pasa |
|---|---|
| 1 | **La estación se enciende:** las seis salas se iluminan una a una y Chispa cuenta lo que el jugador descubrió |
| 2 | **A toda potencia:** final mejorado con fuegos artificiales y un **diploma** con su nombre, que se puede guardar como imagen |
| 3 | **La estación de las estrellas:** **Chispa se pone la bata y las gafas de científico** en todo el juego y la estación se vuelve dorada |

Las recompensas son **cosméticas**: nada necesario para jugar queda bloqueado, y con el modo calma no hay fuegos artificiales ni confeti. El final básico solo exige
completar los juegos; con 2 estrellas basta con predecir bien (no depende de la destreza), y con el apoyo de voz la tercera estrella de los juegos de voz no
penaliza el tiempo ni la estabilidad del tono.

## IA ligera y ética

Chispa incluye un **tutor adaptativo** (seguimiento bayesiano del conocimiento, aprendizaje automático clásico, no generativo) que estima qué ideas domina cada
niño, recomienda el siguiente juego y explica el porqué a un adulto. Funciona **en el teléfono, sin internet y sin enviar datos**; un adulto puede apagarlo o
reiniciarlo, y **no penaliza** las dificultades motrices o de voz. Detalle, fórmulas y límites en [`docs/ia-etica.md`](docs/ia-etica.md); cómo puede sostenerse
en [`docs/transferencia-al-mercado.md`](docs/transferencia-al-mercado.md).

## Jugadores y apoyos

Al abrir la app por primera vez, un asistente de una pantalla por paso pide el **nombre o apodo**, el **mes y año de nacimiento** y «**¿qué te
ayuda a jugar?**» (casillas opcionales: voz, oír, ver, concentrarme, leer o los números, mover las manos, luces o ruidos que molestan). Con eso:

- **Edad:** más margen para acertar a los más pequeños y retos más exactos a los mayores. La dificultad se ajusta sola durante la partida y
  **nunca se vuelve imposible**.
- **Apoyos:** modo calma, alto contraste, texto grande y lectura en voz alta, equivalentes visuales de los sonidos, botones grandes con «+» y «−»,
  pausa para descansar y más facilidades en los juegos de voz.
- Hasta **4 jugadores** por teléfono, con su progreso por separado. Sirve en la web, en el iPhone (instalada desde Safari) y en el APK.
- Todo se guarda **solo en el teléfono** y se borra desde Ajustes. Un adulto debe confirmar si el jugador es menor de 18 años y elige algún apoyo.
  Detalle y límites en [`docs/impacto-y-etica.md`](docs/impacto-y-etica.md). Chispa Lab **no es un aparato médico ni da diagnósticos**.
- **Ajustes con secciones** (Pantalla, Sonido y vibración, Qué me ayuda a jugar, Jugadores, Mis datos) y un panel **«Para adultos y docentes»** con el
  resumen de aprendizaje de cada jugador y una guía breve para el aula.

## Cómo funciona

- **Física real:** las escenas usan las fórmulas del fenómeno, en [`js/fisica.js`](js/fisica.js), y el
  tono se detecta con el método YIN en [`js/dsp.js`](js/dsp.js). El audio no se graba ni sale del teléfono.
- **Sin conexión:** es una PWA; un service worker guarda los archivos y el juego funciona sin internet.
- **Sin dependencias:** HTML, CSS y JavaScript puros (ES5, para celulares viejos). Las escenas se dibujan en
  canvas 2D con degradados y sombras para dar volumen sin motores 3D. La cámara y el micrófono se procesan en el teléfono y no se guardan.
- **Privacidad:** sin cuentas ni servidor. Nombre, mes y año de nacimiento, apoyos y progreso viven solo en el dispositivo; no se envía nada.
- **Accesibilidad:** respeta `prefers-reduced-motion`, baja las partículas en móviles de pocos núcleos y cada
  nivel tiene alternativa sin sensor (barra) y sin micrófono.

## Ejecutar

Requiere Node 20 o superior (solo para el servidor estático y las pruebas).

```bash
npm start        # http://localhost:8080
npm test         # señal, física, ajustes, perfiles, cámara, tutor y textos
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
lab.html            herramienta de medición con sensores (sin enlace desde el juego)
sensores.html       prueba de sensores (sin enlace desde el juego)
css/                style.css · juego.css
js/juego.js         menú, niveles, puntos y resultados
js/lab.js           medición con sensores
js/dsp.js           procesamiento de señal (tono YIN, filtros)
js/fisica.js        fórmulas de la rampa y el péndulo
sw.js               modo sin conexión
android/            proyecto nativo de Capacitor
scripts/            servidor estático y empaquetado
test/               pruebas
```

## Estado

Los seis niveles son jugables. Probado en Chromium (escritorio emulando móvil, con micrófono y cámara simulados); falta probar en teléfonos reales
el sensor de inclinación, el micrófono, la cámara, la vibración y la voz sintetizada, y hacer un piloto con niños y con un especialista. Las bandas de
dificultad por edad son heurísticas por validar.

## Licencia

Código bajo licencia [MIT](LICENSE).
