// Presentación de Chispa Lab (13 diapositivas, fondos de color y GIF de la propia app en todas).
// Las notas del orador salen de guion.md (una sección «## n. Título» por diapositiva, en el mismo orden).
// Los nombres del equipo salen de participantes.txt (uno por línea).
// Regenerar: npm install pptxgenjs@3.12.0 en una carpeta aparte y ejecutar con SKILL, IMG, SALIDA y NODE_PATH (ver README.md).
const pptxgen = require('pptxgenjs');
const fs = require('fs'), path = require('path');
const NOTAS = fs.readFileSync(path.join(__dirname, 'guion.md'), 'utf8').split(/^## \d+\. .*$/m).slice(1).map((t) => t.split(/\n---/)[0].trim());
const _pf = path.join(__dirname, 'participantes.txt');
const PART = fs.existsSync(_pf) ? fs.readFileSync(_pf, 'utf8').split('\n').map((t) => t.trim()).filter(Boolean) : [];
const EQUIPO = PART.length ? PART.join(' · ') : '[Nombres de los integrantes: escribirlos en participantes.txt]';
let _nota = 0; const notas = () => NOTAS[_nota++].replace('[NOMBRES DEL EQUIPO]', PART.length ? PART.join(', ') : '[NOMBRES DEL EQUIPO]');
const { applyTheme } = require(process.env.SKILL + '/scripts/apply_theme.js');
const IMG = process.env.IMG;                       // fondos e imágenes
const GIF = path.join(__dirname, 'gif');           // GIF de la app (uno por vídeo 01–10; se animan al presentar)

const K = { navy: '1D2250', white: 'FFFFFF', yellow: 'FFD23F', pink: 'FF3D8B', cyan: '22D3EE', green: '2FE29B', orange: 'FF8A3D', violet: '7B4DFF', cream: 'FFF8E1' };
const THEME = { name: 'Chispa Lab', headFontFace: 'Calibri', bodyFontFace: 'Calibri',
  colors: { dk1: '1D2250', lt1: 'FFFFFF', dk2: '5B2EE6', lt2: 'FFF3C4', accent1: '22D3EE', accent2: 'FFD23F', accent3: 'FF3D8B', accent4: '2FE29B', accent5: 'FF8A3D', accent6: '7B4DFF', hlink: '5B2EE6', folHlink: '7B4DFF' } };
const pres = new pptxgen();
pres.layout = 'LAYOUT_16x9';
pres.theme = { headFontFace: 'Calibri', bodyFontFace: 'Calibri' };
pres.title = 'Chispa Lab: un laboratorio de ciencias en cada teléfono';
pres.author = 'Daniel Valdés';
pres.subject = '#hack4edu 2026, reto 17';

const master = (title, fondo, color) => pres.defineSlideMaster({ title, background: { path: IMG + '/fondo-' + fondo + '.jpg' },
  slideNumber: { x: 9.2, y: 5.2, w: 0.5, h: 0.3, fontSize: 10, color: color, align: 'right' },
  objects: [{ placeholder: { options: { name: 'title', type: 'title', x: 0.5, y: 0.25, w: 9, h: 0.95, fontSize: 30, bold: true, color: color, valign: 'middle', margin: 0 }, text: '' } }] });
master('CLARO', 'B', K.navy); master('AZUL', 'C', K.white); master('OSCURO', 'A', K.white);

const T = (s, texto, o) => s.addText(texto, Object.assign({ margin: 0, isTextBox: true, color: K.navy }, o));
function telefono(s, gif, x, y, h, nombre, borde) {
  const w = h * 0.4617; // 780x1688
  s.addShape(pres.ShapeType.roundRect, { x: x - 0.08, y: y - 0.08, w: w + 0.16, h: h + 0.16, rectRadius: 0.18, fill: { color: K.navy }, line: { color: borde || K.yellow, width: 3 }, objectName: 'Marco ' + nombre });
  s.addImage({ path: GIF + '/' + gif, x, y, w, h, objectName: 'GIF ' + nombre, altText: 'Vídeo de la app: ' + nombre });
  return w;
}
const pie = (s, t, x, y, w, color) => T(s, t, { x, y, w, h: 0.4, fontSize: 12, bold: true, color: color || K.navy, align: 'center', valign: 'top', objectName: 'Pie ' + t });
const nota = (s, t, color) => T(s, t, { x: 0.5, y: 5.22, w: 8.6, h: 0.3, fontSize: 9, color: color || '4A4F86', valign: 'middle', objectName: 'Fuente' });
const tarjeta = (s, x, y, w, h, borde, nombre) => {
  s.addShape(pres.ShapeType.roundRect, { x, y, w, h, rectRadius: 0.14, fill: { color: K.white }, line: { color: borde, width: 3 }, shadow: { type: 'outer', color: '000000', opacity: 0.18, blur: 6, offset: 3, angle: 90 }, objectName: nombre });
};

// una cifra protagonista: número grande, una frase y una nota
function heroDato(s, cifra, frase, color, y0) {
  tarjeta(s, 0.5, y0 || 1.35, 6.3, 2.5, color, 'Tarjeta dato');
  T(s, cifra, { x: 0.7, y: (y0 || 1.35) + 0.15, w: 5.9, h: 1.3, fontSize: 64, bold: true, color: color, align: 'center', valign: 'middle', objectName: 'Cifra' });
  T(s, frase, { x: 0.8, y: (y0 || 1.35) + 1.45, w: 5.7, h: 0.95, fontSize: 17, color: K.navy, align: 'center', valign: 'top', objectName: 'Frase' });
}
const burbuja = (s, x, y, d, color, nombre) => s.addShape(pres.ShapeType.ellipse, { x, y, w: d, h: d, fill: { color, transparency: 55 }, line: { color, transparency: 100 }, objectName: nombre });

// ---------- 1. Portada ----------
pres.addSection({ title: 'Problema' });
let s = pres.addSlide({ masterName: 'OSCURO', sectionTitle: 'Problema' });
burbuja(s, 5.2, -0.8, 3.0, K.yellow, 'Adorno 1'); burbuja(s, -0.9, 3.9, 2.4, K.cyan, 'Adorno 2'); burbuja(s, 8.6, 3.8, 2.2, K.green, 'Adorno 3');
T(s, 'Chispa Lab', { x: 0.6, y: 0.95, w: 5.8, h: 1.1, fontSize: 60, bold: true, color: K.white, objectName: 'Título' });
T(s, 'Un laboratorio de ciencias en cada teléfono', { x: 0.6, y: 2.1, w: 5.4, h: 0.95, fontSize: 26, bold: true, color: K.yellow, objectName: 'Subtítulo' });
T(s, [{ text: 'Reto 17 · #hack4edu 2026', options: { breakLine: true, bold: true } }, { text: EQUIPO, options: { breakLine: true } }, { text: 'UTP, Centro Regional de Veraguas' }], { x: 0.6, y: 3.2, w: 5.4, h: 0.95, fontSize: 15, color: K.white, objectName: 'Autoría' });
[['Sin internet', K.yellow], ['Inclusivo', K.cyan], ['Código abierto', K.green]].forEach((t, i) => T(s, t[0], { x: 0.6 + i * 1.8, y: 4.4, w: 1.65, h: 0.45, fontSize: 14, bold: true, color: K.navy, fill: { color: t[1] }, align: 'center', valign: 'middle', shape: pres.ShapeType.roundRect, rectRadius: 0.22, objectName: 'Etiqueta ' + t[0] }));
telefono(s, '08.gif', 6.15, 0.55, 4.5, 'registro: estudiante o docente', K.yellow);
telefono(s, '01.gif', 8.35, 1.5, 3.3, 'la rampa', K.cyan);
s.addNotes(notas());

// ---------- 2. Problema: ciencias en Panamá frente a América Latina y Europa ----------
s = pres.addSlide({ masterName: 'CLARO', sectionTitle: 'Problema' });
s.addText('6 de cada 10 estudiantes panameños de 15 años no alcanzan el nivel básico en ciencias', { placeholder: 'title', fontSize: 28 });
tarjeta(s, 0.4, 1.3, 6.55, 3.55, K.pink, 'Tarjeta gráfico');
s.addChart(pres.charts.BAR, [{ name: 'Puntaje en ciencias, PISA 2022', labels: ['Panamá', 'México', 'Colombia', 'Uruguay', 'Chile', 'Unión Europea', 'Promedio OCDE'], values: [388, 410, 411, 435, 444, 480, 485] }], {
  x: 0.5, y: 1.35, w: 6.35, h: 3.45, barDir: 'bar', chartColors: [K.pink, K.cyan, K.cyan, K.cyan, K.cyan, K.violet, K.violet], showValue: true, dataLabelPosition: 'outEnd', dataLabelColor: K.navy, dataLabelFontSize: 13, dataLabelFontBold: true,
  showTitle: true, title: 'Puntaje promedio en ciencias a los 15 años (PISA 2022)', titleFontSize: 13, titleColor: K.navy, catAxisLabelColor: K.navy, catAxisLabelFontSize: 13, catAxisOrientation: 'maxMin', valAxisHidden: true, valGridLine: { style: 'none' }, catGridLine: { style: 'none' }, showLegend: false, valAxisMinVal: 300, valAxisMaxVal: 540,
});
T(s, [{ text: '38 %', options: { bold: true, fontSize: 18, color: K.pink } }, { text: ' alcanza el nivel básico en Panamá; ', options: { fontSize: 12 } }, { text: '76 %', options: { bold: true, fontSize: 18, color: K.violet } }, { text: ' en la OCDE y ', options: { fontSize: 12 } }, { text: '76 %', options: { bold: true, fontSize: 18, color: K.violet } }, { text: ' en la UE', options: { fontSize: 12 } }], { x: 0.5, y: 4.9, w: 6.4, h: 0.4, valign: 'middle', objectName: 'Nivel básico' });
telefono(s, '01.gif', 7.55, 1.15, 3.55, 'la rampa', K.pink);
T(s, 'Ciencias que se descubren jugando', { x: 6.75, y: 4.9, w: 3.0, h: 0.35, fontSize: 11.5, bold: true, color: K.navy, align: 'center', objectName: 'Pie rampa' });
nota(s, 'OCDE: Organización para la Cooperación y el Desarrollo Económicos, que aplica la prueba PISA. Datos de Fundación Exe Colombia (2024), Cyprus Mail (2023), Comisión Europea (2024) y La Prensa (2026a).');
s.addNotes(notas());

// ---------- 3. Pueblos originarios y comarcas ----------
s = pres.addSlide({ masterName: 'CLARO', sectionTitle: 'Problema' });
s.addText('Nacer en una comarca indígena marca lo que se aprende', { placeholder: 'title' });
heroDato(s, '5 vs 9 años', 'de escolaridad: un niño de comarca indígena frente a uno de zona urbana', K.pink);
T(s, 'El ERCE Pospandemia 2025 asocia pertenecer a un pueblo indígena con menores aprendizajes.', { x: 0.5, y: 4.1, w: 6.3, h: 0.8, fontSize: 16, bold: true, color: K.violet, valign: 'top', objectName: 'Apoyo' });
telefono(s, '04.gif', 7.55, 1.15, 3.55, 'el globo y la voz', K.orange);
T(s, 'Sin conexión, con el micrófono', { x: 6.75, y: 4.9, w: 3.0, h: 0.35, fontSize: 11.5, bold: true, color: K.navy, align: 'center', objectName: 'Pie micrófono' });
nota(s, 'Nota. Datos de La Prensa (2026a) y del Ministerio de Educación de Panamá (2025), resumen ejecutivo del ERCE Pospandemia.');
s.addNotes(notas());

// ---------- 4. El laboratorio no llega, el teléfono ya está ----------
s = pres.addSlide({ masterName: 'CLARO', sectionTitle: 'Problema' });
s.addText('El laboratorio no llega, pero el teléfono ya está', { placeholder: 'title' });
heroDato(s, '≈ 150.100 $', 'cuesta cada aula de laboratorio; la licitación de 2026 alcanza 73 centros de media', K.orange);
T(s, 'El teléfono ya está en las manos de las familias. Chispa Lab lo convierte en laboratorio.', { x: 0.5, y: 4.1, w: 6.3, h: 0.8, fontSize: 16, bold: true, color: K.violet, valign: 'top', objectName: 'Mensaje' });
telefono(s, '07.gif', 7.55, 1.15, 3.55, 'Mi laboratorio', K.green);
T(s, 'Mi laboratorio: juego libre', { x: 6.75, y: 4.9, w: 3.0, h: 0.35, fontSize: 11.5, bold: true, color: K.navy, align: 'center', objectName: 'Pie laboratorio' });
nota(s, 'Nota. Cálculo propio: precio de referencia de $28.969.463 ÷ 193 aulas (La Prensa, 2026b), con equipos, insumos, instalación y capacitación.');
s.addNotes(notas());

// ---------- 5. Idea ----------
pres.addSection({ title: 'Solución' });
s = pres.addSlide({ masterName: 'CLARO', sectionTitle: 'Solución' });
s.addText('Nuestra idea: predice, formula, juega, descubre', { placeholder: 'title' });
[['1', 'Predice', 'Antes de jugar, el niño dice qué cree que pasará', K.pink], ['2', 'Formula', 'Arma su hipótesis: «si cambio ___, entonces ___ porque ___»', K.orange], ['3', 'Experimenta', 'Usa el teléfono como instrumento y hace una prueba justa', K.violet], ['4', 'Descubre', 'Compara con sus propios datos y lo anota en su cuaderno', K.green]].forEach((p, i) => {
  const y = 1.35 + i * 0.95;
  T(s, p[0], { x: 0.5, y, w: 0.7, h: 0.7, fontSize: 26, bold: true, color: K.white, fill: { color: p[3] }, align: 'center', valign: 'middle', shape: pres.ShapeType.ellipse, objectName: 'Número ' + p[0] });
  T(s, [{ text: p[1], options: { fontSize: 22, bold: true, color: p[3] === K.green ? '0E9F6E' : p[3], breakLine: true } }, { text: p[2], options: { fontSize: 14, color: K.navy } }], { x: 1.4, y: y - 0.08, w: 5.2, h: 0.9, valign: 'middle', objectName: 'Paso ' + p[0] });
});
telefono(s, '02.gif', 7.3, 1.2, 3.6, 'el péndulo: hipótesis y prueba', K.violet);
nota(s, 'Nota. Predecir-observar-explicar: metaanálisis de 35 estudios, efecto alto en ciencias (Koyunlu Ünlü, 2024).');
s.addNotes(notas());

// ---------- 6. Seis juegos ----------
s = pres.addSlide({ masterName: 'AZUL', sectionTitle: 'Solución' });
s.addText('Seis juegos, cuatro experimentos y un laboratorio libre', { placeholder: 'title' });
[['01.gif', 'La rampa', K.yellow], ['02.gif', 'El péndulo', K.pink], ['03.gif', 'La voz', K.green], ['04.gif', 'El globo', K.orange], ['07.gif', 'Mi laboratorio', K.cyan]].forEach((t, i) => {
  const x = 0.7 + i * 1.8;
  telefono(s, t[0], x, 1.4, 2.8, t[1], t[2]);
  pie(s, t[1], x - 0.2, 4.35, 1.6, K.white);
});
T(s, 'Tres pilares: experimentar · incluir · acompañar al docente. Con materiales de casa: péndulo, col morada, huevo con sal y volcán.', { x: 0.5, y: 4.78, w: 9, h: 0.5, fontSize: 13, bold: true, color: K.white, objectName: 'Aviso' });
s.addNotes(notas());

// ---------- 7. Docentes ----------
s = pres.addSlide({ masterName: 'CLARO', sectionTitle: 'Solución' });
s.addText('Para docentes: el avance de la clase, sin internet', { placeholder: 'title' });
[['1', 'Alumno', 'Menú → «Compartir con mi docente» y muestra su QR', K.pink], ['2', 'Docente', 'Menú → «Mis alumnos» y escanea el QR, uno tras otro', K.orange], ['3', 'Chispa', 'Agrupa la clase y sugiere qué reforzar; el docente decide', K.violet]].forEach((p, i) => {
  const y = 1.35 + i * 1.0;
  T(s, p[0], { x: 0.5, y, w: 0.65, h: 0.65, fontSize: 24, bold: true, color: K.white, fill: { color: p[3] }, align: 'center', valign: 'middle', shape: pres.ShapeType.ellipse, objectName: 'Número ' + p[0] });
  T(s, [{ text: p[1], options: { fontSize: 19, bold: true, color: p[3], breakLine: true } }, { text: p[2], options: { fontSize: 13, color: K.navy } }], { x: 1.3, y: y - 0.08, w: 3.2, h: 0.85, valign: 'middle', objectName: 'Paso ' + p[0] });
});
T(s, 'No viajan la fecha de nacimiento, los apoyos ni la voz. QR y no Bluetooth: sirve en cualquier teléfono con cámara.', { x: 0.5, y: 4.4, w: 3.9, h: 0.7, fontSize: 11.5, italic: true, color: K.navy, objectName: 'Privacidad' });
s.addImage({ path: GIF + '/09.gif', x: 4.65, y: 1.35, w: 3.0, h: 3.0 * 454 / 420, objectName: 'GIF clase con QR', altText: 'Vídeo de la app: la alumna muestra su QR y el docente lo escanea' });
telefono(s, '10.gif', 8.2, 1.35, 3.1, 'agrupar la clase', K.pink);
pie(s, 'QR sin internet', 4.65, 4.75, 3.0); pie(s, 'Agrupa la clase', 7.95, 4.75, 1.75);
nota(s, 'Nota. Elaboración propia: código de unos 100 caracteres, sin servidor ni cuentas; la lista vive solo en el teléfono del docente.');
s.addNotes(notas());

// ---------- 8. Inclusión ----------
s = pres.addSlide({ masterName: 'AZUL', sectionTitle: 'Solución' });
s.addText('Para todos los niños: siete apoyos opcionales', { placeholder: 'title' });
tarjeta(s, 0.5, 1.35, 5.0, 3.5, K.yellow, 'Tarjeta apoyos');
T(s, '1 de cada 6', { x: 0.7, y: 1.45, w: 4.6, h: 0.9, fontSize: 44, bold: true, color: K.pink, align: 'center', valign: 'middle', objectName: 'Cifra' });
T(s, 'niños panameños de 2 a 14 años tiene alguna discapacidad', { x: 0.8, y: 2.35, w: 4.4, h: 0.6, fontSize: 13, color: K.navy, align: 'center', valign: 'top', objectName: 'Frase' });
T(s, [{ text: 'El niño marca lo que le ayuda', options: { bullet: true, breakLine: true } }, { text: 'El juego se adapta: letra grande, voz, calma', options: { bullet: true, breakLine: true } }, { text: 'Nunca es imposible; sin diagnósticos', options: { bullet: true } }], { x: 0.8, y: 3.1, w: 4.4, h: 1.6, fontSize: 14, bold: true, color: K.navy, paraSpaceAfter: 4, valign: 'top', objectName: 'Apoyos' });
telefono(s, '11.gif', 5.95, 1.2, 3.5, 'elige lo que le ayuda', K.green);
telefono(s, '08.gif', 8.05, 1.2, 3.5, 'registro: estudiante o docente', K.yellow);
pie(s, 'Marca lo que le ayuda', 5.65, 4.8, 1.9, K.white); pie(s, 'Estudiante o docente', 7.7, 4.8, 1.9, K.white);
nota(s, 'Nota. Datos de la ENDIS-2 (UNICEF Panamá, 2026).', K.white);
s.addNotes(notas());

// ---------- 9. IA ----------
s = pres.addSlide({ masterName: 'CLARO', sectionTitle: 'Solución' });
s.addText('6 técnicas de IA que aprenden dentro del teléfono', { placeholder: 'title' });
[['Tutor bayesiano', 'qué ideas domina', K.violet], ['Naïve Bayes', 'qué idea errónea tiene', K.pink], ['Bandido de Thompson', 'la mejor pista', K.orange], ['Centroide', 'colores con pocas muestras', K.cyan], ['Margen bayesiano', 'acierta 7 de cada 10', K.green], ['k-means++', 'agrupa la clase', K.yellow]].forEach((t, i) => {
  const x = 0.5 + (i % 3) * 2.1, y = 1.4 + Math.floor(i / 3) * 1.2;
  s.addShape(pres.ShapeType.roundRect, { x, y, w: 1.95, h: 1.05, rectRadius: 0.12, fill: { color: t[2] }, line: { color: t[2] }, shadow: { type: 'outer', color: '000000', opacity: 0.15, blur: 4, offset: 2, angle: 90 }, objectName: 'Técnica ' + (i + 1) });
  T(s, [{ text: t[0], options: { bold: true, fontSize: 14, breakLine: true } }, { text: t[1], options: { fontSize: 11 } }], { x: x + 0.07, y, w: 1.81, h: 1.05, color: (t[2] === K.yellow || t[2] === K.cyan || t[2] === K.green) ? K.navy : K.white, align: 'center', valign: 'middle', objectName: 'Texto técnica ' + (i + 1) });
});
['Sin internet y sin enviar datos', 'El adulto decide'].forEach((t, i) => T(s, '✓ ' + t, { x: 0.5 + i * 3.15, y: 4.0, w: 3.05, h: 0.5, fontSize: 13, bold: true, color: K.navy, fill: { color: K.white }, valign: 'middle', shape: pres.ShapeType.roundRect, rectRadius: 0.1, margin: 0.1, objectName: 'Garantía ' + (i + 1) }));
telefono(s, '10.gif', 7.35, 1.2, 3.6, 'Chispa agrupa la clase', K.pink);
nota(s, 'Nota. Marco ético: Parlamento Europeo y Consejo de la Unión Europea (2024); Miao y Cukurova (2024).');
s.addNotes(notas());

// ---------- 10. Datos ----------
pres.addSection({ title: 'Impacto y mercado' });
s = pres.addSlide({ masterName: 'AZUL', sectionTitle: 'Impacto y mercado' });
s.addText('Funciona, y funciona liviano', { placeholder: 'title' });
[['583', 'comprobaciones automáticas, sin fallos', K.green], ['230 KB', 'pesa la primera carga de la web; el APK, 4,3 MB', K.yellow]].forEach((d, i) => {
  const y = 1.35 + i * 1.85;
  tarjeta(s, 0.5, y, 6.3, 1.7, d[2], 'Tarjeta dato ' + (i + 1));
  T(s, d[0], { x: 0.7, y: y + 0.1, w: 2.7, h: 1.5, fontSize: 48, bold: true, color: K.navy, align: 'center', valign: 'middle', objectName: 'Dato ' + (i + 1) });
  T(s, d[1], { x: 3.5, y: y + 0.1, w: 3.1, h: 1.5, fontSize: 16, color: K.navy, valign: 'middle', objectName: 'Dato etiqueta ' + (i + 1) });
});
telefono(s, '03.gif', 7.4, 1.2, 3.6, 'la voz', K.green);
nota(s, 'Nota. Elaboración propia, versión 1.4.0: conjunto de pruebas automáticas, primera carga web comprimida y APK de 4,3 MB.', K.white);
s.addNotes(notas());

// ---------- 11. Meta ----------
s = pres.addSlide({ masterName: 'CLARO', sectionTitle: 'Impacto y mercado' });
s.addText('3.102 centros educativos; solo 73 en la licitación de 2026', { placeholder: 'title' });
heroDato(s, '3.102', 'centros educativos en Panamá; solo 73 de media en la licitación de laboratorios 2026 (193 aulas)', K.pink);
T(s, 'Chispa Lab llega a los que no tienen laboratorio, sin comprar equipos.', { x: 0.5, y: 4.1, w: 6.3, h: 0.8, fontSize: 15, bold: true, color: K.violet, valign: 'top', objectName: 'Apoyo' });
telefono(s, '01.gif', 7.55, 1.15, 3.55, 'la rampa', K.orange);
nota(s, 'Nota. 3.102 centros: Meduca, reportado por TVN-2 (2025). 73 centros y 193 aulas: La Prensa (2026b). Detalle: estudio de mercado.');
s.addNotes(notas());

// ---------- 12. ODS ----------
s = pres.addSlide({ masterName: 'CLARO', sectionTitle: 'Impacto y mercado' });
s.addText('Contribuimos a tres Objetivos de Desarrollo Sostenible', { placeholder: 'title' });
[['4', 'Aprendizaje pertinente para la niñez vulnerable'], ['10', 'Inclusión sin importar edad ni discapacidad'], ['9', 'Más acceso a las TIC, sin exigir conexión']].forEach((o, i) => {
  const x = 0.55 + i * 3.1;
  s.addImage({ path: IMG + '/ods-' + o[0] + '.png', x, y: 1.3, w: 2.8, h: 2.8, objectName: 'ODS ' + o[0], altText: 'Objetivo de Desarrollo Sostenible ' + o[0] });
  T(s, o[1], { x: x - 0.05, y: 4.2, w: 2.9, h: 0.7, fontSize: 14, bold: true, color: K.navy, align: 'center', valign: 'top', objectName: 'Frase ODS ' + o[0] });
});
nota(s, 'Nota. Metas 4.1, 4.5, 4.a, 10.2 y 9.c (Naciones Unidas, s. f.).');
s.addNotes(notas());

// ---------- 12. Mercado ----------
s = pres.addSlide({ masterName: 'CLARO', sectionTitle: 'Impacto y mercado' });
s.addText('Modelo de negocio: ministerios, terapias y regiones', { placeholder: 'title' });
[['≈ 150.100 $', 'un aula de laboratorio', K.pink], ['≈ 0 $', 'en equipos por escuela', K.green]].forEach((c, i) => {
  const x = 0.5 + i * 3.2;
  tarjeta(s, x, 1.35, 3.05, 2.3, c[2], 'Tarjeta ' + (i + 1));
  T(s, c[0], { x: x + 0.1, y: 1.45, w: 2.85, h: 1.2, fontSize: 34, bold: true, color: c[2] === K.green ? '0E9F6E' : c[2], align: 'center', valign: 'middle', objectName: 'Cifra ' + (i + 1) });
  T(s, c[1], { x: x + 0.15, y: 2.65, w: 2.75, h: 0.8, fontSize: 15, color: K.navy, align: 'center', valign: 'top', objectName: 'Etiqueta ' + (i + 1) });
});
T(s, [{ text: 'Ingresos: ', options: { bold: true, color: K.violet } }, { text: 'ministerios (adaptación y formación), clínicas de terapia (licencia por centro) y regiones (idioma y currículo).' }], { x: 0.5, y: 3.9, w: 6.3, h: 1.0, fontSize: 15, color: K.navy, valign: 'top', objectName: 'Quién paga' });
telefono(s, '02.gif', 7.55, 1.15, 3.55, 'el péndulo', K.violet);
nota(s, 'Nota. Costo por aula: La Prensa (2026b). Fuentes y supuestos: estudio de mercado.');
s.addNotes(notas());

// ---------- 13. Conclusión ----------
s = pres.addSlide({ masterName: 'OSCURO', sectionTitle: 'Impacto y mercado' });
burbuja(s, -0.8, -0.8, 2.6, K.yellow, 'Adorno 1'); burbuja(s, 4.6, 4.3, 2.4, K.cyan, 'Adorno 2');
T(s, 'Conclusión', { x: 0.5, y: 0.35, w: 5.5, h: 0.7, fontSize: 34, bold: true, color: K.white, objectName: 'Título' });
[['El problema es real', '6 de cada 10 estudiantes panameños de 15 años no alcanzan el nivel básico en ciencias, y más en las comarcas.', K.pink], ['La solución ya funciona', 'Un laboratorio en el teléfono: sin internet, inclusivo y con IA que aprende de cada niño.', K.green], ['Lo que proponemos', 'Un piloto en Veraguas con la UTP, ProFuturo y el Meduca.', K.yellow]].forEach((c, i) => {
  const y = 1.25 + i * 1.05;
  s.addShape(pres.ShapeType.roundRect, { x: 0.5, y, w: 5.9, h: 0.92, rectRadius: 0.12, fill: { color: K.white, transparency: 10 }, line: { color: c[2], width: 3 }, objectName: 'Tarjeta ' + (i + 1) });
  T(s, [{ text: c[0], options: { bold: true, fontSize: 15, color: c[2] === K.yellow ? 'B8860B' : (c[2] === K.green ? '0E9F6E' : c[2]), breakLine: true } }, { text: c[1], options: { fontSize: 12, color: K.navy } }], { x: 0.7, y, w: 5.5, h: 0.92, valign: 'middle', objectName: 'Conclusión ' + (i + 1) });
});
T(s, 'Cada teléfono, un laboratorio', { x: 0.5, y: 4.5, w: 6.0, h: 0.6, fontSize: 28, bold: true, color: K.yellow, valign: 'middle', objectName: 'Lema' });
telefono(s, '07.gif', 6.7, 0.75, 3.7, 'Mi laboratorio', K.cyan);
telefono(s, '01.gif', 8.35, 1.65, 3.0, 'la rampa', K.yellow);
s.addNotes(notas());

// ---------- 14. Preguntas y gracias ----------
s = pres.addSlide({ masterName: 'OSCURO', sectionTitle: 'Impacto y mercado' });
burbuja(s, 8.0, -1.0, 3.0, K.yellow, 'Adorno 1'); burbuja(s, -1.0, 4.2, 2.6, K.green, 'Adorno 2');
T(s, '¿Preguntas?', { x: 0.5, y: 0.25, w: 5.0, h: 0.8, fontSize: 40, bold: true, color: K.yellow, objectName: 'Preguntas' });
T(s, '¡Muchas gracias!', { x: 5.2, y: 0.3, w: 4.4, h: 0.7, fontSize: 28, bold: true, color: K.white, align: 'right', objectName: 'Gracias' });
[['01.gif', K.yellow], ['02.gif', K.pink], ['03.gif', K.green], ['10.gif', K.cyan], ['07.gif', K.orange]].forEach((t, i) => telefono(s, t[0], 0.75 + i * 1.82, 1.25, 3.0, 'el juego en acción ' + (i + 1), t[1]));
T(s, 'danielvaldess.github.io/chispa-lab  ·  github.com/danielvaldess/chispa-lab', { x: 0.5, y: 4.85, w: 9, h: 0.4, fontSize: 14, bold: true, color: K.cyan, align: 'center', objectName: 'Enlaces' });
s.addNotes(notas());

// ---------- 16. Referencias (anexo) ----------
pres.addSection({ title: 'Anexo' });
s = pres.addSlide({ masterName: 'CLARO', sectionTitle: 'Anexo' });
s.addText('Referencias', { placeholder: 'title' });
const REFS = [
  ['Comisión Europea. (2024, 7 de marzo). ', 'PISA 2022 and the EU: Three thought-provoking trends', '. European School Education Platform. https://school-education.ec.europa.eu/en/discover/expert-views/pisa-2022-and-eu-three-thought-provoking-trends'],
  ['Cyprus Mail. (2023, 6 de diciembre). ', 'Cypriot children perform well below average in maths, reading and science', '. https://cyprus-mail.com/2023/12/06/cypriot-children-perform-well-below-average-in-maths-reading-and-science'],
  ['Fundación Exe Colombia. (2024, marzo). ', 'Reporte general de resultados PISA 2022', '. https://fundacionexe.org.co/wp-content/uploads/2024/03/Reporte-general-de-resultados-PISA-2022.pdf'],
  ['Koyunlu Ünlü, Z. (2024). Effect of the predict-observe-explain (POE) strategy on achievement in science education: A meta-analysis study. ', 'Van Yüzüncü Yıl Üniversitesi Eğitim Fakültesi Dergisi, 21', '(3), 893–920. https://doi.org/10.33711/yyuefd.1570041'],
  ['La Prensa. (2026a, 3 de febrero). ', 'La realidad que no podemos ignorar', ' [Presentación sobre la reforma educativa]. https://cdn.corprensa.com/la-prensa/uploads/2026/02/03/La%20realidad%20que%20no%20podemos%20ignorar%20(1).pdf'],
  ['La Prensa. (2026b, 2 de abril). ', 'Meduca licita $28.9 millones para equipar laboratorios científicos en 73 escuelas', '. https://www.prensa.com/sociedad/meduca-licita-289-millones-para-equipar-laboratorios-cientificos-en-73-escuelas/'],
  ['Miao, F. y Cukurova, M. (2024). ', 'AI competency framework for teachers', '. UNESCO. https://doi.org/10.54675/ZJTE2084'],
  ['Ministerio de Educación de Panamá. (2025, 24 de junio). ', 'Informe de resultados de Panamá: Resumen ejecutivo ERCE Pospandemia', '. https://www.meduca.gob.pa/wp-content/uploads/2025/09/Resumen-ejecutivo-ERCE-Pospandemia-Panama-24062025.pdf'],
  ['Ministerio de Educación de Panamá, Oficina de Estadística. (2025). ', 'Matrícula, docentes y aulas de la educación oficial según región educativa, año lectivo 2024', ' (Cuadros 2-2 y 3-2). https://www.meduca.gob.pa/wp-content/uploads/2025/07/04062025_cuadro_2-2_primaria_2024.pdf'],
  ['Naciones Unidas, Departamento de Asuntos Económicos y Sociales. (s. f.). ', 'Objetivos de Desarrollo Sostenible 4, 9 y 10', '. https://sdgs.un.org/goals'],
  ['Parlamento Europeo y Consejo de la Unión Europea. (2024). ', 'Reglamento (UE) 2024/1689 por el que se establecen normas armonizadas en materia de inteligencia artificial', '. Diario Oficial de la Unión Europea, L, 12.7.2024. https://eur-lex.europa.eu/eli/reg/2024/1689/oj'],
  ['UNICEF Panamá. (2026, 8 de septiembre). ', 'Panamá presenta resultados del programa conjunto sobre cuidados y discapacidad', '. https://www.unicef.org/panama/comunicados-prensa/panam%C3%A1-presenta-resultados-del-programa-conjunto-sobre-cuidados-y-discapacidad'],
];
[REFS.slice(0, 6), REFS.slice(6)].forEach((col, c) => {
  const runs = [];
  col.forEach((r) => { runs.push({ text: r[0], options: { fontSize: 8, color: K.navy } }, { text: r[1], options: { fontSize: 8, italic: true, color: K.navy } }, { text: r[2], options: { fontSize: 8, color: K.navy, breakLine: true, paraSpaceAfter: 5 } }); });
  T(s, runs, { x: 0.4 + c * 4.75, y: 1.2, w: 4.55, h: 3.7, valign: 'top', objectName: 'Referencias ' + (c + 1) });
});
T(s, 'Cálculos y cifras propias: ≈ 150.100 $ por aula (28.969.463 ÷ 193), 38.250 estudiantes (primaria más premedia, Veraguas), meta de 3.800 (10 %), 583 pruebas, 230 KB de primera carga web y 4,3 MB de APK (versión 1.4.0). Fecha de consulta: 4 de noviembre de 2026.', { x: 0.4, y: 4.88, w: 9.2, h: 0.4, fontSize: 8, italic: true, color: K.navy, valign: 'top', objectName: 'Nota propia' });
s.addNotes(notas());

(async () => {
  await pres.writeFile({ fileName: process.env.SALIDA });
  await applyTheme(process.env.SALIDA, THEME);
  console.log('deck listo');
})();
