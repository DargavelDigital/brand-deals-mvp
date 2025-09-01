import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireSession } from '@/lib/auth/requireSession'
import { isOn } from '@/config/flags'

export async function POST(req: NextRequest) {
  if (!isOn('push.enabled')) return NextResponse.json({ ok: false }, { status: 404 })
  
  const gate = await requireSession(req);
  if (!gate.ok) return gate.res;
  const session = gate.session!;
  
  const body = await req.json()
  const { endpoint, keys, userAgent, platform } = body

  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return NextResponse.json({ ok: false, error: 'BAD_SUB' }, { status: 400 })
  }

  const upserted = await prisma.pushSubscription.upsert({
    where: { endpoint },
    create: {
      workspaceId: (session.user as any).workspaceId,
      userId: (session.user as any).id,
      endpoint,
      p256dh: keys.p256dh,
      auth: keys.auth,
      userAgent: userAgent ?? null,
      platform: platform ?? null
    },
    update: {
      userId: (session.user as any).id,
      p256dh: keys.p256dh,
      auth: keys.auth,
      lastSeenAt: new Date(),
      disabled: false
    }
  })
  return NextResponse.json({ ok: true, id: upserted.id })
}
