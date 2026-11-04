'use strict';
// «Mi laboratorio»: juego libre en un laboratorio dibujado como uno de verdad. Sin pedidos, sin puntos, sin tiempo y sin fallar: el niño mezcla, suelta, riega
// y mira qué pasa. Cuatro estaciones (mezclas, flota o se hunde, invernadero y caída libre) y descubrimientos que aparecen solos. Todo es virtual y seguro,
// con sustancias de cocina; cada descubrimiento dice cómo probarlo en casa con un adulto. Usa las globales de juego.js, MEZCLAS, DENSIDAD, PLANTA, FIS y DESCUBRIMIENTOS.

function jugarLibre() {
  var jug = PERF.actual();
  var ESTACIONES = ['mezclas', 'flota', 'planta', 'caida'];
  var est = 'mezclas', vistas = {}, cola = [], timers = [], burbujas = [], tarjetaAbierta = false;
  var vaso = MEZCLAS.nuevo(), dtf = 1 / 60;
  var flota = { liquidos: ['agua'], sal: 5, objetos: [], forma: 'bola', msg: '' };
  var macetas = [{ agua: true, luz: true }, { agua: true, luz: false }, { agua: false, luz: true }, { agua: false, luz: false }].map(function (c) { return { c: c, p: PLANTA.nueva() }; });
  var caida = { a: 'martillo', b: 'pluma', lugar: 'luna', vacio: false, corre: false, t: 0, ea: { y: 0, v: 0 }, eb: { y: 0, v: 0 }, ta: null, tb: null, altura: 10, hist: {} };
  sfxOn = true;

  var TITULOS = { mezclas: 'Mesa de mezclas', flota: 'Flota o se hunde', planta: 'Invernadero', caida: 'Caída libre' };
  var CORTO = { mezclas: 'Mezclas', flota: 'Flota', planta: 'Plantas', caida: 'Caída' };
  var ICONOS = { mezclas: '🧪', flota: '🥚', planta: '🌱', caida: '🪂' };

  escena('🔬 Mi laboratorio',
    '<div class="fila tabs-lab" id="tabs-lab" role="tablist" aria-label="Estaciones del laboratorio"></div>' +
    '<div id="lab-panel" class="lab-panel"></div>' +
    '<p class="fila"><button id="idea" class="sec chico" type="button">💡 Dame una idea</button> <button id="libreta" class="sec chico" type="button">🔎 Mis hallazgos</button></p>' +
    '<p id="info" role="status" aria-live="polite">Todo es virtual y seguro. Si lo pruebas en casa, hazlo con un adulto.</p>');
  function pie() { var p = $('ptsn'); if (p && p.parentNode) { p.parentNode.setAttribute('aria-label', 'Descubrimientos'); p.parentNode.innerHTML = '🔎 <b id="ptsn">' + jug.descubrimientos.length + '/' + DESCUBRIMIENTOS.CATALOGO.length + '</b>'; } }
  $('escena').className += ' es-lab';
  pie();
  function later(ms, fn) { var t = setTimeout(fn, ms); timers.push(t); return t; }

  // ---------- descubrimientos ----------
  function claves(lista) {
    lista.forEach(function (k) {
      var r = DESCUBRIMIENTOS.registrar(vistas, k, jug.descubrimientos);
      vistas = r.vistas;
      r.nuevos.forEach(function (id) { if (PERFILES.desbloquear(jug, id)) cola.push(id); });
    });
    if (cola.length) { guardar(); pie(); if (!tarjetaAbierta) mostrarNuevo(); }
  }
  function mostrarNuevo() {
    var id = cola.shift(); if (!id) { tarjetaAbierta = false; return; }
    var d = DESCUBRIMIENTOS.porId(id); tarjetaAbierta = true;
    sonido('combo'); vibra([30, 30, 60]); if (!AJ_ACT.calma) confeti(26);
    var c = document.createElement('div'); c.id = 'desc-card'; c.className = 'desc-card'; c.setAttribute('role', 'dialog'); c.setAttribute('aria-label', 'Nuevo descubrimiento');
    c.innerHTML = '<div class="desc-in"><p class="desc-nuevo">🔎 ¡Nuevo descubrimiento! ' + (jug.descubrimientos.length) + ' de ' + DESCUBRIMIENTOS.CATALOGO.length + '</p><h3>' + esc(d.titulo) + '</h3><p>' + esc(d.que) + '</p>' +
      '<details><summary>🏠 Pruébalo en casa</summary><p><b>Necesitas:</b> ' + esc(d.casa.materiales.join(', ')) + '.</p><p>🛟 ' + esc(d.casa.aviso) + '</p></details>' +
      '<p class="fila"><button id="d-nota" class="sec chico" type="button">📓 Anotar en mi cuaderno</button> <button id="d-ok" type="button">Seguir jugando</button></p></div>';
    $('escena').appendChild(c);
    $('d-nota').onclick = function () { PERFILES.agregarCuaderno(jug, 'libre', { hipotesis: '', datos: ICONOS[d.estacion] + ' ' + d.titulo, conclusion: d.que }, new Date()); guardar(); this.textContent = '✔ Anotado'; this.disabled = true; };
    $('d-ok').onclick = function () { var x = $('desc-card'); if (x && x.parentNode) x.parentNode.removeChild(x); tarjetaAbierta = false; if (cola.length) later(250, mostrarNuevo); };
    $('d-ok').focus();
  }
  $('idea').onclick = function () {
    audio(); sonido('clic');
    var s = DESCUBRIMIENTOS.sugerir(jug.descubrimientos, est);
    decir(s ? 'Una idea para pensar: ' + s.pista : '¡Has encontrado todos los descubrimientos! Eres una gran científica o un gran científico.', 'pensando');
  };
  $('libreta').onclick = function () {
    audio(); sonido('clic');
    var pr = DESCUBRIMIENTOS.progreso(jug.descubrimientos), t = ESTACIONES.map(function (k) { return ICONOS[k] + ' ' + pr.porEstacion[k].tiene + '/' + pr.porEstacion[k].total; }).join(' · ');
    decir('Llevas ' + pr.tiene + ' de ' + pr.total + ' descubrimientos. ' + t + '. ¡Sigue probando cosas!', 'alegre');
  };

  // ---------- pestañas ----------
  function pintarTabs() {
    $('tabs-lab').innerHTML = ESTACIONES.map(function (k) {
      return '<button type="button" role="tab" class="sec chico chip' + (k === est ? ' on' : '') + '" data-e="' + k + '" aria-selected="' + (k === est) + '">' + ICONOS[k] + ' ' + CORTO[k] + '</button>';
    }).join('');
    var bs = $('tabs-lab').querySelectorAll('button'), i;
    for (i = 0; i < bs.length; i++) bs[i].onclick = function () { audio(); sonido('clic'); est = this.getAttribute('data-e'); pintarTabs(); pintarPanel(); decir(saludoEstacion(), 'alegre'); };
  }
  function saludoEstacion() {
    return { mezclas: 'Toca los frascos para echar cosas al vaso. Con el jugo de col puedes ver si algo es ácido o base.', flota: 'Elige líquidos y suelta objetos. ¿Se hunde o flota? ¡Prueba cambiar la sal!', planta: 'Cuatro semillas de frijol. Cambia el agua y la luz y deja pasar los días.', caida: 'Suelta dos objetos a la vez y mira cuál llega primero. ¡Prueba en la Luna!' }[est];
  }

  // ---------- paneles de cada estación ----------
  function chipsHtml(lista, accion, activo) {
    return lista.map(function (x) { return '<button type="button" class="sec chico chip' + (activo && activo(x) ? ' on' : '') + '" data-a="' + accion + '" data-v="' + esc(x.id) + '" aria-label="' + esc(x.nombre) + '">' + x.emoji + '<span> ' + esc(x.nombre) + '</span></button>'; }).join('');
  }
  function pintarPanel() {
    var p = $('lab-panel');
    if (est === 'mezclas') {
      p.innerHTML = '<div class="chips-lab">' + chipsHtml(MEZCLAS.ORDEN.map(function (id) { return { id: id, emoji: MEZCLAS.SUSTANCIAS[id].emoji, nombre: MEZCLAS.SUSTANCIAS[id].nombre }; }), 'echar') + '</div><p class="fila"><button type="button" class="sec chico" data-a="vaciar">🧽 Vaciar el vaso</button></p>';
    } else if (est === 'flota') {
      var liq = ['aceite', 'agua', 'salada', 'miel'].map(function (id) { return { id: id, emoji: { aceite: '🫒', agua: '💧', salada: '🧂', miel: '🍯' }[id], nombre: DENSIDAD.LIQUIDOS[id].nombre }; });
      var obj = DENSIDAD.ORDEN_OBJETOS.map(function (id) { return { id: id, emoji: DENSIDAD.OBJETOS[id].emoji, nombre: DENSIDAD.OBJETOS[id].nombre }; });
      p.innerHTML = '<p class="etq">1. Líquidos en el vaso</p><div class="chips-lab">' + chipsHtml(liq, 'liq', function (x) { return flota.liquidos.indexOf(x.id) >= 0; }) + '</div>' +
        '<div class="ctl-caja ancha" id="caja-sal"' + (flota.liquidos.indexOf('salada') >= 0 ? '' : ' hidden') + '><label>Sal: <b id="sal-n">' + flota.sal + '</b> cucharaditas<input id="sal" type="range" min="0" max="15" step="1" value="' + flota.sal + '" aria-label="Cucharaditas de sal"></label></div>' +
        '<p class="etq">2. Suelta un objeto</p><div class="chips-lab">' + chipsHtml(obj, 'obj') + '</div>' +
        '<p class="fila"><button type="button" class="sec chico" data-a="forma">🟠 Plastilina: ' + flota.forma + '</button> <button type="button" class="sec chico" data-a="sacar">🧽 Sacar todo</button></p>';
      pintarBarras();
    } else if (est === 'planta') {
      p.innerHTML = '<p class="fila"><button type="button" data-a="dia1">⏩ 1 día</button> <button type="button" data-a="dia7">⏭ 7 días</button> <button type="button" class="sec chico" data-a="reiniciar">🔄 Empezar de nuevo</button></p><div class="macetas-ctl">' + macetas.map(function (m, i) {
        return '<div class="maceta-ctl"><b>Maceta ' + (i + 1) + '</b><button type="button" class="sec chico chip' + (m.c.agua ? ' on' : '') + '" data-a="agua" data-v="' + i + '" aria-pressed="' + m.c.agua + '">💧 ' + (m.c.agua ? 'con agua' : 'sin agua') + '</button>' +
          '<button type="button" class="sec chico chip' + (m.c.luz ? ' on' : '') + '" data-a="luz" data-v="' + i + '" aria-pressed="' + m.c.luz + '">☀ ' + (m.c.luz ? 'con luz' : 'a oscuras') + '</button></div>';
      }).join('') + '</div>';
    } else {
      var oc = Object.keys(FIS.OBJETOS_CAIDA).map(function (id) { return { id: id, emoji: FIS.OBJETOS_CAIDA[id].emoji, nombre: FIS.OBJETOS_CAIDA[id].nombre }; });
      var lu = Object.keys(FIS.PLANETAS).map(function (id) { return { id: id, emoji: { tierra: '🌍', luna: '🌙', marte: '🔴' }[id], nombre: FIS.PLANETAS[id].nombre }; });
      p.innerHTML = '<p class="fila"><button type="button" data-a="soltar" id="b-soltar">⬇ Soltar</button> <button type="button" class="sec chico chip' + (caida.vacio ? ' on' : '') + '" data-a="vacio" aria-pressed="' + caida.vacio + '">🫙 Sin aire</button></p>' +
        '<p class="etq">Lugar</p><div class="chips-lab">' + chipsHtml(lu, 'lugar', function (x) { return x.id === caida.lugar; }) + '</div>' +
        '<p class="etq">Izquierda</p><div class="chips-lab">' + chipsHtml(oc, 'izq', function (x) { return x.id === caida.a; }) + '</div>' +
        '<p class="etq">Derecha</p><div class="chips-lab">' + chipsHtml(oc, 'der', function (x) { return x.id === caida.b; }) + '</div>';
    }
  }
  $('lab-panel').onclick = function (e) {
    var el = e.target; while (el && el !== this && !(el.getAttribute && el.getAttribute('data-a'))) el = el.parentNode;
    if (!el || el === this) return;
    audio(); accion(el.getAttribute('data-a'), el.getAttribute('data-v'));
  };
  $('lab-panel').oninput = function (e) {
    if (e.target && e.target.id === 'sal') { flota.sal = +e.target.value; $('sal-n').textContent = flota.sal; if (flota.objetos.length) recolocar(); }
  };

  // ---------- acciones ----------
  function accion(a, v) {
    if (est === 'mezclas') {
      if (a === 'echar') {
        var r = MEZCLAS.agregar(vaso, v); vaso = r.vaso; sonido('clic'); eventosMezcla(v, r.eventos);
      } else if (a === 'vaciar') { vaso = MEZCLAS.nuevo(); burbujas = []; rodar(false); decir('Vaso limpio. ¿Qué probamos ahora?', 'alegre'); }
    } else if (est === 'flota') {
      if (a === 'liq') {
        var i = flota.liquidos.indexOf(v);
        if (i >= 0) { if (flota.liquidos.length > 1) flota.liquidos.splice(i, 1); } else flota.liquidos.push(v);
        flota.objetos = []; pintarPanel(); sonido('clic');
        if (flota.liquidos.length >= 3 && flota.liquidos.indexOf('miel') >= 0 && flota.liquidos.indexOf('aceite') >= 0 && flota.liquidos.indexOf('agua') >= 0) { claves(['f:torre']); decir('Mira cómo se ordenan: el más denso abajo y el más ligero arriba.', 'alegre'); }
      } else if (a === 'obj') soltarObjeto(v);
      else if (a === 'forma') { flota.forma = flota.forma === 'bola' ? 'barquito' : 'bola'; pintarPanel(); decir('La plastilina ahora está en forma de ' + (flota.forma === 'bola' ? 'bola' : 'barquito') + '. Suéltala y mira.', 'pensando'); }
      else if (a === 'sacar') { flota.objetos = []; decir('Vaso vacío de objetos.', 'alegre'); }
    } else if (est === 'planta') {
      var m = macetas[+v];
      if (a === 'agua') { m.c.agua = !m.c.agua; pintarPanel(); }
      else if (a === 'luz') { m.c.luz = !m.c.luz; pintarPanel(); }
      else if (a === 'dia1') pasarDias(1);
      else if (a === 'dia7') pasarDias(7);
      else if (a === 'reiniciar') { macetas.forEach(function (x) { x.p = PLANTA.nueva(); }); decir('Semillas nuevas. ¿Qué crees que pasará esta vez?', 'alegre'); }
    } else {
      if (a === 'lugar') { caida.lugar = v; caida.vacio = false; reiniciaCaida(); pintarPanel(); }
      else if (a === 'izq') { caida.a = v; reiniciaCaida(); pintarPanel(); }
      else if (a === 'der') { caida.b = v; reiniciaCaida(); pintarPanel(); }
      else if (a === 'vacio') { caida.vacio = !caida.vacio; reiniciaCaida(); pintarPanel(); }
      else if (a === 'soltar') soltarCaida();
    }
  }

  // --- mezclas ---
  function eventosMezcla(id, ev) {
    var ks = [], t = {};
    ev.forEach(function (e) { t[e.t] = e; ks.push('m:' + e.t); });
    if (t.seco) { decir('Primero echa un líquido: un polvo en un vaso vacío no se disuelve.', 'pensando'); return; }
    if (t.burbujas) { fizz(Math.min(14, 4 + t.burbujas.fuerza * 3)); decir('¡Burbujas! Se juntaron un ácido y bicarbonato.', 'alegre'); }
    else if (t.desborda) decir('¡Uy, se desbordó! El vaso solo guarda 250 ml.', 'triste');
    else if (t.capas) decir('Mira: no se mezclan y forman capas.', 'pensando');
    else if (t['color-acido'] || t['color-base']) decir(t['color-acido'] ? 'El jugo de col se pone rosado con un ácido.' : 'El jugo de col se pone azulado con una base.', 'alegre');
    else if (t.saturado) decir('Ya no cabe más: lo que sobra se queda en el fondo.', 'pensando');
    else if (t['disuelve-sal'] || t['disuelve-azucar']) decir('Se disolvió: ya no se ve, pero sigue ahí.', 'pensando');
    else decir(MEZCLAS.SUSTANCIAS[id].nombre + ' en el vaso. ¿Qué cambió?', 'pensando');
    claves(ks);
  }
  function fizz(n) {
    if (AJ_ACT.calma) n = Math.ceil(n / 3);
    var cap = LIGERO ? 14 : 30, i;
    for (i = 0; i < n && burbujas.length < cap; i++) burbujas.push({ x: 0.15 + Math.random() * 0.7, y: 0, v: 0.25 + Math.random() * 0.4, r: 2 + Math.random() * 3.5, t: 0, vida: 1 + Math.random() * 1.2 });
    rodar(true, 1.6); later(900, function () { rodar(false); });
  }

  // --- flota ---
  function capasFlota() { return DENSIDAD.torre(flota.liquidos, flota.sal); }
  function soltarObjeto(id) {
    if (flota.objetos.length >= 6) flota.objetos.shift();
    var forma = id === 'plastilina' ? flota.forma : null, pos = DENSIDAD.posicion(id, forma, capasFlota());
    flota.objetos.push({ id: id, forma: forma, pos: pos, y: 0, t: 0 });
    sonido('canica');
    var art = { corcho: 'El', lapiz: 'El', hielo: 'El', huevo: 'El' }[id] || 'La', nombre = DENSIDAD.OBJETOS[id].nombre.toLowerCase();
    var donde = flota.liquidos.length > 1 ? 'en la torre' : 'en ' + DENSIDAD.LIQUIDOS[flota.liquidos[0]].nombre.toLowerCase();
    var fra = pos.tipo === 'hunde' ? art + ' ' + nombre + ' se hunde ' + donde + '.' : (pos.tipo === 'flota' ? art + ' ' + nombre + ' flota ' + donde + '.' : art + ' ' + nombre + ' se queda flotando entre dos capas.');
    decir(fra, 'pensando');
    var ks = [], sal = flota.liquidos.length === 1 && flota.liquidos[0] === 'salada', agua = flota.liquidos.length === 1 && flota.liquidos[0] === 'agua';
    if (id === 'huevo' && agua && pos.tipo === 'hunde') ks.push('f:huevo-agua-hunde');
    if (id === 'huevo' && sal && pos.tipo === 'flota') ks.push('f:huevo-sal-flota');
    if (id === 'naranja' && agua && pos.tipo === 'flota') ks.push('f:naranja-flota');
    if (id === 'naranjaPelada' && agua && pos.tipo === 'hunde') ks.push('f:naranjaPelada-hunde');
    if (id === 'plastilina' && agua && forma === 'bola' && pos.tipo === 'hunde') ks.push('f:plastilina-bola-hunde');
    if (id === 'plastilina' && agua && forma === 'barquito' && pos.tipo === 'flota') ks.push('f:plastilina-barquito-flota');
    later(900, function () { claves(ks); });
  }
  function recolocar() { flota.objetos.forEach(function (o) { o.pos = DENSIDAD.posicion(o.id, o.forma, capasFlota()); }); }

  // --- planta ---
  function pasarDias(n) {
    var i, ks = [];
    macetas.forEach(function (m) {
      for (i = 0; i < n; i++) {
        m.p = PLANTA.paso(m.p, m.c.agua, m.c.luz);
        if (m.p.estado === 'semilla' && m.p.dia >= 3 && m.p.diasHumedos === 0 && ks.indexOf('p:seca') < 0) ks.push('p:seca');
        if (m.p.estado === 'palida' && ks.indexOf('p:palida') < 0) ks.push('p:palida');
        if (m.p.estado === 'sana' && m.p.altura > 8 && ks.indexOf('p:sana') < 0) ks.push('p:sana');
        if (m.p.estado === 'marchita' && ks.indexOf('p:marchita') < 0) ks.push('p:marchita');
      }
    });
    sonido('clic');
    decir('Pasaron ' + n + (n === 1 ? ' día. ' : ' días. ') + 'Mira cuál maceta creció más y de qué color está cada una.', 'pensando');
    claves(ks);
  }

  // --- caída ---
  function reiniciaCaida() { caida.corre = false; caida.t = 0; caida.ea = { y: 0, v: 0 }; caida.eb = { y: 0, v: 0 }; caida.ta = null; caida.tb = null; }
  function soltarCaida() {
    reiniciaCaida(); caida.corre = true; sonido('clic');
    decir('¡Se sueltan! A ' + caida.altura + ' metros de altura.', 'alegre');
  }
  function lugarCaida() { var l = FIS.PLANETAS[caida.lugar]; return { g: l.g, aire: caida.vacio ? 0 : l.aire }; }
  function finCaida() {
    var A = FIS.OBJETOS_CAIDA[caida.a], B = FIS.OBJETOS_CAIDA[caida.b], l = lugarCaida(), ks = ['c:' + caida.lugar];
    caida.hist[caida.lugar + (l.aire === 0 ? '-vacio' : '')] = true;
    var igual = Math.abs(caida.ta - caida.tb) / Math.max(caida.ta, caida.tb) < 0.01;
    if (igual && caida.a !== caida.b && (A.m / B.m > 20 || B.m / A.m > 20) && l.aire === 0) ks.push('c:vacio-igual');
    if (caida.lugar === 'tierra' && l.aire > 0 && ((caida.a === 'pluma' || caida.b === 'pluma') && !igual)) ks.push('c:pluma-aire');
    if (caida.lugar === 'tierra' && l.aire > 0 && ((caida.a === 'papel' && caida.b === 'papelBola') || (caida.a === 'papelBola' && caida.b === 'papel'))) ks.push('c:papel-forma');
    var primero = caida.ta < caida.tb ? A.nombre : B.nombre;
    decir(igual ? '¡Llegaron a la vez!' : primero + ' llegó primero. (' + caida.ta.toFixed(2).replace('.', ',') + ' s y ' + caida.tb.toFixed(2).replace('.', ',') + ' s)', igual ? 'alegre' : 'pensando');
    claves(ks); sonido('madera');
  }

  // ---------- dibujo ----------
  function fondoLab() {
    var k = Math.min(W / 390, H / 700), i, j, by = H * 0.52;
    cx.fillStyle = grad(0, by, '#dff3f4', '#bfe3e8'); cx.fillRect(0, 0, W, by);
    cx.strokeStyle = 'rgba(255,255,255,.7)'; cx.lineWidth = 1.5;
    for (i = 0; i < W; i += 30 * k) { cx.beginPath(); cx.moveTo(i, 0); cx.lineTo(i, by); cx.stroke(); }
    for (j = 0; j < by; j += 30 * k) { cx.beginPath(); cx.moveTo(0, j); cx.lineTo(W, j); cx.stroke(); }
    // ventana
    cx.fillStyle = '#8b5a2b'; rr(W * 0.05, H * 0.06, W * 0.26, H * 0.16, 6); cx.fill();
    cx.fillStyle = grad(H * 0.07, H * 0.21, '#8fd3ff', '#d9f1ff'); rr(W * 0.06, H * 0.07, W * 0.24, H * 0.14, 4); cx.fill();
    cx.fillStyle = '#8b5a2b'; cx.fillRect(W * 0.175, H * 0.07, 4, H * 0.14); cx.fillRect(W * 0.06, H * 0.14, W * 0.24, 4);
    nube(W * 0.12, H * 0.1, 0.5 * k);
    // póster de seguridad
    cx.fillStyle = '#fff'; rr(W * 0.77, H * 0.06, W * 0.19, H * 0.16, 6); cx.fill(); cx.lineWidth = 3; cx.strokeStyle = '#e8590c'; cx.stroke();
    texto('🥽', W * 0.865, H * 0.105, 22 * k, 'center'); texto('SEGURIDAD', W * 0.865, H * 0.15, 9 * k, 'center', '#1d2250'); texto('Gafas y bata', W * 0.865, H * 0.172, 9 * k, 'center', '#1d2250'); texto('¡Con un adulto!', W * 0.865, H * 0.2, 8 * k, 'center', '#e8590c');
    // estante con frascos rotulados
    cx.fillStyle = '#a06a35'; rr(W * 0.34, H * 0.175, W * 0.4, 8, 3); cx.fill();
    var fr = [['SAL', '#f1f5f9'], ['AZÚCAR', '#fff7d6'], ['COL', '#8a6cff'], ['VINAGRE', '#ffd9a8'], ['LIMÓN', '#ffe66d']];
    fr.forEach(function (f, n) {
      var x = W * 0.35 + n * W * 0.075, w = W * 0.06;
      cx.fillStyle = f[1]; rr(x, H * 0.11, w, H * 0.065, 5); cx.fill(); cx.strokeStyle = 'rgba(29,34,80,.4)'; cx.lineWidth = 1.5; cx.stroke();
      cx.fillStyle = '#fff'; cx.fillRect(x + 2, H * 0.13, w - 4, H * 0.022); texto(f[0], x + w / 2, H * 0.141, 6.5 * k, 'center', '#1d2250');
    });
    // gafas colgadas
    cx.strokeStyle = '#1d2250'; cx.lineWidth = 3; cx.beginPath(); cx.arc(W * 0.78, H * 0.265, 9 * k, 0, 7); cx.arc(W * 0.78 + 24 * k, H * 0.265, 9 * k, 0, 7); cx.stroke();
    cx.fillStyle = 'rgba(190,230,255,.6)'; cx.beginPath(); cx.arc(W * 0.78, H * 0.265, 8 * k, 0, 7); cx.arc(W * 0.78 + 24 * k, H * 0.265, 8 * k, 0, 7); cx.fill();
    // mesa
    cx.fillStyle = grad(by, by + 18, '#d7dde5', '#aab3bf'); cx.fillRect(0, by, W, 16 * k + 4);
    cx.fillStyle = '#7b5230'; cx.fillRect(0, by + 16 * k + 4, W, H - by);
    cx.fillStyle = 'rgba(0,0,0,.12)'; for (i = 0; i < W; i += 70 * k) cx.fillRect(i, by + 16 * k + 4, 2, H - by);
    // microscopio (adorno)
    var mx = W * 0.1, my = by - 2;
    cx.fillStyle = '#334155'; rr(mx - 20 * k, my - 6 * k, 40 * k, 6 * k, 3); cx.fill(); cx.fillRect(mx + 10 * k, my - 52 * k, 7 * k, 48 * k);
    cx.save(); cx.translate(mx - 2 * k, my - 38 * k); cx.rotate(-0.35); cx.fillStyle = '#475569'; rr(-5 * k, -34 * k, 10 * k, 38 * k, 3); cx.fill(); cx.restore();
    cx.fillStyle = '#64748b'; cx.fillRect(mx - 14 * k, my - 20 * k, 26 * k, 4 * k);
  }

  function vasoLab(x, base, w, alto, capas, ml, sedim) {
    var k = Math.min(W / 390, H / 700), top = base - alto, i;
    cx.save();
    cx.beginPath(); cx.moveTo(x - w / 2 - 4, top); cx.lineTo(x - w / 2, base - 8); cx.quadraticCurveTo(x - w / 2, base, x - w / 2 + 8, base); cx.lineTo(x + w / 2 - 8, base); cx.quadraticCurveTo(x + w / 2, base, x + w / 2, base - 8); cx.lineTo(x + w / 2 + 4, top);
    cx.clip();
    cx.fillStyle = 'rgba(255,255,255,.35)'; cx.fillRect(x - w / 2 - 6, top, w + 12, alto);
    var hv = alto * Math.min(1, ml / MEZCLAS.CAPACIDAD_ML), y = base;
    if (sedim > 0) { var hs = Math.min(alto * 0.2, 4 + sedim * 0.6); cx.fillStyle = '#f4efe6'; cx.fillRect(x - w / 2 - 6, base - hs, w + 12, hs); y = base - hs; }
    for (i = capas.length - 1; i >= 0; i--) {
      var c = capas[i], hh = hv * c.ml / Math.max(ml, 1);
      cx.fillStyle = 'rgb(' + Math.round(c.color[0]) + ',' + Math.round(c.color[1]) + ',' + Math.round(c.color[2]) + ')'; cx.globalAlpha = 0.93;
      cx.fillRect(x - w / 2 - 6, y - hh, w + 12, hh); cx.globalAlpha = 1; y -= hh;
      cx.fillStyle = 'rgba(255,255,255,.35)'; cx.fillRect(x - w / 2 - 6, y, w + 12, 3);
    }
    cx.restore();
    cx.lineWidth = 3.5; cx.strokeStyle = 'rgba(29,34,80,.75)'; cx.beginPath(); cx.moveTo(x - w / 2 - 4, top); cx.lineTo(x - w / 2, base - 8); cx.quadraticCurveTo(x - w / 2, base, x - w / 2 + 8, base); cx.lineTo(x + w / 2 - 8, base); cx.quadraticCurveTo(x + w / 2, base, x + w / 2, base - 8); cx.lineTo(x + w / 2 + 4, top); cx.stroke();
    cx.fillStyle = 'rgba(255,255,255,.55)'; cx.fillRect(x - w / 2 + 6, top + 8, 5, alto * 0.6);
    return { top: top, hv: hv };
  }
  function graduaciones(x, base, w, alto, maxMl, paso) {
    var k = Math.min(W / 390, H / 700), m;
    cx.strokeStyle = 'rgba(29,34,80,.7)'; cx.lineWidth = 2;
    for (m = paso; m <= maxMl; m += paso) {
      var y = base - alto * m / maxMl, largo = m % (paso * 2) === 0 ? 14 * k : 8 * k;
      cx.beginPath(); cx.moveTo(x + w / 2 - largo, y); cx.lineTo(x + w / 2, y); cx.stroke();
      if (m % (paso * 2) === 0) texto(m + '', x + w / 2 + 6 * k, y + 1, 9 * k, 'left', '#1d2250');
    }
  }
  function dibujaMezclas(dt) {
    var k = Math.min(W / 390, H / 700), by = H * 0.52, w = W * 0.34, alto = H * 0.25, x = W * 0.5, s = MEZCLAS.estado(vaso);
    sombra(x, by + 3, w * 0.55, 6, 0.25);
    var g = vasoLab(x, by, w, alto, s.capas, s.ml, s.sedimento);
    graduaciones(x, by, w, alto, MEZCLAS.CAPACIDAD_ML, 50);
    // etiqueta
    var etq = s.ph !== null ? 'pH ≈ ' + String(s.ph).replace('.', ',') + ' · ' + s.clase : (s.ml > 0 ? 'Con jugo de col se ve si es ácido o base' : 'Vaso vacío');
    cx.font = '700 ' + 13 * k + 'px sans-serif'; var tw = cx.measureText(etq).width + 44 * k;
    cx.fillStyle = 'rgba(255,255,255,.94)'; rr(x - tw / 2, by - alto - 34 * k, tw, 24 * k, 12 * k); cx.fill(); cx.strokeStyle = '#1d2250'; cx.lineWidth = 2; cx.stroke();
    texto(etq, x, by - alto - 22 * k, 13 * k, 'center', '#1d2250');
    texto(s.ml + ' ml', x, by + 18 * k, 12 * k, 'center', '#fff');
    // burbujas
    var i, b;
    for (i = burbujas.length - 1; i >= 0; i--) {
      b = burbujas[i]; b.t += dt; b.y += b.v * dt * alto * 0.9;
      if (b.t > b.vida || b.y > g.hv) { burbujas.splice(i, 1); continue; }
      cx.fillStyle = 'rgba(255,255,255,.75)'; cx.strokeStyle = 'rgba(255,255,255,.95)'; cx.lineWidth = 1.5; cx.beginPath(); cx.arc(x - w / 2 + b.x * w, by - 8 - b.y, b.r * k, 0, 7); cx.fill(); cx.stroke();
    }
  }

  function dibujaFlota(dt) {
    var k = Math.min(W / 390, H / 700), by = H * 0.52, w = W * 0.3, alto = H * 0.27, x = W * 0.5, capas = capasFlota(), i;
    sombra(x, by + 3, w * 0.55, 6, 0.25);
    var n = capas.length, hCapa = alto * 0.88 / n, y = by - 4;
    cx.save();
    cx.beginPath(); cx.moveTo(x - w / 2 - 4, by - alto); cx.lineTo(x - w / 2, by - 8); cx.quadraticCurveTo(x - w / 2, by, x - w / 2 + 8, by); cx.lineTo(x + w / 2 - 8, by); cx.quadraticCurveTo(x + w / 2, by, x + w / 2, by - 8); cx.lineTo(x + w / 2 + 4, by - alto); cx.clip();
    cx.fillStyle = 'rgba(255,255,255,.35)'; cx.fillRect(x - w / 2 - 6, by - alto, w + 12, alto);
    for (i = 0; i < n; i++) { // de abajo arriba
      var c = capas[i]; cx.fillStyle = 'rgb(' + c.color[0] + ',' + c.color[1] + ',' + c.color[2] + ')'; cx.globalAlpha = 0.85; cx.fillRect(x - w / 2 - 6, y - hCapa, w + 12, hCapa); cx.globalAlpha = 1; y -= hCapa;
      cx.fillStyle = 'rgba(255,255,255,.4)'; cx.fillRect(x - w / 2 - 6, y, w + 12, 3);
    }
    var yTop = y;
    // objetos
    flota.objetos.forEach(function (o, idx) {
      o.t = Math.min(1, o.t + dt * 1.2);
      var meta;
      if (o.pos.tipo === 'hunde') meta = by - 14 * k; else meta = (by - 4) - hCapa * (o.pos.indice + 1) + 8 * k;
      var oy = lerp(yTop - alto * 0.5, meta, o.t * o.t * (3 - 2 * o.t)), ox = x + ((idx % 3) - 1) * w * 0.28;
      if (o.t >= 1 && o.pos.tipo !== 'hunde') oy += Math.sin(tt * 2 + idx) * 2 * k;
      texto(DENSIDAD.OBJETOS[o.id].emoji, ox, oy, 24 * k, 'center');
    });
    cx.restore();
    cx.lineWidth = 3.5; cx.strokeStyle = 'rgba(29,34,80,.75)'; cx.beginPath(); cx.moveTo(x - w / 2 - 4, by - alto); cx.lineTo(x - w / 2, by - 8); cx.quadraticCurveTo(x - w / 2, by, x - w / 2 + 8, by); cx.lineTo(x + w / 2 - 8, by); cx.quadraticCurveTo(x + w / 2, by, x + w / 2, by - 8); cx.lineTo(x + w / 2 + 4, by - alto); cx.stroke();
    // etiquetas de las capas
    y = by - 4;
    for (i = 0; i < n; i++) { texto(capas[i].nombre + ' (' + String(capas[i].dens).replace('.', ',') + ')', x + w / 2 + 10 * k, y - hCapa / 2, 10 * k, 'left', '#1d2250'); y -= hCapa; }
    flota.objetos.forEach(function (o, idx) {
      var etiq = { hunde: 'se hunde', flota: 'flota', entre: 'queda entre capas' }[o.pos.tipo];
      texto(DENSIDAD.OBJETOS[o.id].emoji + ' ' + etiq + (o.forma ? ' (' + o.forma + ')' : ''), 8 * k, by - alto + 10 * k + idx * 17 * k, 9.5 * k, 'left', '#1d2250');
    });
  }
  function lerp(a, b, t) { return a + (b - a) * t; }

  function dibujaPlanta() {
    var k = Math.min(W / 390, H / 700), by = H * 0.52, i, ancho = W / 4, maxH = H * 0.15;
    macetas.forEach(function (m, idx) {
      var x = ancho * (idx + 0.5), p = m.p, col = ['#2fd18b', '#c9d96b', '#8a6c3f', '#9aa0a6'];
      // maceta
      cx.fillStyle = '#c1633a'; cx.beginPath(); cx.moveTo(x - 24 * k, by - 28 * k); cx.lineTo(x + 24 * k, by - 28 * k); cx.lineTo(x + 18 * k, by); cx.lineTo(x - 18 * k, by); cx.closePath(); cx.fill();
      cx.fillStyle = '#7a3f22'; cx.fillRect(x - 24 * k, by - 32 * k, 48 * k, 8 * k);
      cx.fillStyle = '#4a3320'; cx.fillRect(x - 21 * k, by - 28 * k, 42 * k, 6 * k);
      // planta
      var alto = Math.min(maxH, (p.altura / PLANTA.ALTURA_MAX) * maxH * 1.15 + (p.estado === 'semilla' ? 0 : 3));
      var verde = p.estado === 'sana' || p.estado === 'germino' ? '#2fa84f' : (p.estado === 'palida' ? '#e8e9a0' : '#8a7a4a');
      if (p.estado === 'semilla') { cx.fillStyle = '#7a4b22'; cx.beginPath(); cx.ellipse(x, by - 27 * k, 5 * k, 3 * k, 0, 0, 7); cx.fill(); }
      else {
        var tallo = by - 30 * k, cima = tallo - alto, curva = p.estado === 'marchita' ? 14 * k : 0;
        cx.strokeStyle = verde; cx.lineWidth = p.estado === 'palida' ? 3 * k : 5 * k; cx.lineCap = 'round'; cx.beginPath(); cx.moveTo(x, tallo); cx.quadraticCurveTo(x + curva * 0.2, (tallo + cima) / 2, x + curva, cima + (p.estado === 'marchita' ? alto * 0.35 : 0)); cx.stroke();
        var hojas = Math.min(4, 1 + Math.floor(p.altura / 4));
        for (i = 0; i < hojas && p.estado !== 'palida'; i++) {
          var hy = tallo - alto * (0.3 + i * 0.22), dir = i % 2 ? 1 : -1;
          cx.fillStyle = p.estado === 'marchita' ? '#9c8b55' : '#34c25f'; cx.beginPath(); cx.ellipse(x + dir * 12 * k, hy + (p.estado === 'marchita' ? 8 * k : 0), 11 * k, 5 * k, dir * (p.estado === 'marchita' ? 0.9 : -0.5), 0, 7); cx.fill();
        }
        if (p.estado === 'palida') { cx.fillStyle = '#f2f0b8'; cx.beginPath(); cx.ellipse(x + 3 * k, cima, 5 * k, 7 * k, 0.2, 0, 7); cx.fill(); }
      }
      // letrero
      cx.fillStyle = 'rgba(255,255,255,.94)'; rr(x - 36 * k, by + 24 * k, 72 * k, 36 * k, 8 * k); cx.fill();
      texto((m.c.agua ? '💧' : '✖💧') + ' ' + (m.c.luz ? '☀' : '☾'), x, by + 36 * k, 12 * k, 'center', '#1d2250'); texto(p.altura > 0 ? String(Math.round(p.altura * 10) / 10).replace('.', ',') + ' cm' : 'semilla', x, by + 52 * k, 11 * k, 'center', '#1d2250');
    });
    // gráfica de alturas
    var gx = W * 0.07, gy = H * 0.2, gw = W * 0.86, gh = H * 0.13, dias = macetas[0].p.dia;
    cx.fillStyle = 'rgba(255,255,255,.9)'; rr(gx, gy, gw, gh, 8); cx.fill();
    cx.strokeStyle = '#1d2250'; cx.lineWidth = 1.5; cx.beginPath(); cx.moveTo(gx + 30 * k, gy + 8); cx.lineTo(gx + 30 * k, gy + gh - 18 * k); cx.lineTo(gx + gw - 8, gy + gh - 18 * k); cx.stroke();
    texto('cm', gx + 4, gy + 14 * k, 10 * k, 'left', '#1d2250'); texto('días: ' + dias, gx + gw - 8, gy + gh - 6 * k, 10.5 * k, 'right', '#1d2250');
    var maxX = Math.max(10, dias), maxY = 25;
    macetas.forEach(function (m, idx) {
      cx.strokeStyle = ['#2fa84f', '#c2b800', '#8a6c3f', '#6b7280'][idx]; cx.lineWidth = 2.5; cx.beginPath();
      m.p.historial.forEach(function (h, d) { var X = gx + 30 * k + (gw - 40 * k) * d / maxX, Y = gy + gh - 18 * k - (gh - 28 * k) * Math.min(h, maxY) / maxY; if (d === 0) cx.moveTo(X, Y); else cx.lineTo(X, Y); }); cx.stroke();
      texto('' + (idx + 1), gx + 30 * k + (gw - 40 * k) * dias / maxX + 6 * k, gy + gh - 18 * k - (gh - 28 * k) * Math.min(m.p.altura, maxY) / maxY, 10 * k, 'left', ['#2fa84f', '#a09600', '#8a6c3f', '#6b7280'][idx]);
    });
  }

  function dibujaCaida(dt) {
    var k = Math.min(W / 390, H / 700), by = H * 0.52, top = H * 0.2, alto = by - top - 10, x0 = W * 0.32, x1 = W * 0.76, l = lugarCaida(), A = FIS.OBJETOS_CAIDA[caida.a], B = FIS.OBJETOS_CAIDA[caida.b];
    // ventana-cámara con el fondo del lugar
    var fondoC = { tierra: ['#8fd3ff', '#d9f1ff'], luna: ['#0b0f2a', '#2b2f55'], marte: ['#a8533a', '#e0a47a'] }[caida.lugar];
    cx.fillStyle = grad(top, by, fondoC[0], fondoC[1]); rr(W * 0.07, top - 6, W * 0.86, alto + 10, 10); cx.fill(); cx.lineWidth = 4; cx.strokeStyle = '#475569'; cx.stroke();
    cx.fillStyle = caida.lugar === 'tierra' ? '#5fb36b' : (caida.lugar === 'luna' ? '#9ca3af' : '#8f4a30'); cx.fillRect(W * 0.07 + 2, by - 22 * k, W * 0.86 - 4, 22 * k);
    if (caida.lugar === 'luna') { cx.fillStyle = 'rgba(255,255,255,.7)'; for (var s = 0; s < 14; s++) cx.fillRect(W * 0.1 + (s * 53) % (W * 0.8), top + (s * 37) % (alto * 0.6), 2, 2); }
    if (l.aire === 0 && caida.lugar !== 'luna') texto('🫙 sin aire', W / 2, top + 10 * k, 12 * k, 'center', '#1d2250');
    texto(FIS.PLANETAS[caida.lugar].nombre + ' · g = ' + String(FIS.PLANETAS[caida.lugar].g).replace('.', ',') + ' m/s²' + (l.aire === 0 ? ' · sin aire' : l.aire < 0.1 ? ' · muy poco aire' : ' · con aire'), W / 2, top + 24 * k, 11 * k, 'center', caida.lugar === 'luna' ? '#fff' : '#1d2250');
    // regla de metros
    cx.strokeStyle = 'rgba(255,255,255,.8)'; cx.lineWidth = 2; var m;
    for (m = 0; m <= caida.altura; m += 2) { var yy = top + 30 * k + (alto - 56 * k) * m / caida.altura; cx.beginPath(); cx.moveTo(W * 0.1, yy); cx.lineTo(W * 0.1 + 10 * k, yy); cx.stroke(); texto(m + ' m', W * 0.1 + 14 * k, yy, 9 * k, 'left', caida.lugar === 'luna' ? '#fff' : '#1d2250'); }
    // simulación
    if (caida.corre) {
      caida.t += dt; var sub = Math.ceil(dt / 0.004), d2 = dt / sub, j;
      for (j = 0; j < sub; j++) {
        if (caida.ta === null) { caida.ea = FIS.pasoCaida(caida.ea, A, l.g, l.aire, d2); if (caida.ea.y >= caida.altura) caida.ta = caida.t - dt + (j + 1) * d2; }
        if (caida.tb === null) { caida.eb = FIS.pasoCaida(caida.eb, B, l.g, l.aire, d2); if (caida.eb.y >= caida.altura) caida.tb = caida.t - dt + (j + 1) * d2; }
      }
      if (caida.ta !== null && caida.tb !== null) { caida.corre = false; later(100, finCaida); }
    }
    var ya = Math.min(caida.altura, caida.ea.y), yb = Math.min(caida.altura, caida.eb.y);
    function posY(d) { return top + 30 * k + (alto - 56 * k) * d / caida.altura; }
    texto(A.emoji, x0, posY(ya), 30 * k, 'center'); texto(B.emoji, x1, posY(yb), 30 * k, 'center');
    texto(A.nombre, x0, by - 30 * k, 10.5 * k, 'center', caida.lugar === 'luna' ? '#fff' : '#1d2250'); texto(B.nombre, x1, by - 30 * k, 10.5 * k, 'center', caida.lugar === 'luna' ? '#fff' : '#1d2250');
    var cronoTxt = (caida.ta !== null ? caida.ta : Math.min(caida.t, 99)).toFixed(2).replace('.', ',') + ' s', cronoTxt2 = (caida.tb !== null ? caida.tb : Math.min(caida.t, 99)).toFixed(2).replace('.', ',') + ' s';
    texto(cronoTxt, x0, by + 18 * k, 14 * k, 'center', '#fff'); texto(cronoTxt2, x1, by + 18 * k, 14 * k, 'center', '#fff');
  }

  pintarTabs(); pintarPanel();
  decir('¡Bienvenido a tu laboratorio! Aquí no hay pedidos ni tiempo: ' + saludoEstacion().charAt(0).toLowerCase() + saludoEstacion().slice(1), 'alegre');

  arrancar({
    limpiar: function () { timers.forEach(clearTimeout); rodar(false); },
    actualizar: function (dt) { dtf = dt; },
    dibujar: function () {
      var dt = dtf; fondo(fondoLab);
      if (est === 'mezclas') dibujaMezclas(dt); else if (est === 'flota') dibujaFlota(dt); else if (est === 'planta') dibujaPlanta(); else dibujaCaida(dt);
    }
  });
}
