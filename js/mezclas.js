// Mesa de mezclas: un vaso de laboratorio virtual donde se echan sustancias de cocina y se ve qué pasa. Es un MODELO SIMPLIFICADO para jugar y
// descubrir (no un simulador de química real): pH aproximado, color del jugo de col morada, burbujas al juntar un ácido con bicarbonato, capas del aceite,
// sal y azúcar que se disuelven hasta saturar y mezcla de colorantes. Solo hay sustancias seguras de cocina. Funciones puras, sin DOM ni internet.
(function (root) {
  'use strict';

  var CAPACIDAD_ML = 250;
  var K_ACIDO = 2.8, K_BASE = 0.92, PH_BASE_MAX = 8.6, PH_ACIDO_MIN = 2.2;

  /** Qué es cada sustancia y cuánto se echa por toque: ml (líquidos), g (polvos) o gotas de colorante (1 ml). */
  var SUSTANCIAS = {
    agua: { nombre: 'Agua', emoji: '💧', tipo: 'liquido', ml: 15 },
    col: { nombre: 'Jugo de col morada', emoji: '🟣', tipo: 'liquido', ml: 15 },
    limon: { nombre: 'Limón', emoji: '🍋', tipo: 'liquido', ml: 15, acidez: 3 },
    vinagre: { nombre: 'Vinagre', emoji: '🍶', tipo: 'liquido', ml: 15, acidez: 2 },
    aceite: { nombre: 'Aceite', emoji: '🫒', tipo: 'liquido', ml: 15 },
    bicarbonato: { nombre: 'Bicarbonato', emoji: '🧂', tipo: 'polvo', g: 5, base: 2 },
    sal: { nombre: 'Sal', emoji: '🧂', tipo: 'polvo', g: 6, saturacion: 0.36 },
    azucar: { nombre: 'Azúcar', emoji: '🍬', tipo: 'polvo', g: 4, saturacion: 2.0 },
    rojo: { nombre: 'Colorante rojo', emoji: '🔴', tipo: 'colorante', ml: 1 },
    amarillo: { nombre: 'Colorante amarillo', emoji: '🟡', tipo: 'colorante', ml: 1 },
    azul: { nombre: 'Colorante azul', emoji: '🔵', tipo: 'colorante', ml: 1 }
  };
  var ORDEN = ['agua', 'col', 'limon', 'vinagre', 'bicarbonato', 'sal', 'azucar', 'aceite', 'rojo', 'amarillo', 'azul'];

  var ANCLAS = [ // color del jugo de col morada según el pH (aproximado)
    [2, [222, 60, 100]], [3, [224, 80, 154]], [4.5, [190, 85, 170]], [6, [150, 82, 176]], [7, [122, 79, 176]], [8.3, [74, 111, 208]], [10, [56, 160, 168]], [12, [70, 190, 100]]
  ];
  var AGUA_CLARA = [225, 240, 250], ACEITE = [244, 214, 110];

  function nuevo() {
    return { agua: 0, col: 0, limon: 0, vinagre: 0, aceite: 0, bicarbonato: 0, sal: 0, azucar: 0, rojo: 0, amarillo: 0, azul: 0, acido: 0, base: 0, reacciones: 0, desbordo: false };
  }
  function copiar(v) { var o = {}, k; for (k in v) if (Object.prototype.hasOwnProperty.call(v, k)) o[k] = v[k]; return o; }

  /** Volumen de líquido en ml (sin el polvo). */
  function volumen(v) {
    return v.agua * 15 + v.col * 15 + v.limon * 15 + v.vinagre * 15 + v.aceite * 15 + v.rojo + v.amarillo + v.azul;
  }
  /** Volumen de la fase acuosa (todo menos el aceite). */
  function volAcuoso(v) { return volumen(v) - v.aceite * 15; }

  function lerp(a, b, t) { return a + (b - a) * t; }
  function mezclaRGB(a, b, t) { return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)]; }

  function colorIndicador(ph) {
    var i, a, b, t;
    if (ph <= ANCLAS[0][0]) return ANCLAS[0][1].slice();
    for (i = 1; i < ANCLAS.length; i++) {
      if (ph <= ANCLAS[i][0]) { a = ANCLAS[i - 1]; b = ANCLAS[i]; t = (ph - a[0]) / (b[0] - a[0]); return mezclaRGB(a[1], b[1], t); }
    }
    return ANCLAS[ANCLAS.length - 1][1].slice();
  }

  /** pH aproximado de la fase acuosa: 7 si no hay ácido ni base sin reaccionar; baja con el ácido y sube (poco) con el bicarbonato. */
  function ph(v) {
    var ml = volAcuoso(v);
    if (ml <= 0) return 7;
    var dosis = ml / 15;
    if (v.acido > v.base) { var ca = (v.acido - v.base) / dosis; return Math.max(PH_ACIDO_MIN, 7 - K_ACIDO * Math.sqrt(ca)); }
    if (v.base > v.acido) { var cb = (v.base - v.acido) / dosis; return Math.min(PH_BASE_MAX, 7 + K_BASE * Math.sqrt(cb)); }
    return 7;
  }

  /** Color de los colorantes por mezcla de pigmentos rojo-amarillo-azul (interpolación trilineal en el cubo RYB). */
  var RYB = { // esquinas [r][y][b]
    '000': [255, 255, 255], '100': [255, 20, 40], '010': [255, 230, 20], '001': [40, 95, 190],
    '110': [255, 130, 10], '101': [130, 30, 140], '011': [20, 165, 60], '111': [60, 35, 20]
  };
  function colorPigmentos(r, y, b) {
    var m = Math.max(r, y, b);
    if (m <= 0) return null;
    var x = r / m, yy = y / m, z = b / m, out = [0, 0, 0], i, j, k, w, c, c0, c1;
    for (i = 0; i < 2; i++) for (j = 0; j < 2; j++) for (k = 0; k < 2; k++) {
      w = (i ? x : 1 - x) * (j ? yy : 1 - yy) * (k ? z : 1 - z);
      c = RYB['' + i + j + k];
      out[0] += w * c[0]; out[1] += w * c[1]; out[2] += w * c[2];
    }
    return out;
  }

  /** Cómo se ve el vaso: capas de arriba abajo, pH (solo se ve con jugo de col), sedimento y texto. */
  function estado(v) {
    var ml = volAcuoso(v), dosis = Math.max(ml / 15, 0.0001), p = ph(v), color = AGUA_CLARA.slice();
    var pigmentos = v.rojo + v.amarillo + v.azul, ind = v.col > 0;
    if (ind) {
      var fracCol = Math.min(1, v.col / dosis);
      color = mezclaRGB(color, colorIndicador(p), Math.min(1, 0.35 + 1.3 * fracCol));
    }
    if (pigmentos > 0) {
      var tinta = colorPigmentos(v.rojo, v.amarillo, v.azul), inten = Math.min(1, pigmentos / dosis * 1.2);
      color = ind ? mezclaRGB(color, mezclaRGB(color, tinta, inten), 0.5) : mezclaRGB(color, tinta, inten);
    }
    var cap = ml * SUSTANCIAS.sal.saturacion; // gramos de sal que caben (36 g por cada 100 ml)
    var salDis = Math.min(v.sal * 6, cap), salSed = Math.max(0, v.sal * 6 - cap);
    var capAz = ml * SUSTANCIAS.azucar.saturacion, azDis = Math.min(v.azucar * 4, capAz), azSed = Math.max(0, v.azucar * 4 - capAz);
    var capas = [];
    if (v.aceite > 0) capas.push({ id: 'aceite', ml: v.aceite * 15, color: ACEITE.slice() });
    if (ml > 0) capas.push({ id: 'acuosa', ml: ml, color: color });
    return {
      ph: ind ? Math.round(p * 10) / 10 : null, phReal: Math.round(p * 10) / 10, color: color, capas: capas, ml: volumen(v),
      sedimento: Math.round((salSed + azSed) * 10) / 10, polvoDisuelto: Math.round((salDis + azDis) * 10) / 10,
      clase: ind ? (p < 6.2 ? 'ácido' : (p > 7.8 ? 'base' : 'neutro')) : null, vacio: volumen(v) <= 0 && v.sal + v.azucar + v.bicarbonato === 0
    };
  }

  /**
   * Echa una dosis de una sustancia. Devuelve { vaso, eventos } (el vaso original no se modifica).
   * Eventos: { t: 'burbujas', fuerza }, 'neutraliza', 'color-acido', 'color-base', 'capas', 'disuelve-sal', 'disuelve-azucar', 'saturado',
   * 'naranja', 'verde', 'morado', 'sal-neutra', 'desborda'.
   */
  function agregar(vaso, id) {
    var s = SUSTANCIAS[id], eventos = [];
    if (!s) return { vaso: vaso, eventos: eventos };
    var v = copiar(vaso), antes = estado(vaso), reaccion = 0;
    if (id === 'bicarbonato' || id === 'sal' || id === 'azucar') { if (volAcuoso(v) <= 0) return { vaso: vaso, eventos: [{ t: 'seco' }] }; }
    v[id] += 1;
    if (s.acidez) v.acido += s.acidez;
    if (s.base) v.base += s.base;
    // un ácido y una base reaccionan y sueltan gas: burbujas
    if (v.acido > 0 && v.base > 0) {
      reaccion = Math.min(v.acido, v.base);
      v.acido -= reaccion; v.base -= reaccion; v.reacciones += 1;
      eventos.push({ t: 'burbujas', fuerza: reaccion });
    }
    // el vaso desborda: se pierde el exceso (proporcional) y se dice
    var total = volumen(v);
    if (total > CAPACIDAD_ML) {
      var f = CAPACIDAD_ML / total, k;
      for (k in { agua: 1, col: 1, limon: 1, vinagre: 1, aceite: 1 }) v[k] = Math.floor(v[k] * f * 1000) / 1000;
      v.rojo = Math.floor(v.rojo * f); v.amarillo = Math.floor(v.amarillo * f); v.azul = Math.floor(v.azul * f);
      v.acido *= f; v.base *= f; v.desbordo = true;
      eventos.push({ t: 'desborda' });
    }
    var ahora = estado(v);
    if (v.col > 0 && ahora.phReal < 5.5) eventos.push({ t: 'color-acido' });
    if (v.col > 0 && ahora.phReal > 7.8) eventos.push({ t: 'color-base' });
    if (reaccion > 0 && v.col > 0 && ahora.phReal >= 6.3 && ahora.phReal <= 7.7) eventos.push({ t: 'neutraliza' });
    if (id === 'aceite' && volAcuoso(v) > 0 || (id !== 'aceite' && v.aceite > 0 && volAcuoso(v) > 0 && s.tipo === 'liquido')) eventos.push({ t: 'capas' });
    if (id === 'sal') eventos.push(ahora.sedimento > antes.sedimento ? { t: 'saturado', con: 'sal' } : { t: 'disuelve-sal' });
    if (id === 'azucar') eventos.push(ahora.sedimento > antes.sedimento ? { t: 'saturado', con: 'azucar' } : { t: 'disuelve-azucar' });
    if (id === 'sal' && v.col > 0 && ahora.phReal >= 6.8 && ahora.phReal <= 7.2) eventos.push({ t: 'sal-neutra' });
    if (s.tipo === 'colorante') {
      if (v.rojo > 0 && v.amarillo > 0 && v.azul === 0) eventos.push({ t: 'naranja' });
      if (v.amarillo > 0 && v.azul > 0 && v.rojo === 0) eventos.push({ t: 'verde' });
      if (v.rojo > 0 && v.azul > 0 && v.amarillo === 0) eventos.push({ t: 'morado' });
    }
    return { vaso: v, eventos: eventos };
  }

  var MEZCLAS = { CAPACIDAD_ML: CAPACIDAD_ML, SUSTANCIAS: SUSTANCIAS, ORDEN: ORDEN, nuevo: nuevo, agregar: agregar, estado: estado, ph: ph, volumen: volumen, colorIndicador: colorIndicador, colorPigmentos: colorPigmentos };
  if (typeof module !== 'undefined' && module.exports) module.exports = MEZCLAS;
  else root.MEZCLAS = MEZCLAS;
})(typeof self !== 'undefined' ? self : this);
