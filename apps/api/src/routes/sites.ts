// apps/api/src/routes/sites.ts
import { FastifyInstance } from "fastify";
import fs from "fs";
import path from "path";
import type { Site } from "../types";
import { computeScore } from "../lib/scoring";

type Query = {
  q?: string;
  type?: string;
  departement?: string;     // "75", "13", ...
  minRating?: string;       // "3" => >=3
  limit?: string;           // "20"
  offset?: string;          // "0"
};

export async function sitesRoutes(app: FastifyInstance) {
  app.get<{ Querystring: Query }>("/api/sites", async (req) => {
    const q = (req.query.q ?? "").toLowerCase().trim();
    const type = (req.query.type ?? "").toLowerCase().trim();
    const dep = (req.query.departement ?? "").trim();
    const minRating = Number(req.query.minRating ?? 0);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit ?? 50)));
    const offset = Math.max(0, Number(req.query.offset ?? 0));

    const seedPath = path.resolve("data/seed/sites.json");
    const raw = fs.readFileSync(seedPath, "utf-8");
    const all: Site[] = JSON.parse(raw);

    const enriched = all.map(s => ({ ...s, score: computeScore(s) }));

    const filtered = enriched.filter(s => {
      if (q) {
        const hay = [s.title, s.city, s.type, s.departement, s.region, s.source]
          .filter(Boolean).join(" ").toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (type && (s.type ?? "").toLowerCase() !== type) return false;
      if (dep && (s.departement ?? "") !== dep) return false;
      if (minRating && (s.rating ?? 0) < minRating) return false;
      return true;
    });

    const total = filtered.length;
    const page = filtered.slice(offset, offset + limit);

    // Suggestion: renvoyer aussi la liste des types/départements disponibles (facilite les filtres côté front)
    const types = Array.from(new Set(all.map(s => s.type).filter(Boolean))).sort();
    const deps = Array.from(new Set(all.map(s => s.departement).filter(Boolean))).sort();

    return { total, items: page, facets: { types, departements: deps } };
  });
}
