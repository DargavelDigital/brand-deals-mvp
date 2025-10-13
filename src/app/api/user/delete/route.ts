import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/nextauth-options'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('[Delete Account] Deleting user:', session.user.id, session.user.email)

    // Delete user (will cascade delete memberships, accounts, etc. if configured in Prisma schema)
    await prisma().user.delete({
      where: { id: session.user.id },
    })

    console.log('[Delete Account] User deleted successfully:', session.user.id)

    return NextResponse.json({
      success: true,
      message: 'Account deleted successfully',
    })
  } catch (error) {
    console.error('[Delete Account] Error:', error)
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    )
  }
}

