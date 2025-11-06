import Map from "../../components/Map";
import path from "path";
import { promises as fs } from "fs";

export const dynamic = "force-dynamic";

async function readTotalFromGeoJSON(): Promise<number> {
  try {
    const file = path.join(process.cwd(), "public", "sites.geojson");
    const text = await fs.readFile(file, "utf8");
    const gj = JSON.parse(text);
    return Array.isArray(gj?.features) ? gj.features.length : 0;
  } catch {
    return 0;
  }
}

export default async function SitesPage() {
  const total = await readTotalFromGeoJSON();

  return (
    <main className="mx-auto max-w-5xl p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Sites d&apos;Urbex</h1>
      <Map />
      <div className="text-sm opacity-80">Résultats : {total}</div>
    </main>
  );
}
