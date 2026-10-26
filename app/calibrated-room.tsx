"use client";
import { useEffect, useRef, useState } from "react";
import { type Art, type Layout, type Point } from "../lib/wall-geometry";
import { imageFromData, wallSvg } from "../lib/wall-svg";
import { validQuad, warp } from "../lib/wall-projection";
import { roomTemplates } from "../lib/visualizer-rooms";
export default function CalibratedRoom({
  layout,
  artworks,
  images,
  onChange,
}: {
  layout: Layout;
  artworks: Art[];
  images: Record<number, string>;
  onChange: (l: Layout) => void;
}) {
  const canvas = useRef<HTMLCanvasElement>(null),
    [marking, setMarking] = useState(false),
    [points, setPoints] = useState<Point[]>([]),
    [error, setError] = useState("");
  const room = layout.room;
  useEffect(() => {
    let cancelled = false;
    async function render() {
      const c = canvas.current,
        ctx = c?.getContext("2d");
      if (!c || !ctx) return;
      ctx.clearRect(0, 0, c.width, c.height);
      if (!room) return;
      const bg = await imageFromData(room.image);
      if (cancelled) return;
      c.width = bg.width;
      c.height = bg.height;
      ctx.drawImage(bg, 0, 0);
      if (room.prepared && validQuad(room.corners) && !marking) {
        const blob = URL.createObjectURL(
          new Blob([wallSvg(layout, artworks, images, { plane: true })], {
            type: "image/svg+xml",
          }),
        );
        try {
          const art = await imageFromData(blob);
          if (cancelled) return;
          ctx.save();
          ctx.beginPath();
          room.corners.forEach((p, i) =>
            i
              ? ctx.lineTo(p.x * c.width, p.y * c.height)
              : ctx.moveTo(p.x * c.width, p.y * c.height),
          );
          ctx.closePath();
          ctx.fillStyle = layout.wall.color;
          ctx.globalAlpha = 0.45;
          ctx.globalCompositeOperation = "multiply";
          ctx.fill();
          ctx.restore();
          warp(ctx, art, room.corners, c.width, c.height);
        } finally {
          URL.revokeObjectURL(blob);
        }
      }
      const shown = marking ? points : room.corners;
      ctx.font = `${Math.max(18, c.width / 60)}px Arial`;
      shown.forEach((p, i) => {
        ctx.fillStyle = "#c39447";
        ctx.beginPath();
        ctx.arc(p.x * c.width, p.y * c.height, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillText(String(i + 1), p.x * c.width + 10, p.y * c.height + 10);
      });
    }
    render().catch((e) => {
      if (!cancelled) setError(e.message);
    });
    return () => {
      cancelled = true;
    };
  }, [room, layout, artworks, images, marking, points]);
  return (
    <div className="measure-panel measure-room">
      <h3>Calibrate a real wall</h3>
      <p>
        Mark the four corners of the measured wall plane: top-left → top-right →
        bottom-right → bottom-left. Enter that plane’s actual width and height
        in the wall panel. Room projection depends on your calibration; the
        measured wall remains the installation reference.
      </p>
      <div className="measure-toolbar">
        <select
          aria-label="Room photograph"
          value={
            roomTemplates.some((r) => r.image === room?.image)
              ? room?.image
              : ""
          }
          onChange={(e) => {
            if (e.target.value) {
              onChange({
                ...layout,
                room: { image: e.target.value, corners: [], prepared: true },
              });
              setPoints([]);
              setMarking(true);
            }
          }}
        >
          <option value="">Select room photograph</option>
          {roomTemplates.map((r) => (
            <option key={r.id} value={r.image}>
              {r.name}
            </option>
          ))}
        </select>
        <label>
          Upload client room
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              setError("");
              const url = URL.createObjectURL(f);
              try {
                if (
                  !["image/jpeg", "image/png", "image/webp"].includes(f.type) ||
                  f.size > 20000000
                )
                  throw Error("Choose JPG, PNG or WebP up to 20 MB.");
                const image = await imageFromData(url);
                if (image.width * image.height > 40000000)
                  throw Error("Use an image under 40 megapixels.");
                const c = document.createElement("canvas"),
                  ratio = Math.min(1, 1200 / image.width, 900 / image.height);
                c.width = image.width * ratio;
                c.height = image.height * ratio;
                c.getContext("2d")!.drawImage(image, 0, 0, c.width, c.height);
                const data = c.toDataURL("image/jpeg", 0.7);
                if (data.length > 600000)
                  throw Error(
                    "Room image is too detailed. Upload a smaller image.",
                  );
                onChange({
                  ...layout,
                  room: { image: data, corners: [], prepared: false },
                });
                setPoints([]);
                setMarking(true);
              } catch (e) {
                setError(
                  e instanceof Error ? e.message : "Could not load photo",
                );
              } finally {
                URL.revokeObjectURL(url);
                e.target.value = "";
              }
            }}
          />
        </label>
        <button
          disabled={!room}
          onClick={() => {
            setMarking(true);
            setPoints([]);
          }}
        >
          Mark four wall corners
        </button>
      </div>
      {room && (
        <label className="measure-check">
          <input
            type="checkbox"
            checked={room.prepared}
            onChange={(e) =>
              onChange({
                ...layout,
                room: { ...room, prepared: e.target.checked },
              })
            }
          />
          This is an empty or prepared clean wall; existing paintings have been
          removed.
        </label>
      )}
      {marking && (
        <p>
          Click corner {points.length + 1} of 4. The marked plane must match
          your entered wall dimensions.
        </p>
      )}
      {error && (
        <div role="alert" className="measure-alert">
          {error}
        </div>
      )}
      <canvas
        ref={canvas}
        width={1200}
        height={750}
        aria-label="Room photograph; select four wall corners"
        onClick={(e) => {
          if (!marking || !room) return;
          const rect = e.currentTarget.getBoundingClientRect(),
            next = [
              ...points,
              {
                x: (e.clientX - rect.left) / rect.width,
                y: (e.clientY - rect.top) / rect.height,
              },
            ];
          if (next.length === 4) {
            if (!validQuad(next)) {
              setError(
                "Corners must form a convex wall plane. Mark again in clockwise order.",
              );
              setPoints([]);
              return;
            }
            onChange({ ...layout, room: { ...room, corners: next } });
            setMarking(false);
            setError("");
          }
          setPoints(next);
        }}
      />
      {!room && <p>Select or upload a room to begin.</p>}
      {room && !room.prepared && (
        <p>
          Confirm that the wall is clean before projecting artwork. Use the
          existing room styling tools to prepare a replacement image when
          needed.
        </p>
      )}
    </div>
  );
}
