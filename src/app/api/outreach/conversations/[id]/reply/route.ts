import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmailResend } from '@/services/email/provider.resend'
import { sanitizeEmailHtml } from '@/services/email/variables'
import { env, providers } from '@/lib/env'

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function POST(req: NextRequest, { params }: any) {
  if (!providers.email) {
    return NextResponse.json({ ok: false, error: "EMAIL_DISABLED" }, { status: 200 });
  }

  const id = params.id as string
  const { body } = await req.json()
  const conv = await prisma().conversation.findUnique({ where: { id } })
  if (!conv) return NextResponse.json({ error:'not found' }, { status:404 })

  const lastOut = await prisma().message.findFirst({
    where: { conversationId: conv.id, direction: 'out' },
    orderBy: { createdAt: 'desc' },
  })

  // We need the contact email and original 'to'/'from'
  const step = await prisma().sequenceStep.findFirst({ where: { threadKey: conv.threadKey }, include: { contact: true } })
  if (!step) return NextResponse.json({ error: 'no step' }, { status: 400 })

  const html = sanitizeEmailHtml(body || '')
  const subject = conv.subject || 'Re:'

  const res = await sendEmailResend({
    to: step.contact.email,
    from: env.MAIL_FROM!,
    subject,
    html,
    text: html.replace(/<[^>]+>/g, ''),
    headers: lastOut?.providerMsgId ? { 'In-Reply-To': lastOut.providerMsgId } : undefined,
    replyTo: `${conv.threadKey}@${env.MAIL_DOMAIN!}`,
  })

  await prisma().message.create({
    data: {
      conversationId: conv.id,
      direction: 'out',
      provider: 'resend',
      providerMsgId: res.id,
      inReplyTo: lastOut?.providerMsgId || undefined,
      fromAddr: env.MAIL_FROM!,
      toAddr: step.contact.email,
      subject,
      html,
      text: html.replace(/<[^>]+>/g,''),
      status: 'sent',
    }
  })

  await prisma().conversation.update({ where: { id: conv.id }, data: { lastAt: new Date() } })
  return NextResponse.json({ ok:true })
}
