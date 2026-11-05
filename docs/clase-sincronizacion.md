# Clase: cómo el avance de un alumno llega a su docente, sin internet

**Qué hay:** al crear un jugador, la app pregunta si es **estudiante** o **docente**. El docente tiene en el menú una opción extra, **«Mis alumnos»**, y el estudiante tiene **«Compartir con mi docente»**.
El alumno muestra un **código QR** con su avance de ese momento; el docente lo **escanea con la cámara** (o pega un código de texto) y el avance queda guardado **en el teléfono del docente**. Sin internet, sin servidor y sin cuentas.

## Cómo se hace en la práctica

1. **Estudiante:** menú → «📤 Compartir con mi docente» → ve qué se comparte → «Mostrar mi código QR».
2. **Docente:** menú → «👩‍🏫 Mis alumnos» → «📷 Escanear el QR de un alumno». Puede escanear uno detrás de otro; cada lectura guarda o actualiza a ese alumno.
3. Cuando un alumno vuelva a mostrar su QR, el avance **se actualiza** (se queda el más nuevo); un código viejo no pisa uno más reciente.
4. En la lista el docente ve estrellas, partidas, predicciones acertadas, minutos, descubrimientos y **a qué juego le cuesta más**; puede copiar un **resumen de la clase** como texto y quitar a un alumno.
5. Plan B, si la cámara falla o el QR no se lee: el alumno **copia o envía el código de texto** (WhatsApp, Bluetooth o Nearby Share, con el botón «Enviar» del propio teléfono) y el docente lo **pega** en «Mis alumnos».

El rol **no es una cuenta ni una clave**: solo cambia lo que se ve en el menú. Quien se declare docente solo tiene lista de alumnos si escanea o pega códigos; no puede ver nada que un alumno no le haya mostrado.

## Qué viaja y qué no

| Viaja en el código | No viaja |
|---|---|
| Identificador aleatorio del jugador, nombre o apodo, minuto del avance | Fecha de nacimiento ni edad |
| Estrellas (0 a 3) de los 6 juegos y 5 experimentos | Los apoyos que eligió («qué te ayuda a jugar») |
| Partidas y predicciones acertadas de los 6 juegos, minutos jugados | Sesiones de voz, cuaderno de laboratorio, lo que la IA sabe del niño |
| Cuántos descubrimientos tiene de «Mi laboratorio» (máscara de bits) | Audio ni imágenes de la cámara |

Antes de mostrar el QR, la pantalla del alumno dice con sus propias cifras qué verá el docente y qué no. El alumno decide cuándo mostrarlo.
El código mide unos 75 a 110 caracteres, así que cabe en un **QR pequeño (37 a 45 módulos de lado)**, fácil de leer para cámaras baratas.

Formato (versión `CL1`, solo caracteres ASCII): `CL1|id|nombre|t|e|j|k|min|d|crc`. El `crc` es un CRC-16 que detecta errores al copiar o escanear; **no es una firma**: cualquiera podría fabricar un código, así que sirve para
conversar y acompañar, no para calificar.

## Qué opciones se compararon y por qué QR

| Opción | Sin internet | Gama baja | Funciona en iPhone y Android | Veredicto |
|---|---|---|---|---|
| **QR con la cámara (elegida)** | Sí | Sí: la cámara ya existe y la lectura es de unos 10 ms por cuadro en un equipo de escritorio | Sí, con un navegador que abra la cámara | **Principal.** Sin permisos nuevos, sin emparejar, un toque por alumno |
| **Código de texto + «Enviar» del teléfono** | Sí | Sí | Sí; `navigator.share` envía por el método nativo (WhatsApp, Bluetooth, Nearby Share) cuando existe (MDN, página de 2026) | **Plan B.** Usa Bluetooth o Nearby Share **a través del sistema**, sin que la app programe nada |
| **Bluetooth desde la app (Web Bluetooth)** | Sí | Regular | **No:** MDN (mayo de 2025) lo marca «disponibilidad limitada» y experimental, y describe solo la conexión a periféricos Bluetooth de baja energía; no encontramos en esa página una forma de que un teléfono ofrezca datos a otro | **Descartada.** Un plugin nativo funcionaría solo en el APK, pediría permisos de Bluetooth, exigiría emparejar y no existiría en la versión web |
| **NFC (Web NFC)** | Sí | Solo teléfonos con NFC | **No:** MDN (julio de 2024) lo marca de disponibilidad limitada y experimental | **Descartada** |
| **Wi-Fi local o punto de acceso del docente** | Sí, pero hace falta una red | Complicado de configurar en un aula | Depende | **Descartada:** exige configurar una red y un servicio, y falla justo donde no hay infraestructura |
| **Servidor en internet** | **No** | — | — | **Descartada:** va contra el reto (conectividad limitada) y obligaría a cuentas y consentimientos para guardar datos de menores en un servidor |
| **Sonido entre teléfonos** | Sí | Poco fiable con ruido de aula | Sí | **Descartada** por fiabilidad |

Las filas de Bluetooth y NFC se apoyan en las páginas de MDN; el resto de la comparación es **criterio nuestro**, no un estudio.

## Cómo está hecho (para quien lo revise)

- `js/clase.js`: formato, CRC, lectura con validación estricta, fusión de alumnos y resúmenes. Funciones puras, probadas en Node.
- `js/alumnos.js`: las pantallas (QR del alumno, lista, detalle, escáner, pegar código).
- `js/vendor/`: dos librerías pequeñas **solo para el QR**, que se cargan únicamente al abrir esas pantallas y se guardan para usarlas sin conexión:
  [`qrcode-generator`](https://github.com/kazuhikoarase/qrcode-generator) 1.4.4 (MIT) para dibujar el QR y [`jsQR`](https://github.com/cozmo/jsQR) 1.4.0 (Apache-2.0) para leerlo si el navegador no trae `BarcodeDetector`.
  Licencias y origen en [`../js/vendor/LICENCIAS.md`](../js/vendor/LICENCIAS.md). Esto cambia lo que decíamos antes («cero librerías»): ahora son **dos, solo para esta función**.
- La lista de alumnos vive dentro del perfil del docente (hasta 4 jugadores por teléfono; hasta 60 alumnos por docente), en el almacenamiento del teléfono. Si se borra la app, se pierde.

## Qué se probó y qué no

- **Probado (automático, `npm test`):** el formato (ida y vuelta, nombres con tildes y eñe, 100 % de los cambios de un carácter detectados), los códigos dañados o ajenos, la fusión y el tope de 60, los roles en el almacén (incluido un perfil guardado antes de esta función), y que **el QR se genera y se lee de vuelta con el texto exacto**, también reducido a unos 2,8 píxeles por módulo para imitar una cámara de baja resolución.
- **Probado (extremo a extremo, en Chromium):** un navegador hizo de alumno y mostró su QR; otro, con una **cámara simulada** enfocando ese QR, lo escaneó y guardó al alumno. También el registro de estudiante y de docente, el detalle, quitar un alumno y pegar un código.
- **NO probado:** con la **cámara de un teléfono real** (enfoque, luz del aula, reflejos en la pantalla del alumno), en un Android barato, ni con el lector nativo `BarcodeDetector`. Tampoco se probó con niños ni con un docente. **No decimos que esté validado en teléfono.**
- **Límites conocidos:** el QR puede costar con poca luz o con la pantalla muy oscura o con reflejos (por eso hay botón de copiar el código); la lista no se sincroniza entre dos teléfonos del mismo docente; no hay copia de respaldo.

## Fuentes de esta página

- MDN Web Docs, *Web Bluetooth API* (última modificación 27 de mayo de 2025): https://developer.mozilla.org/en-US/docs/Web/API/Web_Bluetooth_API · consultada el 4 de noviembre de 2026 **(D)**.
- MDN Web Docs, *Web NFC API* (26 de julio de 2024): https://developer.mozilla.org/en-US/docs/Web/API/Web_NFC_API · consultada el 4 de noviembre de 2026 **(D)**.
- MDN Web Docs, *Navigator: share() method* (16 de julio de 2026): https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share · consultada el 4 de noviembre de 2026 **(D)**.
