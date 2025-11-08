"use client";

import { useEffect, useMemo, useState } from "react";
import nextDynamic from "next/dynamic";
import Filters from "../../components/Filters";
import type { SiteFeature, SiteFilters } from "../../lib/api";
import { defaultFilters, applyFilters, computeBounds, fromAnyGeojson } from "../../lib/api";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const ClientMap = nextDynamic(() => import("../../components/Map"), { ssr: false });

export default function SitesPage() {
  const [allFeatures, setAllFeatures] = useState<SiteFeature[]>([]);
  const [filters, setFilters] = useState<SiteFilters>(defaultFilters);

  // Charge /sites.geojson (+ éventuellement /urbex_extra.geojson si tu l'ajoutes)
  useEffect(() => {
    (async () => {
      try {
        const res1 = await fetch("/sites.geojson", { cache: "no-store" });
        const g1 = await res1.json();
        let feats = fromAnyGeojson(g1);

        // Si tu as un second fichier, décommente :
        // const res2 = await fetch("/urbex_extra.geojson", { cache: "no-store" });
        // const g2 = await res2.json();
        // feats = feats.concat(fromAnyGeojson(g2));

        setAllFeatures(feats);
      } catch (e) {
        console.error("Chargement geojson échoué:", e);
        setAllFeatures([]);
      }
    })();
  }, []);

  const filtered = useMemo(() => applyFilters(allFeatures, filters), [allFeatures, filters]);
  const bounds = useMemo(() => computeBounds(filtered), [filtered]);

  return (
    <main style={{ padding: 16 }}>
      <h1 style={{ marginTop: 0 }}>Sites d&apos;Urbex</h1>

      <div style={{ marginBottom: 8 }}>
        <Filters
          value={filters}
          features={allFeatures}
          onChange={(next: Partial<SiteFilters>) => setFilters((prev) => ({ ...prev, ...next }))}
        />
      </div>

      {/* La carte lit les features filtrés et peut utiliser bounds pour zoomer */}
      <ClientMap features={filtered} bounds={bounds ?? undefined} />

      <div style={{ marginTop: 8, fontSize: 13, opacity: 0.8 }}>
        Résultats : {filtered.length}
      </div>
    </main>
  );
}
