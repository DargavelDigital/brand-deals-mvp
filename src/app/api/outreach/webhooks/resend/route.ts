import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Configure this endpoint in Resend dashboard (Events → Webhooks)
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    // NOTE: You can add signature verification here if desired.
    const evt = await req.json()
    const type = evt.type as string
    const msgId = evt.data?.id as string | undefined
    const ts = new Date(evt.created_at ?? Date.now())

    if (!msgId) return NextResponse.json({ ok:true })

    const step = await prisma.sequenceStep.findFirst({ where: { providerMsgId: msgId } })
    if (!step) return NextResponse.json({ ok:true, note:'no step' })

    const conv = await prisma.conversation.findFirst({ where: { threadKey: step.threadKey! } })

    const patch: any = {}
    if (type === 'email.delivered') patch.status = 'SENT'
    if (type === 'email.opened')    patch.openedAt = ts
    if (type === 'email.clicked')   patch.clickedAt = ts
    if (type === 'email.bounced')   patch.bouncedAt = ts

    if (Object.keys(patch).length) {
      await prisma.sequenceStep.update({ where: { id: step.id }, data: patch })
    }

    // Optional: log message activity as message child records
    if (conv) {
      await prisma.message.create({
        data: {
          conversationId: conv.id,
          direction: 'out',
          provider: 'resend',
          providerMsgId: msgId,
          status: type.replace('email.',''),
        }
      })
    }

    return NextResponse.json({ ok:true })
  } catch (e:any) {
    console.error('resend webhook err', e?.message)
    return NextResponse.json({ ok:false }, { status: 200 })
  }
}
