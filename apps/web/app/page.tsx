// apps/web/app/page.tsx
import Link from "next/link";

export const dynamic = "force-dynamic";
// ⚠️ Ne PAS exporter `revalidate` ici

export default function Home() {
  return (
    <main style={{ padding: 24 }}>
      <h1 style={{ marginTop: 0 }}>Agrégateur FR</h1>
      <p>Bienvenue. Accédez à la carte des sites :</p>
      <p>
        <Link href="/sites" style={{ color: "#7cc7ff", textDecoration: "underline" }}>
          Ouvrir /sites
        </Link>
      </p>
    </main>
  );
}
