// @ts-nocheck
'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Icônes Leaflet sous Next
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Imports client-only (SSR off)
const _MapContainer  = dynamic(async () => (await import('react-leaflet')).MapContainer,  { ssr: false });
const _TileLayer     = dynamic(async () => (await import('react-leaflet')).TileLayer,     { ssr: false });
const _Marker        = dynamic(async () => (await import('react-leaflet')).Marker,        { ssr: false });
const _Popup         = dynamic(async () => (await import('react-leaflet')).Popup,         { ssr: false });
const _LayersControl = dynamic(async () => (await import('react-leaflet')).LayersControl, { ssr: false });

// ✅ Cast en any pour neutraliser le bug de typage au build
const MapContainer  = _MapContainer as any;
const TileLayer     = _TileLayer as any;
const Marker        = _Marker as any;
const Popup         = _Popup as any;
const LayersControl = _LayersControl as any;

type Feature = {
  geometry: { type: 'Point'; coordinates: [number, number] }; // lon, lat
  properties: { id: string; name: string; kind?: string | null; score?: number | null };
};
type FC = { type: 'FeatureCollection'; features: Feature[] };

function Stars({ score = 0 }: { score?: number | null }) {
  const s = Math.round(Number(score || 0));
  return <span aria-label="note" title={`Note: ${score ?? 0}`}>{'★'.repeat(Math.max(0, s))}{'☆'.repeat(Math.max(0, 5 - s))}</span>;
}

export default function Map() {
  const [data, setData] = useState<FC | null>(null);

  useEffect(() => {
    fetch('/sites.geojson', { cache: 'no-store' })
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData({ type: 'FeatureCollection', features: [] }));
  }, []);

  const center = useMemo<[number, number]>(() => [46.8, 2.5], []);
  const zoom = 5;

  return (
    <div style={{ width: '100%', height: 420, borderRadius: 12, overflow: 'hidden', border: '1px solid #333' }}>
      <MapContainer center={center} zoom={zoom} style={{ width: '100%', height: '100%' }}>
        {/* Fonds de carte */}
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="Standard (OSM)">
            <TileLayer
              attribution="&copy; OpenStreetMap"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>

          <LayersControl.BaseLayer name="Relief (OpenTopoMap)">
            <TileLayer
              attribution='Map data: &copy; OpenStreetMap contributors, SRTM | Map style: &copy; OpenTopoMap (CC-BY-SA)'
              url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
              maxZoom={17}
            />
          </LayersControl.BaseLayer>

          <LayersControl.BaseLayer name="Satellite (Esri)">
            <TileLayer
              attribution='Tiles &copy; Esri — Source: Esri, Earthstar Geographics'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              maxZoom={19}
            />
          </LayersControl.BaseLayer>
        </LayersControl>

        {/* Marqueurs */}
        {data?.features.map((f) => {
          const [lon, lat] = f.geometry.coordinates;
          return (
            <Marker key={f.properties.id} position={[lat, lon]}>
              <Popup>
                <strong>{f.properties.name}</strong>
                {f.properties.kind ? <div>Type : {f.properties.kind}</div> : null}
                {typeof f.properties.score === 'number' ? (
                  <div>Note : <Stars score={f.properties.score} /></div>
                ) : null}
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
