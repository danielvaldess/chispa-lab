// Primitivas de dibujo en canvas 2D: degradados, esferas y sombras para dar volumen sin motores 3D.

export function grad(cx, y0, y1, a, b) {
  const g = cx.createLinearGradient(0, y0, 0, y1);
  g.addColorStop(0, a);
  g.addColorStop(1, b);
  return g;
}

export function gradH(cx, x0, x1, a, b) {
  const g = cx.createLinearGradient(x0, 0, x1, 0);
  g.addColorStop(0, a);
  g.addColorStop(1, b);
  return g;
}

/** Rectángulo redondeado (traza el camino; llama a fill/stroke después). */
export function rr(cx, x, y, w, h, r) {
  const radio = Math.max(0, Math.min(r, w / 2, h / 2));
  cx.beginPath();
  cx.moveTo(x + radio, y);
  cx.arcTo(x + w, y, x + w, y + h, radio);
  cx.arcTo(x + w, y + h, x, y + h, radio);
  cx.arcTo(x, y + h, x, y, radio);
  cx.arcTo(x, y, x + w, y, radio);
  cx.closePath();
}

/** Esfera con luz arriba a la izquierda y brillo. */
export function esfera(cx, x, y, radio, claro, oscuro) {
  const g = cx.createRadialGradient(x - radio * 0.35, y - radio * 0.4, radio * 0.1, x, y, radio);
  g.addColorStop(0, claro);
  g.addColorStop(1, oscuro);
  cx.fillStyle = g;
  cx.beginPath();
  cx.arc(x, y, radio, 0, Math.PI * 2);
  cx.fill();
  cx.fillStyle = 'rgba(255,255,255,.55)';
  cx.beginPath();
  cx.ellipse(x - radio * 0.35, y - radio * 0.4, radio * 0.28, radio * 0.16, -0.6, 0, Math.PI * 2);
  cx.fill();
}

export function sombra(cx, x, y, rx, ry, alfa = 0.25) {
  cx.fillStyle = `rgba(40,20,10,${alfa})`;
  cx.beginPath();
  cx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  cx.fill();
}

export function texto(cx, t, x, y, tam, ancla = 'center', color = '#fff') {
  cx.font = `800 ${tam}px system-ui, -apple-system, "Segoe UI", sans-serif`;
  cx.textAlign = ancla;
  cx.textBaseline = 'middle';
  cx.fillStyle = color;
  cx.fillText(t, x, y);
}

/** Texto con borde oscuro y sombra, legible sobre cualquier fondo. */
export function texto3d(cx, t, x, y, tam, ancla = 'center', color = '#fff') {
  cx.font = `800 ${tam}px system-ui, -apple-system, "Segoe UI", sans-serif`;
  cx.textAlign = ancla;
  cx.textBaseline = 'middle';
  cx.lineJoin = 'round';
  cx.lineWidth = tam * 0.28;
  cx.strokeStyle = 'rgba(29,34,80,.85)';
  cx.strokeText(t, x, y + tam * 0.06);
  cx.fillStyle = color;
  cx.fillText(t, x, y);
}

export const grados = (r) => (r * 180) / Math.PI;
export const radianes = (g) => (g * Math.PI) / 180;
