'use strict';
// Experimento «El péndulo de hilo»: con un hilo, un objeto pequeño y el cronómetro del teléfono se mide cuánto tarda un péndulo y
// cómo cambia con el largo. Es un experimento con materiales: formula una hipótesis, hace una prueba justa, mide, grafica y concluye.
// Sin materiales, la medida se puede simular en pantalla. Nada se envía. Usa las globales de juego.js, EXP, METODO y DSP.

function jugarHilo(pred) {
  detener();
  tInicioPartida = performance.now();
  var LARGOS = [25, 50, 100], REPS = 2, VUELTAS = 10;
  var OBJETOS = ['🪙 moneda', '🔑 llaves', '🔩 tuerca'], ANGULOS = ['poco', 'mucho'];
  var corridas = [], paso = 'materiales', simulado = false, hipotesis = '', tIni = 0, reloj = 0, fin = 0;
  var objeto = OBJETOS[0], angulo = ANGULOS[0];
  nivel = { limpiar: function () { clearInterval(reloj); } };

  function cabecera(t, charla) {
    return '<a class="volver" href="#/">← Menú</a><h2>🧵 ' + esc(t) + '</h2>' + chispa(charla);
  }
  function mostrar(html, charla) { app.innerHTML = html; if (charla) decir(charla); }

  // ---------- 1. Materiales y seguridad ----------
  function pasoMateriales() {
    paso = 'materiales';
    app.innerHTML = cabecera('El péndulo de hilo', 'Vamos a medir un péndulo de verdad. Necesitas pocas cosas y un adulto cerca.') +
      EXP.tarjetaSeguridad(['Un hilo o cordón de más de 1 metro', 'Un objeto pequeño y ligero (una moneda atada, unas llaves, una tuerca)', 'Una regla o una cinta para medir', 'El cronómetro de tu teléfono (esta pantalla)'],
        ['Un adulto cerca.', 'No cuelgues el teléfono del hilo: se puede caer.', 'Cuelga el hilo de un clavo o una puerta, lejos de la cara y de cosas frágiles.']) +
      '<p><button id="tengo" type="button">Tengo los materiales →</button></p>' +
      '<p><button id="sin" class="sec" type="button">No tengo: probar en la pantalla</button></p>';
    $('tengo').onclick = function () { simulado = false; pasoHipotesis(); };
    $('sin').onclick = function () { simulado = true; pasoHipotesis(); };
  }

  // ---------- 2. Hipótesis ----------
  function pasoHipotesis() {
    paso = 'hipotesis';
    app.innerHTML = cabecera('Mi hipótesis', 'Antes de medir, dime qué crees que va a pasar y por qué.') + '<div id="hip"></div>';
    EXP.pantallaHipotesis($('hip'), {
      cambio: ['el largo del hilo', 'el peso del objeto', 'qué tanto separo el péndulo'],
      entonces: ['el péndulo tardará más en ir y volver', 'el péndulo tardará menos en ir y volver', 'el péndulo tardará lo mismo'],
      porque: ['recorre un camino más largo', 'el peso lo frena o lo empuja', 'no hay ninguna razón para que cambie']
    }, function (frase) { hipotesis = frase; pasoMedir(); });
  }

  // ---------- 3. Medir ----------
  function chips(id, lista, activo) {
    return '<div class="fila" id="' + id + '">' + lista.map(function (o) { return '<button type="button" class="sec chico chip' + (o === activo ? ' on' : '') + '" data-v="' + esc(o) + '" aria-pressed="' + (o === activo) + '">' + esc(o) + '</button>'; }).join('') + '</div>';
  }
  function ligarChips(id, fn) {
    var bs = $(id).querySelectorAll('.chip'), k, j;
    for (k = 0; k < bs.length; k++) bs[k].onclick = function () {
      for (j = 0; j < bs.length; j++) { bs[j].className = 'sec chico chip'; bs[j].setAttribute('aria-pressed', 'false'); }
      this.className = 'sec chico chip on'; this.setAttribute('aria-pressed', 'true'); fn(this.getAttribute('data-v'));
    };
  }
  function tablaMedidas() {
    if (!corridas.length) return '';
    return '<table><tr><th>#</th><th>Hilo</th><th>Objeto</th><th>Tiempo de 1 vuelta</th></tr>' + corridas.map(function (c, i) {
      return '<tr><td>' + (i + 1) + '</td><td>' + c.largo + ' cm</td><td>' + esc(c.objeto) + (c.simulado ? ' (simulado)' : '') + '</td><td>' + r(c.T, 2) + ' s</td></tr>';
    }).join('') + '</table>';
  }
  function pasoMedir() {
    paso = 'medir';
    var i = corridas.length, largo = LARGOS[Math.floor(i / REPS)], rep = (i % REPS) + 1;
    if (i >= LARGOS.length * REPS) { pasoResultados(); return; }
    clearInterval(reloj); tIni = 0;
    app.innerHTML = cabecera('Mide el péndulo', 'Hilo de ' + largo + ' cm. Mide desde el punto donde cuelga hasta el objeto. Medida ' + (i + 1) + ' de ' + LARGOS.length * REPS + '.') +
      '<div class="previa"><b>Hilo: ' + largo + ' cm</b> · medida ' + rep + ' de ' + REPS + '</div>' +
      '<p><b>¿Qué colgaste?</b></p>' + chips('c-obj', OBJETOS, objeto) + '<p><b>¿Cuánto lo separaste?</b></p>' + chips('c-ang', ANGULOS, angulo) +
      (simulado ? '<p class="nota">Estás en modo pantalla: Chispa simula la medida con un pequeño error, como pasaría en la vida real.</p><p><button id="sim" type="button">▶ Simular el péndulo</button></p>' :
        '<p class="nota">Separa un poco el objeto, suéltalo y toca EMPEZAR cuando empiece a ir y volver. Cuenta ' + VUELTAS + ' vueltas completas (ida y vuelta) y toca TERMINÉ.</p>' +
        '<p><button id="ini" type="button">▶ Empezar</button> <button id="fin" type="button" disabled>⏹ Terminé las ' + VUELTAS + ' vueltas</button></p><p id="cron" class="puntaje" aria-live="off">0,0 s</p>') +
      tablaMedidas();
    ligarChips('c-obj', function (v) { objeto = v; }); ligarChips('c-ang', function (v) { angulo = v; });
    function guardarMedida(T, sim) {
      corridas.push({ largo: largo, objeto: objeto, angulo: angulo, T: T, simulado: !!sim });
      sonido('ok'); pasoMedir();
    }
    if (simulado) {
      $('sim').onclick = function () { audio(); var T = 2 * Math.PI * Math.sqrt(largo / 100 / 9.81) * (1 + (Math.random() - 0.5) * 0.06); guardarMedida(T, true); };
    } else {
      $('ini').onclick = function () {
        audio(); sonido('clic'); tIni = performance.now(); $('ini').disabled = true; $('fin').disabled = false;
        reloj = setInterval(function () { var c = $('cron'); if (c) c.textContent = String(r((performance.now() - tIni) / 1000, 1)).replace('.', ',') + ' s'; }, 100);
      };
      $('fin').onclick = function () {
        clearInterval(reloj);
        var t = (performance.now() - tIni) / 1000, T = t / VUELTAS;
        if (!(T >= 0.3 && T <= 4)) { $('ini').disabled = false; $('fin').disabled = true; decir(T < 0.3 ? 'Eso fue muy rápido: ¿contaste las ' + VUELTAS + ' vueltas? Intenta de nuevo.' : 'Eso tardó mucho. Revisa que el péndulo se mueva y cuenta las ' + VUELTAS + ' vueltas.', 'triste'); return; }
        guardarMedida(T, false);
      };
    }
  }

  // ---------- 4. Resultados ----------
  function medias() {
    return LARGOS.map(function (L) {
      var ts = corridas.filter(function (c) { return c.largo === L; }).map(function (c) { return c.T; });
      return { L: L, ts: ts, T: METODO.promedio(ts), parecidas: METODO.sonParecidas(ts, 0.15) };
    });
  }
  function dibujarGrafica(cv, pts, g) {
    var c = cv.getContext('2d'), w = cv.width, h = cv.height, mx = 110, my = 0, i;
    pts.forEach(function (p) { my = Math.max(my, p.T * p.T); }); my = Math.max(my * 1.2, 0.1);
    c.clearRect(0, 0, w, h); c.fillStyle = '#fff'; c.fillRect(0, 0, w, h);
    c.strokeStyle = '#1d2250'; c.lineWidth = 2; c.beginPath(); c.moveTo(34, 8); c.lineTo(34, h - 26); c.lineTo(w - 8, h - 26); c.stroke();
    c.fillStyle = '#1d2250'; c.font = '12px sans-serif'; c.fillText('T² (s²)', 4, 14); c.fillText('largo del hilo (cm)', w - 124, h - 1);
    function X(L) { return 34 + (w - 46) * L / mx; } function Y(v) { return (h - 26) - (h - 40) * v / my; }
    if (g) { var k = 4 * Math.PI * Math.PI / g / 100; c.strokeStyle = '#3b82f6'; c.beginPath(); c.moveTo(X(0), Y(0)); c.lineTo(X(mx), Y(k * mx)); c.stroke(); } // T² = (4π²/g)·L, con L en cm → /100
    pts.forEach(function (p) { c.fillStyle = '#ff5c8a'; c.beginPath(); c.arc(X(p.L), Y(p.T * p.T), 6, 0, 7); c.fill(); c.fillStyle = '#1d2250'; c.fillText(p.L + '', X(p.L) - 8, h - 12); });
  }
  function pasoResultados() {
    paso = 'resultados';
    var m = medias(), pts = m.map(function (x) { return { x: x.L, y: x.T }; });
    var g = DSP.gravityFromPendulum(pts);
    var primero = m[0], ultimo = m[m.length - 1], razon = ultimo.T / primero.T;
    var justa = METODO.esPruebaJusta(corridas, ['largo', 'objeto', 'angulo'], 'largo');
    var parecidas = m.every(function (x) { return x.parecidas !== false; });
    var T2 = m.map(function (x) { return r(x.T * x.T, 2); });
    app.innerHTML = cabecera('Tus resultados', 'Con ' + ultimo.L + ' cm el péndulo tardó ' + String(r(ultimo.T, 2)).replace('.', ',') + ' s y con ' + primero.L + ' cm, ' + String(r(primero.T, 2)).replace('.', ',') + ' s. El hilo es ' + ultimo.L / primero.L + ' veces más largo: ¿cuántas veces más tardó?') +
      '<table><tr><th>Hilo</th><th>Medidas</th><th>Promedio</th><th>T²</th></tr>' + m.map(function (x, i) {
        return '<tr><td>' + x.L + ' cm</td><td>' + x.ts.map(function (t) { return String(r(t, 2)).replace('.', ','); }).join(' · ') + ' s</td><td>' + String(r(x.T, 2)).replace('.', ',') + ' s</td><td>' + String(T2[i]).replace('.', ',') + '</td></tr>';
      }).join('') + '</table>' +
      '<canvas id="graf" width="320" height="214" role="img" aria-label="Gráfica del tiempo al cuadrado contra el largo del hilo: los puntos caen sobre una línea recta"></canvas>' +
      '<p>' + (justa ? '✔ Hiciste una <b>prueba justa</b>: solo cambiaste el largo del hilo.' : '⚠ En tus medidas cambió más de una cosa (objeto o separación), así que no es una prueba del todo justa.') + '</p>' +
      (parecidas ? '' : '<p>⚠ Tus dos medidas del mismo hilo se parecen poco. Repetir ayuda a ver cuánto te puedes fiar.</p>') +
      '<p><b>El hilo es ' + ultimo.L / primero.L + ' veces más largo y el tiempo fue ×' + String(r(razon, 1)).replace('.', ',') + '.</b> ' + (g ? 'Con tus datos, Chispa estima que la gravedad es de unos ' + String(r(g, 1)).replace('.', ',') + ' m/s² (el valor real ronda 9,8).' : '') + '</p>' +
      '<h3>¿Cuál es tu conclusión?</h3><div id="conc">' +
      '<button class="op" data-c="a"><span class="letra">A</span>Más largo el hilo, más tarda; pero no en la misma proporción</button>' +
      '<button class="op" data-c="b"><span class="letra">B</span>El largo del hilo no cambia el tiempo</button>' +
      '<button class="op" data-c="c"><span class="letra">C</span>El tiempo crece igual que el largo (4 veces más hilo, 4 veces más tiempo)</button></div>';
    dibujarGrafica($('graf'), m.map(function (x) { return { L: x.L, T: x.T }; }), g);
    // lo que dicen los datos: la razón de tiempos es mucho menor que la de largos y mayor que 1
    var datosDicen = razon > 1.2 && razon < (ultimo.L / primero.L) * 0.8 ? 'a' : (razon <= 1.2 ? 'b' : 'c');
    var TXT = { a: 'Más largo el hilo, más tarda; pero no en la misma proporción.', b: 'El largo del hilo no cambia el tiempo.', c: 'El tiempo crece igual que el largo.' };
    $('conc').onclick = function (e) {
      var el = e.target; while (el && el !== this && !el.getAttribute('data-c')) el = el.parentNode;
      if (!el || el === this) return;
      audio(); sonido('clic');
      var eleg = el.getAttribute('data-c'), coincide = eleg === datosDicen;
      var datosTxt = m.map(function (x) { return x.L + ' cm: ' + String(r(x.T, 2)).replace('.', ',') + ' s'; }).join(' · ') + (simulado ? ' (simulado)' : '') + (g ? ' · g ≈ ' + String(r(g, 1)).replace('.', ',') + ' m/s²' : '');
      var jug = PERF.actual();
      if (jug) PERFILES.agregarCuaderno(jug, 'hilo', { hipotesis: hipotesis, datos: datosTxt, conclusion: TXT[eleg] });
      var est = 1 + (pred.ok ? 1 : 0) + (justa && parecidas ? 1 : 0);
      pts = est * 100;
      resultado(buscarNivel('hilo'), pred, {
        estrellas: est, puntos: pts,
        motivos: ['Mediste el péndulo con ' + LARGOS.length + ' largos de hilo' + (simulado ? ' (simulado en la pantalla)' : '') + '.',
          pred.ok ? 'Tu predicción fue correcta.' : 'Tu predicción no fue la correcta, y eso también enseña.',
          justa && parecidas ? 'Hiciste una prueba justa y tus medidas se parecen.' : 'Para la tercera estrella: cambia solo el largo y repite cada medida con cuidado.',
          coincide ? 'Tu conclusión coincide con tus datos.' : 'Tu conclusión no coincide con tus datos: míralos otra vez.'],
        datos: { L1: primero.L, L2: ultimo.L, T1: r(primero.T, 2), T2: r(ultimo.T, 2) },
        pregunta: 'Tus datos dicen que con ' + ultimo.L / primero.L + ' veces más hilo el tiempo fue ×' + r(razon, 1) + '. ¿Por qué crees que no salió ×' + ultimo.L / primero.L + '?',
        tabla: '<table><tr><th>Hilo</th><th>T promedio</th></tr>' + m.map(function (x) { return '<tr><td>' + x.L + ' cm</td><td>' + r(x.T, 2) + ' s</td></tr>'; }).join('') + '</table>',
        revela: 'El tiempo de un péndulo es T = 2π·√(L/g): depende de la raíz del largo. Por eso, con 4 veces más hilo, el tiempo se duplica (√4 = 2), no se cuadruplica. ' +
          'Si dibujas T² contra L, los puntos caen en una línea recta, como en tu gráfica, y su pendiente permite estimar la gravedad. El peso del objeto no aparece en la fórmula.'
      });
    };
  }

  pasoMateriales();
}

EXPERIMENTOS.push({
  id: 'hilo', icono: '🧵', titulo: 'El péndulo de hilo', sub: 'Con un hilo y una moneda', color: '#3b82f6', sensor: 'ninguno', experimento: true, jugar: jugarHilo,
  historia: 'Este es un experimento de verdad: con un hilo, un objeto pequeño y tu teléfono como cronómetro vas a medir un péndulo, hacer una prueba justa y dibujar tus datos. ¡Y todo queda en tu cuaderno!',
  pred: { q: 'Si el hilo es 4 veces más largo, el péndulo tardará en ir y volver…', ops: [
    { id: 'cuatro', t: '4 veces más' }, { id: 'doble', t: 'El doble', ok: true }, { id: 'igual', t: 'Lo mismo' }] }
});
