import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/nextauth-options'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function DELETE(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Don't allow deleting yourself
    if (params.userId === session.user.id) {
      return NextResponse.json({ 
        error: 'Cannot delete your own account' 
      }, { status: 400 })
    }
    
    // Check if user exists
    const user = await prisma().user.findUnique({
      where: { id: params.userId },
      select: { email: true }
    })
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    // Delete user (Prisma cascades will handle related records)
    await prisma().user.delete({
      where: { id: params.userId }
    })
    
    return NextResponse.json({ 
      ok: true, 
      message: 'User deleted successfully' 
    })
    
  } catch (error: any) {
    console.error('[admin/users/delete] Error:', error)
    return NextResponse.json({ 
      error: error.message || 'Failed to delete user' 
    }, { status: 500 })
  }
}

