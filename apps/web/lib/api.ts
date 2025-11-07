// apps/web/lib/api.ts
export type SiteFeature = {
  type: 'Feature';
  geometry: { type: 'Point'; coordinates: [number, number] }; // [lon, lat]
  properties: {
    id: string;
    name: string;
    kind?: string;
    region?: string;
    departement?: string; // FR
    commune?: string;     // FR
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
  scoreMin?: number; // default 0
};

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

  // Filtre robustesse + normalisation des propriétés FR
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
      const normalised = {
        ...p,
        // accepte "department"/"city" si jamais présents
        departement: p.departement ?? p.department ?? '',
        commune: p.commune ?? p.city ?? '',
        address: p.address ?? '',
      };
      return { ...f, properties: normalised };
    });
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
      const hay =
        `${p.name ?? ''} ${p.kind ?? ''} ${p.address ?? ''} ${p.region ?? ''} ${p.departement ?? ''} ${p.commune ?? ''}`.toLowerCase();
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
