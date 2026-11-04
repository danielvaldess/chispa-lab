'use strict';
// Experimento «Chispa detective: ¿ácido o base?»: el jugo de col morada cambia de color según lo que se le echa. El niño le enseña a Chispa
// tres vasos (agua, limón, bicarbonato) y ella aprende a reconocerlos por su color (color-ml.js, en el teléfono, sin internet y sin guardar
// imágenes). Después predice y comprueba vasos misteriosos. Sin materiales o sin cámara, los vasos se simulan en pantalla.
// No es un medidor de pH: solo dice a cuál de los vasos que le enseñaron se parece. Usa las globales de juego.js, EXP, METODO, CAM y COLOR_ML.

function jugarCol(pred) {
  detener();
  tInicioPartida = performance.now();
  var NOMBRES = { neutro: 'neutro', acido: 'ácido', base: 'base' };
  var ENSENAR = [
    { clase: 'neutro', nombre: 'agua', emoji: '💧', receta: 'agua', virt: { r: 122, g: 79, b: 176 } },
    { clase: 'acido', nombre: 'limón', emoji: '🍋', receta: 'jugo de limón', virt: { r: 224, g: 80, b: 154 } },
    { clase: 'base', nombre: 'bicarbonato', emoji: '🧂', receta: 'una cucharadita de bicarbonato disuelta en agua', virt: { r: 74, g: 111, b: 208 } }
  ];
  var MISTERIOS = [
    { id: 'vinagre', nombre: 'vinagre', emoji: '🍶', verdad: 'acido', virt: { r: 218, g: 86, b: 150 } },
    { id: 'sal', nombre: 'agua con una pizca de sal', emoji: '🧂', verdad: 'neutro', virt: { r: 126, g: 82, b: 172 } }
  ];
  var modelo = COLOR_ML.nuevo(), simulado = false, hipotesis = '', cam = null, raf2 = 0, captura = null, camLista = false;
  var paso = 'materiales', idx = 0, aciertosPred = 0, aciertosChispa = 0, notas = [];
  nivel = { limpiar: function () { cancelAnimationFrame(raf2); if (cam) { cam.cerrar(); cam = null; } } };

  function cabecera(t, charla) { return '<a class="volver" href="#/">← Menú</a><h2>🔎 ' + esc(t) + '</h2>' + chispa(charla); }
  function ruido(c) { function f(v) { return Math.max(0, Math.min(255, v + (Math.random() - 0.5) * 12)); } return { r: f(c.r), g: f(c.g), b: f(c.b) }; }
  function hex(c) { function h(v) { v = Math.round(v); return (v < 16 ? '0' : '') + v.toString(16); } return '#' + h(c.r) + h(c.g) + h(c.b); }

  // ---------- cámara: vista previa y muestreo ----------
  function bucleCam() {
    raf2 = requestAnimationFrame(bucleCam);
    if (!cam) return;
    var v = $('vista'), ok = cam.actualizar();
    if (v && ok && cam.listo()) {
      var c = v.getContext('2d'), w = v.width, h = v.height;
      c.drawImage(cam.video, 0, 0, w, h);
      c.lineWidth = 4; c.strokeStyle = '#fff'; c.strokeRect(w * 0.38, h * 0.38, w * 0.24, h * 0.24);
    }
    if (captura && ok) {
      var col = cam.color(); if (col) captura.muestras.push({ r: col.r, g: col.g, b: col.b });
      if (captura.muestras.length >= 20) { var cb = captura.cb, prom = COLOR_ML.promediar(captura.muestras); captura = null; cb(prom); }
    }
  }
  function abrirCamara(alListo) {
    if (simulado || cam) { alListo(); return; }
    CAM.abrir({ frente: false }).then(function (c) {
      if (nivel === null) { c.cerrar(); return; }
      cam = c; camLista = true; bucleCam(); alListo();
    }).catch(function () { simulado = true; alListo(); decir('No pude usar la cámara, pero no pasa nada: seguimos con los vasos en la pantalla.', 'triste'); });
  }
  function mirar(clase, alTener) {
    if (simulado) { alTener(ruido(clase)); return; }
    if (!cam || !cam.listo()) { decir('La cámara todavía se está preparando. Espera un momento y vuelve a tocar «Mirar».', 'pensando'); return; }
    captura = { muestras: [], cb: alTener };
  }
  function vistaHTML(virt) {
    return simulado ? '<div class="vaso-sim" style="background:' + hex(virt) + '" role="img" aria-label="Un vaso con jugo de col simulado"></div>' :
      '<canvas id="vista" width="240" height="180" role="img" aria-label="Lo que ve la cámara; el cuadro blanco marca dónde mira Chispa"></canvas>';
  }

  // ---------- 1. materiales ----------
  function pasoMateriales() {
    paso = 'materiales';
    app.innerHTML = cabecera('Chispa detective', 'La col morada es un detective de ácidos y bases: cambia de color. Vamos a enseñarme a reconocerlo.') +
      EXP.tarjetaSeguridad(['Jugo de col morada (un adulto hierve unas hojas de col morada y lo deja enfriar)', '3 o 4 vasos transparentes y una hoja blanca', 'Limón, vinagre, bicarbonato, sal y agua', 'Una cuchara'],
        ['Un adulto cerca: ¡nada de probar ni oler los vasos!', 'Solo cosas de cocina. Nunca mezcles productos de limpieza (cloro, amoníaco): son peligrosos.', 'Pon los vasos sobre la hoja blanca, con buena luz.']) +
      '<p class="nota">La cámara solo mira el centro de la imagen; no guarda fotos ni las envía.</p>' +
      '<p><button id="tengo" type="button">Tengo los materiales →</button></p><p><button id="sin" class="sec" type="button">No tengo: probar en la pantalla</button></p>';
    $('tengo').onclick = function () { simulado = false; pasoHipotesis(); };
    $('sin').onclick = function () { simulado = true; pasoHipotesis(); };
  }
  // ---------- 2. hipótesis ----------
  function pasoHipotesis() {
    paso = 'hipotesis';
    app.innerHTML = cabecera('Mi hipótesis', 'Antes de mirar, dime qué crees que le pasará al jugo de col y por qué.') + '<div id="hip"></div>';
    EXP.pantallaHipotesis($('hip'), {
      cambio: ['lo que le echo al jugo de col (limón, bicarbonato…)', 'la luz de la habitación', 'el tamaño del vaso'],
      entonces: ['el jugo cambiará de color', 'el jugo se quedará del mismo color'],
      porque: ['el limón es un ácido y el jugo de col es un indicador', 'todos los líquidos son iguales para la col', 'el color solo depende de la luz']
    }, function (frase) { hipotesis = frase; pasoEnsenar(); });
  }
  // ---------- 3. enseñarle a Chispa ----------
  function pasoEnsenar() {
    paso = 'ensenar';
    if (idx >= ENSENAR.length) { idx = 0; pasoMisterio(); return; }
    var e = ENSENAR[idx];
    app.innerHTML = cabecera('Enséñame: ' + e.nombre, 'Prepara un vaso con 3 cucharadas de jugo de col y échale ' + e.receta + '. Ponlo sobre la hoja blanca delante de la cámara y toca «Mirar». Así aprendo cómo se ve «' + NOMBRES[e.clase] + '».') +
      '<div class="previa"><b>' + e.emoji + ' Vaso ' + (idx + 1) + ' de ' + ENSENAR.length + ': ' + esc(e.nombre) + '</b> (' + NOMBRES[e.clase] + ')</div>' + vistaHTML(e.virt) +
      '<p><button id="mirar" type="button">👁 Mirar</button></p><p id="visto" class="nota" aria-live="polite"></p>';
    abrirCamara(function () { /* la vista previa se pinta sola */ });
    $('mirar').onclick = function () {
      audio(); sonido('clic'); $('mirar').disabled = true;
      mirar(e.virt, function (rgb) {
        if (!rgb) { $('mirar').disabled = false; decir('No pude ver bien el color. Prueba con más luz.', 'triste'); return; }
        modelo = COLOR_ML.ensenar(modelo, e.clase, rgb);
        sonido('ok'); vibra([30, 30, 60]);
        $('visto').innerHTML = '<span class="muestra-color" style="background:' + hex(rgb) + '"></span> ¡Aprendí cómo se ve «' + NOMBRES[e.clase] + '»!';
        notas.push(e.nombre + ' → ' + NOMBRES[e.clase]);
        idx++;
        setTimeout(function () { if (paso === 'ensenar') pasoEnsenar(); }, 1400);
      });
    };
  }
  // ---------- 4. vasos misteriosos ----------
  function pasoMisterio() {
    paso = 'misterio';
    if (idx >= MISTERIOS.length) { pasoConclusion(); return; }
    var m = MISTERIOS[idx], vista = false;
    app.innerHTML = cabecera('Vaso misterioso: ' + m.nombre, 'Ahora sé reconocer tres colores. Este vaso lleva ' + m.nombre + '. Antes de mirar, ¿qué crees que es?') +
      '<div class="previa"><b>' + m.emoji + ' Vaso misterioso ' + (idx + 1) + ' de ' + MISTERIOS.length + ': ' + esc(m.nombre) + '</b></div>' +
      '<div id="adiv">' + ['acido', 'neutro', 'base'].map(function (c, i) { return '<button class="op" data-c="' + c + '"><span class="letra">' + 'ABC'.charAt(i) + '</span>Creo que es ' + NOMBRES[c] + '</button>'; }).join('') + '</div><div id="aqui"></div>';
    $('adiv').onclick = function (ev2) {
      var el = ev2.target; while (el && el !== this && !el.getAttribute('data-c')) el = el.parentNode;
      if (!el || el === this) return;
      var cree = el.getAttribute('data-c'); audio(); sonido('clic');
      $('adiv').innerHTML = '<p>Tu predicción: <b>' + NOMBRES[cree] + '</b>.</p>';
      $('aqui').innerHTML = '<p>Prepara el vaso con ' + esc(m.nombre) + ' y tres cucharadas de jugo de col, sobre la hoja blanca.</p>' + vistaHTML(m.virt) + '<p><button id="mirar2" type="button">👁 Mirar</button></p><div id="res"></div>';
      abrirCamara(function () {});
      $('mirar2').onclick = function () {
        audio(); sonido('clic'); $('mirar2').disabled = true;
        mirar(m.virt, function (rgb) {
          var cl = rgb ? COLOR_ML.clasificar(modelo, rgb) : null, txt;
          if (cree === m.verdad) aciertosPred++;
          if (!cl || !cl.seguro) { txt = 'No estoy segura: este color queda entre los que aprendí. Prueba con más luz o con más jugo de col.'; }
          else { if (cl.clase === m.verdad) aciertosChispa++; txt = 'Veo un color parecido al vaso «' + NOMBRES[cl.clase] + '» (confianza ' + Math.round(cl.confianza * 100) + ' %).' + (cl.clase === m.verdad ? '' : ' A veces me equivoco: la luz y la cantidad de jugo cambian el color.'); }
          $('res').innerHTML = '<div class="previa"><p>' + (rgb ? '<span class="muestra-color" style="background:' + hex(rgb) + '"></span> ' : '') + esc(txt) + '</p>' +
            '<p>' + (cree === m.verdad ? '✔ Acertaste: ' : '✖ Era: ') + esc(m.nombre) + ' es <b>' + NOMBRES[m.verdad] + '</b>.</p></div><p><button id="sig" type="button">' + (idx + 1 < MISTERIOS.length ? 'Siguiente vaso →' : 'Terminar →') + '</button></p>';
          sonido(cree === m.verdad ? 'ok' : 'mal');
          notas.push(m.nombre + ': yo ' + NOMBRES[cree] + ', Chispa ' + (cl && cl.seguro ? NOMBRES[cl.clase] : 'no segura') + ', era ' + NOMBRES[m.verdad]);
          $('sig').onclick = function () { idx++; pasoMisterio(); };
        });
      };
    };
  }
  // ---------- 5. conclusión ----------
  function pasoConclusion() {
    paso = 'conclusion';
    app.innerHTML = cabecera('Tu conclusión', 'Mira lo que viste. ¿Qué descubriste sobre la col morada?') +
      '<div id="conc"><button class="op" data-c="a"><span class="letra">A</span>La col se pone rosada con un ácido y azul o verde con una base</button>' +
      '<button class="op" data-c="b"><span class="letra">B</span>La col siempre se queda morada, ponga lo que ponga</button>' +
      '<button class="op" data-c="c"><span class="letra">C</span>El color de la col depende solo de la luz</button></div>';
    var TXT = { a: 'La col se pone rosada con un ácido y azul o verde con una base.', b: 'La col siempre se queda morada.', c: 'El color depende solo de la luz.' };
    $('conc').onclick = function (ev2) {
      var el = ev2.target; while (el && el !== this && !el.getAttribute('data-c')) el = el.parentNode;
      if (!el || el === this) return;
      audio(); sonido('clic');
      var eleg = el.getAttribute('data-c'), bien = eleg === 'a', jug = PERF.actual();
      var est = 1 + (pred.ok ? 1 : 0) + (aciertosPred === MISTERIOS.length ? 1 : 0);
      if (jug) PERFILES.agregarCuaderno(jug, 'col', { hipotesis: hipotesis, datos: notas.join(' · ') + (simulado ? ' (simulado)' : ''), conclusion: TXT[eleg] });
      pts = est * 100;
      resultado(buscarNivel('col'), pred, {
        estrellas: est, puntos: pts,
        motivos: ['Le enseñaste tres vasos a Chispa y comprobaste ' + MISTERIOS.length + ' vasos misteriosos' + (simulado ? ' (simulados en la pantalla)' : '') + '.',
          pred.ok ? 'Tu predicción fue correcta.' : 'Tu predicción no fue la correcta, y eso también enseña.',
          aciertosPred === MISTERIOS.length ? 'Acertaste todos los vasos misteriosos.' : 'Para la tercera estrella: acierta los dos vasos misteriosos.',
          bien ? 'Tu conclusión coincide con lo que viste.' : 'Tu conclusión no coincide con lo que viste: revisa los colores de los vasos.'],
        datos: {},
        pregunta: '¿Qué color tomó la col con el limón y cuál con el bicarbonato? ¿Qué crees que tienen en común el limón y el vinagre?',
        tabla: '<table><tr><th>Vaso</th><th>Qué pasó</th></tr>' + notas.map(function (n2) { return '<tr><td colspan="2">' + esc(n2) + '</td></tr>'; }).join('') + '</table>',
        revela: 'El jugo de col morada contiene una sustancia que cambia de color según si lo que le echas es ácido o base: rosado o rojizo con ácidos (limón, vinagre), morado con el agua y azul o verdoso con bases (bicarbonato). ' +
          'Por eso se llama indicador. Chispa no mide el pH: aprende de tus vasos y dice a cuál se parece. La cámara no guarda ni envía nada.'
      });
    };
  }

  pasoMateriales();
}

EXPERIMENTOS.push({
  id: 'col', icono: '🔎', titulo: 'Chispa detective: ¿ácido o base?', sub: 'Col morada y cámara', color: '#ec4899', sensor: 'camara', experimento: true, jugar: jugarCol,
  historia: 'La col morada es un detective: cambia de color según lo que le eches. Tú le enseñas a Chispa tres vasos y después ella te ayuda a descubrir vasos misteriosos. Con la cámara, o simulado en la pantalla.',
  pred: { q: 'Si le echas vinagre (un ácido) al jugo de col morada, se pondrá…', ops: [
    { id: 'rosa', t: 'Rosado o rojizo', ok: true }, { id: 'verde', t: 'Verde o azul' }, { id: 'igual', t: 'Del mismo morado de antes' }] }
});
