// apps/web/components/Filters.tsx
"use client";

import { useEffect, useState } from "react";
import type { SiteFilters } from "../lib/api";

type Meta = {
  count: number;
  regions: string[];
  departments: string[];
  communes: string[];
  kinds: string[];
  updatedAt: string;
};

type Props = {
  values: SiteFilters;
  onChange: (next: Partial<SiteFilters>) => void;
};

export default function Filters({ values, onChange }: Props) {
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    fetch("/api/sites?meta=1")
      .then(r => r.ok ? r.json() : Promise.reject(r.statusText))
      .then((m: Meta) => { if (alive) setMeta(m); })
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, []);

  const opt = <T extends string>(arr: T[], labelAll: string) => [
    { v: "all", t: labelAll },
    ...arr.map(v => ({ v, t: v }))
  ];

  const kinds = opt(meta?.kinds ?? [], "Type (tous)");
  const regions = opt(meta?.regions ?? [], "Région (toutes)");
  const deps = opt(meta?.departments ?? [], "Département (tous)");
  const comms = opt(meta?.communes ?? [], "Commune (toutes)");

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr repeat(5, max-content)", gap: 8 }}>
      <input
        placeholder="Recherche (nom / adresse)"
        value={values.q}
        onChange={e => onChange({ q: e.target.value })}
        style={{ minWidth: 260 }}
      />
      <select
        value={values.type}
        onChange={e => onChange({ type: e.target.value })}
        disabled={loading}
      >
        {kinds.map(o => <option key={o.v} value={o.v}>{o.t}</option>)}
      </select>

      <select
        value={values.region}
        onChange={e => onChange({ region: e.target.value })}
        disabled={loading}
      >
        {regions.map(o => <option key={o.v} value={o.v}>{o.t}</option>)}
      </select>

      <select
        value={values.department}
        onChange={e => onChange({ department: e.target.value })}
        disabled={loading}
      >
        {deps.map(o => <option key={o.v} value={o.v}>{o.t}</option>)}
      </select>

      <select
        value={values.commune}
        onChange={e => onChange({ commune: e.target.value })}
        disabled={loading}
      >
        {comms.map(o => <option key={o.v} value={o.v}>{o.t}</option>)}
      </select>

      <select
        value={String(values.minScore)}
        onChange={e => onChange({ minScore: Number(e.target.value) })}
      >
        {[0,1,2,3,4,5,6,7,8,9,10].map(s => (
          <option key={s} value={s}>Score ≥ {s}</option>
        ))}
      </select>
    </div>
  );
}
