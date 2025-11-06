// Server Component (par défaut) mais on évite toute pré-rendu/SSG
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import dynamic from 'next/dynamic';
const Map = dynamic(() => import('../../components/Map'), { ssr: false });

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
