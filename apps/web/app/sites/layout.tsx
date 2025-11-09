// apps/web/app/sites/layout.tsx
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function SitesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
