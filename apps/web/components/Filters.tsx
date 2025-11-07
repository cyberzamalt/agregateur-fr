'use client';

import { useMemo } from 'react';
import type { SiteFeature, SiteFilters } from '../lib/api';
import { buildOptions } from '../lib/api';

type Props = {
  features: SiteFeature[];
  value: SiteFilters;
  onChange: (next: SiteFilters) => void;
};

export default function Filters({ features, value, onChange }: Props) {
  const { regions, deps, communes } = useMemo(() => buildOptions(features, value), [features, value]);

  return (
    <div style={{ display: 'grid', gap: 8, gridTemplateColumns: '1.2fr 1fr 1fr 1fr 1fr', margin: '0 0 12px' }}>
      {/* Recherche */}
      <input
        placeholder="Recherche (nom / adresse)"
        value={value.q ?? ''}
        onChange={(e) => onChange({ ...value, q: e.target.value })}
        style={{
          background: '#0f0f12', color: '#eee', border: '1px solid #333', borderRadius: 8, padding: '8px 10px'
        }}
      />

      {/* Région */}
      <select
        value={value.region ?? 'tous'}
        onChange={(e) => {
          const region = e.target.value;
          // si région change, on réinitialise dept/commune
          onChange({ ...value, region, departement: 'tous', commune: 'tous' });
        }}
        style={{ background: '#0f0f12', color: '#eee', border: '1px solid #333', borderRadius: 8, padding: '8px 10px' }}
      >
        <option value="tous">Région (toutes)</option>
        {regions.map((r) => (
          <option key={r} value={r}>{r}</option>
        ))}
      </select>

      {/* Département */}
      <select
        value={value.departement ?? 'tous'}
        onChange={(e) => onChange({ ...value, departement: e.target.value, commune: 'tous' })}
        style={{ background: '#0f0f12', color: '#eee', border: '1px solid #333', borderRadius: 8, padding: '8px 10px' }}
      >
        <option value="tous">Département (tous)</option>
        {deps.map((d) => (
          <option key={d} value={d}>{d}</option>
        ))}
      </select>

      {/* Commune */}
      <select
        value={value.commune ?? 'tous'}
        onChange={(e) => onChange({ ...value, commune: e.target.value })}
        style={{ background: '#0f0f12', color: '#eee', border: '1px solid #333', borderRadius: 8, padding: '8px 10px' }}
      >
        <option value="tous">Commune (toutes)</option>
        {communes.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      {/* Score min */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <label style={{ fontSize: 12, opacity: 0.8, width: 60 }}>Score ≥</label>
        <input
          type="number"
          min={0}
          max={5}
          step={0.1}
          value={value.scoreMin ?? 0}
          onChange={(e) => onChange({ ...value, scoreMin: Number(e.target.value) })}
          style={{ width: 70, background: '#0f0f12', color: '#eee', border: '1px solid #333', borderRadius: 8, padding: '8px' }}
        />
      </div>
    </div>
  );
}
