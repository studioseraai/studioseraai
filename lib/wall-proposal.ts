import {
  bounds,
  footprint,
  fmt,
  inv,
  separation,
  validate,
  type Layout,
  type Art,
} from "./wall-geometry";
import { wallSvg, svgPng } from "./wall-svg";
export function download(url: string, name: string) {
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
}
export async function exportProposal(
  layout: Layout,
  arts: Art[],
  images: Record<number, string>,
  format: "png" | "pdf",
) {
  const check = validate(layout.wall, layout.layers, arts);
  if (!check.fits) throw Error("Correct layout errors before exporting.");
  const png = await svgPng(
    wallSvg(layout, arts, images, { labels: true, legend: format === "png" }),
  );
  if (format === "png") {
    download(png, "SERAAI-wall-plan.png");
    return;
  }
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ unit: "mm", format: "a4" });
  let y = 18;
  const line = (text: string, size = 10) => {
    pdf.setFontSize(size);
    const lines = pdf.splitTextToSize(text, 174);
    if (y + lines.length * size * 0.45 > 280) {
      pdf.addPage();
      y = 18;
    }
    pdf.text(lines, 18, y);
    y += lines.length * size * 0.45 + 4;
  };
  line("SERAAI OS / ARTWORK PROPOSAL", 16);
  line(layout.name || "Wall composition", 13);
  line(
    check.verified
      ? "Verified inventory measurements — confirm wall measurements on site."
      : "DRAFT — unverified inventory or unknown frame outside sizes.",
  );
  line(
    `Wall: ${fmt(layout.wall.width, layout.unit)} W x ${fmt(layout.wall.height, layout.unit)} H | Gap: ${fmt(layout.wall.gap, layout.unit)}`,
  );
  const footprintSize = footprint(layout.layers);
  line(
    `Arrangement footprint: ${fmt(footprintSize.width, layout.unit)} W x ${fmt(footprintSize.height, layout.unit)} H`,
  );
  const image = pdf.getImageProperties(png),
    h = Math.min(130, (174 * image.height) / image.width),
    w = (h * image.width) / image.height;
  pdf.addImage(png, "PNG", 18, y, w, h);
  y += h + 10;
  let total = 0,
    unknown = 0;
  for (const [i, l] of layout.layers.entries()) {
    const a = arts.find((a) => a.id === l.artworkId),
      b = bounds(l);
    line(
      `#${i + 1} ${inv(l.artworkId)} — ${a?.title || "Missing artwork"} / ${a?.artist || "Artist not recorded"}`,
      11,
    );
    line(
      `Canvas ${fmt(l.canvasWidth, layout.unit)} W x ${fmt(l.canvasHeight, layout.unit)} H. ${l.frame ? (l.frameKnown ? `Framed outside ${fmt(l.width, layout.unit)} x ${fmt(l.height, layout.unit)}` : "Frame outside size UNKNOWN") : "Unframed"}. Rotation ${l.rotation} degrees. ${l.verified ? "Verified" : "Unverified"}.`,
    );
    line(
      `Position from wall top-left: centre ${fmt(l.x, layout.unit)}, ${fmt(l.y, layout.unit)}; edges left ${fmt(b.x, layout.unit)}, top ${fmt(b.y, layout.unit)}. Status: ${a?.status || "Not recorded"}.`,
    );
    const known =
      a?.price !== undefined &&
      a.price !== null &&
      Number.isFinite(Number(a.price));
    if (known) total += Number(a.price);
    else unknown++;
    line(
      known
        ? `PKR ${Number(a.price).toLocaleString("en-PK")}`
        : "Price not recorded",
    );
  }
  for (let i = 0; i < layout.layers.length; i++)
    for (let j = i + 1; j < layout.layers.length; j++) {
      const g = separation(layout.layers[i], layout.layers[j]);
      line(
        `#${i + 1} to #${j + 1}: horizontal edge separation ${fmt(g.horizontal, layout.unit)}, vertical ${fmt(g.vertical, layout.unit)}.`,
      );
    }
  line(
    `Recorded prices total: PKR ${total.toLocaleString("en-PK")}${unknown ? ` (${unknown} artwork prices missing; total incomplete)` : ""}`,
    12,
  );
  line(
    "Positions describe artwork bounds, not hanging hardware. Verify site dimensions, hardware and frame measurements before installation.",
  );
  pdf.save("SERAAI-artwork-proposal.pdf");
}
