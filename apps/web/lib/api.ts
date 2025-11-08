// utils & types pour les sites urbex

export type SiteProps = {
  id: string;
  name: string;
  kind?: string;          // ex: "factory", "hospital", "military", "mansion", "rail", "other"
  region?: string;        // nom de région
  department?: string;    // code ou nom de département
  commune?: string;       // ville/commune
  address?: string;       // adresse libre
  score?: number;         // 0..5
  lat: number;            // latitude
  lon: number;            // longitude
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
  const asArray = Array.isArray(input) ? input :
    (input && input.type === "FeatureCollection" && Array.isArray(input.features)) ? input.features : [];

  // On filtre uniquement les points valides
  const feats: SiteFeature[] = asArray.filter((f: any) =>
    f && f.type === "Feature" &&
    f.geometry && f.geometry.type === "Point" &&
    Array.isArray(f.geometry.coordinates) &&
    typeof f.geometry.coordinates[0] === "number" &&
    typeof f.geometry.coordinates[1] === "number" &&
    f.properties && typeof f.properties.name === "string"
  ).map((f: any) => {
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
  const type = filters.type;

  return features
    .filter((f) => {
      const p = f.properties;

      // texte plein-texte
      if (q) {
        const hay = [
          p.name,
          p.address,
          p.commune,
          p.department,
          p.region,
          p.kind,
        ].filter(Boolean).join(" ").toLowerCase();
        if (!hay.includes(q)) return false;
      }

      // type
      if (type !== "all") {
        if (!p.kind || p.kind !== type) return false;
      }

      // zone
      if (filters.region !== "all" && p.region !== filters.region) return false;
      if (filters.department !== "all" && p.department !== filters.department) return false;
      if (filters.commune !== "all" && p.commune !== filters.commune) return false;

      // score mini
      if (typeof filters.minScore === "number" && typeof p.score === "number") {
        if (p.score < filters.minScore) return false;
      }

      return true;
    })
    // tri : score desc puis nom
    .sort((a, b) => {
      const sa = a.properties.score ?? -1;
      const sb = b.properties.score ?? -1;
      if (sb !== sa) return sb - sa;
      return a.properties.name.localeCompare(b.properties.name);
    });
}

export function computeBounds(features: SiteFeature[]): [[number, number], [number, number]] | null {
  if (!features.length) return null;
  let minLat = +Infinity, maxLat = -Infinity, minLon = +Infinity, maxLon = -Infinity;
  for (const f of features) {
    const [lon, lat] = f.geometry.coordinates;
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
    if (lon < minLon) minLon = lon;
    if (lon > maxLon) maxLon = lon;
  }
  return [[minLat, minLon], [maxLat, maxLon]];
}

export function optionsFromFeatures(
  features: SiteFeature[],
  scope: Partial<SiteFilters> = {}
): {
  regions: string[];
  departments: string[];
  communes: string[];
} {
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
