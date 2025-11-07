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
  q?: string;
  region?: string | 'tous';
  departement?: string | 'tous';
  commune?: string | 'tous';
  scoreMin?: number;
};

export const defaultFilters: SiteFilters = {
  q: '',
  region: 'tous',
  departement: 'tous',
  commune: 'tous',
  scoreMin: 0,
};

function pickFirst(obj: any, keys: string[], fallback = ''): string {
  for (const k of keys) {
    const v = obj?.[k];
    if (typeof v === 'string' && v.trim()) return v.trim();
  }
  return fallback;
}

function uniq(list: (string | undefined)[]) {
  return Array.from(new Set(list.filter(Boolean) as string[])).sort((a, b) =>
    a.localeCompare(b, 'fr', { sensitivity: 'base' })
  );
}

export async function loadSites(): Promise<SiteFeature[]> {
  const res = await fetch('/sites.geojson', { cache: 'no-store' });
  const data = await res.json();

  const feats: SiteFeature[] = Array.isArray(data)
    ? (data as SiteFeature[])
    : data?.type === 'FeatureCollection'
    ? (data.features as SiteFeature[])
    : [];

  return feats
    .filter(
      (f) =>
        f?.geometry?.type === 'Point' &&
        Array.isArray(f.geometry.coordinates) &&
        typeof f.geometry.coordinates[0] === 'number' &&
        typeof f.geometry.coordinates[1] === 'number'
    )
    .map((f) => {
      const p: any = f.properties ?? {};

      // Normalisation large pour couvrir plusieurs jeux de clés
      const region = pickFirst(p, ['region', 'Region', 'state', 'admin1', 'region_name']);
      const departement = pickFirst(p, [
        'departement',
        'department',
        'dep',
        'dept',
        'department_name',
        'admin2',
        'codeDepartement',
      ]);
      const commune = pickFirst(p, ['commune', 'city', 'town', 'village', 'municipality', 'locality']);
      const address = pickFirst(p, ['address', 'adresse', 'addr', 'formatted_address']);

      return {
        ...f,
        properties: {
          id: p.id ?? cryptoRandomId(),
          name: p.name ?? 'Sans nom',
          kind: p.kind,
          region,
          departement,
          commune,
          address,
          score: typeof p.score === 'number' ? p.score : undefined,
        },
      };
    });
}

function cryptoRandomId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return (crypto as any).randomUUID();
  return 'id_' + Math.random().toString(36).slice(2);
}

export function applyFilters(features: SiteFeature[], filters: SiteFilters): SiteFeature[] {
  const q = (filters.q ?? '').trim().toLowerCase();
  const r = filters.region && filters.region !== 'tous' ? filters.region : undefined;
  const d = filters.departement && filters.departement !== 'tous' ? filters.departement : undefined;
  const c = filters.commune && filters.commune !== 'tous' ? filters.commune : undefined;
  const s = typeof filters.scoreMin === 'number' ? filters.scoreMin! : 0;

  return features.filter((f) => {
    const p = f.properties || {};
    if (r && p.region !== r) return false;
    if (d && p.departement !== d) return false;
    if (c && p.commune !== c) return false;
    if (p.score != null && p.score < s) return false;
    if (q) {
      const hay = `${p.name ?? ''} ${p.kind ?? ''} ${p.address ?? ''} ${p.region ?? ''} ${p.departement ?? ''} ${
        p.commune ?? ''
      }`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

export function buildOptions(features: SiteFeature[], filters: SiteFilters) {
  const regions = uniq(features.map((f) => f.properties?.region));

  const deps = uniq(
    features
      .filter((f) => !filters.region || filters.region === 'tous' || f.properties?.region === filters.region)
      .map((f) => f.properties?.departement)
  );

  const communes = uniq(
    features
      .filter((f) => {
        if (filters.region && filters.region !== 'tous' && f.properties?.region !== filters.region) return false;
        if (filters.departement && filters.departement !== 'tous' && f.properties?.departement !== filters.departement)
          return false;
        return true;
      })
      .map((f) => f.properties?.commune)
  );

  return { regions, deps, communes };
}
