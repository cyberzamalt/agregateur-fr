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
  const { kinds, regions, departments, communes } = useMemo(
    () => optionsFromFeatures(features, { region: values.region, department: values.department }),
    [features, values.region, values.department]
  );

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 1fr 1fr 0.8fr', gap: 12, marginBottom: 12 }}>
      <input
        placeholder="Recherche (nom / adresse)"
        value={values.query}
        onChange={(e) => onChange({ query: e.target.value })}
        style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #333', background: '#0c0c0c', color: '#eee' }}
      />

      <select
        value={values.kind}
        onChange={(e) => onChange({ kind: e.target.value })}
        style={selectStyle}
      >
        <option value="">Type (tous)</option>
        {kinds.map(k => <option key={k} value={k}>{k}</option>)}
      </select>

      <select
        value={values.region}
        onChange={(e) => onChange({ region: e.target.value, department: '', commune: '' })}
        style={selectStyle}
      >
        <option value="">Région (toutes)</option>
        {regions.map(r => <option key={r} value={r}>{r}</option>)}
      </select>

      <select
        value={values.department}
        onChange={(e) => onChange({ department: e.target.value, commune: '' })}
        style={selectStyle}
      >
        <option value="">Département (tous)</option>
        {departments.map(d => <option key={d} value={d}>{d}</option>)}
      </select>

      <select
        value={values.commune}
        onChange={(e) => onChange({ commune: e.target.value })}
        style={selectStyle}
      >
        <option value="">Commune (toutes)</option>
        {communes.map(c => <option key={c} value={c}>{c}</option>)}
      </select>

      <select
        value={String(values.minScore)}
        onChange={(e) => onChange({ minScore: Number(e.target.value) })}
        style={selectStyle}
      >
        {[0,1,2,3,4,5].map(s => <option key={s} value={s}>Score ≥ {s}</option>)}
      </select>
    </div>
  );
}

const selectStyle: React.CSSProperties = {
  padding: '10px 12px',
  borderRadius: 8,
  border: '1px solid #333',
  background: '#0c0c0c',
  color: '#eee'
};
