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
      return new NextResponse('Invalid unsubscribe link', { status: 400 })
    }
    
    log.info('Unsubscribe confirmation attempt', {
      feature: 'email-unsubscribe',
      token
    })
    
    // Find and validate token
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
        token
      })
      
      return new NextResponse(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Invalid Unsubscribe Link</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center; }
            .error { color: #dc3545; }
            .info { color: #666; margin-top: 20px; }
          </style>
        </head>
        <body>
          <h1 class="error">Invalid Unsubscribe Link</h1>
          <p>This unsubscribe link is invalid or has expired.</p>
          <p class="info">If you continue to receive emails, please contact support.</p>
        </body>
        </html>
      `, {
        status: 400,
        headers: { 'Content-Type': 'text/html' }
      })
    }
    
    // Extract email from identifier
    const email = verificationToken.identifier.replace('unsubscribe:', '')
    
    // Add email to suppression list
    await addEmailSuppression(email)
    
    // Delete the used token
    await prisma.verificationToken.delete({
      where: { id: verificationToken.id }
    })
    
    log.info('Email successfully unsubscribed', {
      feature: 'email-unsubscribe',
      email,
      token
    })
    
    // Return success page
    return new NextResponse(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Successfully Unsubscribed</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center; }
          .success { color: #28a745; }
          .info { color: #666; margin-top: 20px; }
          .email { font-weight: bold; color: #333; }
        </style>
      </head>
      <body>
        <h1 class="success">✓ Successfully Unsubscribed</h1>
        <p>You have been unsubscribed from all future emails.</p>
        <p class="info">
          Email: <span class="email">${email}</span>
        </p>
        <p class="info">
          You will no longer receive marketing emails from this service.
        </p>
        <p class="info" style="font-size: 14px; color: #999;">
          If you change your mind, you can contact support to resubscribe.
        </p>
      </body>
      </html>
    `, {
      status: 200,
      headers: { 'Content-Type': 'text/html' }
    })
    
  } catch (error) {
    log.error('Unsubscribe confirmation failed', {
      feature: 'email-unsubscribe',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    
    return new NextResponse(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Unsubscribe Error</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center; }
          .error { color: #dc3545; }
          .info { color: #666; margin-top: 20px; }
        </style>
      </head>
      <body>
        <h1 class="error">Unsubscribe Error</h1>
        <p>There was an error processing your unsubscribe request.</p>
        <p class="info">Please try again or contact support if the problem persists.</p>
      </body>
      </html>
    `, {
      status: 500,
      headers: { 'Content-Type': 'text/html' }
    })
  }
}

export const GET = withRequestContext(handleGET)
