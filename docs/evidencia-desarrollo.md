# Bitácora del hackatón

Registro del desarrollo de Chispa Lab con la evidencia que se puede comprobar en el historial de git (historial sin reescribir). **Todo el proyecto se desarrolló entre el 3 y el 5 de noviembre de 2026, dentro del plazo del hackatón** (Base 3: del 3 de noviembre a las 9:00 al 5 de noviembre a las 23:59). **No hay código previo al 3 de noviembre.**

## Cronología

- **3 de noviembre:** primera versión del juego: la rampa, el péndulo y la voz, el detector de tono, la física, el laboratorio de sensores y la PWA sin conexión. Se escribió ya iniciado el plazo y se incorporó al repositorio el 4 de noviembre a las 01:30 (hora de Panamá).
- **4 de noviembre:** tres juegos más y la cámara como sensor; perfiles y apoyos; panel de adultos; tutor bayesiano; diagnóstico de ideas erróneas; bandido de Thompson; colores con pocas muestras; margen aprendido; experimentos del hilo, la col, el huevo y el volcán; Mi laboratorio con 24 descubrimientos; finales y diploma; la clase con QR sin internet; agrupar la clase con k-means; navegación con rutas; modo ligero adaptable; documentación; 583 pruebas.
- **5 de noviembre:** cierre de la entrega, revisión de datos y referencias y etiqueta `v1.4.0`.

## Qué se escribió y cuándo

| Módulo | Qué es | Primer commit |
|---|---|---|
| `js/juego.js`, `js/dsp.js`, `js/fisica.js`, `css/`, `index.html`, `sw.js`, `manifest.webmanifest` | Primera versión: rampa, péndulo, voz, detector de tono, física y PWA sin conexión | 3 nov (incorporado al repositorio el 4 nov 01:30) |
| `js/ajustes.js`, `js/perfiles.js`, `js/perfil.js` | Perfiles locales, edad y apoyos de accesibilidad | 4 nov 01:47–01:52 |
| `js/niveles/globo.js`, `luz.js`, `burbujas.js`, `js/camara.js` | Tres juegos nuevos y la cámara como sensor | 4 nov 01:54–02:00 |
| `js/panel.js` | Ajustes y panel «Para adultos y docentes» | 4 nov 02:22 |
| `js/clase.js`, `js/alumnos.js`, `js/vendor/` (librerías de terceros, ver su licencia) | Rol de estudiante o docente, «Mis alumnos» y QR sin internet | 4 nov, noche |
| `js/tutor.js` | Tutor bayesiano del conocimiento | 4 nov 02:38 |
| `js/finales.js` | Tres finales y diploma | 4 nov 02:58 |
| `docs/`: artículo de investigación, transferencia al mercado, impacto y ética | Documentación | 4 nov 02:00–03:28 |
| `js/diagnostico.js`, `js/bandido.js`, `js/pistas.js` | IA ligera: ideas erróneas, bandido de Thompson y tutor socrático | 4 nov 14:45 (rama `feat/tutor-ia`, PR #1, v0.8.0) |
| `js/metodo.js`, `js/color-ml.js`, `js/experimento.js`, `js/niveles/hilo.js`, `js/niveles/col.js` | Método científico, aprendizaje de colores y dos experimentos con materiales | 4 nov 15:05–15:10 (rama `feat/laboratorio`, PR #2, v0.9.0) |
| `js/libre.js`, `js/mezclas.js`, `js/densidad.js`, `js/planta.js`, `js/descubrimientos.js`, caída libre en `js/fisica.js` | Mi laboratorio (juego libre) y 24 descubrimientos | 4 nov, noche (rama `feat/laboratorio-libre`, PR #5, v1.1.0) |
| `js/niveles/huevo.js`, `js/niveles/volcan.js` | Experimentos del huevo con sal y del volcán de bicarbonato | 4 nov, noche (rama `feat/experimentos-faciles`, v1.2.0) |
| `js/margen.js`, `js/agrupar.js`, rutas del cuaderno y ajustes, `scripts/probar-*.mjs` | Margen aprendido por niño, agrupar la clase, navegación con «atrás» en Android y pruebas de extremo a extremo (v1.4.0) | 4 nov, noche |
| Pruebas: `test/ia.test.js`, `simulacion`, `rendimiento`, `metodo`, `colorml` | Cobertura de lo anterior | 4 nov 14:45–15:10 |

Cada versión tiene su etiqueta (`v0.7.1`, `v0.8.0`, `v0.9.0`, `v1.0.0`, `v1.0.1`, `v1.1.0`, `v1.2.0`, `v1.3.0`, `v1.4.0`) y las dos primeras ramas se fusionaron a `main` con un pull request.

## Cómo comprobarlo

```bash
git log --format='%h %ad %s' --date=format:'%d/%m %H:%M'   # historial completo, 3–5 nov
npm test                                                   # 583 comprobaciones
git tag                                                    # v0.7.1 … v1.4.0
```

El primer commit del repositorio es del 4 de noviembre a las 00:11; la primera versión se escribió el 3 de noviembre y se incorporó en ese primer bloque de commits. El repositorio conserva el historial completo sin reescribir.
