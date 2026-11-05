// Agrupar la clase: aprendizaje automático clásico (k-means++ con una prueba estadística previa) que corre en el teléfono del docente, sin internet.
// 1) Comprueba si los alumnos realmente se diferencian más de lo que explicaría el azar (prueba de homogeneidad chi-cuadrado por juego, con
//    corrección por mirar seis juegos). Si no, dice «no hay grupos claros» y NO inventa grupos.
// 2) Si sí, divide la clase en dos con k-means++ (12 números por alumno: predicciones acertadas y estrellas por juego) y vuelve a dividir un
//    grupo solo si dentro de él todavía hay diferencias reales (máximo 3 grupos).
// Son sugerencias para conversar, armar parejas o grupos de trabajo: el docente decide, nada se guarda ni se envía. Resultado repetible
// (semilla fija) y que no depende del orden en que se escanearon los alumnos. Funciones puras, sin DOM.
(function (root) {
  'use strict';
  var CL = typeof require === 'function' && typeof module !== 'undefined' ? require('./clase.js') : root.CLASE;

  var MIN_ALUMNOS = 4;       // con menos no hay con qué comparar
  var Z_MIN = 2.33;          // prueba global: p < 0,01 (una cola)
  var Z_JUEGO = 2.88;        // prueba de un solo juego: p < 0,01 corregido por mirar 6 juegos (Bonferroni)
  var MIN_PARA_DIVIDIR = 6;  // un grupo de menos de 6 no se vuelve a dividir
  var UMBRAL_CUESTA = 0.6;   // un juego «cuesta» si el grupo acierta menos del 60 % de sus predicciones en él
  var REINICIOS = 12;
  var PRIOR = 1;             // suaviza el porcentaje de aciertos de quien jugó poco (Laplace)

  var SUGERENCIAS = {
    rampa: 'Probar la rampa con otro ángulo y comparar los tiempos, anotando qué cambió.',
    pendulo: 'Hacer el experimento del péndulo de hilo con materiales: cambiar solo el largo.',
    voz: 'Repetir «La voz y el globo» comparando una nota grave y una aguda.',
    globo: 'Practicar la vocal sostenida sin presión de tiempo, en parejas.',
    luz: 'Buscar en el aula objetos de cada color y explicar por qué se ven así.',
    burbujas: 'Repetir «Burbujas mágicas» y explicar cómo la cámara nota el movimiento.'
  };

  /** Generador pseudoaleatorio con semilla (mulberry32): mismo curso, mismo resultado. */
  function azar(semilla) {
    var a = semilla >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function semillaDe(alumnos) {
    var h = 2166136261, i, c, s = alumnos.map(function (a) { return a.id; }).sort().join('|');
    for (i = 0; i < s.length; i++) { c = s.charCodeAt(i); h ^= c; h = Math.imul(h, 16777619) >>> 0; }
    return h;
  }

  /** 12 números por alumno: acierto suavizado de cada juego (lo que no jugó se completa con la media de la clase) y estrellas/3. */
  function vectores(alumnos) {
    var nj = CL.JUEGOS.length, suma = [], cuenta = [], i, j;
    for (j = 0; j < nj; j++) { suma.push(0); cuenta.push(0); }
    var acierto = alumnos.map(function (a) {
      return CL.JUEGOS.map(function (id, jj) {
        if (!(a.j[jj] > 0)) return null;
        var v = (a.k[jj] + PRIOR) / (a.j[jj] + 2 * PRIOR);
        suma[jj] += v; cuenta[jj]++;
        return v;
      });
    });
    var media = suma.map(function (s, jj) { return cuenta[jj] ? s / cuenta[jj] : 0.5; });
    return alumnos.map(function (a, i2) {
      var v = [];
      for (j = 0; j < nj; j++) v.push(acierto[i2][j] === null ? media[j] : acierto[i2][j]);
      for (j = 0; j < nj; j++) v.push(a.e[j] / 3);
      return v;
    });
  }

  function dist2(a, b) { var s = 0, i, d; for (i = 0; i < a.length; i++) { d = a[i] - b[i]; s += d * d; } return s; }

  /** Un k-means con inicio k-means++. Devuelve { asignacion, centros, inercia }. */
  function kmeans(X, k, rnd) {
    var n = X.length, dim = X[0].length, centros = [], i, c, d;
    centros.push(X[Math.floor(rnd() * n)].slice());
    while (centros.length < k) {
      var ds = X.map(function (x) { var m = Infinity; centros.forEach(function (cc) { var v = dist2(x, cc); if (v < m) m = v; }); return m; });
      var total = ds.reduce(function (s, v) { return s + v; }, 0), elegido = n - 1;
      if (total > 0) { var r = rnd() * total, acc = 0; for (i = 0; i < n; i++) { acc += ds[i]; if (acc >= r) { elegido = i; break; } } }
      else elegido = Math.floor(rnd() * n);
      centros.push(X[elegido].slice());
    }
    var asign = new Array(n), cambio = true, vueltas = 0;
    while (cambio && vueltas++ < 100) {
      cambio = false;
      for (i = 0; i < n; i++) {
        var mejor = 0, md = Infinity;
        for (c = 0; c < k; c++) { d = dist2(X[i], centros[c]); if (d < md) { md = d; mejor = c; } }
        if (asign[i] !== mejor) { asign[i] = mejor; cambio = true; }
      }
      var nuevos = [], cuentas = [];
      for (c = 0; c < k; c++) { var cero = []; for (d = 0; d < dim; d++) cero.push(0); nuevos.push(cero); cuentas.push(0); }
      for (i = 0; i < n; i++) { cuentas[asign[i]]++; for (d = 0; d < dim; d++) nuevos[asign[i]][d] += X[i][d]; }
      for (c = 0; c < k; c++) {
        if (cuentas[c] === 0) { // grupo vacío: se queda con el punto más lejano de su centro
          var lejos = 0, ld = -1; for (i = 0; i < n; i++) { d = dist2(X[i], centros[asign[i]]); if (d > ld) { ld = d; lejos = i; } }
          nuevos[c] = X[lejos].slice(); cambio = true;
        } else for (d = 0; d < dim; d++) nuevos[c][d] /= cuentas[c];
      }
      centros = nuevos;
    }
    var inercia = 0; for (i = 0; i < n; i++) inercia += dist2(X[i], centros[asign[i]]);
    return { asignacion: asign, centros: centros, inercia: inercia };
  }

  /** Coeficiente de silueta medio (de -1 a 1): qué tan separados y compactos quedaron los grupos. */
  function silueta(X, asign, k) {
    var n = X.length, total = 0, i, j, c;
    for (i = 0; i < n; i++) {
      var suma = [], cuenta = []; for (c = 0; c < k; c++) { suma.push(0); cuenta.push(0); }
      for (j = 0; j < n; j++) { if (j === i) continue; suma[asign[j]] += Math.sqrt(dist2(X[i], X[j])); cuenta[asign[j]]++; }
      var propio = asign[i];
      if (cuenta[propio] === 0) continue; // grupo de un solo alumno: aporta 0
      var a = suma[propio] / cuenta[propio], b = Infinity;
      for (c = 0; c < k; c++) if (c !== propio && cuenta[c] > 0) b = Math.min(b, suma[c] / cuenta[c]);
      if (b === Infinity) continue;
      total += (b - a) / Math.max(a, b, 1e-12);
    }
    return total / n;
  }

  /** Chi-cuadrado de homogeneidad de un juego entre los alumnos (¿todos aciertan con la misma probabilidad?). null si no hay datos suficientes. */
function chiJuego(alumnos, q) {
  var K = 0, J = 0, m = 0, i, a;
  for (i = 0; i < alumnos.length; i++) { a = alumnos[i]; if (a.j[q] > 0) { K += a.k[q]; J += a.j[q]; m++; } }
  if (m < 3 || J === 0) return null;
  var p = K / J;
  if (p <= 0 || p >= 1) return null;
  var chi = 0, e;
  for (i = 0; i < alumnos.length; i++) { a = alumnos[i]; if (a.j[q] > 0) { e = a.j[q] * p; chi += (a.k[q] - e) * (a.k[q] - e) / (e * (1 - p)); } }
  return { chi: chi, df: m - 1 };
}

/** De chi-cuadrado a z (aproximación de Wilson–Hilferty). */
function zDeChi(chi, df) { return (Math.pow(chi / df, 1 / 3) - (1 - 2 / (9 * df))) / Math.sqrt(2 / (9 * df)); }

/**
 * ¿Hay diferencias reales entre estos alumnos? Devuelve una puntuación: 1 o más = sí (más que el azar al 1 %).
 * Mira los seis juegos juntos y cada juego por separado, para no perder un grupo al que le cuesta solo un juego.
 */
function heterogeneidad(alumnos) {
  var chi = 0, df = 0, zMax = -9, q, r;
  for (q = 0; q < CL.JUEGOS.length; q++) {
    r = chiJuego(alumnos, q);
    if (!r) continue;
    chi += r.chi; df += r.df; zMax = Math.max(zMax, zDeChi(r.chi, r.df));
  }
  if (df <= 0) return 0;
  return Math.max(zDeChi(chi, df) / Z_MIN, zMax / Z_JUEGO);
}

/** Divide en dos con k-means++ (mejor de varios reinicios). Devuelve dos listas de índices (sobre `todos`). */
function dividir(alumnos, indices, semilla) {
  var X = vectores(alumnos), sub = indices.map(function (i) { return X[i]; }), mejor = null, r;
  for (r = 0; r < REINICIOS; r++) {
    var res = kmeans(sub, 2, azar(semilla + r * 7919));
    if (!mejor || res.inercia < mejor.inercia - 1e-12) mejor = res;
  }
  var g = [[], []];
  indices.forEach(function (i, p) { g[mejor.asignacion[p]].push(i); });
  return g.filter(function (x) { return x.length; });
}

function describir(miembros, alumnos) {
    var nj = CL.JUEGOS.length, sumaAc = 0, nAc = 0, estrellas = 0, porJuego = [], j;
    for (j = 0; j < nj; j++) porJuego.push({ k: 0, j: 0 });
    miembros.forEach(function (i) {
      var a = alumnos[i];
      for (j = 0; j < nj; j++) { porJuego[j].k += a.k[j]; porJuego[j].j += a.j[j]; estrellas += a.e[j]; sumaAc += a.k[j]; nAc += a.j[j]; }
    });
    var peor = null;
    for (j = 0; j < nj; j++) {
      if (porJuego[j].j < 1) continue;
      var r = (porJuego[j].k + PRIOR) / (porJuego[j].j + 2 * PRIOR);
      if (!peor || r < peor.r) peor = { id: CL.JUEGOS[j], r: r };
    }
    var acierto = nAc ? sumaAc / nAc : null, estrMedia = estrellas / (miembros.length * nj);
    var nivel = acierto === null ? 'sin datos' : acierto < 0.5 ? 'refuerzo' : acierto < 0.8 ? 'en camino' : 'avanzado';
    var juego = peor && peor.r < UMBRAL_CUESTA ? peor.id : null;   // solo se señala un juego si de verdad cuesta
    var sugerencia = juego ? SUGERENCIAS[juego]
      : (nivel === 'avanzado' ? 'Proponerles retos libres en «Mi laboratorio» y que expliquen una idea a sus compañeros.' : 'Seguir jugando y conversar sobre lo que predijeron.');
    return { nivel: nivel, acierto: acierto, estrellas: estrMedia * nj, estrellasMax: nj * 3, juegoDificil: juego, sugerencia: sugerencia };
  }

  var EXPLICACION = 'Primero Chispa comprueba si tus alumnos se diferencian más de lo que explicaría el azar (una prueba estadística por juego): si no, ' +
    'te dice que no hay grupos claros y no inventa ninguno. Si sí, los reparte con k-means, un método clásico de agrupamiento que corre en tu teléfono, ' +
    'según sus predicciones acertadas y sus estrellas en cada juego, y vuelve a dividir un grupo solo si dentro de él todavía hay diferencias reales (máximo 3 grupos). ' +
    'Son sugerencias para conversar y armar parejas o grupos de trabajo: tú decides. No se envía nada y no se califica a nadie.';

  /**
   * Agrupa a los alumnos. Devuelve { ok:false, motivo:'pocos', minimo } si hay menos de 4, o
   * { ok:true, k, silueta, claro, grupos:[{ miembros:[índices], nombres, ...descripción }], explicacion }.
   * claro=false significa que no hay grupos distintos: se devuelve un solo grupo y se dice.
   */
  function agrupar(alumnos) {
    var lista = (alumnos || []).filter(function (a) { return a && a.e && a.j && a.k; })
      .sort(function (a, b) { return a.id < b.id ? -1 : (a.id > b.id ? 1 : 0); }); // el orden de escaneo no cambia el resultado
    if (lista.length < MIN_ALUMNOS) return { ok: false, motivo: 'pocos', minimo: MIN_ALUMNOS };
    var todos = lista.map(function (a, i) { return i; }), semilla = semillaDe(lista), puntuacion = heterogeneidad(lista), grupos = [todos];
    if (puntuacion >= 1) {
      var dos = dividir(lista, todos, semilla);
      if (dos.length === 2) {
        grupos = dos;
        var mejor = null;
        grupos.forEach(function (m, gi) {
          if (m.length < MIN_PARA_DIVIDIR) return;
          var h = heterogeneidad(m.map(function (i) { return lista[i]; }));
          if (h >= 1 && (!mejor || h > mejor.h)) mejor = { gi: gi, h: h };
        });
        if (mejor) {
          var sub = dividir(lista, grupos[mejor.gi], semilla + 17);
          if (sub.length === 2) { grupos.splice(mejor.gi, 1); grupos = grupos.concat(sub); }
        }
      }
    }
    var claro = grupos.length > 1;
    var out = grupos.map(function (miembros) {
      var g = describir(miembros, lista);
      g.miembros = miembros; g.nombres = miembros.map(function (i) { return lista[i].nombre; }); g.ids = miembros.map(function (i) { return lista[i].id; });
      return g;
    });
    if (!claro) { out[0].etiqueta = 'Toda la clase'; }
    else {
      out.sort(function (a, b) { return (a.acierto === null ? 1 : a.acierto) - (b.acierto === null ? 1 : b.acierto); });
      out.forEach(function (g, i) {
        var n = 'Grupo ' + (i + 1) + ': ';
        g.etiqueta = g.nivel === 'refuerzo' ? n + 'necesitan refuerzo' : (g.juegoDificil ? n + 'les cuesta «' + CL.TITULOS[g.juegoDificil] + '»' : (g.nivel === 'avanzado' ? n + 'van adelantados' : n + 'van en camino'));
      });
    }
    var X = vectores(lista), asign = new Array(lista.length);
    out.forEach(function (g, gi) { g.miembros.forEach(function (i) { asign[i] = gi; }); });
    return { ok: true, k: out.length, claro: claro, evidencia: puntuacion, silueta: claro ? silueta(X, asign, out.length) : 0, grupos: out, explicacion: EXPLICACION };
  }

  var AGRUPAR = { MIN_ALUMNOS: MIN_ALUMNOS, Z_MIN: Z_MIN, Z_JUEGO: Z_JUEGO, heterogeneidad: heterogeneidad, SUGERENCIAS: SUGERENCIAS, agrupar: agrupar, vectores: vectores, silueta: silueta, kmeans: kmeans, azar: azar };
  if (typeof module !== 'undefined' && module.exports) module.exports = AGRUPAR;
  else root.AGRUPAR = AGRUPAR;
})(typeof self !== 'undefined' ? self : this);
