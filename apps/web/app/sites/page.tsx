// Server Component (pas de SSG/ISR)
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import NextDynamic from 'next/dynamic'; // ⟵ alias
const Map = NextDynamic(() => import('../../components/Map'), { ssr: false });

export default function SitesPage() {
  return (
    <main style={{ padding: 24 }}>
      <h1>Sites d'Urbex</h1>
      <div style={{ marginTop: 12 }}>
        <Map />
      </div>
    </main>
  );
}
