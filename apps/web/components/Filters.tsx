'use client';

import { type SiteFilters } from '../lib/api';

type Props = {
  filters: SiteFilters;
  onChange: (next: Partial<SiteFilters>) => void;
  kinds: string[];
  regions: string[];
  depts: string[];
  communes: string[];
};

export default function Filters({ filters, onChange, kinds, regions, depts, communes }: Props) {
  return (
    <div style={{ display: 'grid', gap: 8, gridTemplateColumns: '1fr repeat(4, 220px) 160px' }}>
      <input
        value={filters.q}
        onChange={(e) => onChange({ q: e.target.value })}
        placeholder="Recherche (nom / adresse)"
        style={inputStyle}
      />

      <select
        value={filters.kind}
        onChange={(e) => onChange({ kind: e.target.value })}
        style={inputStyle}
      >
        <option value="">Type (tous)</option>
        {kinds.map((k) => (
          <option key={k} value={k}>{k}</option>
        ))}
      </select>

      <select
        value={filters.region}
        onChange={(e) => onChange({ region: e.target.value })}
        style={inputStyle}
      >
        <option value="">Région (toutes)</option>
        {regions.map((r) => (
          <option key={r} value={r}>{r}</option>
        ))}
      </select>

      <select
        value={filters.dept}
        onChange={(e) => onChange({ dept: e.target.value })}
        style={inputStyle}
        disabled={!filters.region}
        title={!filters.region ? 'Choisissez d’abord une région' : ''}
      >
        <option value="">Département (tous)</option>
        {depts.map((d) => (
          <option key={d} value={d}>{d}</option>
        ))}
      </select>

      <select
        value={filters.commune}
        onChange={(e) => onChange({ commune: e.target.value })}
        style={inputStyle}
        disabled={!filters.dept}
        title={!filters.dept ? 'Choisissez d’abord un département' : ''}
      >
        <option value="">Commune (toutes)</option>
        {communes.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      <select
        value={String(filters.minScore)}
        onChange={(e) => onChange({ minScore: Number(e.target.value) })}
        style={inputStyle}
      >
        {[0,1,2,3,4].map((s) => (
          <option key={s} value={s}>Score ≥ {s}</option>
        ))}
      </select>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  height: 36,
  borderRadius: 8,
  border: '1px solid #333',
  background: '#111',
  color: '#eee',
  padding: '0 10px',
  outline: 'none',
};
