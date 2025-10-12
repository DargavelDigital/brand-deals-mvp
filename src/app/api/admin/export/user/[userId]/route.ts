import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/nextauth-options'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Fetch complete user data
    const user = await prisma().user.findUnique({
      where: { id: params.userId },
      include: {
        Membership_Membership_userIdToUser: {
          include: {
            Workspace: {
              select: {
                id: true,
                name: true,
                createdAt: true
              }
            }
          }
        },
        Account: {
          select: {
            provider: true,
            type: true,
            createdAt: true
          }
        }
      }
    })
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    // Check if user is admin
    let adminStatus = null
    try {
      adminStatus = await prisma().admin.findUnique({
        where: { email: user.email! }
      })
    } catch (e) {
      // Admin table might not exist
    }
    
    // Build comprehensive export
    const exportData = {
      exportInfo: {
        exportDate: new Date().toISOString(),
        exportedBy: session.user.email,
        dataSubject: user.email,
        exportType: 'GDPR Article 15 - Right to Access'
      },
      personalData: {
        id: user.id,
        email: user.email,
        name: user.name,
        emailVerified: user.emailVerified,
        image: user.image,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        suspended: user.suspended || false,
        suspendedAt: user.suspendedAt,
        suspendedBy: user.suspendedBy
      },
      workspaces: user.Membership_Membership_userIdToUser.map((m: any) => ({
        workspaceId: m.Workspace.id,
        workspaceName: m.Workspace.name,
        role: m.role,
        joinedAt: m.createdAt,
        workspaceCreatedAt: m.Workspace.createdAt
      })),
      adminStatus: adminStatus ? {
        isAdmin: true,
        role: adminStatus.role,
        grantedAt: adminStatus.createdAt
      } : {
        isAdmin: false
      },
      authenticationMethods: user.Account.map((a: any) => ({
        provider: a.provider,
        type: a.type,
        addedAt: a.createdAt
      })),
      dataProcessingInformation: {
        legalBasis: 'Contract performance and legitimate interest',
        retentionPeriod: 'Account data retained while account is active',
        dataRecipients: 'Internal systems only',
        rightsInformation: 'You have the right to rectification, erasure, restriction, and portability'
      }
    }
    
    // Log the export action
    console.log(`[GDPR Export] Admin ${session.user.email} exported data for user ${user.email}`)
    
    // Return as downloadable JSON
    const filename = `gdpr-export-${user.email!.replace('@', '-at-')}-${new Date().toISOString().split('T')[0]}.json`
    
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    })
    
  } catch (error) {
    console.error('[admin/export/user] Error:', error)
    return NextResponse.json({ 
      error: 'Failed to export user data' 
    }, { status: 500 })
  }
}

