import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/nextauth-options'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const workspaces = await prisma().workspace.findMany({
      include: {
        Membership: {
          include: {
            User_Membership_userIdToUser: {
              select: {
                email: true
              }
            }
          }
        },
        _count: {
          select: {
            Membership: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    
    // Generate CSV
    const csvRows = [
      ['ID', 'Name', 'Slug', 'Suspended', 'Members', 'Plan', 'Created', 'Last Updated'].join(','),
      ...workspaces.map(workspace => {
        const owner = workspace.Membership.find(m => m.role === 'OWNER')
        return [
          workspace.id,
          `"${workspace.name}"`,
          workspace.slug,
          (workspace as any).suspended ? 'Yes' : 'No',
          workspace._count.Membership.toString(),
          workspace.plan,
          new Date(workspace.createdAt).toISOString().split('T')[0],
          new Date(workspace.updatedAt).toISOString().split('T')[0]
        ].join(',')
      })
    ]
    
    const csv = csvRows.join('\n')
    
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="workspaces-export-${new Date().toISOString().split('T')[0]}.csv"`
      }
    })
    
  } catch (error) {
    console.error('[admin/export/workspaces] Error:', error)
    return NextResponse.json({ error: 'Export failed' }, { status: 500 })
  }
}

