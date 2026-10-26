import type { Point } from "./wall-geometry";
export function validQuad(points: Point[]) {
  if (
    points.length !== 4 ||
    points.some(
      (p) =>
        !Number.isFinite(p.x) ||
        !Number.isFinite(p.y) ||
        p.x < 0 ||
        p.x > 1 ||
        p.y < 0 ||
        p.y > 1,
    )
  )
    return false;
  const cross = points.map((p, i) => {
    const b = points[(i + 1) % 4],
      c = points[(i + 2) % 4];
    return (b.x - p.x) * (c.y - b.y) - (b.y - p.y) * (c.x - b.x);
  });
  return cross.every((v) => v > 1e-5) || cross.every((v) => v < -1e-5);
}
export function homography(corners: Point[]) {
  if (!validQuad(corners))
    throw Error(
      "Mark four convex wall corners in order: top-left, top-right, bottom-right, bottom-left.",
    );
  const source = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 0, y: 1 },
    ],
    a: number[][] = [];
  source.forEach((p, i) => {
    const q = corners[i];
    a.push([p.x, p.y, 1, 0, 0, 0, -p.x * q.x, -p.y * q.x, q.x]);
    a.push([0, 0, 0, p.x, p.y, 1, -p.x * q.y, -p.y * q.y, q.y]);
  });
  for (let col = 0; col < 8; col++) {
    let pivot = col;
    for (let r = col + 1; r < 8; r++)
      if (Math.abs(a[r][col]) > Math.abs(a[pivot][col])) pivot = r;
    [a[col], a[pivot]] = [a[pivot], a[col]];
    if (Math.abs(a[col][col]) < 1e-12)
      throw Error("Wall corners are degenerate.");
    const d = a[col][col];
    for (let j = col; j <= 8; j++) a[col][j] /= d;
    for (let r = 0; r < 8; r++)
      if (r !== col) {
        const f = a[r][col];
        for (let j = col; j <= 8; j++) a[r][j] -= f * a[col][j];
      }
  }
  return a.map((r) => r[8]);
}
export function project(h: number[], p: Point) {
  const d = h[6] * p.x + h[7] * p.y + 1;
  return {
    x: (h[0] * p.x + h[1] * p.y + h[2]) / d,
    y: (h[3] * p.x + h[4] * p.y + h[5]) / d,
  };
}
function triangle(
  ctx: CanvasRenderingContext2D,
  image: CanvasImageSource,
  src: Point[],
  dst: Point[],
) {
  const [a, b, c] = src,
    [A, B, C] = dst,
    den = a.x * (b.y - c.y) + b.x * (c.y - a.y) + c.x * (a.y - b.y);
  if (Math.abs(den) < 1e-12) return;
  const calc = (u: number, v: number, w: number) => [
    (u * (b.y - c.y) + v * (c.y - a.y) + w * (a.y - b.y)) / den,
    (u * (c.x - b.x) + v * (a.x - c.x) + w * (b.x - a.x)) / den,
    (u * (b.x * c.y - c.x * b.y) +
      v * (c.x * a.y - a.x * c.y) +
      w * (a.x * b.y - b.x * a.y)) /
      den,
  ];
  const x = calc(A.x, B.x, C.x),
    y = calc(A.y, B.y, C.y);
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(A.x, A.y);
  ctx.lineTo(B.x, B.y);
  ctx.lineTo(C.x, C.y);
  ctx.closePath();
  ctx.clip();
  ctx.transform(x[0], y[0], x[1], y[1], x[2], y[2]);
  ctx.drawImage(image, 0, 0);
  ctx.restore();
}
export function warp(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  corners: Point[],
  width: number,
  height: number,
  steps = 20,
) {
  const h = homography(corners),
    target = (x: number, y: number) => {
      const p = project(h, { x, y });
      return { x: p.x * width, y: p.y * height };
    };
  for (let y = 0; y < steps; y++)
    for (let x = 0; x < steps; x++) {
      const points = [
        { x: x / steps, y: y / steps },
        { x: (x + 1) / steps, y: y / steps },
        { x: (x + 1) / steps, y: (y + 1) / steps },
        { x: x / steps, y: (y + 1) / steps },
      ];
      for (const indices of [
        [0, 1, 2],
        [0, 2, 3],
      ])
        triangle(
          ctx,
          image,
          indices.map((i) => ({
            x: points[i].x * image.width,
            y: points[i].y * image.height,
          })),
          indices.map((i) => target(points[i].x, points[i].y)),
        );
    }
}
