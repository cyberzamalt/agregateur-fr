// apps/web/app/sites/page.tsx — lit via getSites() (GeoJSON) et affiche le bon compteur

import Map from "../../components/Map";
import { getSites } from "../../lib/api";

export const dynamic = "force-dynamic";

export default async function SitesPage({
  searchParams,
}: {
  searchParams?: { q?: string; region?: string; dept?: string; kind?: string; minScore?: string; page?: string };
}) {
  const page = Number(searchParams?.page ?? 1);
  const pageSize = 20;

  const data = await getSites({
    q: searchParams?.q,
    region: searchParams?.region,
    dept: searchParams?.dept,
    kind: searchParams?.kind,
    minScore: searchParams?.minScore ? Number(searchParams.minScore) : undefined,
    page,
    pageSize,
  });

  return (
    <main className="mx-auto max-w-5xl p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Sites d&apos;Urbex</h1>

      {/* Carte (lit aussi /sites.geojson) */}
      <Map />

      {/* Compteur + simple liste */}
      <div className="text-sm opacity-80">Résultats : {data.total}</div>
      <ul className="grid grid-cols-1 gap-3">
        {data.items.map((s) => (
          <li key={s.id} className="border border-zinc-700 rounded-lg p-3">
            <div className="font-medium">{s.name}</div>
            <div className="text-xs opacity-75">
              {s.kind ?? "—"} {s.region ? `· ${s.region}` : ""} {s.dept_code ? `· ${s.dept_code}` : ""}
              {typeof s.score === "number" ? ` · ★ ${s.score}` : ""}
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
