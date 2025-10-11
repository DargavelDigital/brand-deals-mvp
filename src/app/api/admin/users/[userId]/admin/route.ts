import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/nextauth-options'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    // Only SUPER admins can manage admin roles
    if (!session?.user?.isAdmin || session.user.adminRole !== 'SUPER') {
      return NextResponse.json({ 
        error: 'Only SUPER admins can manage admin roles' 
      }, { status: 401 })
    }
    
    const { action, role } = await req.json()
    
    if (action === 'promote') {
      // Get user email
      const user = await prisma().user.findUnique({
        where: { id: params.userId },
        select: { email: true }
      })
      
      if (!user?.email) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }
      
      // Check if already admin
      const existingAdmin = await prisma().admin.findUnique({
        where: { email: user.email }
      })
      
      if (existingAdmin) {
        return NextResponse.json({ 
          error: 'User is already an admin' 
        }, { status: 400 })
      }
      
      // Create admin record
      await prisma().admin.create({
        data: {
          email: user.email,
          role: role || 'SUPPORT' // Default to SUPPORT role
        }
      })
      
      return NextResponse.json({ 
        ok: true, 
        message: 'User promoted to admin' 
      })
      
    } else if (action === 'demote') {
      // Don't allow demoting yourself
      const user = await prisma().user.findUnique({
        where: { id: params.userId },
        select: { email: true, id: true }
      })
      
      if (user?.id === session.user.id) {
        return NextResponse.json({ 
          error: 'Cannot demote yourself' 
        }, { status: 400 })
      }
      
      if (!user?.email) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }
      
      // Delete admin record
      await prisma().admin.delete({
        where: { email: user.email }
      })
      
      return NextResponse.json({ 
        ok: true, 
        message: 'Admin access removed' 
      })
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    
  } catch (error: any) {
    console.error('[admin/users/admin] Error:', error)
    return NextResponse.json({ 
      error: error.message || 'Failed to update admin status' 
    }, { status: 500 })
  }
}

