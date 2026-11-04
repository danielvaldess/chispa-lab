'use strict';
// Finales de la estación: encenderla (1 estrella en cada juego), a toda potencia (2) y de las estrellas (3),
// y el diploma. Las recompensas por estrellas son cosméticas: nada necesario para jugar queda bloqueado.
// Usa las globales de juego.js (app, $, esc, chispa, NIVELES, menu, confeti, sonido, pip, AJ_ACT...).

var FINALES = (function () {
  var TITULOS = { 1: '¡La estación está encendida!', 2: '¡A toda potencia!', 3: '¡La estación de las estrellas!' };
  var temporizadores = [];

  function nombre() { var j = PERF.actual(); return j ? j.nombre : ''; }
  function limpiar() { temporizadores.forEach(clearTimeout); temporizadores = []; }
  function luego(ms, fn) { temporizadores.push(setTimeout(fn, ms)); }

  function texto(tier, n) {
    if (tier >= 3) return '¡Increíble, ' + n + '! Tres estrellas en todas las salas: ya eres parte del equipo científico de la estación. ¡Hasta yo me puse mi bata!';
    if (tier === 2) return '¡A toda potencia, ' + n + '! Con dos estrellas o más en cada sala, la estación brilla como nunca. Mira todo lo que descubriste.';
    return '¡Lo lograste, ' + n + '! Las seis salas de la estación están encendidas. Cada una se encendió porque entendiste una idea de verdad.';
  }

  /** Muestra el final de ese nivel (1 a 3) y lo marca como visto. */
  function mostrar(tier) {
    limpiar();
    detener();
    var pr = PERF.progreso();
    pr.finalVisto = Math.max(pr.finalVisto || 0, tier);
    PERF.guardar();
    PERF.aplicar(); // si es el tercero, Chispa se pone la bata y la estación se vuelve dorada
    var n = nombre();
    var salas = NIVELES.map(function (nv, i) {
      return '<div class="sala" style="--d:' + (0.4 + i * 0.5) + 's;--c:' + nv.color + '"><span class="ico" aria-hidden="true">' + nv.icono + '</span><small>' + esc(nv.titulo) + '</small></div>';
    }).join('');
    var ideas = NIVELES.map(function (nv) {
      return '<li><b>' + nv.icono + ' ' + esc(nv.titulo) + '</b><br><small>' + esc((PANEL.ideas && PANEL.ideas[nv.id]) || '') + '</small></li>';
    }).join('');
    var fuegos = '';
    if (tier >= 2) for (var i = 0; i < 7; i++) fuegos += '<i style="left:' + (8 + (i * 13) % 84) + '%;top:' + (6 + (i * 19) % 40) + '%;--d:' + (i * 0.35) + 's"></i>';
    app.innerHTML = '<div class="final tier-' + tier + '"><div class="fuegos" aria-hidden="true">' + fuegos + '</div>' +
      '<h2>' + TITULOS[tier] + '</h2>' +
      '<div class="estacion" role="img" aria-label="Las seis salas de la estación, todas encendidas">' + salas + '</div>' +
      chispa(texto(tier, n)) +
      '<h3>Lo que descubriste</h3><ul class="ideas-final">' + ideas + '</ul>' +
      (tier >= 2 ? '<p class="accion"><button id="ver-diploma" type="button">🎓 Mi diploma</button></p>' : '') +
      '<p class="accion"><button id="seguir" class="sec" type="button">Seguir explorando</button></p></div>';
    var cc = document.querySelector('.chispa'); if (cc) cc.className = 'chispa habla';
    // las salas se encienden una a una, cada una con su nota
    NIVELES.forEach(function (nv, k) { luego(400 + k * 500, function () { if ($('seguir')) pip(440 * Math.pow(1.122, k * 2), 0.18, 'triangle', 0.16, 0); }); });
    luego(400 + NIVELES.length * 500, function () { if ($('seguir')) sonido('fin'); });
    luego(400 + NIVELES.length * 500, function () { confeti(tier >= 2 ? 140 : 90); });
    if (tier >= 2) { luego(2500 + NIVELES.length * 500, function () { confeti(80); }); luego(4200 + NIVELES.length * 500, function () { confeti(80); }); }
    vibra([40, 40, 40, 40, 120]);
    $('seguir').onclick = function () { limpiar(); location.hash = '#/'; ruta(); };
    if ($('ver-diploma')) $('ver-diploma').onclick = function () { diploma(tier); };
  }

  // ---------- diploma ----------
  function dibujarDiploma(cv, tier) {
    var c = cv.getContext('2d'), W = cv.width, H = cv.height, n = nombre() || 'Científica o científico';
    var g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#fffaf0'); g.addColorStop(1, '#ffeec2');
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    c.strokeStyle = tier >= 3 ? '#d9a400' : '#3b82f6'; c.lineWidth = 14; c.strokeRect(18, 18, W - 36, H - 36);
    c.strokeStyle = '#1d2250'; c.lineWidth = 3; c.strokeRect(36, 36, W - 72, H - 72);
    c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#1d2250';
    c.font = '800 34px system-ui, sans-serif'; c.fillText('DIPLOMA DE LA ESTACIÓN CIENTÍFICA', W / 2, 92);
    c.font = '600 22px system-ui, sans-serif'; c.fillText('Chispa Lab reconoce a', W / 2, 150);
    var tam = 62; c.font = '900 ' + tam + 'px system-ui, sans-serif';
    while (c.measureText(n).width > W - 140 && tam > 24) { tam -= 4; c.font = '900 ' + tam + 'px system-ui, sans-serif'; }
    c.fillStyle = '#e8590c'; c.fillText(n, W / 2, 222);
    c.fillStyle = '#1d2250'; c.font = '600 22px system-ui, sans-serif';
    c.fillText('por encender las seis salas de la estación', W / 2, 288);
    c.fillText(tier >= 3 ? 'con tres estrellas en cada una' : 'con dos estrellas o más en cada una', W / 2, 322);
    c.fillText('y descubrir cómo funciona el mundo', W / 2, 354);
    c.font = '56px serif';
    NIVELES.forEach(function (nv, i) { c.fillText(nv.icono, W / 2 + (i - (NIVELES.length - 1) / 2) * 92, 420); });
    c.font = '600 20px system-ui, sans-serif'; c.fillStyle = '#4a4f86';
    c.fillText(new Date().toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' }), W / 2, 478);
    if (tier >= 3) { c.font = '44px serif'; c.fillText('🌟', 96, 96); c.fillText('🌟', W - 96, 96); }
  }

  function guardarImagen(cv) {
    cv.toBlob(function (b) {
      var nota = $('nota-guardar');
      if (!b) { if (nota) nota.textContent = 'No pude crear la imagen. Haz una captura de pantalla del diploma.'; return; }
      var archivo = null;
      try { archivo = new File([b], 'diploma-chispa-lab.png', { type: 'image/png' }); } catch (e) {}
      if (archivo && navigator.canShare && navigator.canShare({ files: [archivo] })) {
        navigator.share({ files: [archivo], title: 'Diploma de Chispa Lab' }).catch(function () {});
        return;
      }
      try {
        var url = URL.createObjectURL(b), a = document.createElement('a');
        a.href = url; a.download = 'diploma-chispa-lab.png'; document.body.appendChild(a); a.click();
        setTimeout(function () { URL.revokeObjectURL(url); if (a.parentNode) a.parentNode.removeChild(a); }, 1500);
        if (nota) nota.textContent = 'Si no se guardó, haz una captura de pantalla del diploma.';
      } catch (e) { if (nota) nota.textContent = 'Haz una captura de pantalla del diploma para guardarlo.'; }
    }, 'image/png');
  }

  function diploma(tier) {
    limpiar();
    app.innerHTML = '<h2>🎓 Mi diploma</h2><canvas id="dip" class="diploma" width="800" height="560" role="img" aria-label="Diploma de la estación científica de ' + esc(nombre()) + '"></canvas>' +
      '<p class="accion"><button id="guardar" type="button">Guardar imagen</button></p><p id="nota-guardar" class="nota">También puedes hacer una captura de pantalla.</p>' +
      '<p class="accion"><button id="volver-final" class="sec" type="button">← Volver</button></p>';
    dibujarDiploma($('dip'), tier);
    $('guardar').onclick = function () { guardarImagen($('dip')); };
    $('volver-final').onclick = function () { mostrar(tier); };
  }

  return { mostrar: mostrar, diploma: diploma, titulo: function (t) { return TITULOS[t]; }, limpiar: limpiar };
})();
