import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { log } from '@/lib/log'
import { addEmailSuppression } from '@/services/email/policies'
import { withRequestContext } from '@/lib/with-request-context'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

async function handleGET(req: NextRequest, { params }: { params: { token: string } }) {
  try {
    const { token } = params
    
    if (!token) {
      return NextResponse.json(
        { ok: false, error: 'Token is required' },
        { status: 400 }
      )
    }
    
    log.info('Unsubscribe token verification started', {
      feature: 'email-unsubscribe',
      token: token.substring(0, 8) + '...' // Log partial token for security
    })
    
    // Find the verification token
    const verificationToken = await prisma.verificationToken.findFirst({
      where: {
        token,
        identifier: {
          startsWith: 'unsubscribe:'
        },
        expires: {
          gt: new Date()
        }
      }
    })
    
    if (!verificationToken) {
      log.warn('Invalid or expired unsubscribe token', {
        feature: 'email-unsubscribe',
        token: token.substring(0, 8) + '...'
      })
      
      return new NextResponse(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Unsubscribe - Invalid Token</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
            .error { color: #dc3545; background: #f8d7da; padding: 15px; border-radius: 4px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <h1>Unsubscribe Failed</h1>
          <div class="error">
            <strong>Invalid or expired token.</strong><br>
            This unsubscribe link is no longer valid. Please request a new unsubscribe link.
          </div>
          <p>If you continue to receive emails, please contact support.</p>
        </body>
        </html>
      `, {
        status: 400,
        headers: {
          'Content-Type': 'text/html'
        }
      })
    }
    
    // Extract email from identifier
    const email = verificationToken.identifier.replace('unsubscribe:', '')
    
    // Add email to suppression list
    await addEmailSuppression(email)
    
    // Delete the used token
    await prisma.verificationToken.delete({
      where: {
        id: verificationToken.id
      }
    })
    
    log.info('Email successfully unsubscribed', {
      feature: 'email-unsubscribe',
      email,
      token: token.substring(0, 8) + '...'
    })
    
    return new NextResponse(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Unsubscribed Successfully</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
          .success { color: #155724; background: #d4edda; padding: 15px; border-radius: 4px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <h1>Successfully Unsubscribed</h1>
        <div class="success">
          <strong>You have been unsubscribed from our emails.</strong><br>
          You will no longer receive emails from this sender.
        </div>
        <p>If you change your mind, you can always re-subscribe by contacting us directly.</p>
        <p><small>This action was completed on ${new Date().toLocaleString()}.</small></p>
      </body>
      </html>
    `, {
      status: 200,
      headers: {
        'Content-Type': 'text/html'
      }
    })
    
  } catch (error) {
    log.error('Unsubscribe token verification failed', {
      feature: 'email-unsubscribe',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    
    return new NextResponse(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Unsubscribe Error</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
          .error { color: #dc3545; background: #f8d7da; padding: 15px; border-radius: 4px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <h1>Unsubscribe Error</h1>
        <div class="error">
          <strong>An error occurred while processing your unsubscribe request.</strong><br>
          Please try again later or contact support if the problem persists.
        </div>
      </body>
      </html>
    `, {
      status: 500,
      headers: {
        'Content-Type': 'text/html'
      }
    })
  }
}

export const GET = withRequestContext(handleGET)