import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'
import { hashIp } from '@/lib/crypto/hashIp'

function okGif() {
  // 1x1 transparent GIF
  const buf = Buffer.from('R0lGODlhAQABAAAAACw=', 'base64')
  return new NextResponse(buf, {
    headers: { 'Content-Type': 'image/gif', 'Cache-Control': 'no-store' }
  })
}

export async function GET(req: Request) {
  try {

    const url = new URL(req.url)
    const t = url.searchParams.get('t') // shareToken
    const ev = url.searchParams.get('e') // 'view'|'click'|'conv'
    const v  = url.searchParams.get('v') || '' // variant
    
    const mp = await prisma().mediaPack.findUnique({ where: { shareToken: t || '' } })
    if (!mp) return okGif()

    const ref = url.searchParams.get('ref') || undefined
    const utmSource   = url.searchParams.get('utm_source') || undefined
    const utmMedium   = url.searchParams.get('utm_medium') || undefined
    const utmCampaign = url.searchParams.get('utm_campaign') || undefined

    const visitorId = url.searchParams.get('vid') || crypto.randomUUID()
    const sessionId = url.searchParams.get('sid') || crypto.randomUUID()

    const ua = req.headers.get('user-agent') || undefined
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || ''

    if (ev === 'view') {
      try {
        await prisma().mediaPackView.create({
          data: {
            mediaPackId: mp.id,
            workspaceId: mp.workspaceId,
            variant: v || mp.variant,
            brandId: mp.brandId ?? undefined,
            sequenceId: mp.sequenceId ?? undefined,
            visitorId, sessionId,
            referrer: ref, utmSource, utmMedium, utmCampaign,
            ua, ipHash: hashIp(ip),
          }
        })
      } catch (error) {
        console.error('Failed to track view:', error)
      }
    }
    // clicks/conversions use POST below, but keep GET as fallback
    return okGif()
  } catch {
    return okGif()
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { t, ev, v, ctaId, href, type, meta, visitorId, sessionId } = body
    const mp = await prisma().mediaPack.findUnique({ where: { shareToken: t } })
    if (!mp) return NextResponse.json({ ok: true })

    if (ev === 'click') {
      await prisma().mediaPackClick.create({
        data: {
          mediaPackId: mp.id, workspaceId: mp.workspaceId,
          variant: v || mp.variant, ctaId, href,
          brandId: mp.brandId ?? undefined, sequenceId: mp.sequenceId ?? undefined,
          visitorId, sessionId,
        }
      })
    } else if (ev === 'conv') {
      await prisma().mediaPackConversion.create({
        data: {
          mediaPackId: mp.id, workspaceId: mp.workspaceId,
          variant: v || mp.variant, type: type || 'booked_call',
          brandId: mp.brandId ?? undefined, sequenceId: mp.sequenceId ?? undefined,
          visitorId, sessionId,
        }
      })
    }
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: true })
  }
}
