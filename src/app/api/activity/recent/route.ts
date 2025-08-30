import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/** 
 * Return last 50 activities (newest first) for the current user's workspace.
 */
export async function GET(){
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get current user and workspace
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { memberships: true }
    })

    if (!currentUser || currentUser.memberships.length === 0) {
      return NextResponse.json({ error: 'No workspace access' }, { status: 403 })
    }

    const workspaceId = currentUser.memberships[0].workspaceId

    // Get recent activities
    const activities = await prisma.activityLog.findMany({
      where: { workspaceId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    })

    // Format activities for display
    const items = activities.map(activity => ({
      id: activity.id,
      title: formatActivityTitle(activity.action, activity.user.name || activity.user.email),
      at: activity.createdAt.toISOString(),
      user: activity.user.name || activity.user.email,
      action: activity.action,
      targetType: activity.targetType,
      meta: activity.meta
    }))
  
    return NextResponse.json({ ok: true, data: items })
  } catch (error) {
    console.error('Failed to get recent activities:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function formatActivityTitle(action: string, userName: string): string {
  // Convert action to readable title
  const actionMap: Record<string, string> = {
    'BRAND_RUN_STARTED': 'Brand Run Started',
    'BRAND_RUN_COMPLETED': 'Brand Run Completed',
    'BRAND_RUN_FAILED': 'Brand Run Failed',
    'OUTREACH_STARTED': 'Outreach Started',
    'OUTREACH_SENT': 'Outreach Sent',
    'OUTREACH_REPLIED': 'Outreach Reply Received',
    'MEDIA_PACK_GENERATED': 'Media Pack Generated',
    'MEDIA_PACK_DOWNLOADED': 'Media Pack Downloaded',
    'MEDIA_PACK_SHARED': 'Media Pack Shared',
    'DEAL_CREATED': 'Deal Created',
    'DEAL_UPDATED': 'Deal Updated',
    'DEAL_WON': 'Deal Won',
    'DEAL_LOST': 'Deal Lost',
    'CONTACT_CREATED': 'Contact Created',
    'CONTACT_UPDATED': 'Contact Updated',
    'CONTACT_IMPORTED': 'Contacts Imported',
    'BRAND_CREATED': 'Brand Created',
    'BRAND_UPDATED': 'Brand Updated',
    'BRAND_MATCHED': 'Brand Matched',
    'INVITE_MANAGER': 'Manager Invited',
    'REMOVE_MANAGER': 'Manager Removed'
  }

  return actionMap[action] || `${action.replace(/_/g, ' ')} by ${userName}`
}
