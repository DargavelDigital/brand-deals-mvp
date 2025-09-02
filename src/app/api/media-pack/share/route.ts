import { NextRequest, NextResponse } from 'next/server'
import { requireSession } from '@/lib/auth/requireSession'
import { signPayload } from '@/lib/signing'
import { prisma } from '@/lib/prisma'
import { env } from '@/lib/env'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const workspaceId = await requireSession(req)
    
    const body = await req.json()
    const { mpId } = body
    
    if (!mpId) {
      return NextResponse.json({ error: 'Media pack ID required' }, { status: 400 })
    }

    // Verify the media pack belongs to the user's workspace
    const mediaPack = await prisma.mediaPack.findFirst({
      where: {
        id: mpId,
        workspaceId: workspaceId
      },
      select: { id: true }
    })

    if (!mediaPack) {
      return NextResponse.json({ error: 'Media pack not found' }, { status: 404 })
    }

    // Create signed payload with 30-day expiration
    const payload = {
      mp: mpId,
      exp: Date.now() + (30 * 24 * 60 * 60 * 1000) // 30 days
    }
    
    const token = signPayload(payload, '30d')
    const shareUrl = `${env.APP_URL}/media-pack/view?mp=${mpId}&token=${encodeURIComponent(token)}`

    return NextResponse.json({ shareUrl })
  } catch (error) {
    console.error('Media pack share error:', error)
    return NextResponse.json({ error: 'Failed to create share link' }, { status: 500 })
  }
}
