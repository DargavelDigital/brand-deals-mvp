import { NextRequest, NextResponse } from 'next/server'
import { requireSession } from '@/lib/auth/requireSession';
import { prisma } from '@/lib/prisma';
import { purgeDeletedOlderThan } from '@/services/retention'

export async function POST(req: NextRequest) {
  const gate = await requireSession(req);
  if (!gate.ok) return gate.res;
  const session = gate.session!;

  const count = await purgeDeletedOlderThan(30)
  return NextResponse.json({ purged: count })
}
