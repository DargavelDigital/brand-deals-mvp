import { NextRequest, NextResponse } from 'next/server'
import { email } from '@/services/email'
import { log } from '@/lib/log'
import { withRequestContext } from '@/lib/with-request-context'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

async function handlePOST(req: NextRequest) {
  try {
    const body = await req.json()
    const { to, subject, html, workspaceId } = body
    
    if (!to || !subject || !html) {
      return NextResponse.json(
        { ok: false, error: 'to, subject, and html are required' },
        { status: 400 }
      )
    }
    
    log.info('Test email send requested', {
      feature: 'debug-send-test-email',
      to,
      subject,
      workspaceId
    })
    
    try {
      const result = await email.send({
        to,
        subject,
        html,
        workspaceId
      })
      
      return NextResponse.json({
        ok: true,
        messageId: result.messageId,
        status: result.status,
        sentAt: result.sentAt
      })
      
    } catch (error) {
      // This will catch email safety blocks
      return NextResponse.json({
        ok: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        blocked: true
      })
    }
    
  } catch (error) {
    log.error('Test email send failed', {
      feature: 'debug-send-test-email',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    
    return NextResponse.json(
      { ok: false, error: 'Failed to send test email' },
      { status: 500 }
    )
  }
}

export const POST = withRequestContext(handlePOST)
