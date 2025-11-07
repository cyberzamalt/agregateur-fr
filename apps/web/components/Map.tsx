// apps/web/components/Map.tsx
'use client';

import { useEffect } from 'react';
import {
  MapContainer as RLMapContainer,
  TileLayer as RLTileLayer,
  Marker as RLMarker,
  Popup as RLPopup,
  LayersControl as RLLayersControl,
  ScaleControl as RLScaleControl,
  useMap,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import type { BoundsTuple, SiteFeature } from '../lib/api';

// Cast pragmatiques pour éviter les soucis de d.ts selon versions
const MapContainer: any = RLMapContainer as any;
const TileLayer: any = RLTileLayer as any;
const Marker: any = RLMarker as any;
const Popup: any = RLPopup as any;
const LayersControl: any = RLLayersControl as any;
const ScaleControl: any = RLScaleControl as any;

const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  shadowSize: [41, 41],
});

function FitBounds({ bounds }: { bounds?: BoundsTuple }) {
  const map = useMap();
  useEffect(() => {
    if (!bounds) return;
    map.fitBounds(bounds, { padding: [20, 20] });
  }, [bounds, map]);
  return null;
}

type Props = {
  features: SiteFeature[];
  bounds?: BoundsTuple;
};

export default function Map({ features, bounds }: Props) {
  const defaultCenter: [number, number] = [46.5, 2.5];

  return (
    <div style={{ width: '100%', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ width: '100%', height: 430, borderRadius: 12, overflow: 'hidden', border: '1px solid #333' }}>
        <MapContainer center={defaultCenter} zoom={6} style={{ width: '100%', height: '100%' }}>
          <ScaleControl position="bottomleft" />
          <FitBounds bounds={bounds} />

          <LayersControl position="topright">
            <LayersControl.BaseLayer checked name="Standard (OSM)">
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
            </LayersControl.BaseLayer>

            <LayersControl.BaseLayer name="Relief (OpenTopoMap)">
              <TileLayer url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png" attribution="&copy; OpenTopoMap, &copy; OpenStreetMap contributors" />
            </LayersControl.BaseLayer>

            <LayersControl.BaseLayer name="Satellite (Esri)">
              <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" attribution="Tiles &copy; Esri" />
            </LayersControl.BaseLayer>
          </LayersControl>

          {features.map((f) => {
            const [lon, lat] = f.geometry.coordinates;
            const pos: [number, number] = [lat, lon]; // Leaflet = [lat, lon]
            return (
              <Marker key={f.properties.id} position={pos} icon={markerIcon}>
                <Popup>
                  <div style={{ maxWidth: 220 }}>
                    <strong>{f.properties.name}</strong>
                    {f.properties.kind && <div>{f.properties.kind}</div>}
                    {f.properties.address && <div style={{ opacity: 0.8 }}>{f.properties.address}</div>}
                    {typeof f.properties.score === 'number' && (
                      <div style={{ marginTop: 4 }}>Score : {f.properties.score.toFixed(1)}</div>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}
