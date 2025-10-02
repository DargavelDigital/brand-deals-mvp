import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 15;

export async function GET() {
  try {
    // Use the same prisma helper pattern as other files
    let prismaFn: any;
    try {
      const svc = require("@/services/prisma");
      prismaFn = svc.prisma || svc.default || svc;
    } catch {
      const { PrismaClient } = require("@prisma/client");
      const _global = globalThis as any;
      _global.__prisma ||= new PrismaClient();
      prismaFn = () => _global.__prisma;
    }

    const prisma = prismaFn();
    const dbNow = await prisma.$queryRawUnsafe<{ now: Date }[]>("select now()");
    return NextResponse.json({ ok: true, now: dbNow?.[0]?.now ?? null });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || String(e) }, { status: 500 });
  }
}
