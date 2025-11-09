// apps/web/app/sites/page.tsx
"use client";

import { useEffect, useState } from "react";
import nextDynamic from "next/dynamic";
import Filters from "../../components/Filters";
import type { SiteFeature, SiteFilters } from "../../lib/api";

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

  const [features, setFeatures] = useState<SiteFeature[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let aborted = false;
    (async () => {
      try {
        setLoading(true);
        setErr(null);

        // Récupère tout le GeoJSON (FeatureCollection)
        const res = await fetch("/api/sites?fc=1&scoreMin=0", { cache: "no-store" });
        const fc = await res.json();

        // Transforme GeoJSON -> tableau de SiteFeature {lat, lon, ...}
        const items: SiteFeature[] = Array.isArray(fc?.features)
          ? fc.features.map((f: any, i: number) => {
              const p = f?.properties ?? {};
              const [lon, lat] = f?.geometry?.coordinates ?? [undefined, undefined];
              return {
                id: p.id ?? String(i),
                name: p.name ?? "",
                address: p.address ?? undefined,
                region: p.region ?? p.regions ?? undefined,
                // accepte "department" ou "departement" selon la source
                department: p.department ?? p.departement ?? undefined,
                commune: p.commune ?? undefined,
                // "type" préfère p.type sinon p.kind
                type: p.type ?? p.kind ?? "autre",
                score: typeof p.score === "number" ? p.score : undefined,
                lat: typeof lat === "number" ? lat : 0,
                lon: typeof lon === "number" ? lon : 0,
              } as SiteFeature;
            })
          : [];

        if (!aborted) setFeatures(items);
      } catch (e: any) {
        if (!aborted) setErr(e?.message ?? "fetch_error");
      } finally {
        if (!aborted) setLoading(false);
      }
    })();

    return () => {
      aborted = true;
    };
  }, []);

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

      {err ? <div style={{ color: "#c00", marginBottom: 8 }}>Erreur : {err}</div> : null}

      <ClientMap features={features} filters={filters} />

      <div style={{ marginTop: 8, opacity: 0.8 }}>
        {loading ? "Chargement des points…" : `${features.length} lieux chargés`}
      </div>
    </main>
  );
}
