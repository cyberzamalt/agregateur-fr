// apps/web/app/api/health/route.ts
import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  return NextResponse.json({ ok: true, time: new Date().toISOString() });
}
