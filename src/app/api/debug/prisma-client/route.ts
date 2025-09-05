import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
export const runtime = 'nodejs';

export async function GET() {
  // force a trivial query to actually instantiate the engine
  await prisma.$queryRaw`SELECT 1`;
  const prefix = process.env.DATABASE_URL?.split(':')[0] ?? 'missing';
  const engine = process.env.PRISMA_QUERY_ENGINE_TYPE ?? 'unset';
  return NextResponse.json({ ok: true, prefix, engine, expects: 'postgresql' });
}
