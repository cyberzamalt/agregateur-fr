'use client';

import React from 'react';

type Props = {
  title?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
};

export default function SiteCard({ title, children, footer }: Props) {
  return (
    <article
      style={{
        padding: 14,
        border: '1px solid #333',
        borderRadius: 12,
        background: '#0f1116',
        color: '#f2f3f5',
        display: 'grid',
        gap: 8,
      }}
    >
      {title && (
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{title}</h3>
      )}
      <div>{children}</div>
      {footer && <div style={{ borderTop: '1px solid #222', paddingTop: 8 }}>{footer}</div>}
    </article>
  );
}
