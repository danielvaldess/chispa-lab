// Aprendizaje de colores en el teléfono («few-shot»): el niño le enseña a Chispa unas pocas muestras (por ejemplo, la col morada
// con agua, con limón y con bicarbonato) y Chispa clasifica los vasos desconocidos por el centroide más cercano. Se compara solo el
// tono y la intensidad del color (a* y b* del espacio CIE Lab, sin la luminosidad), para que importe menos cuánta luz haya.
// No usa internet, no descarga modelos y no guarda imágenes. No es un medidor de pH: da «parecido a» lo que se le enseñó. Sin DOM.
(function (root) {
  'use strict';

  function lineal(c) { c /= 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }
  function f(t) { return t > 216 / 24389 ? Math.cbrt ? Math.cbrt(t) : Math.pow(t, 1 / 3) : (24389 / 27 * t + 16) / 116; }

  /** sRGB (0–255) → CIE Lab (iluminante D65). */
  function rgbALab(r, g, b) {
    var R = lineal(r), G = lineal(g), B = lineal(b);
    var X = (0.4124564 * R + 0.3575761 * G + 0.1804375 * B) / 0.95047;
    var Y = 0.2126729 * R + 0.7151522 * G + 0.0721750 * B;
    var Z = (0.0193339 * R + 0.1191920 * G + 0.9503041 * B) / 1.08883;
    var fx = f(X), fy = f(Y), fz = f(Z);
    return { L: 116 * fy - 16, a: 500 * (fx - fy), b: 200 * (fy - fz) };
  }

  /** Promedio de varias muestras {r,g,b} (por ejemplo, 20 fotos seguidas del mismo vaso). */
  function promediar(muestras) {
    var n = 0, r = 0, g = 0, b = 0;
    (muestras || []).forEach(function (m) { if (m && isFinite(m.r) && isFinite(m.g) && isFinite(m.b)) { r += m.r; g += m.g; b += m.b; n++; } });
    return n ? { r: r / n, g: g / n, b: b / n, n: n } : null;
  }

  function nuevo() { return { clases: {} }; }

  /** Enseña una muestra de una clase. Devuelve un modelo nuevo (el centroide es el promedio de las muestras de esa clase). */
  function ensenar(modelo, clase, rgb) {
    if (!clase || !rgb || !isFinite(rgb.r) || !isFinite(rgb.g) || !isFinite(rgb.b)) return modelo;
    var lab = rgbALab(rgb.r, rgb.g, rgb.b), out = { clases: {} }, k;
    for (k in modelo.clases) if (Object.prototype.hasOwnProperty.call(modelo.clases, k)) out.clases[k] = { a: modelo.clases[k].a, b: modelo.clases[k].b, n: modelo.clases[k].n };
    var c = out.clases[clase];
    if (c) { c.a = (c.a * c.n + lab.a) / (c.n + 1); c.b = (c.b * c.n + lab.b) / (c.n + 1); c.n += 1; }
    else out.clases[clase] = { a: lab.a, b: lab.b, n: 1 };
    return out;
  }

  /** ¿Se enseñaron al menos dos clases distintas? Con una sola no hay con qué comparar. */
  function listo(modelo) { return Object.keys(modelo.clases).length >= 2; }

  /**
   * Clasifica un color por el centroide más cercano. Devuelve { clase, confianza, ranking } o null si no hay modelo.
   * confianza = 1 − d1/d2 (0 si la muestra está a la misma distancia de las dos clases más cercanas, cerca de 1 si está sobre una).
   * `seguro` es true si la confianza llega al umbral (0,35 por defecto): si no, Chispa debe decir «no estoy segura».
   */
  function clasificar(modelo, rgb, umbral) {
    if (!modelo || !listo(modelo) || !rgb) return null;
    var lab = rgbALab(rgb.r, rgb.g, rgb.b), ranking = [];
    Object.keys(modelo.clases).forEach(function (k) {
      var c = modelo.clases[k];
      ranking.push({ clase: k, distancia: Math.sqrt((lab.a - c.a) * (lab.a - c.a) + (lab.b - c.b) * (lab.b - c.b)) });
    });
    ranking.sort(function (x, y) { return x.distancia - y.distancia; });
    var d1 = ranking[0].distancia, d2 = ranking[1].distancia;
    var confianza = d2 === 0 ? 0 : Math.max(0, Math.min(1, 1 - d1 / d2));
    return { clase: ranking[0].clase, confianza: Math.round(confianza * 100) / 100, seguro: confianza >= (umbral === undefined ? 0.35 : umbral), ranking: ranking };
  }

  /** Distancia en a*, b* entre dos colores RGB: cuánto se nota la diferencia de tono (más de ~10 se ve claramente). */
  function distanciaTono(c1, c2) {
    var x = rgbALab(c1.r, c1.g, c1.b), y = rgbALab(c2.r, c2.g, c2.b);
    return Math.sqrt((x.a - y.a) * (x.a - y.a) + (x.b - y.b) * (x.b - y.b));
  }

  var COLOR_ML = { rgbALab: rgbALab, promediar: promediar, nuevo: nuevo, ensenar: ensenar, listo: listo, clasificar: clasificar, distanciaTono: distanciaTono };
  if (typeof module !== 'undefined' && module.exports) module.exports = COLOR_ML;
  else root.COLOR_ML = COLOR_ML;
})(typeof self !== 'undefined' ? self : this);
