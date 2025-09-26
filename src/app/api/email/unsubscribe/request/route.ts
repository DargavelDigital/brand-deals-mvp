import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { log } from '@/lib/log'
import { sendEmailResend } from '@/services/email/provider.resend'
import { env, providers } from '@/lib/env'
import { nanoid } from 'nanoid'
import { withRequestContext } from '@/lib/with-request-context'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

async function handlePOST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, workspaceId, workspaceName = 'Brand Deals MVP' } = body
    
    if (!email) {
      return NextResponse.json(
        { ok: false, error: 'Email is required' },
        { status: 400 }
      )
    }
    
    log.info('Unsubscribe request received', {
      feature: 'email-unsubscribe',
      email,
      workspaceId
    })
    
    // Generate unsubscribe token
    const token = nanoid(32)
    const expires = new Date()
    expires.setDate(expires.getDate() + 7) // Token expires in 7 days
    
    // Store token in VerificationToken table (repurposing NextAuth's table)
    await prisma.verificationToken.create({
      data: {
        identifier: `unsubscribe:${email}`,
        token,
        expires
      }
    })
    
    // Send unsubscribe email if email provider is available
    if (providers.email) {
      try {
        const baseUrl = env.APP_URL || 'http://localhost:3000'
        const unsubscribeUrl = `${baseUrl}/api/email/unsubscribe/${token}`
        
        const subject = `Unsubscribe from ${workspaceName}`
        const html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2>Unsubscribe Request</h2>
            <p>You requested to unsubscribe from ${workspaceName} emails.</p>
            <p>Click the button below to confirm your unsubscribe request:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${unsubscribeUrl}" 
                 style="background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                Confirm Unsubscribe
              </a>
            </div>
            <p style="font-size: 14px; color: #666;">
              If you didn't request this unsubscribe, you can safely ignore this email.
            </p>
            <p style="font-size: 12px; color: #999;">
              This link will expire in 7 days.
            </p>
          </div>
        `
        
        const text = `
          Unsubscribe Request
          
          You requested to unsubscribe from ${workspaceName} emails.
          
          Click this link to confirm your unsubscribe request:
          ${unsubscribeUrl}
          
          If you didn't request this unsubscribe, you can safely ignore this email.
          
          This link will expire in 7 days.
        `
        
        await sendEmailResend({
          to: email,
          subject,
          html,
          text,
          from: env.MAIL_FROM || `noreply@${env.MAIL_DOMAIN || 'localhost'}`,
          replyTo: env.MAIL_FROM || `noreply@${env.MAIL_DOMAIN || 'localhost'}`
        })
        
        log.info('Unsubscribe email sent', {
          feature: 'email-unsubscribe',
          email,
          workspaceId
        })
        
      } catch (error) {
        log.error('Failed to send unsubscribe email', {
          feature: 'email-unsubscribe',
          email,
          workspaceId,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        
        // Don't fail the request if email sending fails
      }
    } else {
      log.warn('Email provider not available, skipping unsubscribe email', {
        feature: 'email-unsubscribe',
        email,
        workspaceId
      })
    }
    
    return NextResponse.json({
      ok: true,
      message: 'Unsubscribe request processed. Check your email for confirmation link.'
    })
    
  } catch (error) {
    log.error('Unsubscribe request failed', {
      feature: 'email-unsubscribe',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    
    return NextResponse.json(
      { ok: false, error: 'Failed to process unsubscribe request' },
      { status: 500 }
    )
  }
}

export const POST = withRequestContext(handlePOST)
