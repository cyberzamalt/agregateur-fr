// apps/web/components/Filters.tsx
import { useEffect, useState } from "react";
import type { SiteFilters } from "../lib/api";

type Meta = {
  regions: string[];
  departments: string[];
  communes: string[];
  kinds: string[];
};

type Props = {
  values: SiteFilters;
  onChange: (next: Partial<SiteFilters>) => void;
};

export default function Filters({ values, onChange }: Props) {
  const [meta, setMeta] = useState<Meta>({
    regions: [],
    departments: [],
    communes: [],
    kinds: [],
  });

  useEffect(() => {
    let ok = true;
    (async () => {
      try {
        const res = await fetch("/api/sites?meta=1", { cache: "no-store" });
        const m = await res.json();
        if (ok) {
          setMeta({
            regions: m.regions ?? [],
            departments: m.departments ?? [],
            communes: m.communes ?? [],
            kinds: m.kinds ?? [],
          });
        }
      } catch {
        // silencieux
      }
    })();
    return () => {
      ok = false;
    };
  }, []);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr repeat(5, 180px)", gap: 8 }}>
      <input
        placeholder="Recherche (nom / adresse)"
        value={values.q}
        onChange={(e) => onChange({ q: e.target.value })}
      />

      <select
        value={values.type}
        onChange={(e) => onChange({ type: e.target.value })}
      >
        <option value="all">Type (tous)</option>
        {meta.kinds.map((k) => (
          <option key={k} value={k}>{k}</option>
        ))}
      </select>

      <select
        value={values.region}
        onChange={(e) => onChange({ region: e.target.value })}
      >
        <option value="all">Région (toutes)</option>
        {meta.regions.map((r) => (
          <option key={r} value={r}>{r}</option>
        ))}
      </select>

      <select
        value={values.department}
        onChange={(e) => onChange({ department: e.target.value })}
      >
        <option value="all">Département (tous)</option>
        {meta.departments.map((d) => (
          <option key={d} value={d}>{d}</option>
        ))}
      </select>

      <select
        value={values.commune}
        onChange={(e) => onChange({ commune: e.target.value })}
      >
        <option value="all">Commune (toutes)</option>
        {meta.communes.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      <select
        value={String(values.minScore)}
        onChange={(e) => onChange({ minScore: Number(e.target.value) || 0 })}
      >
        {[0,1,2,3,4,5,6,7,8,9,10].map((s) => (
          <option key={s} value={s}>Score ≥ {s}</option>
        ))}
      </select>
    </div>
  );
}
