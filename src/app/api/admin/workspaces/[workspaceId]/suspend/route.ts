import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/nextauth-options'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(
  req: Request,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { suspend, reason } = await req.json()
    
    // Update workspace suspension status
    const workspace = await prisma().workspace.update({
      where: { id: params.workspaceId },
      data: {
        suspended: suspend,
        suspendedAt: suspend ? new Date() : null,
        suspendedBy: suspend ? session.user.id : null,
        suspendReason: suspend ? reason : null,
        updatedAt: new Date()
      }
    })
    
    return NextResponse.json({ 
      ok: true, 
      message: suspend ? 'Workspace suspended' : 'Workspace activated',
      workspace 
    })
    
  } catch (error: any) {
    console.error('[admin/workspaces/suspend] Error:', error)
    return NextResponse.json({ 
      error: error.message || 'Failed to update workspace status' 
    }, { status: 500 })
  }
}

