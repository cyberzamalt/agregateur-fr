"use client";

import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";

const MapContainer = dynamic(
  async () => (await import("react-leaflet")).MapContainer,
  { ssr: false }
);
const TileLayer = dynamic(async () => (await import("react-leaflet")).TileLayer, { ssr: false });
const Marker = dynamic(async () => (await import("react-leaflet")).Marker, { ssr: false });
const Popup = dynamic(async () => (await import("react-leaflet")).Popup, { ssr: false });

type Feature = {
  type: "Feature";
  geometry: { type: "Point"; coordinates: [number, number] };
  properties: { id: string; title: string; type?: string | null; departement?: string | null; score?: number | null };
};
type FC = { type: "FeatureCollection"; features: Feature[] };

export default function MapSites() {
  const [data, setData] = useState<FC | null>(null);

  useEffect(() => {
    fetch("/sites.geojson").then(r => r.json()).then(setData).catch(() => setData);
  }, []);

  // Paris centrée par défaut
  const center: [number, number] = [48.8566, 2.3522];

  return (
    <div className="w-full h-[60vh] rounded-xl overflow-hidden border border-neutral-700">
      <MapContainer center={center} zoom={6} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {data?.features.map((f) => {
          const [lon, lat] = f.geometry.coordinates;
          return (
            <Marker key={f.properties.id} position={[lat, lon]}>
              <Popup>
                <div className="text-sm">
                  <div className="font-semibold">{f.properties.title}</div>
                  {f.properties.type && <div>Type : {f.properties.type}</div>}
                  {f.properties.departement && <div>Dept : {f.properties.departement}</div>}
                  {typeof f.properties.score === "number" && <div>Score : {f.properties.score}</div>}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
