// apps/web/app/sites/page.tsx
"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Filters from "../../components/Filters";
import type { SiteFilters, SiteFeature } from "../../lib/api";

// Cette page est purement client (Leaflet + filtres)
export const dynamic = "force-dynamic";
export const revalidate = 0; // ✅ nombre ou false, jamais un objet

const ClientMap = dynamic(() => import("../../components/Map"), { ssr: false });

export default function SitesPage() {
  const [filters, setFilters] = useState<SiteFilters>({
    q: "",
    type: "all",
    region: "all",
    department: "all",
    commune: "all",
    minScore: 0,
  });

  // Les features viennent déjà du/ des GeoJSON(s) côté client via <Map />
  const feats = useMemo<SiteFeature[]>(() => [], []);

  return (
    <main style={{ padding: 16 }}>
      <h1 style={{ marginTop: 0 }}>Sites d&apos;Urbex</h1>
      <div style={{ marginBottom: 8 }}>
        <Filters value={filters} onChange={setFilters} />
      </div>
      <ClientMap features={feats} filters={filters} />
    </main>
  );
}
