// apps/web/app/sites/page.tsx
"use client";

import { useMemo, useState } from "react";
import nextDynamic from "next/dynamic";
import Filters from "../../components/Filters";
import type { SiteFeature, SiteFilters } from "../../lib/api";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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

  // La carte gère son propre chargement de données ; on laisse un tableau vide ici.
  const feats = useMemo<SiteFeature[]>(() => [], []);

  return (
    <main style={{ padding: 16, maxWidth: 1200, margin: "0 auto" }}>
      <h1 style={{ marginTop: 0 }}>Sites d&apos;Urbex</h1>

      {/* CARTE d'abord */}
      <div style={{ marginBottom: 16 }}>
        <ClientMap features={feats} filters={filters} />
      </div>

      {/* FILTRES en dessous (on ne touche pas au composant pour ne rien casser) */}
      <div>
        <Filters
          values={filters}
          onChange={(next: Partial<SiteFilters>) =>
            setFilters((prev) => ({ ...prev, ...next }))
          }
        />
      </div>
    </main>
  );
}
