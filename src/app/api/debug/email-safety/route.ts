import { NextRequest, NextResponse } from 'next/server'
import { shouldSendEmail } from '@/services/email/policies'
import { log } from '@/lib/log'
import { withRequestContext } from '@/lib/with-request-context'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

async function handlePOST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email } = body
    
    if (!email) {
      return NextResponse.json(
        { ok: false, error: 'Email is required' },
        { status: 400 }
      )
    }
    
    log.info('Email safety check requested', {
      feature: 'debug-email-safety',
      email
    })
    
    const safetyCheck = shouldSendEmail(email)
    
    return NextResponse.json({
      ok: true,
      email,
      allowed: safetyCheck.allowed,
      reason: safetyCheck.reason?.reason,
      details: safetyCheck.reason?.details
    })
    
  } catch (error) {
    log.error('Email safety check failed', {
      feature: 'debug-email-safety',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    
    return NextResponse.json(
      { ok: false, error: 'Failed to check email safety' },
      { status: 500 }
    )
  }
}

export const POST = withRequestContext(handlePOST)
