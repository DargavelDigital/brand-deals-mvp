import { Resend } from 'resend';
import { env } from '@/lib/env';

export type SendEmailParams = {
  to: string
  from: string
  subject: string
  html: string
  text?: string
  headers?: Record<string,string>
  replyTo?: string
}

export async function sendEmailResend(p: SendEmailParams) {
  const apiKey = env.RESEND_API_KEY
  if (!apiKey) {
    throw new Error('RESEND_API_KEY environment variable is not set')
  }
  
  const resend = new Resend(apiKey)
  const resp = await resend.emails.send({
    from: p.from,
    to: p.to,
    subject: p.subject,
    html: p.html,
    text: p.text,
    headers: p.headers,
    reply_to: p.replyTo,
  })
  if (resp.error) throw new Error(resp.error.message)
  return { id: resp.data?.id || '' }
}
