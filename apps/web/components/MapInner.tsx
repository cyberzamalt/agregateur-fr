/* @ts-nocheck */
'use client';

import { useEffect, useMemo, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  MapContainer as RLMapContainer,
  TileLayer,
  Marker,
  Popup,
  LayersControl,
} from 'react-leaflet';

// cast pour neutraliser les types de react-leaflet côté build
const MapContainer: any = RLMapContainer;

// Corrige les icônes par défaut (Next/Leaflet)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

type Feature = {
  geometry: { type: 'Point'; coordinates: [number, number] }; // lon, lat
  properties: { id: string; name: string; kind?: string | null; score?: number | null };
};
type FC = { type: 'FeatureCollection'; features: Feature[] };

export default function MapInner() {
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
    <div
      style={{
        width: '100%',
        height: 420,
        borderRadius: 12,
        overflow: 'hidden',
        border: '1px solid #333',
      }}
    >
      <MapContainer center={center} zoom={zoom} style={{ width: '100%', height: '100%' }}>
        {/* Sélecteur de fonds de carte */}
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="Standard (OSM)">
            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>

          <LayersControl.BaseLayer name="Relief (OpenTopoMap)">
            <TileLayer
              attribution="Map data: &copy; OpenStreetMap contributors, SRTM | Map style: &copy; OpenTopoMap (CC-BY-SA)"
              url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>

          <LayersControl.BaseLayer name="Satellite (Esri)">
            <TileLayer
              attribution="Tiles &copy; Esri — Sources: Esri, i-cubed, USDA, USGS, IGN, etc."
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
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
                {typeof f.properties.score === 'number' ? <div>Note : {f.properties.score}</div> : null}
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
