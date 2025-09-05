import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireSessionOrDemo } from '@/lib/auth/requireSessionOrDemo' // adjust import if your helper differs

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

function J(status: number, body: any) {
  return NextResponse.json(body, { status })
}

function ok(payload: any) {
  return J(200, { ok: true, ...payload })
}

function empty(meta?: Record<string, any>) {
  return ok({ totalCount: 0, items: [], meta })
}

function classifyError(e: unknown) {
  const msg = e instanceof Error ? e.message : String(e)
  if (
    msg.includes('URL must start with the protocol `prisma://`') ||
    msg.includes('prisma+postgres://')
  ) return 'PRISMA_ENGINE_URL_PROTOCOL'
  if (msg.includes('ECONN') || msg.includes('connect') || msg.includes('TLS')) return 'DB_CONNECTION'
  return 'INTERNAL_ERROR'
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  const diag = url.searchParams.get('diag') === '1'

  try {
    const session = await requireSessionOrDemo({ redirect: false })
    const user = session?.user?.email ?? null
    const workspaceId = session?.workspace?.id ?? null

    if (diag) {
      return ok({
        diag: true,
        user,
        workspaceId,
        prismaClientVersion: (prisma as any)?._clientVersion ?? 'unknown',
      })
    }

    // No workspace? Return safe empty — do NOT throw.
    if (!workspaceId) return empty({ reason: 'NO_WORKSPACE' })

    // IMPORTANT: Use the real model name you have. If you don't have `activity`,
    // change this to your actual model (e.g., `activityLog`, `event`, etc).
    // Also keep selection lean to avoid large payloads.
    const [totalCount, activities] = await Promise.all([
      prisma.activityLog.count({ where: { workspaceId } }), // <-- using activityLog as per existing schema
      prisma.activityLog.findMany({                      // <-- using activityLog as per existing schema
        where: { workspaceId },
        orderBy: { createdAt: 'desc' },
        take: 50,
        select: {
          id: true,
          action: true,
          targetType: true,
          createdAt: true,
          userId: true,
          meta: true,
          user: {
            select: {
              id: true,
              email: true,
              name: true
            }
          }
        },
      }),
    ])

    // Format activities for display (preserving existing formatting logic)
    const items = activities.map(activity => ({
      id: activity.id,
      title: formatActivityTitle(activity.action, activity.user.name || activity.user.email || 'Unknown User'),
      at: activity.createdAt.toISOString(),
      user: activity.user.name || activity.user.email,
      action: activity.action,
      targetType: activity.targetType,
      meta: activity.meta
    }))

    return ok({ totalCount, items })
  } catch (e) {
    // Never explode the UI: return an empty, OK shape + meta.errorCode
    return empty({ errorCode: classifyError(e) })
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
