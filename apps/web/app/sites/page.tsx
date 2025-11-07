// Empêche le SSG/ISR pour la route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import nextDynamic from 'next/dynamic';

const SitesClient = nextDynamic(() => import('./SitesClient'), { ssr: false });

export default function SitesPage() {
  return (
    <main style={{ padding: '24px 16px' }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 12px' }}>Sites d'Urbex</h1>
      <SitesClient />
    </main>
  );
}
