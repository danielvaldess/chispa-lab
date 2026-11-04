// Ajustes de juego a partir de la edad y de los apoyos que eligió la persona. Sin DOM: corre en el
// navegador y en Node (para pruebas). Los apoyos NO son diagnósticos: son cosas que ayudan a jugar.
(function (root) {
  'use strict';

  var APOYOS = [
    { id: 'voz', icono: '🗣', texto: 'Hablar o la voz' },
    { id: 'oir', icono: '👂', texto: 'Oír' },
    { id: 'ver', icono: '👀', texto: 'Ver' },
    { id: 'atencion', icono: '🎯', texto: 'Concentrarme' },
    { id: 'leer', icono: '📖', texto: 'Leer o los números' },
    { id: 'manos', icono: '✋', texto: 'Mover las manos' },
    { id: 'sensorial', icono: '🌙', texto: 'Luces, ruidos o cambios me molestan' }
  ];
  var IDS = APOYOS.map(function (a) { return a.id; });

  // Multiplicador de tolerancia por edad (heurística, por validar en un piloto): más pequeño = más margen.
  var BANDAS = [
    { hasta: 6, nombre: 'peque', tol: 1.8, hold: 0.7 },
    { hasta: 8, nombre: 'ocho', tol: 1.4, hold: 0.85 },
    { hasta: 10, nombre: 'nueve', tol: 1.15, hold: 1 },
    { hasta: 13, nombre: 'once', tol: 1.0, hold: 1 },
    { hasta: 200, nombre: 'grande', tol: 0.8, hold: 1.15 }
  ];

  /** Edad en años cumplidos a partir de 'AAAA-MM' (se guarda solo año y mes). null si no es válido. */
  function edadDe(nac, hoy) {
    var m = /^(\d{4})-(\d{2})$/.exec(String(nac || ''));
    if (!m) return null;
    var y = parseInt(m[1], 10), mes = parseInt(m[2], 10);
    if (mes < 1 || mes > 12) return null;
    hoy = hoy || new Date();
    var edad = hoy.getFullYear() - y;
    if (hoy.getMonth() + 1 < mes) edad--;
    return edad;
  }

  function banda(edad) {
    for (var i = 0; i < BANDAS.length; i++) if (edad <= BANDAS[i].hasta) return BANDAS[i];
    return BANDAS[BANDAS.length - 1];
  }

  /** Nombre o apodo: letras, espacios, guion y apóstrofo; máximo 20. Vacío si no queda nada. */
  function limpiarNombre(s) {
    var t = String(s == null ? '' : s).replace(/[^A-Za-z\u00C0-\u024F\s'’-]/g, '').replace(/\s+/g, ' ').trim();
    return t.slice(0, 20).trim();
  }

  /** 'AAAA-MM' válido para alguien de 3 a 100 años, o null. */
  function validarNac(y, m, hoy) {
    y = parseInt(y, 10); m = parseInt(m, 10);
    if (!(y > 1900) || !(m >= 1 && m <= 12)) return null;
    var nac = y + '-' + (m < 10 ? '0' : '') + m;
    var e = edadDe(nac, hoy);
    return e !== null && e >= 3 && e <= 100 ? nac : null;
  }

  function apoyosValidos(lista) {
    var out = [];
    (Array.isArray(lista) ? lista : []).forEach(function (a) { if (IDS.indexOf(a) >= 0 && out.indexOf(a) < 0) out.push(a); });
    return out;
  }

  /**
   * Ajustes de juego de un perfil { nac, apoyos, extras }. `extras` permite cambiar a mano
   * (texto, brillo, calma, contraste, leerVoz, vibrar, volumen, tutor) desde la pantalla de ajustes.
   */
  function ajustesDe(perfil, hoy) {
    perfil = perfil || {};
    var edad = edadDe(perfil.nac, hoy);
    if (edad === null) edad = 10;
    var b = banda(edad);
    var ap = apoyosValidos(perfil.apoyos);
    var has = function (id) { return ap.indexOf(id) >= 0; };
    var ex = perfil.extras || {};

    var aj = {
      edad: edad, banda: b.nombre, apoyos: ap,
      tol: b.tol, hold: b.hold,
      bandaVoz: 1, sensibilidadMic: 1, sinTiempo: false, globoLargo: false, voz: has('voz'),
      visualSonido: false, vibrar: true,
      contraste: false, escala: 1, simbolos: false, brillo: 0, tutor: true,
      calma: false, pausa: false, avisos: false, sinDestellos: false, volumen: 1,
      leerVoz: false, minusculas: false, interlineado: 1.35, numerosConDibujo: false,
      toquesGrandes: false, masMenos: false, sensorInclinacion: true
    };

    if (has('voz')) { aj.bandaVoz = 1.5; aj.hold *= 0.7; aj.sensibilidadMic = 0.4; aj.sinTiempo = true; aj.globoLargo = true; }
    if (has('oir')) { aj.visualSonido = true; aj.vibrar = true; }
    if (has('ver')) { aj.contraste = true; aj.escala = Math.max(aj.escala, 1.3); aj.simbolos = true; }
    if (has('atencion')) { aj.calma = true; aj.pausa = true; aj.tol *= 1.1; }
    if (has('leer')) { aj.escala = Math.max(aj.escala, 1.3); aj.interlineado = 1.5; aj.minusculas = true; aj.leerVoz = true; aj.numerosConDibujo = true; }
    if (has('manos')) { aj.toquesGrandes = true; aj.masMenos = true; aj.tol *= 1.3; aj.sensorInclinacion = false; }
    if (has('sensorial')) { aj.calma = true; aj.sinDestellos = true; aj.volumen = 0.4; aj.avisos = true; aj.vibrar = false; }

    if (typeof ex.escala === 'number') aj.escala = Math.min(1.6, Math.max(1, ex.escala));
    if (ex.brillo === 0 || ex.brillo === 1 || ex.brillo === 2) aj.brillo = ex.brillo;
    if (has('sensorial') && ex.brillo === undefined) aj.brillo = 1;
    ['calma', 'contraste', 'leerVoz', 'vibrar', 'tutor'].forEach(function (k) { if (typeof ex[k] === 'boolean') aj[k] = ex[k]; });
    if (typeof ex.volumen === 'number') aj.volumen = Math.min(1, Math.max(0, ex.volumen));
    if (aj.calma) aj.sinDestellos = true;
    aj.tol = Math.round(aj.tol * 100) / 100;
    aj.hold = Math.round(aj.hold * 100) / 100;
    return aj;
  }

  /** Estado inicial de la dificultad dinámica de una partida. */
  function dinamicoInicial() { return { fallos: 0, aciertos: 0, mult: 1, pista: false }; }

  /**
   * Tras un intento: 3 fallos seguidos suben la tolerancia un 25 % (tope ×2) y piden una pista;
   * 2 aciertos seguidos la bajan un 10 % (nunca por debajo de la base). Devuelve un estado nuevo.
   */
  function ajusteDinamico(d, acierto) {
    var n = { fallos: d.fallos, aciertos: d.aciertos, mult: d.mult, pista: false };
    if (acierto) {
      n.fallos = 0; n.aciertos++;
      if (n.aciertos >= 2) { n.mult = Math.max(1, n.mult * 0.9); n.aciertos = 0; }
    } else {
      n.aciertos = 0; n.fallos++;
      if (n.fallos >= 3) { n.mult = Math.min(2, n.mult * 1.25); n.fallos = 0; n.pista = true; }
    }
    n.mult = Math.round(n.mult * 1000) / 1000;
    return n;
  }

  /** Tolerancia efectiva = base del perfil × dinámica. */
  function tolEfectiva(aj, d) { return aj.tol * (d ? d.mult : 1); }

  /** Frases sencillas que cuentan qué cambió, para la pantalla «listo». */
  function resumen(aj) {
    var f = [];
    if (aj.banda === 'peque' || aj.banda === 'ocho') f.push('Te doy más margen para acertar.');
    else if (aj.banda === 'grande') f.push('Los retos serán un poco más exactos.');
    if (aj.voz) f.push('El globo de la voz será más fácil de mantener y sin prisa.');
    if (aj.visualSonido) f.push('Cada sonido tendrá también un dibujo.');
    if (aj.contraste) f.push('Habrá más contraste y letras más grandes.');
    if (aj.calma) f.push('Habrá menos luces y movimientos.');
    if (aj.leerVoz) f.push('Chispa podrá leerte lo que dice en voz alta.');
    if (aj.toquesGrandes) f.push('Los botones serán más grandes.');
    if (!f.length) f.push('Todo queda como está. Puedes cambiarlo cuando quieras.');
    return f;
  }

  var AJUSTES = {
    APOYOS: APOYOS, edadDe: edadDe, banda: banda, limpiarNombre: limpiarNombre, validarNac: validarNac,
    apoyosValidos: apoyosValidos, ajustesDe: ajustesDe, dinamicoInicial: dinamicoInicial,
    ajusteDinamico: ajusteDinamico, tolEfectiva: tolEfectiva, resumen: resumen
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = AJUSTES;
  else root.AJUSTES = AJUSTES;
})(typeof self !== 'undefined' ? self : this);
