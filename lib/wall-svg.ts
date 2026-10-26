import {
  bounds,
  fmt,
  inv,
  validate,
  type Art,
  type Layout,
} from "./wall-geometry.ts";
export const escapeXml = (s: unknown) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&apos;",
      })[c]!,
  );
export function wallSvg(
  layout: Layout,
  arts: Art[],
  images: Record<number, string>,
  options: {
    labels?: boolean;
    legend?: boolean;
    grid?: boolean;
    selected?: number;
    plane?: boolean;
  } = {},
) {
  const { wall, layers, unit } = layout,
    scale = Math.min(1000 / wall.width, 650 / wall.height),
    font = 12 / scale,
    pad = options.plane ? 0 : 55 / scale,
    width = wall.width + 2 * pad,
    height =
      wall.height +
      2 * pad +
      (options.legend ? (layers.length * 3 + 2) * font : 0),
    stroke = 1 / scale;
  const e = escapeXml,
    check = validate(wall, layers, arts);
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${Math.ceil(width * scale * 3)}" height="${Math.ceil(height * scale * 3)}" viewBox="${-pad} ${-pad} ${width} ${height}" font-family="Arial,sans-serif"><defs><pattern id="wall-grid" width="${unit === "cm" ? 100 : 152.4}" height="${unit === "cm" ? 100 : 152.4}" patternUnits="userSpaceOnUse"><path d="M 0 0 H ${unit === "cm" ? 100 : 152.4} M 0 0 V ${unit === "cm" ? 100 : 152.4}" stroke="#948b7a" stroke-width="${stroke * 0.5}" opacity=".3"/></pattern></defs>`;
  if (!options.plane)
    svg += `<rect x="${-pad}" y="${-pad}" width="${width}" height="${height}" fill="#171717"/>`;
  if (!options.plane)
    svg += `<rect width="${wall.width}" height="${wall.height}" fill="${e(wall.color)}" stroke="#a48d75" stroke-width="${stroke}"/>`;
  if (options.grid)
    svg += `<rect width="${wall.width}" height="${wall.height}" fill="url(#wall-grid)"/><path d="M ${wall.width / 2} 0 V ${wall.height} M 0 ${wall.height / 2} H ${wall.width}" stroke="#9a7851" stroke-width="${stroke}" stroke-dasharray="${6 / scale} ${6 / scale}"/>`;
  if (!options.plane) {
    svg += `<rect x="${wall.marginX}" y="${wall.marginY}" width="${Math.max(0, wall.width - wall.marginX * 2)}" height="${Math.max(0, wall.height - wall.marginY * 2)}" fill="none" stroke="#9c8f79" stroke-width="${stroke}" stroke-dasharray="${4 / scale} ${4 / scale}"/><text x="${wall.width / 2}" y="${-font * 1.7}" text-anchor="middle" fill="#f4f0e8" font-size="${font * 1.15}">${e(fmt(wall.width, unit))} W</text><text x="${-font * 2}" y="${wall.height / 2}" transform="rotate(-90 ${-font * 2} ${wall.height / 2})" text-anchor="middle" fill="#f4f0e8" font-size="${font * 1.15}">${e(fmt(wall.height, unit))} H</text>`;
    const step = Math.max(
      unit === "cm" ? 500 : 304.8,
      Math.ceil(wall.width / 12000) * 1000,
    );
    for (let x = 0; x <= wall.width; x += step)
      svg += `<path d="M ${x} 0 V ${-font * 0.4}" stroke="#a48d75" stroke-width="${stroke}"/><text x="${x}" y="${-font * 0.7}" font-size="${font * 0.65}" text-anchor="middle" fill="#aaa08f">${e(fmt(x, unit))}</text>`;
  }
  for (const z of wall.zones)
    svg += `<rect x="${z.x}" y="${z.y}" width="${z.width}" height="${z.height}" fill="#b75f55" fill-opacity=".22" stroke="#a34d40" stroke-width="${stroke}"/><text x="${z.x + font * 0.3}" y="${z.y + font}" font-size="${font * 0.8}" fill="#742d24">${e(z.name)}</text>`;
  layers.forEach((l, i) => {
    const art = arts.find((a) => a.id === l.artworkId),
      b = bounds(l),
      selected = options.selected === l.artworkId;
    svg += `<g data-artid="${l.artworkId}" transform="translate(${l.x} ${l.y}) rotate(${l.rotation})"><rect x="${-l.width / 2}" y="${-l.height / 2}" width="${l.width}" height="${l.height}" fill="${l.frame ? e(l.frameColor) : "#ddd6c9"}" stroke="${selected ? "#b58029" : "#38342e"}" stroke-width="${selected ? 3 / scale : stroke}"/>`;
    if (images[l.artworkId])
      svg += `<image x="${-l.canvasWidth / 2}" y="${-l.canvasHeight / 2}" width="${l.canvasWidth}" height="${l.canvasHeight}" href="${e(images[l.artworkId])}" preserveAspectRatio="xMidYMid meet"/>`;
    else
      svg += `<text x="0" y="0" text-anchor="middle" fill="#4d483f" font-size="${Math.min(font, l.width / 8)}">No photo</text>`;
    if (l.frame && !l.frameKnown)
      svg += `<rect x="${-l.width / 2 + 2 / scale}" y="${-l.height / 2 + 2 / scale}" width="${Math.max(0, l.width - 4 / scale)}" height="${Math.max(0, l.height - 4 / scale)}" fill="none" stroke="${e(l.frameColor)}" stroke-width="${3 / scale}"/>`;
    svg += "</g>";
    if (options.labels) {
      const compact = b.width * scale < 175;
      svg += `<text x="${l.x}" y="${b.y + b.height + font * 1.2}" text-anchor="middle" fill="#302c25" font-size="${font * 0.8}" paint-order="stroke" stroke="#f4f0e8" stroke-width="${3 / scale}" stroke-linejoin="round">${compact ? "#" + (i + 1) : "#" + (i + 1) + " " + e(inv(l.artworkId) + " " + (art?.title || "Missing record").slice(0, 25))}</text><text x="${l.x}" y="${b.y + b.height + font * 2.25}" text-anchor="middle" fill="#302c25" font-size="${font * 0.72}" paint-order="stroke" stroke="#f4f0e8" stroke-width="${3 / scale}">${e(fmt(l.width, unit) + " W × " + fmt(l.height, unit) + " H")}${l.frame ? " · outside" : ""}${!l.verified ? " *" : ""}</text>`;
    }
    if (selected && !options.plane) {
      svg += `<path d="M 0 ${l.y} H ${b.x} M ${l.x} 0 V ${b.y}" stroke="#6a563a" stroke-width="${stroke}" stroke-dasharray="${4 / scale} ${3 / scale}"/><text x="${b.x / 2}" y="${l.y - font * 0.3}" text-anchor="middle" font-size="${font * 0.8}" fill="#4a3b26">${e(fmt(b.x, unit))}</text><text x="${l.x + font * 0.3}" y="${b.y / 2}" font-size="${font * 0.8}" fill="#4a3b26">${e(fmt(b.y, unit))}</text>`;
    }
  });
  if (!options.plane)
    svg += `<text x="${wall.width / 2}" y="${wall.height + pad * 0.75}" text-anchor="middle" font-size="${font * 0.8}" fill="${check.fits ? "#c6bca8" : "#f0afa2"}">${check.fits ? (check.verified ? "Verified measurements" : "UNVERIFIED / FRAME MEASUREMENTS REQUIRE CHECKING") : "LAYOUT DOES NOT FIT — CORRECT BEFORE EXPORT"}</text>`;
  if (options.legend && !options.plane) {
    layers.forEach((l, i) => {
      const a = arts.find((a) => a.id === l.artworkId),
        y = wall.height + pad + font * (i * 3 + 1);
      svg += `<text x="0" y="${y}" fill="#f4f0e8" font-size="${font * 0.85}">#${i + 1} ${e(inv(l.artworkId))} · ${e((a?.title || "Missing record").slice(0, 65))} · ${e((a?.artist || "Artist not recorded").slice(0, 40))}</text><text x="0" y="${y + font * 1.2}" fill="#c6bca8" font-size="${font * 0.75}">Canvas ${e(fmt(l.canvasWidth, unit))} × ${e(fmt(l.canvasHeight, unit))} · ${l.frame ? (l.frameKnown ? "Outside " + e(fmt(l.width, unit) + " × " + fmt(l.height, unit)) : "Frame outside UNKNOWN") : "Unframed"} · ${l.verified ? "Verified" : "Unverified"}</text>`;
    });
  }
  return svg + "</svg>";
}
export function imageFromData(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(Error("Could not render the proposal image."));
    image.src = src;
  });
}
export async function svgPng(svg: string) {
  const url = URL.createObjectURL(
    new Blob([svg], { type: "image/svg+xml;charset=utf-8" }),
  );
  try {
    const image = await imageFromData(url),
      canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw Error("Canvas is unavailable.");
    ctx.drawImage(image, 0, 0);
    return canvas.toDataURL("image/png");
  } finally {
    URL.revokeObjectURL(url);
  }
}
