"use client";

import { useMemo } from "react";
import type { SiteFeature, SiteFilters } from "../lib/api";
import { optionsFromFeatures } from "../lib/api";

type Props = {
  value: SiteFilters;
  features: SiteFeature[];
  onChange: (next: Partial<SiteFilters>) => void;
};

export default function Filters({ value, features, onChange }: Props) {
  const opts = useMemo(() => {
    return optionsFromFeatures(features, {
      region: value.region,
      department: value.department,
    });
  }, [features, value.region, value.department]);

  return (
    <div style={{ display: "grid", gap: 8, gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr" }}>
      {/* Recherche */}
      <input
        placeholder="Recherche (nom, adresse, ville...)"
        value={value.q}
        onChange={(e) => onChange({ q: e.target.value })}
      />

      {/* Type */}
      <select
        value={value.type}
        onChange={(e) => onChange({ type: e.target.value as SiteFilters["type"] })}
      >
        <option value="all">Tous types</option>
        <option value="factory">Usine</option>
        <option value="hospital">Hôpital</option>
        <option value="military">Militaire</option>
        <option value="mansion">Manoir</option>
        <option value="rail">Rail</option>
        <option value="other">Autre</option>
      </select>

      {/* Région */}
      <select
        value={value.region}
        onChange={(e) => onChange({ region: e.target.value, department: "all", commune: "all" })}
      >
        <option value="all">Toutes régions</option>
        {opts.regions.map((r) => (
          <option key={r} value={r}>{r}</option>
        ))}
      </select>

      {/* Département */}
      <select
        value={value.department}
        onChange={(e) => onChange({ department: e.target.value, commune: "all" })}
      >
        <option value="all">Tous départements</option>
        {opts.departments.map((d) => (
          <option key={d} value={d}>{d}</option>
        ))}
      </select>

      {/* Commune */}
      <select
        value={value.commune}
        onChange={(e) => onChange({ commune: e.target.value })}
      >
        <option value="all">Toutes communes</option>
        {opts.communes.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      {/* Score mini */}
      <div style={{ gridColumn: "1 / -1", display: "flex", alignItems: "center", gap: 8 }}>
        <label>Score min:</label>
        <input
          type="range"
          min={0}
          max={5}
          step={0.5}
          value={value.minScore}
          onChange={(e) => onChange({ minScore: Number(e.target.value) })}
        />
        <strong>{value.minScore.toFixed(1)}</strong>
      </div>
    </div>
  );
}
