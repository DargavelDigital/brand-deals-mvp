import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireSession } from '@/lib/auth/requireSession'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const gate = await requireSession(req);
  if (!gate.ok) return gate.res;
  const session = gate.session!;

  const items = await prisma.conversation.findMany({
    where: { workspaceId: (session.user as any).workspaceId },
    orderBy: { lastAt: 'desc' },
    take: 100,
    select: { id:true, subject:true, threadKey:true, lastAt:true }
  })
  return NextResponse.json({ items })
}
