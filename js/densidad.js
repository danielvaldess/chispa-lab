// Flota o se hunde: densidades APROXIMADAS de objetos de casa y de líquidos, y dónde se queda cada objeto en una torre de líquidos.
// Un objeto flota en un líquido si es menos denso que él. Es un modelo simplificado para jugar (los huevos y las uvas reales varían). Sin DOM ni internet.
(function (root) {
  'use strict';

  var CUCHARADITAS_MAX = 15;     // cabe hasta ≈ 90 g de sal en 250 ml (36 g por cada 100 ml)
  var DENS_POR_CUCHARADITA = 0.017; // 1 cucharadita (≈ 6 g) en 250 ml sube la densidad ≈ 0,017 g/cm³

  var LIQUIDOS = {
    aceite: { nombre: 'Aceite', dens: 0.92, color: [244, 214, 110] },
    agua: { nombre: 'Agua', dens: 1.0, color: [150, 205, 240] },
    salada: { nombre: 'Agua con sal', dens: 1.0, color: [120, 190, 235] },   // la densidad real depende de la sal: ver densidadSalada()
    miel: { nombre: 'Miel', dens: 1.4, color: [214, 140, 30] }
  };

  /** forma: algunos objetos cambian de densidad efectiva según su forma (plastilina en bola o en barquito, con aire dentro). */
  var OBJETOS = {
    corcho: { nombre: 'Corcho', emoji: '🍾', dens: 0.24 },
    lapiz: { nombre: 'Lápiz', emoji: '✏️', dens: 0.6 },
    hielo: { nombre: 'Hielo', emoji: '🧊', dens: 0.92 },
    manzana: { nombre: 'Manzana', emoji: '🍎', dens: 0.84 },
    naranja: { nombre: 'Naranja con cáscara', emoji: '🍊', dens: 0.85 },
    naranjaPelada: { nombre: 'Naranja pelada', emoji: '🍊', dens: 1.05 },
    uva: { nombre: 'Uva', emoji: '🍇', dens: 1.06 },
    huevo: { nombre: 'Huevo', emoji: '🥚', dens: 1.075 },
    papa: { nombre: 'Papa', emoji: '🥔', dens: 1.09 },
    moneda: { nombre: 'Moneda', emoji: '🪙', dens: 7.5 },
    plastilina: { nombre: 'Plastilina', emoji: '🟠', dens: 1.5, formas: { bola: 1.5, barquito: 0.6 } }
  };
  var ORDEN_OBJETOS = ['corcho', 'lapiz', 'hielo', 'manzana', 'naranja', 'naranjaPelada', 'uva', 'huevo', 'papa', 'moneda', 'plastilina'];

  function acotar(t) { return Math.max(0, Math.min(CUCHARADITAS_MAX, Number(t) || 0)); }

  /** Densidad del agua con `t` cucharaditas de sal en un vaso de 250 ml. */
  function densidadSalada(t) { return Math.round((1 + DENS_POR_CUCHARADITA * acotar(t)) * 1000) / 1000; }

  /** Densidad efectiva de un objeto (con su forma, si la tiene). */
  function densidadObjeto(id, forma) {
    var o = OBJETOS[id];
    if (!o) return null;
    if (o.formas && forma && o.formas[forma] !== undefined) return o.formas[forma];
    return o.dens;
  }

  /**
   * Torre de líquidos de abajo arriba, ordenada por densidad. `sal` son las cucharaditas del agua salada (si va en la torre).
   * ids: lista de ids de LIQUIDOS, por ejemplo ['agua', 'aceite'].
   */
  function torre(ids, sal) {
    return (ids || []).filter(function (id) { return LIQUIDOS[id]; }).map(function (id) {
      return { id: id, nombre: LIQUIDOS[id].nombre, dens: id === 'salada' ? densidadSalada(sal) : LIQUIDOS[id].dens, color: LIQUIDOS[id].color };
    }).sort(function (a, b) { return b.dens - a.dens; });
  }

  /**
   * Dónde se queda un objeto: recorre la torre desde arriba (lo menos denso); se detiene encima de la primera capa más densa que él.
   * Devuelve { tipo: 'flota' | 'entre' | 'hunde', sobre: id de la capa que lo sostiene o null }.
   * 'flota' = en la superficie; 'entre' = flota entre dos capas; 'hunde' = llega al fondo.
   */
  function posicion(id, forma, capas) {
    var d = densidadObjeto(id, forma), i, n = capas.length;
    if (d === null || !n) return null;
    for (i = n - 1; i >= 0; i--) { // desde la capa menos densa (la de arriba) hacia el fondo
      if (d < capas[i].dens) return { tipo: i === n - 1 ? 'flota' : 'entre', sobre: capas[i].id, indice: i };
    }
    return { tipo: 'hunde', sobre: null, indice: -1 };
  }

  /** Cucharaditas de sal que hacen falta para que un objeto flote en el agua (redondeado hacia arriba a décimas); 0 si ya flota; null si no flota ni con el vaso saturado. */
  function cucharaditasParaFlotar(id, forma) {
    var d = densidadObjeto(id, forma);
    if (d === null) return null;
    if (d < 1) return 0;
    var t = Math.ceil(((d - 1) / DENS_POR_CUCHARADITA) * 10 - 1e-9) / 10;
    return t <= CUCHARADITAS_MAX ? t : null;
  }

  var DENSIDAD = {
    CUCHARADITAS_MAX: CUCHARADITAS_MAX, LIQUIDOS: LIQUIDOS, OBJETOS: OBJETOS, ORDEN_OBJETOS: ORDEN_OBJETOS,
    densidadSalada: densidadSalada, densidadObjeto: densidadObjeto, torre: torre, posicion: posicion, cucharaditasParaFlotar: cucharaditasParaFlotar
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = DENSIDAD;
  else root.DENSIDAD = DENSIDAD;
})(typeof self !== 'undefined' ? self : this);
