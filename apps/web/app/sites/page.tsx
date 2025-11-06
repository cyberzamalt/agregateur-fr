'use client';

// Rendu 100% client pour éviter toute erreur SSR liée à Leaflet / window
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { useEffect, useMemo, useState } from 'react';
import Map from '../../components/Map';
import RatingStars from '../../components/RatingStars';

type SiteFeature = {
  type: 'Feature';
  geometry: { type: 'Point'; coordinates: [number, number] }; // [lon, lat]
  properties: {
    id: string;
    name: string;
    kind?: string | null;
    region?: string | null;
    dept_code?: string | null;
    score?: number | null;
  };
};

type FC = { type: 'FeatureCollection'; features: SiteFeature[] };

type SortKey = 'score_desc' | 'score_asc' | 'alpha_asc' | 'alpha_desc';

export default function SitesPage() {
  const [fc, setFc] = useState<FC | null>(null);
  const [q, setQ] = useState('');
  const [kind, setKind] = useState('');
  const [region, setRegion] = useState('');
  const [dept, setDept] = useState('');
  const [minScore, setMinScore] = useState<number | ''>('');
  const [sort, setSort] = useState<SortKey>('score_desc');

  // Charge le GeoJSON unique (source côté web)
  useEffect(() => {
    fetch('/sites.geojson', { cache: 'no-store' })
      .then(r => r.json())
      .then((json: FC) => setFc(json))
      .catch(() => setFc({ type: 'FeatureCollection', features: [] }));
  }, []);

  const all = fc?.features ?? [];

  // Options uniques (triées)
  const kinds = useMemo(() => [...new Set(all.map(f => (f.properties.kind ?? '').trim()).filter(Boolean))].sort(), [all]);
  const regions = useMemo(() => [...new Set(all.map(f => (f.properties.region ?? '').trim()).filter(Boolean))].sort(), [all]);
  const depts = useMemo(() => [...new Set(all.map(f => (f.properties.dept_code ?? '').trim()).filter(Boolean))].sort(), [all]);

  // Filtrage + tri (client)
  const items = useMemo(() => {
    let arr = all;

    if (q.trim()) {
      const needle = q.trim().toLowerCase();
      arr = arr.filter(f => {
        const p = f.properties;
        return (
          (p.name || '').toLowerCase().includes(needle) ||
          (p.kind || '').toLowerCase().includes(needle) ||
          (p.region || '').toLowerCase().includes(needle) ||
          (p.dept_code || '').toLowerCase().includes(needle)
        );
      });
    }
    if (kind) arr = arr.filter(f => (f.properties.kind ?? '') === kind);
    if (region) arr = arr.filter(f => (f.properties.region ?? '') === region);
    if (dept) arr = arr.filter(f => (f.properties.dept_code ?? '') === dept);
    if (minScore !== '' && !Number.isNaN(minScore)) {
      const m = Number(minScore);
      arr = arr.filter(f => (Number(f.properties.score ?? 0) >= m));
    }

    const byAlpha = (a: SiteFeature, b: SiteFeature) =>
      (a.properties.name || '').localeCompare(b.properties.name || '', 'fr', { sensitivity: 'base' });
    const byScoreDesc = (a: SiteFeature, b: SiteFeature) =>
      Number(b.properties.score ?? -Infinity) - Number(a.properties.score ?? -Infinity);
    const byScoreAsc = (a: SiteFeature, b: SiteFeature) =>
      Number(a.properties.score ?? Infinity) - Number(b.properties.score ?? Infinity);

    const out = [...arr];
    switch (sort) {
      case 'alpha_asc': out.sort(byAlpha); break;
      case 'alpha_desc': out.sort((a, b) => -byAlpha(a, b)); break;
      case 'score_asc': out.sort(byScoreAsc); break;
      case 'score_desc':
      default: out.sort(byScoreDesc); break;
    }
    return out;
  }, [all, q, kind, region, dept, minScore, sort]);

  // UI simple (pas de Tailwind requis)
  return (
    <main style={{ padding: '24px 16px', maxWidth: 960, margin: '0 auto' }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 12px' }}>Sites d&apos;Urbex</h1>

      {/* Carte (note : la carte affiche le GeoJSON complet pour l’instant) */}
      <div style={{ margin: '12px 0 16px' }}>
        <Map />
      </div>

      {/* Barre filtres */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 180px 220px 140px 140px 160px',
          gap: 8,
          alignItems: 'center',
          border: '1px solid #333',
          borderRadius: 10,
          padding: 10,
          marginBottom: 10,
        }}
      >
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Recherche (nom, type, région, dept)"
          style={{ padding: '8px 10px', border: '1px solid #444', borderRadius: 8 }}
        />

        <select value={kind} onChange={e => setKind(e.target.value)} style={{ padding: 8, borderRadius: 8, border: '1px solid #444' }}>
          <option value="">Type: Tous</option>
          {kinds.map(k => <option key={k} value={k}>{k}</option>)}
        </select>

        <select value={region} onChange={e => setRegion(e.target.value)} style={{ padding: 8, borderRadius: 8, border: '1px solid #444' }}>
          <option value="">Région: Toutes</option>
          {regions.map(r => <option key={r} value={r}>{r}</option>)}
        </select>

        <select value={dept} onChange={e => setDept(e.target.value)} style={{ padding: 8, borderRadius: 8, border: '1px solid #444' }}>
          <option value="">Dept: Tous</option>
          {depts.map(d => <option key={d} value={d}>{d}</option>)}
        </select>

        <input
          type="number"
          inputMode="numeric"
          min={0}
          max={5}
          step={0.5}
          value={minScore}
          onChange={e => setMinScore(e.target.value === '' ? '' : Number(e.target.value))}
          placeholder="Note min"
          style={{ padding: '8px 10px', border: '1px solid #444', borderRadius: 8 }}
        />

        <select value={sort} onChange={e => setSort(e.target.value as SortKey)} style={{ padding: 8, borderRadius: 8, border: '1px solid #444' }}>
          <option value="score_desc">Tri : note ↓</option>
          <option value="score_asc">Tri : note ↑</option>
          <option value="alpha_asc">Tri : A → Z</option>
          <option value="alpha_desc">Tri : Z → A</option>
        </select>
      </section>

      {/* Compteur résultats */}
      <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 8 }}>
        Résultats : {items.length}
        {minScore !== '' ? `  •  Filtre note ≥ ${minScore}` : ''}
        {kind ? `  •  ${kind}` : ''}
        {region ? `  •  ${region}` : ''}
        {dept ? `  •  ${dept}` : ''}
      </div>

      {/* Liste */}
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {items.map((f) => {
          const p = f.properties;
          const score = Number(p.score ?? 0);
          return (
            <li
              key={p.id}
              style={{
                border: '1px solid #2f2f2f',
                borderRadius: 12,
                padding: 12,
                marginBottom: 8,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{p.name}</div>
                  <div style={{ fontSize: 12, opacity: 0.75 }}>
                    {p.kind ?? '—'}
                    {p.region ? ` · ${p.region}` : ''}
                    {p.dept_code ? ` · ${p.dept_code}` : ''}
                  </div>
                </div>
                <div title={`${score.toFixed(1)}/5`}>
                  <RatingStars value={score} />
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {/* Vide */}
      {fc && items.length === 0 && (
        <div style={{ opacity: 0.7, fontSize: 14, padding: '16px 0' }}>
          Aucun site ne correspond aux filtres.
        </div>
      )}

      {/* Chargement */}
      {!fc && (
        <div style={{ opacity: 0.7, fontSize: 14, padding: '16px 0' }}>
          Chargement…
        </div>
      )}
    </main>
  );
}
