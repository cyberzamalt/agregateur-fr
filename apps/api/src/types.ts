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

export interface SiteQuery {
  q?: string;
  region?: string;
  dept?: string;
  kind?: string;
  minScore?: number;
  page?: number;
  pageSize?: number;
}

export interface Paginated<T> {
  ok: true;
  total: number;
  page: number;
  pageSize: number;
  items: T[];
}
