// apps/web/app/sites/page.tsx
'use client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { useState } from 'react';
import Filters from '../../components/Filters';
import Map from '../../components/Map';
import { defaultFilters, type SiteFilters } from '../../lib/api';

export default function SitesPage() {
  const [filters, setFilters] = useState<SiteFilters>(defaultFilters);

  return (
    <main style={{ padding: '24px 16px' }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 12px' }}>Sites d'Urbex</h1>

      <Filters value={filters} onChange={setFilters} />

      <Map filters={filters} />
    </main>
  );
}
