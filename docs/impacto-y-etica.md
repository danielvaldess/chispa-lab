# Impacto y ética

> Cómo encaja el juego con ProFuturo y con el reto 17: [`alineacion-profuturo.md`](alineacion-profuturo.md). La IA del juego: [`ia-etica.md`](ia-etica.md).

## A quién ayuda

Muchas escuelas no tienen laboratorio. Chispa Lab convierte el teléfono (inclinación, micrófono, cámara) y objetos de casa en un
laboratorio de ciencias que se juega, sin conexión y sin cuentas. Además adapta el juego a cada niño: **por edad** (más o menos margen
para acertar, nunca imposible) y por **lo que le ayuda a jugar** (voz, oír, ver, concentrarse, leer o números, mover las manos, luces o
ruidos que molestan).

## Qué se guarda y qué no

| Dato | Dónde | Detalle |
|---|---|---|
| Nombre o apodo | Solo en el teléfono | Hasta 20 letras |
| Mes y año de nacimiento | Solo en el teléfono | **No se guarda el día**; solo sirve para calcular la edad |
| Apoyos elegidos | Solo en el teléfono | Opcionales. No hay lista de diagnósticos ni se pide ninguno |
| Progreso, estrellas y récords | Solo en el teléfono | Por jugador |
| Sesiones de «El globo largo» | Solo en el teléfono | Fecha, segundos sostenidos y rango de tono. El adulto puede **copiar** el resumen; nada se envía solo |
| Dominio de cada idea (tutor) | Solo en el teléfono | Dos estimaciones por idea que calcula el tutor; solo lo ve un adulto y se puede apagar o reiniciar. Ver [`ia-etica.md`](ia-etica.md) |
| Registro de aprendizaje | Solo en el teléfono | Por nivel: partidas, predicciones acertadas, tiempo y estrellas. Se ve en Ajustes, «Para adultos y docentes» |
| Rol (estudiante o docente) | Solo en el teléfono | Solo cambia lo que se ve en el menú; no es una cuenta ni una clave |
| Lista de alumnos de un docente | Solo en el teléfono del docente | Nombre o apodo, estrellas, partidas, aciertos, minutos y descubrimientos que cada alumno le **mostró** con su QR o su código; hasta 60 por docente. Se puede quitar a un alumno o borrar todo desde Ajustes |
| Código QR o de texto del alumno | Se muestra al docente cuando el alumno quiere | No incluye fecha de nacimiento, apoyos, voz ni cuaderno; no pasa por internet ni por ningún servidor. Detalle en [`clase-sincronizacion.md`](clase-sincronizacion.md) |
| Audio del micrófono | No se guarda | Se analiza en el momento para calcular el tono |
| Imagen de la cámara | No se guarda | Se reduce a 64×48 píxeles para calcular color, sombra o movimiento y se descarta |

**No hay servidor, cuentas ni análisis de uso:** la app no envía nada a ningún sitio. Si el teléfono pierde la app o se borra el
almacenamiento, los datos se pierden. Con «Borrar todos los datos» (en Ajustes) o «Borrar a [nombre]» se eliminan al instante.

## Principios de diseño

1. **Apoyos, no diagnósticos.** La pantalla pregunta «¿Qué te ayuda a jugar?», con casillas opcionales y sin nombrar enfermedades. No
   etiqueta a nadie.
2. **Un adulto confirma en menores.** Si la persona tiene menos de 18 años y elige algún apoyo, hace falta que un adulto (madre, padre,
   tutor o docente) lo confirme antes de guardarlo. Es un criterio conservador: en Panamá los datos de salud son sensibles y el consentimiento debe ser explícito (Ley 81 de 2019, norma vigente citada como excepción; ver Fuentes).
3. **Mínimo de datos.** Solo se pide lo que cambia el juego. El día de nacimiento no se guarda.
4. **Todo se puede cambiar o borrar.** En Ajustes, en cualquier momento.
5. **Sin presión.** No hay anuncios, cuentas regresivas que apuren ni culpa por no volver. Con el modo calma no hay destellos, sacudidas
   ni confeti, y se puede pausar para descansar.
6. **Recompensas que no excluyen.** Los finales y las recompensas por estrellas (diploma, Chispa científico, estación dorada) son cosméticos: nada
   necesario para jugar queda bloqueado. Completar los juegos basta para el primer final, con 2 estrellas basta con predecir bien y, con el apoyo de voz, la
   tercera estrella de los juegos de voz no depende del tiempo ni de la estabilidad del tono.
7. **Nada depende de un solo sentido.** Los sonidos tienen equivalente visual, los colores van acompañados de símbolos, el texto puede
   agrandarse y leerse en voz alta, y los controles pueden ser grandes, con botones «+» y «−».

8. **Compartir es decisión del alumno.** Antes de mostrar el QR, la pantalla dice con sus propias cifras qué verá el docente y qué no. El código no es una firma: sirve para acompañar y conversar, no para calificar. Si el alumno es menor, conviene que la escuela tenga el permiso de las familias antes de usarlo en clase (esto lo decide el centro, no la app).

## Qué cambia según el apoyo

| Apoyo | Cambios |
|---|---|
| Hablar o la voz | Micrófono más sensible, margen más ancho y tiempos más cortos; «El globo largo» (vocal sostenida) primero en el menú; sin límite de tiempo |
| Oír | Cada tic y tac del péndulo también se ve; la vibración queda activa |
| Ver | Alto contraste, texto más grande, símbolos además del color |
| Concentrarme | Modo calma, pausa para descansar, margen algo mayor |
| Leer o los números | Texto más grande y lectura en voz alta |
| Mover las manos | Botones grandes, «+» y «−», más margen, barra en lugar de inclinar el teléfono |
| Luces, ruidos o cambios me molestan | Modo calma, sin destellos, sonidos más suaves, avisos antes de cada juego |

## Límites (dicho con claridad)

- **Chispa Lab no es un aparato médico ni un tratamiento y no da diagnósticos.** «El globo largo» es un juego de práctica que puede
  acompañar ejercicios que indique un especialista. La evidencia reciente que encontramos mide usabilidad de un videojuego de articulación del habla en niños (Saeedi et al., 2024), no eficacia clínica ni en voz.
- **Las bandas de dificultad por edad son heurísticas** y no se han validado con niños. Se ajustan solas durante el juego (tras tres fallos
  seguidos ayudan más; tras dos aciertos seguidos exigen un poco más), pero necesitan un piloto.
- **No se ha probado con niños, terapeutas ni docentes.** El autor la probó en un teléfono y reporta que funciona (sin registrar el modelo).
- **No es asesoría legal.** El diseño evita enviar datos a terceros, que es la mejor manera de reducir el riesgo, pero conviene que una
  persona experta lo revise antes de usarlo con menores de forma amplia.
- **La cámara ajusta sola la exposición**, por eso se mide color y sombra dentro de la misma imagen y no el brillo absoluto. En poca luz
  la detección de color puede fallar; hay una alternativa con tarjetas.

## En qué guía se apoya cada cambio

Fuentes de 2024 o posteriores, consultadas el 4 de noviembre de 2026. Las guías de diseño son documentos vivos: se anota cuándo se actualizó cada una cuando la página lo dice.

| Cambio en Chispa Lab | Respaldo | Nivel |
|---|---|---|
| Botones grandes y bien separados, con «+» y «−» | Game Accessibility Guidelines, nivel básico: «controles virtuales grandes y bien espaciados, sobre todo en pantallas táctiles pequeñas» | D |
| Alternativa sin micrófono (barra) y sin cámara (tarjetas) | Game Accessibility Guidelines: el habla y el gesto no deben ser obligatorios, solo una entrada complementaria o alternativa | D |
| Ajustar la dificultad durante la partida; nunca volverla imposible | Game Accessibility Guidelines: nivel básico «ofrecer varios niveles de dificultad»; nivel intermedio «cambiar la dificultad durante el juego, por ajustes o dificultad adaptativa» | D |
| Evidencia de que la dificultad adaptativa converge a niveles adecuados en niños | Pasqualotto et al., con datos de 148 niños (juego de memoria de trabajo; no es un juego de ciencias) | D |
| Sin tiempos exactos obligatorios; con apoyo de voz se quita el tiempo | Game Accessibility Guidelines: «no hacer esencial la precisión de tiempos; ofrecer alternativas» | D |
| Equivalente visual de cada sonido; símbolos además de colores | Game Accessibility Guidelines: ninguna información esencial solo por color ni solo por texto | D |
| Texto grande, alto contraste, lectura en voz alta | Game Accessibility Guidelines: «tamaño de letra legible por defecto», «alto contraste entre texto e interfaz» | D |
| Modo calma sin destellos ni sacudidas | Xbox Accessibility Guideline 118 (fotosensibilidad; aproximadamente 1 de cada 4.000 personas puede sufrir una convulsión por imágenes con destellos; página actualizada el 4 de marzo de 2026) y Game Accessibility Guidelines («evitar imágenes parpadeantes y patrones repetitivos») | D |
| Colores apagados, pasos visibles y estructura predecible | Aspect Autism Friendly Design Guide (julio de 2025): tonos neutros y apagados, flujo paso a paso, previsibilidad | D |
| Práctica sin fallar (laboratorio libre sin reglas ni tiempo) | Game Accessibility Guidelines, nivel intermedio: «un modo de práctica sin fallar, como un nivel de práctica o un modo libre» | D |
| Juego de vocal sostenida con retroalimentación visual | Saeedi et al., *Scientific Reports*, 2024: un videojuego para niños de 3 a 6 años con trastornos de los sonidos del habla tuvo usabilidad satisfactoria; **mide usabilidad, no eficacia** | D |
| Datos de un menor solo en el teléfono, con confirmación de un adulto | Ley 81 de 2019 de Panamá, protección de datos personales (**excepción de norma vigente**, anterior a 2024) | B |

## Por qué estas bandas de edad

Las bandas de dificultad por edad (más margen para los más pequeños, menos para los mayores) son **una heurística nuestra**. No encontramos un estudio de 2024 o posterior que mida el tiempo de reacción o la destreza táctil infantil por edad, así que **no tenemos una fuente que respalde los números concretos**. Lo que sí respaldan las fuentes recientes es el principio: que la dificultad se pueda ajustar durante el juego y que un ajuste adaptativo converja a niveles individuales (cuadro anterior). Por eso los márgenes se corrigen solos durante la partida y quedan pendientes de calibrar con un piloto.

Los valores que usa hoy el juego (`js/ajustes.js`, `BANDAS`), tal cual están en el código:

| Edad | Margen para acertar (×) | Tiempo que se mantiene una nota (×) |
|---|---|---|
| 6 años o menos | 1,8 | 0,7 |
| 7 y 8 | 1,4 | 0,85 |
| 9 y 10 | 1,15 | 1,0 |
| 11 a 13 | 1,0 | 1,0 |
| 14 o más | 0,8 | 1,15 |

Un multiplicador mayor significa más margen. Son números nuestros, no de un estudio.

## Fuentes consultadas

- [Game Accessibility Guidelines, lista completa](https://gameaccessibilityguidelines.com/full-list/) (sitio vivo, consultado el 4 de noviembre de 2026).
- [Xbox Accessibility Guideline 118: fotosensibilidad](https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/118) (actualizada el 4 de marzo de 2026).
- [Aspect Autism Friendly Design Guide (julio de 2025)](https://www.aspect.org.au/uploads/documents/Aspect-Autism-Friendly-Design-Guide-July-2025.pdf).
- [Saeedi et al. (2024), *Scientific Reports* 14, 17299](https://doi.org/10.1038/s41598-024-68119-x): videojuego para niños con trastornos de los sonidos del habla.
- [Pasqualotto et al., dificultad dinámica probabilística en niños](https://cris.huji.ac.il/en/publications/modeling-skill-progression-in-children-through-novel-multidimensi/).
- [Ley 81 de 2019 de Panamá](https://vlex.com.pa/vid/ley-81-2019-proteccion-1049691931) (norma vigente; excepción a la regla de fechas).
- Referencias del contexto de Panamá y de la evidencia educativa: [`investigacion/articulo.md`](investigacion/articulo.md), sección 11.
