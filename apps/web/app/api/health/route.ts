// apps/web/app/api/health/route.ts
import { NextResponse } from "next/server";

export const runtime = "nodejs";          // force Node (fs/chemins OK)
export const dynamic = "force-dynamic";   // pas de pré-rendu
export const revalidate = 0;              // pas de cache ISR

export function HEAD() {
  return new Response(null, {
    status: 200,
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}

export function GET() {
  const now = new Date();
  const payload = {
    ok: true,
    service: "agregateur-fr-web",
    time: now.toISOString(),
    uptime_s: Math.round(process.uptime()),
  };
  return NextResponse.json(payload, {
    status: 200,
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}
