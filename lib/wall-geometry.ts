import { isWallLayout } from "../supabase/functions/art-vault/layout-validation.ts";
import type { GalleryRecord } from "./workspace-ui";
export type Unit = "ft" | "in" | "cm";
export const unitMm: Record<Unit, number> = { ft: 304.8, in: 25.4, cm: 10 };
export const mm = (value: number, unit: Unit) => value * unitMm[unit];
export const fmt = (value: number, unit: Unit) =>
  `${Number((value / unitMm[unit]).toFixed(2))} ${unit}`;
export const inv = (id: number) => `SS-${String(id).padStart(4, "0")}`;
export type Art = Pick<
  GalleryRecord,
  | "id"
  | "title"
  | "artist"
  | "width"
  | "height"
  | "status"
  | "price"
  | "style"
  | "medium"
  | "archived"
> & {
  framedWidth?: number | string;
  framedHeight?: number | string;
  dimensionUnit?: string;
  measurementVerified?: boolean;
  legacyInventoryId?: string;
};
export type Point = { x: number; y: number };
export type Zone = Point & {
  id: string;
  name: string;
  width: number;
  height: number;
};
export type Wall = {
  width: number;
  height: number;
  marginX: number;
  marginY: number;
  gap: number;
  color: string;
  zones: Zone[];
};
export type Layer = Point & {
  artworkId: number;
  width: number;
  height: number;
  canvasWidth: number;
  canvasHeight: number;
  rotation: 0 | 90 | 180 | 270;
  frame: boolean;
  frameColor: string;
  locked: boolean;
  verified: boolean;
  frameKnown: boolean;
};
export type Layout = {
  version: 2;
  wall: Wall;
  layers: Layer[];
  unit: Unit;
  name: string;
  room?: { image: string; corners: Point[]; prepared: boolean };
};
export type Bounds = Point & { width: number; height: number };
export const defaultWall: Wall = {
  width: 2438.4,
  height: 2438.4,
  marginX: 152.4,
  marginY: 152.4,
  gap: 101.6,
  color: "#f4f0e8",
  zones: [],
};
const positive = (v: unknown) =>
  typeof v !== "boolean" &&
  v !== null &&
  v !== undefined &&
  String(v).trim() !== "" &&
  Number.isFinite(Number(v)) &&
  Number(v) > 0;
export function dimensions(a: Art, frame: boolean) {
  const unit = a.dimensionUnit ?? "cm";
  if (!["cm", "in", "ft", "mm"].includes(unit))
    return { error: "Measurement unit is unknown" };
  const scale = unit === "mm" ? 1 : unitMm[unit as Unit];
  if (!positive(a.width) || !positive(a.height))
    return { error: "Canvas dimensions are missing or invalid" };
  const canvasWidth = Number(a.width) * scale,
    canvasHeight = Number(a.height) * scale;
  if (Math.max(canvasWidth, canvasHeight) > 20000)
    return { error: "Measurements exceed 20 metres; verify inventory" };
  const anyOutside = [a.framedWidth, a.framedHeight].some(
    (v) => v !== undefined && v !== null && String(v).trim() !== "",
  );
  let width = canvasWidth,
    height = canvasHeight,
    frameKnown = !frame;
  if (anyOutside) {
    if (!positive(a.framedWidth) || !positive(a.framedHeight))
      return { error: "Both framed outside dimensions are required" };
    const fw = Number(a.framedWidth) * scale,
      fh = Number(a.framedHeight) * scale;
    if (fw < canvasWidth || fh < canvasHeight || Math.max(fw, fh) > 20000)
      return { error: "Framed outside size is inconsistent with the canvas" };
    if (frame) {
      width = fw;
      height = fh;
      frameKnown = true;
    }
  }
  return {
    width,
    height,
    canvasWidth,
    canvasHeight,
    verified: a.measurementVerified === true,
    frameKnown,
  };
}
export function makeLayer(a: Art, wall: Wall, frame = false): Layer | null {
  const d = dimensions(a, frame);
  if ("error" in d) return null;
  return {
    artworkId: a.id,
    x: wall.width / 2,
    y: wall.height / 2,
    ...d,
    rotation: 0,
    frame,
    frameColor: "#a48d75",
    locked: false,
  };
}
export function bounds(layer: Layer): Bounds {
  const swap = layer.rotation === 90 || layer.rotation === 270,
    w = swap ? layer.height : layer.width,
    h = swap ? layer.width : layer.height;
  return { x: layer.x - w / 2, y: layer.y - h / 2, width: w, height: h };
}
export function footprint(layers: Layer[]): Bounds {
  if (!layers.length) return { x: 0, y: 0, width: 0, height: 0 };
  const boxes = layers.map(bounds),
    x = Math.min(...boxes.map((b) => b.x)),
    y = Math.min(...boxes.map((b) => b.y));
  return {
    x,
    y,
    width: Math.max(...boxes.map((b) => b.x + b.width)) - x,
    height: Math.max(...boxes.map((b) => b.y + b.height)) - y,
  };
}
export function intersects(a: Bounds, b: Bounds) {
  return (
    a.x < b.x + b.width - 0.01 &&
    a.x + a.width > b.x + 0.01 &&
    a.y < b.y + b.height - 0.01 &&
    a.y + a.height > b.y + 0.01
  );
}
export function separation(a: Layer, b: Layer) {
  const A = bounds(a),
    B = bounds(b);
  return {
    horizontal: Math.max(0, A.x - B.x - B.width, B.x - A.x - A.width),
    vertical: Math.max(0, A.y - B.y - B.height, B.y - A.y - A.height),
  };
}
export function validate(wall: Wall, layers: Layer[], arts?: Art[]) {
  const errors: string[] = [],
    warnings: string[] = [];
  if (
    ![wall.width, wall.height].every(
      (v) => Number.isFinite(v) && v > 0 && v <= 100000,
    )
  )
    errors.push("Enter positive wall dimensions up to 100 m.");
  if (
    ![wall.marginX, wall.marginY, wall.gap].every(
      (v) => Number.isFinite(v) && v >= 0,
    ) ||
    wall.marginX * 2 >= wall.width ||
    wall.marginY * 2 >= wall.height
  )
    errors.push("Clearances must leave usable wall space.");
  if (!layers.length) errors.push("Add an artwork to the measured wall.");
  if (new Set(layers.map((l) => l.artworkId)).size !== layers.length)
    errors.push("The same artwork cannot appear twice.");
  for (const z of wall.zones)
    if (
      ![z.x, z.y, z.width, z.height].every(Number.isFinite) ||
      z.width <= 0 ||
      z.height <= 0 ||
      z.x < 0 ||
      z.y < 0 ||
      z.x + z.width > wall.width + 0.01 ||
      z.y + z.height > wall.height + 0.01
    )
      errors.push(`Exclusion zone ${z.name} is outside the wall or invalid.`);
  for (let i = 0; i < layers.length; i++) {
    const l = layers[i],
      b = bounds(l),
      tag = inv(l.artworkId);
    if (
      ![l.x, l.y, l.width, l.height, l.canvasWidth, l.canvasHeight].every(
        Number.isFinite,
      ) ||
      Math.min(l.width, l.height, l.canvasWidth, l.canvasHeight) <= 0 ||
      ![0, 90, 180, 270].includes(l.rotation)
    )
      errors.push(`${tag}: invalid measurements or position.`);
    if (
      b.x < wall.marginX - 0.01 ||
      b.y < wall.marginY - 0.01 ||
      b.x + b.width > wall.width - wall.marginX + 0.01 ||
      b.y + b.height > wall.height - wall.marginY + 0.01
    )
      errors.push(
        `${tag} extends beyond the usable wall. Required ${Math.round(b.width)} × ${Math.round(b.height)} mm; usable ${Math.round(wall.width - 2 * wall.marginX)} × ${Math.round(wall.height - 2 * wall.marginY)} mm.`,
      );
    if (wall.zones.some((z) => intersects(b, z)))
      errors.push(`${tag} intersects an exclusion zone.`);
    for (let j = 0; j < i; j++) {
      const other = layers[j],
        gap = separation(l, other);
      if (intersects(b, bounds(other)))
        errors.push(`${tag} overlaps ${inv(other.artworkId)}.`);
      else if (Math.hypot(gap.horizontal, gap.vertical) < wall.gap - 0.01)
        errors.push(
          `${tag} is closer than the preferred gap to ${inv(other.artworkId)}.`,
        );
    }
    if (
      !l.verified ||
      (arts &&
        arts.find((a) => a.id === l.artworkId)?.measurementVerified !== true)
    )
      warnings.push(`${tag}: dimensions are unverified.`);
    if (!l.frameKnown)
      warnings.push(
        `${tag}: frame outside size is unknown; canvas footprint only.`,
      );
    if (arts) {
      const a = arts.find((a) => a.id === l.artworkId);
      if (!a || a.archived) errors.push(`${tag} is unavailable or archived.`);
      else {
        const d = dimensions(a, l.frame);
        if (
          "error" in d ||
          Math.abs(d.width - l.width) > 0.01 ||
          Math.abs(d.height - l.height) > 0.01 ||
          Math.abs(d.canvasWidth - l.canvasWidth) > 0.01 ||
          Math.abs(d.canvasHeight - l.canvasHeight) > 0.01
        )
          errors.push(
            `${tag}: saved measurements differ from inventory. Refresh measurements.`,
          );
      }
    }
  }
  return {
    errors: [...new Set(errors)],
    warnings: [...new Set(warnings)],
    fits: !errors.length,
    verified: !errors.length && !warnings.length,
  };
}
export const presets = [
  "Single Statement",
  "Symmetrical Pair",
  "Triptych",
  "Salon Wall",
  "Statement + Supporting Art",
  "Symmetrical Grid",
  "Vertical Stack",
  "Freeform Collage",
] as const;
export type Preset = (typeof presets)[number];
export function centre(layers: Layer[], wall: Wall) {
  const box = footprint(layers);
  return layers.map((l) =>
    l.locked
      ? l
      : {
          ...l,
          x: l.x + wall.width / 2 - box.x - box.width / 2,
          y: l.y + wall.height / 2 - box.y - box.height / 2,
        },
  );
}
export function arrange(input: Layer[], wall: Wall, preset: Preset): Layer[] {
  if (!input.length) return input;
  if (preset === "Freeform Collage") return input;
  const layers = input.map((l) => ({ ...l })),
    gap = wall.gap;
  const put = (group: Layer[], vertical: boolean) => {
    let cursor = 0;
    for (const l of group) {
      const b = bounds(l);
      l.x = vertical ? 0 : cursor + b.width / 2;
      l.y = vertical ? cursor + b.height / 2 : 0;
      cursor += (vertical ? b.height : b.width) + gap;
    }
  };
  if (
    preset === "Single Statement" ||
    preset === "Symmetrical Pair" ||
    preset === "Triptych"
  )
    put(layers, false);
  else if (preset === "Vertical Stack") put(layers, true);
  else if (preset === "Statement + Supporting Art" && layers.length >= 3) {
    const sorted = [...layers].sort(
        (a, b) => b.width * b.height - a.width * a.height,
      ),
      main = sorted[0],
      left = sorted.slice(1).filter((_, i) => i % 2 === 0),
      right = sorted.slice(1).filter((_, i) => i % 2 === 1);
    main.x = 0;
    main.y = 0;
    put(left, true);
    put(right, true);
    for (const group of [left, right]) {
      const box = footprint(group);
      for (const l of group) {
        const b = bounds(l);
        l.y -= box.y + box.height / 2;
        l.x =
          group === left
            ? -bounds(main).width / 2 - gap - b.width / 2
            : bounds(main).width / 2 + gap + b.width / 2;
      }
    }
  } else {
    const cols =
      preset === "Symmetrical Grid"
        ? layers.length > 4
          ? 3
          : 2
        : Math.max(
            2,
            Math.round(Math.sqrt((layers.length * wall.width) / wall.height)),
          );
    let y = 0;
    for (let i = 0; i < layers.length; i += cols) {
      const row = layers.slice(i, i + cols),
        height = Math.max(...row.map((l) => bounds(l).height));
      put(row, false);
      const w = footprint(row).width;
      for (const l of row) {
        l.x -= w / 2;
        l.y = y + height / 2;
      }
      y += height + gap;
    }
  }
  const positioned = centre(layers, wall).map((l) =>
    input.find((old) => old.artworkId === l.artworkId)?.locked
      ? input.find((old) => old.artworkId === l.artworkId)!
      : l,
  );
  return positioned;
}
export function align(
  layers: Layer[],
  mode: "top" | "bottom" | "left" | "right" | "centre-y",
) {
  const box = footprint(layers);
  return layers.map((l) => {
    if (l.locked) return l;
    const b = bounds(l);
    return {
      ...l,
      ...(mode === "top"
        ? { y: box.y + b.height / 2 }
        : mode === "bottom"
          ? { y: box.y + box.height - b.height / 2 }
          : mode === "left"
            ? { x: box.x + b.width / 2 }
            : mode === "right"
              ? { x: box.x + box.width - b.width / 2 }
              : { y: box.y + box.height / 2 }),
    };
  });
}
export function snapPosition(
  layer: Layer,
  x: number,
  y: number,
  wall: Wall,
  others: Layer[],
  tolerance = 12,
) {
  if (layer.locked) return layer;
  const b = bounds(layer),
    xs = [
      wall.width / 2,
      wall.marginX + b.width / 2,
      wall.width - wall.marginX - b.width / 2,
    ],
    ys = [
      wall.height / 2,
      wall.marginY + b.height / 2,
      wall.height - wall.marginY - b.height / 2,
    ];
  for (const other of others) {
    const B = bounds(other);
    xs.push(
      other.x,
      B.x + B.width + wall.gap + b.width / 2,
      B.x - wall.gap - b.width / 2,
    );
    ys.push(
      other.y,
      B.y + B.height + wall.gap + b.height / 2,
      B.y - wall.gap - b.height / 2,
    );
  }
  const nearest = (v: number, list: number[]) =>
    list.reduce(
      (best, n) => (Math.abs(n - v) < Math.abs(best - v) ? n : best),
      v + tolerance + 1,
    );
  const nx = nearest(x, xs),
    ny = nearest(y, ys);
  return {
    ...layer,
    x: Math.abs(nx - x) <= tolerance ? nx : x,
    y: Math.abs(ny - y) <= tolerance ? ny : y,
  };
}
export type Recommendation = {
  id: string;
  layers: Layer[];
  preset: Preset;
  score: number;
  remaining: { x: number; y: number };
};
function translateToFit(layers: Layer[], wall: Wall) {
  if (validate(wall, layers).fits) return layers;
  const box = footprint(layers),
    xs = [wall.marginX, wall.width - wall.marginX - box.width],
    ys = [wall.marginY, wall.height - wall.marginY - box.height];
  for (const z of wall.zones) {
    xs.push(z.x + z.width + wall.gap, z.x - wall.gap - box.width);
    ys.push(z.y + z.height + wall.gap, z.y - wall.gap - box.height);
  }
  for (const x of xs.slice(0, 12))
    for (const y of ys.slice(0, 12)) {
      const next = layers.map((l) => ({
        ...l,
        x: l.x + x - box.x,
        y: l.y + y - box.y,
      }));
      if (validate(wall, next).fits) return next;
    }
  return null;
}
// Keep size diversity so many large works cannot hide small compatible companions.
function representative(pool: Layer[], limit: number) {
  if (pool.length <= limit) return pool;
  const tail = 8,
    spread = limit - tail;
  return [
    ...new Map(
      [
        ...Array.from(
          { length: spread },
          (_, i) => pool[Math.floor((i * (pool.length - 1)) / (spread - 1))],
        ),
        ...pool.slice(-tail),
      ].map((l) => [l.artworkId, l]),
    ).values(),
  ];
}
export function recommend(
  arts: Art[],
  wall: Wall,
  category: "single" | "pair" | "triptych" | "collage" | "statement",
  frame = false,
): Recommendation[] {
  if (validate(wall, []).errors.some((e) => !e.startsWith("Add an artwork")))
    return [];
  const pool = arts
      .filter(
        (a) => !a.archived && a.status !== "Sold" && a.status !== "Reserved",
      )
      .map((a) => makeLayer(a, wall, frame))
      .filter(
        (l): l is Layer =>
          !!l &&
          l.width <= wall.width - 2 * wall.marginX &&
          l.height <= wall.height - 2 * wall.marginY &&
          (!frame || l.frameKnown),
      )
      .sort((a, b) => b.width * b.height - a.width * a.height),
    output: Recommendation[] = [];
  let trials = 0;
  const add = (group: Layer[], preset: Preset) => {
    if (++trials > 2500) return;
    const placed = translateToFit(arrange(group, wall, preset), wall);
    if (!placed) return;
    const b = footprint(placed);
    output.push({
      id: placed.map((l) => l.artworkId).join("-") + preset,
      layers: placed,
      preset,
      score:
        group.reduce((s, l) => s + l.width * l.height, 0) /
          (wall.width * wall.height) -
        Math.abs(b.width / wall.width - b.height / wall.height) * 0.1,
      remaining: {
        x: wall.width - 2 * wall.marginX - b.width,
        y: wall.height - 2 * wall.marginY - b.height,
      },
    });
  };
  if (category === "single") for (const l of pool) add([l], "Single Statement");
  else if (category === "pair") {
    const p = representative(pool, 48);
    for (let i = 0; i < p.length; i++)
      for (let j = i + 1; j < p.length; j++) {
        add([p[i], p[j]], "Symmetrical Pair");
        add([p[i], p[j]], "Vertical Stack");
      }
  } else if (category === "triptych") {
    const p = representative(pool, 20);
    for (let i = 0; i < p.length; i++)
      for (let j = i + 1; j < p.length; j++)
        for (let k = j + 1; k < p.length; k++) {
          add([p[i], p[j], p[k]], "Triptych");
          add([p[i], p[j], p[k]], "Vertical Stack");
        }
  } else {
    for (let seed = 0; seed < Math.min(24, pool.length); seed++) {
      const candidates = representative(pool, 48).slice(seed, seed + 24);
      for (const count of [3, 4, 5, 6, 7, 8]) {
        const selected = [
          candidates[0],
          ...candidates
            .slice(1)
            .sort((a, b) => a.width * a.height - b.width * b.height)
            .slice(0, count - 1),
        ].filter(Boolean);
        if (selected.length !== count) continue;
        add(
          selected,
          category === "statement"
            ? "Statement + Supporting Art"
            : "Salon Wall",
        );
        if (category === "collage") add(selected, "Symmetrical Grid");
      }
    }
  }
  return output
    .sort((a, b) => b.score - a.score)
    .filter((r, i, a) => a.findIndex((x) => x.id === r.id) === i)
    .slice(0, category === "single" ? 100 : 18);
}
export function validLayout(value: unknown): value is Layout {
  return isWallLayout(value);
}
