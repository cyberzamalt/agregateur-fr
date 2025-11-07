// apps/web/lib/api.ts
// Types, helpers de filtrage + calcul de bounds pour Leaflet

export type SiteProps = {
  id: string;
  name: string;
  kind?: string;          // ex: "friche industrielle", "bunker", etc.
  region?: string;        // ex: "Île-de-France"
  department?: string;    // ex: "Paris"
  commune?: string;       // ex: "Paris 13e"
  score?: number;         // 0..5
  address?: string;       // texte libre
};

export type SiteFeature = {
  type: 'Feature';
  geometry: { type: 'Point'; coordinates: [number, number] }; // [lon, lat]
  properties: SiteProps;
};

export type FeatureCollection = { type: 'FeatureCollection'; features: SiteFeature[] };

// Alias pour compat avec certains imports existants éventuels
export type Feature = SiteFeature;

export type SiteFilters = {
  query: string;
  kind: string;        // "" = tous
  region: string;      // "" = toutes
  department: string;  // "" = tous
  commune: string;     // "" = toutes
  minScore: number;    // 0..5
};

export const defaultFilters: SiteFilters = {
  query: '',
  kind: '',
  region: '',
  department: '',
  commune: '',
  minScore: 0,
};

export function fromAnyGeojson(input: any): SiteFeature[] {
  if (!input) return [];
  if (Array.isArray(input)) return (input as any[]).filter(isSiteFeature) as SiteFeature[];
  if (typeof input === 'object' && input.type === 'FeatureCollection' && Array.isArray(input.features)) {
    return (input.features as any[]).filter(isSiteFeature) as SiteFeature[];
  }
  return [];
}

function isSiteFeature(f: any): f is SiteFeature {
  return (
    f &&
    f.type === 'Feature' &&
    f.geometry &&
    f.geometry.type === 'Point' &&
    Array.isArray(f.geometry.coordinates) &&
    typeof f.geometry.coordinates[0] === 'number' &&
    typeof f.geometry.coordinates[1] === 'number' &&
    f.properties &&
    typeof f.properties.name === 'string'
  );
}

export function uniqueSorted(values: (string | undefined)[]): string[] {
  const set = new Set(values.filter(Boolean) as string[]);
  return Array.from(set).sort((a, b) => a.localeCompare(b, 'fr'));
}

export function optionsFromFeatures(
  features: SiteFeature[],
  scope: Partial<Pick<SiteFilters, 'region' | 'department'>>
) {
  const byRegion = features;
  const byDept = scope.region
    ? features.filter(f => (f.properties.region || '') === scope.region)
    : features;

  const byCommune = scope.region || scope.department
    ? features.filter(f =>
        (scope.region ? (f.properties.region || '') === scope.region : true) &&
        (scope.department ? (f.properties.department || '') === scope.department : true)
      )
    : features;

  const kinds = uniqueSorted(features.map(f => f.properties.kind));
  const regions = uniqueSorted(byRegion.map(f => f.properties.region));
  const departments = uniqueSorted(byDept.map(f => f.properties.department));
  const communes = uniqueSorted(byCommune.map(f => f.properties.commune));

  return { kinds, regions, departments, communes };
}

export function applyFilters(all: SiteFeature[], filters: SiteFilters): SiteFeature[] {
  const q = filters.query.trim().toLowerCase();

  return all.filter(f => {
    const p = f.properties || ({} as SiteProps);
    const [lon, lat] = f.geometry.coordinates;

    if (Number.isNaN(lon) || Number.isNaN(lat)) return false;

    if (filters.kind && (p.kind || '') !== filters.kind) return false;
    if (filters.region && (p.region || '') !== filters.region) return false;
    if (filters.department && (p.department || '') !== filters.department) return false;
    if (filters.commune && (p.commune || '') !== filters.commune) return false;

    const score = typeof p.score === 'number' ? p.score : 0;
    if (score < filters.minScore) return false;

    if (q) {
      const hay = [
        p.name,
        p.kind,
        p.region,
        p.department,
        p.commune,
        p.address,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      if (!hay.includes(q)) return false;
    }

    return true;
  });
}

export type LatLngTuple = [number, number];
export type BoundsTuple = [LatLngTuple, LatLngTuple]; // [[southWestLat, southWestLng], [northEastLat, northEastLng]]

export function computeBounds(features: SiteFeature[]): BoundsTuple | undefined {
  if (!features.length) return undefined;

  let minLat = 90, maxLat = -90, minLon = 180, maxLon = -180;
  for (const f of features) {
    const [lon, lat] = f.geometry.coordinates;
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
    if (lon < minLon) minLon = lon;
    if (lon > maxLon) maxLon = lon;
  }
  return [[minLat, minLon], [maxLat, maxLon]];
}
