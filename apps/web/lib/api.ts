// Types & utilitaires pour l'agrégateur Urbex

export type SiteProps = {
  id: string;
  name: string;
  kind?: string;          // "factory" | "hospital" | "military" | "mansion" | "rail" | "other"
  region?: string;
  department?: string;    // code/nom
  commune?: string;       // ville
  address?: string;
  score?: number;         // 0..5
  lat: number;
  lon: number;
};

export type SiteFeature = {
  type: "Feature";
  geometry: { type: "Point"; coordinates: [number, number] }; // [lon, lat]
  properties: SiteProps;
};

export type FeatureCollection = {
  type: "FeatureCollection";
  features: SiteFeature[];
};

export type SiteFilters = {
  q: string;
  type: "all" | "factory" | "hospital" | "military" | "mansion" | "rail" | "other";
  region: "all" | string;
  department: "all" | string;
  commune: "all" | string;
  minScore: number; // 0..5
};

export const defaultFilters: SiteFilters = {
  q: "",
  type: "all",
  region: "all",
  department: "all",
  commune: "all",
  minScore: 0,
};

export function fromAnyGeojson(input: any): SiteFeature[] {
  const arr = Array.isArray(input)
    ? input
    : input?.type === "FeatureCollection" && Array.isArray(input.features)
    ? input.features
    : [];

  const feats: SiteFeature[] = arr
    .filter(
      (f: any) =>
        f?.type === "Feature" &&
        f.geometry?.type === "Point" &&
        Array.isArray(f.geometry.coordinates) &&
        typeof f.geometry.coordinates[0] === "number" &&
        typeof f.geometry.coordinates[1] === "number" &&
        f.properties &&
        typeof f.properties.name === "string"
    )
    .map((f: any) => {
      const [lon, lat] = f.geometry.coordinates as [number, number];
      return {
        type: "Feature",
        geometry: { type: "Point", coordinates: [lon, lat] },
        properties: {
          id: String(f.properties.id ?? `${lon},${lat}`),
          name: f.properties.name,
          kind: f.properties.kind ?? undefined,
          region: f.properties.region ?? undefined,
          department: f.properties.department ?? f.properties.departement ?? undefined,
          commune: f.properties.commune ?? f.properties.city ?? undefined,
          address: f.properties.address ?? undefined,
          score: typeof f.properties.score === "number" ? f.properties.score : undefined,
          lat,
          lon,
        },
      };
    });

  return feats;
}

export function applyFilters(features: SiteFeature[], filters: SiteFilters): SiteFeature[] {
  const q = filters.q.trim().toLowerCase();

  return features
    .filter((f) => {
      const p = f.properties;

      if (q) {
        const hay = [p.name, p.address, p.commune, p.department, p.region, p.kind]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }

      if (filters.type !== "all") {
        if (!p.kind || p.kind !== filters.type) return false;
      }

      if (filters.region !== "all" && p.region !== filters.region) return false;
      if (filters.department !== "all" && p.department !== filters.department) return false;
      if (filters.commune !== "all" && p.commune !== filters.commune) return false;

      if (typeof filters.minScore === "number" && typeof p.score === "number") {
        if (p.score < filters.minScore) return false;
      }

      return true;
    })
    .sort((a, b) => {
      const sa = a.properties.score ?? -1;
      const sb = b.properties.score ?? -1;
      if (sb !== sa) return sb - sa;
      return a.properties.name.localeCompare(b.properties.name);
    });
}

export type BoundsTuple = [[number, number], [number, number]]; // [[minLat,minLon],[maxLat,maxLon]]

export function computeBounds(features: SiteFeature[]): BoundsTuple | null {
  if (!features.length) return null;
  let minLat = +Infinity,
    maxLat = -Infinity,
    minLon = +Infinity,
    maxLon = -Infinity;

  for (const f of features) {
    const [lon, lat] = f.geometry.coordinates;
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
    if (lon < minLon) minLon = lon;
    if (lon > maxLon) maxLon = lon;
  }
  return [
    [minLat, minLon],
    [maxLat, maxLon],
  ];
}

export function optionsFromFeatures(
  features: SiteFeature[],
  scope: Partial<SiteFilters> = {}
): { regions: string[]; departments: string[]; communes: string[] } {
  const filtered = features.filter((f) => {
    const p = f.properties;
    if (scope.region && scope.region !== "all" && p.region !== scope.region) return false;
    if (scope.department && scope.department !== "all" && p.department !== scope.department) return false;
    return true;
  });

  const uniq = <T extends string>(arr: (T | undefined)[]) =>
    Array.from(new Set(arr.filter(Boolean) as T[])).sort((a, b) => a.localeCompare(b));

  return {
    regions: uniq(filtered.map((f) => f.properties.region)),
    departments: uniq(filtered.map((f) => f.properties.department)),
    communes: uniq(filtered.map((f) => f.properties.commune)),
  };
}
