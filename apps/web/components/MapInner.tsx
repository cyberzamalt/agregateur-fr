'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Map from './Map';
import Filters, { FiltersState } from './Filters';
import RatingStars from './RatingStars';
import SiteCard from './SiteCard';
import { loadSites, type Site } from '../lib/api';

export default function MapInner() {
  const [allSites, setAllSites] = useState<Site[]>([]);
  const [filters, setFilters] = useState<FiltersState>({
    q: '',
    kind: 'tous',
    region: 'toutes',
    minScore: 0,
  });

  useEffect(() => {
    // Chargement client du GeoJSON (pas de cache)
    loadSites().then(setAllSites).catch(() => setAllSites([]));
  }, []);

  const kinds = useMemo(() => {
    const s = new Set<string>();
    allSites.forEach(v => v.kind && s.add(v.kind));
    return Array.from(s).sort();
  }, [allSites]);

  const regions = useMemo(() => {
    const s = new Set<string>();
    allSites.forEach(v => v.region && s.add(v.region));
    return Array.from(s).sort();
  }, [allSites]);

  const filtered = useMemo(() => {
    const q = filters.q.trim().toLowerCase();
    return allSites.filter((s) => {
      if (q && !(`${s.name} ${s.kind ?? ''} ${s.region ?? ''}`).toLowerCase().includes(q)) return false;
      if (filters.kind !== 'tous' && s.kind !== filters.kind) return false;
      if (filters.region !== 'toutes' && s.region !== filters.region) return false;
      if (typeof s.score === 'number' && s.score < filters.minScore) return false;
      return true;
    });
  }, [allSites, filters]);

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      {/* Carte (avec switch Standard / Relief / Satellite) */}
      <Map />

      {/* Filtres + Résultats */}
      <section style={{ display: 'grid', gap: 12 }}>
        <Filters
          state={filters}
          kinds={kinds}
          regions={regions}
          onChange={setFilters}
        />

        <div style={{ fontSize: 13, opacity: 0.85 }}>
          Résultats : {filtered.length} / {allSites.length}
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 12,
          }}
        >
          {filtered.map((s) => (
            <SiteCard key={s.id} title={s.name}>
              <div style={{ fontSize: 13, opacity: 0.9 }}>
                {s.kind && <div>Type : {s.kind}</div>}
                {s.region && <div>Région : {s.region}</div>}
                {typeof s.score === 'number' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
                    <RatingStars value={s.score} />
                    <span>({s.score.toFixed(1)})</span>
                  </div>
                )}
                <div style={{ marginTop: 8 }}>
                  <a
                    href={`https://www.google.com/maps?q=${encodeURIComponent(s.lat)},${encodeURIComponent(s.lon)}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Voir dans Google Maps
                  </a>
                </div>
              </div>
            </SiteCard>
          ))}
        </div>
      </section>
    </div>
  );
}
