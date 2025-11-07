'use client';

import React from 'react';

export type FiltersState = {
  q: string;
  kind: string;   // 'tous' ou valeur précise
  region: string; // 'toutes' ou valeur précise
  minScore: number;
};

type Props = {
  state: FiltersState;
  kinds: string[];
  regions: string[];
  onChange: (next: FiltersState) => void;
};

export default function Filters({ state, kinds, regions, onChange }: Props) {
  const set = <K extends keyof FiltersState>(k: K, v: FiltersState[K]) =>
    onChange({ ...state, [k]: v });

  return (
    <div
      style={{
        display: 'grid',
        gap: 12,
        padding: 12,
        border: '1px solid #333',
        borderRadius: 10,
      }}
    >
      <div style={{ display: 'grid', gap: 8 }}>
        <label style={{ fontSize: 13, opacity: 0.85 }}>Recherche</label>
        <input
          value={state.q}
          onChange={(e) => set('q', e.target.value)}
          placeholder="Nom, type, région..."
          style={{
            padding: '10px 12px',
            borderRadius: 8,
            border: '1px solid #333',
            background: '#0f1116',
            color: '#f2f3f5',
            outline: 'none',
          }}
        />
      </div>

      <div style={{ display: 'grid', gap: 8 }}>
        <label style={{ fontSize: 13, opacity: 0.85 }}>Type</label>
        <select
          value={state.kind}
          onChange={(e) => set('kind', e.target.value)}
          style={{
            padding: '10px 12px',
            borderRadius: 8,
            border: '1px solid #333',
            background: '#0f1116',
            color: '#f2f3f5',
          }}
        >
          <option value="tous">Tous</option>
          {kinds.map((k) => (
            <option key={k} value={k}>{k}</option>
          ))}
        </select>
      </div>

      <div style={{ display: 'grid', gap: 8 }}>
        <label style={{ fontSize: 13, opacity: 0.85 }}>Région</label>
        <select
          value={state.region}
          onChange={(e) => set('region', e.target.value)}
          style={{
            padding: '10px 12px',
            borderRadius: 8,
            border: '1px solid #333',
            background: '#0f1116',
            color: '#f2f3f5',
          }}
        >
          <option value="toutes">Toutes</option>
          {regions.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      <div style={{ display: 'grid', gap: 6 }}>
        <label style={{ fontSize: 13, opacity: 0.85 }}>
          Score minimum : <strong>{state.minScore}</strong>
        </label>
        <input
          type="range"
          min={0}
          max={5}
          step={0.1}
          value={state.minScore}
          onChange={(e) => set('minScore', Number(e.target.value))}
        />
      </div>
    </div>
  );
}
