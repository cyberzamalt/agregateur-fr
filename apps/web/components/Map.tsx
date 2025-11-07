// @ts-nocheck
'use client';

import { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, LayersControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Icônes par défaut corrigeées (Next)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

type Feature = {
  geometry: { type: 'Point'; coordinates: [number, number] }; // [lon, lat]
  properties: { id: string; name: string; kind?: string | null; score?: number | null };
};
type FC = { type: 'FeatureCollection'; features: Feature[] };

export default function Map() {
  const [fc, setFc] = useState<FC | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch('/sites.geojson', { cache: 'no-store' });
        if (!r.ok) throw new Error('geojson ' + r.status);
        const j = await r.json();
        setFc(j);
      } catch (e: any) {
        setErr(e?.message || 'Erreur de chargement');
      }
    })();
  }, []);

  const features = fc?.features ?? [];
  const center = useMemo<[number, number]>(() => [46.5, 2.5], []);

  return (
    <div style={{ width: '100%', maxWidth: 1100 }}>
      <div style={{ width: '100%', height: 420, borderRadius: 12, overflow: 'hidden', border: '1px solid #333' }}>
        {/* Si erreur, affiche un panneau lisible au lieu d’un écran blanc */}
        {err ? (
          <div style={{ height: '100%', display: 'grid', placeItems: 'center', padding: 16 }}>
            <div style={{ opacity: 0.8 }}>
              Impossible de charger <code>sites.geojson</code> : {err}
            </div>
          </div>
        ) : (
          <MapContainer center={center} zoom={6} style={{ width: '100%', height: '100%' }}>
            <LayersControl position="topright">
              <LayersControl.BaseLayer checked name="OSM standard">
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="&copy; OpenStreetMap contributors"
                />
              </LayersControl.BaseLayer>

              <LayersControl.BaseLayer name="Relief (Stamen Terrain)">
                <TileLayer
                  url="https://stamen-tiles.a.ssl.fastly.net/terrain/{z}/{x}/{y}.jpg"
                  attribution="Map tiles by Stamen Design, under CC BY 3.0 — Data © OpenStreetMap contributors"
                />
              </LayersControl.BaseLayer>

              <LayersControl.BaseLayer name="Satellite (Esri)">
                <TileLayer
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                  attribution="Tiles &copy; Esri"
                />
              </LayersControl.BaseLayer>
            </LayersControl>

            {features.map((f) => {
              const [lon, lat] = f.geometry.coordinates || [];
              if (typeof lat !== 'number' || typeof lon !== 'number') return null;
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
        )}
      </div>
      <div style={{ marginTop: 8, fontSize: 12, opacity: 0.75 }}>
        {fc ? `Points affichés : ${features.length}` : 'Chargement en cours…'}
      </div>
    </div>
  );
}
