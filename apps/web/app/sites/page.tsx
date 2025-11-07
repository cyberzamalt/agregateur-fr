'use client';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import nextDynamic from 'next/dynamic';
import { useEffect, useMemo, useState } from 'react';
import Filters from '../../components/Filters';
import { loadSites, applyFilters, type SiteFilters, type SiteFeature } from '../../lib/api';

const ClientMap = nextDynamic(() => import('../../components/Map'), { ssr: false });

export default function SitesPage() {
  const [all, setAll] = useState<SiteFeature[]>([]);
  const [filters, setFilters] = useState<SiteFilters>({
    q: '',
    region: 'tous',
    departement: 'tous',
    commune: 'tous',
    scoreMin: 0,
  });

  useEffect(() => {
    loadSites().then(setAll).catch(() => setAll([]));
  }, []);

  const feats = useMemo(() => applyFilters(all, filters), [all, filters]);

  return (
    <main style={{ padding: '24px 16px' }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 12px' }}>Sites d'Urbex</h1>

      <Filters features={all} value={filters} onChange={setFilters} />

      <div style={{ marginTop: 8, marginBottom: 8, fontSize: 13, opacity: 0.8 }}>
        Résultats : {feats.length}
      </div>

      <ClientMap features={feats} />
    </main>
  );
}
