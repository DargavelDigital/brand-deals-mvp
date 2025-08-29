export const runtime = 'nodejs'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireSessionOrDemo } from '@/lib/authz'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { workspaceId } = await requireSessionOrDemo(req)
    const threadId = params.id
    
    const thread = await prisma.inboxThread.findFirst({
      where: { id: threadId, workspaceId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    })
    
    if (!thread) {
      return NextResponse.json(
        { ok: false, error: 'Thread not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ ok: true, thread })
  } catch (error: any) {
    console.error('Failed to fetch thread:', error)
    return NextResponse.json(
      { ok: false, error: 'Failed to fetch thread' },
      { status: 500 }
    )
  }
}
