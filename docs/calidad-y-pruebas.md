# Calidad y pruebas

Chispa Lab se verifica en cuatro capas: tres reproducibles con los comandos de abajo y una auditoría de accesibilidad puntual.

## 1. Pruebas automáticas (`npm test`, 583 comprobaciones)
Física de los juegos, procesamiento de señal (tono, pulso), ajustes por edad y apoyos, perfiles, cámara, tutor, las seis técnicas de IA
(`ia`, `colorml`, `margen`, `agrupar`, `tutor`), formato y QR de la clase (el QR se genera y se lee de vuelta, también reducido a la
resolución de una cámara modesta) y equidad: el resultado de la agrupación no depende de la edad ni de los apoyos, porque no viajan en el código.
Se ejecutan en cada publicación (`.github/workflows/pages.yml`); si una falla, la web no se despliega.

## 2. Pruebas de extremo a extremo en teléfonos emulados
Chromium con perfil móvil (390×844, pantalla táctil), cámara y micrófono virtuales y CPU limitada:
- `npm run probar:navegacion`: desde el menú abre cada pantalla y comprueba que «← Menú» y el botón «atrás» (el de Android) vuelven al menú.
- `npm run probar:clase`: dos teléfonos; la alumna muestra su QR, el docente lo **escanea con una cámara virtual**, guarda al alumno, abre el detalle,
  pega un código (y rechaza uno dañado) y agrupa una clase de 18.
- Rendimiento: con la CPU 4 veces más lenta, ≈ 20 a 28 fotogramas por segundo; con 6 veces, ≈ 11 a 19. El **modo ligero se activa solo** cuando
  la fluidez baja de 26 fps (ventanas de 2 s) y sube a ≈ 22 a 28; se recuerda y «Borrar todos los datos» lo olvida.
- El APK se probó en un emulador de Android 15 (WebView 124): abre en pantalla completa y el acelerómetro virtual se lee como se espera.
- Prueba en teléfono real, reportada por el autor: [`prueba-telefono.md`](prueba-telefono.md).

## 3. Accesibilidad (auditoría automática WCAG 2 A y AA)
Se corrió **axe-core 4.10.2** sobre 10 pantallas (auditoría puntual, no incluida como script en el repositorio: menú, cuaderno, ajustes, compartir, pregunta de la rampa, Mi laboratorio, y las del docente:
menú, Mis alumnos, Agrupar y Pegar un código). Resultado final: **0 violaciones**. La auditoría encontró y se corrigió:
- zoom bloqueado (`user-scalable=no`, crítico): se retiró y se evita solo el zoom accidental por doble toque con `touch-action: manipulation`;
- contraste de la inicial en las tarjetas de alumnos (2,63:1): ahora blanco sobre morado, 5,7:1.

Los avisos «por revisar» que quedan son emojis y fondos con degradado, que axe no puede medir; los textos sobre degradado se diseñaron con
contraste alto y los controles no dependen solo del color (hay forma, texto e ícono).

## 4. Cómo reproducirlo
```bash
npm test
npm run probar:navegacion
npm run probar:clase
```
Requieren Node 20 o más (el mismo del CI) y Chromium (variable opcional `CHROME=/ruta/al/chromium`); no instalan dependencias.
