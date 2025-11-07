'use client';

import { useEffect, useMemo, useRef } from 'react';
import {
  MapContainer as RLMapContainer,
  TileLayer as RLTileLayer,
  Marker as RLMarker,
  Popup as RLPopup,
  LayersControl as RLLayersControl,
  ScaleControl as RLScaleControl,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import type { SiteFeature } from '../lib/api';

// Casts pour éviter les warnings de types sur react-leaflet en build Render
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

type Props = { features: SiteFeature[] };

export default function Map({ features }: Props) {
  const mapRef = useRef<any>(null);

  // Centre par défaut sur la France
  const defaultCenter: [number, number] = [46.5, 2.5];

  // Bounds calculés sur les features filtrées
  const bounds = useMemo(() => {
    const b = L.latLngBounds([]);
    for (const f of features) {
      const [lon, lat] = f.geometry.coordinates;
      b.extend([lat, lon]);
    }
    return b;
  }, [features]);

  // fitBounds/zoom automatique sur changement de filtres
  useEffect(() => {
    const m = mapRef.current;
    if (!m) return;

    if (features.length === 0) {
      m.setView(defaultCenter, 6, { animate: true });
      return;
    }
    if (features.length === 1) {
      const [lon, lat] = features[0].geometry.coordinates;
      m.flyTo([lat, lon], 12, { animate: true });
      return;
    }
    if (bounds.isValid()) {
      m.fitBounds(bounds.pad(0.2), { animate: true });
    }
  }, [features, bounds]);

  return (
    <div style={{ width: '100%', maxWidth: 980 }}>
      <div style={{ width: '100%', height: 420, borderRadius: 12, overflow: 'hidden', border: '1px solid #333' }}>
        <MapContainer
          center={defaultCenter as any}
          zoom={6}
          style={{ width: '100%', height: '100%' }}
          whenCreated={(m: any) => (mapRef.current = m)}
        >
          <ScaleControl position="bottomleft" />

          <LayersControl position="topright">
            <LayersControl.BaseLayer checked name="Standard (OSM)">
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            </LayersControl.BaseLayer>

            <LayersControl.BaseLayer name="Relief (OpenTopoMap)">
              <TileLayer url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png" />
            </LayersControl.BaseLayer>

            <LayersControl.BaseLayer name="Satellite (Esri)">
              <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
            </LayersControl.BaseLayer>
          </LayersControl>

          {features.map((f) => {
            const [lon, lat] = f.geometry.coordinates;
            const p = f.properties || {};
            return (
              <Marker key={p.id ?? `${lat},${lon}`} position={[lat, lon]} icon={markerIcon as any}>
                <Popup>
                  <div style={{ minWidth: 180 }}>
                    <strong>{p.name ?? 'Sans nom'}</strong>
                    {p.kind && <div>{p.kind}</div>}
                    {p.address && <div style={{ opacity: 0.8 }}>{p.address}</div>}
                    {typeof p.score === 'number' && <div style={{ marginTop: 4 }}>Score : {p.score.toFixed(1)}</div>}
                    {(p.region || p.dept || p.commune) && (
                      <div style={{ marginTop: 6, opacity: 0.8 }}>
                        {[p.commune, p.dept, p.region].filter(Boolean).join(' · ')}
                      </div>
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
