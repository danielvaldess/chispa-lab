'use strict';
// Piezas de pantalla comunes a los experimentos con materiales (hipótesis con casillas, tarjeta de seguridad y cuaderno).
// Usa las globales de juego.js (app, $, esc, chispa, METODO...). Nada se envía: el cuaderno vive en el teléfono.

var EXP = (function () {
  /** Tarjeta de seguridad y materiales que se muestra antes de cada experimento real. */
  function tarjetaSeguridad(materiales, normas) {
    return '<div class="previa"><b>🧰 Necesitas</b><ul>' + materiales.map(function (m) { return '<li>' + esc(m) + '</li>'; }).join('') + '</ul>' +
      '<b>🛟 Seguridad</b><ul>' + normas.map(function (m) { return '<li>' + esc(m) + '</li>'; }).join('') + '</ul></div>';
  }

  /**
   * Pantalla «Mi hipótesis»: tres casillas («Si cambio ___, entonces ___ porque ___»).
   * def: { cambio: [..], entonces: [..], porque: [..] } con las opciones de cada casilla. alListo(frase, sel).
   */
  function pantallaHipotesis(contenedor, def, alListo) {
    function sel(id, etiqueta, ops) {
      return '<label class="hip-fila"><span>' + etiqueta + '</span><select id="' + id + '"><option value="">Elige…</option>' +
        ops.map(function (o, i) { return '<option value="' + i + '">' + esc(o) + '</option>'; }).join('') + '</select></label>';
    }
    contenedor.innerHTML = '<div class="hipotesis"><h3>Mi hipótesis</h3><p>Una hipótesis es lo que crees que va a pasar, y por qué. Complétala:</p>' +
      sel('hip-c', 'Si cambio…', def.cambio) + sel('hip-e', 'entonces…', def.entonces) + sel('hip-p', 'porque…', def.porque) +
      '<p id="hip-frase" class="nota" aria-live="polite">Elige las tres casillas.</p><p><button id="hip-ok" type="button" disabled>Probar mi hipótesis →</button></p></div>';
    function actual() {
      var c = $('hip-c').value, e = $('hip-e').value, p = $('hip-p').value;
      return { cambio: c === '' ? '' : def.cambio[+c], entonces: e === '' ? '' : def.entonces[+e], porque: p === '' ? '' : def.porque[+p], iC: c, iE: e, iP: p };
    }
    function refrescar() {
      var s = actual(), f = METODO.hipotesis(s);
      $('hip-frase').textContent = f || 'Elige las tres casillas.';
      $('hip-ok').disabled = !f;
    }
    ['hip-c', 'hip-e', 'hip-p'].forEach(function (id) { $(id).onchange = refrescar; });
    $('hip-ok').onclick = function () { var s = actual(); alListo(METODO.hipotesis(s), s); };
  }

  /** Cuaderno de laboratorio del jugador (últimas 20 entradas), con un botón para copiar cada una. */
  function pantallaCuaderno(jugador, titulos) {
    var l = (jugador && jugador.cuaderno || []).slice().reverse();
    app.innerHTML = '<a class="volver" href="#/">← Menú</a><h2>📓 Mi cuaderno de laboratorio</h2>' +
      chispa(l.length ? 'Aquí guardo lo que descubriste, ' + jugador.nombre + '. Se queda en este teléfono.' : 'Todavía no hay nada. Cuando termines un experimento con materiales, tu hipótesis, tus datos y tu conclusión se guardan aquí.') +
      l.map(function (e, i) {
        return '<div class="previa"><b>' + esc(titulos[e.n] || e.n) + (e.f ? ' · ' + esc(e.f) : '') + '</b>' +
          (e.h ? '<p><b>Hipótesis:</b> ' + esc(e.h) + '</p>' : '') + (e.d ? '<p><b>Datos:</b> ' + esc(e.d) + '</p>' : '') + (e.c ? '<p><b>Conclusión:</b> ' + esc(e.c) + '</p>' : '') +
          '<p><button class="sec chico" data-copiar="' + i + '" type="button">📋 Copiar</button></p></div>';
      }).join('');
    var bs = app.querySelectorAll('[data-copiar]'), k;
    for (k = 0; k < bs.length; k++) bs[k].onclick = function () {
      var e = l[+this.getAttribute('data-copiar')], t = METODO.textoEntrada(e, titulos[e.n]), b = this;
      try { navigator.clipboard.writeText(t).then(function () { b.textContent = '✔ Copiado'; }, function () { b.textContent = 'No se pudo copiar'; }); } catch (x) { b.textContent = 'No se pudo copiar'; }
    };
  }

  return { tarjetaSeguridad: tarjetaSeguridad, pantallaHipotesis: pantallaHipotesis, pantallaCuaderno: pantallaCuaderno };
})();
