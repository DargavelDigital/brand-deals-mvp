import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/nextauth-options'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function DELETE(
  req: Request,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Check if workspace exists
    const workspace = await prisma().workspace.findUnique({
      where: { id: params.workspaceId },
      select: { name: true }
    })
    
    if (!workspace) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 })
    }
    
    // Delete workspace (cascade will delete memberships and related data)
    await prisma().workspace.delete({
      where: { id: params.workspaceId }
    })
    
    return NextResponse.json({ 
      ok: true, 
      message: 'Workspace deleted successfully' 
    })
    
  } catch (error: any) {
    console.error('[admin/workspaces/delete] Error:', error)
    return NextResponse.json({ 
      error: error.message || 'Failed to delete workspace' 
    }, { status: 500 })
  }
}

