// apps/web/app/sites/page.tsx
'use client';

import { useMemo, useState } from 'react';
import nextDynamic from 'next/dynamic';
import Filters from '../../components/Filters';
import type { SiteFeature, SiteFilters } from '../../lib/api';

// Page 100% client (Leaflet + filtres)
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const ClientMap = nextDynamic(() => import('../../components/Map'), { ssr: false });

const DEFAULT_FILTERS: SiteFilters = {
  q: '',
  type: 'all',
  region: 'all',
  department: 'all',
  commune: 'all',
  minScore: 0,
};

export default function SitesPage() {
  const [filters, setFilters] = useState<SiteFilters>(DEFAULT_FILTERS);

  // La carte chargera réellement les features côté client ; on passe une liste vide ici
  const feats = useMemo<SiteFeature[]>(() => [], []);

  return (
    <main style={{ padding: 16 }}>
      <h1 style={{ marginTop: 0 }}>Sites d&apos;Urbex</h1>

      <div style={{ marginBottom: 8 }}>
        <Filters
          features={feats}
          values={filters}
          onChange={(next) => setFilters((prev) => ({ ...prev, ...next }))}
        />
      </div>

      <ClientMap features={feats} filters={filters} />
    </main>
  );
}
