# Impacto y ética

> Cómo encaja el juego con ProFuturo y con el reto 17: [`alineacion-profuturo.md`](alineacion-profuturo.md).

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
| Registro de aprendizaje | Solo en el teléfono | Por nivel: partidas, predicciones acertadas, tiempo y estrellas. Se ve en Ajustes, «Para adultos y docentes» |
| Audio del micrófono | No se guarda | Se analiza en el momento para calcular el tono |
| Imagen de la cámara | No se guarda | Se reduce a 64×48 píxeles para calcular color, sombra o movimiento y se descarta |

**No hay servidor, cuentas ni análisis de uso:** la app no envía nada a ningún sitio. Si el teléfono pierde la app o se borra el
almacenamiento, los datos se pierden. Con «Borrar todos los datos» (en Ajustes) o «Borrar a [nombre]» se eliminan al instante.

## Principios de diseño

1. **Apoyos, no diagnósticos.** La pantalla pregunta «¿Qué te ayuda a jugar?», con casillas opcionales y sin nombrar enfermedades. No
   etiqueta a nadie.
2. **Un adulto confirma en menores.** Si la persona tiene menos de 18 años y elige algún apoyo, hace falta que un adulto (madre, padre,
   tutor o docente) lo confirme antes de guardarlo. Es un criterio conservador (en España el consentimiento propio llega a los 14 años;
   en Panamá los datos de salud son sensibles y el consentimiento debe ser explícito).
3. **Mínimo de datos.** Solo se pide lo que cambia el juego. El día de nacimiento no se guarda.
4. **Todo se puede cambiar o borrar.** En Ajustes, en cualquier momento.
5. **Sin presión.** No hay anuncios, cuentas regresivas que apuren ni culpa por no volver. Con el modo calma no hay destellos, sacudidas
   ni confeti, y se puede pausar para descansar.
6. **Nada depende de un solo sentido.** Los sonidos tienen equivalente visual, los colores van acompañados de símbolos, el texto puede
   agrandarse y leerse en voz alta, y los controles pueden ser grandes, con botones «+» y «−».

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
  acompañar ejercicios que indique un especialista. La literatura que lo motiva son estudios piloto pequeños (juegos de voz para niños con
  trastornos de voz, práctica en casa con juegos de habla), sin ensayos controlados grandes.
- **Las bandas de dificultad por edad son heurísticas** y no se han validado con niños. Se ajustan solas durante el juego (tras tres fallos
  seguidos ayudan más; tras dos aciertos seguidos exigen un poco más), pero necesitan un piloto.
- **No se ha probado con niños, terapeutas ni docentes**, ni en teléfonos reales.
- **No es asesoría legal.** El diseño evita enviar datos a terceros, que es la mejor manera de reducir el riesgo, pero conviene que una
  persona experta lo revise antes de usarlo con menores de forma amplia.
- **La cámara ajusta sola la exposición**, por eso se mide color y sombra dentro de la misma imagen y no el brillo absoluto. En poca luz
  la detección de color puede fallar; hay una alternativa con tarjetas.

## Fuentes consultadas

- [Game Accessibility Guidelines](https://gameaccessibilityguidelines.com/): ajustes recordados, ritmo propio, dificultad ajustable, texto claro.
- [Lopes et al., Interspeech 2019](https://www.isca-archive.org/interspeech_2019/lopes19_interspeech.pdf): juego de fonación sostenida para niños con trastornos de voz.
- [Apraxia World y juegos de voz de la Universidad Texas A&M](https://psi.engr.tamu.edu/publications/?tgid=25): práctica en casa con retroalimentación automática.
- [Xbox Accessibility Guideline 118: fotosensibilidad](https://learn.microsoft.com/de-de/gaming/accessibility/xbox-accessibility-guidelines/118): evitar destellos repetitivos.
- [Aspect Autism Friendly Design Guide (2025)](https://www.aspect.org.au/uploads/documents/Aspect-Autism-Friendly-Design-Guide-July-2025.pdf): colores apagados, diseño predecible, pasos visibles.
- [Recomendaciones de juegos para discalculia (Estudos em Design)](https://estudosemdesign.emnuvens.com.br/design/en/article/view/1272) y [Dislexia: interfaces de juegos accesibles (SBC)](https://sol.sbc.org.br/index.php/ihc_estendido/article/view/8393).
- [Infografía de la AEPD sobre consentimiento de menores](https://www.aepd.es/infografias/infografia-consentimiento-menores.pdf) y [Ley 81 de 2019 de Panamá](https://vlex.com.pa/vid/ley-81-2019-proteccion-1049691931).
