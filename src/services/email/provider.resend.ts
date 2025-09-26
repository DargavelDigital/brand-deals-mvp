import { Resend } from 'resend';
import { env } from '@/lib/env';
import { shouldSendEmail, appendComplianceFooter, logEmailBlocked, getListUnsubscribeHeader } from './policies';

export type SendEmailParams = {
  to: string
  from: string
  subject: string
  html: string
  text?: string
  headers?: Record<string,string>
  replyTo?: string
  workspaceId?: string
}

export async function sendEmailResend(p: SendEmailParams) {
  const apiKey = env.RESEND_API_KEY
  if (!apiKey) {
    throw new Error('RESEND_API_KEY environment variable is not set')
  }
  
  // Check email safety policies
  const safetyCheck = shouldSendEmail(p.to)
  
  if (!safetyCheck.allowed) {
    logEmailBlocked(p.to, safetyCheck.reason!, {
      workspaceId: p.workspaceId,
      subject: p.subject
    })
    throw new Error(`Email blocked: ${safetyCheck.reason?.reason}`)
  }
  
  // Apply compliance footer
  const workspaceInfo = {
    id: p.workspaceId || 'unknown',
    name: 'Brand Deals MVP'
  }
  
  const compliantHtml = appendComplianceFooter(p.html, workspaceInfo)
  
  const resend = new Resend(apiKey)
  const resp = await resend.emails.send({
    from: p.from,
    to: p.to,
    subject: p.subject,
    html: compliantHtml,
    text: p.text,
    headers: {
      ...p.headers,
      'List-Unsubscribe': getListUnsubscribeHeader(workspaceInfo)
    },
    reply_to: p.replyTo,
  })
  if (resp.error) throw new Error(resp.error.message)
  return { id: resp.data?.id || '' }
}
