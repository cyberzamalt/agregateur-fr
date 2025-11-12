// apps/web/components/Filters.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import type { SiteFeature, SiteFilters } from "../lib/api";

type Props = {
  values: SiteFilters;
  onChange: (next: Partial<SiteFilters>) => void;
  features?: SiteFeature[]; // optionnel, ignoré ici pour ne rien casser
};

type Meta = {
  regions: string[];
  departments: string[];
  communes: string[];
  kinds: string[]; // on s’en sert pour remplir le select "type"
};

export default function Filters({ values, onChange }: Props) {
  const [meta, setMeta] = useState<Meta>({
    regions: [],
    departments: [],
    communes: [],
    kinds: [],
  });
  const [loading, setLoading] = useState(false);

  // Charge les listes depuis l’API (léger, et évite de dépendre d’un helper manquant)
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/sites?meta=1", { cache: "no-store" });
        if (!res.ok) throw new Error("meta_fetch_failed");
        const j = (await res.json()) as Meta;
        if (alive) setMeta({
          regions: j.regions ?? [],
          departments: j.departments ?? [],
          communes: j.communes ?? [],
          kinds: j.kinds ?? [],
        });
      } catch {
        // silencieux : si meta échoue, on garde juste "all"
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Petit helper pour patcher les valeurs
  const patch = (next: Partial<SiteFilters>) => onChange(next);

  // Options avec "all" en tête
  const typeOptions = useMemo(
    () => ["all", ...meta.kinds],
    [meta.kinds]
  );
  const regionOptions = useMemo(
    () => ["all", ...meta.regions],
    [meta.regions]
  );
  const depOptions = useMemo(
    () => ["all", ...meta.departments],
    [meta.departments]
  );
  const communeOptions = useMemo(
    () => ["all", ...meta.communes],
    [meta.communes]
  );

  return (
    <section
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        padding: 12,
        border: "1px solid #2a2a2a",
        borderRadius: 10,
        background: "#0f1115",
      }}
    >
      {/* Recherche */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <label style={{ fontSize: 13, opacity: 0.9 }}>Recherche</label>
        <input
          type="text"
          placeholder="Nom, adresse, …"
          value={values.q}
          onChange={(e) => patch({ q: e.target.value })}
          style={{
            padding: "8px 10px",
            borderRadius: 8,
            border: "1px solid #30363d",
            background: "#0b0f14",
            color: "#e6edf3",
          }}
        />
      </div>

      {/* Type */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <label style={{ fontSize: 13, opacity: 0.9 }}>
          Type {loading ? "…" : ""}
        </label>
        <select
          value={values.type}
          onChange={(e) => patch({ type: e.target.value })}
          style={selectStyle}
        >
          {typeOptions.map((t) => (
            <option key={t} value={t}>
              {t === "all" ? "Tous les types" : t}
            </option>
          ))}
        </select>
      </div>

      {/* Région */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <label style={{ fontSize: 13, opacity: 0.9 }}>
          Région {loading ? "…" : ""}
        </label>
        <select
          value={values.region}
          onChange={(e) => patch({ region: e.target.value })}
          style={selectStyle}
        >
          {regionOptions.map((r) => (
            <option key={r} value={r}>
              {r === "all" ? "Toutes les régions" : r}
            </option>
          ))}
        </select>
      </div>

      {/* Département */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <label style={{ fontSize: 13, opacity: 0.9 }}>
          Département {loading ? "…" : ""}
        </label>
        <select
          value={values.department}
          onChange={(e) => patch({ department: e.target.value })}
          style={selectStyle}
        >
          {depOptions.map((d) => (
            <option key={d} value={d}>
              {d === "all" ? "Tous les départements" : d}
            </option>
          ))}
        </select>
      </div>

      {/* Commune */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <label style={{ fontSize: 13, opacity: 0.9 }}>
          Commune {loading ? "…" : ""}
        </label>
        <select
          value={values.commune}
          onChange={(e) => patch({ commune: e.target.value })}
          style={selectStyle}
        >
          {communeOptions.map((c) => (
            <option key={c} value={c}>
              {c === "all" ? "Toutes les communes" : c}
            </option>
          ))}
        </select>
      </div>

      {/* Score mini */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <label style={{ fontSize: 13, opacity: 0.9 }}>Score minimum</label>
        <input
          type="number"
          min={0}
          step={1}
          value={values.minScore}
          onChange={(e) =>
            patch({ minScore: Number(e.target.value || 0) })
          }
          style={{
            padding: "8px 10px",
            borderRadius: 8,
            border: "1px solid #30363d",
            background: "#0b0f14",
            color: "#e6edf3",
            width: 140,
          }}
        />
      </div>
    </section>
  );
}

const selectStyle: React.CSSProperties = {
  padding: "8px 10px",
  borderRadius: 8,
  border: "1px solid #30363d",
  background: "#0b0f14",
  color: "#e6edf3",
};
