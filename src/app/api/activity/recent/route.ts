import { NextResponse, type NextRequest } from 'next/server'
import { requireSessionOrDemo } from '@/lib/auth/requireSessionOrDemo'
import { prisma } from '@/lib/prisma'

/** 
 * Return last 50 activities (newest first) for the current user's workspace.
 */
export async function GET(req: NextRequest){
  try {
    let realWorkspaceId = await requireSessionOrDemo(req);
    if (realWorkspaceId instanceof NextResponse) return realWorkspaceId;

    // If no workspaceId returned, look for demo workspace
    if (!realWorkspaceId) {
      console.log('Activity recent: no workspaceId returned, looking for demo workspace');
      const demoWorkspace = await prisma.workspace.findUnique({
        where: { slug: 'demo-workspace' }
      });
      if (demoWorkspace) {
        realWorkspaceId = demoWorkspace.id;
        console.log('Activity recent: found demo workspace, using ID:', realWorkspaceId);
      } else {
        console.log('Activity recent: demo workspace not found, creating new one');
        const newDemoWorkspace = await prisma.workspace.create({
          data: {
            slug: 'demo-workspace',
            name: 'Demo Workspace'
          }
        });
        realWorkspaceId = newDemoWorkspace.id;
        console.log('Activity recent: created demo workspace, using ID:', realWorkspaceId);
      }
    }

    // Ensure we have a valid workspace ID
    if (!realWorkspaceId) {
      return NextResponse.json(
        { ok: false, error: 'Unable to resolve workspace ID' },
        { status: 400 }
      );
    }

    // Get recent activities
    const activities = await prisma.activityLog.findMany({
      where: { workspaceId: realWorkspaceId },
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
      title: formatActivityTitle(activity.action, activity.user.name || activity.user.email || 'Unknown User'),
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
