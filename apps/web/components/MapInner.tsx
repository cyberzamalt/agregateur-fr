"use client";

// Version interne si tu veux composer Map en sous-composants.
// Non utilisée par défaut. Types "any" pour éviter les erreurs de d.ts.
import React from "react";
import {
  MapContainer as RLMapContainer,
  TileLayer as RLTileLayer,
  LayersControl as RLLayersControl,
  ScaleControl as RLScaleControl,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

const MapContainer: any = RLMapContainer as any;
const TileLayer: any = RLTileLayer as any;
const LayersControl: any = RLLayersControl as any;
const ScaleControl: any = RLScaleControl as any;

export default function MapInner({
  center,
  zoom = 6,
  children,
}: {
  center: [number, number];
  zoom?: number;
  children?: React.ReactNode;
}) {
  return (
    <div style={{ width: "100%", maxWidth: 900, height: 420, borderRadius: 12, overflow: "hidden", border: "1px solid #333" }}>
      <MapContainer center={center} zoom={zoom} style={{ width: "100%", height: "100%" }}>
        <ScaleControl position="bottomleft" />
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="Standard (OSM)">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Relief (OpenTopoMap)">
            <TileLayer url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png" attribution="&copy; OpenTopoMap" />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Satellite (Esri)">
            <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" attribution="Esri" />
          </LayersControl.BaseLayer>
        </LayersControl>
        {children}
      </MapContainer>
    </div>
  );
}
