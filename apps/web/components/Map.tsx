// @ts-nocheck
'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Corrige les icônes par défaut sous Next
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Imports sans SSR (typés en any pour neutraliser TS dans Next)
const MapContainer: any = dynamic(
  () => import('react-leaflet').then(m => m.MapContainer),
  { ssr: false }
);
const TileLayer: any = dynamic(
  () => import('react-leaflet').then(m => m.TileLayer),
  { ssr: false }
);
const Marker: any = dynamic(
  () => import('react-leaflet').then(m => m.Marker),
  { ssr: false }
);
const Popup: any = dynamic(
  () => import('react-leaflet').then(m => m.Popup),
  { ssr: false }
);

type Feature = {
  geometry: { type: 'Point'; coordinates: [number, number] }; // lon, lat
  properties: { id: string; name: string; kind?: string | null; score?: number | null };
};
type FC = { type: 'FeatureCollection'; features: Feature[] };

export default function Map() {
  const [data, setData] = useState<FC | null>(null);

  useEffect(() => {
    fetch('/sites.geojson', { cache: 'no-store' })
      .then(r => r.json())
      .then(setData)
      .catch(() => setData({ type: 'FeatureCollection', features: [] }));
  }, []);

  const center = useMemo(() => [46.8, 2.5] as [number, number], []);
  const zoom = 5;

  return (
    <div style={{ width: '100%', height: 420, borderRadius: 12, overflow: 'hidden', border: '1px solid #333' }}>
      <MapContainer center={center} zoom={zoom} style={{ width: '100%', height: '100%' }}>
        <TileLayer
          attribution="&copy; OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {data?.features.map((f) => {
          const [lon, lat] = f.geometry.coordinates;
          return (
            <Marker key={f.properties.id} position={[lat, lon]}>
              <Popup>
                <strong>{f.properties.name}</strong>
                {f.properties.kind ? <div>Type : {f.properties.kind}</div> : null}
                {f.properties.score ? <div>Note : {f.properties.score}</div> : null}
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
