"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  align,
  arrange,
  bounds,
  centre,
  defaultWall,
  dimensions,
  fmt,
  footprint,
  inv,
  makeLayer,
  mm,
  presets,
  recommend,
  separation,
  snapPosition,
  unitMm,
  validLayout,
  validate,
  type Art,
  type Layer,
  type Layout,
  type Preset,
  type Unit,
} from "../lib/wall-geometry";
import { wallSvg } from "../lib/wall-svg";
import { download, exportProposal } from "../lib/wall-proposal";
import { moneyLabel, type GalleryPhoto } from "../lib/workspace-ui";
import CalibratedRoom from "./calibrated-room";
import "./measurement.css";
const initialLayout = (arts: Art[], id?: number): Layout => ({
  version: 2,
  name: "Untitled composition",
  unit: "ft",
  wall: { ...defaultWall, zones: [] },
  layers: id
    ? arts
        .filter((a) => a.id === id)
        .map((a) => makeLayer(a, defaultWall))
        .filter((l): l is Layer => !!l)
    : [],
});
const clone = (l: Layout) => structuredClone(l);
function NumberField({
  label,
  value,
  onChange,
  min = 0,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
}) {
  return (
    <label>
      {label}
      <input
        type="number"
        step="any"
        min={min}
        value={Number(value.toFixed(4))}
        onChange={(e) => {
          if (e.target.value !== "" && Number.isFinite(e.target.valueAsNumber))
            onChange(e.target.valueAsNumber);
        }}
      />
    </label>
  );
}
export default function MeasurementStudio({
  artworks,
  photos,
  initialArtworkId,
}: {
  artworks: Art[];
  photos: GalleryPhoto[];
  initialArtworkId?: number;
}) {
  const [layout, setLayout] = useState<Layout>(() =>
      initialLayout(artworks, initialArtworkId),
    ),
    [selected, setSelected] = useState<number | undefined>(initialArtworkId),
    [images, setImages] = useState<Record<number, string>>({}),
    [query, setQuery] = useState(""),
    [tab, setTab] = useState("canvas"),
    [category, setCategory] = useState<
      "single" | "pair" | "triptych" | "collage" | "statement"
    >("single"),
    [frame, setFrame] = useState(false),
    [available, setAvailable] = useState(true),
    [preset, setPreset] = useState<Preset>("Salon Wall"),
    [labels, setLabels] = useState(true),
    [grid, setGrid] = useState(true),
    [snap, setSnap] = useState(true),
    [zoom, setZoom] = useState(1),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false),
    [history, setHistory] = useState<{ past: Layout[]; future: Layout[] }>({
      past: [],
      future: [],
    }),
    [saved, setSaved] = useState<{ id: string; title: string }[]>([]),
    [savedId, setSavedId] = useState("");
  const stage = useRef<HTMLDivElement>(null),
    drag = useRef<{
      id: number;
      dx: number;
      dy: number;
      before: Layout;
    } | null>(null),
    file = useRef<HTMLInputElement>(null);
  const filtered = useMemo(
    () =>
      artworks.filter(
        (a) =>
          !a.archived &&
          (!available || a.status === "Available") &&
          `${a.title} ${a.artist || ""} ${a.style || ""} ${a.medium || ""} ${inv(a.id)} ${a.legacyInventoryId || ""}`
            .toLowerCase()
            .includes(query.toLowerCase()),
      ),
    [artworks, available, query],
  );
  const suggestions = useMemo(
    () =>
      tab === "find" ? recommend(filtered, layout.wall, category, frame) : [],
    [filtered, layout.wall, category, frame, tab],
  );
  const check = validate(layout.wall, layout.layers, artworks),
    active = layout.layers.find((l) => l.artworkId === selected),
    box = footprint(layout.layers),
    u = layout.unit;
  const svg = useMemo(
    () => wallSvg(layout, artworks, images, { labels, grid, selected }),
    [layout, artworks, images, labels, grid, selected],
  );
  const ids = layout.layers
    .map((l) => l.artworkId)
    .sort((a, b) => a - b)
    .join(",");
  useEffect(() => {
    const controller = new AbortController();
    for (const id of ids.split(",").filter(Boolean).map(Number)) {
      const photo = photos.find((p) => p.artwork_id === id);
      if (!photo) continue;
      fetch("/api/media?id=" + encodeURIComponent(photo.id), {
        signal: controller.signal,
      })
        .then(async (r) => {
          if (!r.ok) throw Error("Photo unavailable");
          const blob = await r.blob();
          if (!["image/png", "image/jpeg", "image/webp"].includes(blob.type))
            throw Error("Unsupported photo");
          return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result));
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        })
        .then((src) => {
          if (!controller.signal.aborted)
            setImages((old) => ({ ...old, [id]: src }));
        })
        .catch(() => {});
    }
    return () => controller.abort();
  }, [ids, photos]);
  function commit(next: Layout) {
    setHistory((h) => ({
      past: [...h.past, clone(layout)].slice(-50),
      future: [],
    }));
    setLayout(next);
    setMessage("");
  }
  function patchLayer(patch: Partial<Layer>) {
    if (active)
      commit({
        ...layout,
        layers: layout.layers.map((l) =>
          l.artworkId === active.artworkId ? { ...l, ...patch } : l,
        ),
      });
  }
  function add(a: Art, replace = false) {
    const l = makeLayer(a, layout.wall, frame);
    if (!l) {
      setMessage(
        dimensions(a, frame).error ||
          "Measurements are missing. Edit this artwork in Inventory first.",
      );
      return;
    }
    if (layout.layers.some((l) => l.artworkId === a.id)) {
      setSelected(a.id);
      return;
    }
    if (!replace && layout.layers.length >= 12) {
      setMessage("Use up to 12 artworks per wall.");
      return;
    }
    commit({
      ...layout,
      layers:
        replace && active
          ? layout.layers.map((old) =>
              old === active ? { ...l, x: old.x, y: old.y } : old,
            )
          : [...layout.layers, l],
    });
    setSelected(a.id);
  }
  function historyStep(redo = false) {
    const source = redo ? history.future : history.past;
    if (!source.length) return;
    const next = source[source.length - 1];
    setHistory(
      redo
        ? {
            past: [...history.past, clone(layout)],
            future: source.slice(0, -1),
          }
        : {
            past: source.slice(0, -1),
            future: [...history.future, clone(layout)],
          },
    );
    setLayout(next);
  }
  function point(e: React.PointerEvent) {
    const svg = stage.current?.querySelector("svg"),
      matrix = svg?.getScreenCTM();
    if (!matrix) return null;
    return new DOMPoint(e.clientX, e.clientY).matrixTransform(matrix.inverse());
  }
  async function run(fn: () => Promise<void>) {
    setBusy(true);
    setMessage("");
    try {
      await fn();
    } catch (e) {
      setMessage(
        e instanceof Error ? e.message : "Operation failed. Please retry.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function listSaved() {
    const r = await fetch("/api/data?layouts=1"),
      d = (await r.json()) as {
        layouts?: { id: string; title: string }[];
        error?: string;
      };
    if (!r.ok || !Array.isArray(d.layouts))
      throw Error(
        d.error ||
          "Cloud layouts are not enabled yet. Use Backup JSON / Open JSON to save and reopen your work.",
      );
    setSaved(d.layouts);
  }
  const wallField = (
    key: "width" | "height" | "marginX" | "marginY" | "gap",
    label: string,
  ) => (
    <NumberField
      label={`${label} (${u})`}
      value={layout.wall[key] / unitMm[u]}
      min={key === "width" || key === "height" ? 0.01 : 0}
      onChange={(v) => {
        if (
          v >= 0 &&
          ((key !== "width" && key !== "height") || v > 0) &&
          mm(v, u) <= 100000
        )
          commit({ ...layout, wall: { ...layout.wall, [key]: mm(v, u) } });
      }}
    />
  );
  return (
    <section className="measure-studio">
      <header className="measure-heading">
        <div>
          <div className="eyebrow">SERAAI OS / MEASUREMENT STUDIO</div>
          <h2>A wall, composed to scale.</h2>
          <p>
            Real inventory. Real dimensions. Drag to place; zoom only changes
            your view.
          </p>
        </div>
        <div>
          <label>
            Composition name
            <input
              maxLength={100}
              value={layout.name}
              onChange={(e) => setLayout({ ...layout, name: e.target.value })}
            />
          </label>
          <div className="measure-toolbar">
            <button
              disabled={busy}
              onClick={() =>
                run(async () => {
                  const r = await fetch("/api/data", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        action: "save_layout",
                        id: savedId || undefined,
                        data: layout,
                      }),
                    }),
                    d = (await r.json()) as { id: string; error?: string };
                  if (!r.ok)
                    throw Error(
                      d.error === "Invalid action"
                        ? "Cloud saving is not enabled yet. Use Backup JSON to keep this layout."
                        : d.error || "Save failed",
                    );
                  setSavedId(d.id);
                  await listSaved();
                  setMessage("Layout saved to your workspace.");
                })
              }
            >
              Save layout
            </button>
            <button disabled={busy} onClick={() => run(listSaved)}>
              Open saved
            </button>
            <button
              onClick={() => {
                const url = URL.createObjectURL(
                  new Blob([JSON.stringify(layout)], {
                    type: "application/json",
                  }),
                );
                download(url, "SERAAI-layout.json");
                setTimeout(() => URL.revokeObjectURL(url), 1000);
              }}
            >
              Backup JSON
            </button>
            <button onClick={() => file.current?.click()}>Open JSON</button>
            <input
              hidden
              ref={file}
              type="file"
              accept=".json"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f)
                  run(async () => {
                    if (f.size > 1000000)
                      throw Error("Layout file exceeds 1 MB.");
                    const l = JSON.parse(await f.text());
                    if (!validLayout(l)) throw Error("Invalid layout file.");
                    commit(l);
                    setSavedId("");
                  });
                e.target.value = "";
              }}
            />
          </div>
          {saved.length > 0 && (
            <label>
              Saved compositions
              <select
                value={savedId}
                onChange={(e) => {
                  const id = e.target.value;
                  if (id)
                    run(async () => {
                      const r = await fetch(
                          "/api/data?layoutId=" + encodeURIComponent(id),
                        ),
                        d = (await r.json()) as {
                          layout: unknown;
                          error?: string;
                        };
                      if (!r.ok || !validLayout(d.layout))
                        throw Error(d.error || "Invalid saved layout");
                      commit(d.layout);
                      setSavedId(id);
                    });
                }}
              >
                <option value="">Choose a layout</option>
                {saved.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
      </header>
      {message && (
        <div className="measure-alert" role="status">
          {message}
        </div>
      )}
      <div className="measure-layout">
        <aside className="measure-sidebar">
          <div className="measure-panel">
            <h3>01 / Measure the wall</h3>
            <label>
              Display units
              <select
                value={u}
                onChange={(e) =>
                  commit({ ...layout, unit: e.target.value as Unit })
                }
              >
                <option value="ft">Feet</option>
                <option value="in">Inches</option>
                <option value="cm">Centimetres</option>
              </select>
            </label>
            <label>
              Wall preset · Width × Height
              <select
                defaultValue=""
                onChange={(e) => {
                  if (!e.target.value) return;
                  const [w, h] = e.target.value.split("x").map(Number);
                  commit({
                    ...layout,
                    wall: {
                      ...layout.wall,
                      width: mm(w, "ft"),
                      height: mm(h, "ft"),
                    },
                  });
                  e.target.value = "";
                }}
              >
                <option value="">Custom dimensions</option>
                {["3x5", "4x6", "6x8", "8x8"].map((p) => (
                  <option key={p} value={p}>
                    {p.replace("x", " × ")} ft
                  </option>
                ))}
              </select>
            </label>
            <div className="measure-fields">
              {wallField("width", "Width")}
              {wallField("height", "Height")}
              {wallField("marginX", "Side clearance")}
              {wallField("marginY", "Top / bottom")}
              {wallField("gap", "Preferred gap")}
              <label>
                Wall colour
                <input
                  type="color"
                  value={layout.wall.color}
                  onChange={(e) =>
                    commit({
                      ...layout,
                      wall: { ...layout.wall, color: e.target.value },
                    })
                  }
                />
              </label>
            </div>
            <details>
              <summary>Exclusion zones ({layout.wall.zones.length})</summary>
              <p>Positions measured from the wall’s top-left corner.</p>
              {layout.wall.zones.map((z) => (
                <div key={z.id}>
                  <label>
                    Name
                    <input
                      value={z.name}
                      maxLength={40}
                      onChange={(e) =>
                        commit({
                          ...layout,
                          wall: {
                            ...layout.wall,
                            zones: layout.wall.zones.map((old) =>
                              old.id === z.id
                                ? { ...z, name: e.target.value }
                                : old,
                            ),
                          },
                        })
                      }
                    />
                  </label>
                  <div className="measure-fields">
                    {(["x", "y", "width", "height"] as const).map((k) => (
                      <NumberField
                        key={k}
                        label={`${k} (${u})`}
                        value={z[k] / unitMm[u]}
                        onChange={(v) =>
                          commit({
                            ...layout,
                            wall: {
                              ...layout.wall,
                              zones: layout.wall.zones.map((old) =>
                                old.id === z.id ? { ...z, [k]: mm(v, u) } : old,
                              ),
                            },
                          })
                        }
                      />
                    ))}
                  </div>
                  <button
                    onClick={() =>
                      commit({
                        ...layout,
                        wall: {
                          ...layout.wall,
                          zones: layout.wall.zones.filter(
                            (old) => old.id !== z.id,
                          ),
                        },
                      })
                    }
                  >
                    Remove zone
                  </button>
                </div>
              ))}
              <button
                disabled={layout.wall.zones.length >= 10}
                onClick={() =>
                  commit({
                    ...layout,
                    wall: {
                      ...layout.wall,
                      zones: [
                        ...layout.wall.zones,
                        {
                          id: crypto.randomUUID(),
                          name: "Furniture / obstruction",
                          x: 0,
                          y: layout.wall.height * 0.75,
                          width: layout.wall.width / 2,
                          height: layout.wall.height / 4,
                        },
                      ],
                    },
                  })
                }
              >
                Add exclusion zone
              </button>
            </details>
          </div>
          <div className="measure-panel">
            <h3>02 / Choose artwork</h3>
            <label>
              Search inventory
              <input
                placeholder="Title, artist, style or ID"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
            <label className="measure-check">
              <input
                type="checkbox"
                checked={available}
                onChange={(e) => setAvailable(e.target.checked)}
              />
              Available inventory only
            </label>
            <label className="measure-check">
              <input
                type="checkbox"
                checked={frame}
                onChange={(e) => setFrame(e.target.checked)}
              />
              Use framed outside sizes
            </label>
            <button onClick={() => setTab("find")}>
              Find Art That Fits My Wall
            </button>
            <p>
              {filtered.length} artworks · {layout.layers.length}/12 on wall
            </p>
            <div className="measure-list">
              {filtered.map((a) => {
                const d = dimensions(a, frame),
                  photo = photos.find((p) => p.artwork_id === a.id);
                return (
                  <button
                    className="measure-art"
                    key={a.id}
                    onClick={() => add(a)}
                    title={"error" in d ? d.error : "Add at real scale"}
                  >
                    {photo && (
                      <img
                        loading="lazy"
                        src={"/api/media?id=" + encodeURIComponent(photo.id)}
                        alt=""
                      />
                    )}
                    <span>
                      {inv(a.id)} · {a.title}
                      <small>{a.artist || "Artist not recorded"}</small>
                      <small>
                        {"error" in d
                          ? d.error
                          : `${fmt(d.width, u)} × ${fmt(d.height, u)}${d.verified ? "" : " · unverified"}`}
                      </small>
                      {!photo && <small>No photograph</small>}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>
        <main>
          <div className="measure-toolbar">
            {[
              ["canvas", "Measured wall"],
              ["find", "Find a collection"],
              ["room", "Calibrated room"],
            ].map(([id, title]) => (
              <button
                key={id}
                aria-pressed={tab === id}
                onClick={() => setTab(id)}
              >
                {title}
              </button>
            ))}
            <button
              disabled={!history.past.length}
              onClick={() => historyStep()}
            >
              Undo
            </button>
            <button
              disabled={!history.future.length}
              onClick={() => historyStep(true)}
            >
              Redo
            </button>
          </div>
          <div className="measure-summary">
            <span>
              Wall {fmt(layout.wall.width, u)} × {fmt(layout.wall.height, u)}
            </span>
            <span>
              Usable {fmt(layout.wall.width - 2 * layout.wall.marginX, u)} ×{" "}
              {fmt(layout.wall.height - 2 * layout.wall.marginY, u)}
            </span>
            <span>
              Composition {fmt(box.width, u)} × {fmt(box.height, u)}
            </span>
          </div>
          {tab === "find" ? (
            <div className="measure-panel">
              <div className="measure-toolbar">
                {(
                  [
                    "single",
                    "pair",
                    "triptych",
                    "collage",
                    "statement",
                  ] as const
                ).map((c) => (
                  <button
                    key={c}
                    aria-pressed={category === c}
                    onClick={() => setCategory(c)}
                  >
                    {c}
                  </button>
                ))}
              </div>
              <p>
                Suggestions respect actual sizes, clearances and obstructions.
                Combination search is bounded; it is not exhaustive. Sold and
                reserved artworks are excluded.
              </p>
              <div className="measure-results">
                {suggestions.map((r) => (
                  <article key={r.id} className="measure-panel">
                    <h3>{r.preset}</h3>
                    {r.layers.map((l) => {
                      const a = artworks.find((a) => a.id === l.artworkId)!;
                      const photo = photos.find((p) => p.artwork_id === a.id);
                      return (
                        <div className="measure-art" key={a.id}>
                          {photo && (
                            <img
                              loading="lazy"
                              src={
                                "/api/media?id=" + encodeURIComponent(photo.id)
                              }
                              alt={a.title}
                            />
                          )}
                          <span>
                            {inv(a.id)} · {a.title}
                            <small>
                              {a.artist || "Artist not recorded"} ·{" "}
                              {a.status || "Availability unrecorded"}
                            </small>
                            <small>
                              {fmt(l.width, u)} × {fmt(l.height, u)} ·{" "}
                              {l.frame ? "Framed" : "Canvas"} ·{" "}
                              {l.verified ? "Verified" : "Unverified"}
                            </small>
                            <small>
                              {moneyLabel(a.price)}
                              {!photo ? " · No photograph" : ""}
                            </small>
                          </span>
                        </div>
                      );
                    })}
                    <p>
                      Fits geometrically · spare width {fmt(r.remaining.x, u)},
                      height {fmt(r.remaining.y, u)}
                    </p>
                    <button
                      onClick={() => {
                        commit({ ...layout, layers: r.layers });
                        setSelected(r.layers[0]?.artworkId);
                        setTab("canvas");
                      }}
                    >
                      Preview on measured wall
                    </button>
                  </article>
                ))}
              </div>
              {!suggestions.length && (
                <p>
                  No matching arrangement found. Check measurements,
                  availability, margins or frame dimensions.
                </p>
              )}
            </div>
          ) : tab === "room" ? (
            <CalibratedRoom
              layout={layout}
              artworks={artworks}
              images={images}
              onChange={commit}
            />
          ) : (
            <>
              <div className="measure-toolbar">
                <label className="measure-check">
                  <input
                    type="checkbox"
                    checked={labels}
                    onChange={(e) => setLabels(e.target.checked)}
                  />
                  Labels
                </label>
                <label className="measure-check">
                  <input
                    type="checkbox"
                    checked={grid}
                    onChange={(e) => setGrid(e.target.checked)}
                  />
                  Grid
                </label>
                <label className="measure-check">
                  <input
                    type="checkbox"
                    checked={snap}
                    onChange={(e) => setSnap(e.target.checked)}
                  />
                  Snap
                </label>
                <label>
                  View zoom {Math.round(zoom * 100)}%
                  <input
                    type="range"
                    min=".6"
                    max="2.5"
                    step=".1"
                    value={zoom}
                    onChange={(e) => setZoom(Number(e.target.value))}
                  />
                </label>
              </div>
              <div className="measure-stage">
                <div
                  className="measure-svg"
                  ref={stage}
                  style={{ width: `${zoom * 100}%` }}
                  onPointerDown={(e) => {
                    const target = (e.target as Element).closest(
                        "[data-artid]",
                      ),
                      id = Number(target?.getAttribute("data-artid")),
                      l = layout.layers.find((l) => l.artworkId === id),
                      p = point(e);
                    if (!l || !p) return;
                    setSelected(id);
                    if (l.locked) return;
                    e.currentTarget.setPointerCapture(e.pointerId);
                    drag.current = {
                      id,
                      dx: l.x - p.x,
                      dy: l.y - p.y,
                      before: clone(layout),
                    };
                  }}
                  onPointerMove={(e) => {
                    const d = drag.current,
                      p = point(e);
                    if (!d || !p) return;
                    setLayout((old) => ({
                      ...old,
                      layers: old.layers.map((l) =>
                        l.artworkId === d.id
                          ? snap
                            ? snapPosition(
                                l,
                                p.x + d.dx,
                                p.y + d.dy,
                                old.wall,
                                old.layers.filter((o) => o !== l),
                              )
                            : { ...l, x: p.x + d.dx, y: p.y + d.dy }
                          : l,
                      ),
                    }));
                  }}
                  onPointerUp={() => {
                    if (drag.current) {
                      const before = drag.current.before;
                      setHistory((h) => ({
                        past: [...h.past, before].slice(-50),
                        future: [],
                      }));
                      drag.current = null;
                    }
                  }}
                  onPointerCancel={() => {
                    if (drag.current) setLayout(drag.current.before);
                    drag.current = null;
                  }}
                  dangerouslySetInnerHTML={{ __html: svg }}
                />
              </div>
            </>
          )}
          <div
            className={"measure-alert " + (check.fits ? "measure-ok" : "")}
            role="status"
          >
            <strong>
              {check.fits
                ? check.verified
                  ? "Fits · verified artwork measurements"
                  : "Fits geometrically · unverified draft"
                : "Layout needs attention"}
            </strong>
            {check.errors.map((e) => (
              <div key={e}>{e}</div>
            ))}
            {check.warnings.map((e) => (
              <div key={e}>{e}</div>
            ))}
          </div>
          <div className="measure-panel">
            <h3>03 / Compose the collection</h3>
            <div className="measure-toolbar">
              <select
                aria-label="Collage preset"
                value={preset}
                onChange={(e) => setPreset(e.target.value as Preset)}
              >
                {presets.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
              <button
                onClick={() => {
                  const n =
                    preset === "Single Statement"
                      ? 1
                      : preset === "Symmetrical Pair"
                        ? 2
                        : preset === "Triptych"
                          ? 3
                          : 0;
                  if (n && layout.layers.length !== n) {
                    setMessage(`Select exactly ${n} artworks for ${preset}.`);
                    return;
                  }
                  commit({
                    ...layout,
                    layers: arrange(layout.layers, layout.wall, preset),
                  });
                }}
              >
                Auto-arrange / reset positions
              </button>
              <button
                onClick={() =>
                  commit({
                    ...layout,
                    layers: centre(layout.layers, layout.wall),
                  })
                }
              >
                Centre collection
              </button>
              <button
                onClick={() =>
                  commit({
                    ...layout,
                    layers: layout.layers.map((l) =>
                      l.locked ? l : { ...l, x: layout.wall.width - l.x },
                    ),
                  })
                }
              >
                Mirror positions
              </button>
              <select
                aria-label="Align artworks"
                value=""
                onChange={(e) => {
                  if (e.target.value)
                    commit({
                      ...layout,
                      layers: align(
                        layout.layers,
                        e.target.value as Parameters<typeof align>[1],
                      ),
                    });
                }}
              >
                <option value="">Align artwork…</option>
                {["top", "bottom", "left", "right", "centre-y"].map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </div>
            <label>
              Selected artwork
              <select
                value={selected ?? ""}
                onChange={(e) => setSelected(Number(e.target.value))}
              >
                <option value="">Choose artwork</option>
                {layout.layers.map((l) => (
                  <option key={l.artworkId} value={l.artworkId}>
                    {inv(l.artworkId)} ·{" "}
                    {artworks.find((a) => a.id === l.artworkId)?.title ||
                      "Missing artwork"}
                  </option>
                ))}
              </select>
            </label>
            {active && (
              <>
                <div className="measure-fields">
                  <NumberField
                    label={`Centre X from left (${u})`}
                    value={active.x / unitMm[u]}
                    min={-10000}
                    onChange={(v) => {
                      if (!active.locked) patchLayer({ x: mm(v, u) });
                    }}
                  />
                  <NumberField
                    label={`Centre Y from top (${u})`}
                    value={active.y / unitMm[u]}
                    min={-10000}
                    onChange={(v) => {
                      if (!active.locked) patchLayer({ y: mm(v, u) });
                    }}
                  />
                  <label>
                    Physical rotation
                    <select
                      disabled={active.locked}
                      value={active.rotation}
                      onChange={(e) =>
                        patchLayer({
                          rotation: Number(e.target.value) as Layer["rotation"],
                        })
                      }
                    >
                      {[0, 90, 180, 270].map((n) => (
                        <option key={n} value={n}>
                          {n}°
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Frame colour
                    <input
                      type="color"
                      value={active.frameColor}
                      onChange={(e) =>
                        patchLayer({ frameColor: e.target.value })
                      }
                    />
                  </label>
                </div>
                <div className="measure-toolbar">
                  <button
                    aria-pressed={active.locked}
                    onClick={() => patchLayer({ locked: !active.locked })}
                  >
                    {active.locked ? "Unlock" : "Lock"} position
                  </button>
                  <button
                    disabled={active.locked}
                    onClick={() => {
                      const a = artworks.find((a) => a.id === active.artworkId),
                        l = a && makeLayer(a, layout.wall, !active.frame);
                      if (l)
                        patchLayer({
                          ...l,
                          x: active.x,
                          y: active.y,
                          rotation: active.rotation,
                          frameColor: active.frameColor,
                        });
                    }}
                  >
                    Use {active.frame ? "canvas" : "framed"} footprint
                  </button>
                  <button
                    disabled={active.locked}
                    onClick={() =>
                      commit({
                        ...layout,
                        layers: layout.layers.filter((l) => l !== active),
                      })
                    }
                  >
                    Remove from wall
                  </button>
                  <select
                    disabled={active.locked}
                    value=""
                    aria-label="Replace selected artwork"
                    onChange={(e) => {
                      const a = artworks.find(
                        (a) => a.id === Number(e.target.value),
                      );
                      if (a) add(a, true);
                    }}
                  >
                    <option value="">Replace artwork…</option>
                    {filtered
                      .filter(
                        (a) => !layout.layers.some((l) => l.artworkId === a.id),
                      )
                      .map((a) => (
                        <option key={a.id} value={a.id}>
                          {inv(a.id)} · {a.title}
                        </option>
                      ))}
                  </select>
                  <select
                    disabled={active.locked}
                    value=""
                    aria-label="Swap positions"
                    onChange={(e) => {
                      const other = layout.layers.find(
                        (l) => l.artworkId === Number(e.target.value),
                      );
                      if (other && !other.locked)
                        commit({
                          ...layout,
                          layers: layout.layers.map((l) =>
                            l === active
                              ? { ...l, x: other.x, y: other.y }
                              : l === other
                                ? { ...l, x: active.x, y: active.y }
                                : l,
                          ),
                        });
                    }}
                  >
                    <option value="">Swap positions…</option>
                    {layout.layers
                      .filter((l) => l !== active && !l.locked)
                      .map((l) => (
                        <option key={l.artworkId} value={l.artworkId}>
                          {inv(l.artworkId)}
                        </option>
                      ))}
                  </select>
                </div>
                <p>
                  Wall edge distances: left {fmt(bounds(active).x, u)} · top{" "}
                  {fmt(bounds(active).y, u)} · right{" "}
                  {fmt(
                    layout.wall.width - bounds(active).x - bounds(active).width,
                    u,
                  )}{" "}
                  · bottom{" "}
                  {fmt(
                    layout.wall.height -
                      bounds(active).y -
                      bounds(active).height,
                    u,
                  )}
                  .
                </p>
                {layout.layers
                  .filter((l) => l !== active)
                  .map((l) => {
                    const g = separation(active, l);
                    return (
                      <p key={l.artworkId}>
                        To {inv(l.artworkId)}: horizontal edge gap{" "}
                        {fmt(g.horizontal, u)} · vertical edge gap{" "}
                        {fmt(g.vertical, u)}
                      </p>
                    );
                  })}
              </>
            )}
            <button
              onClick={() =>
                commit({
                  ...layout,
                  layers: layout.layers.map((l) => {
                    const a = artworks.find((a) => a.id === l.artworkId),
                      fresh = a && makeLayer(a, layout.wall, l.frame);
                    return fresh
                      ? {
                          ...l,
                          ...fresh,
                          x: l.x,
                          y: l.y,
                          rotation: l.rotation,
                          locked: l.locked,
                          frameColor: l.frameColor,
                        }
                      : l;
                  }),
                })
              }
            >
              Refresh inventory measurements
            </button>
          </div>
          <div className="measure-panel">
            <h3>Artwork legend & proposal</h3>
            <div className="measure-scroll">
              <table className="measure-legend">
                <thead>
                  <tr>
                    <th>Artwork</th>
                    <th>Canvas W × H</th>
                    <th>Outside W × H</th>
                    <th>Verification</th>
                    <th>Price</th>
                  </tr>
                </thead>
                <tbody>
                  {layout.layers.map((l, i) => {
                    const a = artworks.find((a) => a.id === l.artworkId);
                    return (
                      <tr key={l.artworkId}>
                        <td>
                          #{i + 1} {inv(l.artworkId)}
                          <br />
                          {a?.title || "Missing artwork"}
                          <br />
                          {a?.artist}
                        </td>
                        <td>
                          {fmt(l.canvasWidth, u)} × {fmt(l.canvasHeight, u)}
                        </td>
                        <td>
                          {l.frame
                            ? l.frameKnown
                              ? `${fmt(l.width, u)} × ${fmt(l.height, u)}`
                              : "Unknown"
                            : "Unframed"}
                        </td>
                        <td>{l.verified ? "Verified" : "Unverified"}</td>
                        <td>{moneyLabel(a?.price)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="measure-toolbar">
              <button
                disabled={busy || !check.fits}
                onClick={() =>
                  run(() => exportProposal(layout, artworks, images, "pdf"))
                }
              >
                Export proposal PDF
              </button>
              <button
                disabled={busy || !check.fits}
                onClick={() =>
                  run(() => exportProposal(layout, artworks, images, "png"))
                }
              >
                Export measured PNG
              </button>
            </div>
            <p>
              Unverified sizes remain marked as drafts. Missing photos appear as
              placeholders. Confirm wall and hanging hardware measurements on
              site.
            </p>
          </div>
        </main>
      </div>
    </section>
  );
}
