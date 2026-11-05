# Chispa Lab: un laboratorio de ciencias en cada teléfono

**Un videojuego educativo, inclusivo y sin conexión para llevar la experimentación científica a escuelas sin laboratorio. Contexto de Panamá y de la Región Educativa de Veraguas.**

*Daniel Valdés · UTP, Centro Regional de Veraguas · #hack4edu 2026, reto 17 (Reto ProFuturo) · noviembre de 2026 · Licencia CC BY-NC-SA 3.0*

> **Regla de fuentes de este documento:** todas las fuentes externas están **publicadas en 2024 o después** y se consultaron el **4 de noviembre de 2026**. Lo que no tiene un dato reciente se dice como tal, no se sustituye por uno antiguo. La única excepción son las normas legales vigentes (referencia 25). Cada fuente lleva su nivel de verificación al final (sección 11).

---

## Resumen

El último estudio regional de aprendizaje publicado en Panamá, el ERCE Pospandemia (UNESCO y Meduca, junio de 2025), muestra que en sexto grado solo el **27,7 %** de los estudiantes alcanza el nivel mínimo de competencia en Lectura y solo el **10,1 %** en Matemática; en Argentina, el único otro país con resultados publicados, son el 34,5 % y el 17 % [1] [2]. **Panamá no tiene una medición reciente de Ciencias**: se retiró de PISA 2025 [4] y los resultados de Ciencias de 6.º del ERCE 2025, aplicado en octubre de 2025, se esperan para finales de 2026 [5] [6]. En la Región Educativa de Veraguas, el 12,2 % de la población vive en pobreza multidimensional y en la comarca vecina Ngäbe Buglé es el 73,2 % (IPM 2025) [8]. El Estado contrató internet para 3.102 escuelas en junio de 2025 [11] y licitó en abril de 2026 laboratorios científicos para 73 centros [12]; ninguna de las dos obras ha llegado a todas las escuelas. Presentamos **Chispa Lab**, un videojuego educativo de código abierto que convierte el teléfono en un laboratorio: en seis juegos, el niño **predice**, **experimenta** con los sensores del teléfono (inclinación, micrófono, cámara) y **descubre** si acertó con sus propios datos. Funciona **sin internet**, pesa unos 220 KB comprimidos en la primera carga (53 KB son dos librerías pequeñas de QR que solo usa la función de clase) y el resto no usa librerías externas; permite que el docente reciba el avance de sus alumnos **sin internet**, con un código QR; se adapta a la edad y a siete apoyos de accesibilidad; e incorpora un **tutor adaptativo ligero** que corre en el teléfono sin enviar datos. **No hemos evaluado todavía el aprendizaje con niños ni con docentes en un aula.** Sí se probó en un teléfono: el autor la probó en un teléfono el 4 de noviembre de 2026 y reporta que todo funciona (no se registró el modelo, la versión de Android ni la lista de pasos probados); las mediciones de rendimiento de la sección 5 siguen siendo de un equipo de escritorio con la CPU limitada. Evaluar con niños y docentes es el siguiente paso.

**Palabras clave:** laboratorio de ciencias, educación sin conexión, aprendizaje basado en juegos, inclusión, tutor adaptativo, Panamá, Veraguas, ODS 4.

---

## 1. Introducción

Aprender ciencias es formular una hipótesis, ponerla a prueba y comparar el resultado con lo esperado. Hacerlo exige instrumentos, materiales y un lugar donde equivocarse sin consecuencias. Muchas escuelas no los tienen. El reto 17 de #hack4edu 2026 pregunta si es posible «llevar la experimentación científica a escuelas que no disponen de materiales ni equipamiento» con dispositivos accesibles, y valora especialmente el funcionamiento en dispositivos de bajo coste y con conectividad limitada. Este trabajo responde con una idea sencilla: **usar el dispositivo que ya está en el bolsillo de las familias**.

Este documento sigue la estructura de un artículo: contexto y datos (sección 2), evidencia en la que nos apoyamos (3), el sistema (4), evaluación técnica propia (5), impacto y Objetivos de Desarrollo Sostenible (6), transferencia al mercado (7), y discusión, límites y conclusiones (8 a 10). Cada dato externo lleva su referencia; la sección 11 dice qué verificamos directamente en la fuente y qué no.

## 2. El problema en Panamá y en Veraguas

### 2.1 Aprendizaje en sexto grado (ERCE Pospandemia, 2025)

El ERCE Pospandemia es un estudio del Laboratorio Latinoamericano de Evaluación de la Calidad de la Educación (LLECE, UNESCO). Participaron **Argentina, Bolivia y Panamá**; en Panamá se aplicó entre diciembre de 2023 y abril de 2024 y el resumen ejecutivo es del 24 de junio de 2025 [2]. Evalúa Lectura y Matemática en 3.º y 6.º; **no incluye Ciencias** [1] [2]. Los resultados de Bolivia aún no se publicaban en la nota de UNESCO [1].

| Indicador de 6.º grado | Panamá (2025) | Argentina (2025) | Fuente |
|---|---|---|---|
| Lectura: estudiantes que alcanzan el nivel mínimo de competencia | **27,7 %** (17,5 % en el ERCE 2019, según el mismo informe) | 34,5 % | [1] [2] |
| Matemática: estudiantes que alcanzan la meta esperada | **10,1 %** (3,3 % en 2019) | 17 % | [1] [2] |
| Lectura, puntaje promedio | 681 (652 en 2019; promedio regional de 2019: 696) | no publicado en estas fuentes | [2] |
| Matemática, puntaje promedio | 652 (645 en 2019; promedio regional de 2019: 697) | no publicado en estas fuentes | [2] |
| Por debajo de lo esperado | 72 % en Lectura y 90 % en Matemática | | [2] |

Otras cifras del mismo informe: en 3.º grado, el 49 % alcanza el nivel mínimo en Lectura y el 43,9 % en Matemática [1] [2]; en 6.º grado, la mejora respecto de 2019 se limitó a Lectura [3]; hay brecha a favor de las niñas en Lectura y ninguna en Matemática [2]; Panamá acumuló 386 días de escuelas cerradas por completo y 256 de forma parcial durante la pandemia [2].

**Pueblos originarios.** En tres o más de las pruebas, el informe encuentra que **pertenecer a un pueblo indígena se asocia a menores aprendizajes**, junto con la repitencia y el atraso al llegar a clases; asistir a preescolar, estudiar más días a la semana, las expectativas de los padres, el apoyo docente y el nivel socioeconómico de la familia y de la escuela se asocian a mayores aprendizajes [1] [2]. El informe no da en su resumen la diferencia en puntos para Panamá, así que **no la citamos**. En el sistema oficial, el área «Indígena» concentra el **20,0 %** de la matrícula de primaria (82.426 de 412.977 estudiantes) y el 15,4 % de premedia (28.311 de 183.395), año lectivo 2024 [10].

**Ciencias.** La última medición de Ciencias de 6.º grado de Panamá es anterior a 2024 y por eso no la usamos. El ERCE 2025 se aplicó desde el 14 de octubre de 2025 a unos 11.000 estudiantes de 3.º y 6.º en todo el país; en 6.º también se evalúan las ciencias naturales y los resultados se esperaban «en aproximadamente un año» [5]. UNESCO anunció en enero de 2026 que los tendría «para finales» de 2026 [6]. **Hoy no existe un dato de Ciencias de 6.º grado de Panamá publicado en 2024 o después**, y la comparación latinoamericana en Ciencias está pendiente de ese estudio.

### 2.2 Sin medición internacional reciente

Panamá notificó a la OCDE el 29 de julio de 2024 su retiro de PISA 2025, y el director de Educación de la OCDE lamentó la decisión [4]. Por eso no hay un dato nuevo de PISA para el país.

### 2.3 Acceso a laboratorios, a internet y a teléfonos

| Indicador | Valor | Fuente |
|---|---|---|
| Contrato de internet para escuelas (11 de junio de 2025) | **44 millones de dólares** para **3.102 escuelas** (Cable & Wireless Panamá, +Móvil); la velocidad pasaría de 10 Mbps a 1.024 Mbps | La Prensa [11] |
| Licitación de laboratorios científicos (2 de abril de 2026) | **28,9 millones de dólares**, **73 centros** de educación media académica, **193 aulas** de laboratorio (química, física, biología, ciencias integradas y laboratorios móviles); homologación el 20 de abril y propuestas el 21 de mayo | La Prensa [12] |
| Usuarios de internet (2024) | **72,8 %** de la población | Banco Mundial [13] |
| Internet fijo (2024, estimado) | **779.972** clientes, **17,3 por cada 100 habitantes** | ASEP [14] |
| Telefonía móvil (cierre de 2024) | unos **6,12 millones** de abonados, el 75,5 % con acceso a internet | DPL News, cita a ASEP [15] **(B)** |

Lectura: el Estado está invirtiendo en conectividad y laboratorios, pero esas inversiones son **grandes, lentas y alcanzan a pocos centros por vez** (73 en la licitación de laboratorios, de educación media), y hay solo 17,3 clientes de internet fijo por cada 100 habitantes. Por otro lado, la telefonía móvil supera una línea por habitante (referencia 15, de nivel B). Un laboratorio que funcione **en el teléfono y sin conexión** complementa esas inversiones y llega antes. **No tenemos un porcentaje oficial reciente de escuelas conectadas ni de escuelas con laboratorio**: las cifras que circulan en la prensa se contradicen y no las usamos.

### 2.4 Veraguas en datos

El proyecto se desarrolla en la sede local **Universidad Tecnológica de Panamá, Centro Regional de Veraguas** (bases del evento). El Ministerio de Educación organiza sus estadísticas por **Región Educativa**, y la de **Veraguas** tiene estos datos del año lectivo 2024 (sistema oficial, sin contar la educación particular) [10]:

| Nivel | Matrícula | Docentes | Aulas | Porcentaje de la matrícula nacional |
|---|---|---|---|---|
| Inicial | 5.811 | 330 | 294 | 7,1 % |
| Primaria | 26.032 | 1.133 | 1.088 | 6,3 % |
| Premedia | 12.218 | 1.019 | 676 | 6,7 % |
| Media | 10.647 | 878 | 404 | 8,7 % |
| **Total** (suma nuestra) | **54.708** | **3.360** | **2.462** | |

La comarca vecina **Ngäbe-Buglé** tiene 60.078 estudiantes de primaria oficial (14,5 % del país) y 21.518 de premedia [10]. La pobreza multidimensional medida por el MEF y el INEC con la Encuesta Continua de Hogares (IPM 2025) es de **12,2 % en Veraguas** (19,1 % en 2017), 73,2 % en la comarca Ngäbe Buglé, 46,4 % en Emberá y 93,4 % en Guna Yala; en el país es 12,4 %, con 30,1 % en el área rural frente a 5,2 % en la urbana [8]. Entre los indicadores del IPM están «sin acceso a internet» e «inasistencia escolar». **No encontramos una fuente de 2024 o posterior que dé el número de escuelas de ProFuturo en Veraguas**, así que no citamos esa cifra; la confirmación con ProFuturo y con la sede es una tarea pendiente.

### 2.5 Quién queda más atrás

- **Discapacidad infantil.** La Segunda Encuesta Nacional de Discapacidad (ENDIS-2, SENADIS e INEC) identifica **174.701 niñas y niños de 2 a 14 años con discapacidad, el 17,1 % de la niñez**; en total hay más de 187.000 niñas, niños y adolescentes con discapacidad y 781.478 personas (18 % de la población); 3 de cada 10 niños no tienen diagnóstico formal [16]. No hicimos una búsqueda sistemática de herramientas de ciencias adaptadas a estos niños, así que no afirmamos cuántas existen.
- **Comarcas indígenas.** Ver 2.4: la pobreza multidimensional más reciente es la de 2025 [8].
- **Voz y habla.** No encontramos una cifra de 2024 o posterior sobre problemas de voz en niños de Panamá. Los juegos de voz de Chispa Lab no pretenden tratar nada; ver los límites en la sección 9.

## 3. Evidencia en la que nos apoyamos

Solo citamos evidencia de 2024 en adelante. Los límites dicen qué **no** muestra cada estudio.

| Idea de diseño | Qué dice la evidencia | Límites | Ref. |
|---|---|---|---|
| **Predecir, observar, explicar** (cada juego empieza con una predicción) | Metaanálisis de 35 estudios (6 tesis y 29 artículos): efecto promedio **g = 0,979** (IC 95 %: 0,771 a 1,188), calificado como alto | No dice si el efecto se mantiene en una app para el teléfono; los estudios primarios son de distinta calidad | [17] |
| **Aprendizaje con juegos en primaria** | Metaanálisis PRISMA de 18 estudios: efectos positivos del aprendizaje basado en juegos digitales en STEM de primaria, sobre todo en matemática, lenguaje y ciencias | Los estudios son de 2010 a 2020; el resumen no da el tamaño del efecto; recomienda optimizar el diseño del juego | [18] |
| **Laboratorios virtuales** | Metaanálisis de 46 estudios en 22 publicaciones: **g = 0,686** (IC 95 %: 0,414 a 0,959) | Es de ingeniería, no de primaria; concluye que **aún no sustituyen por completo** el laboratorio práctico y recomienda combinarlos | [19] |
| **El teléfono como instrumento** | Revisión de 2025: los laboratorios de física con teléfono son una opción de bajo coste y escalable, con experimentos prácticos | Es de física universitaria; no hay evidencia aquí con niños de primaria | [20] |
| **Juegos de voz con retroalimentación visual** | Un videojuego para niños de 3 a 6 años con trastornos de los sonidos del habla tuvo usabilidad satisfactoria (6 expertos, 22 logopedas y 10 niños) | Mide usabilidad, **no eficacia clínica**, y es de articulación, no de voz | [21] |
| **Dificultad adaptativa** | Con datos de 148 niños, un juego cognitivo ajustó su dificultad hasta niveles individualmente adecuados en la primera hora (zona de desarrollo próximo) | Es un juego de memoria de trabajo, no de ciencias | [22] |
| **Seguimiento del conocimiento** | Revisión de 84 estudios (2015–2025): los modelos profundos rara vez evalúan la estabilidad de sus predicciones (3,6 %) o su interpretabilidad (11,9 %) | Es un preprint; apoya preferir un modelo simple y explicable, no prueba que el nuestro funcione | [23] |

**Lo que no afirmamos:** que Chispa Lab mejore por sí mismo el aprendizaje. La evidencia anterior respalda las *ideas* con las que está construido; falta medir el sistema. Tampoco tenemos un estudio de 2024 o posterior que respalde los rangos concretos de dificultad por edad: **son valores heurísticos** (ver `../impacto-y-etica.md`).

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

Además hay un laboratorio libre («Mi laboratorio», con 24 descubrimientos) y cuatro experimentos con materiales de casa (péndulo de hilo, col morada, huevo con sal y volcán de bicarbonato), cada uno simulable en pantalla.
Las simulaciones usan las fórmulas del fenómeno (canica que rueda, péndulo simple) y el tono se detecta con el método YIN. Todo juego tiene una alternativa si falta el sensor, el permiso o el micrófono.

### 4.2 Inclusión por diseño
- **Edad:** el margen para acertar es mayor para los más pequeños y menor para los mayores, y se ajusta durante la partida; tras tres fallos seguidos el juego ayuda más. **Nunca vuelve imposible un reto.** Los rangos son heurísticos (sección 3).
- **Siete apoyos opcionales** («¿qué te ayuda a jugar?»): voz, oír, ver, concentrarme, leer o los números, mover las manos, y luces, ruidos o cambios que molestan. No se pregunta por diagnósticos.
  Los cambios incluyen modo calma sin destellos, alto contraste, texto grande y lectura en voz alta, equivalentes visuales de los sonidos, botones grandes y pausa para descansar. El detalle de cada apoyo y la guía en que se apoya está en [`../impacto-y-etica.md`](../impacto-y-etica.md).
- **Datos:** todo se guarda solo en el teléfono, un adulto confirma los apoyos de un menor y se puede borrar todo. Esto es coherente con que los datos de salud sean sensibles en la Ley 81 de 2019 de Panamá [25].

### 4.3 IA ligera y explicable
Un **tutor bayesiano** estima, por idea, la probabilidad de que el niño la domine a partir de sus predicciones, y por separado con qué soltura logra los retos. **No usa IA generativa**, corre en el
teléfono sin internet y no envía datos. Recomienda el siguiente juego, ajusta un poco el margen inicial y explica a un adulto cómo va cada idea. El adulto puede apagarlo o reiniciarlo, y el
dominio de una idea no depende de la destreza, para no penalizar dificultades motrices o de voz. Elegimos un modelo simple y explicable porque las revisiones recientes advierten que los modelos profundos rara vez evalúan su estabilidad o su interpretabilidad [23]. Fórmulas, salvaguardas y límites en [`../ia-etica.md`](../ia-etica.md).

### 4.4 Clase: del alumno al docente, sin internet
Al crear un jugador, la app pregunta si es **estudiante o docente** (no es una cuenta: solo cambia el menú). El docente tiene **«Mis alumnos»**: escanea con la cámara el **código QR** que muestra cada alumno y guarda su avance
(estrellas, partidas, predicciones acertadas, minutos y descubrimientos) **en su propio teléfono**, sin internet ni servidor; si el QR no se lee, el alumno envía un código de texto. No viajan la fecha de nacimiento, los apoyos
ni las sesiones de voz, y el alumno ve antes lo que se comparte. Elegimos el QR frente a Bluetooth, NFC o un servidor porque funciona en cualquier teléfono con cámara, sin permisos nuevos ni emparejar; la comparación y los
límites están en [`../clase-sincronizacion.md`](../clase-sincronizacion.md). En las pruebas automáticas, un navegador mostró el QR y otro, con una cámara simulada, lo escaneó; además el autor la probó en un teléfono el 4 de noviembre de 2026 y reporta que todo funciona (no se registró el modelo, la versión de Android ni la lista de pasos probados). **No se probó con docentes en un aula.**

### 4.5 Estructura de recompensas
La estación científica se enciende por tramos: con una estrella en cada juego se enciende; con dos, un final mejorado con diploma; con tres, Chispa se pone la bata de científico. Las recompensas son
cosméticas y no bloquean nada.

## 5. Evaluación técnica propia

Mediciones del 4 de noviembre de 2026 sobre la versión 1.3.0 del repositorio. Son mediciones de rendimiento en un equipo de escritorio con la CPU limitada; la prueba de funcionamiento en un teléfono la hizo el autor (ver la sección 9).

| Medida | Resultado |
|---|---|
| Archivos que guarda la aplicación para funcionar sin conexión (HTML, CSS, JS, iconos) | 44 archivos; **593 KB** sin comprimir; **≈ 220 KB** comprimidos (gzip, los iconos PNG no se comprimen). Sin las librerías de QR: 445 KB y ≈ 168 KB |
| Dependencias de ejecución / librerías externas | **2**, solo para el QR de la clase (`qrcode-generator`, MIT; `jsQR`, Apache-2.0): 148 KB sin comprimir y ≈ 53 KB comprimidos; se cargan únicamente en esas pantallas. El resto de la app, **0** |
| APK de Android (Capacitor, versión de depuración) | 4,3 MB (4.292.548 bytes, versión 1.3.0) |
| Pruebas automáticas (`npm test`) | **528** comprobaciones, 0 fallos (señal, física, ajustes, perfiles, cámara, tutor, IA, textos, experimentos, clase y QR) |
| Historial de desarrollo | **116** commits antes de añadir la función de clase, todos del 4 de noviembre de 2026 (ver [`../evidencia-desarrollo.md`](../evidencia-desarrollo.md)) |
| Funcionamiento sin internet (service worker) | Verificado en el navegador: recargar sin red muestra el menú y deja jugar |
| Fotogramas por segundo, rampa y péndulo; tiempo de carga con CPU ×4 y ×6 más lenta | Medidos en Chromium de escritorio con la CPU limitada, en la versión 1.0.0 (rampa: 56 sin límite, 31 con CPU ×4, 20 con CPU ×6; péndulo: 61, 36 y 22; carga 0,87 s y 1,01 s). **No se repitieron en la 1.2.0** |
| Costo de la IA en el teléfono | ≈ 0,4 ms por partida con la CPU 6 veces más lenta (`scripts/medir-navegador.mjs`) |

Interpretación: con la CPU a la cuarta parte el juego sigue fluido; con una sexta parte baja a unos 20 fotogramas por segundo, **jugable pero cerca del límite**, y hay un modo ligero (menos partículas) para equipos de dos núcleos o menos. **Estas mediciones no se hicieron en un teléfono**: la app también la probó el autor en uno y reporta que funciona, pero sin cifras de fluidez, calor ni batería.

## 6. Impacto y Objetivos de Desarrollo Sostenible

| ODS y meta (texto oficial) | Cómo contribuye Chispa Lab | Qué falta |
|---|---|---|
| **ODS 4, meta 4.1:** «velar por que todas las niñas y todos los niños terminen la enseñanza primaria y secundaria […] con resultados de aprendizaje pertinentes y eficaces» | Refuerza ideas de ciencias con un ciclo de predicción, experimento y explicación, también donde no hay laboratorio | Medir el aprendizaje en una escuela |
| **ODS 4, meta 4.5:** acceso igualitario a todos los niveles de enseñanza para los vulnerables, incluidas las personas con discapacidad, los pueblos indígenas y los niños en situaciones de vulnerabilidad | Siete apoyos, dificultad adaptada que nunca es imposible, funcionamiento sin conexión; atiende a la niñez con discapacidad (17,1 % de 2 a 14 años [16]) y a escuelas de comarcas | Validar con niños, familias y especialistas; versión en lenguas indígenas |
| **ODS 4, meta 4.a:** entornos de aprendizaje «inclusivos y eficaces para todos», sensibles a la infancia y a la discapacidad | Un laboratorio sensible a la discapacidad que no exige construir un aula | Pruebas en aula real |
| **ODS 10, meta 10.2:** promover la inclusión social, económica y política de todas las personas, sin importar edad, sexo, discapacidad, raza, etnia, origen, religión o situación | Una herramienta abierta y gratuita cuyo diseño parte de la diversidad de los niños | Piloto y alcance real |
| **ODS 9, meta 9.c:** aumentar significativamente el acceso a las tecnologías de la información y las comunicaciones | Aprovecha el acceso móvil existente sin exigir conexión | Distribución sin internet |

*Textos de las metas en inglés tomados de las páginas oficiales de las Naciones Unidas [24]; la traducción es nuestra.*

**Alineación con ProFuturo.** Misión de reducir la brecha educativa en contextos vulnerables con educación digital de calidad, con contenido que funciona sin internet, foco en docentes y medición de impacto.
En 2024 ProFuturo intervino en 3.609 escuelas de 30 países, con más de 262.980 docentes y 941.785 niños [7]. Ver el análisis completo y sus brechas en [`../alineacion-profuturo.md`](../alineacion-profuturo.md).

## 7. Transferencia al mercado

Chispa Lab es de código abierto (licencia MIT). Los ingresos provendrían de servicios con valor claro y no de los niños: adaptación curricular y de idioma por país, packs de experimentos nuevos, formación
docente, soporte institucional y una edición para terapeutas. Los compradores plausibles son ministerios de educación, fundaciones y programas de responsabilidad social, redes de escuelas y terapeutas.
Hay señales de demanda en el sector público: **44 millones de dólares en internet escolar en 2025 [11] y 28,9 millones en laboratorios en 2026 [12]**. A la vez, el gasto del Gobierno Central en educación por alumno fue de **2.261,56 balboas en 2024**
(cifras preliminares), frente a 2.344,39 en 2023, con 971.057 alumnos de matrícula oficial [9], lo que favorece una solución de costo casi nulo. El modelo, los segmentos, las alternativas existentes y un plan de validación a 30–60 días están en [`../transferencia-al-mercado.md`](../transferencia-al-mercado.md). **Son hipótesis; no hay
cifras de mercado ni disposición a pagar medidas.**

## 8. Discusión

**Fortalezas.** Responde a una brecha real y documentada; funciona con el dispositivo que ya existe y sin conexión; es abierto; incorpora la inclusión desde el diseño y no como añadido; y su IA es pequeña, explicable y
no extrae datos. **Una razón estructural:** como el juego corre en el teléfono, sus costes marginales son casi nulos.

**Comparación.** Existen simulaciones de ciencias gratuitas y descargables sin conexión, como PhET [26], y herramientas que usan los sensores del teléfono, como phyphox, que la literatura reciente describe en física universitaria [20]. Chispa Lab se diferencia, a comprobar con usuarios, por ser **un
videojuego pensado para niños pequeños**, por combinar **experimentos reales con sensores** y por **adaptarse a la edad y a los apoyos**.

## 9. Limitaciones

1. **No se ha evaluado el aprendizaje ni la usabilidad con niños, docentes ni especialistas.** Todo lo anterior son ideas respaldadas por la literatura, no resultados nuestros.
2. **La prueba en un teléfono es un reporte del autor, sin registro:** el autor la probó en un teléfono el 4 de noviembre de 2026 y reporta que todo funciona (no se registró el modelo, la versión de Android ni la lista de pasos probados). No hay cifras de fluidez, calor ni batería (las mediciones son de un equipo de escritorio con la CPU limitada), y no sabemos si ese teléfono es de gama baja.
3. **Las bandas de dificultad por edad y los parámetros del tutor son valores por defecto**, no calibrados con datos ni respaldados por un estudio de 2024 o posterior.
4. **Solo física y algo de química y biología simuladas**, y solo en español; no se ha validado con el currículo oficial.
5. **Sin dato reciente de Ciencias de 6.º** de Panamá (sección 2.1) ni porcentaje oficial reciente de escuelas conectadas o con laboratorio (sección 2.3).
6. **Los juegos de voz no son terapia.** La evidencia reciente que encontramos mide usabilidad en articulación, no eficacia en voz [21].
7. **El QR de la clase puede costar con poca luz, reflejos o la pantalla oscura** (hay código de texto como alternativa) y no se probó con docentes en un aula. La lista del docente vive en un solo teléfono, sin copia de respaldo.
8. **La guarda del diploma** puede no funcionar en todos los navegadores o en el APK.

## 10. Conclusiones y siguientes pasos

El teléfono ya está en las manos de las familias panameñas, y hoy es un laboratorio desaprovechado. Chispa Lab muestra que es posible convertirlo en un laboratorio de ciencias **jugable, inclusivo, abierto y sin conexión**,
con una IA pequeña y responsable. El siguiente paso es **un piloto con docentes y niños en la Región Educativa de Veraguas** (54.708 estudiantes de matrícula oficial en 2024 [10]), con indicadores de antemano: porcentaje de predicciones acertadas antes y
después de varias sesiones, intentos hasta acertar un pedido, tiempo de uso y opinión de docentes y niños; seguido de pruebas en teléfonos de gama baja, un guion docente validado y, cuando se publique el ERCE 2025, comparar el punto de partida con los resultados de Ciencias de 6.º.

---

## 11. Referencias y verificación de las fuentes

Fecha de consulta de todas las fuentes en línea: **4 de noviembre de 2026**. **Verificación:** (D) leída directamente en la fuente; (B) hallada con el buscador o citada por un tercero, sin abrir la fuente original. Todas son de 2024 o posteriores, salvo la excepción de la referencia 25.

1. UNESCO (2 de julio de 2025). *Una radiografía del aprendizaje en América Latina tras el COVID-19: UNESCO presenta los resultados del estudio ERCE Pospandemia en Argentina y Panamá*. https://www.unesco.org/en/articles/una-radiografia-del-aprendizaje-en-snapshot-learning-latin-america-after-covid-19-unesco-presents **(D)**
2. Ministerio de Educación de Panamá (24 de junio de 2025). *Informe de resultados de Panamá. Resumen ejecutivo ERCE Pospandemia*. https://www.meduca.gob.pa/wp-content/uploads/2025/09/Resumen-ejecutivo-ERCE-Pospandemia-Panama-24062025.pdf **(D)** (el servidor no envía su certificado intermedio; se leyó verificando la cadena completa con el certificado intermedio de Sectigo, sin desactivar la verificación).
3. TVN (26 de junio de 2025). *Estudio regional ERCE revela mejoras en lectura y matemáticas en Panamá*. https://www.tvn-2.com/nacionales/educacion-estudio-regional-erce-lucy-molinar-ministerio-de-educacion-estudiantes_1_2195588.html **(D, prensa)**
4. La Prensa (14 de octubre de 2024). *Panamá se retira de la prueba PISA 2025, pese a avances en preparativos*. https://www.prensa.com/sociedad/panama-se-retira-de-la-prueba-pisa-2025-pese-a-avances-en-preparativos/ **(D, prensa)**
5. La Prensa (15 de octubre de 2025). *Aplican pruebas ERCE 2025 a 11,000 estudiantes de tercer y sexto grado*. https://www.prensa.com/sociedad/aplican-pruebas-erce-2025-a-11000-estudiantes-de-tercer-y-sexto-grado/ **(D, prensa)**
6. ABC Color (20 de enero de 2026). *Unesco anuncia resultados de pruebas educativas regionales para fin de año*. https://www.abc.com.py/nacionales/2026/01/20/unesco-anuncia-resultados-de-pruebas-educativas-regionales-para-fin-de-ano/ **(D, prensa)**
7. Fundación Telefónica / ProFuturo, vía El Independiente (17 de julio de 2025). *ProFuturo cumple nueve años…* https://www.elindependiente.com/economia/empresas/2025/07/17/profuturo-nueve-anos-mayor-proyecto-educativo-espanol-africa-latinoamerica/ **(D, prensa; cifras autorreportadas)**
8. Ministerio de Economía y Finanzas de Panamá, Dirección de Análisis Económico y Social (agosto de 2026). *Informe del Índice de Pobreza Multidimensional de Panamá 2025* (base: Encuesta Continua de Hogares, INEC). https://www.mef.gob.pa/wp-content/uploads/2026/08/Informe-del-Indice-de-Pobreza-Multidimensional-de-Panama2025.pdf **(D)**. El texto da 14,7 % para 2022 y el Anexo 1 da 14,8 %; usamos solo cifras del Anexo 1.
9. Instituto Nacional de Estadística y Censo, con datos de la Contraloría General de la República (publicado el 30 de enero de 2026). *Cuadro 19. Gastos efectuados por el Gobierno Central en educación y costo por alumno, según nivel de educación: años 2020-24* (2024 preliminar). https://www.inec.gob.pa/archivos/P0705547520260130074700Cuadro%2019.pdf **(D)**
10. Ministerio de Educación de Panamá, Oficina de Estadística (SIDE; cuadros de mayo a junio de 2025). *Cuadros 1-2 (inicial), 2-2 (primaria), 3-2 (premedia) y 4-2 (media), matrícula, docentes y aulas de la educación oficial según región educativa, año lectivo 2024*. https://www.meduca.gob.pa/wp-content/uploads/2025/07/04062025_cuadro_2-2_primaria_2024.pdf (y los cuadros hermanos en la misma carpeta) **(D)**
11. La Prensa (11 de junio de 2025). *Meduca firma contrato millonario para internet de alta velocidad a más de 3,000 escuelas*. https://www.prensa.com/sociedad/meduca-firma-contrato-millonario-para-internet-de-alta-velocidad-a-mas-de-3000-escuelas/ **(D, prensa)**
12. La Prensa (2 de abril de 2026). *Meduca licita $28.9 millones para equipar laboratorios científicos en 73 escuelas*. https://www.prensa.com/sociedad/meduca-licita-289-millones-para-equipar-laboratorios-cientificos-en-73-escuelas/ **(D, prensa)**. El número de proceso en PanamaCompra no se pudo verificar.
13. Banco Mundial. Indicador IT.NET.USER.ZS, Panamá (dato de 2024; serie actualizada el 8 de octubre de 2026). https://api.worldbank.org/v2/country/PAN/indicator/IT.NET.USER.ZS **(D)**
14. Autoridad Nacional de los Servicios Públicos (ASEP). *Cuadro 1. Indicadores del servicio de Internet fijo en la República, años 2020-24(e)*. https://asep.gob.pa/wp-content/uploads/telecomunicaciones/estadisticas/2024/211_2024.pdf **(D)**
15. DPL News, Digital Metrics. *Con 6.12 millones de abonados móviles, Panamá alcanza 135 % de penetración*. https://dplnews.com/?p=280263 **(B; cita a ASEP, sin fecha visible; el 75,5 % con internet y el cierre de 2024 salen de un buscador y no se abrieron en la página)**
16. UNICEF Panamá (8 de septiembre de 2026). *Panamá presenta resultados del programa conjunto sobre cuidados y discapacidad* (ENDIS-2, SENADIS e INEC). https://www.unicef.org/panama/comunicados-prensa/panam%C3%A1-presenta-resultados-del-programa-conjunto-sobre-cuidados-y-discapacidad **(D)**
17. Koyunlu Ünlü, Z. (2024). Fen eğitiminde tahmin-gözlem-açıkla stratejisinin akademik başarıya etkisi: bir meta-analiz çalışması / *Effect of the Predict-Observe-Explain (POE) Strategy on Achievement in Science Education: A Meta-Analysis Study*. *Van Yüzüncü Yıl Üniversitesi Eğitim Fakültesi Dergisi, 21*(3), 893–920. https://doi.org/10.33711/yyuefd.1570041 **(D)**
18. Behnamnia, N. et al. (diciembre de 2024). *Impact of Digital Game-Based Learning on STEM education in primary schools: a meta-analysis of learning approaches*. *Innoeduca, 10*(2), 113–140. https://doi.org/10.24310/ijtei.102.2024.19694 **(D, resumen en Crossref)**
19. Li, J. y Liang, W. (30 de diciembre de 2024). *Effectiveness of virtual laboratory in engineering education: A meta-analysis*. *PLOS ONE*. https://doi.org/10.1371/journal.pone.0316269 **(D)**
20. Zhao, Y. (2025). *Smartphone-Based Undergraduate Physics Labs: A Comprehensive Review of Innovation, Accessibility, and Pedagogical Impact*. arXiv:2504.11363 (v3, 30 de agosto de 2025). https://arxiv.org/abs/2504.11363 **(D, resumen; preprint)**
21. Saeedi, S. et al. (27 de julio de 2024). *Design and evaluation of a serious video game to treat preschool children with speech sound disorders*. *Scientific Reports, 14*, 17299. https://doi.org/10.1038/s41598-024-68119-x **(D)**
22. Pasqualotto, A., Fanourakis, M., Menestrina, Z., Nahum, M. y Bavelier, D. *Modeling Skill Progression in Children Through Novel Multidimensional Probabilistic DDA* (actas de conferencia con revisión por pares). https://cris.huji.ac.il/en/publications/modeling-skill-progression-in-children-through-novel-multidimensi/ **(D, resumen; el año exacto de las actas no se pudo leer en la página, la búsqueda lo ubica en 2025–2026)**
23. *A Systematic Review of Deep Knowledge Tracing (2015-2025): Toward Responsible AI for Education* (23 de octubre de 2025). Preprints. https://doi.org/10.20944/preprints202510.1845.v1 **(D, resumen en Crossref; preprint sin revisión por pares)**
24. Naciones Unidas, Departamento de Asuntos Económicos y Sociales. Objetivos 4, 9 y 10. https://sdgs.un.org/goals/goal4 · /goal9 · /goal10 **(página viva, consultada en 2026)**
25. **Excepción (norma vigente):** República de Panamá. Ley 81 de 2019 sobre protección de datos personales. Se cita como norma y no como estudio; su texto no tiene una versión posterior que la sustituya en lo que usamos. https://vlex.com.pa/vid/ley-81-2019-proteccion-1049691931 **(B)**
26. PhET Interactive Simulations, Universidad de Colorado en Boulder. Centro de ayuda: uso sin conexión. https://phet.colorado.edu/en/help-center/running-sims/tablet **(B; página viva)**

Guías de diseño usadas en `../impacto-y-etica.md`: Xbox Accessibility Guideline 118, última actualización 4 de marzo de 2026 (D); Aspect Autism Friendly Design Guide, julio de 2025 (D); Game Accessibility Guidelines, sitio vivo consultado en 2026 (B).

### Qué retiramos por ser de 2023 o antes, o no verificable
- ERCE 2019 (Ciencias de 6.º, 672 y 702 puntos), PISA 2022, el 45 % de escuelas sin internet de 2022, la pobreza multidimensional de 2017, las series del Banco Mundial hasta 2023 y el censo de 2023: **se retiraron** porque son de 2023 o antes. Donde un informe de 2025 los cita para comparar (por ejemplo, el ERCE 2019 dentro del ERCE Pospandemia), se usan como parte de esa fuente reciente.
- Referencias académicas de 2022 o antes (metaanálisis de juegos serios de 2013, laboratorios virtuales de 2022, phyphox de 2018, juegos de voz de 2018 y 2019, seguimiento del conocimiento de 1995 y 2022, la prevalencia de problemas de voz en EE. UU.): **se reemplazaron** por las referencias 17 a 23.
- La cifra de escuelas de ProFuturo en Panamá (sin fecha) y las estadísticas de internet por escuela que circulan en prensa (se contradicen): **se quitaron**.

### Qué no pudimos verificar
- **Ciencias de 6.º grado de Panamá en 2024 o después:** no hay dato publicado; se espera el ERCE 2025 a finales de 2026.
- **Diferencia en puntos entre estudiantes indígenas y no indígenas en Panamá:** el resumen ejecutivo no la da.
- El número de proceso de la licitación de laboratorios en PanamaCompra; el porcentaje de abonados móviles con internet (referencia 15); el año exacto de las actas de la referencia 22.
- Estadísticas de internet y de laboratorios por escuela en Veraguas.
- Los rangos de dificultad por edad: no hay estudio reciente de tiempo de reacción o motricidad táctil infantil que los respalde.
