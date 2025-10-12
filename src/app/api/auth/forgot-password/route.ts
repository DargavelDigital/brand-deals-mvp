import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { randomBytes } from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    console.log('[Password Reset] Request for email:', email)

    // Find user
    const user = await prisma().user.findUnique({
      where: { email: email.toLowerCase() },
    })

    // Always return success (don't reveal if user exists - security best practice)
    if (!user) {
      console.log('[Password Reset] User not found, but returning success (security)')
      return NextResponse.json({
        success: true,
        message: 'If an account exists, a reset link has been sent',
      })
    }

    // Generate reset token
    const resetToken = randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    console.log('[Password Reset] Generated token for:', user.email)

    // Store token in database (use VerificationToken table as fallback)
    try {
      await prisma().verificationToken.upsert({
        where: {
          identifier_token: {
            identifier: `password-reset-${user.email}`,
            token: resetToken,
          },
        },
        create: {
          identifier: `password-reset-${user.email}`,
          token: resetToken,
          expires: resetTokenExpiry,
        },
        update: {
          token: resetToken,
          expires: resetTokenExpiry,
        },
      })
      console.log('[Password Reset] Token stored in database')
    } catch (e) {
      console.error('[Password Reset] Failed to store token:', e)
      return NextResponse.json(
        { error: 'Failed to process request' },
        { status: 500 }
      )
    }

    // Generate reset link
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const resetUrl = `${baseUrl}/en/auth/reset-password?token=${resetToken}`

    // TODO: Send email with reset link
    // For now, log it to console (in production, use SendGrid/Resend)
    console.log('[Password Reset] ═══════════════════════════════════════')
    console.log('[Password Reset] Reset link for:', user.email)
    console.log('[Password Reset] Link:', resetUrl)
    console.log('[Password Reset] Token expires:', resetTokenExpiry.toISOString())
    console.log('[Password Reset] ═══════════════════════════════════════')

    // In production, send email:
    // await sendPasswordResetEmail(user.email, user.name, resetUrl);

    return NextResponse.json({
      success: true,
      message: 'If an account exists, a reset link has been sent',
      // Remove this in production - for development only:
      devOnly: process.env.NODE_ENV === 'development' ? { resetUrl, token: resetToken } : undefined,
    })

  } catch (error) {
    console.error('[Forgot Password] Error:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}

