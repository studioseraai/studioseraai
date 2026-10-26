/* eslint-disable @typescript-eslint/no-explicit-any -- Runtime JSON boundary; all accepted fields validated. */
// Shared browser/Edge validation. No external resources may be embedded in saved layouts.
export function isWallLayout(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, any>; // JSON boundary: every field checked below.
  const number = (n: unknown, min: number, max: number) =>
    typeof n === "number" && Number.isFinite(n) && n >= min && n <= max;
  const color = (s: unknown) =>
    typeof s === "string" && /^#[a-f0-9]{6}$/i.test(s);
  if (
    v.version !== 2 ||
    typeof v.name !== "string" ||
    v.name.length > 100 ||
    !["ft", "in", "cm"].includes(v.unit) ||
    !v.wall ||
    !Array.isArray(v.layers) ||
    v.layers.length > 12
  )
    return false;
  const w = v.wall;
  if (
    !number(w.width, 0.01, 100000) ||
    !number(w.height, 0.01, 100000) ||
    ![w.marginX, w.marginY, w.gap].every((n) => number(n, 0, 100000)) ||
    !color(w.color) ||
    !Array.isArray(w.zones) ||
    w.zones.length > 10
  )
    return false;
  if (
    !w.zones.every(
      (z: any) =>
        z &&
        typeof z.id === "string" &&
        z.id.length <= 100 &&
        typeof z.name === "string" &&
        z.name.length <= 100 &&
        [z.x, z.y].every((n) => number(n, 0, 100000)) &&
        [z.width, z.height].every((n) => number(n, 0.01, 100000)),
    )
  )
    return false;
  if (
    !v.layers.every(
      (l: any) =>
        l &&
        Number.isSafeInteger(l.artworkId) &&
        l.artworkId > 0 &&
        [l.x, l.y].every((n) => number(n, -100000, 200000)) &&
        [l.width, l.height, l.canvasWidth, l.canvasHeight].every((n) =>
          number(n, 0.01, 20000),
        ) &&
        l.width >= l.canvasWidth &&
        l.height >= l.canvasHeight &&
        [0, 90, 180, 270].includes(l.rotation) &&
        ["frame", "locked", "verified", "frameKnown"].every(
          (k) => typeof l[k] === "boolean",
        ) &&
        color(l.frameColor),
    )
  )
    return false;
  if (new Set(v.layers.map((l: any) => l.artworkId)).size !== v.layers.length)
    return false;
  if (v.room) {
    const r = v.room;
    if (
      typeof r.image !== "string" ||
      r.image.length > 600000 ||
      !(
        /^(\/rooms\/(living|corridor|guest|dining|office)\.webp)$/.test(
          r.image,
        ) ||
        /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(r.image)
      ) ||
      typeof r.prepared !== "boolean" ||
      !Array.isArray(r.corners) ||
      ![0, 4].includes(r.corners.length) ||
      !r.corners.every((p: any) => p && number(p.x, 0, 1) && number(p.y, 0, 1))
    )
      return false;
  }
  return JSON.stringify(v).length <= 1000000;
}
