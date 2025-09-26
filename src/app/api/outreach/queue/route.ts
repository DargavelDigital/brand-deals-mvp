import { NextRequest, NextResponse } from 'next/server'
import dayjs from 'dayjs'
import { prisma } from '@/lib/prisma'
import { sendEmailResend } from '@/services/email/provider.resend'
import { renderVars, sanitizeEmailHtml } from '@/services/email/variables'
import { nanoid } from 'nanoid'
import { flags } from '@/lib/flags'
import { checkAndConsumeEmail, EntitlementError } from '@/services/billing/consume'
import { env, providers } from '@/lib/env'
import { log } from '@/lib/log'
import { withRequestContext } from '@/lib/with-request-context'
import { withIdempotency, tx } from '@/lib/idempotency'
import { shouldSendEmail, appendComplianceFooter, getListUnsubscribeHeader, logEmailBlocked } from '@/services/email/policies'

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const maxDuration = 60

async function handlePOST(req: NextRequest) {
  if (!providers.email) {
    return NextResponse.json({ ok: false, error: "EMAIL_DISABLED" }, { status: 200 });
  }

  try {
    if (!flags.outreachEnabled) return NextResponse.json({ ok:false, reason:'flag off' }, { status:403 })
    const token = req.headers.get('x-cron-token')
    if (!token || token !== env.OUTREACH_SCHEDULER_TOKEN) {
      return NextResponse.json({ ok:false, reason:'unauthorized' }, { status:401 })
    }

    log.info('Outreach queue processing started', { feature: 'outreach-scheduler' });

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
    
    log.info('Found due steps', { count: due.length, feature: 'outreach-scheduler' });
    
    // EPIC 11: Check and consume email credits for the batch
    if (due.length > 0) {
      try {
        const workspaceId = due[0].sequence.workspaceId
        await checkAndConsumeEmail(workspaceId, due.length, `email.batch:${due[0]?.id ?? ''}`)
        log.info('Email credits consumed', { workspaceId, count: due.length, feature: 'outreach-scheduler' });
      } catch (err) {
        if (err instanceof EntitlementError) {
          log.warn('Email entitlement error', { workspaceId: due[0]?.sequence.workspaceId, error: err.message, feature: 'outreach-scheduler' });
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
        // Check if email should be sent based on safety policies
        const emailCheck = shouldSendEmail(step.contact.email)
        if (!emailCheck.allowed) {
          logEmailBlocked(step.contact.email, emailCheck.reason!, {
            stepId: step.id,
            sequenceId: step.sequenceId,
            contactId: step.contactId
          })
          
          // Mark step as failed due to safety policy
          await prisma.sequenceStep.update({
            where: { id: step.id },
            data: {
              status: 'FAILED',
              error: `Email blocked: ${emailCheck.reason?.reason}`,
              updatedAt: new Date()
            }
          })
          
          out.push({ stepId: step.id, ok: false, error: `Email blocked: ${emailCheck.reason?.reason}` })
          continue
        }

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

        // Add compliance footer
        const workspace = {
          id: step.sequence.workspaceId,
          name: step.sequence.workspace?.name || 'Brand Deals MVP',
          slug: step.sequence.workspace?.slug
        }
        html = appendComplianceFooter(html, workspace)

        // reply-to alias per step (for inbound)
        const domain = env.MAIL_DOMAIN!
        const threadKey = step.threadKey ?? `seq_${step.sequenceId}_c_${step.contactId}_${nanoid(6)}`
        const replyTo = `${threadKey}@${domain}`

        // from identity
        const from = env.MAIL_FROM!

        // Prepare headers with List-Unsubscribe
        const headers = {
          'X-Hyper-Sequence': step.sequenceId,
          'X-Hyper-Step': String(step.stepNumber),
          'X-Hyper-Thread': threadKey,
          'List-Unsubscribe': getListUnsubscribeHeader(workspace)
        }

        const res = await sendEmailResend({
          to: step.contact.email,
          from,
          subject,
          html,
          text,
          headers,
          replyTo,
        })

        // Ensure conversation exists and create message using transaction
        await tx(async (p) => {
          const conv = await p.conversation.upsert({
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

          await p.message.create({
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

          await p.sequenceStep.update({
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
        })

        out.push({ stepId: step.id, ok: true })
        log.info('Email sent successfully', { stepId: step.id, contactEmail: step.contact.email, feature: 'outreach-scheduler' });
      } catch (e:any) {
        log.error('Send step error', { stepId: step.id, error: e?.message, feature: 'outreach-scheduler' });
        await prisma.sequenceStep.update({
          where: { id: step.id },
          data: { status: 'FAILED' }
        })
        out.push({ stepId: step.id, ok:false, error: e?.message })
      }
    }

    log.info('Outreach queue processing completed', { processed: out.length, feature: 'outreach-scheduler' });
    return NextResponse.json({ processed: out.length, results: out })
  } catch (e:any) {
    log.error('Outreach queue processing failed', { error: e?.message, feature: 'outreach-scheduler' });
    return NextResponse.json({ error:'queue failed' }, { status:500 })
  }
}

export const POST = withRequestContext(withIdempotency(handlePOST));