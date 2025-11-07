// Désactive tout cache/SSG pour éviter les soucis avec Leaflet
export const dynamic = "force-dynamic";
export const revalidate = 0;

import nextDynamic from "next/dynamic";
import { useState } from "react";
import Filters from "../../components/Filters";
import type { SiteFilters } from "../../lib/api";

const ClientMap = nextDynamic(() => import("../../components/Map"), { ssr: false });

export default function SitesPage() {
  const [filters, setFilters] = useState<SiteFilters>({ scoreMin: 0 });

  return (
    <main style={{ padding: "24px 16px" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, margin: "0 0 12px" }}>Sites d'Urbex</h1>
      <Filters value={filters} onChange={setFilters} />
      <ClientMap filters={filters} />
    </main>
  );
}
