// Petit client pour l'API /api/sites et types partagés
export type SiteProps = {
  id: string;
  name: string;
  kind?: string;
  region?: string;
  department?: string;
  commune?: string;
  score?: number;
  address?: string;
  [k: string]: any;
};
export type Feature = {
  type: "Feature";
  geometry: { type: "Point"; coordinates: [number, number] }; // [lon,lat]
  properties: SiteProps;
};

export type SiteFilters = {
  q?: string;
  kind?: string;
  region?: string;
  department?: string;
  commune?: string;
  scoreMin?: number;
  bbox?: [number, number, number, number]; // minLon,minLat,maxLon,maxLat
};

export function buildQuery(f?: SiteFilters) {
  if (!f) return "";
  const u = new URLSearchParams();
  if (f.q) u.set("q", f.q);
  if (f.kind) u.set("kind", f.kind);
  if (f.region) u.set("region", f.region);
  if (f.department) u.set("department", f.department);
  if (f.commune) u.set("commune", f.commune);
  if (typeof f.scoreMin === "number") u.set("scoreMin", String(f.scoreMin));
  if (f.bbox) u.set("bbox", f.bbox.join(","));
  return u.toString();
}

export async function fetchSites(filters?: SiteFilters): Promise<Feature[]> {
  const qs = buildQuery(filters);
  const url = qs ? `/api/sites?${qs}` : "/api/sites";
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function fetchMeta() {
  const res = await fetch("/api/sites?meta=1", { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<{
    count: number;
    regions: string[];
    departments: string[];
    communes: string[];
    kinds: string[];
    updatedAt: string;
  }>;
}
