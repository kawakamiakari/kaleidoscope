// Draws a shape of the given size centered on the origin. The fill and
// stroke styles, opacity, position and rotation are already applied.
export type ShapeDrawer = (
  context: CanvasRenderingContext2D,
  size: number,
) => void;

export type ShapeName =
  | 'circle'
  | 'drop'
  | 'heart'
  | 'oval'
  | 'square'
  | 'star'
  | 'triangle'
  | 'wave';

export const builtInShapes: Record<ShapeName, ShapeDrawer> = {
  circle(context, s) {
    context.beginPath();
    context.arc(0, 0, s / 2, 0, 2 * Math.PI);
    context.fill();
  },

  drop(context, s) {
    // Bounding box: (0, 0) to (2/3 s, s)
    context.translate(-s / 3, -s / 2);
    context.beginPath();
    context.moveTo(0, s * (2 / 3));
    context.quadraticCurveTo(0, s / 3, s / 3, 0);
    context.quadraticCurveTo(s * (2 / 3), s / 3, s * (2 / 3), s * (2 / 3));
    context.arc(s / 3, s * (2 / 3), s / 3, 0, Math.PI);
    context.closePath();
    context.fill();
  },

  heart(context, s) {
    // Bounding box: (20/130 s, 25/140 s) to (s, 120/140 s)
    const x = (n: number) => s * (n / 130);
    const y = (n: number) => s * (n / 140);
    context.translate(-x(75), -y(72.5));
    context.beginPath();
    context.moveTo(x(75), y(40));
    context.bezierCurveTo(x(75), y(37), x(70), y(25), x(50), y(25));
    context.bezierCurveTo(x(20), y(25), x(20), y(62.5), x(20), y(62.5));
    context.bezierCurveTo(x(20), y(80), x(40), y(102), x(75), y(120));
    context.bezierCurveTo(x(110), y(102), s, y(80), s, y(62.5));
    context.bezierCurveTo(s, y(62.5), s, y(25), x(100), y(25));
    context.bezierCurveTo(x(85), y(25), x(75), y(37), x(75), y(40));
    context.fill();
  },

  oval(context, s) {
    context.scale(1, 3 / 4);
    context.beginPath();
    context.arc(0, 0, s / 2, 0, 2 * Math.PI);
    context.fill();
  },

  square(context, s) {
    context.fillRect(-s / 2, -s / 2, s, s);
  },

  star(context, s) {
    // Bounding box: (0, 0) to (s, 0.9 s)
    const p = (n: number) => s * (n / 200);
    context.translate(-s / 2, -p(90));
    context.beginPath();
    context.moveTo(0, p(70));
    context.lineTo(s, p(70));
    context.lineTo(p(35), p(180));
    context.lineTo(p(100), 0);
    context.lineTo(p(165), p(180));
    context.closePath();
    context.fill();
  },

  triangle(context, s) {
    // Equilateral triangle on the bottom edge, centered on its centroid.
    const top = (1 - Math.tan(Math.PI / 3) / 2) * s;
    context.translate(-s / 2, -(2 * s + top) / 3);
    context.beginPath();
    context.moveTo(0, s);
    context.lineTo(s / 2, top);
    context.lineTo(s, s);
    context.closePath();
    context.fill();
  },

  wave(context, s) {
    // Bounding box: (0, 0) to (s, 0.4 s)
    context.translate(-s / 2, -s * 0.2);
    context.lineWidth = s * 0.3;
    context.lineJoin = 'round';
    context.lineCap = 'round';
    context.beginPath();
    context.moveTo(0, 0);
    context.lineTo(s * 0.2, s * 0.4);
    context.lineTo(s * 0.4, 0);
    context.lineTo(s * 0.6, s * 0.4);
    context.lineTo(s * 0.8, 0);
    context.lineTo(s, s * 0.4);
    context.stroke();
  },
};
