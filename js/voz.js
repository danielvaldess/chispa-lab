// Voz de Chispa: elige, entre las voces en español del teléfono, una voz femenina, cálida y clara, que funcione sin internet, y la habla
// con un tono apenas más alto que el normal (no chillón) y un ritmo tranquilo. Nada se envía: usa la síntesis de voz del propio teléfono.
// La elección es por puntos, para poder probarla en Node con listas de voces inventadas. El jugador puede cambiar de voz (se recuerda en este teléfono).
(function (root) {
  'use strict';

  var CLAVE = 'chispalab.voz.v1';
  var TONO = 1.1, RITMO = 0.93; // tono ligeramente más alto que el normal (1,0); más de 1,3 ya suena chillón
  var MUJER = /sabina|paulina|helena|laura|monica|mónica|elvira|dalia|camila|lucia|lucía|paloma|marisol|esperanza|valentina|catalina|isabela|salome|salomé|female|mujer|femenin/i;
  var HOMBRE = /jorge|diego|pablo|raul|raúl|juan|carlos|enrique|miguel|alvaro|álvaro|andres|andrés|tomas|tomás|jaime|\bmale\b|masculin|hombre/i;
  var LATINA = /^es[-_](mx|us|419|pa|co|ar|cl|pe|ve|ec|gt|cu|do|hn|ni|pr|py|sv|uy|bo|cr)/i;
  var CALIDAD = /google|natural|neural|premium|enhanced|mejorad/i;

  /** Puntos de una voz: más es mejor. -Infinity si no habla español. */
  function puntos(v) {
    var lang = String(v && v.lang || ''), nombre = String(v && v.name || '');
    if (!/^es([-_]|$)/i.test(lang)) return -Infinity;
    var p = 0;
    if (v.localService !== false) p += 40;        // funciona sin internet
    if (LATINA.test(lang)) p += 25;                // acento latinoamericano
    if (MUJER.test(nombre)) p += 30;
    if (HOMBRE.test(nombre) && !MUJER.test(nombre)) p -= 60;
    if (CALIDAD.test(nombre)) p += 10;
    return p;
  }

  /** Voces en español ordenadas de mejor a peor (la lista original no se modifica). */
  function ordenadas(voces) {
    return (voces || []).filter(function (v) { return puntos(v) > -Infinity; }).sort(function (a, b) { return puntos(b) - puntos(a); });
  }

  /** La voz a usar: la que el jugador eligió si sigue existiendo; si no, la mejor. null si no hay voces en español. */
  function elegir(voces, preferida) {
    var l = ordenadas(voces), i;
    if (preferida) for (i = 0; i < l.length; i++) if (l[i].name === preferida) return l[i];
    return l[0] || null;
  }

  /** La siguiente voz de la lista ordenada (para el botón «otra voz»). */
  function siguiente(voces, actual) {
    var l = ordenadas(voces), i;
    if (!l.length) return null;
    for (i = 0; i < l.length; i++) if (l[i].name === actual) return l[(i + 1) % l.length];
    return l[0];
  }

  // ---------- navegador ----------
  function guardada() { try { return localStorage.getItem(CLAVE) || ''; } catch (e) { return ''; } }
  function guardar(nombre) { try { localStorage.setItem(CLAVE, nombre || ''); } catch (e) {} }
  function voces() { try { return window.speechSynthesis ? window.speechSynthesis.getVoices() : []; } catch (e) { return []; } }

  /** Habla un texto con la voz de Chispa. Devuelve el nombre de la voz usada ('' si usó la predeterminada). */
  function hablar(texto) {
    try {
      if (!window.speechSynthesis || !texto) return '';
      window.speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(String(texto)), v = elegir(voces(), guardada());
      u.lang = v ? v.lang : 'es-419'; u.rate = RITMO; u.pitch = TONO;
      if (v) u.voice = v;
      window.speechSynthesis.speak(u);
      return v ? v.name : '';
    } catch (e) { return ''; }
  }

  /** Cambia a la siguiente voz en español y la deja recordada. Devuelve su nombre o '' si no hay otra. */
  function cambiar() {
    var v = siguiente(voces(), (elegir(voces(), guardada()) || {}).name);
    if (!v) return '';
    guardar(v.name);
    return v.name;
  }

  // algunas voces tardan en cargarse: se piden una vez al abrir la app
  try { if (window.speechSynthesis) { window.speechSynthesis.getVoices(); window.speechSynthesis.onvoiceschanged = function () { window.speechSynthesis.getVoices(); }; } } catch (e) {}

  var VOZ = { TONO: TONO, RITMO: RITMO, puntos: puntos, ordenadas: ordenadas, elegir: elegir, siguiente: siguiente, hablar: hablar, cambiar: cambiar };
  if (typeof module !== 'undefined' && module.exports) module.exports = VOZ;
  else root.VOZ = VOZ;
})(typeof self !== 'undefined' ? self : this);
