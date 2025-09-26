import { NextRequest, NextResponse } from 'next/server'
import { withIdempotency } from '@/lib/idempotency';
import { prisma } from '@/lib/prisma'
import { log } from '@/lib/log';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export const POST = withIdempotency(async (req: NextRequest) => {
  try {
    const body = await req.json()
    const { mp, event, cta, ms, referer } = body
    
    if (!mp || !event) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    // Get client IP and user agent
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    const userAgent = req.headers.get('user-agent') || 'unknown'
    
    // Create tracking record
    const trackingRecord = await prisma.mediaPackTracking.create({
      data: {
        mediaPackId: mp,
        event,
        cta: cta || null,
        durationMs: ms || null,
        referer: referer || null,
        userAgent,
        ipHash: ip // In production, you'd hash this for privacy
      }
    })
    
    log.info('Media pack tracking recorded:', {
      id: trackingRecord.id,
      mediaPackId: mp,
      event,
      cta,
      durationMs: ms
    })
    
    return NextResponse.json({ success: true, id: trackingRecord.id })
  } catch (error) {
    log.error('Failed to track media pack event:', error)
    return NextResponse.json({ error: 'Failed to track event' }, { status: 500 })
  }
});