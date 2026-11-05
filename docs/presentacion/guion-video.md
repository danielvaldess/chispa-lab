# Guion del vídeo de 3 minutos (entrega del 5 de noviembre)

Las bases piden **un vídeo de 3 minutos o una presentación de 5 minutos, más el enlace al código**. Entregamos el vídeo (un juego se entiende mejor jugando) y dejamos lista la presentación de 5 minutos
para la final del evento. El vídeo tiene que **mostrar el juego en los primeros 15 segundos**.

## Antes de grabar

- Grabar la pantalla del teléfono (o del emulador) en vertical, con el sonido del juego. **Poner el teléfono en modo avión y que se vea** en una toma: es lo que se valora (conectividad limitada).
- Un teléfono Android de gama baja si es posible; si no, decirlo en el vídeo.
- Tener a mano: cuenta de jugador creada, un hilo con una moneda, un vaso con jugo de col morada y limón (opcional: se puede usar el modo simulado y decirlo).
- Voz clara, sin música alta. Subtítulos en español.

## Escenas

| Tiempo | Qué se ve | Qué se dice |
|---|---|---|
| 0:00–0:12 | Teléfono en modo avión; se abre Chispa Lab; Chispa saluda | «Esto es Chispa Lab: un laboratorio de ciencias en el teléfono de un niño. Y está en modo avión: no necesita internet.» |
| 0:12–0:40 | La rampa: elige una predicción, inclina el teléfono, cae la canica en el vaso | «Antes de jugar, el niño predice. Después inclina el teléfono, que es la rampa, y descubre qué pasó con sus propios datos.» |
| 0:40–1:00 | Resultado equivocado: Chispa pregunta con los números del niño y aparece la pista | «Si se equivoca, Chispa no le da la respuesta: le pregunta con sus números, “¿es la mitad?”. Es una IA pequeña, en el teléfono.» |
| 1:00–1:25 | El péndulo de hilo: hipótesis con casillas, cronómetro, gráfica | «También hay experimentos de verdad con cosas de casa: formula su hipótesis, hace una prueba justa, mide y dibuja su gráfica.» |
| 1:25–1:50 | **Mi laboratorio** (juego libre): col y limón, burbujas con bicarbonato, sale un descubrimiento | «Y no todo está guiado: en Mi laboratorio juega libre, sin tiempo ni reglas, y los descubrimientos aparecen solos.» |
| 1:50–2:20 | **La clase:** la alumna toca «Compartir con mi docente» y muestra su QR; el docente toca «Mis alumnos», escanea y ve su avance | «Al registrarse cada persona elige si es estudiante o docente. La alumna muestra un QR y el docente lo escanea, sin internet: su lista queda solo en su teléfono.» |
| 2:20–2:35 | **Agrupar mi clase:** con 18 alumnos, el docente toca «🤖 Agrupar mi clase» y aparecen los grupos con lo que les cuesta y una sugerencia | «Y Chispa aprende de la clase: agrupa a los alumnos con aprendizaje automático, en el teléfono, y le dice al docente qué experimento reforzar. El docente decide.» |
| 2:35–2:50 | Ajustes y apoyos; modo calma | «Es para todos: siete apoyos opcionales y una dificultad que aprende de cada niño y nunca es imposible. Los datos no salen del teléfono.» |
| 2:50–3:00 | Tarjeta final: enlace de la web, del APK y del repositorio | «Código abierto, sin servidor. Siguiente paso: el piloto con docentes y niños en Veraguas. Gracias.» |

## Clips listos (mudos, de 20 a 30 segundos) para poner de fondo mientras se narra

Están en la carpeta `videos/` del equipo y en la release de GitHub. Se narran en vivo; no llevan sonido ni efectos.

| Clip | Qué muestra | Escena del guion |
|---|---|---|
| `01-rampa.mp4` | Predice, inclina, falla y acierta | 0:12–0:40 y 0:40–1:00 |
| `02-pendulo.mp4`, `03-voz-y-globo.mp4`, `04-globo-largo.mp4`, `05-luz-y-color.mp4`, `06-burbujas-magicas.mp4` | Los demás juegos | Alternativa o apoyo |
| `07-mi-laboratorio.mp4` | Mezclas, flota, plantas y caída libre | 1:25–1:50 |
| `08-registro-estudiante-o-docente.mp4` | La pregunta inicial y el recorrido de docente y de estudiante | Apoyo de la escena de la clase |
| `09-clase-qr-alumna-y-docente.mp4` | Dos teléfonos lado a lado: la alumna muestra el QR y el docente lo escanea y ve su lista | 1:50–2:20 |
| `11-inclusion-apoyos.mp4` | Registro de un niño que marca sus apoyos, el resumen de lo que cambia en el juego y Ajustes | Apoyo de la escena de inclusión |
| `10-ia-agrupa-la-clase.mp4` | El docente con 18 alumnos agrupa su clase: grupos, qué les cuesta y sugerencia | 2:20–2:35 |

Todos están grabados en Chromium con tamaño de teléfono. En `09`, la cámara del docente es una cámara simulada que enfoca el mismo QR que muestra la alumna. Para el vídeo de entrega conviene **grabar también la pantalla de un teléfono real** haciendo esto mismo: es la mejor evidencia de que funciona fuera del navegador.

## Lo que NO hay que decir

- Si preguntan por el origen: todo el proyecto se desarrolló entre el 3 y el 5 de noviembre; la primera versión (rampa, péndulo, voz) se escribió el 3 de noviembre, ya iniciado el plazo, y se incorporó al repositorio el 4. No hay trabajo previo; el detalle está en la [bitácora](../evidencia-desarrollo.md).
- Que se probó con niños o que mejora el aprendizaje: no hay piloto. Las cifras de la IA son de simulación con alumnos sintéticos.
- Que Chispa «mide el pH» o «diagnostica»: reconoce el color que se le enseñó, y no es un aparato médico.
- Que está «validado» con niños o docentes: no hay piloto. Sí se puede decir que **el autor la probó en un teléfono y funciona**, y que las mediciones de fluidez son de Chromium con la CPU limitada.
- Cifras de Ciencias de 6.º de Panamá: no hay un dato publicado en 2024 o después (el ERCE 2025 sale a fines de 2026). Para hablar de aprendizaje, usar el ERCE Pospandemia 2025 (lectura 27,7 % y matemática 10,1 % en 6.º).
