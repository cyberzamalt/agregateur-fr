// Empêche tout pré-rendu côté serveur (Leaflet est 100% client)
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import dynamic from 'next/dynamic';
const ClientMap = dynamic(() => import('@/components/Map'), { ssr: false });

export default function SitesPage() {
  return (
    <main style={{ padding: '24px 16px' }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 12px' }}>Sites d'Urbex</h1>
      <ClientMap />
    </main>
  );
}
