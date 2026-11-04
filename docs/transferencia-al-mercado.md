# Transferencia al mercado

> Las bases piden proyectos con «potencial comercial que puedan transformar el conocimiento generado en productos y servicios con valor en el
> mercado» (Base 1). Este documento describe **hipótesis** de cómo Chispa Lab puede sostenerse y crecer, y qué habría que comprobar. **No contiene
> cifras de mercado inventadas**: donde falta un dato, lo dice.

## El problema y quién lo sufre

Muchas escuelas no tienen laboratorio, instrumentos ni materiales para que los niños experimenten. Los docentes saben que aprender ciencia es
formular hipótesis y probarlas, pero no tienen con qué. Los niños con dificultades (de voz, de audición, de visión, de atención, motrices) lo tienen aún más
difícil, porque casi ninguna herramienta se adapta a ellos.

## La solución, en una frase

Un **videojuego que convierte el teléfono en un laboratorio**: el niño predice, juega con los sensores del teléfono y descubre qué pasó, con ayudas para cada
persona y funcionando **sin internet**. El código es abierto y gratuito.

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
| Teléfonos de gama baja no probados | Medir en un Android barato antes de prometer cobertura |
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
