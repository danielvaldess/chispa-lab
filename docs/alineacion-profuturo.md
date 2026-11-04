# Alineación con ProFuturo y con el reto 17

Este documento responde a una pregunta concreta: **¿Chispa Lab cumple lo que busca ProFuturo y lo que pide el reto 17?** Está
escrito para ser honesto: dice dónde encaja bien, dónde hay brechas y qué falta comprobar.

## Qué es ProFuturo y qué busca

ProFuturo es un programa de educación digital creado en 2016 por Fundación Telefónica y Fundación «la Caixa». Según sus propios
materiales:

- **Misión:** reducir la brecha educativa con educación digital de calidad y **equitativa** para niños en contextos vulnerables, incluidos
  estudiantes con discapacidad ([Telefónica, 2016](https://www.telefonica.com/es/sala-comunicacion/prensa/telefonica-y-la-caixa-se-alian-para-impulsar-la-educacion-digital-de-ninos-en-paises-emergentes/)).
- **Cómo lo hace:** contenido que **funciona sin internet** en aulas digitales móviles, dispositivos accesibles, **formación docente** como
  foco principal y metodologías innovadoras para desarrollar competencias del siglo XXI.
- **Alcance reportado en 2024:** 3.609 escuelas en 30 países, 262.000 docentes y 941.785 niños, según
  [su memoria de actividad](https://profuturo.education/wp-content/uploads/2025/07/memoriadeactividad_2024.pdf) y el
  [comunicado de sus nueve años](https://www.elindependiente.com/economia/empresas/2025/07/17/profuturo-nueve-anos-mayor-proyecto-educativo-espanol-africa-latinoamerica/).
- **Para 2026:** integrar la inteligencia artificial en su ecosistema y reforzar la medición de impacto
  ([plan de actuación 2026 de Fundación Telefónica](https://www.fundaciontelefonica.com/wp-content/uploads/2026/01/Documento-2-Doc-3_Plan-de-actuacion-2026.pdf)).
- **hack4edu:** hackatón organizado por ProFuturo y la UPSA para encontrar soluciones tecnológicas a retos de educación digital
  ([Corresponsables](https://www.corresponsables.com/social/ods4-profuturo-upsa-hack4edu-hackaton-virtual-educacion-digital/)).

*Límites de esta información:* las cifras son autorreportadas, la mayoría de 2016 a 2024, y no pude leer la página de objetivos 2026
de ProFuturo (devolvió error); lo de 2026 viene del plan de actuación y de resúmenes. Conviene contrastarlo con ProFuturo antes de citarlo
como definitivo.

## Lo que pide el reto 17

> Crear un laboratorio educativo virtual, interactivo o híbrido que permita experimentar con fenómenos físicos, químicos, biológicos o
> matemáticos utilizando dispositivos accesibles. Podrán incorporar simulaciones, realidad aumentada, sensores económicos o inteligencia
> artificial, siempre que permitan formular hipótesis, experimentar, observar resultados y desarrollar pensamiento científico. Se valorará
> especialmente su funcionamiento en dispositivos de bajo coste y entornos con conectividad limitada.

| Qué pide | Cómo responde Chispa Lab | Balance |
|---|---|---|
| Laboratorio donde no hay laboratorio | El teléfono y objetos de casa son el laboratorio | Cumple |
| Formular hipótesis | Cada nivel empieza con una **predicción** del niño | Cumple (opción múltiple, no libre) |
| Experimentar y observar resultados | Se juega con sensores o simulaciones y el resultado muestra los datos del propio niño | Cumple |
| Desarrollar pensamiento científico | Al final, una pregunta para razonar con sus datos y una explicación | Cumple, sin medir todavía el aprendizaje |
| Dispositivos accesibles y de bajo coste | Solo el teléfono; sin librerías, ES5, modo ligero en móviles de pocos núcleos | Cumple; **falta probarlo en un Android barato** |
| Conectividad limitada | App instalable (PWA y APK) que funciona sin internet | Cumple |
| Simulaciones, realidad aumentada, sensores | Simulaciones físicas, cámara con realidad aumentada ligera, micrófono e inclinación | Cumple |
| Física, química, biología, matemáticas | Solo **física** (movimiento, oscilaciones, sonido, luz) y algo de color | Parcial: no hay química ni biología |

## Los cuatro criterios del Premio Retos ProFuturo

El reto 17 lleva la etiqueta «Reto ProFuturo», así que opta a una segunda evaluación con cuatro criterios de 25 % cada uno.

1. **Impacto social en contextos vulnerables o con brechas de acceso.**
   *A favor:* llega a escuelas sin laboratorio con un teléfono, sin internet y sin cuentas; es gratuito y de código abierto (MIT).
   *Falta:* un **piloto** con niños en un contexto real; no hay datos de impacto y no los inventamos.
2. **Enfoque inclusivo y equitativo.**
   *A favor:* la parte más fuerte. Siete apoyos opcionales (voz, oír, ver, concentrarse, leer o números, mover las manos, sensibilidad a luces
   o ruidos), dificultad por edad que **nunca** se vuelve imposible, modo calma, alto contraste, texto grande, lectura en voz alta, equivalentes
   visuales de los sonidos y una alternativa sin micrófono, sin cámara y sin sensor en cada juego.
   *Falta:* validarlo con niños, familias y especialistas; las bandas de edad son heurísticas.
3. **Sostenibilidad y escalabilidad.**
   *A favor:* no hay servidor ni coste por usuario; un mismo archivo sirve a miles de teléfonos; el código es abierto.
   *Falta:* una **guía de distribución sin internet** (compartir el archivo de la app de un teléfono a otro) y un plan para que los docentes lo
   adopten. Una primera guía breve para el aula ya está dentro de la app, en Ajustes, «Para adultos y docentes».
4. **Uso ético y responsable de la IA.**
   *Hoy:* Chispa Lab incluye una **IA ligera y explicable**: un tutor adaptativo que estima, **en el teléfono y sin internet**, qué ideas domina cada niño y
   recomienda el siguiente juego (modelo bayesiano, no generativo). Tiene control humano (un adulto puede apagarlo o reiniciarlo), no envía datos a nadie,
   no califica ni etiqueta al niño y **no penaliza las dificultades motrices o de voz** (el dominio de una idea se estima solo con predicciones). Está
   documentado con sus fórmulas, sus límites y sus salvaguardas en [`ia-etica.md`](ia-etica.md).
   *Falta:* **no está validado** con niños ni docentes y sus parámetros no están calibrados; no usa IA generativa. ProFuturo quiere integrar IA en 2026: una
   extensión razonable sería ayuda para el docente que funcione en el teléfono, sin enviar datos y con revisión humana. No está hecha ni se promete aquí.

## Docentes y medición de impacto

ProFuturo pone el foco en los docentes y en medir el impacto. Chispa Lab ya incluye, dentro de Ajustes y fuera de la vista del niño, el panel
**«Para adultos y docentes»**:

- resumen por jugador de partidas, predicciones acertadas, tiempo jugado y estrellas, solo en el teléfono;
- **la idea que más le cuesta** (la que menos acierta al predecir) con una pregunta para conversar;
- una guía breve para usarlo en el aula y el registro de práctica de voz.

Es una **guía de observación, no una evaluación oficial**.

**Indicadores propuestos para un piloto** (no medidos todavía): porcentaje de predicciones acertadas antes y después de varias sesiones,
número de intentos hasta acertar un pedido, tiempo de uso por sesión y opinión de docentes y niños.

## Contenidos y currículo

| Juego | Idea de ciencia |
|---|---|
| La rampa de cartón | Movimiento: la aceleración y por qué doblar el ángulo no reduce el tiempo a la mitad |
| El péndulo del estante | Oscilaciones: el periodo depende del largo, no de la masa |
| La voz y el globo, El globo largo | Sonido: frecuencia y tono; vocal sostenida |
| Luz y color | Luz: color de los objetos y sombras |
| Burbujas mágicas | Cómo una cámara detecta movimiento (comparar fotos) |

*No se ha validado con el currículo oficial de ningún país.* Antes de usarlo en un aula, un docente debería comprobar cómo encaja con su programa.

## Idiomas

Hoy el juego está **solo en español**, que es lo que piden las bases del evento (permiten español, inglés y portugués). ProFuturo también trabaja
en países de habla portuguesa e inglesa, así que traducirlo es el siguiente paso natural para escalar.

## Resumen honesto

- **Encaja muy bien** en: llevar un laboratorio donde no lo hay, funcionar sin internet y con un solo teléfono, inclusión y ética de los datos.
- **Tiene brechas** en: evidencia de impacto (falta un piloto), cobertura de otras ciencias, distribución sin internet y validación de la IA.
- **No está comprobado** con niños, docentes ni especialistas, ni en teléfonos reales de gama baja.

Ver también [`impacto-y-etica.md`](impacto-y-etica.md) para el detalle de los datos, los apoyos y los límites, [`ia-etica.md`](ia-etica.md) para el tutor y
[`transferencia-al-mercado.md`](transferencia-al-mercado.md) para cómo puede sostenerse.
