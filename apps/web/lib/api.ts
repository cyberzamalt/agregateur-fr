// apps/web/lib/api.ts

// ---- Types de données ----
export type SiteFeature = {
  id: string;
  name: string;
  address?: string;
  type?: string;
  region?: string;
  department?: string; // (département)
  commune?: string;
  score?: number;
  lat: number;
  lon: number;
};

export type SiteFilters = {
  q: string;
  type: 'all' | string;
  region: 'all' | string;
  department: 'all' | string;
  commune: 'all' | string;
  minScore: number;
};

// Tuple de bounds compatible Leaflet
export type BoundsTuple = [[number, number], [number, number]];

// Normalisation texte (accents, casse)
export function normalize(txt: string) {
  return (txt || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
}

// Options distinctes à partir des features
export function optionsFromFeatures(features: SiteFeature[]) {
  const uniq = (arr: (string | undefined)[]) =>
    Array.from(new Set(arr.filter(Boolean) as string[])).sort((a, b) => a.localeCompare(b, 'fr'));

  return {
    types:      uniq(features.map(f => f.type)),
    regions:    uniq(features.map(f => f.region)),
    departments:uniq(features.map(f => f.department)),
    communes:   uniq(features.map(f => f.commune)),
  };
}
