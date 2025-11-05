// tools/ingest-pdf.ts
// But : lire tous les PDF dans data/pdfs/, extraire un maximum d'infos
// (titre, url, coordonnées, type...), fusionner avec data/seed/sites.json
// et produire un seed propre. "Semi-auto" = heuristiques + champs laissés vides si introuvables.

import fs from "fs";
import path from "path";
import pdf from "pdf-parse";

type Coords = { lat: number; lon: number };
type Site = {
  id: string;              // slug unique
  title: string;
  city?: string;
  departement?: string;    // ex: "75", "13", "59"
  region?: string;         // ex: "Île-de-France"
  type?: string;           // ex: "Usine", "Hôpital", "Château"...
  rating?: number;         // 0..5
  coords?: Coords;
  source?: string;         // URL
  description?: string;
  updatedAt?: string;      // ISO date
};

const PDF_DIR = path.resolve("data/pdfs");
const SEED_PATH = path.resolve("data/seed/sites.json");

const ensure = (p: string) => {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
};

function slugify(s: string) {
  return s
    .normalize("NFD").replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function guessTitle(text: string): string | undefined {
  // 1ère ligne non vide, courte, en "titre"
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  return lines[0]?.slice(0, 120);
}

function guessUrl(text: string): string | undefined {
  const m = text.match(/https?:\/\/[^\s)]+/i);
  return m?.[0];
}

function guessCoords(text: string): Coords | undefined {
  // Formats possibles: "48.8566, 2.3522" ou "lat: 48.85 lon: 2.35"
  const m = text.match(/(-?\d{1,2}\.\d{3,})(?:\s*[;,]\s*|[^0-9-]+)(-?\d{1,3}\.\d{3,})/);
  if (!m) return;
  const lat = parseFloat(m[1]);
  const lon = parseFloat(m[2]);
  if (Math.abs(lat) > 90 || Math.abs(lon) > 180) return;
  return { lat, lon };
}

function guessType(text: string): string | undefined {
  const types = ["usine", "hôpital", "hopital", "château", "chateau", "église", "eglise", "manoir", "fort", "gare", "tunnel", "bunker", "école", "ecole"];
  const low = text.toLowerCase();
  const found = types.find(t => low.includes(t));
  if (!found) return;
  const canon: Record<string, string> = {
    "hopital": "Hôpital", "hôpital": "Hôpital",
    "chateau": "Château", "église": "Église", "eglise": "Église",
    "ecole": "École"
  };
  return canon[found] ?? (found.charAt(0).toUpperCase() + found.slice(1));
}

function loadSeed(): Site[] {
  try {
    const raw = fs.readFileSync(SEED_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveSeed(sites: Site[]) {
  sites.sort((a, b) => a.title.localeCompare(b.title));
  fs.writeFileSync(SEED_PATH, JSON.stringify(sites, null, 2), "utf-8");
  console.log(`✅ Seed écrit : ${SEED_PATH} (${sites.length} entrées)`);
}

async function run() {
  ensure("data/seed");
  ensure(PDF_DIR);

  const seed = loadSeed();
  const byId = new Map(seed.map(s => [s.id, s]));

  const files = fs.readdirSync(PDF_DIR).filter(f => f.toLowerCase().endsWith(".pdf"));
  if (files.length === 0) {
    console.log(`ℹ️ Place tes PDF dans ${PDF_DIR} puis relance : pnpm seed:ingest`);
    saveSeed(seed);
    return;
  }

  for (const file of files) {
    const p = path.join(PDF_DIR, file);
    const buff = fs.readFileSync(p);
    const data = await pdf(buff);
    const text = data.text ?? "";

    const title = guessTitle(text) ?? path.parse(file).name;
    const id = slugify(title);

    const prev = byId.get(id);
    const site: Site = prev ?? {
      id,
      title,
      updatedAt: new Date().toISOString()
    };

    site.title = site.title || title;
    site.source = site.source ?? guessUrl(text);
    site.coords = site.coords ?? guessCoords(text);
    site.type = site.type ?? guessType(text);

    // On garde le texte source pour enrichir plus tard si tu veux
    site.description = site.description ?? undefined;

    byId.set(id, site);
  }

  saveSeed([...byId.values()]);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
