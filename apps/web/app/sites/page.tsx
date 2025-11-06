// Empêche tout pré-rendu (Leaflet = client)
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import NextDynamic from 'next/dynamic';
// 👉 import RELATIF (pas d'alias @)
const ClientMap = NextDynamic(() => import('../../components/Map'), { ssr: false });

export default function SitesPage() {
  return (
    <main style={{ padding: '24px 16px' }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 12px' }}>Sites d'Urbex</h1>
      <ClientMap />
    </main>
  );
}
