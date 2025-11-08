// apps/web/app/layout.tsx
import type { ReactNode } from "react";

export const dynamic = "force-dynamic";
// ⚠️ Ne PAS exporter `revalidate` ici

export const metadata = {
  title: "Agrégateur FR — Urbex",
  description: "Carte et liste de sites d’urbex (démo).",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        {/* Leaflet CSS (si déjà importé en global.css, tu peux retirer) */}
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body style={{ background: "#0b0b0e", color: "#fff", margin: 0 }}>
        {children}
      </body>
    </html>
  );
}
