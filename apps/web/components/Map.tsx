'use client';

import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, LayersControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// --- Icône Leaflet (CDN) ---
const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  shadowSize: [41, 41],
});

// --- Types locaux (pas d'import 'geojson') ---
type SiteFeature = {
  type: 'Feature';
  geometry: { type: 'Point'; coordinates: [number, number] }; // GeoJSON: [lon, lat]
  properties: {
    id: string;
    name: string;
    kind?: string;
    region?: string;
    dep_code?: string;
    score?: number;
  };
};
type FeatureCollection = { type: 'FeatureCollection'; features: SiteFeature[] };

export default function Map() {
  const [features, setFeatures] = useState<SiteFeature[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/sites.geojson', { cache: 'no-store' });
        const data: unknown = await res.json();

        let feats: SiteFeature[] = [];
        if (Array.isArray(data)) {
          feats = data as SiteFeature[];
        } else if (
          data &&
          (data as FeatureCollection).type === 'FeatureCollection' &&
          Array.isArray((data as FeatureCollection).features)
        ) {
          feats = (data as FeatureCollection).features;
        }

        setFeatures(
          feats.filter(
            f =>
              f?.geometry?.type === 'Point' &&
              Array.isArray(f.geometry.coordinates) &&
              typeof f.geometry.coordinates[0] === 'number' &&
              typeof f.geometry.coordinates[1] === 'number'
          )
        );
      } catch (e) {
        console.error('Erreur chargement sites.geojson', e);
        setFeatures([]);
      }
    })();
  }, []);

  // Centre auto (moyenne) ou France par défaut
  const center = useMemo<[number, number]>(() => {
    if (!features.length) return [46.5, 2.5];
    let latSum = 0, lonSum = 0;
    features.forEach(f => {
      const [lon, lat] = f.geometry.coordinates;
      latSum += lat;
      lonSum += lon;
    });
    return [latSum / features.length, lonSum / features.length];
  }, [features]);

  return (
    <div style={{ width: '100%', maxWidth: 900, margin: '0 auto' }}>
      <div
        style={{
          width: '100%',
          height: 420,
          borderRadius: 12,
          overflow: 'hidden',
          border: '1px solid #333',
        }}
      >
        <MapContainer center={center as any} zoom={6} style={{ width: '100%', height: '100%' }}>
          <LayersControl position="topright">
            <LayersControl.BaseLayer checked name="Standard (OSM)">
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer name="Toner (Carto)">
              <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/toner/{z}/{x}/{y}.png" />
            </LayersControl.BaseLayer>
          </LayersControl>

          {features.map(f => {
            const [lon, lat] = f.geometry.coordinates; // GeoJSON => [lon, lat]
            const pos: [number, number] = [lat, lon];  // Leaflet => [lat, lon]
            return (
              <Marker key={f.properties.id} position={pos as any} icon={markerIcon as any}>
                <Popup>
                  <div>
                    <strong>{f.properties.name}</strong>
                    {f.properties.kind && <div>{f.properties.kind}</div>}
                    {typeof f.properties.score === 'number' && (
                      <div>Score : {f.properties.score.toFixed(1)}</div>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      <div style={{ marginTop: 8, fontSize: 13, opacity: 0.8 }}>Résultats : {features.length}</div>
    </div>
  );
}
