const API = process.env.NEXT_PUBLIC_API_URL ?? "https://agregateur-fr.onrender.com";

type Query = {
  q?: string;
  type?: string;
  departement?: string;
  minRating?: number;
  limit?: number;
  offset?: number;
};

export async function fetchSites(qs: Query = {}) {
  const url = new URL("/api/sites", API);
  Object.entries(qs).forEach(([k, v]) => {
    if (v !== undefined && v !== "" && v !== null) url.searchParams.set(k, String(v));
  });
  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) throw new Error("API error");
  return res.json();
}
