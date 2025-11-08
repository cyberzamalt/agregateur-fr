// apps/web/lib/api.ts

/** ---------- Types ---------- */

export type SiteProperties = {
  name: string;
  address?: string;

  // Catégorie libre (ex: "friche_industrielle", "chateau", ...)
  type?: string;

  // Métadonnées admin (tolérance sur l’orthographe)
  region?: string;
  department?: string;       // clé standard
  departement?: string;      // tolérance (au cas où dans les GeoJSON)
  commune?: string;

  score?: number;            // 0..5
};

export type Feature = {
  type: 'Feature';
  geometry: { type: 'Point'; coordinates: [number, number] }; // [lon, lat]
  properties: SiteProperties;
};

export type SiteFeature = Feature;

/** Filtres utilisés partout dans l’app */
export type SiteFilters = {
  q: string;                       // 🔎 texte de recherche (nom/adresse/ville…)
  type: 'all' | string;            // 'all' ou la valeur exacte de properties.type
  region: 'all' | string;
  department: 'all' | string;
  commune: 'all' | string;
  minScore: number;                // score minimal
};

export const defaultFilters: SiteFilters = {
  q: '',
  type: 'all',
  region: 'all',
  department: 'all',
  commune: 'all',
  minScore: 0,
};

/** ---------- Utils ---------- */

/** Normalisation accent/majuscules/espaces pour les recherches */
export function normalize(s: string): string {
  return (s ?? '')
    .toString()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();
}

/** Récupère region/département/commune avec tolérance sur les clés */
export function getAdmin(p: SiteProperties) {
  const region = (p.region ?? '').toString();
  const department = (p.department ?? (p as any).departement ?? '').toString();
  const commune = (p.commune ?? '').toString();
  return { region, department, commune };
}

/** Teste si une feature matche les filtres */
export function matchFeature(f: SiteFeature, filters: SiteFilters): boolean {
  const p = f.properties ?? {};
  const { region, department, commune } = getAdmin(p);

  // Texte (nom, adresse, commune, département, région)
  if (filters.q) {
    const haystack = normalize(
      [p.name, p.address, commune, department, region].filter(Boolean).join(' ')
    );
    if (!haystack.includes(normalize(filters.q))) return false;
  }

  // Type
  if (filters.type !== 'all' && p.type !== filters.type) return false;

  // Région / Département / Commune
  if (filters.region !== 'all' && region !== filters.region) return false;
  if (filters.department !== 'all' && department !== filters.department) return false;
  if (filters.commune !== 'all' && commune !== filters.commune) return false;

  // Score minimal
  if (typeof filters.minScore === 'number') {
    const s = typeof p.score === 'number' ? p.score : -Infinity;
    if (s < filters.minScore) return false;
  }

  return true;
}

/** Filtre un tableau de features */
export function filterFeatures(all: SiteFeature[], filters: SiteFilters): SiteFeature[] {
  return all.filter((f) => matchFeature(f, filters));
}
