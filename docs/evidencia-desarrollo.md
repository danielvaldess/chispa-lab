# Bitácora del hackatón

Registro del desarrollo de Chispa Lab con la evidencia que se puede comprobar en el historial de git (historial sin reescribir). Todo el trabajo se hizo entre el 3 y el 5 de noviembre de 2026.

## Resumen

- **Base:** el juego de la rampa, el péndulo y la voz, el detector de tono, la física, el laboratorio de sensores y la PWA sin conexión se prepararon el 3 de noviembre de 2026
  como punto de partida del hackatón y se incorporaron al repositorio el 4 de noviembre a las 01:30 (hora de Panamá).
- **Durante el hackatón (3 al 5 de noviembre):** tres juegos más y la cámara como sensor, perfiles y apoyos, panel de adultos, tutor bayesiano, diagnóstico, bandido, colores con pocas muestras,
  margen aprendido, experimentos del hilo, la col, el huevo y el volcán, Mi laboratorio con 24 descubrimientos, finales y diploma, la clase con QR sin internet,
  agrupar la clase con k-means, navegación con rutas, modo ligero adaptable, documentación y 583 pruebas.
- **Proporción:** **2.190 de 7.524 líneas (≈ 29 %)** de JavaScript, CSS y HTML propios (sin las librerías de QR de `js/vendor/`) vienen de la base; **≈ 71 %** se escribió en este repositorio, contadas con `git blame` (ver «Cómo reproducir los números»).

## Nota sobre los mensajes de commit

Los cinco commits de la incorporación de la base (`258172a`, `4c2ebb9`, `0962efa`, `417e4fc`, `6f4b040`, 4 nov 01:30–01:31) tienen mensajes de funcionalidad. Antes (00:11–01:25) hubo una reconstrucción
del juego dentro del repositorio, que se reemplazó en `6a301be` por la base; sigue en el historial.

## Lo que viene de la base (3 nov)

| Archivo | Líneas actuales que vienen de la importación |
|---|---|
| `js/juego.js` (menú, rampa, péndulo, voz, puntos, escenas) | 1.049 de 1.210 |
| `js/lab.js` (laboratorio con sensores, ya no está en el juego) | 440 de 440 |
| `js/dsp.js` (detector de tono YIN, filtros, ajuste lineal) | 189 de 191 |
| `js/fisica.js` | 37 de 71 |
| `css/juego.css`, `css/style.css` | 220 de 276 · 59 de 59 |
| `index.html`, `sw.js`, `manifest.webmanifest`, `lab.html`, `sensores.html` | 26 de 60 · 24 de 26 · 18 de 18 · 24 de 25 · 107 de 109 |

## Lo que se escribió en este repositorio

| Módulo | Qué es | Primer commit |
|---|---|---|
| `js/ajustes.js`, `js/perfiles.js`, `js/perfil.js` | Perfiles locales, edad y apoyos de accesibilidad | 4 nov 01:47–01:52 |
| `js/niveles/globo.js`, `luz.js`, `burbujas.js`, `js/camara.js` | Tres juegos nuevos y la cámara como sensor | 4 nov 01:54–02:00 |
| `js/panel.js` | Ajustes y panel «Para adultos y docentes» | 4 nov 02:22 |
| `js/clase.js`, `js/alumnos.js`, `js/vendor/` (librerías de terceros, ver su licencia) | Rol de estudiante o docente, «Mis alumnos» y QR sin internet (v1.3.0) | 4 nov, noche (después de la v1.2.0) |
| `js/tutor.js` | Tutor bayesiano del conocimiento | 4 nov 02:38 |
| `js/finales.js` | Tres finales y diploma | 4 nov 02:58 |
| `docs/`: artículo de investigación, presentación de 5 min, transferencia al mercado, impacto y ética | Documentación | 4 nov 02:00–03:28 |
| `js/diagnostico.js`, `js/bandido.js`, `js/pistas.js` | IA ligera: ideas erróneas, bandido de Thompson y tutor socrático | 4 nov 14:45 (rama `feat/tutor-ia`, PR #1, v0.8.0) |
| `js/metodo.js`, `js/color-ml.js`, `js/experimento.js`, `js/niveles/hilo.js`, `js/niveles/col.js` | Método científico, aprendizaje de colores y dos experimentos con materiales | 4 nov 15:05–15:10 (rama `feat/laboratorio`, PR #2, v0.9.0) |
| `js/libre.js`, `js/mezclas.js`, `js/densidad.js`, `js/planta.js`, `js/descubrimientos.js`, caída libre en `js/fisica.js` | Mi laboratorio (juego libre) y 24 descubrimientos | 4 nov, noche (rama `feat/laboratorio-libre`, PR #5, v1.1.0) |
| `js/niveles/huevo.js`, `js/niveles/volcan.js` | Experimentos del huevo con sal y del volcán de bicarbonato | 4 nov, noche (rama `feat/experimentos-faciles`, v1.2.0) |
| `js/margen.js`, `js/agrupar.js`, rutas del cuaderno y ajustes, `scripts/probar-*.mjs` | Margen aprendido por niño, agrupar la clase, navegación con «atrás» en Android y pruebas de extremo a extremo (v1.4.0) | 4 nov, noche |
| Pruebas: `test/ia.test.js`, `simulacion`, `rendimiento`, `metodo`, `colorml` | Cobertura de lo anterior | 4 nov 14:45–15:10 |

Cada versión tiene su etiqueta (`v0.7.1`, `v0.8.0`, `v0.9.0`, `v1.0.0`, `v1.0.1`, `v1.1.0`, `v1.2.0`, `v1.3.0`, `v1.4.0`) y las dos primeras ramas se fusionaron a `main` con un pull request.

## Alcance de la evidencia

- El primer commit del repositorio es del 4 de noviembre a las 00:11; las fechas son las reales.
- Git cuenta las líneas que siguen sin cambiar desde la base; el diseño de algunos elementos de la base (por ejemplo, la rampa y el péndulo) se conserva y fue refinado después.

## Cómo reproducir los números

```bash
# líneas actuales atribuidas a los commits de la importación
IMP='^(258172a|4c2ebb9|0962efa|417e4fc|6f4b040)$'
for f in $(git ls-files 'js/*.js' 'js/niveles/*.js' 'css/*.css' 'index.html' 'sw.js' 'lab.html' 'sensores.html' 'manifest.webmanifest'); do
  echo "$f $(wc -l < $f) $(git blame -w --line-porcelain $f | grep -E '^[0-9a-f]{40} ' | cut -c1-7 | grep -cE "$IMP")"
done
git log --format='%h %ad %s' --date=format:'%d/%m %H:%M'   # historial completo
```

Los números de este documento se calcularon el 4 de noviembre de 2026 sobre la rama `main` de la versión 1.4.0.
