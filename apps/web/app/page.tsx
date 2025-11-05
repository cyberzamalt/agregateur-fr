'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <main style={{maxWidth: 900, margin: '0 auto', padding: 24, color: '#e5e7eb', fontFamily: 'system-ui'}}>
      <h1 style={{fontSize: 32, fontWeight: 800, marginBottom: 8}}>Agregateur FR — Urbex</h1>
      <p style={{opacity: 0.85, marginBottom: 16}}>
        Prototype MVP. Accédez directement à la liste des sites issue du seed.
      </p>

      <div style={{display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24}}>
        <Link href="/sites" style={btn}>Voir les sites →</Link>
        <a href="/api/sites?page=1&pageSize=10" style={btn} target="_blank">Tester l’API (JSON)</a>
      </div>

      <section style={card}>
        <h2 style={h2}>Comment ça marche ?</h2>
        <ul style={{marginTop: 8, lineHeight: 1.6}}>
          <li>/sites : liste filtrable (depuis <code>data/seed/sites.json</code>)</li>
          <li>/api/sites : API de lecture (pagination & filtres simples)</li>
          <li>Prochaines étapes : ingestion PDF → seed, scoring étoilé, carte</li>
        </ul>
      </section>
    </main>
  );
}

const btn: React.CSSProperties = {
  padding: '10px 14px',
  borderRadius: 10,
  background: '#1f2937',
  border: '1px solid #374151',
  color: '#e5e7eb',
  textDecoration: 'none'
};

const card: React.CSSProperties = {
  background: '#111827',
  border: '1px solid #374151',
  borderRadius: 12,
  padding: 16
};

const h2: React.CSSProperties = {
  fontSize: 20,
  fontWeight: 700
};
