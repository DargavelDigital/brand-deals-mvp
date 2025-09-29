import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function POST() {
  await prisma().workspace.updateMany({ data: { emailDailyUsed: 0 } })
  return NextResponse.json({ ok: true })
}
