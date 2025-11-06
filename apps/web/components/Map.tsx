'use client';

import { MapContainer, TileLayer, LayersControl, Marker, Popup } from 'react-leaflet';
import type { FC } from 'react';
import type { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// ✅ Fix des icônes Leaflet (Next ne résout pas les assets par défaut)
const IconDefault = L.Icon.Default as any;
IconDefault.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export type SiteFeature = {
  type: 'Feature';
  geometry: { type: 'Point'; coordinates: [number, number] }; // [lon, lat]
  properties: {
    id: string;
    name: string;
    kind?: string;
    region?: string;
    score?: number;
  };
};

type Props = {
  features: SiteFeature[];
  center?: LatLngExpression;
  zoom?: number;
};

const Map: FC<Props> = ({ features, center = [46.5, 2.5], zoom = 6 }) => {
  return (
    <div style={{ width: '100%', maxWidth: 980, margin: '0 auto' }}>
      <div style={{ width: '100%', height: 420, borderRadius: 12, overflow: 'hidden', border: '1px solid #333' }}>
        <MapContainer center={center} zoom={zoom} style={{ width: '100%', height: '100%' }}>
          {/* Fonds de carte */}
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
                attribution="&copy; OpenTopoMap contributors, &copy; OpenStreetMap"
              />
            </LayersControl.BaseLayer>

            <LayersControl.BaseLayer name="Satellite (Esri)">
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution="&copy; Esri, Maxar, Earthstar Geographics"
              />
            </LayersControl.BaseLayer>
          </LayersControl>

          {/* Marqueurs */}
          {features.map((f) => {
            const [lon, lat] = f.geometry.coordinates || [];
            if (typeof lat !== 'number' || typeof lon !== 'number') return null;
            return (
              <Marker key={f.properties.id} position={[lat, lon]}>
                <Popup>
                  <div style={{ fontWeight: 600 }}>{f.properties.name}</div>
                  <div>Type : {f.properties.kind || '—'}</div>
                  <div>Région : {f.properties.region || '—'}</div>
                  <div>Note : {typeof f.properties.score === 'number' ? f.properties.score.toFixed(1) : '—'}</div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
};

export default Map;
