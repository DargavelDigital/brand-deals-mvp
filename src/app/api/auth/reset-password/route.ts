import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hash } from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, password } = body

    console.log('[Reset Password] Processing reset request')

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token and password are required' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    // Find valid reset token in VerificationToken table
    let userId: string | undefined

    try {
      const verificationToken = await prisma().verificationToken.findFirst({
        where: {
          token,
          identifier: { startsWith: 'password-reset-' },
          expires: { gt: new Date() },
        },
      })
      
      if (verificationToken) {
        const email = verificationToken.identifier.replace('password-reset-', '')
        console.log('[Reset Password] Found valid token for email:', email)
        
        const user = await prisma().user.findUnique({
          where: { email },
        })
        userId = user?.id
      }
    } catch (e) {
      console.error('[Reset Password] Error finding token:', e)
    }

    if (!userId) {
      console.log('[Reset Password] Invalid or expired token')
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      )
    }

    console.log('[Reset Password] Valid token found for user:', userId)

    // Hash new password
    const hashedPassword = await hash(password, 12)
    console.log('[Reset Password] Password hashed')

    // Update password in Account table
    const updated = await prisma().account.updateMany({
      where: {
        userId: userId,
        provider: 'credentials',
      },
      data: {
        access_token: hashedPassword,
      },
    })

    console.log('[Reset Password] Updated', updated.count, 'account(s)')

    if (updated.count === 0) {
      console.error('[Reset Password] No credentials account found for user:', userId)
      return NextResponse.json(
        { error: 'No password account found for this user' },
        { status: 400 }
      )
    }

    // Delete used token
    try {
      await prisma().verificationToken.deleteMany({
        where: { token },
      })
      console.log('[Reset Password] Token deleted')
    } catch (e) {
      console.error('[Reset Password] Failed to delete token:', e)
    }

    console.log('[Reset Password] Password reset successful for user:', userId)

    return NextResponse.json({
      success: true,
      message: 'Password reset successful',
    })

  } catch (error) {
    console.error('[Reset Password] Error:', error)
    return NextResponse.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    )
  }
}

