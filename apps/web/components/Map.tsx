'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, LayersControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

type LatLng = [number, number];

type Feature = {
  type: 'Feature';
  properties: { id: string; name: string; kind?: string; region?: string; dept_code?: string; score?: number };
  geometry: { type: 'Point'; coordinates: [number, number] }; // [lon, lat]
};
type FeatureCollection = { type: 'FeatureCollection'; features: Feature[] };

const defaultCenter: LatLng = [46.5, 2.5];

const icon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -28],
  shadowSize: [41, 41],
});

export default function ClientMap() {
  const [features, setFeatures] = useState<Feature[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch('/sites.geojson', { cache: 'no-store' });
        const data: FeatureCollection = await r.json();
        if (!cancelled) setFeatures(Array.isArray(data?.features) ? data.features : []);
      } catch {
        if (!cancelled) setFeatures([]);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Cast "any" pour neutraliser le bug de typings côté build Render
  const MapAny = MapContainer as unknown as any;
  const LayersAny = LayersControl as unknown as any;

  return (
    <div style={{ width: '100%', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ width: '100%', height: 420, borderRadius: 12, overflow: 'hidden', border: '1px solid #333' }}>
        <MapAny center={defaultCenter} zoom={6} style={{ width: '100%', height: '100%' }}>
          <LayersAny position="topright">
            <LayersAny.BaseLayer checked name="Standard (OSM)">
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            </LayersAny.BaseLayer>
            <LayersAny.BaseLayer name="Relief (Topo)">
              <TileLayer url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png" />
            </LayersAny.BaseLayer>
            <LayersAny.BaseLayer name="Satellite (ESRI)">
              <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
            </LayersAny.BaseLayer>
          </LayersAny>

          {features.map((f) => {
            const [lon, lat] = f.geometry?.coordinates ?? [];
            if (typeof lat !== 'number' || typeof lon !== 'number') return null;
            const pos: LatLng = [lat, lon]; // Leaflet attend [lat, lon]
            return (
              <Marker key={f.properties.id} position={pos} icon={icon}>
                <Popup>
                  <div>
                    <strong>{f.properties.name}</strong>
                    {f.properties.kind && <div>Type : {f.properties.kind}</div>}
                    {typeof f.properties.score === 'number' && <div>Note : {f.properties.score}</div>}
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapAny>
      </div>
      <div style={{ fontSize: 12, marginTop: 6 }}>Résultats : {features.length}</div>
    </div>
  );
}
