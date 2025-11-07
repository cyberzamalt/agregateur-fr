// apps/web/components/SiteCard.tsx
import type { SiteFeature } from '../lib/api';

export default function SiteCard({ f }: { f: SiteFeature }) {
  const p = f.properties || {};
  return (
    <div style={{ border: '1px solid #333', borderRadius: 10, padding: 10, background: '#121214' }}>
      <div style={{ fontWeight: 700 }}>{p.name}</div>
      {p.kind && <div style={{ opacity: 0.8, fontSize: 13 }}>{p.kind}</div>}
      {p.address && <div style={{ opacity: 0.8, fontSize: 13 }}>📍 {p.address}</div>}
      <div style={{ opacity: 0.8, fontSize: 13 }}>
        {p.commune ? `${p.commune}, ` : ''}{p.departement ? `${p.departement}, ` : ''}{p.region ?? ''}
      </div>
      {typeof p.score === 'number' && <div style={{ marginTop: 6 }}>Score : {p.score.toFixed(1)}</div>}
    </div>
  );
}
