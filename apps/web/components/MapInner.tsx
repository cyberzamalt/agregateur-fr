// @ts-nocheck
'use client';

import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, LayersControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Corrige les icônes par défaut sous Next
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
});

type Feature = {
  geometry: { type: 'Point'; coordinates: [number, number] }; // [lon, lat]
  properties: { id: string; name: string; kind?: string | null; score?: number | null };
};
type FC = { type: 'FeatureCollection'; features: Feature[] };

export default function MapInner() {
  const [data, setData] = useState<FC | null>(null);

  useEffect(() => {
    fetch('/sites.geojson', { cache: 'no-store' })
      .then(r => (r.ok ? r.json() : { type: 'FeatureCollection', features: [] }))
      .then(setData)
      .catch(() => setData({ type: 'FeatureCollection', features: [] }));
  }, []);

  const center: [number, number] = useMemo(() => [46.8, 2.5], []);
  const zoom = 5;

  return (
    <div style={{ width: '100%', height: 420, borderRadius: 12, overflow: 'hidden', border: '1px solid #333' }}>
      <MapContainer center={center} zoom={zoom} style={{ width: '100%', height: '100%' }}>
        {/* Sélecteur de fonds de carte */}
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="Standard (OSM)">
            <TileLayer
              attribution="&copy; OpenStreetMap"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>

          <LayersControl.BaseLayer name="Topo / Relief (OpenTopoMap)">
            <TileLayer
              attribution="&copy; OpenTopoMap contributors"
              url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>

          <LayersControl.BaseLayer name="Satellite (Esri)">
            <TileLayer
              attribution="Tiles &copy; Esri — World Imagery"
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
          </LayersControl.BaseLayer>
        </LayersControl>

        {(data?.features ?? []).map((f) => {
          const [lon, lat] = f.geometry.coordinates;
          return (
            <Marker key={f.properties.id} position={[lat, lon]}>
              <Popup>
                <strong>{f.properties.name}</strong>
                {f.properties.kind ? <div>Type : {f.properties.kind}</div> : null}
                {f.properties.score != null ? <div>Note : {f.properties.score}</div> : null}
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
