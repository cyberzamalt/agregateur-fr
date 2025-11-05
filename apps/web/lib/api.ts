// apps/web/lib/api.ts
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

export const API_BASE = resolveApiBase();

export async function getSites(params: SiteQuery): Promise<Paginated<Site>> {
  const url = new URL("/api/sites", API_BASE || (typeof window !== "undefined" ? window.location.origin : "http://localhost"));
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    url.searchParams.set(k, String(v));
  });

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`API ${res.status}`);
  }
  return res.json();
}
