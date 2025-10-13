import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/nextauth-options'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, email } = body

    console.log('[Profile] Update request for user:', session.user.id)

    // Check if email is already taken by another user
    if (email !== session.user.email) {
      const existingUser = await prisma().user.findUnique({
        where: { email: email.toLowerCase() },
      })

      if (existingUser && existingUser.id !== session.user.id) {
        return NextResponse.json(
          { error: 'Email already in use' },
          { status: 400 }
        )
      }
    }

    // Update user
    const updatedUser = await prisma().user.update({
      where: { id: session.user.id },
      data: {
        name,
        email: email.toLowerCase(),
        updatedAt: new Date(),
      },
    })

    console.log('[Profile] User updated:', updatedUser.id)

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
      },
    })
  } catch (error) {
    console.error('[Profile] Error:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}

