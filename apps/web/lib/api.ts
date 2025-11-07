export type SiteProperties = {
  id: string;
  name: string;
  kind?: string;
  region?: string;
  score?: number;
};

export type SiteFeature = {
  type: 'Feature';
  geometry: { type: 'Point'; coordinates: [number, number] }; // [lon, lat]
  properties: SiteProperties;
};

export type FeatureCollection = {
  type: 'FeatureCollection';
  features: SiteFeature[];
};

export type Site = {
  id: string;
  name: string;
  kind?: string;
  region?: string;
  score?: number;
  lat: number;
  lon: number;
};

/**
 * Charge et convertit /sites.geojson en tableau de Site[].
 * S'exécute côté client (fetch relatif).
 */
export async function loadSites(): Promise<Site[]> {
  try {
    const res = await fetch('/sites.geojson', { cache: 'no-store' });
    const data = await res.json();

    let feats: SiteFeature[] = [];

    if (Array.isArray(data)) {
      // Certains dumps arrivent en array direct
      feats = data as SiteFeature[];
    } else if (data && data.type === 'FeatureCollection' && Array.isArray((data as FeatureCollection).features)) {
      feats = (data as FeatureCollection).features;
    }

    return feats
      .filter(
        (f) =>
          f?.geometry?.type === 'Point' &&
          Array.isArray(f.geometry.coordinates) &&
          typeof f.geometry.coordinates[0] === 'number' &&
          typeof f.geometry.coordinates[1] === 'number'
      )
      .map((f) => {
        const [lon, lat] = f.geometry.coordinates; // GeoJSON = [lon, lat]
        return {
          id: String(f.properties?.id ?? `${lat},${lon}`),
          name: String(f.properties?.name ?? 'Sans nom'),
          kind: f.properties?.kind,
          region: f.properties?.region,
          score: typeof f.properties?.score === 'number' ? f.properties.score : undefined,
          lat,
          lon,
        } as Site;
      });
  } catch (e) {
    console.error('loadSites error', e);
    return [];
  }
}
