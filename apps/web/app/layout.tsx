export const metadata = {
  title: "Agrégateur FR — Urbex",
  description: "Carte et liste de sites d'urbex (démo).",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body
        style={{
          margin: 0,
          fontFamily:
            "-apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
          background: "#0b0c10",
          color: "#f2f3f5",
          lineHeight: 1.5,
        }}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
