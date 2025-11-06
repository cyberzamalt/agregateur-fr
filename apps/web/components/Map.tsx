/* @ts-nocheck */
'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// corrige les icônes sous Next
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// imports client-only
const MapContainer = dynamic(() => import('react-leaflet').then(m => m.MapContainer), { ssr: false });
const TileLayer     = dynamic(() => import('react-leaflet').then(m => m.TileLayer),     { ssr: false });
const Marker        = dynamic(() => import('react-leaflet').then(m => m.Marker),        { ssr: false });
const Popup         = dynamic(() => import('react-leaflet').then(m => m.Popup),         { ssr: false });
const LayersControl = dynamic(() => import('react-leaflet').then(m => m.LayersControl), { ssr: false });

type Feature = {
  geometry: { type: 'Point'; coordinates: [number, number] }; // [lon, lat]
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

  const center = useMemo<[number, number]>(() => [46.8, 2.5], []);
  const zoom = 5;

  return (
    <div style={{ width: '100%', maxWidth: 900, height: 420 }}>
      <MapContainer center={center} zoom={zoom} style={{ width: '100%', height: '100%', borderRadius: 12 }}>
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="Standard (OSM)">
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />
          </LayersControl.BaseLayer>

          <LayersControl.BaseLayer name="Relief (OpenTopoMap)">
            <TileLayer
              url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
              attribution="Map data: &copy; OpenStreetMap contributors, SRTM | Style: &copy; OpenTopoMap"
            />
          </LayersControl.BaseLayer>

          <LayersControl.BaseLayer name="Satellite (Esri)">
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution="Tiles &copy; Esri"
            />
          </LayersControl.BaseLayer>
        </LayersControl>

        {data?.features.map(f => {
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

      <div style={{ fontSize: 12, marginTop: 6 }}>Résultats : {data?.features.length ?? 0}</div>
    </div>
  );
}
