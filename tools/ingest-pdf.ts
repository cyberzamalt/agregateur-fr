// tools/ingest-pdf.ts
import fs from "fs/promises";
import path from "path";
import pdf from "pdf-parse";

type AccessFlag = "public" | "prive" | "militaire" | "inconnu";

type SeedSite = {
  id: string;
  name: string;
  kind?: string;
  commune?: string;
  dept_code?: string;
  region?: string;
  coords?: { lat: number; lon: number } | null;
  score?: number;
  access_flag?: AccessFlag;
  sources?: Array<{ type: "pdf"; ref: string }>;
};

const PDFs_DIR = path.resolve("data/pdfs");
const SEED_FILE = path.resolve("data/seed/sites.json");

// helpers
const slug = (s: string) =>
  s.toLowerCase().normalize("NFKD").replace(/[^\w]+/g, "-").replace(/^-+|-+$/g, "");

async function readExisting(): Promise<SeedSite[]> {
  try {
    const raw = await fs.readFile(SEED_FILE, "utf8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function tryParseCoords(text: string) {
  // cherche “48.85, 2.35” ou “lat:48.85 lon:2.35”
  const m = text.match(
    /(?:(?:lat(?:itude)?\s*[:=]\s*)?(-?\d{1,2}\.\d+)[,\s;]+(?:lon(?:gitude)?\s*[:=]\s*)?(-?\d{1,3}\.\d+))/i
  );
  if (!m) return null;
  const lat = parseFloat(m[1]), lon = parseFloat(m[2]);
  if (isFinite(lat) && isFinite(lon)) return { lat, lon };
  return null;
}

function pick<T>(v: T | undefined, fallback: T): T {
  return v === undefined ? fallback : v;
}

function parseOne(text: string, file: string): Partial<SeedSite> {
  // Heuristiques simples (adaptables à tes PDFs)
  const name =
    text.match(/(?:Nom|Titre)\s*[:\-]\s*(.+)/i)?.[1]?.trim() ??
    path.basename(file, path.extname(file));
  const kind = text.match(/(?:Type|Catégorie)\s*[:\-]\s*(.+)/i)?.[1]?.trim();
  const commune = text.match(/(?:Commune|Ville)\s*[:\-]\s*(.+)/i)?.[1]?.trim();
  const dept = text.match(/(?:Département|Dept\.?)\s*[:\-]\s*(\d{2,3})/i)?.[1]?.trim();
  const region = text.match(/Région\s*[:\-]\s*(.+)/i)?.[1]?.trim();
  const coords = tryParseCoords(text);

  return {
    name,
    kind,
    commune,
    dept_code: dept,
    region,
    coords,
  };
}

async function main() {
  const existing = await readExisting();
  const byId = new Map(existing.map((s) => [s.id, s]));

  const entries = await fs.readdir(PDFs_DIR, { withFileTypes: true });
  const pdfs = entries.filter((e) => e.isFile() && /\.pdf$/i.test(e.name));

  for (const e of pdfs) {
    const file = path.join(PDFs_DIR, e.name);
    const buf = await fs.readFile(file);
    const data = await pdf(buf);
    const parsed = parseOne(data.text, e.name);

    const id = `pdf-${slug(path.basename(e.name, ".pdf"))}`;
    const current = byId.get(id);

    const merged: SeedSite = {
      id,
      name: pick(parsed.name, current?.name ?? id),
      kind: parsed.kind ?? current?.kind,
      commune: parsed.commune ?? current?.commune,
      dept_code: parsed.dept_code ?? current?.dept_code,
      region: parsed.region ?? current?.region,
      coords: parsed.coords ?? current?.coords ?? null,
      score: current?.score,
      access_flag: current?.access_flag ?? "inconnu",
      sources: current?.sources ?? [{ type: "pdf", ref: e.name }],
    };

    byId.set(id, merged);
  }

  const out = Array.from(byId.values()).sort((a, b) => a.name.localeCompare(b.name));
  await fs.mkdir(path.dirname(SEED_FILE), { recursive: true });
  await fs.writeFile(SEED_FILE, JSON.stringify(out, null, 2), "utf8");
  console.log(`✅ Seed mis à jour → ${SEED_FILE} (${out.length} entrées)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
