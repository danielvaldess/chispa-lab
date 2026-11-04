// Tutor socrático: arma, con plantillas y los propios datos del jugador, las tres ayudas de Chispa al terminar un juego:
// 1) una pregunta que lo hace pensar, 2) una pista con sus números y 3) una explicación que parte de su idea.
// No es IA generativa: no inventa nada, solo rellena frases escritas de antemano con lo que midió el niño y con la idea
// errónea más probable que calculó diagnostico.js. Funciona sin internet y sin enviar nada. Sin DOM.
(function (root) {
  'use strict';
  var DIAG = typeof require === 'function' && typeof module !== 'undefined' ? require('./diagnostico.js') : root.DIAGNOSTICO;

  /** Número con coma decimal: fmt(0.7071, 1) → «0,7». */
  function fmt(x, d) {
    var k = Math.pow(10, d || 0);
    return String(Math.round(Number(x) * k) / k).replace('.', ',');
  }
  function num(x) { return isFinite(Number(x)) && x !== null && x !== undefined && x !== ''; }
  function todos() { for (var i = 0; i < arguments.length; i++) if (!num(arguments[i])) return false; return true; }

  var PLANTILLAS = {
    rampa: {
      'rampa-proporcional': function (d) {
        var c = todos(d.th1, d.th2, d.t1, d.t2);
        return {
          pregunta: c ? 'Pensaste que el tiempo bajaría a la mitad. Usaste ' + fmt(d.th1, 1) + '° y ' + fmt(d.th2, 1) + '°, y la canica pasó de ' + fmt(d.t1, 2) + ' s a ' + fmt(d.t2, 2) + ' s. ¿Es la mitad? ¿Cuánto bajó de verdad?' :
            'Pensaste que al doblar el ángulo el tiempo baja a la mitad. ¿Cómo podrías comprobarlo con dos pedidos y un cronómetro?',
          pista: c ? 'Divide el tiempo nuevo entre el anterior: ' + fmt(d.t2, 2) + ' ÷ ' + fmt(d.t1, 2) + ' = ' + fmt(d.t2 / d.t1, 2) + '. Si fuera la mitad, saldría 0,5.' :
            'Divide un tiempo entre el otro. Si fuera la mitad, el resultado sería 0,5.',
          explicacion: 'Tu idea tiene sentido: parece lógico que el doble de inclinación dé la mitad del tiempo. Pero el tiempo no baja en la misma proporción.'
        };
      },
      'rampa-no-importa': function (d) {
        var c = todos(d.th1, d.th2, d.t1, d.t2);
        return {
          pregunta: c ? 'Pensaste que la inclinación no cambia el tiempo. Con ' + fmt(d.th1, 1) + '° tardó ' + fmt(d.t1, 2) + ' s y con ' + fmt(d.th2, 1) + '° tardó ' + fmt(d.t2, 2) + ' s. ¿Se parecen esos tiempos?' :
            'Pensaste que inclinar más no cambia nada. ¿Qué pasaría si pones la rampa casi plana?',
          pista: c ? 'La diferencia entre los dos tiempos es de ' + fmt(Math.abs(d.t1 - d.t2), 2) + ' s. ¿Es poco o es mucho para una canica?' :
            'Prueba dos inclinaciones muy distintas y compara los tiempos.',
          explicacion: 'Es normal pensarlo: a simple vista la canica siempre «baja». Pero más inclinación significa más aceleración, y eso cambia el tiempo.'
        };
      },
      ok: function (d) {
        var c = todos(d.th1, d.th2, d.t1, d.t2);
        return {
          pregunta: c ? '¡Bien! El ángulo pasó de ' + fmt(d.th1, 1) + '° a ' + fmt(d.th2, 1) + '° y el tiempo de ' + fmt(d.t1, 2) + ' s a ' + fmt(d.t2, 2) + ' s. ¿Por qué crees que no se redujo a la mitad?' :
            '¡Bien! Tardó menos, pero no la mitad. ¿Por qué crees que pasa?',
          pista: c ? 'Divide ' + fmt(d.t2, 2) + ' entre ' + fmt(d.t1, 2) + ': da ' + fmt(d.t2 / d.t1, 2) + '. Compáralo con 0,5.' : 'Divide un tiempo entre el otro y compáralo con 0,5.',
          explicacion: 'Acertaste. Ahora fíjate en el porqué:'
        };
      }
    },
    pendulo: {
      'pendulo-peso': function (d) {
        var c = d.par && todos(d.par.L, d.par.m1, d.par.m2, d.par.T1, d.par.T2);
        return {
          pregunta: c ? 'Con el mismo largo (' + fmt(d.par.L, 0) + ' cm) probaste ' + fmt(d.par.m1, 0) + ' g y ' + fmt(d.par.m2, 0) + ' g, y mediste ' + fmt(d.par.T1, 2) + ' s y ' + fmt(d.par.T2, 2) + ' s. ¿El ritmo cambió por el peso?' :
            'Pensaste que el peso cambia el ritmo. ¿Cómo harías una prueba justa, con el mismo largo y otro objeto? ¿Qué esperas ver?',
          pista: c ? 'Compara ' + fmt(d.par.T1, 2) + ' con ' + fmt(d.par.T2, 2) + ': la diferencia es de ' + fmt(Math.abs(d.par.T1 - d.par.T2), 2) + ' s. ¿Es por el peso o por otra cosa?' :
            'Para saber si el peso importa, cambia solo el objeto y deja el hilo igual.',
          explicacion: 'Mucha gente cree lo mismo: lo pesado «debería» ir más lento. Pero en el péndulo el peso no decide el ritmo.'
        };
      },
      ok: function (d) {
        var c = d.par && todos(d.par.L, d.par.m1, d.par.m2, d.par.T1, d.par.T2);
        return {
          pregunta: c ? '¡Bien! Con ' + fmt(d.par.L, 0) + ' cm probaste ' + fmt(d.par.m1, 0) + ' g y ' + fmt(d.par.m2, 0) + ' g y el ritmo casi no cambió. ¿Y si cambias el largo del hilo, qué crees que pasa?' :
            '¡Bien! El peso no cambia el ritmo. ¿Qué sí crees que lo cambia?',
          pista: 'Prueba un hilo el doble de largo y mira cuánto cambia el tiempo de ida y vuelta.',
          explicacion: 'Acertaste. Ahora piensa qué sí cambia el ritmo:'
        };
      }
    },
    voz: {
      'voz-invertida': function (d) {
        var c = todos(d.base, d.f);
        return {
          pregunta: c ? 'Pensaste que al cantar más agudo la frecuencia baja. Tu nota base fue de ' + fmt(d.base, 0) + ' Hz y en el último aro cantaste a ' + fmt(d.f, 0) + ' Hz. ¿Es mayor o menor?' :
            'Pensaste que al cantar más agudo la frecuencia baja. Canta una nota grave y una aguda: ¿cuál hace que el globo suba?',
          pista: c ? 'Divide ' + fmt(d.f, 0) + ' entre ' + fmt(d.base, 0) + ': da ' + fmt(d.f / d.base, 2) + '. Si es mayor que 1, vibra más veces por segundo.' :
            'Una nota aguda hace que las cuerdas vocales vibren más veces por segundo.',
          explicacion: 'Se parece a lo que pasa con una cuerda: a veces cuesta imaginar que más agudo sea «más». Pero más agudo significa más vibraciones por segundo.'
        };
      },
      'voz-no-cambia': function (d) {
        var c = todos(d.base, d.f);
        return {
          pregunta: c ? 'Pensaste que la frecuencia no cambia al cantar más agudo. Tu nota base fue de ' + fmt(d.base, 0) + ' Hz y en el último aro cantaste a ' + fmt(d.f, 0) + ' Hz. ¿Se quedó igual?' :
            'Pensaste que la frecuencia no cambia al cantar más agudo. ¿Qué crees que mide Chispa entonces para subir el globo?',
          pista: c ? 'Compara ' + fmt(d.f, 0) + ' con ' + fmt(d.base, 0) + ': hay ' + fmt(Math.abs(d.f - d.base), 0) + ' Hz de diferencia.' : 'Chispa mide cuántas veces vibra tu voz por segundo; eso es el tono.',
          explicacion: 'Se siente igual en la garganta, pero el tono sí cambia: tu voz vibra a otro ritmo.'
        };
      },
      ok: function (d) {
        var c = todos(d.base, d.f);
        return {
          pregunta: c ? '¡Bien! Tu nota base fue de ' + fmt(d.base, 0) + ' Hz y en el último aro cantaste a ' + fmt(d.f, 0) + ' Hz, que es ×' + fmt(d.f / d.base, 2) + '. ¿Qué pasaría con un aro todavía más agudo?' :
            '¡Bien! Más agudo, más vibraciones por segundo. ¿Qué pasaría con un aro todavía más agudo?',
          pista: c ? 'Divide ' + fmt(d.f, 0) + ' entre ' + fmt(d.base, 0) + ': da ' + fmt(d.f / d.base, 2) + '. Si diera 2, sería una octava.' : 'Si la frecuencia se duplica, sube una octava.',
          explicacion: 'Acertaste. Un dato más:'
        };
      }
    },
    globo: {
      'tono-deriva': function () {
        return {
          pregunta: 'Pensaste que el tono se mueve solo. ¿Qué tiene que hacer tu voz para que Chispa mida casi la misma frecuencia todo el rato?',
          pista: 'Respira hondo y canta «aaa» sin cambiar la boca ni apretar la garganta: el globo sube cuando el tono casi no cambia.',
          explicacion: 'Pasa mucho porque al quedarnos sin aire el tono se mueve. Pero si mantienes la voz estable, la frecuencia casi no cambia.'
        };
      },
      ok: function () {
        return {
          pregunta: '¡Bien! Con la voz pareja, la frecuencia casi no cambia. ¿Qué crees que pasa si tomas más aire a mitad de la nota?',
          pista: 'Prueba tomar aire a la mitad y mira si el globo sigue subiendo igual.',
          explicacion: 'Acertaste. Un dato más:'
        };
      }
    },
    luz: {
      'luz-fabrica': function () {
        return {
          pregunta: 'Pensaste que la manzana fabrica su luz roja. ¿Se ve la manzana en un cuarto totalmente oscuro? ¿Qué necesita para verse?',
          pista: 'Tapa la luz con la mano: la manzana deja de verse roja. Los objetos devuelven la luz que reciben.',
          explicacion: 'Es una idea muy común: como vemos el color «en el objeto», parece que lo fabrica. Pero sin luz que lo ilumine no se ve ningún color.'
        };
      },
      'luz-absorbe': function () {
        return {
          pregunta: 'Pensaste que la manzana absorbe la luz roja. Si se quedara con la roja, ¿qué luz llegaría a tus ojos?',
          pista: 'La luz blanca tiene todos los colores. Lo que ves es lo que el objeto devuelve, no lo que se queda.',
          explicacion: 'Es fácil confundirlo: «absorber» y «devolver» son lo contrario. El color que ves es el que vuelve hacia ti.'
        };
      },
      ok: function () {
        return {
          pregunta: '¡Bien! Un objeto se ve rojo porque devuelve la luz roja. ¿De qué color se vería una hoja verde bajo una luz roja?',
          pista: 'Piensa qué luz recibe la hoja y qué luz puede devolver.',
          explicacion: 'Acertaste. Un dato más:'
        };
      }
    },
    burbujas: {
      'camara-siempre': function () {
        return {
          pregunta: 'Pensaste que la diferencia es grande aunque te quedes quieto. ¿Qué cambia entre dos fotos de alguien que no se mueve?',
          pista: 'Si nada se mueve, cada punto de la foto tiene casi el mismo número. Solo cambia donde hay movimiento.',
          explicacion: 'Pasa que a veces la imagen parpadea un poco, y eso parece cambio. Pero comparar fotos solo muestra una diferencia grande si algo se mueve.'
        };
      },
      'camara-no-compara': function () {
        return {
          pregunta: 'Pensaste que la diferencia es siempre la misma. Si la cámara no compara las fotos, ¿cómo podría saber dónde pasó tu mano?',
          pista: 'Compara dos fotos seguidas: donde los números cambian, hubo movimiento.',
          explicacion: 'La cámara no «ve» el movimiento: compara una foto con la siguiente y busca dónde cambió.'
        };
      },
      ok: function () {
        return {
          pregunta: '¡Bien! Si te quedas quieto, las dos fotos casi no cambian. ¿Y si mueves la mano muy rápido, cuánto cambiarán?',
          pista: 'Mueve la mano despacio y rápido y mira qué burbujas revientan.',
          explicacion: 'Acertaste. Un dato más:'
        };
      }
    },
    hilo: {
      'hilo-proporcional': function (d) {
        var c = todos(d.L1, d.L2, d.T1, d.T2);
        return {
          pregunta: c ? 'Pensaste que con el hilo 4 veces más largo tardaría 4 veces más. Con ' + fmt(d.L1, 0) + ' cm mediste ' + fmt(d.T1, 2) + ' s y con ' + fmt(d.L2, 0) + ' cm, ' + fmt(d.T2, 2) + ' s. ¿Salió 4 veces más?' :
            'Pensaste que con el hilo 4 veces más largo tardaría 4 veces más. ¿Cómo lo comprobarías con dos hilos y un cronómetro?',
          pista: c ? 'Divide ' + fmt(d.T2, 2) + ' entre ' + fmt(d.T1, 2) + ': da ' + fmt(d.T2 / d.T1, 2) + '. Si fuera 4 veces más, saldría 4.' : 'Divide un tiempo entre el otro. Si fuera 4 veces más, saldría 4.',
          explicacion: 'Tu idea tiene sentido: más largo, más lento. Pero el tiempo crece más despacio que el largo: con el hilo 4 veces más largo, tarda el doble.'
        };
      },
      'hilo-no-importa': function (d) {
        var c = todos(d.L1, d.L2, d.T1, d.T2);
        return {
          pregunta: c ? 'Pensaste que el largo del hilo no cambia el tiempo. Con ' + fmt(d.L1, 0) + ' cm mediste ' + fmt(d.T1, 2) + ' s y con ' + fmt(d.L2, 0) + ' cm, ' + fmt(d.T2, 2) + ' s. ¿Son iguales?' :
            'Pensaste que el largo no cambia nada. ¿Qué pasa con un columpio de cuerda corta y uno de cuerda larga?',
          pista: c ? 'La diferencia es de ' + fmt(Math.abs(d.T2 - d.T1), 2) + ' s. ¿Es poco para una vuelta de péndulo?' : 'Prueba dos hilos muy distintos y compara los tiempos.',
          explicacion: 'Es fácil pensarlo, porque el objeto es el mismo. Pero el largo del hilo sí cambia el ritmo.'
        };
      },
      ok: function (d) {
        var c = todos(d.L1, d.L2, d.T1, d.T2);
        return {
          pregunta: c ? '¡Bien! El hilo pasó de ' + fmt(d.L1, 0) + ' a ' + fmt(d.L2, 0) + ' cm y el tiempo de ' + fmt(d.T1, 2) + ' a ' + fmt(d.T2, 2) + ' s. ¿Cuántas veces más largo es, y cuántas veces más lento?' :
            '¡Bien! Con 4 veces más hilo tarda el doble. ¿Por qué no tarda 4 veces más?',
          pista: c ? 'Divide ' + fmt(d.T2, 2) + ' entre ' + fmt(d.T1, 2) + ': da ' + fmt(d.T2 / d.T1, 2) + ', cerca de 2.' : 'Compara cuántas veces creció el largo y cuántas el tiempo.',
          explicacion: 'Acertaste. Fíjate en la regla:'
        };
      }
    },
    col: {
      'col-invertida': function () {
        return {
          pregunta: 'Pensaste que el ácido vuelve la col verde o azul. ¿De qué color se puso el vaso con limón en tu prueba?',
          pista: 'El limón y el vinagre son ácidos. Mira qué color tomó la col con ellos y compáralo con el agua.',
          explicacion: 'Es fácil confundirlo: la col morada cambia de color con ácidos y con bases, pero cada uno la lleva hacia un lado distinto.'
        };
      },
      'col-no-cambia': function () {
        return {
          pregunta: 'Pensaste que la col morada no cambia con un ácido. ¿Se veía igual el vaso del agua y el del limón?',
          pista: 'Compara el vaso del agua con el del limón: si fueran iguales, la col no serviría para detectar ácidos.',
          explicacion: 'Es normal dudarlo: el jugo parece solo un líquido de color. Pero cambia con lo que se le echa.'
        };
      },
      ok: function () {
        return {
          pregunta: '¡Bien! La col se puso rosada con el ácido. ¿Y con el bicarbonato, un polvo que no es ácido, qué crees que pasó?',
          pista: 'Compara el vaso del bicarbonato con el del agua y con el del limón.',
          explicacion: 'Acertaste. Un dato más:'
        };
      }
    }
  };

  var LIMITE = 260; // caracteres: cortos, para que los lea un niño

  function recortar(t) { return t.length <= LIMITE ? t : t.slice(0, LIMITE - 1).replace(/\s+\S*$/, '') + '…'; }

  /**
   * Arma las tres ayudas de Chispa para un juego terminado.
   * ctx: { ok: bool, opcion: id, idea: idea errónea más probable (o null), datos: {...} }.
   * Devuelve { clave, pregunta, pista, explicacion } o null si no hay plantillas para ese juego.
   */
  function crear(nivelId, ctx) {
    var tabla = PLANTILLAS[nivelId];
    if (!tabla) return null;
    ctx = ctx || {};
    var idea = ctx.idea || (ctx.ok ? null : DIAG.ideaDeOpcion(nivelId, ctx.opcion));
    var clave = ctx.ok ? 'ok' : (idea && tabla[idea] ? idea : null);
    if (!clave) return null;
    var t = tabla[clave](ctx.datos || {});
    return { clave: clave, pregunta: recortar(t.pregunta), pista: recortar(t.pista), explicacion: recortar(t.explicacion) };
  }

  var PISTAS = { crear: crear, fmt: fmt, LIMITE: LIMITE, PLANTILLAS: PLANTILLAS };
  if (typeof module !== 'undefined' && module.exports) module.exports = PISTAS;
  else root.PISTAS = PISTAS;
})(typeof self !== 'undefined' ? self : this);
