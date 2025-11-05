// tools/build-geojson.ts
import fs from "fs";
import path from "path";

type Coords = { lat: number; lon: number };
type Site = {
  id: string; title: string; coords?: Coords; type?: string; departement?: string; score?: number;
};

const SEED = path.resolve("data/seed/sites.json");
const OUT = path.resolve("apps/web/public/sites.geojson");

function run() {
  const raw = fs.readFileSync(SEED, "utf-8");
  const sites: Site[] = JSON.parse(raw);

  const features = sites
    .filter(s => s.coords && Number.isFinite(s.coords!.lat) && Number.isFinite(s.coords!.lon))
    .map(s => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: [s.coords!.lon, s.coords!.lat] },
      properties: {
        id: s.id,
        title: s.title,
        type: s.type ?? null,
        departement: s.departement ?? null,
        score: s.score ?? null
      }
    }));

  const fc = { type: "FeatureCollection", features };
  fs.writeFileSync(OUT, JSON.stringify(fc, null, 2), "utf-8");
  console.log(`✅ GeoJSON écrit : ${OUT} (${features.length} points)`);
}

run();
