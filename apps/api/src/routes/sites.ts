import type { FastifyPluginAsync } from "fastify";
import fs from "fs";
import path from "path";
import type { Site, SiteQuery, Paginated } from "../types";

function resolveSeedPath(): string {
  // 1) si on est lancé depuis apps/api -> remonter vers /data/seed/sites.json
  const p1 = path.resolve(process.cwd(), "..", "..", "data", "seed", "sites.json");
  if (fs.existsSync(p1)) return p1;
  // 2) fallback depuis dist/routes -> remonter 4 niveaux vers /data/seed/sites.json
  const p2 = path.resolve(__dirname, "..", "..", "..", "..", "data", "seed", "sites.json");
  return p2;
}

let CACHE: Site[] | null = null;
function loadSeed(): Site[] {
  if (CACHE) return CACHE;
  const seedPath = resolveSeedPath();
  const raw = fs.readFileSync(seedPath, "utf-8");
  CACHE = JSON.parse(raw) as Site[];
  return CACHE!;
}

function matches(site: Site, q?: string): boolean {
  if (!q) return true;
  const s = q.toLowerCase();
  return (
    (site.name && site.name.toLowerCase().includes(s)) ||
    (site.commune && site.commune.toLowerCase().includes(s)) ||
    (site.region && site.region.toLowerCase().includes(s)) ||
    (site.kind && site.kind.toLowerCase().includes(s))
  );
}

const plugin: FastifyPluginAsync = async (app) => {
  app.get("/sites", async (req, reply) => {
    const seed = loadSeed();
    const { q, region, dept, kind, minScore, page = 1, pageSize = 20 } = (req.query || {}) as SiteQuery;

    let list = seed.slice();

    if (q) list = list.filter((s) => matches(s, q));
    if (region) {
      const r = region.toLowerCase();
      list = list.filter(
        (s) =>
          (s.region && s.region.toLowerCase().includes(r)) ||
          (s.region_code && s.region_code.toLowerCase() === r)
      );
    }
    if (dept) {
      const d = dept.toLowerCase();
      list = list.filter((s) => (s.dept_code || "").toLowerCase() === d);
    }
    if (kind) {
      const k = kind.toLowerCase();
      list = list.filter((s) => (s.kind || "").toLowerCase().includes(k));
    }
    if (typeof minScore !== "undefined") {
      const m = Number(minScore);
      if (!Number.isNaN(m)) list = list.filter((s) => (s.score ?? 0) >= m);
    }

    const total = list.length;
    const p = Math.max(1, Number(page) || 1);
    const ps = Math.min(100, Math.max(1, Number(pageSize) || 20));
    const start = (p - 1) * ps;
    const items = list.slice(start, start + ps);

    const res: Paginated<Site> = { ok: true, total, page: p, pageSize: ps, items };
    return reply.send(res);
  });
};

export default plugin;
