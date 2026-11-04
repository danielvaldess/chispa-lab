# IA ligera y ética: el tutor de Chispa

> Este documento explica qué IA tiene Chispa Lab, qué hace y qué no, y cómo se protege a los niños.
> Relacionado: [`alineacion-profuturo.md`](alineacion-profuturo.md) y [`impacto-y-etica.md`](impacto-y-etica.md).

## Qué es (y qué no es)

Chispa Lab incluye un **tutor adaptativo** basado en *Bayesian Knowledge Tracing* (seguimiento bayesiano del conocimiento), una técnica
clásica de aprendizaje automático para la educación. Estima, para cada idea científica de un juego, **la probabilidad de que el niño la
domine** a partir de lo que ocurre cuando juega.

- **Es** un modelo pequeño, con unas pocas líneas de código ([`js/tutor.js`](../js/tutor.js)), que se calcula en el teléfono, **sin internet,
  sin servidor y sin librerías**.
- **No es** inteligencia artificial generativa ni un chatbot, no reconoce rostros ni voces para identificar a nadie, y no usa datos de otros niños.
- Es **explicable**: cada estimación se puede reconstruir con cuatro números y una fórmula (abajo).

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
| Pérdida de control | Un **adulto puede apagarlo** («Recomendaciones de Chispa: Sí/No») y entonces **deja de registrar**; y puede **reiniciar** lo que sabe de ese jugador |
| Sesgo contra quien tiene dificultades motrices o de voz | La idea se estima **solo con predicciones**, no con destreza; con el apoyo «voz» la soltura de los juegos de micrófono se ignora |
| Que el modelo se equivoque | Los parámetros son por defecto; se dice con claridad; solo decide cosas pequeñas y reversibles; el adulto decide |
| Privacidad | Todo se calcula y guarda en el teléfono; sin cuentas ni servidor; se borra con «Borrar todos los datos» |
| Opacidad | Está documentado con fórmulas, probado y explicado en lenguaje llano en la propia app («¿Cómo decide Chispa?») |
| Etiquetar a un niño | Las etiquetas (Empezando, Avanzando, Lo domina) solo las ve un adulto, y hablan de una idea, no de la persona |

## Límites (dicho con claridad)

- **No hay evidencia de que mejore el aprendizaje.** Hace falta un piloto con niños y docentes para comprobarlo.
- **Parámetros sin calibrar.** Con pocos datos por niño (unas pocas partidas) las estimaciones son aproximadas.
- **Una predicción de tres opciones** es una medida gruesa de comprensión; puede acertarse por azar (el modelo lo tiene en cuenta, pero no lo elimina).
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
