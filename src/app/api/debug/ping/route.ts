import { NextResponse } from "next/server";

export const runtime = "nodejs";        // force server function (not edge)
export const dynamic = "force-dynamic"; // no caching

export async function GET() {
  return NextResponse.json({
    ok: true,
    ts: new Date().toISOString(),
    node: process.version,
    env: process.env.NODE_ENV,
  });
}
