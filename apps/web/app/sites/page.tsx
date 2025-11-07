// apps/web/app/sites/page.tsx
'use client';

// Pas de SSR ni de cache (Leaflet + filtres client)
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { useEffect, useMemo, useState } from 'react';
import Map from '../../components/Map';
import Filters from '../../components/Filters';
import type { SiteFeature, SiteFilters } from '../../lib/api';
import { applyFilters, computeBounds, defaultFilters, fromAnyGeojson } from '../../lib/api';

async function fetchJson(url: string): Promise<any | null> {
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export default function SitesPage() {
  const [allFeatures, setAllFeatures] = useState<SiteFeature[]>([]);
  const [filters, setFilters] = useState<SiteFilters>(defaultFilters);

  // Charge /sites.geojson + /urbex_extra.geojson (silencieux si 404)
  useEffect(() => {
    (async () => {
      const a = await fetchJson('/sites.geojson');
      const b = await fetchJson('/urbex_extra.geojson'); // optionnel
      const A = fromAnyGeojson(a);
      const B = fromAnyGeojson(b);
      setAllFeatures([...A, ...B]);
    })();
  }, []);

  const feats = useMemo(() => applyFilters(allFeatures, filters), [allFeatures, filters]);
  const bounds = useMemo(() => computeBounds(feats), [feats]);

  return (
    <main style={{ padding: '24px 16px' }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 12px' }}>Sites d'Urbex</h1>

      <Filters
        features={allFeatures}
        values={filters}
        onChange={(next) => setFilters((prev) => ({ ...prev, ...next }))}
      />

      <Map features={feats} bounds={bounds} />

      <div style={{ marginTop: 8, fontSize: 13, opacity: 0.8 }}>Résultats : {feats.length}</div>
    </main>
  );
}
