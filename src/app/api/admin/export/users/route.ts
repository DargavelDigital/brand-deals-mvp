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
    
    const users = await prisma().user.findMany({
      include: {
        Membership_Membership_userIdToUser: {
          include: {
            Workspace: { select: { name: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    
    // Get admin info for each user
    const usersWithAdmin = await Promise.all(
      users.map(async (user) => {
        const admin = await prisma().admin.findUnique({
          where: { email: user.email! },
          select: { role: true }
        }).catch(() => null)
        return { ...user, admin }
      })
    )
    
    // Generate CSV
    const csvRows = [
      ['ID', 'Name', 'Email', 'Email Verified', 'Suspended', 'Role', 'Workspaces', 'Created', 'Last Updated'].join(','),
      ...usersWithAdmin.map(user => [
        user.id,
        `"${user.name || ''}"`,
        user.email || '',
        user.emailVerified ? 'Yes' : 'No',
        (user as any).suspended ? 'Yes' : 'No',
        user.admin ? user.admin.role : 'USER',
        user.Membership_Membership_userIdToUser.length.toString(),
        new Date(user.createdAt).toISOString().split('T')[0],
        new Date(user.updatedAt).toISOString().split('T')[0]
      ].join(','))
    ]
    
    const csv = csvRows.join('\n')
    
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="users-export-${new Date().toISOString().split('T')[0]}.csv"`
      }
    })
    
  } catch (error) {
    console.error('[admin/export/users] Error:', error)
    return NextResponse.json({ error: 'Export failed' }, { status: 500 })
  }
}

