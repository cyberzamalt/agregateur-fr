export const dynamic = 'force-dynamic';
export const revalidate = 0;

import dynamicImport from 'next/dynamic';

const ClientMap = dynamicImport(() => import('../../components/Map'), {
  ssr: false,
  loading: () => <div style={{opacity:.6}}>Chargement de la carte…</div>,
});

export default function SitesPage() {
  return (
    <main style={{ padding: '24px 16px' }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 12px' }}>Sites d'Urbex</h1>
      <ClientMap />
    </main>
  );
}
