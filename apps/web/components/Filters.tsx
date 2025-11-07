"use client";

import { useEffect, useMemo, useState } from "react";
import { SiteFilters } from "../lib/api";
import { fetchMeta } from "../lib/api";

type Props = {
  value: SiteFilters;
  onChange: (v: SiteFilters) => void;
};

export default function Filters({ value, onChange }: Props) {
  const [loading, setLoading] = useState(false);
  const [meta, setMeta] = useState<{
    regions: string[];
    departments: string[];
    communes: string[];
    kinds: string[];
  }>({ regions: [], departments: [], communes: [], kinds: [] });

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const m = await fetchMeta();
        setMeta({
          regions: m.regions || [],
          departments: m.departments || [],
          communes: m.communes || [],
          kinds: m.kinds || [],
        });
      } catch {
        // silencieux
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function upd(patch: Partial<SiteFilters>) {
    onChange({ ...value, ...patch });
  }

  const scoreOptions = useMemo(() => [0, 1, 2, 3, 4, 5], []);

  return (
    <div style={{ display: "grid", gap: 8, gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", marginBottom: 12 }}>
      <input
        placeholder="Recherche (nom / adresse)"
        value={value.q || ""}
        onChange={(e) => upd({ q: e.target.value })}
        style={{ padding: 8, borderRadius: 8, border: "1px solid #333", background: "#0b0b0b", color: "#fff" }}
      />

      <select
        value={value.kind || ""}
        onChange={(e) => upd({ kind: e.target.value || undefined })}
        disabled={loading}
        style={{ padding: 8, borderRadius: 8, border: "1px solid #333", background: "#0b0b0b", color: "#fff" }}
      >
        <option value="">Type (tous)</option>
        {meta.kinds.map((k) => (
          <option key={k} value={k}>
            {k}
          </option>
        ))}
      </select>

      <select
        value={value.region || ""}
        onChange={(e) => upd({ region: e.target.value || undefined, department: undefined, commune: undefined })}
        disabled={loading}
        style={{ padding: 8, borderRadius: 8, border: "1px solid #333", background: "#0b0b0b", color: "#fff" }}
      >
        <option value="">Région (toutes)</option>
        {meta.regions.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>

      <select
        value={value.department || ""}
        onChange={(e) => upd({ department: e.target.value || undefined, commune: undefined })}
        disabled={loading}
        style={{ padding: 8, borderRadius: 8, border: "1px solid #333", background: "#0b0b0b", color: "#fff" }}
      >
        <option value="">Département (tous)</option>
        {meta.departments.map((d) => (
          <option key={d} value={d}>
            {d}
          </option>
        ))}
      </select>

      <select
        value={value.commune || ""}
        onChange={(e) => upd({ commune: e.target.value || undefined })}
        disabled={loading}
        style={{ padding: 8, borderRadius: 8, border: "1px solid #333", background: "#0b0b0b", color: "#fff" }}
      >
        <option value="">Commune (toutes)</option>
        {meta.communes.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      <select
        value={String(value.scoreMin ?? 0)}
        onChange={(e) => upd({ scoreMin: Number(e.target.value) })}
        style={{ padding: 8, borderRadius: 8, border: "1px solid #333", background: "#0b0b0b", color: "#fff" }}
      >
        {scoreOptions.map((s) => (
          <option key={s} value={s}>
            Score ≥ {s}
          </option>
        ))}
      </select>
    </div>
  );
}
