// Empêche tout pré-rendu côté serveur (Leaflet est 100% client)
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import dynamic from 'next/dynamic';

const ClientMap = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => (
    <div style={{
      height: 420, border: '1px solid #333', borderRadius: 12,
      display: 'grid', placeItems: 'center'
    }}>
      Chargement de la carte…
    </div>
  ),
});

export default function SitesPage() {
  return (
    <main style={{ padding: '24px 16px', maxWidth: 1100, margin: '0 auto' }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 12px' }}>
        Sites d’Urbex
      </h1>
      <ClientMap />
    </main>
  );
}
