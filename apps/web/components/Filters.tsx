// apps/web/components/Filters.tsx
'use client';

import { useMemo } from 'react';
import type { SiteFeature, SiteFilters } from '../lib/api';
import { optionsFromFeatures } from '../lib/api';

type Props = {
  features: SiteFeature[];
  values: SiteFilters;
  onChange: (next: Partial<SiteFilters>) => void;
};

export default function Filters({ features, values, onChange }: Props) {
  const opts = useMemo(() => optionsFromFeatures(features), [features]);

  return (
    <div style={{ display: 'grid', gap: 8, gridTemplateColumns: '1fr 170px 170px 170px 220px 140px' }}>
      {/* Recherche texte */}
      <input
        placeholder="Recherche (nom / adresse)"
        value={values.q}
        onChange={(e) => onChange({ q: e.target.value })}
      />

      {/* Type */}
      <select value={values.type} onChange={(e) => onChange({ type: e.target.value })}>
        <option value="all">Type (tous)</option>
        {opts.types.map(t => <option key={t} value={t}>{t}</option>)}
      </select>

      {/* Région */}
      <select value={values.region} onChange={(e) => onChange({ region: e.target.value })}>
        <option value="all">Région (toutes)</option>
        {opts.regions.map(r => <option key={r} value={r}>{r}</option>)}
      </select>

      {/* Département */}
      <select value={values.department} onChange={(e) => onChange({ department: e.target.value })}>
        <option value="all">Département (tous)</option>
        {opts.departments.map(d => <option key={d} value={d}>{d}</option>)}
      </select>

      {/* Commune */}
      <select value={values.commune} onChange={(e) => onChange({ commune: e.target.value })}>
        <option value="all">Commune (toutes)</option>
        {opts.communes.map(c => <option key={c} value={c}>{c}</option>)}
      </select>

      {/* Score mini */}
      <select
        value={String(values.minScore)}
        onChange={(e) => onChange({ minScore: Number(e.target.value) })}
      >
        {[0,1,2,3,4,5,6,7,8,9,10].map(s => <option key={s} value={s}>Score ≥ {s}</option>)}
      </select>
    </div>
  );
}
