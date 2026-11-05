# Presentación y vídeo

**Descargas:** [presentación `.pptx`](https://github.com/danielvaldess/chispa-lab/raw/main/docs/presentacion/Chispa-Lab-hack4edu-2026.pptx) · [APK de Android](https://github.com/danielvaldess/chispa-lab/releases/latest/download/chispa-lab.apk) · [web](https://danielvaldess.github.io/chispa-lab/) · [vídeos mudos y capturas](https://github.com/danielvaldess/chispa-lab/releases/latest) · [código](https://github.com/danielvaldess/chispa-lab). La lista completa está en el [README del proyecto](../../README.md#descargas).

- **`Chispa-Lab-hack4edu-2026.pptx`:** 16 diapositivas (15 de contenido y la de referencias), de 5 minutos, con notas del orador y el tiempo de cada una. Se abre en PowerPoint, Keynote o Google Slides.
  *No pudimos renderizarla en esta máquina (no hay LibreOffice), así que conviene abrirla y revisar el diseño antes de presentar.*
- **[`guion.md`](guion.md):** el texto de cada diapositiva. **Es la fuente de las notas del `.pptx`**: el script las lee de ahí.
- **[`guion-video.md`](guion-video.md):** guion y lista de tomas del vídeo de 3 minutos (la entrega del 5 de noviembre).
- **`gif/`:** un GIF por vídeo de la app (01–04 y 07–11), que se animan al presentar y están en todas las diapositivas; **`img/`:** fondos de color y capturas.
- **`construir-presentacion.js`:** genera el `.pptx` con `pptxgenjs`. Para regenerarlo: `npm install pptxgenjs@3.12.0` en una carpeta aparte y ejecutarlo con las variables
  `SKILL` (carpeta de la herramienta que aplica el tema), `IMG` (carpeta `img`, con los fondos) y `SALIDA` (archivo de salida), con `NODE_PATH` apuntando a esa carpeta.

## Estructura (5:00 y la diapositiva de preguntas) y método

| N.º | Diapositiva | Tiempo | Minutos |
|---|---|---|---|
| 1 | Portada (GIF del registro y de la rampa) | 0:15 | 0:00–0:15 |
| 2 | **Gancho:** 6 de cada 10 estudiantes panameños de 15 años no alcanzan el nivel básico en ciencias (PISA 2022 frente a América Latina, la UE y la OCDE) | 0:30 | 0:15–0:45 |
| 3 | Nacer en una comarca indígena marca lo que se aprende (5 frente a 9 años de escolaridad; ERCE 2025) | 0:25 | 0:45–1:10 |
| 4 | El laboratorio no llega (193 aulas, ≈ 150.100 $ por aula), pero el teléfono ya está | 0:22 | 1:10–1:32 |
| 5 | Nuestra idea: predice, formula, juega, descubre | 0:22 | 1:32–1:54 |
| 6 | Seis juegos, cuatro experimentos y un laboratorio libre (tres pilares) | 0:20 | 1:54–2:14 |
| 7 | **Para docentes:** «Mis alumnos» con QR y agrupar la clase | 0:23 | 2:14–2:37 |
| 8 | **Para todos los niños:** siete apoyos (GIF de la elección de apoyos y del registro) | 0:19 | 2:37–2:56 |
| 9 | IA que aprende dentro del teléfono (6 técnicas) | 0:32 | 2:56–3:28 |
| 10 | Funciona, y funciona liviano (583 pruebas; 230 KB la web, 4,3 MB el APK) | 0:14 | 3:28–3:42 |
| 11 | Meta: 3.800 estudiantes de Veraguas en 3 años (10 %) | 0:14 | 3:42–3:56 |
| 12 | **Tres ODS** (4, 10 y 9, los logos oficiales en grande) | 0:08 | 3:56–4:04 |
| 13 | Un laboratorio por casi cero, financiado por quien ya invierte en educación | 0:18 | 4:04–4:22 |
| 14 | **Conclusión** (problema, solución y petición, con GIF de Mi laboratorio y la rampa) | 0:23 | 4:22–4:45 |
| 15 | **¿Preguntas? ¡Muchas gracias!** con cinco GIF del juego en acción (se queda en pantalla) | 0:06 | 4:45–4:51 |

**Referencias:** cada diapositiva cita su fuente en la nota al pie con el formato autor-año de APA 7, y la diapositiva 16 (anexo) reúne las 12 referencias completas; las cifras propias se rotulan como «elaboración propia» o «cálculo propio».

**Regla de datos:** una cifra protagonista por diapositiva (la correcta, no muchas); el resto va en las notas del orador y en los documentos.

**Método aplicado** (prácticas de oratoria y de presentación de producto; las fuentes son divulgativas, no estudios):
- **Gancho con un dato, no con la demo:** el pitch corto abre con un gancho y sigue con qué es, por qué importa, los números y la petición (estructura de cinco pasos habitual en pitch decks). Por eso la diapositiva 2 es la cifra de PISA.
- **De «lo que es» a «lo que podría ser» y llamada a la acción** (Nancy Duarte, *Resonate*): problema (2 a 4), solución (5 a 9), prueba e impacto (10 a 12) y petición (13), con la diapositiva 14 para las preguntas.
- **Regla de tres** (Carmine Gallo): tres pilares (experimentar, incluir, acompañar al docente), tres escenarios de adopción, tres peticiones.
- **Títulos que afirman** (una frase completa con la idea) y una sola idea por diapositiva, con un GIF de la propia app en lugar de texto.
- **Primacía y recencia:** lo que más se recuerda es el principio y el final; el principio es el dato y el final es la petición con el juego funcionando durante las preguntas.
- Los clips de cámara (Luz y color, Burbujas) no se muestran en la presentación.

El texto de cada diapositiva suma **703 palabras**: 4:41 a 150 palabras por minuto y 5:01 a 140; el objetivo es 4:51, así que conviene ensayar a 145–150 (versión con entonación, reparto y preguntas: [`guion-oratoria.md`](guion-oratoria.md)).

## Qué cifras tienen fuente y cuáles son medidas propias

- **Con fuente en la propia diapositiva** (pie de página), **todas de 2024 a 2026**: ERCE Pospandemia (UNESCO y Meduca, 2025), retiro de PISA 2025 y ERCE 2025 (La Prensa), contrato de internet y licitación de laboratorios (La Prensa, 2025 y 2026), internet fijo (ASEP, 2024), ENDIS-2 (UNICEF, 2026), costo por alumno (INEC y Contraloría, 2026), matrícula de la Región Educativa de Veraguas (Meduca, 2024) y los metaanálisis de 2024. Detalle, nivel de verificación y lo que **no** tiene dato reciente en [`../investigacion/articulo.md`](../investigacion/articulo.md), sección 11.
- **Medidas propias (no son de una fuente externa), del 4 de noviembre de 2026:** ≈ 230 KB comprimidos / 617 KB sin comprimir en la primera carga **de la web** (los 46 archivos únicos del service worker; ≈ 53 KB son las dos librerías de QR de la clase) y **4,3 MB el APK de Android**; 583 comprobaciones automáticas (`npm test`), 0,4 ms de la IA por partida con la CPU 6 veces más lenta (`scripts/medir-navegador.mjs`) y el ≈ 68 % de acierto del diagnóstico, que es **una simulación**. La diapositiva 9 dice que son mediciones en un ordenador y que la app también se probó en un teléfono y funciona (reporte del autor).
- **Ajuste que aprende de cada niño:** el punto de partida por edad (diapositiva 7, `js/ajustes.js`, `BANDAS`) se calibra en el piloto; los márgenes de dificultad por edad de la diapositiva 7 (`js/ajustes.js`, `BANDAS`).
- **Nombres del equipo:** la portada lee los nombres de `participantes.txt` (uno por línea); las notas de la diapositiva 1 están en `guion.md`. Si el archivo no existe, la portada muestra un aviso en lugar de inventar nombres.
- **Regenerar el `.pptx`:** `npm install pptxgenjs@3.12.0` en una carpeta aparte y ejecutar `construir-presentacion.js` con `SKILL`, `IMG` y `SALIDA`, y `NODE_PATH` apuntando a esa carpeta.
