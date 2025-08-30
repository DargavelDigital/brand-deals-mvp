import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ensureWorkspace } from '@/lib/workspace'
import { isOn } from '@/config/flags'

export async function POST(req: NextRequest) {
  if (!isOn('push.enabled')) return NextResponse.json({ ok: false }, { status: 404 })
  const ws = await ensureWorkspace(req)
  const body = await req.json()
  const { endpoint, keys, userAgent, platform } = body

  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return NextResponse.json({ ok: false, error: 'BAD_SUB' }, { status: 400 })
  }

  const upserted = await prisma.pushSubscription.upsert({
    where: { endpoint },
    create: {
      workspaceId: ws.id,
      userId: ws.userId ?? null,
      endpoint,
      p256dh: keys.p256dh,
      auth: keys.auth,
      userAgent: userAgent ?? null,
      platform: platform ?? null
    },
    update: {
      userId: ws.userId ?? null,
      p256dh: keys.p256dh,
      auth: keys.auth,
      lastSeenAt: new Date(),
      disabled: false
    }
  })
  return NextResponse.json({ ok: true, id: upserted.id })
}
