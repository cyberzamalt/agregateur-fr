// apps/web/app/sites/page.tsx
"use client";

import { useMemo, useState } from "react";
import nextDynamic from "next/dynamic";
import Filters from "../../components/Filters";
import type { SiteFeature, SiteFilters } from "../../lib/api";

// ⚠️ Pas de export const revalidate / dynamic ici.
// La page est 100% client et la Map se charge côté client.

const ClientMap = nextDynamic(() => import("../../components/Map"), { ssr: false });

export default function SitesPage() {
  const [filters, setFilters] = useState<SiteFilters>({
    q: "",
    kind: "all",        // <-- bien "kind" (pas "type")
    region: "all",
    department: "all",
    commune: "all",
    minScore: 0,
  });

  // on ne précharge rien côté page : la carte fetch elle-même
  const feats = useMemo<SiteFeature[]>(() => [], []);

  return (
    <main style={{ padding: 16 }}>
      <h1 style={{ marginTop: 0 }}>Sites d&apos;Urbex</h1>
      <div style={{ marginBottom: 8 }}>
        <Filters
          values={filters}
          onChange={(next: Partial<SiteFilters>) =>
            setFilters(prev => ({ ...prev, ...next }))
          }
        />
      </div>
      <ClientMap features={feats} filters={filters} />
    </main>
  );
}
