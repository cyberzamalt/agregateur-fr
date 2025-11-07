// Types minimaux et utilitaires partagés

export type SiteProps = {
  id?: string;
  name?: string;
  kind?: string;      // type (friche, industriel, château, etc.)
  region?: string;
  dept?: string;      // code/nom de département
  commune?: string;
  address?: string;
  score?: number;     // 0..5
};

export type SiteFeature = {
  type: 'Feature';
  geometry: { type: 'Point'; coordinates: [number, number] }; // [lon, lat]
  properties: SiteProps;
};

export type FeatureCollection = {
  type: 'FeatureCollection';
  features: SiteFeature[];
};

export type SiteFilters = {
  q: string;
  kind: string;
  region: string;
  dept: string;
  commune: string;
  minScore: number;
};

export const defaultFilters: SiteFilters = {
  q: '',
  kind: '',
  region: '',
  dept: '',
  commune: '',
  minScore: 0,
};

export const normalize = (s: string) =>
  (s ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
