// apps/web/lib/api.ts — version minimale, avec retry Render

export type AccessFlag = "public" | "prive" | "militaire" | "inconnu";

export interface Site {
  id: string;
  name: string;
  kind: string;
  commune?: string;
  dept_code?: string;
  region?: string;
  region_code?: string;
  coords?: { lat: number; lon: number } | null;
  score?: number;
  score_reasons?: string[];
  sources?: any[];
  last_seen?: string;
  access_flag?: AccessFlag;
  risk_flags?: string[];
}

export interface Paginated<T> {
  ok: true;
  total: number;
  page: number;
  pageSize: number;
  items: T[];
}

export interface SiteQuery {
  q?: string;
  region?: string;
  dept?: string;
  kind?: string;
  minScore?: number;
  page?: number;
  pageSize?: number;
}

function resolveApiBase(): string {
  const env = process.env.NEXT_PUBLIC_API_URL;
  if (env && env.trim().length > 0) return env.trim();
  if (typeof window !== "undefined") return window.location.origin;
  return "";
}

const API_BASE = resolveApiBase();

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

// 🔹 CE QUI COMPTE : on exporte bien getSites (avec retry 429/502/503)
export async function getSites(params: SiteQuery): Promise<Paginated<Site>> {
  const base =
    API_BASE || (typeof window !== "undefined" ? window.location.origin : "http://localhost");
  const url = new URL("/api/sites", base);

  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    url.searchParams.set(k, String(v));
  });

  const maxTries = 12; // ~24s max avec backoff
  for (let i = 0; i < maxTries; i++) {
    const res = await fetch(url.toString(), { cache: "no-store" });

    if (res.ok) {
      return res.json();
    }

    // Réveil Render : on attend et on retente
    if ([429, 502, 503].includes(res.status)) {
      await sleep(1000 + i * 1000); // 1s, 2s, 3s, ...
      continue;
    }

    // Autre erreur : on remonte
    throw new Error(`API ${res.status}`);
  }

  // Si l'API reste endormie trop longtemps, on renvoie une réponse vide propre
  const page = Number(params.page ?? 1);
  const pageSize = Number(params.pageSize ?? 20);
  return { ok: true, total: 0, page, pageSize, items: [] };
}
