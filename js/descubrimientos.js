// Descubrimientos del laboratorio libre: cosas que un niño puede encontrar probando, sin que nadie se las pida. Cada una se desbloquea cuando ocurre lo que
// dice `requiere` (claves que emiten las estaciones: «m:» mezclas, «f:» flota o se hunde, «p:» invernadero, «c:» caída). No hay puntos ni orden obligatorio.
// «Dame una idea» sugiere una pregunta sobre algo que aún no ha encontrado, sin dar la respuesta. Funciones puras, sin DOM ni internet.
(function (root) {
  'use strict';

  var ESTACIONES = {
    mezclas: { nombre: 'Mesa de mezclas', emoji: '🧪' },
    flota: { nombre: 'Flota o se hunde', emoji: '🥚' },
    planta: { nombre: 'Invernadero', emoji: '🌱' },
    caida: { nombre: 'Caída libre', emoji: '🪂' }
  };

  function casa(materiales, aviso) { return { materiales: materiales, aviso: aviso || 'Con un adulto cerca. No pruebes ni huelas lo que mezclas.' }; }

  var CATALOGO = [
    { id: 'col-rosa', estacion: 'mezclas', requiere: ['m:color-acido'], titulo: 'El limón vuelve rosa la col', que: 'Los ácidos, como el limón o el vinagre, vuelven rosado el jugo de col morada. Por eso se llama indicador: te avisa de que hay un ácido.', pista: '¿De qué color se pone el jugo de col si le echas limón?', casa: casa(['jugo de col morada (un adulto hierve unas hojas)', 'limón', 'un vaso transparente']) },
    { id: 'col-azul', estacion: 'mezclas', requiere: ['m:color-base'], titulo: 'El bicarbonato la vuelve azul', que: 'Las bases, como el bicarbonato, llevan el jugo de col hacia el azul. Ácido y base empujan el color a lados opuestos.', pista: '¿Y si en vez de limón le echas bicarbonato?', casa: casa(['jugo de col morada', 'bicarbonato', 'un vaso transparente']) },
    { id: 'burbujas', estacion: 'mezclas', requiere: ['m:burbujas'], titulo: 'Ácido + bicarbonato = burbujas', que: 'Al juntar un ácido con bicarbonato se forma un gas, el dióxido de carbono: son las burbujas. Es un cambio químico: aparece algo nuevo.', pista: '¿Qué pasa si juntas limón o vinagre con bicarbonato?', casa: casa(['vinagre', 'bicarbonato', 'un vaso grande y una bandeja'], 'Con un adulto. Usa un vaso abierto y poca cantidad: nunca cierres una botella.') },
    { id: 'neutraliza', estacion: 'mezclas', requiere: ['m:neutraliza'], titulo: 'Se apagan el uno al otro', que: 'Si hay justo la cantidad de ácido y de base, se compensan y el jugo de col vuelve a su morado: se neutralizan.', pista: 'Con el jugo de col, ¿puedes hacer que el vinagre y el bicarbonato dejen el color como estaba?', casa: casa(['jugo de col morada', 'vinagre', 'bicarbonato']) },
    { id: 'aceite-agua', estacion: 'mezclas', requiere: ['m:capas'], titulo: 'El aceite no se mezcla con el agua', que: 'El aceite es menos denso que el agua y no se disuelve en ella: se queda arriba, en una capa.', pista: '¿Qué le pasa al aceite cuando lo echas en agua?', casa: casa(['agua', 'aceite', 'un vaso transparente']) },
    { id: 'sal-disuelve', estacion: 'mezclas', requiere: ['m:disuelve-sal'], titulo: 'La sal desaparece… pero sigue ahí', que: 'La sal se disuelve en el agua: sus partículas se reparten entre las del agua. No desaparece: el agua queda salada.', pista: '¿Adónde se va la sal cuando la echas en agua?', casa: casa(['agua', 'sal', 'una cuchara']) },
    { id: 'azucar-disuelve', estacion: 'mezclas', requiere: ['m:disuelve-azucar'], titulo: 'El azúcar también se disuelve', que: 'El azúcar se disuelve en el agua, y cabe mucha más que sal antes de llenarse.', pista: '¿Cabe más azúcar o más sal en un vaso de agua?', casa: casa(['agua', 'azúcar', 'sal', 'una cuchara']) },
    { id: 'saturacion', estacion: 'mezclas', requiere: ['m:saturado'], titulo: 'El agua se llena', que: 'El agua solo puede disolver una cantidad de sal: cuando se llena (se satura), lo que sobra se queda en el fondo.', pista: '¿Qué pasa si sigues echando sal y sal en el mismo vaso?', casa: casa(['agua', 'sal', 'una cuchara']) },
    { id: 'sal-neutra', estacion: 'mezclas', requiere: ['m:sal-neutra'], titulo: 'La sal no cambia el color', que: 'La sal de cocina no es ni ácido ni base: el jugo de col sigue morado. No todo lo que mezclas cambia el color.', pista: '¿La sal cambia el color del jugo de col?', casa: casa(['jugo de col morada', 'sal']) },
    { id: 'naranja', estacion: 'mezclas', requiere: ['m:naranja'], titulo: 'Rojo y amarillo hacen naranja', que: 'Con los colores primarios (rojo, amarillo y azul) se pueden hacer los demás: rojo + amarillo = naranja.', pista: '¿Qué color sale si mezclas rojo y amarillo?', casa: casa(['colorante de cocina rojo y amarillo', 'agua', 'dos vasos']) },
    { id: 'verde-color', estacion: 'mezclas', requiere: ['m:verde'], titulo: 'Amarillo y azul hacen verde', que: 'Amarillo + azul = verde. Es la mezcla de colores de los pintores.', pista: '¿Y si mezclas amarillo con azul?', casa: casa(['colorante de cocina amarillo y azul', 'agua', 'dos vasos']) },
    { id: 'morado-color', estacion: 'mezclas', requiere: ['m:morado'], titulo: 'Rojo y azul hacen morado', que: 'Rojo + azul = morado. Con tres colorantes se pueden hacer casi todos los colores.', pista: '¿Qué sale de mezclar rojo con azul?', casa: casa(['colorante de cocina rojo y azul', 'agua', 'dos vasos']) },
    { id: 'huevo-sal', estacion: 'flota', requiere: ['f:huevo-agua-hunde', 'f:huevo-sal-flota'], titulo: 'El huevo flota con sal', que: 'El agua con mucha sal es más densa que el agua sola. Un huevo se hunde en agua dulce y flota en agua muy salada.', pista: '¿Cómo harías para que un huevo que se hunde flote?', casa: casa(['un vaso grande', 'agua', 'sal', 'un huevo crudo'], 'Con un adulto. Mete el huevo con cuidado para que no se rompa.') },
    { id: 'naranja-cascara', estacion: 'flota', requiere: ['f:naranja-flota', 'f:naranjaPelada-hunde'], titulo: 'La cáscara de la naranja hace flotar', que: 'La naranja con cáscara flota porque la cáscara tiene mucho aire por dentro. Pelada, se hunde.', pista: '¿Flota una naranja pelada igual que una con cáscara?', casa: casa(['una naranja', 'un recipiente con agua']) },
    { id: 'plastilina', estacion: 'flota', requiere: ['f:plastilina-bola-hunde', 'f:plastilina-barquito-flota'], titulo: 'La forma importa: el barquito flota', que: 'Una bola de plastilina se hunde, pero en forma de barquito flota: encierra aire y, en conjunto, pesa menos que el agua que desplaza.', pista: '¿Puedes hacer flotar la plastilina sin quitarle ni ponerle nada?', casa: casa(['plastilina', 'un recipiente con agua']) },
    { id: 'torre', estacion: 'flota', requiere: ['f:torre'], titulo: 'Una torre de líquidos', que: 'Los líquidos que no se mezclan se ordenan por densidad: el más denso abajo y el menos denso arriba.', pista: '¿Qué pasa si pones miel, agua y aceite en el mismo vaso?', casa: casa(['miel', 'agua', 'aceite', 'un vaso alto y transparente']) },
    { id: 'sin-agua', estacion: 'planta', requiere: ['p:seca'], titulo: 'Sin agua la semilla no despierta', que: 'Una semilla seca está dormida. Necesita agua para germinar, aunque tenga luz.', pista: '¿Qué le pasa a una semilla si le das luz pero nada de agua?', casa: casa(['frijoles', 'algodón', 'agua', 'un vaso'], 'Es un experimento de varios días: anota la altura cada día.') },
    { id: 'sin-luz-palida', estacion: 'planta', requiere: ['p:palida'], titulo: 'A oscuras crece larga y pálida', que: 'Sin luz, la plantita se estira buscándola y se queda delgada y de color claro: no puede fabricar su color verde sin luz.', pista: '¿Cómo crece una planta con agua pero sin luz?', casa: casa(['frijoles', 'algodón', 'agua', 'un lugar oscuro (una caja)'], 'Es un experimento de varios días: compara con otra planta que sí tenga luz.') },
    { id: 'planta-sana', estacion: 'planta', requiere: ['p:sana'], titulo: 'Agua y luz: crece sana', que: 'Con agua y luz la plantita crece verde y fuerte. Las plantas usan la luz para fabricar su alimento.', pista: '¿Qué necesita una plantita para crecer fuerte?', casa: casa(['frijoles', 'algodón', 'agua', 'una ventana con luz']) },
    { id: 'planta-marchita', estacion: 'planta', requiere: ['p:marchita'], titulo: 'Sin agua se marchita', que: 'Una planta ya crecida también necesita agua todos los días: si falta varios días, se marchita.', pista: '¿Qué pasa si dejas de regar la planta unos días?', casa: casa(['una planta o un frijol germinado', 'agua']) },
    { id: 'luna-igual', estacion: 'caida', requiere: ['c:vacio-igual'], titulo: 'Sin aire todo cae igual', que: 'Sin aire (en la Luna o en una cámara de vacío) un martillo y una pluma llegan al suelo a la vez: la gravedad acelera igual a todos los objetos.', pista: '¿Cae más rápido el martillo que la pluma en un lugar sin aire?', casa: casa(['dos hojas de papel'], 'No se puede quitar el aire en casa, pero puedes acercarte: mira el descubrimiento del papel arrugado.') },
    { id: 'pluma-aire', estacion: 'caida', requiere: ['c:pluma-aire'], titulo: 'El aire frena la pluma', que: 'En la Tierra el aire frena más a la pluma que a la bola, porque tiene mucha superficie y casi nada de peso.', pista: '¿Por qué la pluma tarda tanto en la Tierra?', casa: casa(['una pluma', 'una piedra pequeña']) },
    { id: 'luna-lento', estacion: 'caida', requiere: ['c:luna', 'c:tierra'], titulo: 'En la Luna se cae más despacio', que: 'En la Luna la gravedad es más débil (1,62 m/s² frente a 9,81 en la Tierra), así que todo cae más despacio.', pista: '¿Tarda lo mismo en caer una bola en la Luna que en la Tierra?', casa: casa(['—'], 'No se puede probar en casa; sí con el juego.') },
    { id: 'papel-forma', estacion: 'caida', requiere: ['c:papel-forma'], titulo: 'Un papel arrugado cae más rápido', que: 'Pesa lo mismo, pero arrugado tiene menos superficie y el aire lo frena menos. La forma importa.', pista: '¿Cae igual de rápido una hoja plana que la misma hoja arrugada?', casa: casa(['dos hojas de papel iguales']) }
  ];

  var POR_ID = {}; CATALOGO.forEach(function (d) { POR_ID[d.id] = d; });

  function porId(id) { return POR_ID[id] || null; }

  /** Anota que ocurrió algo (clave) y devuelve los descubrimientos que quedan completos. `vistas` y `tiene` no se modifican. */
  function registrar(vistas, clave, tiene) {
    var v = {}, k, nuevos = [];
    for (k in (vistas || {})) if (Object.prototype.hasOwnProperty.call(vistas, k)) v[k] = true;
    v[clave] = true;
    CATALOGO.forEach(function (d) {
      if ((tiene || []).indexOf(d.id) >= 0) return;
      if (d.requiere.every(function (r) { return v[r]; })) nuevos.push(d.id);
    });
    return { vistas: v, nuevos: nuevos };
  }

  /**
   * Una pregunta sobre algo que aún no encontró, sin la respuesta. Prefiere la estación indicada (si queda algo ahí); si no, la estación
   * donde menos ha descubierto. Devuelve { id, estacion, pista } o null si ya lo encontró todo.
   */
  function sugerir(tiene, estacion) {
    tiene = tiene || [];
    var faltan = CATALOGO.filter(function (d) { return tiene.indexOf(d.id) < 0; }), cuenta = {}, mejor = null, k;
    if (!faltan.length) return null;
    var aqui = estacion ? faltan.filter(function (d) { return d.estacion === estacion; }) : [];
    if (aqui.length) return { id: aqui[0].id, estacion: aqui[0].estacion, pista: aqui[0].pista };
    for (k in ESTACIONES) cuenta[k] = 0;
    tiene.forEach(function (id) { if (POR_ID[id]) cuenta[POR_ID[id].estacion] += 1; });
    faltan.forEach(function (d) { if (mejor === null || cuenta[d.estacion] < cuenta[mejor.estacion]) mejor = d; });
    return { id: mejor.id, estacion: mejor.estacion, pista: mejor.pista };
  }

  /** Limpia una lista leída del almacenamiento: solo ids válidos, sin repetir. */
  function normalizar(lista) {
    var vistos = {}, out = [];
    (Array.isArray(lista) ? lista : []).forEach(function (id) { if (typeof id === 'string' && POR_ID[id] && !vistos[id]) { vistos[id] = true; out.push(id); } });
    return out;
  }

  /** Cuántos lleva, en total y por estación. */
  function progreso(tiene) {
    var por = {}, k;
    for (k in ESTACIONES) por[k] = { tiene: 0, total: 0 };
    CATALOGO.forEach(function (d) { por[d.estacion].total += 1; if ((tiene || []).indexOf(d.id) >= 0) por[d.estacion].tiene += 1; });
    return { total: CATALOGO.length, tiene: normalizar(tiene).length, porEstacion: por };
  }

  var DESCUBRIMIENTOS = { ESTACIONES: ESTACIONES, CATALOGO: CATALOGO, porId: porId, registrar: registrar, sugerir: sugerir, normalizar: normalizar, progreso: progreso };
  if (typeof module !== 'undefined' && module.exports) module.exports = DESCUBRIMIENTOS;
  else root.DESCUBRIMIENTOS = DESCUBRIMIENTOS;
})(typeof self !== 'undefined' ? self : this);
