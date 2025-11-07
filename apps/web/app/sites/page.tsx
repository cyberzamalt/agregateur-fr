// Désactive tout cache/SSG pour éviter les soucis avec Leaflet
export const dynamic = "force-dynamic";
export const revalidate = 0;

import dynamic from "next/dynamic";
const ClientMap = dynamic(() => import("../../components/Map"), { ssr: false });

export default function SitesPage() {
  return (
    <main style={{ padding: "24px 16px", maxWidth: 1000, margin: "0 auto" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, margin: "0 0 12px" }}>
        Sites d&apos;Urbex
      </h1>
      <ClientMap />
    </main>
  );
}
