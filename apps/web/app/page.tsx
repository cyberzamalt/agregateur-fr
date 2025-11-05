'use client';

import { useEffect, useState } from 'react';

// Tu peux changer cette ligne si tu veux passer par une variable d'env plus tard :
const API = process.env.NEXT_PUBLIC_API_BASE || 'https://agregateur-fr.onrender.com';

type Item = { title?: string; link?: string; pubDate?: string; summary?: string | null };

export default function Home() {
  const [status, setStatus] = useState<'init'|'ok'|'ko'>('init');
  const [url, setUrl] = useState('https://www.lemonde.fr/rss/une.xml');
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const presets = [
    { name: 'Le Monde - Une', url: 'https://www.lemonde.fr/rss/une.xml' },
    { name: 'Franceinfo',     url: 'https://www.francetvinfo.fr/titres.rss' },
    { name: 'Numerama',       url: 'https://www.numerama.com/feed/' }
  ];

  useEffect(() => {
    fetch(`${API}/api/health`)
      .then(r => r.json())
      .then(d => setStatus(d.ok ? 'ok' : 'ko'))
      .catch(() => setStatus('ko'));
  }, []);

  async function load(targetUrl?: string) {
    setError(''); setLoading(true); setItems([]);
    const u = targetUrl || url;
    try {
      const res = await fetch(`${API}/api/rss?url=${encodeURIComponent(u)}`);
      const data = await res.json();
      if (data.ok) setItems(data.items || []);
      else setError(data.error || 'Erreur inconnue');
    } catch {
      setError('Erreur réseau');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{maxWidth: 900, margin: '0 auto', padding: 24, color: '#eaeaea'}}>
      <h1 style={{fontSize: 28, fontWeight: 700}}>Agregateur FR — Front</h1>

      <p style={{opacity: 0.8, marginTop: 8}}>
        API : <a href={`${API}/api/health`} target="_blank" style={{textDecoration: 'underline', color: '#9cf'}}> {API} </a>
        — statut : {status === 'ok' ? 'OK' : status === 'ko' ? 'KO' : '…'}
      </p>

      <div style={{marginTop: 16}}>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Colle une URL RSS (https://…)"
          style={{width: '100%', padding: 10, borderRadius: 6}}
        />
        <button onClick={() => load()} style={{marginTop: 10, padding: '8px 12px', borderRadius: 6, background: '#445', color: '#fff'}}>
          Charger le flux
        </button>
      </div>

      <div style={{marginTop: 12}}>
        {presets.map(p => (
          <button
            key={p.url}
            onClick={() => { setUrl(p.url); load(p.url); }}
            style={{marginRight: 8, marginBottom: 8, padding: '6px 10px', borderRadius: 6, background: '#333', color: '#fff'}}
          >
            {p.name}
          </button>
        ))}
      </div>

      {loading && <p style={{marginTop: 16}}>Chargement…</p>}
      {error && <p style={{marginTop: 16, color: '#f88'}}>{error}</p>}

      <ul style={{marginTop: 16, listStyle: 'none', padding: 0}}>
        {items.map((it, idx) => (
          <li key={idx} style={{background: '#222', padding: 12, borderRadius: 8, marginBottom: 10}}>
            <a href={it.link} target="_blank" style={{color: '#9cf', fontWeight: 600, textDecoration: 'none'}}>
              {it.title || '(sans titre)'}
            </a>
            {it.pubDate && <div style={{opacity: 0.7, fontSize: 12, marginTop: 4}}>{it.pubDate}</div>}
            {it.summary && <div style={{opacity: 0.9, marginTop: 8}}>{it.summary}</div>}
          </li>
        ))}
      </ul>
    </main>
  );
}
