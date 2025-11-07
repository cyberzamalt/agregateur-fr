"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  MapContainer as RLMapContainer,
  TileLayer as RLTileLayer,
  Marker as RLMarker,
  Popup as RLPopup,
  LayersControl as RLLayersControl,
  ScaleControl as RLScaleControl,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import type { Feature, SiteFilters } from "../lib/api";
import { fetchSites } from "../lib/api";

// Casts any → neutralise les soucis de d.ts selon versions
const MapContainer: any = RLMapContainer as any;
const TileLayer: any = RLTileLayer as any;
const Marker: any = RLMarker as any;
const Popup: any = RLPopup as any;
const LayersControl: any = RLLayersControl as any;
const ScaleControl: any = RLScaleControl as any;

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  shadowSize: [41, 41],
});

type Props = { filters?: SiteFilters };

export default function Map({ filters }: Props) {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        // Si filtres fournis → API filtrée, sinon tout
        const data = await fetchSites(filters);
        setFeatures(Array.isArray(data) ? data : []);
      } catch (e: any) {
        setErr(e?.message || "fetch_error");
        setFeatures([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [JSON.stringify(filters || {})]);

  const center = useMemo<[number, number]>(() => {
    if (!features.length) return [46.5, 2.5];
    let lat = 0,
      lon = 0;
    for (const f of features) {
      const [x, y] = f.geometry.coordinates; // [lon,lat]
      lon += x;
      lat += y;
    }
    return [lat / features.length, lon / features.length];
  }, [features]);

  return (
    <div style={{ width: "100%", maxWidth: 900, margin: "0 auto" }}>
      <div style={{ width: "100%", height: 420, borderRadius: 12, overflow: "hidden", border: "1px solid #333" }}>
        <MapContainer center={center} zoom={6} style={{ width: "100%", height: "100%" }}>
          <ScaleControl position="bottomleft" />
          <LayersControl position="topright">
            <LayersControl.BaseLayer checked name="Standard (OSM)">
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
            </LayersControl.BaseLayer>

            <LayersControl.BaseLayer name="Relief (OpenTopoMap)">
              <TileLayer url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png" attribution="&copy; OpenTopoMap" />
            </LayersControl.BaseLayer>

            <LayersControl.BaseLayer name="Satellite (Esri)">
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution="Tiles &copy; Esri"
              />
            </LayersControl.BaseLayer>
          </LayersControl>

          {features.map((f) => {
            const [lon, lat] = f.geometry.coordinates;
            const pos: [number, number] = [lat, lon];
            const p = f.properties || {};
            return (
              <Marker key={p.id} position={pos} icon={markerIcon}>
                <Popup>
                  <div style={{ fontWeight: 700 }}>{p.name}</div>
                  {p.address && <div style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>{p.address}</div>}
                  {(p.region || p.department || p.commune) && (
                    <div style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>
                      {[p.commune, p.department, p.region].filter(Boolean).join(" • ")}
                    </div>
                  )}
                  {typeof p.score === "number" && <div style={{ marginTop: 4 }}>Score : {p.score.toFixed(1)}</div>}
                  {p.kind && <div style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>Type : {p.kind}</div>}
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      <div style={{ marginTop: 8, fontSize: 13, opacity: 0.8 }}>
        {loading ? "Chargement…" : err ? `Erreur : ${err}` : `Résultats : ${features.length}`}
      </div>
    </div>
  );
}
