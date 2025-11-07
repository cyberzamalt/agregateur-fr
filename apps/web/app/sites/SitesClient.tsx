'use client';

import { useEffect, useMemo, useState } from 'react';
import Filters from '../../components/Filters';
import Map from '../../components/Map';
import {
  type FeatureCollection,
  type SiteFeature,
  type SiteFilters,
  defaultFilters,
  normalize,
} from '../../lib/api';

export default function SitesClient() {
  const [allFeatures, setAllFeatures] = useState<SiteFeature[]>([]);
  const [filters, setFilters] = useState<SiteFilters>(defaultFilters);

  // Charge sites.geojson (+ essaie d’agréger urbex_extra.geojson si présent)
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const baseRes = await fetch('/sites.geojson', { cache: 'no-store' });
        const baseData = (await baseRes.json()) as FeatureCollection | SiteFeature[];
        const baseFeatures =
          Array.isArray(baseData) ? baseData : baseData.features || [];

        // Optionnel : fichier additionnel
        let extras: SiteFeature[] = [];
        try {
          const r = await fetch('/urbex_extra.geojson', { cache: 'no-store' });
          if (r.ok) {
            const d = (await r.json()) as FeatureCollection | SiteFeature[];
            extras = Array.isArray(d) ? d : d.features || [];
          }
        } catch {
          // silencieux si absent
        }

        const merged = [...baseFeatures, ...extras].filter(
          (f) =>
            f?.type === 'Feature' &&
            f?.geometry?.type === 'Point' &&
            Array.isArray(f.geometry.coordinates) &&
            typeof f.geometry.coordinates[0] === 'number' &&
            typeof f.geometry.coordinates[1] === 'number'
        );

        // Déduplication basique par id si dispo
        const byId = new Map<string, SiteFeature>();
        for (const f of merged) {
          const id = f.properties?.id ?? JSON.stringify(f.geometry.coordinates);
          if (!byId.has(id)) byId.set(id, f);
        }

        if (alive) setAllFeatures(Array.from(byId.values()));
      } catch (e) {
        console.error('Chargement geojson', e);
        if (alive) setAllFeatures([]);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Listes (options) dépendantes des choix
  const regions = useMemo(() => {
    const s = new Set<string>();
    for (const f of allFeatures) {
      if (f.properties?.region) s.add(f.properties.region);
    }
    return Array.from(s).sort((a, b) => a.localeCompare(b));
  }, [allFeatures]);

  const depts = useMemo(() => {
    const s = new Set<string>();
    for (const f of allFeatures) {
      if (filters.region && f.properties?.region !== filters.region) continue;
      if (f.properties?.dept) s.add(f.properties.dept);
    }
    return Array.from(s).sort((a, b) => a.localeCompare(b));
  }, [allFeatures, filters.region]);

  const communes = useMemo(() => {
    const s = new Set<string>();
    for (const f of allFeatures) {
      if (filters.region && f.properties?.region !== filters.region) continue;
      if (filters.dept && f.properties?.dept !== filters.dept) continue;
      if (f.properties?.commune) s.add(f.properties.commune);
    }
    return Array.from(s).sort((a, b) => a.localeCompare(b));
  }, [allFeatures, filters.region, filters.dept]);

  // Applique les filtres
  const feats = useMemo(() => {
    const q = normalize(filters.q);
    return allFeatures.filter((f) => {
      const p = f.properties || {};
      if (filters.kind && p.kind !== filters.kind) return false;
      if (filters.region && p.region !== filters.region) return false;
      if (filters.dept && p.dept !== filters.dept) return false;
      if (filters.commune && p.commune !== filters.commune) return false;
      if (typeof filters.minScore === 'number') {
        const s = typeof p.score === 'number' ? p.score : -Infinity;
        if (s < filters.minScore) return false;
      }
      if (q) {
        const hay =
          `${p.name ?? ''} ${p.address ?? ''} ${p.kind ?? ''}`.trim();
        if (!normalize(hay).includes(q)) return false;
      }
      return true;
    });
  }, [allFeatures, filters]);

  // Ajustements de cohérence filtres (ex.: si région change → reset dept/commune)
  const setFiltersSafe = (next: Partial<SiteFilters>) => {
    setFilters((prev) => {
      const merged: SiteFilters = { ...prev, ...next };
      if (next.region && next.region !== prev.region) {
        merged.dept = '';
        merged.commune = '';
      }
      if (next.dept && next.dept !== prev.dept) {
        merged.commune = '';
      }
      return merged;
    });
  };

  return (
    <div>
      <Filters
        filters={filters}
        onChange={setFiltersSafe}
        regions={regions}
        depts={depts}
        communes={communes}
        kinds={Array.from(
          new Set(allFeatures.map((f) => f.properties?.kind).filter(Boolean) as string[])
        ).sort((a, b) => a.localeCompare(b))}
      />

      <div style={{ marginTop: 12 }}>
        <Map features={feats} />
        <div style={{ marginTop: 6, fontSize: 13, opacity: 0.8 }}>
          Résultats : {feats.length}
        </div>
      </div>
    </div>
  );
}
