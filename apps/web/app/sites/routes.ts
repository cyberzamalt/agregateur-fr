// apps/web/app/api/sites/route.ts
import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") || "").toLowerCase();
  const page = Math.max(1, Number(url.searchParams.get("page") || 1));
  const pageSize = Math.max(1, Number(url.searchParams.get("pageSize") || 20));

  // lit le GeoJSON placé dans /public
  const file = path.join(process.cwd(), "public", "sites.geojson");
  const raw = await fs.readFile(file, "utf-8");
  const geo = JSON.parse(raw) as {
    type: "FeatureCollection";
    features: Array<{
      geometry?: { type: "Point"; coordinates: [number, number] };
      properties: any;
    }>;
  };

  const items = geo.features.map((f) => {
    const p = f.properties || {};
    const c = f.geometry?.coordinates;
    return {
      id: String(p.id || crypto.randomUUID()),
      name: String(p.name || "Sans nom"),
      kind: p.kind || null,
      region: p.region || null,
      dept_code: p.dept_code || null,
      coords: c ? { lat: c[1], lon: c[0] } : null,
      score: typeof p.score === "number" ? p.score : null
    };
  });

  const filtered = q ? items.filter(i => i.name.toLowerCase().includes(q)) : items;
  const total = filtered.length;
  const start = (page - 1) * pageSize;
  const paged = filtered.slice(start, start + pageSize);

  return NextResponse.json({ ok: true, total, page, pageSize, items: paged });
}
