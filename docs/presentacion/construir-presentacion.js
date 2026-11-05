const pptxgen = require('pptxgenjs');
const fs = require('fs'), path = require('path');
// Las notas del orador salen de guion.md (una sección «## n. Título» por diapositiva, en el mismo orden).
const NOTAS = fs.readFileSync(path.join(__dirname, 'guion.md'), 'utf8').split(/^## \d+\. .*$/m).slice(1).map((t) => t.split(/\n---/)[0].trim());
// Los nombres del equipo salen de participantes.txt (uno por línea). Si falta, la portada lo avisa en vez de inventar nombres.
const _pf = path.join(__dirname, 'participantes.txt');
const PART = fs.existsSync(_pf) ? fs.readFileSync(_pf, 'utf8').split('\n').map((t) => t.trim()).filter(Boolean) : [];
const EQUIPO = PART.length ? PART.join(' · ') : '[Nombres de los 3 integrantes: escribirlos en participantes.txt]';
let _nota = 0; const notas = () => NOTAS[_nota++].replace('[NOMBRES DEL EQUIPO]', (typeof EQUIPO === 'string' && PART.length) ? PART.join(', ') : '[NOMBRES DEL EQUIPO]');
const { applyTheme } = require(process.env.SKILL + '/scripts/apply_theme.js');
const IMG = process.env.IMG;
const THEME = {
  name: 'Chispa Lab', headFontFace: 'Calibri', bodyFontFace: 'Calibri',
  colors: { dk1: '1D2250', lt1: 'FFFFFF', dk2: '3B4A9B', lt2: 'EEF3FF', accent1: '5EC8FF', accent2: 'FFD23F', accent3: 'FF5C8A', accent4: '2FD18B', accent5: 'FF9F43', accent6: '8A6CFF', hlink: '1D6FB8', folHlink: '8A6CFF' },
};
const HEX = { navy: '1D2250', sky: '5EC8FF', yellow: 'FFD23F', pink: 'FF5C8A', green: '2FD18B', orange: 'FF9F43', violet: '8A6CFF', light: 'EEF3FF', gris: '4A4F86' };
const pres = new pptxgen();
pres.layout = 'LAYOUT_16x9';
pres.theme = { headFontFace: 'Calibri', bodyFontFace: 'Calibri' };
pres.title = 'Chispa Lab: un laboratorio de ciencias en cada teléfono';
pres.author = 'Daniel Valdés';
pres.subject = '#hack4edu 2026, reto 17';
const C = pres.SchemeColor;

pres.defineSlideMaster({
  title: 'OSCURO', background: { color: C.text1 },
  objects: [],
});
pres.defineSlideMaster({
  title: 'CLARO', background: { color: C.background1 },
  slideNumber: { x: 9.2, y: 5.18, w: 0.5, h: 0.3, fontSize: 10, color: C.text2, align: 'right' },
  objects: [
    { placeholder: { options: { name: 'title', type: 'title', x: 0.5, y: 0.3, w: 9, h: 0.95, fontSize: 30, bold: true, color: C.text1, valign: 'middle', margin: 0 }, text: '' } },
  ],
});

// teléfono con una captura del juego
function telefono(slide, ruta, x, y, h, nombre) {
  const w = h * 390 / 844;
  slide.addShape(pres.ShapeType.roundRect, { x: x - 0.07, y: y - 0.07, w: w + 0.14, h: h + 0.14, rectRadius: 0.16, fill: { color: C.text1 }, line: { color: C.accent1, width: 1.5 }, objectName: 'Marco ' + nombre });
  slide.addImage({ path: IMG + '/' + ruta, x, y, w, h, objectName: 'Captura ' + nombre, altText: 'Captura de pantalla del juego: ' + nombre });
  return w;
}
const nota = (slide, t, color) => slide.addText(t, { x: 0.5, y: 5.12, w: 8.6, h: 0.35, fontSize: 10, color: color || C.text2, margin: 0, valign: 'middle', isTextBox: true, objectName: 'Fuente' });

// ---------- 1. Portada ----------
pres.addSection({ title: 'Problema' });
let s = pres.addSlide({ masterName: 'OSCURO', sectionTitle: 'Problema' });
s.addText('Chispa Lab', { x: 0.6, y: 1.05, w: 5.7, h: 1.0, fontSize: 54, bold: true, color: C.background1, margin: 0, isTextBox: true, objectName: 'Título' });
s.addText('Un laboratorio de ciencias en cada teléfono', { x: 0.6, y: 2.1, w: 5.6, h: 0.9, fontSize: 24, color: C.accent1, margin: 0, isTextBox: true, objectName: 'Subtítulo' });
s.addText([{ text: 'Reto 17 · #hack4edu 2026', options: { breakLine: true } }, { text: EQUIPO, options: { breakLine: true } }, { text: 'UTP, Centro Regional de Veraguas' }], { x: 0.6, y: 3.2, w: 5.8, h: 1.0, fontSize: 15, color: C.background1, margin: 0, isTextBox: true, objectName: 'Autoría' });
['Sin internet', 'Inclusivo', 'Código abierto'].forEach((t, i) => {
  s.addText(t, { x: 0.6 + i * 1.85, y: 4.35, w: 1.7, h: 0.42, fontSize: 14, bold: true, color: C.text1, fill: { color: C.accent2 }, align: 'center', valign: 'middle', shape: pres.ShapeType.roundRect, rectRadius: 0.2, margin: 0, isTextBox: true, objectName: 'Etiqueta ' + t });
});
telefono(s, 'menu.png', 7.0, 0.55, 4.5, 'menú del juego');
s.addNotes(notas());


// ---------- 1b. Demo ----------
s = pres.addSlide({ masterName: 'CLARO', sectionTitle: 'Problema' });
s.addText('Mira cómo se juega', { placeholder: 'title' });
[['rampa.png', 'Predice y juega'], ['pistas.png', 'Chispa pregunta con tus datos'], ['lab-mezclas.png', 'Mi laboratorio: juega libre'], ['hilo.png', 'Experimentos con materiales']].forEach((t, i) => {
  const x = 0.55 + i * 2.3;
  telefono(s, t[0], x, 1.3, 3.3, t[1]);
  s.addText(t[1], { x: x - 0.1, y: 4.78, w: 1.9, h: 0.5, fontSize: 12, bold: true, color: C.text1, align: 'center', valign: 'top', margin: 0, isTextBox: true, objectName: 'Pie ' + (i + 1) });
});
s.addNotes(notas());

// ---------- 2. Aprendizaje ----------
s = pres.addSlide({ masterName: 'CLARO', sectionTitle: 'Problema' });
s.addText('Panamá tiene un reto de aprendizaje en ciencias', { placeholder: 'title' });
s.addChart(pres.charts.BAR, [{ name: 'Panamá', labels: ['Lectura 6.º', 'Matemática 6.º'], values: [27.7, 10.1] }, { name: 'Argentina', labels: ['Lectura 6.º', 'Matemática 6.º'], values: [34.5, 17] }], {
  x: 0.5, y: 1.4, w: 4.9, h: 3.5, barDir: 'col', barGrouping: 'clustered', chartColors: [HEX.pink, HEX.sky], showValue: true, dataLabelPosition: 'outEnd', dataLabelFormatCode: '0.0"%"', dataLabelColor: HEX.navy, dataLabelFontSize: 14, dataLabelFontBold: true,
  showTitle: true, title: '6.º grado que alcanza el nivel mínimo (%), ERCE Pospandemia 2025', titleFontSize: 13, titleColor: HEX.navy, catAxisLabelColor: HEX.navy, catAxisLabelFontSize: 13, valAxisHidden: true, valGridLine: { style: 'none' }, catGridLine: { style: 'none' }, showLegend: true, legendPos: 'b', legendFontSize: 12, legendColor: HEX.navy, valAxisMaxVal: 45, valAxisMinVal: 0,
});
s.addText([{ text: '27,7 %  ·  10,1 %', options: { fontSize: 32, bold: true, color: C.accent3, breakLine: true } }, { text: 'de los niños de 6.º de Panamá alcanza el nivel mínimo en lectura y en matemática', options: { fontSize: 13, color: C.text1 } }], { x: 5.7, y: 1.35, w: 3.9, h: 1.3, margin: 0, isTextBox: true, objectName: 'Dato Panamá' });
s.addText([{ text: 'Ciencias: sin dato reciente', options: { fontSize: 17, bold: true, color: C.text1, breakLine: true } }, { text: 'Panamá se retiró de PISA 2025; el ERCE 2025 (aplicado en octubre de 2025) publica Ciencias de 6.º a fines de 2026', options: { fontSize: 12, color: C.text1 } }], { x: 5.7, y: 2.7, w: 3.9, h: 1.1, margin: 0, isTextBox: true, objectName: 'Dato ciencias' });
s.addText([{ text: 'Pueblos originarios: ', options: { bold: true, fontSize: 12, color: C.text1 } }, { text: 'pertenecer a un pueblo indígena se asocia a menores aprendizajes; en 2024, 1 de cada 5 alumnos de primaria oficial estaba en el área indígena (20,0 %)', options: { fontSize: 12, color: C.text1 } }], { x: 5.7, y: 3.9, w: 3.9, h: 1.1, margin: 0, isTextBox: true, objectName: 'Nota' });
nota(s, 'Fuentes: UNESCO (2/7/2025) y Meduca (24/6/2025), ERCE Pospandemia, Panamá y Argentina; La Prensa (14/10/2024 y 15/10/2025); Meduca, cuadro 2-2 (2024).');

s.addNotes(notas());

// ---------- 3. Acceso ----------
s = pres.addSlide({ masterName: 'CLARO', sectionTitle: 'Problema' });
s.addText('El laboratorio y la conexión llegan despacio, el teléfono ya está', { placeholder: 'title' });
[['44 M$', 'contrato de internet para 3.102 escuelas (junio de 2025)', C.accent3], ['73', 'centros de media alcanza la licitación de laboratorios de 28,9 millones de dólares (abril de 2026)', C.accent5], ['17,3', 'clientes de internet fijo por cada 100 habitantes (ASEP, 2024)', C.accent4]].forEach((c, i) => {
  const x = 0.5 + i * 3.1;
  s.addShape(pres.ShapeType.roundRect, { x, y: 1.5, w: 2.85, h: 2.55, rectRadius: 0.12, fill: { color: C.background2 }, line: { color: C.background2 }, objectName: 'Tarjeta ' + (i + 1) });
  s.addText(c[0], { x: x + 0.2, y: 1.65, w: 2.45, h: 1.0, fontSize: 44, bold: true, color: c[2], margin: 0, valign: 'middle', isTextBox: true, objectName: 'Cifra ' + (i + 1) });
  s.addText(c[1], { x: x + 0.2, y: 2.7, w: 2.45, h: 1.25, fontSize: 14, color: C.text1, margin: 0, valign: 'top', isTextBox: true, objectName: 'Etiqueta ' + (i + 1) });
});
s.addText('Un laboratorio en el teléfono llega antes y no necesita conexión', { x: 0.5, y: 4.25, w: 9, h: 0.6, fontSize: 20, bold: true, color: C.text1, margin: 0, isTextBox: true, objectName: 'Mensaje' });
nota(s, 'Fuentes: La Prensa (11/6/2025 y 2/4/2026); ASEP, internet fijo 2024 (estimado). Sin porcentaje oficial reciente de escuelas conectadas o con laboratorio.');
s.addNotes(notas());

// ---------- 4. Idea ----------
pres.addSection({ title: 'Solución' });
s = pres.addSlide({ masterName: 'CLARO', sectionTitle: 'Solución' });
s.addText('Nuestra idea: predice, formula, juega, descubre', { placeholder: 'title' });
[['1', 'Predice', 'Antes de jugar, el niño dice qué cree que pasará', C.accent3], ['2', 'Formula', 'Arma su hipótesis: «si cambio ___, entonces ___ porque ___»', C.accent2], ['3', 'Experimenta', 'Usa el teléfono como instrumento y haz una prueba justa', C.accent5], ['4', 'Descubre', 'Compara con sus propios datos, concluye y lo anota en su cuaderno', C.accent4]].forEach((p, i) => {
  const y = 1.35 + i * 0.9;
  s.addText(p[0], { x: 0.5, y, w: 0.65, h: 0.65, fontSize: 24, bold: true, color: C.background1, fill: { color: p[3] }, align: 'center', valign: 'middle', shape: pres.ShapeType.ellipse, margin: 0, isTextBox: true, objectName: 'Número ' + p[0] });
  s.addText([{ text: p[1], options: { fontSize: 20, bold: true, color: C.text1, breakLine: true } }, { text: p[2], options: { fontSize: 13, color: C.text1 } }], { x: 1.35, y: y - 0.08, w: 5.0, h: 0.85, margin: 0, valign: 'middle', isTextBox: true, objectName: 'Paso ' + p[0] });
});
telefono(s, 'hilo-hipotesis.png', 7.2, 1.4, 3.6, 'hipótesis del experimento');
nota(s, 'Predecir, observar y explicar: un metaanálisis de 2024 con 35 estudios encontró un efecto alto en el rendimiento en ciencias (Koyunlu Ünlü, 2024).');
s.addNotes(notas());

// ---------- 5. Seis juegos ----------
s = pres.addSlide({ masterName: 'CLARO', sectionTitle: 'Solución' });
s.addText('Seis juegos, cuatro experimentos y un laboratorio libre', { placeholder: 'title' });
const juegos = [
  ['🎢', 'La rampa', 'Inclinación', 'Doblar el ángulo no reduce el tiempo a la mitad', C.accent5],
  ['⏱', 'El péndulo', 'Táctil', 'Solo importa el largo del hilo, no el peso', C.accent2],
  ['🎤', 'La voz y el globo', 'Micrófono', 'Más agudo, más vibraciones por segundo', C.accent3],
  ['🎈', 'El globo largo', 'Micrófono', 'Una vocal sostenida mantiene el tono casi plano', C.accent4],
  ['🌈', 'Luz y color', 'Cámara', 'Los objetos devuelven su color; las sombras tapan la luz', C.accent6],
  ['🫧', 'Burbujas mágicas', 'Cámara', 'Una cámara detecta movimiento comparando fotos', C.accent1],
];
juegos.forEach((j, i) => {
  const x = 0.5 + (i % 3) * 3.05, y = 1.4 + Math.floor(i / 3) * 1.7;
  s.addShape(pres.ShapeType.roundRect, { x, y, w: 2.85, h: 1.55, rectRadius: 0.12, fill: { color: C.background2 }, line: { color: C.background2 }, objectName: 'Tarjeta ' + j[1] });
  s.addShape(pres.ShapeType.ellipse, { x: x + 0.15, y: y + 0.15, w: 0.7, h: 0.7, fill: { color: j[4] }, line: { color: j[4] }, objectName: 'Fondo icono ' + j[1] });
  s.addImage({ path: IMG + '/icono-' + (i + 1) + '.png', x: x + 0.25, y: y + 0.25, w: 0.5, h: 0.5, objectName: 'Icono ' + j[1], altText: 'Icono del juego ' + j[1] });
  s.addText([{ text: j[1], options: { bold: true, fontSize: 16, color: C.text1, breakLine: true } }, { text: j[2], options: { fontSize: 12, color: C.text2 } }], { x: x + 0.95, y: y + 0.15, w: 1.8, h: 0.7, margin: 0, valign: 'middle', isTextBox: true, objectName: 'Nombre ' + j[1] });
  s.addText(j[3], { x: x + 0.15, y: y + 0.92, w: 2.55, h: 0.62, fontSize: 13, color: C.text1, margin: 0, valign: 'top', isTextBox: true, objectName: 'Idea ' + j[1] });
});
s.addText('+ Experimentos con materiales de casa (péndulo, col morada, huevo con sal, volcán), Mi laboratorio (juego libre con 24 descubrimientos) y, para docentes, «Mis alumnos»: el alumno muestra un QR y el docente lo escanea, sin internet.', { x: 0.5, y: 4.78, w: 9, h: 0.6, fontSize: 12, italic: true, color: C.text1, margin: 0, isTextBox: true, objectName: 'Aviso' });
s.addNotes(notas());

// ---------- 6b. Docentes ----------
s = pres.addSlide({ masterName: 'CLARO', sectionTitle: 'Solución' });
s.addText('Para docentes: el avance de la clase, sin internet', { placeholder: 'title' });
[['1', 'Alumno', 'Menú → «Compartir con mi docente» y muestra su código QR', C.accent3], ['2', 'Docente', 'Menú → «Mis alumnos» y escanea el QR; uno detrás de otro', C.accent2], ['3', 'Resultado', 'Estrellas, aciertos y qué juego le cuesta a cada alumno', C.accent4]].forEach((p, i) => {
  const y = 1.35 + i * 0.95;
  s.addText(p[0], { x: 0.5, y, w: 0.6, h: 0.6, fontSize: 22, bold: true, color: C.background1, fill: { color: p[3] }, align: 'center', valign: 'middle', shape: pres.ShapeType.ellipse, margin: 0, isTextBox: true, objectName: 'Número ' + p[0] });
  s.addText([{ text: p[1], options: { fontSize: 18, bold: true, color: C.text1, breakLine: true } }, { text: p[2], options: { fontSize: 13, color: C.text1 } }], { x: 1.25, y: y - 0.08, w: 3.2, h: 0.85, margin: 0, valign: 'middle', isTextBox: true, objectName: 'Paso docente ' + p[0] });
});
s.addText('No viajan la fecha de nacimiento, los apoyos ni la voz. QR y no Bluetooth: funciona en cualquier teléfono con cámara, sin emparejar.', { x: 0.5, y: 4.2, w: 3.95, h: 0.75, fontSize: 11.5, italic: true, color: C.text1, margin: 0, valign: 'top', isTextBox: true, objectName: 'Privacidad' });
[['clase-qr.png', 'La alumna muestra su QR'], ['clase-escaneo.png', 'El docente lo escanea'], ['clase-lista.png', 'Su lista, en su teléfono']].forEach((t, i) => {
  const x = 4.75 + i * 1.65;
  telefono(s, t[0], x, 1.4, 3.05, t[1]);
  s.addText(t[1], { x: x - 0.12, y: 4.6, w: 1.5, h: 0.45, fontSize: 11, bold: true, color: C.text1, align: 'center', valign: 'top', margin: 0, isTextBox: true, objectName: 'Pie docente ' + (i + 1) });
});
nota(s, 'Código de unos 100 caracteres, sin servidor ni cuentas; la lista vive solo en el teléfono del docente. Detalle y límites: docs/clase-sincronizacion.md.');
s.addNotes(notas());

// ---------- 7. Inclusión ----------
s = pres.addSlide({ masterName: 'CLARO', sectionTitle: 'Solución' });
s.addText('Para todos los niños', { placeholder: 'title' });
s.addText([{ text: '17,1 %', options: { fontSize: 40, bold: true, color: C.accent3 } }, { text: '  de los niños de 2 a 14 años en Panamá tiene alguna discapacidad (ENDIS-2)', options: { fontSize: 13, color: C.text1 } }], { x: 0.5, y: 1.25, w: 6.4, h: 0.8, margin: 0, valign: 'middle', isTextBox: true, objectName: 'Dato discapacidad' });
s.addText('Punto de partida por edad; después aprende de cada niño', { x: 0.5, y: 2.1, w: 6.4, h: 0.3, fontSize: 12, bold: true, color: C.text1, margin: 0, isTextBox: true, objectName: 'Título edades' });
[['6 años o menos', '×1,8'], ['7 y 8', '×1,4'], ['9 y 10', '×1,15'], ['11 a 13', '×1,0'], ['14 o más', '×0,8']].forEach((e, i) => {
  s.addText([{ text: e[1], options: { bold: true, fontSize: 15, color: C.text1, breakLine: true } }, { text: e[0], options: { fontSize: 10, color: C.text2 } }], { x: 0.5 + i * 1.3, y: 2.42, w: 1.22, h: 0.62, fill: { color: C.background2 }, align: 'center', valign: 'middle', shape: pres.ShapeType.roundRect, rectRadius: 0.08, margin: 0.03, isTextBox: true, objectName: 'Edad ' + (i + 1) });
});
s.addText([
  { text: 'Voz: micrófono más sensible, margen ancho y sin límite de tiempo', options: { bullet: true, breakLine: true } },
  { text: 'Oír: cada tic y tac también se ve; la vibración sigue activa', options: { bullet: true, breakLine: true } },
  { text: 'Ver: alto contraste, texto grande y símbolos además del color', options: { bullet: true, breakLine: true } },
  { text: 'Concentrarme: modo calma, pausa para descansar y más margen', options: { bullet: true, breakLine: true } },
  { text: 'Leer o los números: texto grande y lectura en voz alta', options: { bullet: true, breakLine: true } },
  { text: 'Mover las manos: botones grandes, «+» y «−» y barra en vez de inclinar', options: { bullet: true, breakLine: true } },
  { text: 'Luces o ruidos: sin destellos ni sacudidas, sonidos suaves y avisos', options: { bullet: true } },
], { x: 0.5, y: 3.12, w: 6.4, h: 1.95, fontSize: 11.5, color: C.text1, paraSpaceAfter: 2, margin: 0, valign: 'top', isTextBox: true, objectName: 'Siete apoyos' });
telefono(s, 'ajustes.png', 7.4, 1.4, 3.5, 'ajustes');
nota(s, 'Fuentes: UNICEF Panamá (8/9/2026), ENDIS-2: 174.701 niñas y niños de 2 a 14 años. Apoyos según Game Accessibility Guidelines y Xbox 118 (2026). Nunca vuelve imposible un reto; sin diagnósticos.');

s.addNotes(notas());

// ---------- 7. IA ----------
s = pres.addSlide({ masterName: 'CLARO', sectionTitle: 'Solución' });
s.addText('IA pequeña, ética y sin conexión', { placeholder: 'title' });
['Tutor bayesiano: qué ideas domina', 'Diagnóstico: qué idea equivocada delata cada respuesta', 'Pistas con tus datos y bandido de Thompson'].forEach((t, i) => {
  const x = 0.5 + i * 2.05;
  s.addText(t, { x, y: 1.45, w: 1.75, h: 1.2, fontSize: 13, bold: true, color: i === 1 ? C.text1 : C.background1, fill: { color: i === 1 ? C.accent2 : C.text1 }, align: 'center', valign: 'middle', shape: pres.ShapeType.roundRect, rectRadius: 0.12, margin: 0.08, isTextBox: true, objectName: 'Pieza ' + (i + 1) });
  if (i < 2) s.addShape(pres.ShapeType.rightArrow, { x: x + 1.78, y: 1.9, w: 0.24, h: 0.3, fill: { color: C.accent1 }, line: { color: C.accent1 }, objectName: 'Flecha ' + (i + 1) });
});
['Sin internet y sin enviar datos', 'No es IA generativa: no inventa texto', 'El adulto decide: puede apagarla o borrarla', 'No penaliza la voz ni la motricidad'].forEach((t, i) => {
  const x = 0.5 + (i % 2) * 3.05, y = 3.0 + Math.floor(i / 2) * 0.85;
  s.addText(t, { x, y, w: 2.9, h: 0.7, fontSize: 14, color: C.text1, fill: { color: C.background2 }, valign: 'middle', shape: pres.ShapeType.roundRect, rectRadius: 0.1, margin: 0.12, isTextBox: true, objectName: 'Garantía ' + (i + 1) });
});
telefono(s, 'adultos.png', 7.2, 1.4, 3.6, 'panel para adultos');
nota(s, 'Simulación (no piloto): el diagnóstico acierta la idea errónea en ≈ 68 % tras 5 respuestas. Parámetros por defecto, aún sin validar con niños.');
s.addNotes(notas());

// ---------- 8. Datos ----------
pres.addSection({ title: 'Impacto y mercado' });
s = pres.addSlide({ masterName: 'CLARO', sectionTitle: 'Impacto y mercado' });
s.addText('Datos del proyecto', { placeholder: 'title' });
[['≈ 220 KB', 'primera carga comprimida (593 KB sin comprimir)', C.accent1], ['2', 'librerías pequeñas, solo para el QR de la clase', C.accent4], ['528', 'comprobaciones automáticas sin fallos', C.accent6], ['0,4 ms', 'la IA por partida, con la CPU 6× más lenta', C.accent5]].forEach((d, i) => {
  const x = 0.5 + (i % 2) * 2.55, y = 1.4 + Math.floor(i / 2) * 1.75;
  s.addShape(pres.ShapeType.roundRect, { x, y, w: 2.4, h: 1.6, rectRadius: 0.12, fill: { color: C.background2 }, line: { color: C.background2 }, objectName: 'Tarjeta dato ' + (i + 1) });
  s.addText(d[0], { x: x + 0.15, y: y + 0.1, w: 2.1, h: 0.8, fontSize: 36, bold: true, color: C.text1, margin: 0, valign: 'middle', isTextBox: true, objectName: 'Dato ' + (i + 1) });
  s.addText(d[1], { x: x + 0.15, y: y + 0.9, w: 2.1, h: 0.62, fontSize: 13, color: C.text1, margin: 0, valign: 'top', isTextBox: true, objectName: 'Dato etiqueta ' + (i + 1) });
});
s.addText([{ text: 'Lo que respalda la literatura (2024)', options: { bold: true, fontSize: 18, color: C.text1, breakLine: true } },
  { text: 'Predecir, observar y explicar: g = 0,98 en ciencias (35 estudios)', options: { bullet: true, breakLine: true } },
  { text: 'Juegos digitales en STEM de primaria: efectos positivos (18 estudios)', options: { bullet: true, breakLine: true } },
  { text: 'Laboratorios virtuales: g = 0,69 (46 estudios), sin sustituir del todo al práctico', options: { bullet: true } }],
  { x: 5.75, y: 1.4, w: 3.75, h: 2.5, fontSize: 13, color: C.text1, paraSpaceAfter: 6, margin: 0, valign: 'top', isTextBox: true, objectName: 'Literatura' });
s.addText('Probada en un teléfono: funciona. Las mediciones de rendimiento son de Chromium con la CPU limitada.', { x: 5.75, y: 3.95, w: 3.75, h: 0.9, fontSize: 13, bold: true, color: C.text1, fill: { color: C.accent2 }, valign: 'middle', shape: pres.ShapeType.roundRect, rectRadius: 0.1, margin: 0.12, isTextBox: true, objectName: 'Aviso teléfono' });
nota(s, 'Medición propia del 4/11/2026 (versión 1.3.0). Fuentes: Koyunlu Ünlü (2024); Behnamnia et al. (2024); Li y Liang (2024).');
s.addNotes(notas());

// ---------- 9. ODS ----------
s = pres.addSlide({ masterName: 'CLARO', sectionTitle: 'Impacto y mercado' });
s.addText('Impacto: contribuimos a tres ODS', { placeholder: 'title' });
[['4', 'C5192D', 'Educación de calidad', 'Metas 4.1, 4.5 y 4.a: aprendizaje pertinente, acceso para la niñez vulnerable y entornos de aprendizaje inclusivos'], ['10', 'DD1367', 'Reducción de las desigualdades', 'Meta 10.2: promover la inclusión de todas las personas, sin importar la edad ni la discapacidad'], ['9', 'F36D25', 'Industria, innovación e infraestructura', 'Meta 9.c: aumentar el acceso a las TIC, aprovechando el acceso móvil sin exigir conexión']].forEach((o, i) => {
  const x = 0.5 + i * 3.1;
  s.addShape(pres.ShapeType.roundRect, { x, y: 1.45, w: 2.85, h: 3.35, rectRadius: 0.12, fill: { color: C.background2 }, line: { color: C.background2 }, objectName: 'Tarjeta ODS ' + o[0] });
  s.addText(o[0], { x: x + 0.2, y: 1.65, w: 0.95, h: 0.95, fontSize: 40, bold: true, color: 'FFFFFF', fill: { color: o[1] }, align: 'center', valign: 'middle', margin: 0, isTextBox: true, objectName: 'Insignia ODS ' + o[0] });
  s.addText(o[2], { x: x + 0.2, y: 2.75, w: 2.45, h: 0.75, fontSize: 17, bold: true, color: C.text1, margin: 0, valign: 'top', isTextBox: true, objectName: 'Nombre ODS ' + o[0] });
  s.addText(o[3], { x: x + 0.2, y: 3.5, w: 2.45, h: 1.2, fontSize: 13, color: C.text1, margin: 0, valign: 'top', isTextBox: true, objectName: 'Meta ODS ' + o[0] });
});
nota(s, 'Textos de las metas: Naciones Unidas (sdgs.un.org), traducción propia. También alineado con la misión de ProFuturo: contenido sin internet, inclusión y medición de impacto.');
s.addNotes(notas());

// ---------- 10. Mercado ----------
s = pres.addSlide({ masterName: 'CLARO', sectionTitle: 'Impacto y mercado' });
s.addText('Mercado: hay quién lo necesita y quién lo financia', { placeholder: 'title' });
s.addChart(pres.charts.BAR, [{ name: 'Costo por alumno (balboas)', labels: ['2020', '2021', '2022', '2023', '2024'], values: [2286.94, 2234.42, 2222.75, 2344.39, 2261.56] }], {
  x: 0.5, y: 1.4, w: 4.1, h: 3.5, barDir: 'col', chartColors: [HEX.sky], showValue: true, dataLabelPosition: 'outEnd', dataLabelFormatCode: '#,##0', dataLabelColor: HEX.navy, dataLabelFontSize: 12, dataLabelFontBold: true,
  showTitle: true, title: 'Costo por alumno del Gobierno Central (balboas)', titleFontSize: 14, titleColor: HEX.navy, catAxisLabelColor: HEX.navy, catAxisLabelFontSize: 13, valAxisHidden: true, valGridLine: { style: 'none' }, catGridLine: { style: 'none' }, showLegend: false, valAxisMinVal: 0, valAxisMaxVal: 3000,
});
s.addText([
  { text: 'Quién paga: no los niños', options: { bold: true, fontSize: 16, color: C.text1, breakLine: true } },
  { text: 'Ministerio de Educación, fundaciones y programas como ProFuturo, redes de escuelas y terapeutas de voz', options: { fontSize: 14, color: C.text1, breakLine: true, paraSpaceAfter: 8 } },
  { text: 'Modelo', options: { bold: true, fontSize: 16, color: C.text1, breakLine: true } },
  { text: 'Núcleo abierto y gratuito, más servicios: adaptación por país, packs de experimentos, formación docente y edición para terapeutas', options: { fontSize: 14, color: C.text1, breakLine: true, paraSpaceAfter: 8 } },
  { text: 'Señales', options: { bold: true, fontSize: 16, color: C.text1, breakLine: true } },
  { text: '44 M$ en internet escolar (2025) y 28,9 M$ en laboratorios (2026). Región Educativa de Veraguas: 54.708 estudiantes en el sistema oficial (2024)', options: { fontSize: 14, color: C.text1 } },
], { x: 4.9, y: 1.4, w: 4.6, h: 3.5, margin: 0, valign: 'top', isTextBox: true, objectName: 'Modelo de mercado' });
nota(s, 'Fuentes: INEC/Contraloría, cuadro 19 (30/1/2026; 2024 preliminar); La Prensa (11/6/2025 y 2/4/2026); Meduca (2024). Son hipótesis, sin cifras de mercado.');
s.addNotes(notas());

// ---------- 11. Cierre ----------
s = pres.addSlide({ masterName: 'OSCURO', sectionTitle: 'Impacto y mercado' });
s.addText('Lo que proponemos', { x: 0.6, y: 0.5, w: 6, h: 0.8, fontSize: 36, bold: true, color: C.background1, margin: 0, isTextBox: true, objectName: 'Título' });
['Un piloto en Veraguas con la UTP, ProFuturo y el Meduca', 'Probarlo con niños y docentes, en teléfonos de gama baja', 'Portugués e inglés, para el alcance de ProFuturo'].forEach((t, i) => {
  const y = 1.5 + i * 0.85;
  s.addText(String(i + 1), { x: 0.6, y, w: 0.6, h: 0.6, fontSize: 22, bold: true, color: C.text1, fill: { color: C.accent2 }, align: 'center', valign: 'middle', shape: pres.ShapeType.ellipse, margin: 0, isTextBox: true, objectName: 'Número ' + (i + 1) });
  s.addText(t, { x: 1.4, y: y - 0.05, w: 5.2, h: 0.7, fontSize: 18, color: C.background1, margin: 0, valign: 'middle', isTextBox: true, objectName: 'Propuesta ' + (i + 1) });
});
s.addText('Cada teléfono, un laboratorio', { x: 0.6, y: 4.1, w: 6.2, h: 0.6, fontSize: 28, bold: true, color: C.accent2, margin: 0, isTextBox: true, objectName: 'Lema' });
s.addText([{ text: 'Web: danielvaldess.github.io/chispa-lab', options: { breakLine: true } }, { text: 'APK y código: github.com/danielvaldess/chispa-lab' }], { x: 0.6, y: 4.7, w: 6.4, h: 0.65, fontSize: 13, color: C.accent1, margin: 0, valign: 'top', isTextBox: true, objectName: 'Enlaces' });
telefono(s, 'final.png', 7.35, 0.55, 4.5, 'final de la estación');
s.addNotes(notas());

(async () => {
  await pres.writeFile({ fileName: process.env.SALIDA });
  await applyTheme(process.env.SALIDA, THEME);
  console.log('deck listo');
})();
