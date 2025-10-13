import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/nextauth-options'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { compare, hash } from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { currentPassword, newPassword } = body

    console.log('[Password] Change request for user:', session.user.id)

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Current and new password are required' },
        { status: 400 }
      )
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'New password must be at least 8 characters' },
        { status: 400 }
      )
    }

    // Get current password from Account table
    const account = await prisma().account.findFirst({
      where: {
        userId: session.user.id,
        provider: 'credentials',
      },
    })

    if (!account || !account.access_token) {
      return NextResponse.json(
        { error: 'No password set for this account' },
        { status: 400 }
      )
    }

    // Verify current password
    const isValid = await compare(currentPassword, account.access_token)

    if (!isValid) {
      console.log('[Password] Current password verification failed')
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 400 }
      )
    }

    console.log('[Password] Current password verified')

    // Hash new password
    const hashedPassword = await hash(newPassword, 12)

    // Update password
    await prisma().account.update({
      where: { id: account.id },
      data: {
        access_token: hashedPassword,
      },
    })

    console.log('[Password] Password changed successfully for user:', session.user.id)

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully',
    })
  } catch (error) {
    console.error('[Password] Error:', error)
    return NextResponse.json(
      { error: 'Failed to change password' },
      { status: 500 }
    )
  }
}

