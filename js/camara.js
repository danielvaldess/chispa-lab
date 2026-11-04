// Cámara del teléfono como sensor: color, sombra y movimiento. Sin librerías ni IA.
// Las imágenes se procesan en el teléfono (64×48 píxeles) y NO se guardan ni se envían a ningún sitio.
// Las funciones puras corren también en Node (para pruebas); abrir() solo existe en el navegador.
(function (root) {
  'use strict';

  var COLS = 64, FILAS = 48;

  function rgbAHsv(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    var mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn, h = 0;
    if (d > 0) {
      if (mx === r) h = ((g - b) / d) % 6; else if (mx === g) h = (b - r) / d + 2; else h = (r - g) / d + 4;
      h *= 60; if (h < 0) h += 360;
    }
    return { h: h, s: mx === 0 ? 0 : d / mx, v: mx };
  }

  /** 'rojo' | 'verde' | 'azul' | 'amarillo' | null (gris, blanco, negro o mezcla). */
  function clasificarColor(r, g, b) {
    var c = rgbAHsv(r, g, b);
    if (c.s < 0.3 || c.v < 0.25) return null;
    var h = c.h;
    if (h >= 345 || h < 15) return 'rojo';
    if (h >= 45 && h < 70) return 'amarillo';
    if (h >= 85 && h < 165) return 'verde';
    if (h >= 195 && h < 255) return 'azul';
    return null;
  }

  /** De RGBA (ImageData) a una lista de grises 0–255. */
  function grises(datos) {
    var n = datos.length >> 2, out = new Float32Array(n), i;
    for (i = 0; i < n; i++) out[i] = 0.299 * datos[i * 4] + 0.587 * datos[i * 4 + 1] + 0.114 * datos[i * 4 + 2];
    return out;
  }

  /**
   * Fracción de la imagen que está en sombra respecto del propio cuadro (la cámara ajusta sola la exposición,
   * así que no se usa el brillo absoluto): píxeles por debajo de la mitad del brillo del 30 % más claro.
   */
  function fraccionSombra(gris) {
    var orden = Array.prototype.slice.call(gris).sort(function (a, b) { return b - a; });
    var n = Math.max(1, Math.floor(orden.length * 0.3)), ref = 0, i;
    for (i = 0; i < n; i++) ref += orden[i];
    ref /= n;
    if (ref < 12) return 1; // todo oscuro: cámara tapada
    var umbral = ref * 0.5, c = 0;
    for (i = 0; i < gris.length; i++) if (gris[i] < umbral) c++;
    return c / gris.length;
  }

  /** Diferencia media entre dos fotos (0–1) en una cuadrícula de cx×cy celdas. */
  function energiaCeldas(g1, g0, cols, filas, cx, cy) {
    var out = new Float32Array(cx * cy), cuenta = new Float32Array(cx * cy), x, y;
    for (y = 0; y < filas; y++) {
      for (x = 0; x < cols; x++) {
        var k = Math.min(cy - 1, Math.floor(y * cy / filas)) * cx + Math.min(cx - 1, Math.floor(x * cx / cols));
        out[k] += Math.abs(g1[y * cols + x] - g0[y * cols + x]) / 255;
        cuenta[k]++;
      }
    }
    for (x = 0; x < out.length; x++) out[x] = cuenta[x] ? out[x] / cuenta[x] : 0;
    return out;
  }

  /** Color dominante (promedio) de la zona central del cuadro. */
  function colorCentral(datos, cols, filas) {
    var x0 = Math.floor(cols * 0.38), x1 = Math.ceil(cols * 0.62), y0 = Math.floor(filas * 0.38), y1 = Math.ceil(filas * 0.62), r = 0, g = 0, b = 0, n = 0, x, y;
    for (y = y0; y < y1; y++) for (x = x0; x < x1; x++) { var i = (y * cols + x) * 4; r += datos[i]; g += datos[i + 1]; b += datos[i + 2]; n++; }
    return { r: r / n, g: g / n, b: b / n };
  }

  /**
   * Abre la cámara. opciones: { frente: true para la cámara frontal }. Devuelve una promesa con
   * { video, frente, actualizar(), color(), sombra(), movimiento(cx, cy), cerrar() } o rechaza si no hay cámara o permiso.
   */
  function abrir(opciones) {
    var frente = !!(opciones && opciones.frente);
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return Promise.reject(new Error('sin cámara'));
    return navigator.mediaDevices.getUserMedia({ video: { facingMode: frente ? 'user' : { ideal: 'environment' }, width: { ideal: 320 }, height: { ideal: 240 } }, audio: false }).then(function (flujo) {
      var v = document.createElement('video');
      v.setAttribute('playsinline', ''); v.setAttribute('muted', ''); v.setAttribute('autoplay', '');
      v.muted = true; v.playsInline = true;
      v.style.cssText = 'position:fixed;left:0;top:0;width:1px;height:1px;opacity:0;pointer-events:none';
      v.srcObject = flujo;
      document.body.appendChild(v);
      var lienzo = document.createElement('canvas'); lienzo.width = COLS; lienzo.height = FILAS;
      var c2 = lienzo.getContext('2d', { willReadFrequently: true });
      var previo = null, actual = null, datos = null;
      var api = {
        video: v, frente: frente,
        listo: function () { return v.readyState >= 2 && v.videoWidth > 0; },
        /** Toma una foto reducida; llámalo una vez por cuadro. */
        actualizar: function () {
          if (!api.listo()) return false;
          c2.drawImage(v, 0, 0, COLS, FILAS);
          datos = c2.getImageData(0, 0, COLS, FILAS).data;
          previo = actual; actual = grises(datos);
          return true;
        },
        color: function () { if (!datos) return null; var c = colorCentral(datos, COLS, FILAS); return { nombre: clasificarColor(c.r, c.g, c.b), r: c.r, g: c.g, b: c.b }; },
        sombra: function () { return actual ? fraccionSombra(actual) : 0; },
        movimiento: function (cx, cy) { return actual && previo ? energiaCeldas(actual, previo, COLS, FILAS, cx, cy) : null; },
        cerrar: function () {
          try { flujo.getTracks().forEach(function (t) { t.stop(); }); } catch (e) {}
          try { v.pause(); v.srcObject = null; if (v.parentNode) v.parentNode.removeChild(v); } catch (e) {}
        }
      };
      return v.play().catch(function () {}).then(function () { return api; });
    });
  }

  var CAM = {
    COLS: COLS, FILAS: FILAS, rgbAHsv: rgbAHsv, clasificarColor: clasificarColor, grises: grises, fraccionSombra: fraccionSombra,
    energiaCeldas: energiaCeldas, colorCentral: colorCentral, abrir: abrir
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = CAM;
  else root.CAM = CAM;
})(typeof self !== 'undefined' ? self : this);
