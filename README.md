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

## Experimentos con materiales

Además de los seis juegos, el menú tiene una sección **opcional** de experimentos de verdad, con cosas de casa. No hacen falta para encender la estación ni cuentan para los finales,
y cada uno se puede **simular en la pantalla** si no hay materiales (un laboratorio *híbrido*: virtual o real). Todos siguen el ciclo científico: predicción, **hipótesis**
(«Si cambio ___, entonces ___ porque ___»), prueba justa, datos, conclusión y un **cuaderno de laboratorio** que queda en el teléfono.

| Experimento | Materiales | Qué se aprende |
|---|---|---|
| 🧵 **El péndulo de hilo** | Hilo, un objeto pequeño y el cronómetro del teléfono | El tiempo depende del largo del hilo (no del peso) y crece como su raíz; gráfica de T² contra el largo y estimación de la gravedad |
| 🔎 **Chispa detective: ¿ácido o base?** | Jugo de col morada, vasos, limón, bicarbonato, vinagre y la cámara | La col es un indicador: el niño le **enseña** a Chispa tres vasos y ella reconoce los vasos misteriosos por su color (aprendizaje con pocas muestras en el teléfono) |

Cada experimento abre con una tarjeta de seguridad (adulto cerca, solo cosas de cocina, no probar ni oler, no mezclar productos de limpieza). Chispa **no mide el pH**: dice a cuál de los
vasos que le enseñaron se parece, y si no está segura lo dice.

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

## Investigación y presentación

- **Artículo de investigación** con datos de Panamá, evidencia de la literatura, mediciones técnicas propias y ODS, con fuentes y una nota de qué se verificó: [`docs/investigacion/articulo.md`](docs/investigacion/articulo.md).
- **Presentación de 5 minutos** (11 diapositivas, con notas y guion): [`docs/presentacion/`](docs/presentacion/).
- **Transferencia al mercado:** [`docs/transferencia-al-mercado.md`](docs/transferencia-al-mercado.md).

## IA ligera y ética

Chispa incluye una **IA ligera de tres piezas** que corre **en el teléfono, sin internet y sin enviar datos** (unos 23 KB de código, sin librerías):

- **Tutor bayesiano:** estima qué ideas domina cada niño y recomienda el siguiente juego.
- **Diagnóstico de ideas erróneas:** cada respuesta equivocada delata una idea concreta («si doblo el ángulo, el tiempo baja a la mitad») y se calcula su probabilidad con la regla de Bayes.
- **Tutor socrático:** al terminar cada juego, Chispa hace una pregunta, da una pista y explica **con los números que midió el propio niño**; un bandido de Thompson aprende si a ese
  niño le sirve más la pista de una vez o que Chispa pregunte primero.

No es IA generativa: las frases son plantillas con huecos, no inventan texto. Un adulto puede apagarla («IA de Chispa: Sí/No») o reiniciarla, y no penaliza las dificultades motrices o de voz.
En una **simulación** (no un piloto) el diagnóstico identifica la idea errónea en ≈ 68 % de los casos tras 5 respuestas y señala a ≈ 1 % de quienes sí entienden. Detalle, fórmulas, costo medido y límites en [`docs/ia-etica.md`](docs/ia-etica.md);
cómo puede sostenerse en [`docs/transferencia-al-mercado.md`](docs/transferencia-al-mercado.md).

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
js/tutor.js         tutor bayesiano (dominio de cada idea)
js/metodo.js        hipótesis, prueba justa, estadística y cuaderno de laboratorio
js/color-ml.js      aprendizaje de colores con pocas muestras (centroide más cercano)
js/experimento.js   pantallas comunes de los experimentos con materiales
js/niveles/hilo.js  experimento del péndulo de hilo
js/niveles/col.js   experimento ácido/base con col morada
js/diagnostico.js   diagnóstico de ideas erróneas
js/pistas.js        pregunta, pista y explicación con los datos del jugador
js/bandido.js       aprendizaje por niño (bandido de Thompson)
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

Código bajo licencia [MIT](LICENSE). Documentación y recursos (`docs/`) bajo [CC BY-NC-SA 3.0](docs/LICENCIA.md).
