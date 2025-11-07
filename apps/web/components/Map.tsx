'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  MapContainer as RLMapContainer,
  TileLayer as RLTileLayer,
  Marker as RLMarker,
  Popup as RLPopup,
  LayersControl as RLLayersControl,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// --- Icône Leaflet ---
const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  shadowSize: [41, 41],
});

// --- Types simples ---
type SiteFeature = {
  type: 'Feature';
  geometry: { type: 'Point'; coordinates: [number, number] }; // [lon, lat]
  properties: { id: string; name: string; kind?: string; region?: string; score?: number };
};
type FeatureCollection = { type: 'FeatureCollection'; features: SiteFeature[] };

// --- Casts any pour neutraliser les d.ts bruyants en prod ---
const MapContainer: any = RLMapContainer as any;
const TileLayer: any = RLTileLayer as any;
const Marker: any = RLMarker as any;
const Popup: any = RLPopup as any;
const LayersControl: any = RLLayersControl as any;

export default function Map() {
  const [features, setFeatures] = useState<SiteFeature[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/sites.geojson', { cache: 'no-store' });
        const data = await res.json();

        let feats: SiteFeature[] = [];
        if (Array.isArray(data)) {
          feats = data as SiteFeature[];
        } else if (data?.type === 'FeatureCollection' && Array.isArray((data as FeatureCollection).features)) {
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

  const center = useMemo<[number, number]>(() => {
    if (!features.length) return [46.5, 2.5];
    let lat = 0, lon = 0;
    for (const f of features) {
      const [x, y] = f.geometry.coordinates; // [lon, lat]
      lon += x; lat += y;
    }
    return [lat / features.length, lon / features.length];
  }, [features]);

  return (
    <div style={{ width: '100%', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ width: '100%', height: 420, borderRadius: 12, overflow: 'hidden', border: '1px solid #333' }}>
        <MapContainer center={center} zoom={6} style={{ width: '100%', height: '100%' }}>
          <LayersControl position="topright">
            <LayersControl.BaseLayer checked name="Standard (OSM)">
              <TileLayer
                key="osm"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                crossOrigin=""
                maxZoom={19}
              />
            </LayersControl.BaseLayer>

            <LayersControl.BaseLayer name="Relief (OpenTopoMap)">
              <TileLayer
                key="opentopo"
                url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
                crossOrigin=""
                maxZoom={17}
              />
            </LayersControl.BaseLayer>

            <LayersControl.BaseLayer name="Satellite (Esri)">
              <TileLayer
                key="esri-sat"
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                crossOrigin=""
                maxZoom={19}
              />
            </LayersControl.BaseLayer>
          </LayersControl>

          {features.map(f => {
            const [lon, lat] = f.geometry.coordinates;
            const pos: [number, number] = [lat, lon]; // Leaflet attend [lat, lon]
            return (
              <Marker key={f.properties.id} position={pos} icon={markerIcon}>
                <Popup>
                  <strong>{f.properties.name}</strong>
                  {f.properties.kind && <div>{f.properties.kind}</div>}
                  {typeof f.properties.score === 'number' && <div>Score : {f.properties.score.toFixed(1)}</div>}
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
