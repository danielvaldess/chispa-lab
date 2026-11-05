# Presentación y vídeo

**Descargas:** [presentación `.pptx`](https://github.com/danielvaldess/chispa-lab/raw/main/docs/presentacion/Chispa-Lab-hack4edu-2026.pptx) · [APK de Android](https://github.com/danielvaldess/chispa-lab/releases/latest/download/chispa-lab.apk) · [web](https://danielvaldess.github.io/chispa-lab/) · [vídeos mudos y capturas](https://github.com/danielvaldess/chispa-lab/releases/latest) · [código](https://github.com/danielvaldess/chispa-lab). La lista completa está en el [README del proyecto](../../README.md#descargas).

- **`Chispa-Lab-hack4edu-2026.pptx`:** 13 diapositivas de 5 minutos, con notas del orador y el tiempo de cada una. Se abre en PowerPoint, Keynote o Google Slides.
  *No pudimos renderizarla en esta máquina (no hay LibreOffice), así que conviene abrirla y revisar el diseño antes de presentar.*
- **[`guion.md`](guion.md):** el texto de cada diapositiva. **Es la fuente de las notas del `.pptx`**: el script las lee de ahí.
- **[`guion-video.md`](guion-video.md):** guion y lista de tomas del vídeo de 3 minutos (la entrega del 5 de noviembre).
- **`img/`:** capturas reales del juego (Chromium con tamaño de teléfono) usadas en las diapositivas.
- **`construir-presentacion.js`:** genera el `.pptx` con `pptxgenjs`. Para regenerarlo: `npm install pptxgenjs@3.12.0` en una carpeta aparte y ejecutarlo con las variables
  `SKILL` (carpeta de la herramienta que aplica el tema), `IMG` (carpeta `img`) y `SALIDA` (archivo de salida), con `NODE_PATH` apuntando a esa carpeta.

## Estructura (5:00)

| N.º | Diapositiva | Tiempo | Minutos |
|---|---|---|---|
| 1 | Portada | 0:12 | 0:00–0:12 |
| 2 | **Mira cómo se juega** (demo con cuatro capturas) | 0:28 | 0:12–0:40 |
| 3 | Panamá tiene un reto de aprendizaje (ERCE Pospandemia 2025, 6.º grado, frente a Argentina) | 0:33 | 0:40–1:13 |
| 4 | El laboratorio y la conexión llegan despacio, el teléfono ya está | 0:19 | 1:13–1:32 |
| 5 | Nuestra idea: predice, formula, juega, descubre | 0:18 | 1:32–1:50 |
| 6 | Seis juegos, cuatro experimentos y un laboratorio libre | 0:14 | 1:50–2:04 |
| 7 | **Para docentes:** «Mis alumnos» con QR, sin internet | 0:34 | 2:04–2:38 |
| 8 | Para todos los niños (inclusión) | 0:22 | 2:38–3:00 |
| 9 | IA pequeña, ética y sin conexión | 0:34 | 3:00–3:34 |
| 10 | Datos del proyecto | 0:25 | 3:34–3:59 |
| 11 | Impacto: ODS 4, 10 y 9 | 0:16 | 3:59–4:15 |
| 12 | Mercado: quién lo necesita y quién lo financia | 0:27 | 4:15–4:42 |
| 13 | Lo que proponemos | 0:18 | 4:42–5:00 |

El texto de cada diapositiva suma 649 palabras: unos 4:20 a 150 palabras por minuto, y el resto del tiempo es margen para cambiar de diapositiva y dejar ver la demo.

## Qué cifras tienen fuente y cuáles son medidas propias

- **Con fuente en la propia diapositiva** (pie de página), **todas de 2024 a 2026**: ERCE Pospandemia (UNESCO y Meduca, 2025), retiro de PISA 2025 y ERCE 2025 (La Prensa), contrato de internet y licitación de laboratorios (La Prensa, 2025 y 2026), internet fijo (ASEP, 2024), ENDIS-2 (UNICEF, 2026), costo por alumno (INEC y Contraloría, 2026), matrícula de la Región Educativa de Veraguas (Meduca, 2024) y los metaanálisis de 2024. Detalle, nivel de verificación y lo que **no** tiene dato reciente en [`../investigacion/articulo.md`](../investigacion/articulo.md), sección 11.
- **Medidas propias (no son de una fuente externa), del 4 de noviembre de 2026:** ≈ 220 KB comprimidos / 593 KB sin comprimir en la primera carga (los 44 archivos del service worker; ≈ 53 KB son las dos librerías de QR de la clase), 528 comprobaciones automáticas (`npm test`), 0,4 ms de la IA por partida con la CPU 6 veces más lenta (`scripts/medir-navegador.mjs`) y el ≈ 68 % de acierto del diagnóstico, que es **una simulación**. La diapositiva 9 dice que son mediciones en un ordenador y que la app también se probó en un teléfono y funciona (reporte del autor).
- **Ajuste que aprende de cada niño:** el punto de partida por edad (diapositiva 7, `js/ajustes.js`, `BANDAS`) se calibra en el piloto; los márgenes de dificultad por edad de la diapositiva 7 (`js/ajustes.js`, `BANDAS`).
- **Nombres del equipo:** la portada y las notas de la diapositiva 1 los leen de `participantes.txt` (uno por línea). Si el archivo no existe, la portada muestra un aviso en lugar de inventar nombres.
- **Regenerar el `.pptx`:** `npm install pptxgenjs@3.12.0` en una carpeta aparte y ejecutar `construir-presentacion.js` con `SKILL`, `IMG` y `SALIDA`, y `NODE_PATH` apuntando a esa carpeta.
