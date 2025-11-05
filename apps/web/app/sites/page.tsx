// apps/web/app/sites/page.tsx
'use client';

import { useEffect, useMemo, useState } from "react";
import { getSites, type Site, type SiteQuery } from "../../lib/api";
import SiteCard from "../../components/SiteCard";

export default function SitesPage() {
  const [q, setQ] = useState("");
  const [region, setRegion] = useState("");
  const [dept, setDept] = useState("");
  const [kind, setKind] = useState("");
  const [minScore, setMinScore] = useState<number | undefined>(undefined);

  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  const [items, setItems] = useState<Site[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string>("");

  const params: SiteQuery = useMemo(() => ({
    q, region, dept, kind, minScore, page, pageSize
  }), [q, region, dept, kind, minScore, page, pageSize]);

  async function load() {
    setLoading(true); setErr("");
    try {
      const data = await getSites(params);
      setItems(data.items);
      setTotal(data.total);
    } catch (e: any) {
      setErr(e?.message || "Erreur");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, region, dept, kind, minScore, page, pageSize]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <main style={{ maxWidth: 980, margin: "0 auto", padding: 24, color: "#e5e7eb" }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 10 }}>Liste des sites (seed)</h1>

      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr",
        gap: 8,
        background: "#111827",
        border: "1px solid #374151",
        borderRadius: 10,
        padding: 12,
        marginBottom: 12
      }}>
        <input
          placeholder="Recherche (nom, commune, région, type)"
          value={q}
          onChange={(e) => { setPage(1); setQ(e.target.value); }}
          style={inputStyle}
        />
        <input
          placeholder="Région (ex: IDF ou 'Île-de-France')"
          value={region}
          onChange={(e) => { setPage(1); setRegion(e.target.value); }}
          style={inputStyle}
        />
        <input
          placeholder="Département (ex: 93)"
          value={dept}
          onChange={(e) => { setPage(1); setDept(e.target.value); }}
          style={inputStyle}
        />
        <input
          placeholder="Type (ex: friche, ruine, hippodrome)"
          value={kind}
          onChange={(e) => { setPage(1); setKind(e.target.value); }}
          style={inputStyle}
        />
        <input
          placeholder="Score min (0-5)"
          value={minScore ?? ""}
          onChange={(e) => {
            const v = e.target.value;
            setPage(1);
            setMinScore(v === "" ? undefined : Number(v));
          }}
          style={inputStyle}
        />
      </div>

      {loading && <p>Chargement…</p>}
      {err && <p style={{ color: "#fca5a5" }}>Erreur : {err}</p>}
      {!loading && !err && items.length === 0 && <p>Aucun résultat.</p>}

      <div>
        {items.map((s) => <SiteCard key={s.id} site={s} />)}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, alignItems: "center" }}>
        <div style={{ opacity: 0.8, fontSize: 14 }}>
          {total} résultat(s) • page {page}/{totalPages}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            style={btnStyle}
          >
            ← Précédent
          </button>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            style={btnStyle}
          >
            Suivant →
          </button>
        </div>
      </div>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  padding: "8px 10px",
  borderRadius: 8,
  border: "1px solid #374151",
  background: "#111827",
  color: "#e5e7eb",
  fontSize: 14
};

const btnStyle: React.CSSProperties = {
  padding: "8px 12px",
  borderRadius: 8,
  border: "1px solid #374151",
  background: "#1f2937",
  color: "#e5e7eb",
  cursor: "pointer"
};
