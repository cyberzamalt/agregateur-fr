import { NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";

type Q = {
  q?: string;
  region?: string;
  dept?: string;
  kind?: string;
  minScore?: string;
  page?: string;
  pageSize?: string;
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q: Q = Object.fromEntries(searchParams.entries()) as any;

  const file = path.join(process.cwd(), "public", "sites.geojson");
  const text = await fs.readFile(file, "utf8");
  const gj = JSON.parse(text);

  let items = (gj?.features ?? []).map((f: any) => ({
    id: f.properties?.id ?? "",
    name: f.properties?.name ?? "",
    kind: f.properties?.kind ?? "",
    region: f.properties?.region ?? "",
    dept_code: f.properties?.dept_code ?? "",
    score: f.properties?.score ?? null,
    coords: f.geometry?.coordinates
      ? { lon: f.geometry.coordinates[0], lat: f.geometry.coordinates[1] }
      : null,
  }));

  // Filtres simples
  const qStr = (q.q ?? "").toLowerCase();
  if (qStr) items = items.filter((s: any) => s.name.toLowerCase().includes(qStr));
  if (q.region) items = items.filter((s: any) => s.region === q.region);
  if (q.dept) items = items.filter((s: any) => s.dept_code === q.dept);
  if (q.kind) items = items.filter((s: any) => (s.kind ?? "") === q.kind);
  if (q.minScore) items = items.filter((s: any) => (s.score ?? 0) >= Number(q.minScore));

  const page = Math.max(1, Number(q.page ?? 1));
  const pageSize = Math.min(100, Math.max(1, Number(q.pageSize ?? 20)));
  const start = (page - 1) * pageSize;
  const slice = items.slice(start, start + pageSize);

  return NextResponse.json({
    ok: true,
    total: items.length,
    page,
    pageSize,
    items: slice,
  });
}
