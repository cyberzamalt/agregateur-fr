'use client';

import RatingStars from "@/components/RatingStars";
import type { Site } from "@/lib/api";

export default function SiteCard({ site }: { site: Site }) {
  return (
    <div style={{
      background: "#1f2937",
      border: "1px solid #374151",
      borderRadius: 10,
      padding: 12,
      marginBottom: 10
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 18 }}>{site.name || "(Sans nom)"}</div>
          <div style={{ opacity: 0.85, fontSize: 13, marginTop: 4 }}>
            {site.kind} • {site.commune ?? "—"} ({site.dept_code ?? "?"}) • {site.region ?? "—"}
          </div>
          {site.last_seen && (
            <div style={{ opacity: 0.7, fontSize: 12, marginTop: 4 }}>
              Dernière vue : {site.last_seen}
            </div>
          )}
        </div>
        <div style={{ textAlign: "right", minWidth: 110 }}>
          <div style={{ fontSize: 12, opacity: 0.8 }}>Abandon</div>
          <RatingStars value={site.score ?? 0} />
          <div style={{ fontSize: 12, opacity: 0.7 }}>
            {typeof site.score === "number" ? `${site.score.toFixed(1)} / 5` : "—"}
          </div>
        </div>
      </div>

      {site.score_reasons && site.score_reasons.length > 0 && (
        <ul style={{ marginTop: 8, paddingLeft: 18 }}>
          {site.score_reasons.slice(0, 3).map((r, i) => (
            <li key={i} style={{ fontSize: 13, opacity: 0.9 }}>{r}</li>
          ))}
        </ul>
      )}

      <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 6 }}>
        {site.access_flag && (
          <span style={badgeStyle}>
            Accès : {site.access_flag}
          </span>
        )}
        {(site.risk_flags || []).slice(0, 3).map((rf, i) => (
          <span key={i} style={{ ...badgeStyle, background: "#7f1d1d" }}>{rf}</span>
        ))}
        {site.sources && site.sources.length > 0 && (
          <span style={{ ...badgeStyle, background: "#1e3a8a" }}>
            {site.sources[0].type ?? "source"}
          </span>
        )}
      </div>
    </div>
  );
}

const badgeStyle: React.CSSProperties = {
  background: "#374151",
  color: "#e5e7eb",
  padding: "2px 8px",
  borderRadius: 999,
  fontSize: 12
};
