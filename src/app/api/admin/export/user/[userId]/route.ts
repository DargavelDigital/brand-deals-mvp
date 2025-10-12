import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/nextauth-options'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    console.log('[GDPR Export] Starting export for user:', params.userId)
    
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.isAdmin) {
      console.error('[GDPR Export] Unauthorized access attempt')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    console.log('[GDPR Export] Admin verified:', session.user.email)
    
    // Fetch user data with all relationships
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
        }
      }
    })
    
    if (!user) {
      console.error('[GDPR Export] User not found:', params.userId)
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    console.log('[GDPR Export] User found:', user.email)
    
    // Check if user is admin
    let adminStatus = null
    try {
      adminStatus = await prisma().admin.findUnique({
        where: { email: user.email! }
      })
    } catch (e) {
      console.log('[GDPR Export] Admin table not found or user is not admin')
    }
    
    // Try to get accounts
    let accounts = []
    try {
      accounts = await prisma().account.findMany({
        where: { userId: user.id },
        select: {
          provider: true,
          type: true,
          createdAt: true
        }
      })
    } catch (e) {
      console.log('[GDPR Export] No accounts found')
    }
    
    // Build comprehensive export
    const exportData = {
      exportInfo: {
        exportDate: new Date().toISOString(),
        exportedBy: session.user.email,
        dataSubject: user.email,
        exportType: 'GDPR Article 15 - Right to Access',
        jurisdiction: 'GDPR (EU)',
        requestId: `export-${Date.now()}`
      },
      personalData: {
        userId: user.id,
        email: user.email,
        name: user.name,
        emailVerified: user.emailVerified ? user.emailVerified.toISOString() : null,
        profileImage: user.image,
        accountCreated: user.createdAt.toISOString(),
        lastUpdated: user.updatedAt.toISOString(),
        accountStatus: {
          suspended: user.suspended || false,
          suspendedAt: user.suspendedAt ? user.suspendedAt.toISOString() : null,
          suspendedBy: user.suspendedBy,
          suspendReason: user.suspendReason
        }
      },
      workspaceMemberships: user.Membership_Membership_userIdToUser.map((m: any) => ({
        workspaceId: m.Workspace.id,
        workspaceName: m.Workspace.name,
        userRole: m.role,
        joinedAt: m.createdAt.toISOString(),
        workspaceCreated: m.Workspace.createdAt.toISOString()
      })),
      adminPrivileges: adminStatus ? {
        hasAdminAccess: true,
        adminRole: adminStatus.role,
        adminSince: adminStatus.createdAt.toISOString()
      } : {
        hasAdminAccess: false
      },
      authenticationProviders: accounts.map((a: any) => ({
        provider: a.provider,
        accountType: a.type,
        linkedAt: a.createdAt.toISOString()
      })),
      dataProcessingDetails: {
        legalBasis: 'Contract performance (GDPR Art. 6(1)(b)) and Legitimate Interest (GDPR Art. 6(1)(f))',
        processingPurpose: 'Provision of platform services and account management',
        dataRetention: 'Data retained while account is active and for legal requirements after deletion',
        dataRecipients: 'Data processed internally only. No third-party sharing.',
        dataTransfers: 'Data stored in EU region (Neon/Vercel)',
        automatedDecisionMaking: 'No automated decision-making or profiling',
        yourRights: {
          rightToAccess: 'You have received this data export',
          rightToRectification: 'Contact admin to correct inaccurate data',
          rightToErasure: 'Request account deletion via settings or admin',
          rightToRestriction: 'Request processing restriction',
          rightToDataPortability: 'This export provides portable data in JSON format',
          rightToObject: 'Object to data processing where applicable',
          rightToWithdrawConsent: 'Withdraw consent for optional processing',
          rightToComplain: 'Lodge complaint with your data protection authority'
        }
      },
      exportMetadata: {
        totalWorkspaces: user.Membership_Membership_userIdToUser.length,
        totalAuthProviders: accounts.length,
        dataCompleteness: 'Complete',
        exportFormat: 'JSON',
        exportVersion: '1.0',
        generatedTimestamp: new Date().toISOString()
      }
    }
    
    // Log export action
    console.log(`[GDPR Export] Successfully exported data for ${user.email} by admin ${session.user.email}`)
    
    // Create safe filename
    const safeEmail = user.email!.replace(/[^a-z0-9]/gi, '-')
    const filename = `gdpr-export-${safeEmail}-${new Date().toISOString().split('T')[0]}.json`
    
    console.log('[GDPR Export] Generating file:', filename)
    
    // Return JSON with proper download headers
    const jsonString = JSON.stringify(exportData, null, 2)
    
    return new NextResponse(jsonString, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': jsonString.length.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
    
  } catch (error) {
    console.error('[GDPR Export] Fatal error:', error)
    console.error('[GDPR Export] Error details:', error instanceof Error ? error.message : 'Unknown error')
    console.error('[GDPR Export] Stack:', error instanceof Error ? error.stack : 'No stack')
    
    return NextResponse.json({ 
      error: 'Failed to export user data',
      message: error instanceof Error ? error.message : 'Unknown error',
      userId: params.userId
    }, { status: 500 })
  }
}
