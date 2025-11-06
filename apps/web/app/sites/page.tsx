'use client';

import { useEffect, useState } from 'react';
import Map from '@/components/Map';

type Feature = {
  geometry: { type: 'Point'; coordinates: [number, number] }; // lon, lat
  properties: { id: string; name: string; kind?: string | null; score?: number | null };
};
type FeatureCollection = { type: 'FeatureCollection'; features: Feature[] };

export default function SitesPage() {
  const [data, setData] = useState<FeatureCollection>({ type: 'FeatureCollection', features: [] });

  useEffect(() => {
    fetch('/sites.geojson', { cache: 'no-store' })
      .then(r => r.json())
      .then(setData)
      .catch(() => setData({ type: 'FeatureCollection', features: [] }));
  }, []);

  return (
    <main style={{ maxWidth: 1100, margin: '40px auto', padding: '0 16px' }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 16 }}>Sites d'Urbex</h1>
      <Map data={data} />
      <div style={{ fontSize: 12, marginTop: 6 }}>Résultats : {data.features.length}</div>
    </main>
  );
}
