// apps/web/app/sites/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import nextDynamic from "next/dynamic";
import Filters from "../../components/Filters";
import type { SiteFilters, SiteFeature } from "../../lib/api";

// Page 100% client (Leaflet + filtres)
export const dynamic = "force-dynamic";
export const revalidate = 0; // nombre ou false

const ClientMap = nextDynamic(() => import("../../components/Map"), { ssr: false });

export default function SitesPage() {
  const [filters, setFilters] = useState<SiteFilters>({
    q: "",
    type: "all",
    region: "all",
    department: "all",
    city: "all",
    minScore: 0,
  });

  const [feats, setFeats] = useState<SiteFeature[]>([]);

  // Charge les features depuis le public (évite tout alias/config)
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/sites.geojson", { cache: "no-store" });
        const data = await res.json();
        if (data && data.type === "FeatureCollection" && Array.isArray(data.features)) {
          setFeats(data.features as SiteFeature[]);
        } else if (Array.isArray(data)) {
          setFeats(data as SiteFeature[]);
        } else {
          setFeats([]);
        }
      } catch {
        setFeats([]);
      }
    })();
  }, []);

  // Mémo si besoin d’un tri ou d’un pré-filtrage léger côté page
  const visibleFeats = useMemo(() => feats, [feats]);

  return (
    <main style={{ padding: 16 }}>
      <h1 style={{ marginTop: 0 }}>Sites d&apos;Urbex</h1>

      <div style={{ marginBottom: 8 }}>
        <Filters
          features={visibleFeats}
          values={filters}
          onChange={(next: Partial<SiteFilters>) =>
            setFilters((prev) => ({ ...prev, ...next }))
          }
        />
      </div>

      <ClientMap features={visibleFeats} filters={filters} />
    </main>
  );
}
