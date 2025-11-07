// apps/web/lib/api.ts
export type SiteFeature = {
  type: 'Feature';
  geometry: { type: 'Point'; coordinates: [number, number] }; // [lon, lat]
  properties: {
    id: string;
    name: string;
    kind?: string;
    region?: string;
    departement?: string;
    commune?: string;
    address?: string;
    score?: number;
  };
};

export type FeatureCollection = { type: 'FeatureCollection'; features: SiteFeature[] };

export type SiteFilters = {
  q: string;                 // recherche nom/adresse (contient)
  kind: string;              // type exact (ou '')
  region: string;            // région exacte (ou '')
  departement: string;       // département exact (ou '')
  commune: string;           // commune exacte (ou '')
  minScore: number;          // score minimal
};

export const defaultFilters: SiteFilters = {
  q: '',
  kind: '',
  region: '',
  departement: '',
  commune: '',
  minScore: 0,
};

export function normalize(str: unknown) {
  return String(str ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
}

export function matchFilters(f: SiteFeature, filters: SiteFilters): boolean {
  const p = f.properties || {};
  const q = normalize(filters.q);
  if (q) {
    const hay = normalize([p.name, p.address, p.kind, p.region, p.departement, p.commune].join(' '));
    if (!hay.includes(q)) return false;
  }
  if (filters.kind && normalize(p.kind) !== normalize(filters.kind)) return false;
  if (filters.region && normalize(p.region) !== normalize(filters.region)) return false;
  if (filters.departement && normalize(p.departement) !== normalize(filters.departement)) return false;
  if (filters.commune && normalize(p.commune) !== normalize(filters.commune)) return false;
  if (typeof filters.minScore === 'number') {
    const s = Number(p.score ?? 0);
    if (Number.isFinite(filters.minScore) && s < filters.minScore) return false;
  }
  return true;
}
