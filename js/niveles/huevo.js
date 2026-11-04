'use strict';
// Experimento «¿Flota o se hunde?»: el clásico del huevo y la sal. Con un vaso de agua, sal y un huevo (o una uva) el niño cambia solo la cantidad
// de sal, anota si flota y descubre que el agua con sal es más densa. Sin materiales, el resultado se simula con las densidades de DENSIDAD
// (aproximadas: los huevos y las uvas reales varían). Usa las globales de juego.js, EXP, METODO y DENSIDAD.

function jugarHuevo(pred) {
  detener();
  tInicioPartida = performance.now();
  var PASOS = [0, 2, 4, 6, 8], OBJETOS = [{ id: 'huevo', t: '🥚 huevo' }, { id: 'uva', t: '🍇 uva' }];
  var datos = [], simulado = false, hipotesis = '', objeto = 'huevo';
  nivel = { limpiar: function () {} };

  function cabecera(t, charla) { return '<a class="volver" href="#/">← Menú</a><h2>🥚 ' + esc(t) + '</h2>' + chispa(charla); }
  function coma(x, d) { return String(r(x, d === undefined ? 1 : d)).replace('.', ','); }

  function pasoMateriales() {
    app.innerHTML = cabecera('¿Flota o se hunde?', 'Un experimento famoso y fácil: ¿puede la sal hacer flotar un huevo? Necesitas pocas cosas y un adulto cerca.') +
      EXP.tarjetaSeguridad(['Un vaso grande o un frasco de vidrio', 'Agua del grifo (un vaso lleno, unos 250 ml)', 'Sal de cocina y una cucharita', 'Un huevo crudo (o una uva)'],
        ['Un adulto cerca.', 'Baja el huevo con la cuchara para que no se rompa.', 'No pruebes el agua con sal ni el huevo crudo: lávate las manos al terminar.']) +
      '<p><button id="tengo" type="button">Tengo los materiales →</button></p><p><button id="sin" class="sec" type="button">No tengo: probar en la pantalla</button></p>';
    $('tengo').onclick = function () { simulado = false; pasoHipotesis(); };
    $('sin').onclick = function () { simulado = true; pasoHipotesis(); };
  }
  function pasoHipotesis() {
    app.innerHTML = cabecera('Mi hipótesis', 'Antes de probar, dime qué crees que pasará con el huevo y por qué.') + '<div id="hip"></div>';
    EXP.pantallaHipotesis($('hip'), {
      cambio: ['la cantidad de sal en el agua', 'el tamaño del huevo', 'la temperatura del agua'],
      entonces: ['el huevo acabará flotando', 'el huevo se hundirá más rápido', 'el huevo se quedará igual'],
      porque: ['el agua con sal es más densa y lo empuja más', 'la sal pesa más que el huevo', 'la sal no cambia nada del agua']
    }, function (frase) { hipotesis = frase; pasoProbar(); });
  }
  function resultadoSimulado(sal) { var p = DENSIDAD.posicion(objeto, null, DENSIDAD.torre(['salada'], sal)); return p.tipo === 'hunde' ? 'hunde' : 'flota'; }

  function pasoProbar() {
    var i = datos.length;
    if (i >= PASOS.length) { pasoResultados(); return; }
    var sal = PASOS[i];
    app.innerHTML = cabecera('Prueba ' + (i + 1) + ' de ' + PASOS.length, sal === 0 ? 'Empieza con agua sin sal. Suelta el ' + (objeto === 'huevo' ? 'huevo' : 'objeto') + ' con cuidado y mira.' : 'Echa ' + (sal - PASOS[i - 1]) + ' cucharaditas más de sal (en total ' + sal + ') y revuelve hasta que se disuelva. Suelta de nuevo el ' + (objeto === 'huevo' ? 'huevo' : 'objeto') + '.') +
      '<div class="previa"><b>Sal en el agua: ' + sal + ' cucharaditas</b></div>' +
      (i === 0 ? '<p><b>¿Qué vas a usar?</b> (el mismo en todas las pruebas)</p><div class="fila" id="c-obj">' + OBJETOS.map(function (o) { return '<button type="button" class="sec chico chip' + (o.id === objeto ? ' on' : '') + '" data-v="' + o.id + '">' + o.t + '</button>'; }).join('') + '</div>' : '') +
      (simulado ? '<p class="nota">Estás en modo pantalla: Chispa simula el resultado con la densidad aproximada del ' + (objeto === 'huevo' ? 'huevo' : 'objeto') + '.</p><p><button id="sim" type="button">▶ Soltar</button></p>' :
        '<p><b>¿Qué pasó?</b></p><p><button id="flota" type="button">⬆ Flota</button> <button id="hunde" type="button">⬇ Se hunde</button></p>') +
      tabla();
    if (i === 0) {
      var bs = $('c-obj').querySelectorAll('.chip'), k, j;
      for (k = 0; k < bs.length; k++) bs[k].onclick = function () { for (j = 0; j < bs.length; j++) bs[j].className = 'sec chico chip'; this.className = 'sec chico chip on'; objeto = this.getAttribute('data-v'); };
    }
    function guardar(res) { datos.push({ sal: sal, objeto: objeto, res: res }); sonido(res === 'flota' ? 'ok' : 'clic'); pasoProbar(); }
    if (simulado) $('sim').onclick = function () { audio(); guardar(resultadoSimulado(sal)); };
    else { $('flota').onclick = function () { audio(); guardar('flota'); }; $('hunde').onclick = function () { audio(); guardar('hunde'); }; }
  }
  function tabla() {
    if (!datos.length) return '';
    return '<table><tr><th>Sal</th><th>Objeto</th><th>Resultado</th></tr>' + datos.map(function (d) { return '<tr><td>' + d.sal + ' cdtas</td><td>' + (d.objeto === 'huevo' ? '🥚' : '🍇') + '</td><td>' + (d.res === 'flota' ? '⬆ flota' : '⬇ se hunde') + '</td></tr>'; }).join('') + '</table>';
  }

  function pasoResultados() {
    var primerFlota = null, i;
    for (i = 0; i < datos.length; i++) if (datos[i].res === 'flota') { primerFlota = datos[i].sal; break; }
    var justa = METODO.esPruebaJusta(datos, ['sal', 'objeto'], 'sal');
    var modelo = DENSIDAD.cucharaditasParaFlotar(objeto);
    var datosDicen = primerFlota === null ? 'b' : (datos[0].res === 'flota' && primerFlota === 0 ? 'b' : 'a');
    if (datos[0].res === 'flota' && datos[datos.length - 1].res === 'hunde') datosDicen = 'c';
    app.innerHTML = cabecera('Tus resultados', primerFlota === null ? 'Con hasta ' + PASOS[PASOS.length - 1] + ' cucharaditas no flotó. Tal vez haga falta más sal o revolver mejor.' : 'Empezó a flotar con ' + primerFlota + ' cucharaditas de sal. ¡Mira cuánto cambió!') + tabla() +
      '<canvas id="graf" width="320" height="120" role="img" aria-label="Fila de pruebas: con poca sal el objeto se hunde y con más sal flota"></canvas>' +
      '<p>' + (justa ? '✔ Hiciste una <b>prueba justa</b>: solo cambiaste la sal.' : '⚠ Cambiaste más de una cosa (el objeto), así que no es una prueba del todo justa.') + '</p>' +
      (modelo !== null && modelo > 0 ? '<p class="nota">Dato de referencia: en el modelo del juego, ' + (objeto === 'huevo' ? 'un huevo' : 'una uva') + ' empieza a flotar con unas ' + coma(modelo) + ' cucharaditas en un vaso de 250 ml. Los huevos reales varían: ¡el tuyo puede ser distinto!</p>' : '') +
      '<h3>¿Cuál es tu conclusión?</h3><div id="conc"><button class="op" data-c="a"><span class="letra">A</span>Con más sal el agua es más densa y el objeto acaba flotando</button>' +
      '<button class="op" data-c="b"><span class="letra">B</span>La sal no cambia si flota o se hunde</button>' +
      '<button class="op" data-c="c"><span class="letra">C</span>Con más sal el objeto se hunde más</button></div>';
    var cv = $('graf'), c = cv.getContext('2d'), w = cv.width, h = cv.height, cel = (w - 20) / datos.length;
    c.fillStyle = '#fff'; c.fillRect(0, 0, w, h);
    datos.forEach(function (d, k) {
      var x = 10 + k * cel; c.fillStyle = 'rgba(150,205,240,.7)'; c.fillRect(x + 4, 30, cel - 8, h - 50);
      c.font = '26px sans-serif'; c.textAlign = 'center'; c.fillText(d.objeto === 'huevo' ? '🥚' : '🍇', x + cel / 2, d.res === 'flota' ? 50 : h - 28);
      c.fillStyle = '#1d2250'; c.font = '700 12px sans-serif'; c.fillText(d.sal + ' cdtas', x + cel / 2, h - 6);
    });
    var TXT = { a: 'Con más sal el agua es más densa y el objeto acaba flotando.', b: 'La sal no cambia si flota o se hunde.', c: 'Con más sal el objeto se hunde más.' };
    $('conc').onclick = function (e) {
      var el = e.target; while (el && el !== this && !el.getAttribute('data-c')) el = el.parentNode;
      if (!el || el === this) return;
      audio(); sonido('clic');
      var eleg = el.getAttribute('data-c'), coincide = eleg === datosDicen, jug = PERF.actual();
      var datosTxt = datos.map(function (d) { return d.sal + ' cdtas: ' + (d.res === 'flota' ? 'flota' : 'se hunde'); }).join(' · ') + (simulado ? ' (simulado)' : '');
      if (jug) PERFILES.agregarCuaderno(jug, 'huevo', { hipotesis: hipotesis, datos: datosTxt, conclusion: TXT[eleg] }, new Date());
      var est = 1 + (pred.ok ? 1 : 0) + (justa ? 1 : 0);
      pts = est * 100;
      resultado(buscarNivel('huevo'), pred, {
        estrellas: est, puntos: pts,
        motivos: ['Probaste ' + datos.length + ' cantidades de sal' + (simulado ? ' (simulado en la pantalla)' : '') + '.',
          pred.ok ? 'Tu predicción fue correcta.' : 'Tu predicción no fue la correcta, y eso también enseña.',
          justa ? 'Hiciste una prueba justa.' : 'Para la tercera estrella: cambia solo la sal y usa el mismo objeto.',
          coincide ? 'Tu conclusión coincide con tus datos.' : 'Tu conclusión no coincide con tus datos: míralos otra vez.'],
        datos: { umbral: primerFlota === null ? -1 : primerFlota },
        pregunta: primerFlota === null ? '¿Qué podrías cambiar para que flote? ¿Qué pasaría con más sal?' : 'Empezó a flotar con ' + primerFlota + ' cucharaditas. ¿Por qué crees que la sal ayuda a flotar?',
        tabla: tabla(),
        revela: 'Un objeto flota si es menos denso que el líquido. El agua sola es menos densa que el huevo, que se hunde. Al disolver sal, el agua se vuelve más densa (tiene más masa en el mismo volumen), y cuando pasa a ser más densa que el huevo, lo empuja hacia arriba y flota. ' +
          'Por eso es más fácil flotar en el Mar Muerto que en una piscina. Los números del juego son aproximados.'
      });
    };
  }
  pasoMateriales();
}

EXPERIMENTOS.push({
  id: 'huevo', icono: '🥚', titulo: '¿Flota o se hunde?', sub: 'El huevo y la sal', color: '#f59e0b', sensor: 'ninguno', experimento: true, jugar: jugarHuevo,
  historia: 'Un experimento famoso y fácil: con un vaso de agua, sal y un huevo vas a descubrir por qué algunas cosas flotan. Haz una prueba justa, anota lo que pasa y concluye.',
  pred: { q: 'Si le echas mucha sal al agua, un huevo que se hunde…', ops: [
    { id: 'flota', t: 'Acabará flotando', ok: true }, { id: 'igual', t: 'Se seguirá hundiendo igual' }, { id: 'hunde', t: 'Se hundirá todavía más' }] }
});
