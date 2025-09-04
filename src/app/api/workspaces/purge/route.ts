import { NextRequest, NextResponse } from 'next/server'
import { requireSession } from '@/lib/auth/requireSession';
import { prisma } from '@/lib/prisma';
import { purgeDeletedOlderThan } from '@/services/retention'

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession(req);
    if (session instanceof NextResponse) return session;

    const count = await purgeDeletedOlderThan(30)
    return NextResponse.json({ purged: count })
  } catch (e) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
