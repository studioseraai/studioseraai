import test from "node:test";
import assert from "node:assert/strict";
import {
  mm,
  selectableArt,
  defaultWall,
  makeLayer,
  bounds,
  validate,
  arrange,
  recommend,
  dimensions,
  validLayout,
  snapPosition,
} from "../lib/wall-geometry.ts";
import { homography, project, validQuad } from "../lib/wall-projection.ts";
import { wallSvg } from "../lib/wall-svg.ts";
const art = (id = 1, width = 121.92, height = 121.92) => ({
  id,
  title: "QA <painting>",
  width,
  height,
  status: "Available",
  measurementVerified: true,
});
const wall = { ...defaultWall, zones: [] };
const layout = (layers) => ({
  version: 2,
  name: "Test",
  unit: "in",
  wall,
  layers,
});
test("48-inch artwork centred on 96-inch wall leaves 24 inches each side", () => {
  const l = makeLayer(art(), wall),
    b = bounds(l);
  assert.equal(l.width / wall.width, 0.5);
  assert.ok(Math.abs(b.x - mm(24, "in")) < 1e-8);
  assert.ok(Math.abs(b.y - mm(24, "in")) < 1e-8);
  assert.ok(Math.abs(wall.width - b.x - b.width - mm(24, "in")) < 1e-8);
  assert.equal(validate(wall, [l]).verified, true);
});
test("unit conversions preserve physical dimensions and SVG export uses same coordinates", () => {
  assert.ok(Math.abs(mm(8, "ft") - mm(96, "in")) < 1e-8);
  const l = makeLayer(art(), wall),
    s = wallSvg(layout([l]), [art()], {}, {});
  assert.match(s, /translate\(1219.2 1219.2\)/);
  assert.match(s, /width="1219.2"/);
  assert.match(s, /No photo/);
});
test("oversized and missing-size works never silently shrink", () => {
  const huge = makeLayer(art(1, 400, 400), wall);
  assert.equal(huge.width, 4000);
  assert.equal(validate(wall, [huge]).fits, false);
  assert.equal(makeLayer(art(1, "", 60), wall), null);
  assert.equal(recommend([art(1, 400, 400)], wall, "single").length, 0);
});
test("framed outside dimensions determine physical footprint and unknowns cannot claim verified fit", () => {
  const a = { ...art(), framedWidth: 140, framedHeight: 150 },
    l = makeLayer(a, wall, true);
  assert.equal(l.width, 1400);
  assert.equal(l.canvasWidth, 1219.2);
  assert.equal(validate(wall, [makeLayer(art(), wall, true)]).verified, false);
  assert.equal(recommend([art()], wall, "single", true).length, 0);
  assert.ok(dimensions({ ...a, framedWidth: 10 }, true).error);
});
test("pairs respect gap and margins; rotation only changes when explicitly assigned", () => {
  const ls = [makeLayer(art(1, 70, 90), wall), makeLayer(art(2, 70, 90), wall)],
    placed = arrange(ls, wall, "Symmetrical Pair");
  assert.equal(validate(wall, placed).fits, true);
  assert.ok(
    Math.abs(bounds(placed[1]).x - bounds(placed[0]).x - 700 - wall.gap) <
      0.001,
  );
  assert.equal(placed[0].rotation, 0);
  const rotated = { ...placed[0], rotation: 90 };
  assert.equal(bounds(rotated).width, 900);
});
test("overlap, exclusion zones and clearances fail deterministically", () => {
  const l = makeLayer(art(), wall);
  assert.equal(validate(wall, [l, { ...l, artworkId: 2 }]).fits, false);
  assert.equal(
    validate(
      {
        ...wall,
        zones: [
          {
            id: "z",
            name: "Window",
            x: 1000,
            y: 1000,
            width: 100,
            height: 100,
          },
        ],
      },
      [l],
    ).fits,
    false,
  );
  assert.equal(validate({ ...wall, marginX: 2000 }, [l]).fits, false);
});
test("saved layouts retain mm coordinates, locks and rotation; malformed input rejected", () => {
  const l = { ...makeLayer(art(), wall), locked: true, rotation: 90 },
    saved = JSON.parse(JSON.stringify(layout([l])));
  assert.equal(validLayout(saved), true);
  assert.deepEqual(saved.layers[0], l);
  assert.equal(
    validLayout({ ...saved, wall: { ...wall, zones: [null] } }),
    false,
  );
  assert.equal(
    validLayout({
      ...saved,
      room: { image: "https://evil.test", corners: [], prepared: true },
    }),
    false,
  );
  assert.equal(
    validLayout({
      ...saved,
      layers: [{ ...l, frameColor: '" onload="alert(1)' }],
    }),
    false,
  );
  assert.equal(
    validLayout({ ...saved, layers: [{ ...l, verified: "true" }] }),
    false,
  );
});
test("inventory changes and archived records invalidate saved measurements", () => {
  const l = makeLayer(art(), wall);
  assert.equal(validate(wall, [l], [art(1, 100, 100)]).fits, false);
  assert.equal(validate(wall, [l], [{ ...art(), archived: true }]).fits, false);
  assert.equal(validate(wall, [l], []).fits, false);
});
test("all 8 collage presets preserve every artwork dimension and locked position", () => {
  const ls = [1, 2, 3, 4, 5].map((id) =>
    makeLayer(art(id, 30 + id * 2, 40), wall),
  );
  ls[0].locked = true;
  for (const preset of [
    "Single Statement",
    "Symmetrical Pair",
    "Triptych",
    "Salon Wall",
    "Statement + Supporting Art",
    "Symmetrical Grid",
    "Vertical Stack",
    "Freeform Collage",
  ]) {
    const placed = arrange(ls, wall, preset);
    assert.deepEqual(placed[0], ls[0]);
    assert.deepEqual(
      placed.map((l) => [l.width, l.height]),
      ls.map((l) => [l.width, l.height]),
    );
  }
});
test("bounded recommendations for 600 real records are valid, exclude unavailable and complete promptly", () => {
  const arts = Array.from({ length: 600 }, (_, i) => ({
      ...art(i + 1, 20 + (i % 80), 25 + (i % 70)),
      status: i % 5 === 0 ? "Sold" : i % 7 === 0 ? "Reserved" : "Available",
    })),
    start = performance.now();
  for (const category of ["single", "pair", "triptych", "collage", "statement"])
    for (const r of recommend(arts, wall, category)) {
      assert.equal(validate(wall, r.layers, arts).fits, true);
      assert.ok(
        r.layers.every((l) => arts[l.artworkId - 1].status === "Available"),
      );
    }
  assert.ok(performance.now() - start < 3000);
});
test("snapping moves only position and respects locks", () => {
  const l = makeLayer(art(), wall),
    s = snapPosition(l, l.x + 4, l.y + 2, wall, []);
  assert.equal(s.x, l.x);
  assert.equal(s.width, l.width);
  assert.deepEqual(snapPosition({ ...l, locked: true }, 100, 100, wall, []), {
    ...l,
    locked: true,
  });
});
test("projective transform maps all four corners exactly; crossing corners rejected", () => {
  const corners = [
      { x: 0.1, y: 0.1 },
      { x: 0.9, y: 0.2 },
      { x: 0.8, y: 0.8 },
      { x: 0.2, y: 0.9 },
    ],
    h = homography(corners);
  [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 1, y: 1 },
    { x: 0, y: 1 },
  ].forEach((p, i) => {
    const q = project(h, p);
    assert.ok(Math.abs(q.x - corners[i].x) < 1e-8);
    assert.ok(Math.abs(q.y - corners[i].y) < 1e-8);
  });
  assert.equal(
    validQuad([corners[0], corners[2], corners[1], corners[3]]),
    false,
  );
});
test("SVG labels escape inventory text", () => {
  const s = wallSvg(
    layout([makeLayer(art(), wall)]),
    [art()],
    {},
    { labels: true },
  );
  assert.match(s, /&lt;painting&gt;/);
  assert.ok(!s.includes("<painting>"));
});

test("small companions remain discoverable beneath hundreds of larger artworks", () => {
  const arts = [
    ...Array.from({ length: 598 }, (_, i) => art(i + 1, 160, 160)),
    art(599, 30, 40),
    art(600, 30, 40),
  ];
  const results = recommend(arts, wall, "pair");
  assert.ok(results.some((r) => r.layers.some((l) => l.artworkId >= 599)));
});

test("imported artworks with blank availability remain selectable without being relabelled available", () => {
  const a = { ...art(), status: "" };
  assert.equal(selectableArt(a), true);
  assert.equal(selectableArt(a, true), false);
  assert.equal(selectableArt({ ...a, archived: true }), false);
  assert.equal(recommend([a], wall, "single").length, 1);
  assert.equal(a.status, "");
  assert.equal(
    recommend([{ ...a, status: " sold " }], wall, "single").length,
    0,
  );
  assert.equal(
    recommend([{ ...a, status: "reserved" }], wall, "single").length,
    0,
  );
});
