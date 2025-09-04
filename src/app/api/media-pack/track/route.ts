import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function POST(req: NextRequest) {
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
    
    console.log('Media pack tracking recorded:', {
      id: trackingRecord.id,
      mediaPackId: mp,
      event,
      cta,
      durationMs: ms
    })
    
    return NextResponse.json({ success: true, id: trackingRecord.id })
  } catch (error) {
    console.error('Failed to track media pack event:', error)
    return NextResponse.json({ error: 'Failed to track event' }, { status: 500 })
  }
}