// apps/web/app/sites/page.tsx
"use client";

import { useMemo, useState } from "react";
import nextDynamic from "next/dynamic";
import Filters from "../../components/Filters";
import type { SiteFeature, SiteFilters } from "../../lib/api";

const ClientMap = nextDynamic(() => import("../../components/Map"), { ssr: false });

export default function SitesPage() {
  const [filters, setFilters] = useState<SiteFilters>({
    q: "",
    type: "all",       // <-- utiliser "type", pas "kind"
    region: "all",
    department: "all",
    commune: "all",
    minScore: 0,
  });

  const feats = useMemo<SiteFeature[]>(() => [], []);

  return (
    <main style={{ padding: 16 }}>
      <h1 style={{ marginTop: 0 }}>Sites d&apos;Urbex</h1>
      <div style={{ marginBottom: 8 }}>
        <Filters
          values={filters}
          onChange={(next: Partial<SiteFilters>) =>
            setFilters((prev) => ({ ...prev, ...next }))
          }
        />
      </div>
      <ClientMap features={feats} filters={filters} />
    </main>
  );
}
