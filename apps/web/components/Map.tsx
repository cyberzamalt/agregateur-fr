'use client';

import React, { useEffect, useMemo } from 'react';
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
import type { SiteFeature } from '../lib/api';

// Cast souples pour éviter les d.ts capricieux sur Render
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

function FitToFeatures({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (!points.length) {
      map.setView([46.5, 2.5], 5);
      return;
    }
    const b = L.latLngBounds(points.map(([lat, lon]) => L.latLng(lat, lon)));
    map.fitBounds(b, { padding: [20, 20] });
  }, [points, map]);
  return null;
}

export default function Map({ features }: { features: SiteFeature[] }) {
  const points = useMemo<[number, number][]>(() => {
    return (features || []).map((f) => {
      const [lon, lat] = f.geometry.coordinates; // GeoJSON = [lon, lat]
      return [lat, lon]; // Leaflet = [lat, lon]
    });
  }, [features]);

  return (
    <div style={{ width: '100%', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ width: '100%', height: 420, borderRadius: 12, overflow: 'hidden', border: '1px solid #333' }}>
        <MapContainer center={[46.5, 2.5]} zoom={5} style={{ width: '100%', height: '100%' }}>
          <ScaleControl position="bottomleft" />

          {/* Zoom automatique sur la sélection */}
          <FitToFeatures points={points} />

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
                attribution="&copy; OpenTopoMap, &copy; OpenStreetMap contributors"
              />
            </LayersControl.BaseLayer>

            <LayersControl.BaseLayer name="Satellite (Esri)">
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution="Tiles &copy; Esri"
              />
            </LayersControl.BaseLayer>
          </LayersControl>

          {(features || []).map((f) => {
            const [lon, lat] = f.geometry.coordinates;
            const p = f.properties || {};
            return (
              <Marker key={p.id} position={[lat, lon]} icon={markerIcon}>
                <Popup>
                  <div style={{ minWidth: 180 }}>
                    <strong>{p.name}</strong>
                    {p.kind && <div style={{ opacity: 0.8 }}>{p.kind}</div>}
                    {p.address && <div style={{ opacity: 0.8 }}>📍 {p.address}</div>}
                    <div style={{ opacity: 0.8, fontSize: 13 }}>
                      {p.commune ? `${p.commune}, ` : ''}
                      {p.departement ? `${p.departement}, ` : ''}
                      {p.region ?? ''}
                    </div>
                    {typeof p.score === 'number' && (
                      <div style={{ marginTop: 4, fontSize: 13 }}>Score : {p.score.toFixed(1)}</div>
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
