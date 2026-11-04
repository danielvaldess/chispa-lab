# IA ligera y ética: el tutor de Chispa

> Este documento explica qué IA tiene Chispa Lab, qué hace y qué no, y cómo se protege a los niños.
> Relacionado: [`alineacion-profuturo.md`](alineacion-profuturo.md) y [`impacto-y-etica.md`](impacto-y-etica.md).

## Qué es (y qué no es)

Chispa Lab incluye una **IA ligera de tres piezas**, todas clásicas, pequeñas y explicables, que corren en el teléfono sin internet:

1. **Seguimiento bayesiano del conocimiento** (*Bayesian Knowledge Tracing*, [`js/tutor.js`](../js/tutor.js)): estima, para cada idea científica, **la
   probabilidad de que el niño la domine** (secciones «Qué observa» y «El modelo»).
2. **Diagnóstico de ideas erróneas** ([`js/diagnostico.js`](../js/diagnostico.js)): cada respuesta equivocada de una predicción delata una idea concreta
   (por ejemplo, «si el ángulo se duplica, el tiempo se reduce a la mitad»). Un clasificador bayesiano ingenuo calcula la probabilidad de cada idea errónea.
3. **Tutor socrático con aprendizaje por niño** ([`js/pistas.js`](../js/pistas.js) y [`js/bandido.js`](../js/bandido.js)): arma una pregunta, una pista y una
   explicación con **los números que midió el propio jugador**, y un *bandido de Thompson* aprende si a ese niño le sirve más la pista de una vez o que
   Chispa pregunte primero.

- **Es** un conjunto de modelos pequeños (unos 23 KB de código en total para las piezas 2 y 3), que se calcula en el teléfono, **sin internet,
  sin servidor y sin librerías**.
- **No es** inteligencia artificial generativa ni un chatbot: las frases de Chispa son plantillas escritas de antemano, con huecos que se rellenan con los
  números del niño; **no inventa texto**. No reconoce rostros ni voces para identificar a nadie, y no usa datos de otros niños.
- Es **explicable**: cada estimación se puede reconstruir con unos pocos números y una fórmula (abajo).

## Qué observa

Al terminar un juego, el tutor recibe dos pistas:

1. **Idea (concepto):** ¿el niño **predijo bien** antes de jugar? Cada juego empieza con una pregunta de tres opciones; acertarla es evidencia de que
   entiende la idea. **Esta es la que mueve el «dominio» de la idea.**
2. **Soltura (destreza):** ¿logró los retos con facilidad (tercera estrella)? Esto se estima **por separado** y **no** cambia el dominio de la idea, solo
   se usa para ajustar el margen al empezar.

Ejemplo: un niño que falla la predicción pero acierta el reto a base de intentos **no** aparece como que domina la idea, y uno que entiende la idea
pero le cuesta el reto con las manos o la voz **sí** sube en dominio. Es una decisión de diseño para no penalizar a quien tiene dificultades motrices
o de voz (los juegos de micrófono, con el apoyo «voz», ni siquiera cuentan la soltura).

## El modelo

Para cada idea se guardan dos probabilidades, `p` (dominio de la idea) y `h` (soltura), que empiezan en 0,25. Con cada evidencia se actualizan:

- Si fue correcta: `posterior = p·(1−S) / (p·(1−S) + (1−p)·G)`
- Si fue incorrecta: `posterior = p·S / (p·S + (1−p)·(1−G))`
- Luego aprende: `p' = posterior + (1−posterior)·0,15`, acotado entre 0,01 y 0,99.

| Evidencia | G (acertar sin saber) | S (fallar sabiendo) |
|---|---|---|
| Predicción (idea) | 0,33 (tres opciones) | 0,10 |
| Soltura (destreza) | 0,20 | 0,15 |

**Importante:** estos valores son los **habituales por defecto**, **no están ajustados con datos de niños**. Un piloto permitiría calibrarlos.
Un cálculo a mano: desde 0,25, una predicción acertada da 0,25·0,9 / (0,25·0,9 + 0,75·0,33) = 0,476, y luego 0,476 + 0,524·0,15 ≈ **0,555**. Está
comprobado en las pruebas automáticas ([`test/tutor.test.js`](../test/tutor.test.js)).

## Diagnóstico de ideas erróneas

Cada predicción tiene una respuesta correcta y opciones equivocadas, y **cada opción equivocada delata una idea concreta** (catálogo en
`CATALOGO` de [`js/diagnostico.js`](../js/diagnostico.js); hoy son 10 ideas en 6 juegos). Para cada juego se mantiene una probabilidad por
hipótesis: «entiende la idea» y «tiene la idea errónea k». Se empieza con 40 % para «entiende» y el resto repartido, y con cada respuesta se aplica la
regla de Bayes con estas probabilidades por defecto (**no ajustadas con datos de niños**):

| Si la hipótesis es… | Elige la correcta | Elige una que delata la idea | Elige otra |
|---|---|---|---|
| Entiende | 0,80 | — | 0,20 repartido |
| Tiene la idea errónea k | 0,15 (azar) | 0,70 repartido entre las que la delatan | 0,15 repartido |

Cálculo a mano (rampa, primera respuesta «la mitad del tiempo»): entiende 0,4·0,1 = 0,040; «proporcional» 0,3·0,7 = 0,210; «no importa» 0,3·0,15 = 0,045;
al normalizar (÷ 0,295) salen 0,136 · **0,712** · 0,153. Está comprobado en [`test/ia.test.js`](../test/ia.test.js). Solo se muestra una idea si su
probabilidad supera 0,5 **y** a la de «entiende», para no señalar sin motivo.

## Tutor socrático y bandido

Al terminar un juego, [`js/pistas.js`](../js/pistas.js) arma tres ayudas con frases escritas de antemano y los números que midió el jugador: una **pregunta** que
parte de su idea («Usaste 5° y 10°, y pasó de 1,5 s a 1,1 s. ¿Es la mitad?»), una **pista** con una cuenta sencilla («1,1 ÷ 1,5 = 0,73; la mitad sería 0,5») y una
**explicación** que reconoce por qué la idea tiene sentido. No hay texto generado: si falta un dato, la plantilla usa una versión sin números.

El **bandido de Thompson** ([`js/bandido.js`](../js/bandido.js)) decide, por jugador, si la pista aparece **de una vez** o si Chispa **pregunta primero** y el niño pide la
pista con un botón. Aprende de si la **siguiente partida del mismo juego** sale bien (acierta la predicción o logra la tercera estrella). Es una aproximación: en
esa partida influyen otras cosas. Empieza sin preferencia y se adapta a cada niño sin salir del teléfono.

## Qué tan bien funciona (simulación, no piloto)

En [`test/simulacion.test.js`](../test/simulacion.test.js) se usan **alumnos sintéticos** con una idea errónea conocida, que responden con probabilidades
**distintas** de las que supone el modelo (para que la prueba no sea circular). Resultado medido con 400 alumnos por caso:

- Tras 5 respuestas, el diagnóstico identifica la idea errónea correcta en **≈ 68 %** de los casos (56 % tras la primera respuesta). Es más bajo en los juegos con una sola idea errónea
  (péndulo 56 %, globo 61 %).
- Señala una idea errónea a **≈ 1 %** de los alumnos que sí entienden (el umbral de 0,5 prioriza no acusar en falso).

**Esto es una simulación.** No demuestra que funcione con niños reales ni que mejore el aprendizaje; solo comprueba que la matemática hace lo que decimos.

## Costo en el teléfono

Medido con [`test/rendimiento.test.js`](../test/rendimiento.test.js) y [`scripts/medir-navegador.mjs`](../scripts/medir-navegador.mjs) (Chromium con la CPU frenada seis veces, que **no es** un teléfono real):

| Medida | Resultado |
|---|---|
| Código de la IA nueva (3 archivos, sin comprimir) | ≈ 22,9 KB |
| Lo que se guarda por jugador (últimos 30 intentos por juego, probabilidades) | ≈ 9 KB |
| Tiempo de una partida terminada en la IA, CPU ×6 más lenta | ≈ 0,4 ms |
| Tiempo de armar las pistas, CPU ×6 más lenta | ≈ 0,01 ms |

Corre solo cuando termina un juego, no durante la partida, y no usa red. Hace falta medirlo en un teléfono de gama baja real.

## Qué decide

Solo tres cosas, todas pequeñas y reversibles:

1. **Recomienda el siguiente juego:** el de menor dominio entre los que ya jugó; si no hay, el primero sin jugar. El niño solo ve una insignia
   «⭐ Para ti».
2. **Ajusta el margen al empezar un reto:** un poco más de margen si le cuesta lograrlo (×1,25), un poco menos si lo logra con soltura (×0,9). Se combina
   con el ajuste que ya hacía el juego durante la partida (3 fallos seguidos dan más ayuda), y **nunca vuelve imposible un reto**.
3. **Explica a un adulto** cómo va cada idea, en el panel «Para adultos y docentes» (Empezando, Avanzando, Lo domina), con el porqué
   («predijo bien 1 de 2 · lo logró con soltura 2 de 3») y una pregunta para conversar.

## Qué no hace

- No pone **notas** al niño ni le muestra porcentajes: solo ve ánimo.
- No **etiqueta ni diagnostica**. Es una guía de observación, no una evaluación oficial.
- No **envía nada** a ningún sitio. Lo que sabe el tutor vive solo en el teléfono, dentro del perfil del jugador.
- No compara a un niño con otros.

## Salvaguardas

| Riesgo | Qué hacemos |
|---|---|
| Pérdida de control | Un **adulto puede apagarlo** («IA de Chispa: Sí/No») y entonces **deja de registrar**; y puede **reiniciar** lo que sabe de ese jugador |
| Sesgo contra quien tiene dificultades motrices o de voz | La idea se estima **solo con predicciones**, no con destreza; con el apoyo «voz» la soltura de los juegos de micrófono se ignora |
| Que el modelo se equivoque | Los parámetros son por defecto; se dice con claridad; solo decide cosas pequeñas y reversibles; el adulto decide |
| Privacidad | Todo se calcula y guarda en el teléfono; sin cuentas ni servidor; se borra con «Borrar todos los datos» |
| Opacidad | Está documentado con fórmulas, probado y explicado en lenguaje llano en la propia app («¿Cómo decide Chispa?») |
| Etiquetar a un niño | Las etiquetas (Empezando, Avanzando, Lo domina) solo las ve un adulto, y hablan de una idea, no de la persona |

## Límites (dicho con claridad)

- **No hay evidencia de que mejore el aprendizaje.** Hace falta un piloto con niños y docentes para comprobarlo.
- **Parámetros sin calibrar.** Con pocos datos por niño (unas pocas partidas) las estimaciones son aproximadas.
- **Una predicción de tres opciones** es una medida gruesa de comprensión; puede acertarse por azar (el modelo lo tiene en cuenta, pero no lo elimina).
- **El diagnóstico de ideas erróneas es una hipótesis**, no una prueba: con una o dos respuestas puede equivocarse (en la simulación acierta ≈ 56 % tras una respuesta). Por eso solo se muestra
  al adulto como «para conversar» y las pistas del niño no lo mencionan.
- **El catálogo de ideas erróneas lo escribimos nosotros**, sin validarlo con docentes ni con niños. Faltaría revisarlo con un docente de ciencias.
- La investigación sobre este tipo de modelos muestra que pueden tratar distinto a distintos grupos de alumnos; por eso no se usan para **excluir ni calificar**,
  solo para recomendar y ajustar con control humano ([estudio sobre equidad en BKT](https://arxiv.org/abs/2205.02333)). No encontré estudios de BKT funcionando
  sin conexión en escuelas con pocos recursos, así que esto es una propuesta, no un resultado ya demostrado.

## Por qué es útil en contextos desfavorecidos

Las soluciones de IA para educación suelen necesitar servidores, conexión estable y datos en la nube. Este tutor demuestra lo contrario: una adaptación útil
**funciona sin internet, sin servidor y en un teléfono barato**, por lo que llega a escuelas que las soluciones en la nube no alcanzan, y los datos de los
niños **no salen del teléfono**.

## Cómo se podría validar

1. Piloto breve con niños (con consentimiento) y un docente.
2. Comparar el dominio estimado con lo que el docente observa en una conversación.
3. Medir si las recomendaciones llevan a más predicciones acertadas en la sesión siguiente.
4. Calibrar G, S y el aprendizaje con esos datos, **sin sacarlos del teléfono**, o con datos anonimizados y con consentimiento.
