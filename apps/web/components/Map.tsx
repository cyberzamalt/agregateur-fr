'use client';

// apps/web/components/Map.tsx
import React, { useEffect, useMemo, useState } from 'react';
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

import type { SiteFeature, SiteFilters } from '../lib/api';
import { defaultFilters, matchFilters } from '../lib/api';

// ——— Icône Leaflet CDN ———
const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  shadowSize: [41, 41],
});

// Casts "any" pour neutraliser les warnings TS côté Render
const MapContainer: any = RLMapContainer as any;
const TileLayer: any = RLTileLayer as any;
const Marker: any = RLMarker as any;
const Popup: any = RLPopup as any;
const LayersControl: any = RLLayersControl as any;
const ScaleControl: any = RLScaleControl as any;

/** Ajuste la vue de la carte à chaque changement de points filtrés */
function FitOnChange({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    if (!points.length) return;

    if (points.length === 1) {
      map.setView(points[0], 11, { animate: true });
      return;
    }
    const bounds = L.latLngBounds(points);
    map.fitBounds(bounds, { padding: [20, 20], maxZoom: 12, animate: true });
  }, [map, points]);
  return null;
}

type Props = {
  /** Filtres en provenance de la page (optionnel). Sans prop => tout s’affiche. */
  filters?: Partial<SiteFilters>;
};

export default function Map({ filters }: Props) {
  const [all, setAll] = useState<SiteFeature[]>([]);

  // Charge sites.geojson + éventuels fichiers listés dans /public/data/index.json
  useEffect(() => {
    (async () => {
      try {
        const base = await fetch('/sites.geojson', { cache: 'no-store' }).then(r => r.json()).catch(() => null);

        let extra: SiteFeature[] = [];
        try {
          const manifest = await fetch('/data/index.json', { cache: 'no-store' }).then(r => r.json());
          if (Array.isArray(manifest?.files)) {
            const loaded = await Promise.all(
              manifest.files.map((f: string) =>
                fetch(`/data/${f}`, { cache: 'no-store' }).then(r => r.json()).catch(() => null)
              )
            );
            loaded.forEach((d: any) => {
              const arr = toFeatures(d);
              if (arr.length) extra.push(...arr);
            });
          }
        } catch {
          // pas de manifest => OK
        }

        const merged = dedupeById([...toFeatures(base), ...extra]);
        setAll(merged);
      } catch {
        setAll([]);
      }
    })();
  }, []);

  // Application des filtres
  const activeFilters: SiteFilters = { ...defaultFilters, ...(filters || {}) };
  const visible = useMemo(() => all.filter(f => matchFilters(f, activeFilters)), [all, activeFilters]);

  // Centre initial FR (si rien) – on affiche la France métropolitaine
  const center: [number, number] = useMemo(() => {
    if (!visible.length) return [46.5, 2.5];
    let lat = 0, lon = 0;
    for (const f of visible) {
      const [x, y] = f.geometry.coordinates; // [lon, lat]
      lon += x; lat += y;
    }
    return [lat / visible.length, lon / visible.length];
  }, [visible]);

  const points = useMemo<[number, number][]>(() =>
    visible.map(f => [f.geometry.coordinates[1], f.geometry.coordinates[0]]), [visible]
  );

  return (
    <div style={{ width: '100%', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ width: '100%', height: 420, borderRadius: 12, overflow: 'hidden', border: '1px solid #333' }}>
        <MapContainer center={center} zoom={6} style={{ width: '100%', height: '100%' }}>
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

          {/* Zoom auto dès que la liste visible change */}
          <FitOnChange points={points} />

          {visible.map(f => {
            const [lon, lat] = f.geometry.coordinates;
            const pos: [number, number] = [lat, lon];
            const p = f.properties || {};
            return (
              <Marker key={p.id} position={pos} icon={markerIcon}>
                <Popup>
                  <div style={{ fontWeight: 700 }}>{p.name}</div>
                  {p.kind && <div>{p.kind}</div>}
                  {p.address && <div style={{ opacity: .8 }}>{p.address}</div>}
                  {typeof p.score === 'number' && <div>Score : {p.score.toFixed(1)}</div>}
                  {[p.region, p.departement, p.commune].filter(Boolean).length > 0 && (
                    <div style={{ fontSize: 12, opacity: .8, marginTop: 4 }}>
                      {[p.region, p.departement, p.commune].filter(Boolean).join(' · ')}
                    </div>
                  )}
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      <div style={{ marginTop: 8, fontSize: 13, opacity: 0.8 }}>Résultats : {visible.length}</div>
    </div>
  );
}

function toFeatures(data: any): SiteFeature[] {
  if (!data) return [];
  if (Array.isArray(data)) return data as SiteFeature[];
  if (data.type === 'FeatureCollection' && Array.isArray(data.features)) return data.features as SiteFeature[];
  return [];
}
function dedupeById(arr: SiteFeature[]): SiteFeature[] {
  const seen = new Set<string>();
  const out: SiteFeature[] = [];
  for (const f of arr) {
    const id = String(f?.properties?.id ?? '');
    if (!id || seen.has(id)) continue;
    seen.add(id);
    out.push(f);
  }
  return out;
}
