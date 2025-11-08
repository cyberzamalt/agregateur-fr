// apps/web/components/Map.tsx
'use client';

import { useMemo } from 'react';
import {
  MapContainer as RLMapContainer,
  TileLayer,
  Marker,
  Popup,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import type { SiteFeature, SiteFilters, BoundsTuple } from '../lib/api';

// On caste pour éviter les soucis de typings cross-versions
const MapContainer: any = RLMapContainer as any;

const pin = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

type Props = { features: SiteFeature[]; filters: SiteFilters };

const FRANCE_BOUNDS: BoundsTuple = [[41.2, -5.5], [51.3, 9.6]];

function match(f: SiteFeature, flt: SiteFilters) {
  if (flt.q) {
    const hay = `${f.name} ${f.address ?? ''} ${f.commune ?? ''} ${f.department ?? ''} ${f.region ?? ''}`.toLowerCase();
    if (!hay.includes(flt.q.toLowerCase())) return false;
  }
  if (flt.type       !== 'all' && f.type       !== flt.type) return false;
  if (flt.region     !== 'all' && f.region     !== flt.region) return false;
  if (flt.department !== 'all' && f.department !== flt.department) return false;
  if (flt.commune    !== 'all' && f.commune    !== flt.commune) return false;
  if (typeof f.score === 'number' && f.score < flt.minScore) return false;
  return true;
}

export default function Map({ features, filters }: Props) {
  const items = useMemo(() => features.filter((f) => match(f, filters)), [features, filters]);

  const bounds: BoundsTuple = useMemo(() => {
    if (!items.length) return FRANCE_BOUNDS;
    const latLngs = items.map((f) => [f.lat, f.lon] as [number, number]);
    const b = L.latLngBounds(latLngs);
    return [
      [b.getSouthWest().lat, b.getSouthWest().lng],
      [b.getNorthEast().lat, b.getNorthEast().lng],
    ];
  }, [items]);

  return (
    <MapContainer
      style={{ height: 420, width: '100%', maxWidth: 980, borderRadius: 8 }}
      bounds={bounds as any}
      // scrollWheelZoom: true par défaut ; on évite la prop non typée
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {items.map((pt) => (
        <Marker key={pt.id} position={[pt.lat, pt.lon]} icon={pin}>
          <Popup>
            <strong>{pt.name}</strong>
            <br />
            {pt.address ?? ''}
            <br />
            {[pt.commune, pt.department, pt.region].filter(Boolean).join(', ')}
            {typeof pt.score === 'number' ? <div>Score: {pt.score}</div> : null}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
