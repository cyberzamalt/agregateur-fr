// apps/web/app/api/sites/route.ts
// Next.js App Route – filtre les sites depuis /public/sites.geojson
import { NextResponse } from "next/server";
import path from "node:path";
import fs from "node:fs/promises";

export const runtime = "nodejs";       // ⬅️ important si on utilise fs en prod
export const dynamic = "force-dynamic";
export const revalidate = 0;

type SiteProps = {
  id: string;
  name: string;
  kind?: string;
  region?: string;
  department?: string;
  commune?: string;
  score?: number;
  address?: string; // si le snapshot l’a
  [k: string]: any;
};
type Feature = {
  type: "Feature";
  geometry: { type: "Point"; coordinates: [number, number] }; // [lon, lat]
  properties: SiteProps;
};
type FC = { type: "FeatureCollection"; features: Feature[] };

function toArray(data: any): Feature[] {
  if (!data) return [];
  if (Array.isArray(data)) return data as Feature[];
  if (data.type === "FeatureCollection" && Array.isArray(data.features)) {
    return data.features as Feature[];
  }
  return [];
}

function inBBox([lon, lat]: [number, number], bbox: number[]) {
  // bbox attendu: minLon,minLat,maxLon,maxLat
  const [minLon, minLat, maxLon, maxLat] = bbox;
  return lon >= minLon && lon <= maxLon && lat >= minLat && lat <= maxLat;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const q = (url.searchParams.get("q") || "").trim().toLowerCase();
    const kind = (url.searchParams.get("kind") || "").trim().toLowerCase();
    const region = (url.searchParams.get("region") || "").trim().toLowerCase();
    const department = (url.searchParams.get("department") || "").trim().toLowerCase();
    const commune = (url.searchParams.get("commune") || "").trim().toLowerCase();
    const scoreMin = Number(url.searchParams.get("scoreMin") || "0");
    const bboxStr = url.searchParams.get("bbox"); // "minLon,minLat,maxLon,maxLat"
    const wantFC = (url.searchParams.get("fc") || "0") === "1"; // renvoyer un FeatureCollection complet ?

    // Chemin correct en prod chez Render (process.cwd() == .../apps/web)
    const filePath = path.join(process.cwd(), "public", "sites.geojson");
    const raw = await fs.readFile(filePath, "utf-8");
    const json = JSON.parse(raw);
    const all = toArray(json);

    let out = all.filter((f) => {
      if (!f?.geometry?.coordinates) return false;
      const [lon, lat] = f.geometry.coordinates;
      const p = (f.properties || {}) as SiteProps;

      if (q) {
        const hay = `${p.name || ""} ${p.kind || ""} ${p.address || ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (kind && (p.kind || "").toLowerCase() !== kind) return false;
      if (region && (p.region || "").toLowerCase() !== region) return false;
      if (department && (p.department || "").toLowerCase() !== department) return false;
      if (commune && (p.commune || "").toLowerCase() !== commune) return false;
      if (!Number.isNaN(scoreMin) && typeof p.score === "number" && p.score < scoreMin) return false;

      if (bboxStr) {
        const parts = bboxStr.split(",").map((n) => Number(n));
        if (parts.length === 4 && parts.every((n) => !Number.isNaN(n))) {
          if (!inBBox([lon, lat], parts)) return false;
        }
      }
      return true;
    });

    // meta simple si demandé
    if (url.searchParams.get("meta") === "1") {
      const regions = new Set<string>(), deps = new Set<string>(), comms = new Set<string>(), kinds = new Set<string>();
      for (const f of all) {
        const p = f.properties || ({} as SiteProps);
        if (p.region) regions.add(p.region);
        if (p.department) deps.add(p.department);
        if (p.commune) comms.add(p.commune);
        if (p.kind) kinds.add(p.kind);
      }
      return NextResponse.json({
        count: all.length,
        regions: Array.from(regions).sort(),
        departments: Array.from(deps).sort(),
        communes: Array.from(comms).sort(),
        kinds: Array.from(kinds).sort(),
        updatedAt: new Date().toISOString(),
      });
    }

    if (wantFC && json?.type === "FeatureCollection") {
      const fc: FC = { type: "FeatureCollection", features: out };
      return NextResponse.json(fc);
    }
    return NextResponse.json(out);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "read_error" }, { status: 500 });
  }
}
