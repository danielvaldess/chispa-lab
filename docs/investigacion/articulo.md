# Chispa Lab: un laboratorio de ciencias en cada teléfono

**Un videojuego educativo, inclusivo y sin conexión para llevar la experimentación científica a escuelas sin laboratorio. Contexto de Panamá.**

*Daniel Valdés · UTP, Centro Regional de Veraguas · #hack4edu 2026, reto 17 (Reto ProFuturo) · noviembre de 2026*

---

## Resumen

En Panamá, los estudiantes de sexto grado obtuvieron 672 puntos en Ciencias en el estudio regional ERCE 2019, frente a 702 del promedio regional, y el 48,1 % se ubicó en el nivel de
desempeño más bajo (37,7 % en el resto de los países) [1]. A la vez, cerca del 45 % de los centros educativos públicos no tenía internet según un informe del Ministerio de Educación
divulgado en 2022 [3], y el propio Ministerio licitó en 2026 unos 29 millones de dólares en laboratorios científicos para 73 escuelas [5]. Sin embargo, el país tiene 156,6 líneas móviles
por cada 100 personas [7]: el teléfono ya existe, aun donde el laboratorio y la conexión no. Presentamos **Chispa Lab**, un videojuego educativo de código abierto que convierte el teléfono en
un laboratorio: en seis juegos, el niño **predice** qué ocurrirá, **experimenta** con los sensores del teléfono (inclinación, micrófono, cámara) y **descubre** si acertó con sus propios datos.
El juego funciona **sin internet**, pesa unos 86 KB en la primera carga y no usa librerías externas; se adapta a la edad y a siete apoyos de accesibilidad (voz, audición, visión,
concentración, lectura, motricidad y sensibilidad sensorial); y incorpora un **tutor adaptativo ligero** (seguimiento bayesiano del conocimiento) que corre en el teléfono sin enviar datos.
Describimos el diseño, las mediciones técnicas que hicimos (por ejemplo, unos 31 fotogramas por segundo con la CPU limitada a la cuarta parte), la evidencia de la literatura que lo
respalda, su contribución a los Objetivos de Desarrollo Sostenible 4, 9 y 10, y su potencial de transferencia. **No hemos evaluado todavía el aprendizaje con niños**: la validación en una
escuela es el siguiente paso.

**Palabras clave:** laboratorio de ciencias, educación sin conexión, aprendizaje basado en juegos, inclusión, tutor adaptativo, Panamá, ODS 4.

---

## 1. Introducción

Aprender ciencias es formular una hipótesis, ponerla a prueba y comparar el resultado con lo esperado. Hacerlo exige instrumentos, materiales y un lugar donde equivocarse sin
consecuencias. Muchas escuelas no los tienen. El reto 17 de #hack4edu 2026 pregunta si es posible «llevar la experimentación científica a escuelas que no disponen de materiales ni
equipamiento» con dispositivos accesibles, y valora especialmente el funcionamiento en dispositivos de bajo coste y con conectividad limitada. Este trabajo responde con una idea
sencilla: **usar el dispositivo que ya está en el bolsillo de las familias**.

Este documento sigue la estructura de un artículo: contexto y datos (sección 2), evidencia en la que nos apoyamos (3), el sistema (4), evaluación técnica propia (5), impacto y
Objetivos de Desarrollo Sostenible (6), transferencia al mercado (7), y discusión, límites y conclusiones (8 a 10). Cada dato externo lleva su referencia; la sección 11 dice qué
verificamos directamente en la fuente y qué no.

## 2. El problema en Panamá

### 2.1 Aprendizaje en ciencias

| Indicador | Valor | Fuente |
|---|---|---|
| ERCE 2019, Ciencias, 6.º grado: puntaje de Panamá | **672** frente a **702** del promedio regional (−30 puntos, diferencia estadísticamente significativa) | UNESCO [1] |
| ERCE 2019, Ciencias: estudiantes en el nivel I (el más bajo) | **48,1 %** en Panamá frente a **37,7 %** en el resto de los países participantes | UNESCO [1] |
| ERCE 2019: factores asociados | Los estudiantes de pueblos originarios obtienen resultados más bajos; las niñas obtienen 10 puntos más en Ciencias | UNESCO [1] |
| PISA 2022, Panamá | Lectura 392, Matemáticas 357, Ciencias 388; por debajo del promedio de la OCDE en las tres áreas | La Prensa [2] |

La UNESCO pidió «apoyar de manera urgente a los estudiantes con niveles de desempeño más bajos» [1]. Nuestro juego apunta justamente a ese grupo: niños que hoy no experimentan.

### 2.2 Acceso a laboratorios y a internet

| Indicador | Valor | Fuente |
|---|---|---|
| Centros públicos sin internet (informe del Meduca, noviembre de 2022) | **45 %** de 3.122 centros (el artículo también lista 1.396 centros, cifra que no coincide exactamente con el 45 %) | La Estrella [3] |
| Contrato de internet para escuelas (junio de 2025) | **44 millones de dólares** para **3.102 escuelas** (Cable & Wireless Panamá) | La Prensa [4] |
| Licitación de laboratorios científicos (abril de 2026) | **28.969.463 dólares** para **73 centros**, con **193 aulas** de laboratorio | La Prensa [5] |
| Usuarios de internet (2024) | **72,8 %** de la población (68,5 % en 2023) | Banco Mundial [7] |
| Líneas móviles (2023) | **156,6 por cada 100 personas** | Banco Mundial [7] |
| Gasto público en educación (% del PIB) | **2,47 %** en 2023, frente a 4,30 % en 2020 | Banco Mundial [7] |

Lectura: el Estado está invirtiendo en conectividad y en laboratorios, pero esas inversiones son **grandes, lentas y alcanzan a pocos centros por vez** (73 escuelas en la licitación de
laboratorios), mientras que la penetración móvil supera una línea por persona. Alrededor de uno de cada cuatro panameños no usa internet (100 − 72,8) [7]. Un laboratorio que funcione **en
el teléfono y sin conexión** complementa esas inversiones y llega antes.

### 2.3 Quién queda más atrás

- **Discapacidad infantil.** La Segunda Encuesta Nacional de Discapacidad (ENDIS-2) identifica **174.701 niñas y niños de 2 a 14 años con discapacidad, el 17,1 % de la niñez del país** [6].
  Casi ninguna herramienta de ciencias se adapta a ellos.
- **Comarcas indígenas.** La pobreza multidimensional medida en 2017 fue de **93,4 %** en la comarca Ngäbe Buglé, **91,4 %** en Guna Yala y **70,8 %** en Emberá Wounaan [8]; son cifras de hace
  varios años, y el informe oficial más reciente que encontramos (2025) no pudimos abrirlo en un formato legible.
- **Voz y habla.** En una encuesta a cuidadores en Estados Unidos, el 6,7 % de los niños de 4 a 12 años tenía problemas de voz [20]. **No encontramos una cifra para Panamá**; la citamos solo
  como orden de magnitud internacional.

### 2.4 Una oportunidad en Veraguas

ProFuturo, junto con el Ministerio de Educación, llegó a **76 escuelas de Panamá en entornos vulnerables: 33 en Panamá Oeste, 28 en Veraguas y 15 en Chiriquí**, con más de 700 docentes
y unos 17.000 estudiantes en la fase inicial [9]. La nota no da fecha. A escala global, ProFuturo reportó para 2024 un alcance de 3.609 escuelas en 30 países [10]. Es decir, **existe ya
una red de docentes y escuelas con equipos móviles en la misma provincia donde se desarrolla este proyecto**.

## 3. Evidencia en la que nos apoyamos

| Idea de diseño | Qué dice la evidencia | Límites | Ref. |
|---|---|---|---|
| **Predecir, observar, explicar** (cada juego empieza con una predicción) | Un metaanálisis de 2024 con 35 estudios concluye que la estrategia POE mejora el rendimiento en ciencias con un efecto «alto» | No pudimos verificar el tamaño del efecto numérico; muchos estudios primarios son pequeños | [12] |
| **Aprendizaje con juegos** | Los juegos serios fueron más eficaces que la instrucción convencional (d = 0,29; 77 estudios para aprendizaje) | Efecto pequeño a moderado; mejores resultados combinados con otra enseñanza y con varias sesiones | [14] |
| **Laboratorios virtuales** | Resultados comparables a los reales en revisiones de ciencias; mayores ganancias al combinarlos con práctica manual | Un metaanálisis en ingeniería (g = 0,69) advierte que aún no sustituyen por completo al laboratorio físico | [15] [16] |
| **El teléfono como instrumento** | La app gratuita phyphox usa los sensores del teléfono en la enseñanza de la física, con una experiencia igual en Android y iOS | Es una herramienta para clases guiadas, no un juego para niños pequeños | [17] |
| **Juegos de voz con retroalimentación visual** | Un juego de fonación sostenida motivó a niños con trastornos de voz y promovió fonaciones más largas; un juego para apraxia del habla practicado en casa mostró mejoras y más motivación | Estudios piloto pequeños; no hay ensayos controlados grandes | [18] [19] |
| **Seguimiento bayesiano del conocimiento** | Técnica clásica de tutoría adaptativa (Corbett y Anderson, 1995); puede dar políticas aproximadamente equitativas si se estiman parámetros por estudiante | No encontramos estudios de este modelo sin conexión en escuelas de pocos recursos | [21] [22] |

**Lo que no afirmamos:** que Chispa Lab mejore por sí mismo el aprendizaje. La evidencia anterior respalda las *ideas* con las que está construido; falta medir el sistema.

## 4. El sistema

### 4.1 Ciclo de aprendizaje
Cada uno de los seis juegos sigue el mismo ciclo: (1) una **historia** y una **pregunta de predicción** de tres opciones; (2) un **experimento** con tres pedidos de dificultad creciente;
(3) un **resultado** que compara la predicción con los datos del propio niño, con una pregunta para conversar y una explicación.

| Juego | Idea de ciencia | Sensor |
|---|---|---|
| La rampa de cartón | Al doblar el ángulo, la canica tarda menos, pero no la mitad | Inclinación (o barra) |
| El péndulo del estante | El periodo depende del largo del hilo, no de la masa | Táctil |
| La voz y el globo | Un tono más agudo vibra más veces por segundo | Micrófono (o barra) |
| El globo largo | Una vocal sostenida mantiene un tono casi plano | Micrófono (o botón) |
| Luz y color | Un objeto se ve de un color porque devuelve esa luz; las sombras tapan la luz | Cámara (o tarjetas) |
| Burbujas mágicas | Una cámara detecta movimiento comparando fotos seguidas | Cámara (o toque) |

Las simulaciones usan las fórmulas del fenómeno (canica que rueda, péndulo simple) y el tono se detecta con el método YIN. Todo juego tiene una alternativa si falta el sensor, el permiso o el micrófono.

### 4.2 Inclusión por diseño
- **Edad:** el margen para acertar es mayor para los más pequeños y menor para los mayores, y se ajusta durante la partida; tras tres fallos seguidos el juego ayuda más. **Nunca vuelve imposible un reto.**
- **Siete apoyos opcionales** («¿qué te ayuda a jugar?»): voz, oír, ver, concentrarme, leer o los números, mover las manos, y luces, ruidos o cambios que molestan. No se pregunta por diagnósticos.
  Los cambios incluyen modo calma sin destellos, alto contraste, texto grande y lectura en voz alta, equivalentes visuales de los sonidos, botones grandes y pausa para descansar.
- **Datos:** todo se guarda solo en el teléfono, un adulto confirma los apoyos de un menor y se puede borrar todo. Esto es coherente con que los datos de salud sean sensibles en la Ley 81 de 2019 de Panamá [24].

### 4.3 IA ligera y explicable
Un **tutor bayesiano** estima, por idea, la probabilidad de que el niño la domine a partir de sus predicciones, y por separado con qué soltura logra los retos. **No usa IA generativa**, corre en el
teléfono sin internet y no envía datos. Recomienda el siguiente juego, ajusta un poco el margen inicial y explica a un adulto cómo va cada idea. El adulto puede apagarlo o reiniciarlo, y el
dominio de una idea no depende de la destreza, para no penalizar dificultades motrices o de voz. Fórmulas, salvaguardas y límites en [`../ia-etica.md`](../ia-etica.md).

### 4.4 Estructura de recompensas
La estación científica se enciende por tramos: con una estrella en cada juego se enciende; con dos, un final mejorado con diploma; con tres, Chispa se pone la bata de científico. Las recompensas son
cosméticas y no bloquean nada.

## 5. Evaluación técnica propia

Medimos el sistema desplegado (https://chispalab.sweetcode.studio) en Chromium sobre un equipo de escritorio, limitando la CPU para aproximar teléfonos modestos. **Es una medición única, sin repetir,
y no sustituye una prueba en teléfonos reales.**

| Medida | Resultado |
|---|---|
| Archivos de la aplicación (HTML, CSS y JS) | 238 KB sin comprimir; 71 KB comprimidos (gzip) |
| Primera carga completa transferida (24 archivos) | **86,3 KB** |
| Dependencias de ejecución / librerías externas | **0** |
| APK de Android (Capacitor, versión de depuración) | 3,95 MB |
| Funcionamiento sin internet (service worker) | Verificado: recargar sin red muestra el menú y deja jugar |
| Tiempo de carga con CPU ×4 y ×6 más lenta | 0,87 s y 1,01 s (equipo y red de desarrollo) |
| Fotogramas por segundo, escena de la rampa | 56 (sin límite), **31** (CPU ×4), **20** (CPU ×6) |
| Fotogramas por segundo, escena del péndulo | 61 (sin límite), **36** (CPU ×4), **22** (CPU ×6) |
| Pruebas automáticas | **177** comprobaciones, 0 fallos (señal, física, ajustes, perfiles, cámara, tutor, textos) |
| Historial de desarrollo | 85 commits |

Interpretación: con la CPU a la cuarta parte el juego sigue fluido; con una sexta parte baja a unos 20 fotogramas por segundo, **jugable pero cerca del límite**, y hay un modo ligero (menos partículas)
para equipos de dos núcleos o menos. La primera medición sin límite (4,8 s) incluyó la resolución de red y la conexión inicial, por lo que no la usamos como dato de arranque.

## 6. Impacto y Objetivos de Desarrollo Sostenible

| ODS y meta (texto oficial) | Cómo contribuye Chispa Lab | Qué falta |
|---|---|---|
| **ODS 4, meta 4.1:** «velar por que todas las niñas y todos los niños terminen la enseñanza primaria y secundaria […] con resultados de aprendizaje pertinentes y eficaces» | Refuerza ideas de ciencias con un ciclo de predicción, experimento y explicación, también donde no hay laboratorio | Medir el aprendizaje en una escuela |
| **ODS 4, meta 4.5:** acceso igualitario a todos los niveles de enseñanza para los vulnerables, incluidas las personas con discapacidad, los pueblos indígenas y los niños en situaciones de vulnerabilidad | Siete apoyos, dificultad adaptada que nunca es imposible, funcionamiento sin conexión; atiende a la niñez con discapacidad (17,1 % de 2 a 14 años [6]) | Validar con niños con discapacidad y con comunidades indígenas; falta contenido en lenguas originarias |
| **ODS 4, meta 4.a:** entornos de aprendizaje «inclusivos y eficaces para todos», sensibles a la infancia y a la discapacidad | Un laboratorio sensible a la discapacidad que no exige construir un aula | Pruebas en aula real |
| **ODS 10, meta 10.2:** promover la inclusión social, económica y política de todas las personas, sin importar edad, sexo, discapacidad, raza, etnia, origen, religión o situación | Una herramienta abierta y gratuita cuyo diseño parte de la diversidad de los niños | Piloto y alcance real |
| **ODS 9, meta 9.c:** aumentar significativamente el acceso a las tecnologías de la información y las comunicaciones | Aprovecha el acceso móvil existente sin exigir conexión | Distribución sin internet |

*Textos de las metas en inglés tomados de las páginas oficiales de las Naciones Unidas [11]; la traducción es nuestra.*

**Alineación con ProFuturo.** Misión de reducir la brecha educativa en contextos vulnerables con educación digital de calidad, con contenido que funciona sin internet, foco en docentes y medición de impacto
[10]. Ver el análisis completo y sus brechas en [`../alineacion-profuturo.md`](../alineacion-profuturo.md).

## 7. Transferencia al mercado

Chispa Lab es de código abierto (licencia MIT). Los ingresos provendrían de servicios con valor claro y no de los niños: adaptación curricular y de idioma por país, packs de experimentos nuevos, formación
docente, soporte institucional y una edición para terapeutas. Los compradores plausibles son ministerios de educación, fundaciones y programas de responsabilidad social, redes de escuelas y terapeutas.
Hay señales de demanda en el sector público: **44 millones de dólares en internet escolar [4] y 29 millones en laboratorios [5]**. A la vez, el gasto público en educación bajó del 4,30 % al 2,47 % del PIB entre 2020 y 2023 [7],
lo que favorece una solución de coste casi nulo. El modelo, los segmentos, las alternativas existentes y un plan de validación a 30–60 días están en [`../transferencia-al-mercado.md`](../transferencia-al-mercado.md). **Son hipótesis; no hay
cifras de mercado ni disposición a pagar medidas.**

## 8. Discusión

**Fortalezas.** Responde a una brecha real y documentada; funciona con el dispositivo que ya existe y sin conexión; es abierto; incorpora la inclusión desde el diseño y no como añadido; y su IA es pequeña, explicable y
no extrae datos. **Una razón estructural:** como el juego corre en el teléfono, sus costes marginales son casi nulos, lo que importa cuando el presupuesto educativo se contrae.

**Comparación.** Existen simulaciones de ciencias gratuitas y descargables sin conexión, como PhET [25], y herramientas que usan los sensores del teléfono, como phyphox [17]. Chispa Lab se diferencia, a comprobar con usuarios, por ser **un
videojuego pensado para niños pequeños**, por combinar **experimentos reales con sensores** y por **adaptarse a la edad y a los apoyos**.

## 9. Limitaciones

1. **No se ha evaluado el aprendizaje ni la usabilidad con niños, docentes ni especialistas.** Todo lo anterior son ideas respaldadas por la literatura, no resultados nuestros.
2. **No se probó en teléfonos reales** (sensor de inclinación, micrófono, cámara, vibración, voz sintetizada); las mediciones de rendimiento son de un equipo de escritorio con la CPU limitada, una sola vez.
3. **Las bandas de dificultad por edad y los parámetros del tutor son valores por defecto**, no calibrados con datos.
4. **Solo cubre física** (movimiento, oscilaciones, sonido, luz), no química ni biología, y está solo en español; no se ha validado con el currículo oficial.
5. **Datos de contexto con límites:** parte proviene de prensa y no de las fuentes primarias (sección 11); no encontramos un censo oficial reciente de laboratorios ni cifras de voz y habla infantiles para Panamá.
6. **La guarda del diploma** puede no funcionar en todos los navegadores o en el APK.

## 10. Conclusiones y siguientes pasos

El teléfono ya está en las manos de las familias panameñas, y hoy es un laboratorio desaprovechado. Chispa Lab muestra que es posible convertirlo en un laboratorio de ciencias **jugable, inclusivo, abierto y sin conexión**,
con una IA pequeña y responsable. El siguiente paso es **un piloto con docentes y niños, idealmente en Veraguas, donde ProFuturo ya trabaja con 28 escuelas [9]**, con indicadores de antemano: porcentaje de predicciones acertadas antes y
después de varias sesiones, intentos hasta acertar un pedido, tiempo de uso y opinión de docentes y niños; seguido de pruebas en teléfonos de gama baja, un guion docente validado y una versión en portugués e inglés para el alcance de ProFuturo.

---

## 11. Referencias y verificación de las fuentes

Fecha de consulta de todas las fuentes en línea: 4 de noviembre de 2026. **Verificación:** (D) leída directamente en la fuente; (B) hallada con el buscador, sin abrir la página original; (P) solo cita de prensa.

1. UNESCO / OREALC (30 de noviembre de 2021). *La UNESCO señala los desafíos en los aprendizajes de Panamá…* (comunicado del ERCE 2019). https://webarchive.unesco.org/web/20211224200720/https://en.unesco.org/sites/default/files/panama_comunicado_0.pdf **(D)**
2. La Prensa (8 de diciembre de 2023). *Panamá: PISA 2018 versus PISA 2022*. https://www.prensa.com/sociedad/panama-pisa-2018-versus-pisa-2022/ **(D, prensa)**. La nota oficial de la OCDE para Panamá no se pudo abrir (error 403), por lo que los puntajes de PISA deben contrastarse con la OCDE.
3. La Estrella de Panamá (26 de noviembre de 2022). *El 45 % de las escuelas públicas en el país no está conectado a internet*. https://www.laestrella.com.pa/panama/nacional/45-escuelas-publicas-pais-PFLE481790 **(D, prensa; cita un informe del Meduca que no pudimos abrir)**
4. La Prensa (11 de junio de 2025). *Meduca firma contrato millonario para internet de alta velocidad a más de 3,000 escuelas*. https://www.prensa.com/sociedad/meduca-firma-contrato-millonario-para-internet-de-alta-velocidad-a-mas-de-3000-escuelas/ **(D, prensa)**
5. La Prensa (2 de abril de 2026). *Meduca licita $28.9 millones para equipar laboratorios científicos en 73 escuelas*. https://www.prensa.com/sociedad/meduca-licita-289-millones-para-equipar-laboratorios-cientificos-en-73-escuelas/ **(D, prensa)**
6. UNICEF Panamá (8 de septiembre de 2026). *Panamá presenta resultados del programa conjunto sobre cuidados y discapacidad* (ENDIS-2, SENADIS e INEC). https://www.unicef.org/panama/comunicados-prensa/panam%C3%A1-presenta-resultados-del-programa-conjunto-sobre-cuidados-y-discapacidad **(D)**
7. Banco Mundial, indicadores del desarrollo: IT.NET.USER.ZS, IT.CEL.SETS.P2 y SE.XPD.TOTL.GD.ZS, Panamá. https://api.worldbank.org/v2/country/PAN/indicator/IT.NET.USER.ZS **(D)**
8. Telemetro (26 de junio de 2017). *Presentan Índice de Pobreza Multidimensional (IPM)*. https://www.telemetro.com/nacionales/2017/06/26/presentan-indice-pobreza-multidimensional-ipm/1270072.html **(D, prensa)**
9. ProFuturo (sin fecha). *ProFuturo reaches 76 schools in Panama*. https://profuturo.education/en/?p=896 **(D)**
10. Fundación Telefónica / ProFuturo (2025). Alcance de 2024 (3.609 escuelas, 30 países, 262.000 docentes, 941.785 niños) en *Memoria de actividad 2024* y El Independiente (17 de julio de 2025). https://www.elindependiente.com/economia/empresas/2025/07/17/profuturo-nueve-anos-mayor-proyecto-educativo-espanol-africa-latinoamerica/ **(B; cifras autorreportadas)**
11. Naciones Unidas, Departamento de Asuntos Económicos y Sociales. Objetivos 4, 9 y 10. https://sdgs.un.org/goals/goal4 · /goal9 · /goal10 **(D)**
12. Koyunlu Ünlü, Z. (2024). *Effect of the Predict-Observe-Explain (POE) Strategy on Achievement in Science Education: A Meta-Analysis Study*. https://ouci.dntb.gov.ua/works/42rrr8W4 **(B)**
13. White, R. y Gunstone, R. (1992). *Probing Understanding*. Origen de la estrategia POE, descrito en [12]. **(B)**
14. Wouters, P., van Nimwegen, C., van Oostendorp, H. y van der Spek, E. D. (2013). A meta-analysis of the cognitive and motivational effects of serious games. *Journal of Educational Psychology, 105*(2), 249–265. doi:10.1037/a0031311 **(B)**
15. Li, M. y Liang, Y. (2024). Virtual laboratories in engineering education (metaanálisis). *PLOS ONE*. https://ideas.repec.org/a/plo/pone00/0316269.html **(B)**
16. Fadda, D. et al. (2022). Revisión de laboratorios en línea en STEM de secundaria. *Journal of Educational, Cultural and Psychological Studies*. https://doaj.org/article/f97dae2f4f214afab08e8f80db5bd914 **(B)**
17. Staacks, S., Hütz, S., Heinke, H. y Stampfer, C. (2018). Advanced tools for smartphone-based experiments: phyphox. *Physics Education, 53*(4), 045009. arXiv:1804.06239 **(B)**
18. Lopes, J. et al. (2019). Juego de fonación sostenida para niños con trastornos de voz. *Interspeech 2019*. https://www.isca-archive.org/interspeech_2019/lopes19_interspeech.pdf **(B)**
19. Ahmed, B. et al. (2018). Apraxia World. *International Journal of Speech-Language Pathology*. https://psi.engr.tamu.edu/wp-content/uploads/2019/06/ahmed-2018-ijslp.pdf **(B)**
20. Fujiki, R. y Thibeault, S. (2024). Prevalencia de problemas de voz en niños (encuesta a cuidadores, n = 1.154, 4 a 12 años, Estados Unidos). Referencia hallada en https://bohrium.dp.tech/paper/arxiv/33500374 **(B; no verificada en la fuente primaria)**
21. Corbett, A. T. y Anderson, J. R. (1995). Knowledge tracing: Modeling the acquisition of procedural knowledge. *User Modeling and User-Adapted Interaction, 4*, 253–278. **(referencia clásica, no verificada en esta sesión)**
22. Equidad en el seguimiento bayesiano del conocimiento. arXiv:2205.02333. https://arxiv.org/abs/2205.02333 **(B)**
23. Game Accessibility Guidelines; guía de fotosensibilidad de Xbox (Directriz 118); Aspect Autism Friendly Design Guide (2025). Detalle en [`../impacto-y-etica.md`](../impacto-y-etica.md).
24. República de Panamá. Ley 81 de 2019 sobre protección de datos personales y Decreto Ejecutivo 285 de 2021. https://vlex.com.pa/vid/ley-81-2019-proteccion-1049691931 **(B)**
25. PhET Interactive Simulations, Universidad de Colorado en Boulder. Centro de ayuda: uso sin conexión. https://phet.colorado.edu/en/help-center/running-sims/tablet **(B)**

### Qué no pudimos verificar
- Los puntajes de PISA 2022 vienen de prensa, no de la OCDE (acceso bloqueado).
- El informe del Meduca de 2022 y el taller de conectividad de 2023 no se pudieron abrir; **las cifras de conectividad son anteriores a los contratos recientes**, y no hay un porcentaje oficial actualizado.
- El Índice de Pobreza Multidimensional más reciente del Ministerio de Economía y Finanzas (2025) está en un PDF de imagen que no se pudo leer; usamos la cifra de 2017.
- No encontramos un censo oficial y vigente de centros sin laboratorio, ni prevalencia de problemas de voz en niños de Panamá.
- ProFuturo en Panamá: la nota no tiene fecha.
