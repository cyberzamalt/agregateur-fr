import MapSites from "@/components/Map";
import { fetchSites } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function SitesPage({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const q = (searchParams.q as string) ?? "";
  const type = (searchParams.type as string) ?? "";
  const departement = (searchParams.departement as string) ?? "";
  const minRating = Number((searchParams.minRating as string) ?? "0");

  const { items, facets } = await fetchSites({ q, type, departement, minRating, limit: 50 });

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      <h1 className="text-2xl font-semibold">Sites d’urbex</h1>

      {/* Carte */}
      <MapSites />

      {/* Filtres */}
      <form method="get" className="grid md:grid-cols-4 gap-3">
        <input name="q" defaultValue={q} placeholder="Recherche..." className="bg-neutral-900 border border-neutral-700 rounded px-3 py-2" />
        <select name="type" defaultValue={type} className="bg-neutral-900 border border-neutral-700 rounded px-3 py-2">
          <option value="">Type (tous)</option>
          {facets.types.map((t: string) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select name="departement" defaultValue={departement} className="bg-neutral-900 border border-neutral-700 rounded px-3 py-2">
          <option value="">Département (tous)</option>
          {facets.departements.map((d: string) => <option key={d} value={d}>{d}</option>)}
        </select>
        <select name="minRating" defaultValue={String(minRating)} className="bg-neutral-900 border border-neutral-700 rounded px-3 py-2">
          <option value="0">Note mini (toutes)</option>
          <option value="1">≥ 1</option>
          <option value="2">≥ 2</option>
          <option value="3">≥ 3</option>
          <option value="4">≥ 4</option>
          <option value="5">= 5</option>
        </select>
        <div className="md:col-span-4">
          <button className="bg-indigo-600 hover:bg-indigo-500 rounded px-4 py-2">Filtrer</button>
        </div>
      </form>

      {/* Liste simple */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((s: any) => (
          <div key={s.id} className="border border-neutral-800 rounded-lg p-3">
            <div className="font-medium">{s.title}</div>
            <div className="text-sm text-neutral-400">{s.type ?? "Type n/d"} · Dept {s.departement ?? "n/d"}</div>
            {typeof s.score === "number" && <div className="text-sm mt-1">Score {s.score}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
