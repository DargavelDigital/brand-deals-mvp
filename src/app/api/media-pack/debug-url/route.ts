import { NextRequest, NextResponse } from 'next/server'
import { requireSession } from '@/lib/auth/requireSession'
import { signPayload } from '@/lib/signing'
import { prisma } from '@/lib/prisma'
import { env } from '@/lib/env'

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET(req: NextRequest) {
  try {
    const workspaceId = await requireSession(req)
    
    const { searchParams } = new URL(req.url)
    const mpId = searchParams.get('mp')
    
    if (!mpId) {
      return NextResponse.json({ error: 'Media pack ID required' }, { status: 400 })
    }

    // Verify the media pack belongs to the user's workspace
    const mediaPack = await prisma.mediaPack.findFirst({
      where: {
        id: mpId,
        workspaceId: workspaceId
      },
      select: { 
        id: true,
        variant: true,
        theme: true,
        brandIds: true,
        workspace: {
          select: {
            name: true,
            slug: true
          }
        }
      }
    })

    if (!mediaPack) {
      return NextResponse.json({ error: 'Media pack not found' }, { status: 404 })
    }

    // Create signed payload with 30-day expiration (same as share route)
    const payload = {
      mp: mpId,
      exp: Date.now() + (30 * 24 * 60 * 60 * 1000) // 30 days
    }
    
    const token = signPayload(payload, '30d')
    const viewUrl = `${env.APP_URL}/media-pack/view?mp=${mpId}&token=${encodeURIComponent(token)}`

    return NextResponse.json({ 
      url: viewUrl, 
      ok: true,
      mediaPack: {
        id: mediaPack.id,
        variant: mediaPack.variant,
        workspace: mediaPack.workspace
      }
    })
  } catch (error) {
    console.error('Media pack debug URL error:', error)
    return NextResponse.json({ error: 'Failed to create debug URL' }, { status: 500 })
  }
}
