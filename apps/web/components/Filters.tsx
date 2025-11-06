'use client';

import { useMemo } from 'react';

export type FilterState = {
  kind: string;     // '', 'urbex-village', ...
  region: string;   // '', 'Île-de-France', ...
  minScore: number; // 0..5
  sort: 'score_desc' | 'score_asc' | 'name';
};

type Props = {
  kinds: string[];
  regions: string[];
  value: FilterState;
  onChange: (next: FilterState) => void;
  resultsCount: number;
};

function Stars({ value }: { value: number }) {
  const v = Math.max(0, Math.min(5, value));
  const full = '★'.repeat(Math.floor(v));
  const empty = '☆'.repeat(5 - Math.floor(v));
  return <span aria-label={`${v}/5`} title={`${v}/5`} style={{ letterSpacing: 1 }}>{full}{empty}</span>;
}

export default function Filters({ kinds, regions, value, onChange, resultsCount }: Props) {
  const kindOpts = useMemo(() => ['', ...kinds.sort()], [kinds]);
  const regionOpts = useMemo(() => ['', ...regions.sort()], [regions]);

  return (
    <div style={{
      maxWidth: 980, margin: '12px auto 16px', padding: '12px 14px',
      border: '1px solid #333', borderRadius: 12, background: 'rgba(255,255,255,0.03)'
    }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 12 }}>
        {/* Type */}
        <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: 12, opacity: .7 }}>Type</span>
          <select
            value={value.kind}
            onChange={(e) => onChange({ ...value, kind: e.target.value })}
            style={{ padding: '8px 10px', borderRadius: 8, background: '#141414', color: 'white', border: '1px solid #333' }}
          >
            {kindOpts.map(k => <option key={k} value={k}>{k || 'Tous'}</option>)}
          </select>
        </label>

        {/* Région */}
        <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: 12, opacity: .7 }}>Région</span>
          <select
            value={value.region}
            onChange={(e) => onChange({ ...value, region: e.target.value })}
            style={{ padding: '8px 10px', borderRadius: 8, background: '#141414', color: 'white', border: '1px solid #333' }}
          >
            {regionOpts.map(r => <option key={r} value={r}>{r || 'Toutes'}</option>)}
          </select>
        </label>

        {/* Note minimale */}
        <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: 12, opacity: .7 }}>Note minimale</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="range" min={0} max={5} step={0.5}
              value={value.minScore}
              onChange={(e) => onChange({ ...value, minScore: Number(e.target.value) })}
              style={{ flex: 1 }}
            />
            <Stars value={value.minScore} />
          </div>
        </label>

        {/* Tri */}
        <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: 12, opacity: .7 }}>Tri</span>
          <select
            value={value.sort}
            onChange={(e) => onChange({ ...value, sort: e.target.value as Props['value']['sort'] })}
            style={{ padding: '8px 10px', borderRadius: 8, background: '#141414', color: 'white', border: '1px solid #333' }}
          >
            <option value="score_desc">Note ↓</option>
            <option value="score_asc">Note ↑</option>
            <option value="name">Nom A→Z</option>
          </select>
        </label>
      </div>

      <div style={{ marginTop: 10, fontSize: 13, opacity: .8 }}>
        Résultats : <strong>{resultsCount}</strong>
      </div>
    </div>
  );
}
