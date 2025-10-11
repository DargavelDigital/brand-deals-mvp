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
    
    // Only SUPER admins can impersonate
    if (!session?.user?.isAdmin || session.user.adminRole !== 'SUPER') {
      return NextResponse.json({ 
        error: 'Unauthorized - SUPER admin required' 
      }, { status: 401 })
    }
    
    // Can't impersonate yourself
    if (params.userId === session.user.id) {
      return NextResponse.json({ 
        error: 'Cannot impersonate yourself' 
      }, { status: 400 })
    }
    
    // Get target user
    const user = await prisma().user.findUnique({
      where: { id: params.userId },
      select: {
        id: true,
        email: true,
        name: true
      }
    })
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    // Log impersonation for audit trail - CRITICAL FOR SECURITY
    console.warn(`[ADMIN IMPERSONATE] ${session.user.email} (${session.user.id}) → ${user.email} (${user.id})`)
    
    // Store impersonation in database for audit
    try {
      await prisma().activityLog.create({
        data: {
          workspaceId: (session.user as any).workspaceId || 'system',
          userId: session.user.id!,
          action: 'ADMIN_IMPERSONATE',
          targetId: user.id,
          targetType: 'USER',
          meta: {
            adminEmail: session.user.email,
            targetEmail: user.email,
            timestamp: new Date().toISOString()
          }
        }
      })
    } catch (e) {
      console.error('[IMPERSONATE] Could not log to ActivityLog:', e)
    }
    
    return NextResponse.json({ 
      ok: true,
      message: `Impersonation logged. User: ${user.name || user.email}`,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      note: 'Note: Full impersonation requires session switching (advanced feature). Action has been logged for security audit.'
    })
    
  } catch (error: any) {
    console.error('[admin/impersonate] Error:', error)
    return NextResponse.json({ 
      error: error.message || 'Impersonation failed' 
    }, { status: 500 })
  }
}

