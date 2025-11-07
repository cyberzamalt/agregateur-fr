import type { ReactNode } from "react";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body style={{ background: "#0a0a0a", color: "#e5e5e5", fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif" }}>
        <header style={{ maxWidth: 960, margin: "0 auto", padding: "16px" }}>
          <nav style={{ display: "flex", gap: 12 }}>
            <a href="/" style={{ textDecoration: "none", color: "inherit" }}>Accueil</a>
            <a href="/sites" style={{ textDecoration: "none", color: "inherit" }}>Sites</a>
          </nav>
        </header>
        <main style={{ maxWidth: 960, margin: "0 auto", padding: "0 16px 24px" }}>
          {children}
        </main>
      </body>
    </html>
  );
}
