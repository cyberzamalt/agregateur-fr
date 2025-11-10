// apps/web/components/Map.tsx
"use client";

import React, { useEffect, useMemo } from "react";
import {
  MapContainer as RLMapContainer,
  TileLayer as RLTileLayer,
  Marker as RLMarker,
  Popup as RLPopup,
  LayersControl as RLLayersControl,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import type { SiteFeature, SiteFilters, BoundsTuple } from "../lib/api";

// Neutralise les typings stricts de react-leaflet (versions qui diffèrent)
const MapContainerAny = RLMapContainer as unknown as React.ComponentType<any>;
const TileLayerAny = RLTileLayer as unknown as React.ComponentType<any>;
const MarkerAny = RLMarker as unknown as React.ComponentType<any>;
const PopupAny = RLPopup as unknown as React.ComponentType<any>;
const LayersControlAny = RLLayersControl as unknown as React.ComponentType<any>;
const BaseLayerAny = (RLLayersControl as any).BaseLayer as React.ComponentType<any>;
// const OverlayAny = (RLLayersControl as any).Overlay as React.ComponentType<any>; // pas utilisé ici

type Props = { features: SiteFeature[]; filters: SiteFilters };

const FRANCE_BOUNDS: BoundsTuple = [
  [41.2, -5.5],
  [51.3, 9.6],
];

// Icône de marqueur par défaut (Leaflet ne charge pas l’icône sinon)
const pin = new L.Icon({
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function match(f: SiteFeature, flt: SiteFilters) {
  if (flt.q) {
    const hay = `${f.name} ${f.address ?? ""} ${f.commune ?? ""} ${f.department ?? ""} ${f.region ?? ""}`.toLowerCase();
    if (!hay.includes(flt.q.toLowerCase())) return false;
  }
  if (flt.type !== "all" && f.type !== flt.type) return false;
  if (flt.region !== "all" && f.region !== flt.region) return false;
  if (flt.department !== "all" && f.department !== flt.department) return false;
  if (flt.commune !== "all" && f.commune !== flt.commune) return false;
  if (typeof f.score === "number" && f.score < flt.minScore) return false;
  if (typeof f.lat !== "number" || typeof f.lon !== "number") return false;
  return true;
}

function useItemsBounds(items: SiteFeature[]): BoundsTuple {
  return useMemo(() => {
    if (!items.length) return FRANCE_BOUNDS;
    const b = L.latLngBounds(items.map((f) => [f.lat, f.lon] as [number, number]));
    return [
      [b.getSouthWest().lat, b.getSouthWest().lng],
      [b.getNorthEast().lat, b.getNorthEast().lng],
    ];
  }, [items]);
}

// Force un fitBounds quand la sélection change (meilleur que le prop bounds seul)
function FitToBounds({ bounds }: { bounds: BoundsTuple }) {
  const map = useMap();
  useEffect(() => {
    try {
      map.fitBounds(bounds as any, { padding: [24, 24] });
    } catch {}
  }, [map, bounds[0][0], bounds[0][1], bounds[1][0], bounds[1][1]]);
  return null;
}

export default function Map({ features, filters }: Props) {
  const items = useMemo(() => features.filter((f) => match(f, filters)), [features, filters]);
  const bounds = useItemsBounds(items);

  return (
    <MapContainerAny
      style={{ height: 420, width: "100%", maxWidth: 980, borderRadius: 8 }}
      bounds={bounds as any}
      preferCanvas
    >
      <LayersControlAny position="topright">
        <BaseLayerAny checked name="Plan (OSM)">
          <TileLayerAny
            attribution="© OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        </BaseLayerAny>

        <BaseLayerAny name="Relief (OpenTopoMap)">
          <TileLayerAny
            attribution="© OpenStreetMap contributors, SRTM | © OpenTopoMap (CC-BY-SA)"
            url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
          />
        </BaseLayerAny>

        <BaseLayerAny name="Satellite (ESRI)">
          <TileLayerAny
            attribution="Tiles © Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye…"
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          />
        </BaseLayerAny>
      </LayersControlAny>

      <FitToBounds bounds={bounds} />

      {items.map((pt, i) => (
        <MarkerAny key={pt.id ?? `${pt.lat},${pt.lon},${i}`} position={[pt.lat, pt.lon]} icon={pin}>
          <PopupAny>
            <strong>{pt.name}</strong>
            <br />
            {pt.address ?? ""}
            <br />
            {[pt.commune, pt.department, pt.region].filter(Boolean).join(", ")}
            {typeof pt.score === "number" ? <div>Score : {pt.score}</div> : null}
            <div style={{ opacity: 0.7, marginTop: 4 }}>
              #{i + 1} / {items.length}
            </div>
          </PopupAny>
        </MarkerAny>
      ))}
    </MapContainerAny>
  );
}
