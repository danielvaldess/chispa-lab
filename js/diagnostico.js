// Diagnóstico de ideas erróneas: un clasificador bayesiano pequeño que corre en el teléfono, sin internet y sin enviar nada.
// Cada opción equivocada de una predicción delata una idea concreta (por ejemplo «el tiempo baja a la mitad si doblo el ángulo»).
// Por jugador y por juego se mantiene la probabilidad de cada hipótesis («entiende la idea» o «tiene la idea errónea k»)
// y se actualiza con la regla de Bayes cada vez que elige una respuesta. Las probabilidades de acertar, de equivocarse
// por despiste y de adivinar son valores por defecto razonables, NO están ajustados con datos de niños. Sin DOM.
(function (root) {
  'use strict';

  var OK = 'ok';
  var P_ACIERTA = 0.8;   // si entiende la idea, elige la respuesta correcta
  var P_DELATA = 0.7;    // si tiene la idea errónea k, elige una respuesta que la delata
  var P_ADIVINA = 0.15;  // si tiene una idea errónea, aun así acierta por azar
  var PRIOR_OK = 0.4;    // antes de ver nada, 40 % entiende la idea y el resto se reparte entre las ideas erróneas

  /** Qué idea errónea delata cada opción equivocada, por juego. La opción correcta va en `ok`. */
  var CATALOGO = {
    rampa: {
      ok: 'menos',
      ideas: { mitad: 'rampa-proporcional', igual: 'rampa-no-importa' }
    },
    pendulo: {
      ok: 'igual',
      ideas: { mas: 'pendulo-peso', menos: 'pendulo-peso' }
    },
    voz: {
      ok: 'sube',
      ideas: { baja: 'voz-invertida', igual: 'voz-no-cambia' }
    },
    globo: {
      ok: 'igual',
      ideas: { sube: 'tono-deriva', baja: 'tono-deriva' }
    },
    luz: {
      ok: 'refleja',
      ideas: { fabrica: 'luz-fabrica', absorbe: 'luz-absorbe' }
    },
    burbujas: {
      ok: 'cero',
      ideas: { grande: 'camara-siempre', igual: 'camara-no-compara' }
    },
    hilo: {
      ok: 'doble',
      ideas: { cuatro: 'hilo-proporcional', igual: 'hilo-no-importa' }
    },
    col: {
      ok: 'rosa',
      ideas: { verde: 'col-invertida', igual: 'col-no-cambia' }
    }
  };

  /** Cómo se llama cada idea errónea, en palabras sencillas (para el adulto). */
  var TEXTOS = {
    'rampa-proporcional': 'Cree que si el ángulo se duplica, el tiempo se reduce a la mitad.',
    'rampa-no-importa': 'Cree que la inclinación no cambia el tiempo que tarda la canica.',
    'pendulo-peso': 'Cree que un objeto más pesado o más ligero cambia el ritmo del péndulo.',
    'voz-invertida': 'Cree que una nota más aguda tiene menos vibraciones por segundo.',
    'voz-no-cambia': 'Cree que la frecuencia de la voz no cambia al cantar más agudo.',
    'tono-deriva': 'Cree que el tono se va moviendo solo aunque se mantenga la nota.',
    'luz-fabrica': 'Cree que los objetos fabrican su propia luz de color.',
    'luz-absorbe': 'Confunde qué luz devuelve un objeto y cuál absorbe.',
    'camara-siempre': 'Cree que la cámara siempre ve cambios, aunque nada se mueva.',
    'camara-no-compara': 'Cree que la cámara no compara fotos para detectar el movimiento.',
    'hilo-proporcional': 'Cree que si el hilo es 4 veces más largo, el péndulo tarda 4 veces más.',
    'hilo-no-importa': 'Cree que el largo del hilo no cambia el tiempo del péndulo.',
    'col-invertida': 'Confunde el color que toma la col morada con un ácido y con una base.',
    'col-no-cambia': 'Cree que el jugo de col morada no cambia de color con un ácido.'
  };

  function ideasDe(nivelId) {
    var c = CATALOGO[nivelId];
    if (!c) return [];
    var vistas = {}, out = [];
    Object.keys(c.ideas).forEach(function (op) {
      var i = c.ideas[op];
      if (!vistas[i]) { vistas[i] = true; out.push(i); }
    });
    return out;
  }

  /** Probabilidad de elegir la opción `op` dadas la hipótesis `h` y el juego. */
  function verosimilitud(nivelId, h, op) {
    var c = CATALOGO[nivelId], ops = Object.keys(c.ideas).concat([c.ok]);
    var erroneas = ops.length - 1, i;
    if (h === OK) return op === c.ok ? P_ACIERTA : (1 - P_ACIERTA) / erroneas;
    // h es una idea errónea: las opciones que la delatan se reparten P_DELATA
    var delatan = 0, otras = 0;
    for (i = 0; i < ops.length; i++) {
      if (ops[i] === c.ok) continue;
      if (c.ideas[ops[i]] === h) delatan++; else otras++;
    }
    if (op === c.ok) return P_ADIVINA;
    // si todas las opciones equivocadas delatan la misma idea, no queda a dónde repartir el resto y se suma a esa idea
    if (c.ideas[op] === h) return (otras > 0 ? P_DELATA : 1 - P_ADIVINA) / delatan;
    return (1 - P_DELATA - P_ADIVINA) / otras;
  }

  /** Estado inicial de un juego: n = respuestas vistas, post = probabilidad de cada hipótesis. */
  function nuevo(nivelId) {
    var ideas = ideasDe(nivelId), post = {}, i;
    post[OK] = PRIOR_OK;
    for (i = 0; i < ideas.length; i++) post[ideas[i]] = (1 - PRIOR_OK) / ideas.length;
    return { n: 0, post: post };
  }

  /** Regla de Bayes con una respuesta. No modifica el estado original. Una opción desconocida no cambia nada. */
  function observar(estado, nivelId, opcion) {
    var c = CATALOGO[nivelId];
    var base = estado && estado.post ? estado : nuevo(nivelId);
    if (!c || (opcion !== c.ok && !c.ideas[opcion])) return { n: base.n, post: copiar(base.post) };
    var post = {}, total = 0, h;
    for (h in base.post) if (Object.prototype.hasOwnProperty.call(base.post, h)) {
      post[h] = base.post[h] * verosimilitud(nivelId, h, opcion);
      total += post[h];
    }
    for (h in post) post[h] = Math.round((post[h] / total) * 1000) / 1000;
    return { n: base.n + 1, post: post };
  }

  function copiar(o) { var c = {}; for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) c[k] = o[k]; return c; }

  /** La idea errónea más probable y su probabilidad, solo si supera a «entiende» y a un umbral. Si no, null. */
  function probable(estado, umbral) {
    if (!estado || !estado.post) return null;
    umbral = umbral === undefined ? 0.5 : umbral;
    var mejor = null, h;
    for (h in estado.post) if (Object.prototype.hasOwnProperty.call(estado.post, h) && h !== OK) {
      if (mejor === null || estado.post[h] > estado.post[mejor]) mejor = h;
    }
    if (mejor === null || estado.post[mejor] < umbral || estado.post[mejor] <= (estado.post[OK] || 0)) return null;
    return { idea: mejor, p: estado.post[mejor] };
  }

  /** Limpia un estado leído del almacenamiento: solo hipótesis conocidas, probabilidades válidas y que sumen 1. */
  function normalizar(estado, nivelId) {
    if (!CATALOGO[nivelId] || !estado || typeof estado !== 'object' || !estado.post || typeof estado.post !== 'object') return null;
    var n = Math.floor(Number(estado.n));
    if (!(n > 0) || n > 1e6) return null;
    var validas = [OK].concat(ideasDe(nivelId)), post = {}, total = 0;
    validas.forEach(function (h) {
      var v = Number(estado.post[h]);
      post[h] = isFinite(v) && v >= 0 && v <= 1 ? v : 0;
      total += post[h];
    });
    if (!(total > 0)) return null;
    validas.forEach(function (h) { post[h] = Math.round((post[h] / total) * 1000) / 1000; });
    return { n: n, post: post };
  }

  var DIAGNOSTICO = {
    OK: OK, CATALOGO: CATALOGO, TEXTOS: TEXTOS, ideasDe: ideasDe, nuevo: nuevo, observar: observar,
    probable: probable, normalizar: normalizar, verosimilitud: verosimilitud,
    /** ¿Qué idea errónea delata esta opción? (null si es la correcta o no existe). */
    ideaDeOpcion: function (nivelId, opcion) { var c = CATALOGO[nivelId]; return c && c.ideas[opcion] ? c.ideas[opcion] : null; },
    texto: function (idea) { return TEXTOS[idea] || ''; }
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = DIAGNOSTICO;
  else root.DIAGNOSTICO = DIAGNOSTICO;
})(typeof self !== 'undefined' ? self : this);
