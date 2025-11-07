'use client';

// apps/web/components/Filters.tsx
import { useEffect, useMemo, useState } from 'react';
import type { SiteFeature, SiteFilters } from '../lib/api';
import { defaultFilters, normalize } from '../lib/api';

type Props = {
  value: SiteFilters;
  onChange: (next: SiteFilters) => void;
};

/**
 * Composant contrôlé de filtres.
 * Il lit `public/sites.geojson` (et `public/data/index.json` si présent)
 * pour proposer des listes (type, région, département, commune).
 */
export default function Filters({ value, onChange }: Props) {
  const [all, setAll] = useState<SiteFeature[]>([]);

  useEffect(() => {
    (async () => {
      try {
        // 1) fichier principal
        const base = await fetch('/sites.geojson', { cache: 'no-store' }).then(r => r.json()).catch(() => null);

        // 2) fichiers additionnels via manifest optionnel
        let extra: SiteFeature[] = [];
        try {
          const manifest = await fetch('/data/index.json', { cache: 'no-store' }).then(r => r.json());
          if (Array.isArray(manifest?.files)) {
            const loaded = await Promise.all(
              manifest.files.map((f: string) =>
                fetch(`/data/${f}`, { cache: 'no-store' }).then(r => r.json()).catch(() => null)
              )
            );
            loaded.forEach((d: any) => {
              const arr = toFeatures(d);
              if (arr.length) extra.push(...arr);
            });
          }
        } catch {
          // pas de manifest, ce n'est pas grave
        }

        const baseArr = toFeatures(base);
        const merged = dedupeById([...baseArr, ...extra]);
        setAll(merged);
      } catch {
        setAll([]);
      }
    })();
  }, []);

  const kinds = useMemo(() => uniqFrom(all.map(f => f.properties?.kind)), [all]);
  const regions = useMemo(() => uniqFrom(all.map(f => f.properties?.region)), [all]);
  const deps = useMemo(() => uniqFrom(all.map(f => f.properties?.departement)), [all]);
  const communes = useMemo(() => uniqFrom(all.map(f => f.properties?.commune)), [all]);

  function change<K extends keyof SiteFilters>(k: K, v: SiteFilters[K]) {
    onChange({ ...value, [k]: v });
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 1fr 1fr 0.8fr', gap: 8, marginBottom: 12 }}>
      <input
        placeholder="Recherche (nom / adresse)"
        value={value.q}
        onChange={e => change('q', e.target.value)}
        style={field}
      />

      <select value={value.kind} onChange={e => change('kind', e.target.value)} style={field}>
        <option value="">Type (tous)</option>
        {kinds.map(k => <option key={k} value={k}>{k}</option>)}
      </select>

      <select value={value.region} onChange={e => change('region', e.target.value)} style={field}>
        <option value="">Région (toutes)</option>
        {regions.map(k => <option key={k} value={k}>{k}</option>)}
      </select>

      <select value={value.departement} onChange={e => change('departement', e.target.value)} style={field}>
        <option value="">Département (tous)</option>
        {deps.map(k => <option key={k} value={k}>{k}</option>)}
      </select>

      <select value={value.commune} onChange={e => change('commune', e.target.value)} style={field}>
        <option value="">Commune (toutes)</option>
        {communes.map(k => <option key={k} value={k}>{k}</option>)}
      </select>

      <select
        value={String(value.minScore)}
        onChange={e => change('minScore', Number(e.target.value))}
        style={field}
      >
        {/* seuils courants */}
        {[0,1,2,3,4].map(s => <option key={s} value={s}>Score ≥ {s}</option>)}
      </select>
    </div>
  );
}

const field: React.CSSProperties = {
  height: 34,
  padding: '0 10px',
  borderRadius: 8,
  border: '1px solid #333'
};

function toFeatures(data: any): SiteFeature[] {
  if (!data) return [];
  if (Array.isArray(data)) return data as SiteFeature[];
  if (data.type === 'FeatureCollection' && Array.isArray(data.features)) return data.features as SiteFeature[];
  return [];
}

function dedupeById(arr: SiteFeature[]): SiteFeature[] {
  const seen = new Set<string>();
  const out: SiteFeature[] = [];
  for (const f of arr) {
    const id = String(f?.properties?.id ?? '');
    if (!id || seen.has(id)) continue;
    seen.add(id);
    out.push(f);
  }
  return out;
}

function uniqFrom(src: unknown[]): string[] {
  const s = new Set<string>();
  for (const v of src) {
    const n = normalize(v);
    if (n) s.add((v as string) ?? '');
  }
  return Array.from(s).sort((a, b) => a.localeCompare(b, 'fr'));
}
