# Transferencia al mercado

> Las bases piden proyectos con «potencial comercial que puedan transformar el conocimiento generado en productos y servicios con valor en el
> mercado» (Base 1). Este documento describe **hipótesis** de cómo Chispa Lab puede sostenerse y crecer, y qué habría que comprobar. **No contiene
> cifras de mercado inventadas**: donde falta un dato, lo dice.

## El problema y quién lo sufre

Muchas escuelas no tienen laboratorio, instrumentos ni materiales para que los niños experimenten. Los docentes saben que aprender ciencia es
formular hipótesis y probarlas, pero no tienen con qué. Los niños con dificultades (de voz, de audición, de visión, de atención, motrices) lo tienen aún más
difícil, porque no todas las herramientas están pensadas para sus necesidades.

## Por qué Panamá y por qué ahora (datos de 2024 a 2026)

Todas las cifras llevan su fuente en [`investigacion/articulo.md`](investigacion/articulo.md), sección 11 (referencias entre corchetes): son fuentes de 2024 o posteriores, y donde no hay dato reciente se dice.

| Señal | Dato | Qué significa para el producto |
|---|---|---|
| Aprendizaje en 6.º grado | ERCE Pospandemia 2025: solo 27,7 % alcanza el nivel mínimo en Lectura y 10,1 % en Matemática (Argentina: 34,5 % y 17 %) [1] [2] | Hay una necesidad medida y reconocida por UNESCO y Meduca |
| Ciencias sin medición reciente | Panamá se retiró de PISA 2025 [4]; el ERCE 2025 (aplicado en octubre de 2025) publicará Ciencias de 6.º a finales de 2026 [5] [6] | Un piloto propio puede aportar un punto de partida antes de esos resultados |
| El Estado ya compra tecnología escolar | 44 millones de dólares en internet para 3.102 escuelas (junio de 2025) [11]; 28,9 millones en laboratorios para 73 centros de media (abril de 2026) [12] | Existe presupuesto y un comprador para esta categoría |
| Pero llega a pocos y despacio | 73 centros en la licitación de laboratorios, de educación media; 17,3 clientes de internet fijo por cada 100 habitantes en 2024 [12] [14] | Un laboratorio en el teléfono llega antes y complementa |
| El teléfono ya está | Unos 6,12 millones de abonados móviles al cierre de 2024, con 75,5 % con internet (nivel B) [15] | No hay que comprar equipos |
| Pero no todos tienen conexión | 72,8 % de la población usa internet (2024) [13]; en la comarca Ngäbe Buglé el IPM 2025 es 73,2 % y entre sus carencias está «sin acceso a internet» [8] | Funcionar sin conexión es una ventaja, no un detalle |
| El gasto por alumno no sube | Costo por alumno del Gobierno Central: 2.261,56 balboas en 2024 (preliminar) frente a 2.344,39 en 2023 [9] | Una solución de coste casi nulo es más fácil de adoptar |
| Una región con matrícula concreta | Región Educativa de Veraguas, 2024: 54.708 estudiantes y 3.360 docentes en el sistema oficial (suma nuestra); IPM 2025 de 12,2 % [10] [8] | Un territorio donde hacer el piloto, con la sede de la UTP |
| Niñez con discapacidad | 17,1 % de los niños de 2 a 14 años (ENDIS-2, septiembre de 2026) [16] | Un segmento que conviene atender con herramientas pensadas para sus necesidades |

## Por qué convendría adoptarlo (propuesta de valor para Panamá)

1. **Llega a donde el laboratorio y la conexión no llegan,** sin comprar equipos: usa el teléfono que ya existe.
2. **Cumple lo que el Estado y los programas buscan:** ciencias con experimentación, inclusión y medición, alineado con los ODS 4, 9 y 10.
3. **Cuesta casi nada escalarlo:** sin servidor ni licencias por usuario; un mismo archivo sirve a todos los teléfonos.
4. **Es seguro con los datos de los niños:** todo se queda en el teléfono; un adulto decide; no envía nada.
5. **Se puede probar rápido y con poco riesgo:** una clase, un par de semanas, indicadores definidos de antemano.
6. **Es abierto:** una escuela, un ministerio o una universidad pueden revisarlo, adaptarlo y traducirlo.
7. **El docente ve el avance de su clase sin internet:** cada alumno le muestra un QR y el docente lo escanea; la lista queda en su teléfono (ver [`clase-sincronizacion.md`](clase-sincronizacion.md)). Falta probarlo con docentes en un aula.

## La solución, en una frase

Un **videojuego que convierte el teléfono en un laboratorio**: el niño predice, juega con los sensores del teléfono y descubre qué pasó, con ayudas para cada
persona y funcionando **sin internet**. El código es abierto y gratuito.

## Bajo coste y conectividad limitada (lo que el reto valora especialmente)

Medidas propias de la versión 1.4.0 del 4 de noviembre de 2026, hechas en un ordenador (la prueba de funcionamiento en un teléfono la hizo el autor, sin cifras):

| Qué | Valor |
|---|---|
| Peso de la app para Android (APK) | ≈ 4,3 MB: cabe en un mensaje de WhatsApp o se pasa por Bluetooth |
| Primera carga de la web | ≈ 230 KB comprimidos (617 KB sin comprimir, con los iconos); ≈ 53 KB son dos librerías de QR que solo usa la parte de la clase |
| Android mínimo | 6.0 (nivel 23) |
| Internet | No hace falta después de abrirla una vez (PWA con service worker); el APK no la usa |
| Cuentas y servidores | Ninguno: los datos viven en el teléfono y se borran desde Ajustes |
| Costo de la IA en el teléfono | ≈ 0,4 ms por partida con la CPU 6 veces más lenta (Chromium); solo corre al terminar un juego |
| Materiales de los experimentos | Hilo, una moneda, vasos, limón, bicarbonato, vinagre y col morada; o simulados en pantalla |
| Un teléfono por grupo | Sí: una sesión de 2 o 3 niños por teléfono (ver [`guia-docente.md`](guia-docente.md)) |

**Pendiente de medir en un teléfono de gama baja:** fluidez, calor y batería (el autor probó que la app funciona en un teléfono, sin cifras) (lista en [`prueba-telefono.md`](prueba-telefono.md)).

## Distribución sin conexión

1. **APK compartible:** el docente descarga el APK una vez y lo pasa de teléfono en teléfono (WhatsApp, Bluetooth o cable).
2. **PWA:** en un teléfono con internet se abre el enlace y «Añadir a pantalla de inicio»; después funciona sin conexión.
3. **Escuelas sin ningún teléfono con internet:** una persona de la red (docente, universidad, ProFuturo) lleva el APK en una memoria o un teléfono. Es una hipótesis: no la hemos probado en una escuela.

## Quién paga (no los niños)

| Cliente | Por qué le interesa | Qué compraría | Qué habría que comprobar |
|---|---|---|---|
| Ministerios y secretarías de educación | Llegar a escuelas sin laboratorio a bajo coste | Adaptación al currículo y despliegue | Si encaja con su currículo y cómo contratan |
| Fundaciones, programas de responsabilidad social y organizaciones educativas (p. ej. el ecosistema de ProFuturo) | Impacto medible en contextos vulnerables | Patrocinio de contenidos, idiomas y formación | Si financian herramientas ya hechas o solo proyectos propios |
| Redes de escuelas privadas de bajo coste y centros comunitarios | Mejorar su oferta de ciencias | Licencia de centro con soporte | Disposición a pagar y qué precio resulta razonable |
| Terapeutas del habla y la voz, y clínicas | Práctica en casa entre sesiones | Edición para terapeutas con registro exportable | Si el registro les sirve en su trabajo; requisitos de privacidad |
| Familias | Refuerzo en casa | Probablemente nada: el juego básico es gratuito | Si hay demanda de contenidos extra |

## Qué es gratis y qué es de pago

- **Gratis y abierto (MIT):** el juego, los seis niveles, los apoyos de accesibilidad y el tutor. Esto es lo que llega a las escuelas sin recursos y a ProFuturo.
- **Servicios y productos de pago (hipótesis):**
  1. **Adaptación curricular y de idioma por país** (portugués, inglés y variantes del español), con revisión de docentes.
  2. **Packs de experimentos nuevos**, por ejemplo química y biología con la cámara (colores, indicadores de acidez), que hoy no tenemos.
  3. **Formación docente** para usarlo en el aula (el foco principal de ProFuturo).
  4. **Edición para terapeutas** con exportación del registro de práctica de voz y panel por paciente, sin servidor y con permiso del adulto.
  5. **Soporte y despliegue** para instituciones (instalar, actualizar, capacitar).

## Canales

- **Red de ProFuturo y de las cátedras de Telefónica** (escuelas, docentes y universidades que ya trabajan juntos).
- **Universidades** (por ejemplo, la sede donde se desarrolla el hackatón) para pilotos y para validar con docentes.
- **Boca a boca sin internet:** el juego se comparte pasando el archivo de la app de un teléfono a otro; no depende de una tienda de aplicaciones ni de conexión.

## Costes

- **Infraestructura casi nula:** no hay servidor ni coste por usuario; los datos viven en el teléfono. Un alojamiento estático basta para la web y la descarga.
- El coste real es de **trabajo**: desarrollo de contenidos, traducciones, validación con docentes y soporte.

## Alternativas que existen

- **PhET Interactive Simulations** (Universidad de Colorado): simulaciones interactivas de ciencias y matemáticas, gratuitas y descargables para usarlas
  sin conexión, según su sitio ([ayuda de PhET](https://phet.colorado.edu/en/help-center/running-sims/tablet)). Son simulaciones en pantalla, pensadas sobre todo
  para estudiantes mayores.
- Otras herramientas de laboratorios virtuales y de experimentos con los sensores del teléfono existen, pero **no las verifiqué en esta sesión y no las cito**;
  habría que revisarlas antes de compararnos con ellas en público.

**En qué nos diferenciamos (a comprobar con usuarios):** es un **videojuego para niños pequeños**, usa **experimentos reales** con los sensores del teléfono
(no solo simulaciones), **se adapta por edad y por apoyos** (voz, oír, ver, concentrarse, leer, mover las manos), tiene un **tutor que funciona sin internet**
y no envía datos a ningún lado.

## Riesgos

| Riesgo | Mitigación |
|---|---|
| Nadie paga por algo gratuito | El núcleo abierto es la puerta; lo de pago son servicios con valor claro (adaptación, formación, soporte); validar antes de invertir |
| Dependencia de pocos clientes institucionales | Varios segmentos (instituciones, fundaciones, terapeutas) y un producto base reutilizable |
| Falta de evidencia de impacto | Piloto con indicadores claros antes de vender; ver `alineacion-profuturo.md` |
| Cobertura en gama baja (el autor probó en un teléfono; la fluidez se midió con la CPU limitada 4 y 6 veces y el modo ligero se activa solo) | El piloto prueba un Android básico y registra modelo y versión |
| Datos de menores y de salud | Todo local, adulto confirma a menores, borrado total; ver `impacto-y-etica.md` |
| Cumplimiento legal en cada país | Revisión legal local antes de desplegar de forma amplia |

## Plan de validación a 30–60 días

1. **Piloto con un grupo pequeño** (una clase, con consentimiento) para medir uso, predicciones acertadas y opinión de docentes y niños.
2. **Diez conversaciones** con docentes y responsables de programas educativos para comprobar qué comprarían y a qué precio.
3. **Una conversación con terapeutas del habla** para ver si el registro de práctica de voz les sirve y qué falta.
4. **Un primer pack nuevo** (por ejemplo, química con la cámara) para probar si hay interés en contenidos adicionales.
5. **Decidir el modelo** según lo aprendido: qué se ofrece de pago, a quién y con qué.

## Lo que no sabemos todavía

- Cuánto estaría dispuesto a pagar cada segmento (no hay datos; no se inventan).
- Cómo encaja el contenido con los currículos oficiales de cada país.
- Cuántos teléfonos de las escuelas objetivo pueden ejecutarlo bien.
