'use client';

import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Corrige les icônes Leaflet sous Next
// @ts-ignore
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Import dynamique (pas de SSR) + cast en any pour éviter les erreurs de types
const MapContainer = dynamic(() => import('react-leaflet').then(m => m.MapContainer), { ssr: false }) as any;
const TileLayer     = dynamic(() => import('react-leaflet').then(m => m.TileLayer),     { ssr: false }) as any;
const Marker        = dynamic(() => import('react-leaflet').then(m => m.Marker),        { ssr: false }) as any;
const Popup         = dynamic(() => import('react-leaflet').then(m => m.Popup),         { ssr: false }) as any;
const LayersControl = dynamic(() => import('react-leaflet').then(m => m.LayersControl), { ssr: false }) as any;

export type SiteFeature = {
  geometry: { type: 'Point'; coordinates: [number, number] }; // [lon, lat]
  properties: { id: string; name: string; kind?: string | null; score?: number | null; region?: string | null };
};

type Props = {
  features: SiteFeature[];
  center?: [number, number];
  zoom?: number;
};

export default function Map({ features, center = [46.5, 2.5], zoom = 6 }: Props) {
  const points = useMemo(() => features ?? [], [features]);

  return (
    <div style={{ width: '100%', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ width: '100%', height: 420, borderRadius: 12, overflow: 'hidden', border: '1px solid #333' }}>
        <MapContainer center={center} zoom={zoom} style={{ width: '100%', height: '100%' }}>
          <LayersControl position="topright">
            <LayersControl.BaseLayer checked name="Standard (OSM)">
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />
            </LayersControl.BaseLayer>

            <LayersControl.BaseLayer name="Satellite (Esri)">
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution="Tiles &copy; Esri"
              />
            </LayersControl.BaseLayer>

            <LayersControl.BaseLayer name="Relief (Stamen Terrain)">
              <TileLayer
                url="https://stamen-tiles.a.ssl.fastly.net/terrain/{z}/{x}/{y}.jpg"
                attribution="Map tiles by Stamen Design"
              />
            </LayersControl.BaseLayer>
          </LayersControl>

          {points.map((f) => {
            const [lon, lat] = f.geometry.coordinates || [];
            if (typeof lat !== 'number' || typeof lon !== 'number') return null;
            return (
              <Marker key={f.properties.id} position={[lat, lon]}>
                <Popup>
                  <strong>{f.properties.name}</strong>
                  {f.properties.kind ? <div>Type : {f.properties.kind}</div> : null}
                  {typeof f.properties.score === 'number' ? <div>Note : {f.properties.score}</div> : null}
                  {f.properties.region ? <div>Région : {f.properties.region}</div> : null}
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}
