// apps/web/lib/api.ts — lecture unique depuis /sites.geojson + filtres/pagination côté web

export type AccessFlag = "public" | "prive" | "militaire" | "inconnu";

export interface Site {
  id: string;
  name: string;
  kind: string;
  commune?: string;
  dept_code?: string;
  region?: string;
  region_code?: string;
  coords?: { lat: number; lon: number } | null;
  score?: number;
  score_reasons?: string[];
  sources?: any[];
  last_seen?: string;
  access_flag?: AccessFlag;
  risk_flags?: string[];
}

export interface Paginated<T> {
  ok: true;
  total: number;
  page: number;
  pageSize: number;
  items: T[];
}

export interface SiteQuery {
  q?: string;
  region?: string;
  dept?: string;
  kind?: string;
  minScore?: number;
  page?: number;
  pageSize?: number;
}

/** Base pour fetch côté serveur (Render) ou côté client */
function resolveSelfBase(): string {
  if (typeof window !== "undefined") return window.location.origin;
  return "http://localhost"; // Next server interne
}

type Feature = {
  geometry?: { type?: string; coordinates?: [number, number] };
  properties?: Record<string, any>;
};
type FC = { type: "FeatureCollection"; features: Feature[] };

/** Charge /sites.geojson et le transforme en tableau de Site */
async function loadSitesFromGeoJSON(): Promise<Site[]> {
  const base = resolveSelfBase();
  const url = new URL("/sites.geojson", base).toString();

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`geojson ${res.status}`);
  const data: FC = await res.json();

  const sites: Site[] = (data.features || []).map((f, i) => {
    const p = f.properties || {};
    const coords = Array.isArray(f.geometry?.coordinates)
      ? { lon: f.geometry!.coordinates![0], lat: f.geometry!.coordinates![1] }
      : null;

    return {
      id: String(p.id ?? p.uuid ?? p.code ?? p.slug ?? p.name ?? `feat-${i}`),
      name: String(p.name ?? p.title ?? "—"),
      kind: String(p.kind ?? p.type ?? "—"),
      commune: p.commune ?? p.city ?? undefined,
      dept_code: p.dept_code ?? p.dept ?? p.departement ?? undefined,
      region: p.region ?? p.region_name ?? undefined,
      region_code: p.region_code ?? undefined,
      coords: coords ? { lat: coords.lat, lon: coords.lon } : null,
      score: typeof p.score === "number" ? p.score : undefined,
      score_reasons: Array.isArray(p.score_reasons) ? p.score_reasons : undefined,
      sources: p.sources,
      last_seen: p.last_seen,
      access_flag: p.access_flag,
      risk_flags: p.risk_flags,
    };
  });

  return sites;
}

/** Filtres simples côté web */
function applyFilters(all: Site[], q?: string, region?: string, dept?: string, kind?: string, minScore?: number): Site[] {
  let list = all;

  if (q && q.trim()) {
    const s = q.trim().toLowerCase();
    list = list.filter((x) =>
      [x.name, x.kind, x.commune, x.region, x.dept_code].some((v) => (v ?? "").toLowerCase().includes(s))
    );
  }
  if (region && region !== "") list = list.filter((x) => (x.region ?? "") === region);
  if (dept && dept !== "") list = list.filter((x) => (x.dept_code ?? "") === dept);
  if (kind && kind !== "") list = list.filter((x) => (x.kind ?? "") === kind);
  if (typeof minScore === "number") list = list.filter((x) => (x.score ?? -Infinity) >= minScore);

  return list;
}

/** API locale remplaçant l’ancienne : lit le GeoJSON puis filtre/pagine */
export async function getSites(params: SiteQuery): Promise<Paginated<Site>> {
  const page = Math.max(1, Number(params.page ?? 1));
  const pageSize = Math.max(1, Math.min(100, Number(params.pageSize ?? 20)));

  const all = await loadSitesFromGeoJSON();
  const filtered = applyFilters(all, params.q, params.region, params.dept, params.kind, params.minScore);

  const total = filtered.length;
  const start = (page - 1) * pageSize;
  const items = filtered.slice(start, start + pageSize);

  return { ok: true, total, page, pageSize, items };
}
