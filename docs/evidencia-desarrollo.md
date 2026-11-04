# Origen y evidencia de desarrollo

Este documento dice **qué parte de Chispa Lab viene de un prototipo previo y qué se escribió durante el hackatón**, con la evidencia que se puede comprobar en el historial de git.
Las bases de #hack4edu 2026 piden demostrar lo que se hizo del 3 al 5 de noviembre; preferimos mostrarlo con números antes que dejar dudas.

## Resumen

- **Prototipo previo («LabCero»):** se desarrolló el 29 y 30 de octubre de 2026 en una carpeta local sin git; su web estuvo publicada desde el 30 de octubre. Tenía **tres juegos** (la rampa, el péndulo y la voz),
  el detector de tono, la física, el laboratorio de sensores, el estilo base y la PWA sin conexión.
- **Autorización:** el autor declara que la organización del hackatón autorizó usar ese prototipo como base. El autor conserva la comunicación y la aportará si el jurado la pide
  (no está copiada en el repositorio).
- **Importación al repositorio:** el 4 de noviembre a las 01:30 (hora de Panamá). **No hay ningún commit del 3 de noviembre**: el repositorio se creó el 4 de noviembre a las 00:11.
- **Qué parte del código actual viene de esa importación:** **2.195 de 5.281 líneas (≈ 42 %)** de JavaScript, CSS y HTML, contadas con `git blame` (ver «Cómo reproducir los números»).
  El resto, **≈ 58 %**, se escribió en este repositorio el 4 de noviembre.

## Aviso sobre los mensajes de commit

Los cinco commits de la importación tienen mensajes que parecen desarrollo nuevo (por ejemplo «feat(juego): menú, tres niveles…») pero **son la incorporación del prototipo**:
`258172a`, `4c2ebb9`, `0962efa`, `417e4fc` y `6f4b040` (4 nov, 01:30–01:31). Antes (00:11–01:25) hubo una reconstrucción del juego desde cero dentro del repositorio, que se descartó
en `6a301be` para usar el prototipo; esa reconstrucción sigue en el historial.

## Lo que viene del prototipo (29–30 oct)

| Archivo | Líneas actuales que vienen de la importación |
|---|---|
| `js/juego.js` (menú, rampa, péndulo, voz, puntos, escenas) | 1.049 de 1.201 |
| `js/lab.js` (laboratorio con sensores, ya no está en el juego) | 440 de 440 |
| `js/dsp.js` (detector de tono YIN, filtros, ajuste lineal) | 189 de 191 |
| `js/fisica.js` | 38 de 38 |
| `css/juego.css`, `css/style.css` | 220 de 232 · 59 de 59 |
| `index.html`, `sw.js`, `manifest.webmanifest`, `lab.html`, `sensores.html` | 27 de 50 · 24 de 26 · 18 de 18 · 24 de 25 · 107 de 109 |

## Lo que se escribió en este repositorio (4 nov en adelante)

| Módulo | Qué es | Primer commit |
|---|---|---|
| `js/ajustes.js`, `js/perfiles.js`, `js/perfil.js` | Perfiles locales, edad y apoyos de accesibilidad | 4 nov 01:47–01:52 |
| `js/niveles/globo.js`, `luz.js`, `burbujas.js`, `js/camara.js` | Tres juegos nuevos y la cámara como sensor | 4 nov 01:54–02:00 |
| `js/panel.js` | Ajustes y panel «Para adultos y docentes» | 4 nov 02:22 |
| `js/tutor.js` | Tutor bayesiano del conocimiento | 4 nov 02:38 |
| `js/finales.js` | Tres finales y diploma | 4 nov 02:58 |
| `docs/`: artículo de investigación, presentación de 5 min, transferencia al mercado, impacto y ética | Documentación | 4 nov 02:00–03:28 |
| `js/diagnostico.js`, `js/bandido.js`, `js/pistas.js` | IA ligera: ideas erróneas, bandido de Thompson y tutor socrático | 4 nov 14:45 (rama `feat/tutor-ia`, PR #1, v0.8.0) |
| `js/metodo.js`, `js/color-ml.js`, `js/experimento.js`, `js/niveles/hilo.js`, `js/niveles/col.js` | Método científico, aprendizaje de colores y dos experimentos con materiales | 4 nov 15:05–15:10 (rama `feat/laboratorio`, PR #2, v0.9.0) |
| `js/libre.js`, `js/mezclas.js`, `js/densidad.js`, `js/planta.js`, `js/descubrimientos.js`, caída libre en `js/fisica.js` | Mi laboratorio (juego libre) y 24 descubrimientos | 4 nov, noche (rama `feat/laboratorio-libre`, PR #5, v1.1.0) |
| `js/niveles/huevo.js`, `js/niveles/volcan.js` | Experimentos del huevo con sal y del volcán de bicarbonato | 4 nov, noche (rama `feat/experimentos-faciles`, v1.2.0) |
| Pruebas: `test/ia.test.js`, `simulacion`, `rendimiento`, `metodo`, `colorml` | Cobertura de lo anterior | 4 nov 14:45–15:10 |

Cada versión tiene su etiqueta (`v0.7.1`, `v0.8.0`, `v0.9.0`, `v1.0.0`, `v1.0.1`, `v1.1.0`, `v1.2.0`) y las dos primeras ramas se fusionaron a `main` con un pull request.

## Qué no podemos demostrar

- **Nada de este repositorio es del 3 de noviembre.** El hackatón empezó ese día a las 9:00; el primer commit es del 4 a las 00:11.
- **No podemos probar con git cuánto del diseño del prototipo se conserva**, solo las líneas que siguen sin cambiar. Algunas son de diseño original (por ejemplo, los dibujos de la rampa y del péndulo).
- Las fechas de los commits son las reales; **no se reescribió el historial**.

## Cómo reproducir los números

```bash
# líneas actuales atribuidas a los commits de la importación
IMP='^(258172a|4c2ebb9|0962efa|417e4fc|6f4b040)$'
for f in $(git ls-files 'js/*.js' 'js/niveles/*.js' 'css/*.css' 'index.html' 'sw.js' 'lab.html' 'sensores.html' 'manifest.webmanifest'); do
  echo "$f $(wc -l < $f) $(git blame -w --line-porcelain $f | grep -E '^[0-9a-f]{40} ' | cut -c1-7 | grep -cE "$IMP")"
done
git log --format='%h %ad %s' --date=format:'%d/%m %H:%M'   # historial completo
```

Los números de este documento se calcularon el 4 de noviembre de 2026 sobre la rama `main` después de fusionar `v0.9.0`.
