'use client';

import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState } from 'react';
import Filters, { type FilterState } from '../../components/Filters';
import type { SiteFeature } from '../../components/Map';

// charge la carte côté client uniquement
const Map = dynamic(() => import('../../components/Map'), { ssr: false });

export default function SitesPage() {
  const [raw, setRaw] = useState<SiteFeature[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    kind: '',
    region: '',
    minScore: 0,
    sort: 'score_desc',
  });

  useEffect(() => {
    let ok = true;
    (async () => {
      try {
        const res = await fetch('/sites.geojson', { cache: 'no-store' });
        const gj = await res.json();
        const items: SiteFeature[] = (gj?.features ?? []).filter((f: any) => f?.geometry?.type === 'Point');
        if (ok) setRaw(items);
      } catch {
        if (ok) setRaw([]);
      }
    })();
    return () => { ok = false; };
  }, []);

  const kinds = useMemo(() => Array.from(new Set(raw.map(f => f.properties.kind).filter(Boolean))) as string[], [raw]);
  const regions = useMemo(() => Array.from(new Set(raw.map(f => f.properties.region).filter(Boolean))) as string[], [raw]);

  const filtered = useMemo(() => {
    let arr = raw.slice();
    if (filters.kind)   arr = arr.filter(f => (f.properties.kind || '') === filters.kind);
    if (filters.region) arr = arr.filter(f => (f.properties.region || '') === filters.region);
    if (filters.minScore > 0) arr = arr.filter(f => (f.properties.score ?? 0) >= filters.minScore);
    switch (filters.sort) {
      case 'score_asc': arr.sort((a,b)=>(a.properties.score??0)-(b.properties.score??0)); break;
      case 'name':      arr.sort((a,b)=>(a.properties.name||'').localeCompare(b.properties.name||'')); break;
      default:          arr.sort((a,b)=>(b.properties.score??0)-(a.properties.score??0));
    }
    return arr;
  }, [raw, filters]);

  return (
    <main style={{ padding: '32px 16px 40px' }}>
      <h1 style={{ maxWidth: 980, margin: '0 auto 12px', fontSize: 28, fontWeight: 700 }}>Sites d'Urbex</h1>

      <Filters
        kinds={kinds}
        regions={regions}
        value={filters}
        onChange={setFilters}
        resultsCount={filtered.length}
      />

      <Map features={filtered} />
    </main>
  );
}
