const pptxgen = require('pptxgenjs');
const fs = require('fs'), path = require('path');
// Las notas del orador salen de guion.md (una sección «## n. Título» por diapositiva, en el mismo orden).
const NOTAS = fs.readFileSync(path.join(__dirname, 'guion.md'), 'utf8').split(/^## \d+\. .*$/m).slice(1).map((t) => t.trim());
let _nota = 0; const notas = () => NOTAS[_nota++];
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
s.addText([{ text: 'Reto 17 · #hack4edu 2026', options: { breakLine: true } }, { text: 'Daniel Valdés · UTP, Centro Regional de Veraguas' }], { x: 0.6, y: 3.2, w: 5.6, h: 0.8, fontSize: 16, color: C.background1, margin: 0, isTextBox: true, objectName: 'Autoría' });
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
s.addChart(pres.charts.BAR, [{ name: 'Estudiantes en el nivel más bajo (%)', labels: ['Panamá', 'Resto de los países'], values: [48.1, 37.7] }], {
  x: 0.5, y: 1.4, w: 4.7, h: 3.5, barDir: 'col', chartColors: [HEX.pink, HEX.sky], showValue: true, dataLabelPosition: 'outEnd', dataLabelFormatCode: '0.0"%"', dataLabelColor: HEX.navy, dataLabelFontSize: 16, dataLabelFontBold: true,
  showTitle: true, title: 'Estudiantes en el nivel de desempeño más bajo (%)', titleFontSize: 14, titleColor: HEX.navy, catAxisLabelColor: HEX.navy, catAxisLabelFontSize: 14, valAxisHidden: true, valGridLine: { style: 'none' }, catGridLine: { style: 'none' }, showLegend: false, valAxisMaxVal: 60, valAxisMinVal: 0, varyColors: true,
});
s.addText([{ text: '672', options: { fontSize: 54, bold: true, color: C.accent3, breakLine: true } }, { text: 'puntos de Panamá en Ciencias de 6.º grado', options: { fontSize: 14, color: C.text1 } }], { x: 5.7, y: 1.4, w: 3.8, h: 1.5, margin: 0, isTextBox: true, objectName: 'Dato Panamá' });
s.addText([{ text: '702', options: { fontSize: 54, bold: true, color: C.text2, breakLine: true } }, { text: 'es el promedio de la región', options: { fontSize: 14, color: C.text1 } }], { x: 5.7, y: 2.95, w: 3.8, h: 1.5, margin: 0, isTextBox: true, objectName: 'Dato región' });
s.addText('Los estudiantes de pueblos originarios obtienen resultados más bajos.', { x: 5.7, y: 4.4, w: 3.8, h: 0.6, fontSize: 14, italic: true, color: C.text1, margin: 0, isTextBox: true, objectName: 'Nota' });
nota(s, 'Fuente: UNESCO, ERCE 2019 (comunicado del 30 de noviembre de 2021). La diferencia de 30 puntos es estadísticamente significativa.');
s.addNotes(notas());

// ---------- 3. Acceso ----------
s = pres.addSlide({ masterName: 'CLARO', sectionTitle: 'Problema' });
s.addText('El laboratorio y la conexión llegan despacio, el teléfono ya está', { placeholder: 'title' });
[['45 %', 'de los centros públicos no tenía internet (informe del Meduca, 2022)', C.accent3], ['73', 'escuelas alcanza la licitación de laboratorios de 28,9 millones de dólares (2026)', C.accent5], ['156,6', 'líneas móviles por cada 100 personas (2023)', C.accent4]].forEach((c, i) => {
  const x = 0.5 + i * 3.1;
  s.addShape(pres.ShapeType.roundRect, { x, y: 1.5, w: 2.85, h: 2.55, rectRadius: 0.12, fill: { color: C.background2 }, line: { color: C.background2 }, objectName: 'Tarjeta ' + (i + 1) });
  s.addText(c[0], { x: x + 0.2, y: 1.65, w: 2.45, h: 1.0, fontSize: 44, bold: true, color: c[2], margin: 0, valign: 'middle', isTextBox: true, objectName: 'Cifra ' + (i + 1) });
  s.addText(c[1], { x: x + 0.2, y: 2.7, w: 2.45, h: 1.25, fontSize: 14, color: C.text1, margin: 0, valign: 'top', isTextBox: true, objectName: 'Etiqueta ' + (i + 1) });
});
s.addText('Un laboratorio en el teléfono llega antes y no necesita conexión', { x: 0.5, y: 4.25, w: 9, h: 0.6, fontSize: 20, bold: true, color: C.text1, margin: 0, isTextBox: true, objectName: 'Mensaje' });
nota(s, 'Fuentes: La Estrella (26/11/2022, cita un informe del Meduca); La Prensa (2/4/2026); Banco Mundial (2023). Las cifras de conectividad son anteriores a los contratos recientes.');
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
s.addText('+ Experimentos con materiales de casa (péndulo, col morada, huevo con sal, volcán) y Mi laboratorio, un juego libre con 24 descubrimientos.', { x: 0.5, y: 4.85, w: 9, h: 0.5, fontSize: 12, italic: true, color: C.text1, margin: 0, isTextBox: true, objectName: 'Aviso' });
s.addNotes(notas());

// ---------- 6. Inclusión ----------
s = pres.addSlide({ masterName: 'CLARO', sectionTitle: 'Solución' });
s.addText('Para todos los niños', { placeholder: 'title' });
s.addText([{ text: '17,1 %', options: { fontSize: 54, bold: true, color: C.accent3, breakLine: true } }, { text: 'de los niños de 2 a 14 años en Panamá tiene alguna discapacidad (ENDIS-2)', options: { fontSize: 14, color: C.text1 } }], { x: 0.5, y: 1.35, w: 5.6, h: 1.55, margin: 0, isTextBox: true, objectName: 'Dato discapacidad' });
s.addText([
  { text: '7 apoyos opcionales: voz, oír, ver, concentrarme, leer, mover las manos y sensibilidad a luces o ruidos', options: { bullet: true, breakLine: true } },
  { text: 'La dificultad se adapta a la edad y nunca es imposible', options: { bullet: true, breakLine: true } },
  { text: 'Modo calma, alto contraste, texto grande y lectura en voz alta', options: { bullet: true, breakLine: true } },
  { text: 'No se piden diagnósticos; un adulto confirma y todo se queda en el teléfono', options: { bullet: true } },
], { x: 0.5, y: 3.0, w: 5.7, h: 2.0, fontSize: 14, color: C.text1, paraSpaceAfter: 6, margin: 0, valign: 'top', isTextBox: true, objectName: 'Inclusión' });
telefono(s, 'ajustes.png', 7.2, 1.4, 3.6, 'ajustes');
nota(s, 'Fuente: UNICEF Panamá, 8 de septiembre de 2026 (ENDIS-2, SENADIS e INEC): 174.701 niñas y niños de 2 a 14 años con discapacidad.');
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
[['≈ 155 KB', 'primera carga comprimida (411 KB sin comprimir)', C.accent1], ['0', 'librerías externas', C.accent4], ['450+', 'comprobaciones automáticas sin fallos', C.accent6], ['0,4 ms', 'la IA por partida, con la CPU 6× más lenta', C.accent5]].forEach((d, i) => {
  const x = 0.5 + (i % 2) * 2.55, y = 1.4 + Math.floor(i / 2) * 1.75;
  s.addShape(pres.ShapeType.roundRect, { x, y, w: 2.4, h: 1.6, rectRadius: 0.12, fill: { color: C.background2 }, line: { color: C.background2 }, objectName: 'Tarjeta dato ' + (i + 1) });
  s.addText(d[0], { x: x + 0.15, y: y + 0.1, w: 2.1, h: 0.8, fontSize: 36, bold: true, color: C.text1, margin: 0, valign: 'middle', isTextBox: true, objectName: 'Dato ' + (i + 1) });
  s.addText(d[1], { x: x + 0.15, y: y + 0.9, w: 2.1, h: 0.62, fontSize: 13, color: C.text1, margin: 0, valign: 'top', isTextBox: true, objectName: 'Dato etiqueta ' + (i + 1) });
});
s.addText([{ text: 'Lo que respalda la literatura', options: { bold: true, fontSize: 18, color: C.text1, breakLine: true } },
  { text: 'Predecir, observar y explicar: efecto alto en ciencias (metaanálisis, 2024)', options: { bullet: true, breakLine: true } },
  { text: 'Juegos serios frente a la enseñanza convencional: d = 0,29 (77 estudios)', options: { bullet: true, breakLine: true } },
  { text: 'Laboratorios virtuales comparables a los reales, mejores si se combinan', options: { bullet: true } }],
  { x: 5.75, y: 1.4, w: 3.75, h: 3.3, fontSize: 14, color: C.text1, paraSpaceAfter: 6, margin: 0, valign: 'top', isTextBox: true, objectName: 'Literatura' });
nota(s, 'Medición propia en Chromium con la CPU limitada, no en un teléfono real. Fuentes: Koyunlu Ünlü (2024), Wouters et al. (2013), Fadda et al. (2022).');
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
s.addChart(pres.charts.BAR, [{ name: 'Gasto público en educación (% del PIB)', labels: ['2019', '2020', '2021', '2022', '2023'], values: [3.28, 4.30, 3.71, 3.38, 2.47] }], {
  x: 0.5, y: 1.4, w: 4.1, h: 3.5, barDir: 'col', chartColors: [HEX.sky], showValue: true, dataLabelPosition: 'outEnd', dataLabelFormatCode: '0.00', dataLabelColor: HEX.navy, dataLabelFontSize: 13, dataLabelFontBold: true,
  showTitle: true, title: 'Gasto público en educación (% del PIB)', titleFontSize: 14, titleColor: HEX.navy, catAxisLabelColor: HEX.navy, catAxisLabelFontSize: 13, valAxisHidden: true, valGridLine: { style: 'none' }, catGridLine: { style: 'none' }, showLegend: false, valAxisMinVal: 0, valAxisMaxVal: 5,
});
s.addText([
  { text: 'Quién paga: no los niños', options: { bold: true, fontSize: 16, color: C.text1, breakLine: true } },
  { text: 'Ministerio de Educación, fundaciones y programas como ProFuturo, redes de escuelas y terapeutas de voz', options: { fontSize: 14, color: C.text1, breakLine: true, paraSpaceAfter: 8 } },
  { text: 'Modelo', options: { bold: true, fontSize: 16, color: C.text1, breakLine: true } },
  { text: 'Núcleo abierto y gratuito, más servicios: adaptación por país, packs de experimentos, formación docente y edición para terapeutas', options: { fontSize: 14, color: C.text1, breakLine: true, paraSpaceAfter: 8 } },
  { text: 'Señales', options: { bold: true, fontSize: 16, color: C.text1, breakLine: true } },
  { text: '44 M$ en internet escolar, 28,9 M$ en laboratorios; en una fase inicial ProFuturo y el Meduca llegaron a 28 escuelas de Veraguas', options: { fontSize: 14, color: C.text1 } },
], { x: 4.9, y: 1.4, w: 4.6, h: 3.5, margin: 0, valign: 'top', isTextBox: true, objectName: 'Modelo de mercado' });
nota(s, 'Fuentes: Banco Mundial; La Prensa (2025, 2026); ProFuturo. El presupuesto baja, y una solución de coste casi nulo es más fácil de adoptar. Son hipótesis, sin cifras de mercado.');
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
s.addText('chispalab.sweetcode.studio · github.com/danielvaldess/chispa-lab', { x: 0.6, y: 4.75, w: 6.4, h: 0.4, fontSize: 14, color: C.accent1, margin: 0, isTextBox: true, objectName: 'Enlaces' });
telefono(s, 'final.png', 7.35, 0.55, 4.5, 'final de la estación');
s.addNotes(notas());

(async () => {
  await pres.writeFile({ fileName: process.env.SALIDA });
  await applyTheme(process.env.SALIDA, THEME);
  console.log('deck listo');
})();
