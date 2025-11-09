// apps/web/components/SiteCard.tsx
'use client';

import type { SiteFeature } from '../lib/api';

type Props = { feature: SiteFeature };

export default function SiteCard({ feature }: Props) {
  const {
    name,
    address,
    commune,
    department, // ⚠️ bien "department", pas "departement"
    region,
    score,
    lat,
    lon,
    type,
  } = feature;

  return (
    <div style={{ padding: 12, border: '1px solid #333', borderRadius: 10 }}>
      <div style={{ fontWeight: 700, fontSize: 16 }}>{name ?? 'Sans titre'}</div>

      {address && (
        <div style={{ opacity: 0.8, fontSize: 13 }}>📍 {address}</div>
      )}

      <div style={{ opacity: 0.8, fontSize: 13 }}>
        {[commune, department, region].filter(Boolean).join(', ')}
      </div>

      {typeof score === 'number' && (
        <div style={{ marginTop: 6 }}>
          <strong>Score&nbsp;:</strong> {score}
        </div>
      )}

      <div style={{ opacity: 0.7, fontSize: 12, marginTop: 6 }}>
        {lat}, {lon} {type ? `• ${type}` : ''}
      </div>
    </div>
  );
}
