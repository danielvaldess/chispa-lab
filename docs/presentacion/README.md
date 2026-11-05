# Presentación y vídeo

- **`Chispa-Lab-hack4edu-2026.pptx`:** 12 diapositivas de 5 minutos, con notas del orador y el tiempo de cada una. Se abre en PowerPoint, Keynote o Google Slides.
  *No pudimos renderizarla en esta máquina (no hay LibreOffice), así que conviene abrirla y revisar el diseño antes de presentar.*
- **[`guion.md`](guion.md):** el texto de cada diapositiva. **Es la fuente de las notas del `.pptx`**: el script las lee de ahí.
- **[`guion-video.md`](guion-video.md):** guion y lista de tomas del vídeo de 3 minutos (la entrega del 5 de noviembre).
- **`img/`:** capturas reales del juego (Chromium con tamaño de teléfono) usadas en las diapositivas.
- **`construir-presentacion.js`:** genera el `.pptx` con `pptxgenjs`. Para regenerarlo: `npm install pptxgenjs@3.12.0` en una carpeta aparte y ejecutarlo con las variables
  `SKILL` (carpeta de la herramienta que aplica el tema), `IMG` (carpeta `img`) y `SALIDA` (archivo de salida), con `NODE_PATH` apuntando a esa carpeta.

## Estructura (5:00)

| N.º | Diapositiva | Tiempo |
|---|---|---|
| 1 | Portada | 0:12 |
| 2 | **Mira cómo se juega** (demo con cuatro capturas) | 0:43 |
| 3 | Panamá tiene un reto de aprendizaje (ERCE Pospandemia 2025, 6.º grado, frente a Argentina) | 0:25 |
| 4 | El laboratorio y la conexión llegan despacio, el teléfono ya está | 0:20 |
| 5 | Nuestra idea: predice, formula, juega, descubre | 0:25 |
| 6 | Seis juegos y dos experimentos con materiales | 0:25 |
| 7 | Para todos los niños (inclusión) | 0:25 |
| 8 | IA pequeña, ética y sin conexión | 0:35 |
| 9 | Datos del proyecto | 0:20 |
| 10 | Impacto: ODS 4, 10 y 9 | 0:15 |
| 11 | Mercado: quién lo necesita y quién lo financia | 0:30 |
| 12 | Lo que proponemos | 0:25 |

## Qué cifras tienen fuente y cuáles son medidas propias

- **Con fuente en la propia diapositiva** (pie de página), **todas de 2024 a 2026**: ERCE Pospandemia (UNESCO y Meduca, 2025), retiro de PISA 2025 y ERCE 2025 (La Prensa), contrato de internet y licitación de laboratorios (La Prensa, 2025 y 2026), internet fijo (ASEP, 2024), ENDIS-2 (UNICEF, 2026), costo por alumno (INEC y Contraloría, 2026), matrícula de la Región Educativa de Veraguas (Meduca, 2024) y los metaanálisis de 2024. Detalle, nivel de verificación y lo que **no** tiene dato reciente en [`../investigacion/articulo.md`](../investigacion/articulo.md), sección 11.
- **Medidas propias (no son de una fuente externa), del 4 de noviembre de 2026:** ≈ 220 KB comprimidos / 593 KB sin comprimir en la primera carga (los 44 archivos del service worker; ≈ 53 KB son las dos librerías de QR de la clase), 528 comprobaciones automáticas (`npm test`), 0,4 ms de la IA por partida con la CPU 6 veces más lenta (`scripts/medir-navegador.mjs`) y el ≈ 68 % de acierto del diagnóstico, que es **una simulación**. La diapositiva 9 dice que son mediciones en un ordenador y que **no está validado en un teléfono real**.
- **Heurística nuestra, por validar:** los márgenes de dificultad por edad de la diapositiva 7 (`js/ajustes.js`, `BANDAS`).
- **Nombres del equipo:** la portada y las notas de la diapositiva 1 los leen de `participantes.txt` (uno por línea). Si el archivo no existe, la portada muestra un aviso en lugar de inventar nombres.
- **Regenerar el `.pptx`:** `npm install pptxgenjs@3.12.0` en una carpeta aparte y ejecutar `construir-presentacion.js` con `SKILL`, `IMG` y `SALIDA`, y `NODE_PATH` apuntando a esa carpeta.
