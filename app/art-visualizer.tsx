"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import type { GalleryRecord, GalleryPhoto } from "../lib/workspace-ui";
import MeasurementStudio from "./measurement-studio";
const Legacy = dynamic(() => import("./legacy-art-visualizer"), { ssr: false });
export default function ArtVisualizer(props: {
  artworks: GalleryRecord[];
  photos: GalleryPhoto[];
  initialArtworkId?: number;
}) {
  const [mode, setMode] = useState("measure");
  return (
    <>
      <div className="measure-mode">
        <button
          aria-pressed={mode === "measure"}
          onClick={() => setMode("measure")}
        >
          True Scale · Wall & Collage Studio
        </button>
        <button aria-pressed={mode === "room"} onClick={() => setMode("room")}>
          Free room styling
        </button>
      </div>
      <div hidden={mode !== "measure"}>
        <MeasurementStudio {...props} />
      </div>
      {mode === "room" && (
        <>
          <p className="muted">
            Free styling is an approximate visual preview. Use True Scale for
            physical measurements and installation proposals.
          </p>
          <Legacy {...props} />
        </>
      )}
    </>
  );
}
