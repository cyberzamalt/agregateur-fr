// tools/build-geojson.ts
import fs from "fs/promises";
import path from "path";

type SeedSite = {
  id: string;
  name: string;
  coords?: { lat: number; lon: number } | null;
  kind?: string;
  dept_code?: string;
  region?: string;
  score?: number;
};

const SEED_FILE = path.resolve("data/seed/sites.json");
const OUT = path.resolve("apps/web/public/sites.geojson");

async function main() {
  const raw = await fs.readFile(SEED_FILE, "utf8");
  const sites: SeedSite[] = JSON.parse(raw);

  const features = sites
    .filter((s) => s.coords && typeof s.coords.lat === "number" && typeof s.coords.lon === "number")
    .map((s) => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: [s.coords!.lon, s.coords!.lat] },
      properties: {
        id: s.id,
        name: s.name,
        kind: s.kind ?? null,
        dept: s.dept_code ?? null,
        region: s.region ?? null,
        score: s.score ?? null,
      },
    }));

  const fc = { type: "FeatureCollection", features };
  await fs.mkdir(path.dirname(OUT), { recursive: true });
  await fs.writeFile(OUT, JSON.stringify(fc), "utf8");
  console.log(`✅ GeoJSON écrit → ${OUT} (${features.length} points)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
