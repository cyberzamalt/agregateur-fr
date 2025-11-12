// apps/web/app/sites/layout.tsx
export const dynamic = "force-dynamic";

export default function SitesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
