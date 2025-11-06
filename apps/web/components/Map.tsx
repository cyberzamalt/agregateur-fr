'use client';

import { useEffect, useState } from 'react';
import { MapContainer as RLMapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// ---- Typage minimal pour éviter l'erreur "center n'existe pas" ----
const MapContainer: any = RLMapContainer;

type Feature = {
  id: string;
  properties?: { name?: string; kind?: string; score?: number };
  geometry: { type: 'Point'; coordinates: [number, number] }; // [lon, lat]
};

// Icône par défaut
const defaultIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
(L.Marker.prototype as any).options.icon = defaultIcon;

export default function Map() {
  const [features, setFeatures] = useState<Feature[]>([]);

  useEffect(() => {
    let alive = true;
    fetch('/sites.geojson')
      .then(r => r.json())
      .then(d => alive ? setFeatures(Array.isArray(d?.features) ? d.features : []) : undefined)
      .catch(() => setFeatures([]));
    return () => { alive = false; };
  }, []);

  return (
    <div style={{ width: '100%', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ width: '100%', height: 420, borderRadius: 12, overflow: 'hidden', border: '1px solid #333' }}>
        <MapContainer center={[46.5, 2.5]} zoom={6} style={{ width: '100%', height: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
          {features.map(f => {
            const [lon, lat] = f.geometry.coordinates || [];
            if (typeof lat !== 'number' || typeof lon !== 'number') return null;
            return (
              <Marker key={f.id} position={[lat, lon]}>
                <Popup>
                  <div style={{ fontWeight: 600 }}>{f.properties?.name ?? f.id}</div>
                  <div>Type : {f.properties?.kind ?? '—'}</div>
                  {typeof f.properties?.score === 'number' && <div>Note : {f.properties.score.toFixed(1)}</div>}
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
      <div style={{ fontSize: 12, marginTop: 6, textAlign: 'left' }}>Résultats : {features.length}</div>
    </div>
  );
}
