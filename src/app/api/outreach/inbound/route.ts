import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sanitizeEmailHtml } from '@/services/email/variables'
import { env } from '@/lib/env'

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
type InboundPayload = {
  to: string
  from: string
  subject?: string
  text?: string
  html?: string
  headers?: Record<string,string>
  in_reply_to?: string
  // provider-specific extras can be accepted here
}

function extractThreadKey(addr: string) {
  // addr like: "seq_<key>@your-domain.com" OR "Name <seq_<key>@...>"
  const m = addr.match(/<([^>]+)>/)
  const email = m ? m[1] : addr
  return email.split('@')[0] // local part
}

export async function POST(req: NextRequest) {
  try {
    // Optional: verify secret/header
    const secret = req.headers.get('x-inbound-secret')
    if (secret !== env.INBOUND_SECRET) {
      return NextResponse.json({ ok:false }, { status:401 })
    }

    const evt = (await req.json()) as InboundPayload
    const to = (evt.to || '').toLowerCase()
    const threadKey = extractThreadKey(to)
    if (!threadKey) return NextResponse.json({ ok:true })

    const conv = await prisma.conversation.findUnique({ where: { threadKey } })
    if (!conv) return NextResponse.json({ ok:true, note:'no conversation' })

    // store inbound message
    await prisma.message.create({
      data: {
        conversationId: conv.id,
        direction: 'in',
        provider: 'inbound',
        providerMsgId: evt.headers?.['message-id'] ?? undefined,
        inReplyTo: evt.in_reply_to,
        fromAddr: evt.from,
        toAddr: evt.to,
        subject: evt.subject,
        text: evt.text,
        html: evt.html ? sanitizeEmailHtml(evt.html) : undefined,
        status: 'replied',
      }
    })

    // mark lastAt
    await prisma.conversation.update({ where: { id: conv.id }, data: { lastAt: new Date() } })

    // mark any associated step as replied
    const step = await prisma.sequenceStep.findFirst({ where: { threadKey } })
    if (step && !step.repliedAt) {
      await prisma.sequenceStep.update({ where: { id: step.id }, data: { repliedAt: new Date(), status: 'REPLIED' } })
    }

    return NextResponse.json({ ok:true })
  } catch (e:any) {
    console.error('inbound err', e?.message)
    return NextResponse.json({ ok:false }, { status:200 })
  }
}