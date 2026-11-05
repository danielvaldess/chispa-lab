# Librerías de terceros (solo para los códigos QR de la clase)

El service worker las descarga en la primera carga (≈ 53 KB) para que la clase funcione sin conexión, pero no se ejecutan hasta que se abre «Mis alumnos» o «Compartir con mi docente»; el resto de la app no las usa.

| Archivo | Para qué | Licencia | Origen |
|---|---|---|---|
| `qrcode.min.js` | Dibujar el QR del alumno | MIT (Kazuhiko Arase, 2009) | https://github.com/kazuhikoarase/qrcode-generator, versión 1.4.4 |
| `jsQR.min.js` | Leer el QR con la cámara si el navegador no trae `BarcodeDetector` | Apache-2.0 (Cosmo Wolfe) | https://github.com/cozmo/jsQR, versión 1.4.0 |

Los archivos están minificados con terser (sin cambiar su comportamiento) y conservan su aviso de licencia en la primera línea. El texto completo de la licencia de jsQR está en `jsQR.LICENSE.txt`.
Son licencias aprobadas por la OSI, compatibles con la licencia MIT del resto del código.
