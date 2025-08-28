import { NextRequest, NextResponse } from 'next/server'
import dayjs from 'dayjs'
import { prisma } from '@/lib/prisma'
import { sendEmailResend } from '@/services/email/provider.resend'
import { renderVars, sanitizeEmailHtml } from '@/services/email/variables'
import { nanoid } from 'nanoid'
import { flags } from '@/lib/flags'
import { checkAndConsumeEmail, EntitlementError } from '@/services/billing/consume'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    if (!flags.outreachEnabled) return NextResponse.json({ ok:false, reason:'flag off' }, { status:403 })
    const token = req.headers.get('x-cron-token')
    if (!token || token !== process.env.OUTREACH_SCHEDULER_TOKEN) {
      return NextResponse.json({ ok:false, reason:'unauthorized' }, { status:401 })
    }

    const now = new Date()
    // fetch up to N due steps
    const due = await prisma.sequenceStep.findMany({
      where: { status: 'PENDING', scheduledAt: { lte: now } },
      take: 25,
      include: {
        sequence: true,
        contact: true,
      },
    })

    const out: any[] = []
    
    // EPIC 11: Check and consume email credits for the batch
    if (due.length > 0) {
      try {
        const workspaceId = due[0].sequence.workspaceId
        await checkAndConsumeEmail(workspaceId, due.length, `email.batch:${due[0]?.id ?? ''}`)
      } catch (err) {
        if (err instanceof EntitlementError) {
          return NextResponse.json({ 
            error: 'payment_required', 
            upsell: err.upsell 
          }, { status: 402 })
        }
        throw err
      }
    }
    
    for (const step of due) {
      try {
        // Build variables (add more as needed)
        const vars = {
          first_name: step.contact.name?.split(' ')[0] ?? 'there',
          brand_name: step.sequence?.name ?? '',
          media_pack_url: '', // TODO: inject actual media pack URL if available
        }

        const subjectTpl = step.subject || 'Hello {first_name}'
        const textTpl    = step.text    || 'Quick hello from HYPER'
        const htmlTpl    = step.html    || `<p>Quick hello from <b>HYPER</b></p>`

        const subject = renderVars(subjectTpl, vars)
        const text    = renderVars(textTpl, vars)
        let html      = renderVars(htmlTpl, vars)
        html          = sanitizeEmailHtml(html)

        // reply-to alias per step (for inbound)
        const domain = process.env.MAIL_DOMAIN!
        const threadKey = step.threadKey ?? `seq_${step.sequenceId}_c_${step.contactId}_${nanoid(6)}`
        const replyTo = `${threadKey}@${domain}`

        // from identity
        const from = process.env.MAIL_FROM!

        const res = await sendEmailResend({
          to: step.contact.email,
          from,
          subject,
          html,
          text,
          headers: {
            'X-Hyper-Sequence': step.sequenceId,
            'X-Hyper-Step': String(step.stepNumber),
            'X-Hyper-Thread': threadKey,
          },
          replyTo,
        })

        // Ensure conversation exists
        const conv = await prisma.conversation.upsert({
          where: { threadKey },
          create: {
            workspaceId: step.sequence.workspaceId,
            sequenceId: step.sequenceId,
            brandId: step.sequence.brandId,
            contactId: step.contactId,
            subject,
            threadKey,
          },
          update: { lastAt: new Date(), subject },
        })

        await prisma.message.create({
          data: {
            conversationId: conv.id,
            direction: 'out',
            provider: 'resend',
            providerMsgId: res.id,
            fromAddr: from,
            toAddr: step.contact.email,
            subject, text, html,
            status: 'sent',
          }
        })

        await prisma.sequenceStep.update({
          where: { id: step.id },
          data: {
            status: 'SENT',
            sentAt: new Date(),
            provider: 'resend',
            providerMsgId: res.id,
            threadKey,
            subject, text, html,
          }
        })

        out.push({ stepId: step.id, ok: true })
      } catch (e:any) {
        console.error('send step error', step.id, e?.message)
        await prisma.sequenceStep.update({
          where: { id: step.id },
          data: { status: 'FAILED' }
        })
        out.push({ stepId: step.id, ok:false, error: e?.message })
      }
    }

    return NextResponse.json({ processed: out.length, results: out })
  } catch (e:any) {
    console.error(e)
    return NextResponse.json({ error:'queue failed' }, { status:500 })
  }
}
