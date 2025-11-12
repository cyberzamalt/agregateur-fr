// apps/web/app/sites/page.tsx
"use client";

import { useMemo, useState } from "react";
import nextDynamic from "next/dynamic";
import Filters from "../../components/Filters";
import type { SiteFeature, SiteFilters } from "../../lib/api";

// Important : pas d'export revalidate ici
export const dynamic = "force-dynamic";

const ClientMap = nextDynamic(() => import("../../components/Map"), { ssr: false });

export default function SitesPage() {
  const [filters, setFilters] = useState<SiteFilters>({
    q: "",
    type: "all",
    region: "all",
    department: "all",
    commune: "all",
    minScore: 0,
  });

  const feats = useMemo<SiteFeature[]>(() => [], []);

  return (
    <main style={{ padding: 16 }}>
      <h1 style={{ marginTop: 0 }}>Sites d&apos;Urbex</h1>

      {/* Filtres en colonne */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 980 }}>
        <Filters
          values={filters}
          onChange={(next: Partial<SiteFilters>) =>
            setFilters((prev) => ({ ...prev, ...next }))
          }
        />
      </div>

      {/* Carte en dessous */}
      <div style={{ marginTop: 8 }}>
        <ClientMap features={feats} filters={filters} />
      </div>
    </main>
  );
}
