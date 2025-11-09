// apps/web/app/sites/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import nextDynamic from "next/dynamic";
import Filters from "../../components/Filters";
import type { SiteFeature, SiteFilters } from "../../lib/api";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const ClientMap = nextDynamic(() => import("../../components/Map"), { ssr: false });

const initialFilters: SiteFilters = {
  q: "",
  type: "all",
  region: "all",
  department: "all",
  commune: "all",
  minScore: 0,
};

export default function SitesPage() {
  const [filters, setFilters] = useState<SiteFilters>(initialFilters);
  const [features, setFeatures] = useState<SiteFeature[]>([]);
  const [loading, setLoading] = useState(false);

  // Recharge les points quand les filtres changent
  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      setLoading(true);
      try {
        const u = new URL("/api/sites", window.location.origin);
        u.searchParams.set("fc", "1");
        if (filters.q) u.searchParams.set("q", filters.q);
        if (filters.type !== "all") u.searchParams.set("kind", filters.type);
        if (filters.region !== "all") u.searchParams.set("region", filters.region);
        if (filters.department !== "all") u.searchParams.set("department", filters.department);
        if (filters.commune !== "all") u.searchParams.set("commune", filters.commune);
        u.searchParams.set("scoreMin", String(filters.minScore || 0));

        const res = await fetch(u.toString(), { signal: ctrl.signal, cache: "no-store" });
        const data = await res.json();
        const feats: SiteFeature[] = Array.isArray(data?.features)
          ? data.features
          : Array.isArray(data) ? data : [];
        setFeatures(feats);
      } catch {
        setFeatures([]);
      } finally {
        setLoading(false);
      }
    })();
    return () => ctrl.abort();
  }, [filters]);

  const feats = useMemo(() => features, [features]);

  return (
    <main style={{ padding: 16 }}>
      <h1 style={{ marginTop: 0 }}>Sites d&apos;Urbex</h1>
      <div style={{ marginBottom: 8 }}>
        <Filters
          values={filters}
          onChange={(next) => setFilters((prev) => ({ ...prev, ...next }))}
        />
      </div>
      {loading && <div style={{ color: "#aaa", marginBottom: 8 }}>Chargement…</div>}
      <ClientMap features={feats} filters={filters} />
    </main>
  );
}
