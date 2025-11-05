'use client';
import dynamic from 'next/dynamic';

// Charge la vraie carte seulement côté client (pas de SSR)
const MapInner = dynamic(() => import('./MapInner'), { ssr: false });

export default function Map() {
  return <MapInner />;
}
