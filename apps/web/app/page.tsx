// apps/web/app/page.tsx
export default async function Home() {
  const api = process.env.NEXT_PUBLIC_API_URL || "";
  let status = "…";
  try {
    const r = await fetch(`${api}/api/health`, { cache: "no-store" });
    if (r.ok) {
      const j = await r.json();
      status = `API OK (${new Date(j.ts).toLocaleString()})`;
    } else {
      status = `API répond ${r.status}`;
    }
  } catch (e) {
    status = "API inaccessible";
  }

  return (
    <main style={{fontFamily:"system-ui, sans-serif", padding:24}}>
      <h1>Agregateur FR — Front</h1>
      <p>URL API: <code>{api}</code></p>
      <p><b>Statut API:</b> {status}</p>
      <p><a href={`${api}/api/health`} target="_blank">Tester /api/health</a></p>
    </main>
  );
}
