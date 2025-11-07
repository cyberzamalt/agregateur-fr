"use client";

import RatingStars from "./RatingStars";
import type { Feature } from "../lib/api";

export default function SiteCard({ f }: { f: Feature }) {
  const p = f.properties || {};
  const [lon, lat] = f.geometry?.coordinates || [];
  const coord = Number.isFinite(lat) && Number.isFinite(lon) ? `${lat.toFixed(5)}, ${lon.toFixed(5)}` : "";

  return (
    <div style={{ border: "1px solid #333", borderRadius: 12, padding: 12, background: "#0b0b0b" }}>
      <div style={{ fontWeight: 700 }}>{p.name || "Sans nom"}</div>
      <div style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>{p.address || coord}</div>
      <div style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>
        {(p.region || p.department || p.commune) && (
          <>
            {[p.commune, p.department, p.region].filter(Boolean).join(" • ")}
          </>
        )}
      </div>
      <div style={{ marginTop: 6 }}>
        <RatingStars value={typeof p.score === "number" ? p.score : 0} />
      </div>
      {p.kind && <div style={{ fontSize: 12, opacity: 0.8, marginTop: 6 }}>Type : {p.kind}</div>}
    </div>
  );
}
