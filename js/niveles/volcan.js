'use strict';
// Experimento «El volcán de bicarbonato»: el clásico de vinagre y bicarbonato. Con la misma cantidad de bicarbonato y cada vez más vinagre, el niño mide cuánto
// tiempo burbujea. Descubre que más vinagre da más burbujeo hasta que se acaba el bicarbonato (un tope). Sin materiales, el tiempo se simula con una estimación
// aproximada (1 cucharadita de bicarbonato reacciona con unas 4 cucharadas de vinagre). Usa las globales de juego.js, EXP y METODO.

function jugarVolcan(pred) {
  detener();
  tInicioPartida = performance.now();
  var CANTIDADES = [1, 4, 8], REPS = 2, TOPE_VINAGRE = 4.4; // cucharadas de vinagre; con 1 cucharadita de bicarbonato el vinagre se gasta cerca de 4,4 cucharadas
  var corridas = [], simulado = false, hipotesis = '', tIni = 0, reloj = 0;
  nivel = { limpiar: function () { clearInterval(reloj); } };

  function cabecera(t, charla) { return '<a class="volver" href="#/">← Menú</a><h2>🌋 ' + esc(t) + '</h2>' + chispa(charla); }
  function coma(x, d) { return String(r(x, d === undefined ? 1 : d)).replace('.', ','); }
  function duracionSimulada(c) { return (6 + 34 * Math.min(1, c / TOPE_VINAGRE)) * (1 + (Math.random() - 0.5) * 0.12); }

  function pasoMateriales() {
    app.innerHTML = cabecera('El volcán de bicarbonato', 'Vamos a medir cuánto tiempo burbujea. Necesitas pocas cosas, una bandeja y un adulto cerca.') +
      EXP.tarjetaSeguridad(['Un vaso o frasco ABIERTO, y una bandeja o un plato hondo debajo', 'Bicarbonato de sodio y una cucharadita', 'Vinagre y una cuchara sopera', 'El cronómetro de tu teléfono (esta pantalla)'],
        ['Un adulto cerca.', 'Nunca cierres una botella ni un frasco: el gas lo puede reventar.', 'Pocas cantidades, lejos de la cara y de los ojos.', 'No pruebes la mezcla. Limpia con agua.']) +
      '<p><button id="tengo" type="button">Tengo los materiales →</button></p><p><button id="sin" class="sec" type="button">No tengo: probar en la pantalla</button></p>';
    $('tengo').onclick = function () { simulado = false; pasoHipotesis(); };
    $('sin').onclick = function () { simulado = true; pasoHipotesis(); };
  }
  function pasoHipotesis() {
    app.innerHTML = cabecera('Mi hipótesis', 'Antes de mezclar, dime qué crees que pasará con el burbujeo y por qué.') + '<div id="hip"></div>';
    EXP.pantallaHipotesis($('hip'), {
      cambio: ['la cantidad de vinagre', 'la cantidad de bicarbonato', 'el tamaño del vaso'],
      entonces: ['burbujeará más tiempo', 'burbujeará menos tiempo', 'burbujeará lo mismo'],
      porque: ['hay más cosas que pueden reaccionar', 'el vinagre se evapora', 'no hay ninguna razón para que cambie']
    }, function (frase) { hipotesis = frase; pasoMedir(); });
  }
  function tabla() {
    if (!corridas.length) return '';
    return '<table><tr><th>#</th><th>Vinagre</th><th>Bicarbonato</th><th>Burbujeó</th></tr>' + corridas.map(function (c, i) { return '<tr><td>' + (i + 1) + '</td><td>' + c.vinagre + ' cdas</td><td>1 cdta</td><td>' + coma(c.t, 0) + ' s' + (c.simulado ? ' (sim.)' : '') + '</td></tr>'; }).join('') + '</table>';
  }
  function pasoMedir() {
    var i = corridas.length, cant = CANTIDADES[Math.floor(i / REPS)], rep = (i % REPS) + 1;
    if (i >= CANTIDADES.length * REPS) { pasoResultados(); return; }
    clearInterval(reloj); tIni = 0;
    app.innerHTML = cabecera('Mide el burbujeo', 'Pon 1 cucharadita de bicarbonato en el vaso (siempre la misma) y ' + cant + ' cucharada' + (cant > 1 ? 's' : '') + ' de vinagre. Medida ' + (i + 1) + ' de ' + CANTIDADES.length * REPS + '.') +
      '<div class="previa"><b>Vinagre: ' + cant + ' cucharada' + (cant > 1 ? 's' : '') + '</b> · medida ' + rep + ' de ' + REPS + '</div>' +
      (simulado ? '<p class="nota">Estás en modo pantalla: Chispa simula el tiempo con una estimación aproximada.</p><p><button id="sim" type="button">▶ Echar el vinagre</button></p>' :
        '<p class="nota">Toca EMPEZAR justo cuando eches el vinagre y TERMINÉ cuando ya casi no queden burbujas.</p><p><button id="ini" type="button">▶ Empezar</button> <button id="fin" type="button" disabled>⏹ Terminé</button></p><p id="cron" class="puntaje" aria-live="off">0 s</p>') +
      tabla();
    function guardar(t, sim) { corridas.push({ vinagre: cant, t: t, simulado: !!sim }); sonido('ok'); pasoMedir(); }
    if (simulado) $('sim').onclick = function () { audio(); guardar(duracionSimulada(cant), true); };
    else {
      $('ini').onclick = function () { audio(); sonido('clic'); tIni = performance.now(); $('ini').disabled = true; $('fin').disabled = false; reloj = setInterval(function () { var c = $('cron'); if (c) c.textContent = Math.round((performance.now() - tIni) / 1000) + ' s'; }, 250); };
      $('fin').onclick = function () {
        clearInterval(reloj); var t = (performance.now() - tIni) / 1000;
        if (t < 2 || t > 300) { $('ini').disabled = false; $('fin').disabled = true; decir(t < 2 ? 'Eso fue muy rápido: espera a que dejen de salir burbujas.' : 'Eso tardó demasiado: toca TERMINÉ cuando casi no queden burbujas.', 'triste'); return; }
        guardar(t, false);
      };
    }
  }
  function medias() {
    return CANTIDADES.map(function (c) { var ts = corridas.filter(function (x) { return x.vinagre === c; }).map(function (x) { return x.t; }); return { c: c, ts: ts, T: METODO.promedio(ts), parecidas: METODO.sonParecidas(ts, 0.3) }; });
  }
  function pasoResultados() {
    var m = medias(), d1 = m[0].T, d2 = m[1].T, d3 = m[2].T;
    var justa = METODO.esPruebaJusta(corridas.map(function (c) { return { vinagre: c.vinagre, bicarbonato: 1 }; }), ['vinagre', 'bicarbonato'], 'vinagre');
    var parecidas = m.every(function (x) { return x.parecidas !== false; });
    var datosDicen = d3 > d2 * 1.25 ? 'b' : (d2 > d1 * 1.25 ? 'a' : 'c');
    var maxT = Math.max(d1, d2, d3);
    app.innerHTML = cabecera('Tus resultados', 'Con ' + m[0].c + ' cucharada burbujeó ' + coma(d1, 0) + ' s, con ' + m[1].c + ' fueron ' + coma(d2, 0) + ' s y con ' + m[2].c + ' fueron ' + coma(d3, 0) + ' s. ¿Sigue subiendo siempre?') +
      '<table><tr><th>Vinagre</th><th>Medidas</th><th>Promedio</th></tr>' + m.map(function (x) { return '<tr><td>' + x.c + ' cdas</td><td>' + x.ts.map(function (t) { return coma(t, 0); }).join(' · ') + ' s</td><td>' + coma(x.T, 0) + ' s</td></tr>'; }).join('') + '</table>' +
      '<canvas id="graf" width="320" height="170" role="img" aria-label="Barras con el tiempo que burbujeó con cada cantidad de vinagre"></canvas>' +
      '<p>' + (justa ? '✔ Hiciste una <b>prueba justa</b>: solo cambiaste el vinagre.' : '⚠ Cambió más de una cosa.') + '</p>' + (parecidas ? '' : '<p>⚠ Tus dos medidas de la misma cantidad se parecen poco. Repetir ayuda a ver cuánto te puedes fiar.</p>') +
      '<h3>¿Cuál es tu conclusión?</h3><div id="conc"><button class="op" data-c="a"><span class="letra">A</span>Con más vinagre burbujea más tiempo, pero llega un momento en que ya no sube</button>' +
      '<button class="op" data-c="b"><span class="letra">B</span>Con más vinagre burbujea siempre más tiempo, sin parar</button>' +
      '<button class="op" data-c="c"><span class="letra">C</span>La cantidad de vinagre no cambia cuánto burbujea</button></div>';
    var cv = $('graf'), c = cv.getContext('2d'), w = cv.width, h = cv.height, bw = (w - 60) / 3;
    c.fillStyle = '#fff'; c.fillRect(0, 0, w, h);
    m.forEach(function (x, k) { var bh = (h - 50) * x.T / (maxT * 1.1), bx = 30 + k * (bw + 0); c.fillStyle = ['#f59e0b', '#ef6c00', '#c2410c'][k]; c.fillRect(bx + 10, h - 28 - bh, bw - 20, bh); c.fillStyle = '#1d2250'; c.font = '700 12px sans-serif'; c.textAlign = 'center'; c.fillText(coma(x.T, 0) + ' s', bx + bw / 2, h - 32 - bh); c.fillText(x.c + ' cdas', bx + bw / 2, h - 10); });
    var TXT = { a: 'Con más vinagre burbujea más tiempo, pero llega un tope.', b: 'Con más vinagre burbujea siempre más tiempo.', c: 'La cantidad de vinagre no cambia el burbujeo.' };
    $('conc').onclick = function (e) {
      var el = e.target; while (el && el !== this && !el.getAttribute('data-c')) el = el.parentNode;
      if (!el || el === this) return;
      audio(); sonido('clic');
      var eleg = el.getAttribute('data-c'), coincide = eleg === datosDicen, jug = PERF.actual();
      var datosTxt = m.map(function (x) { return x.c + ' cdas: ' + coma(x.T, 0) + ' s'; }).join(' · ') + (simulado ? ' (simulado)' : '');
      if (jug) PERFILES.agregarCuaderno(jug, 'volcan', { hipotesis: hipotesis, datos: datosTxt, conclusion: TXT[eleg] }, new Date());
      var est = 1 + (pred.ok ? 1 : 0) + (justa && parecidas ? 1 : 0);
      pts = est * 100;
      resultado(buscarNivel('volcan'), pred, {
        estrellas: est, puntos: pts,
        motivos: ['Mediste el burbujeo con ' + CANTIDADES.length + ' cantidades de vinagre' + (simulado ? ' (simulado en la pantalla)' : '') + '.',
          pred.ok ? 'Tu predicción fue correcta.' : 'Tu predicción no fue la correcta, y eso también enseña.',
          justa && parecidas ? 'Hiciste una prueba justa y tus medidas se parecen.' : 'Para la tercera estrella: cambia solo el vinagre y repite cada medida.',
          coincide ? 'Tu conclusión coincide con tus datos.' : 'Tu conclusión no coincide con tus datos: míralos otra vez.'],
        datos: { t1: r(d1, 0), t2: r(d2, 0), t3: r(d3, 0) },
        pregunta: 'Pasaste de ' + m[1].c + ' a ' + m[2].c + ' cucharadas de vinagre y el tiempo fue de ' + coma(d2, 0) + ' s a ' + coma(d3, 0) + ' s. ¿Por qué crees que no se duplicó?',
        tabla: '<table><tr><th>Vinagre</th><th>Burbujeó</th></tr>' + m.map(function (x) { return '<tr><td>' + x.c + ' cdas</td><td>' + coma(x.T, 0) + ' s</td></tr>'; }).join('') + '</table>',
        revela: 'El vinagre (un ácido) y el bicarbonato (una base) reaccionan y sueltan un gas, el dióxido de carbono: son las burbujas. La reacción sigue mientras queden los dos. Con poco vinagre se acaba el vinagre; con mucho, se acaba el bicarbonato, y entonces ya no burbujea más aunque sigas echando. ' +
          'A eso se le llama reactivo limitante. Las cantidades del juego simulado son aproximadas.'
      });
    };
  }
  pasoMateriales();
}

EXPERIMENTOS.push({
  id: 'volcan', icono: '🌋', titulo: 'El volcán de bicarbonato', sub: 'Vinagre y bicarbonato', color: '#ef4444', sensor: 'ninguno', experimento: true, jugar: jugarVolcan,
  historia: 'El volcán de vinagre y bicarbonato es famoso, pero ¿de qué depende cuánto burbujea? Con la misma cantidad de bicarbonato y cada vez más vinagre, vas a medirlo con una prueba justa.',
  pred: { q: 'Si le echas cada vez más vinagre a la misma cantidad de bicarbonato, el burbujeo…', ops: [
    { id: 'siempre', t: 'Dura cada vez más, sin parar' }, { id: 'tope', t: 'Dura más, pero llega un momento en que ya no sube', ok: true }, { id: 'igual', t: 'Dura lo mismo' }] }
});
