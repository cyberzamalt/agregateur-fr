"use client";

import type { SiteFeature } from "../lib/api";
import RatingStars from "./RatingStars";

export default function SiteCard({ feature }: { feature: SiteFeature }) {
  const p = feature.properties;

  return (
    <div style={{ padding: 12, border: "1px solid #333", borderRadius: 10 }}>
      <div style={{ fontWeight: 700 }}>{p.name}</div>
      {p.address && <div style={{ opacity: 0.8, fontSize: 13 }}>📍 {p.address}</div>}
      <div style={{ opacity: 0.8, fontSize: 13 }}>
        {p.commune ? `${p.commune}, ` : ""}
        {p.department ? `${p.department}, ` : ""}
        {p.region ?? ""}
      </div>
      {typeof p.score === "number" && (
        <div style={{ marginTop: 6 }}>
          <RatingStars value={p.score} />
        </div>
      )}
    </div>
  );
}
