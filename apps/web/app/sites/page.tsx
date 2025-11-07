"use client";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import Map from "../../components/Map";

export default function SitesPage() {
  return (
    <main className="mx-auto max-w-5xl p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Sites d&apos;Urbex</h1>
      <Map />
    </main>
  );
}
