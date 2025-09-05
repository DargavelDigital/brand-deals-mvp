import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireSessionOrDemo } from '@/lib/auth/requireSessionOrDemo' // adapted to existing helper
import { z } from 'zod'

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

function json(status: number, body: any) {
  return NextResponse.json(body, { status })
}

function mapPrismaError(e: unknown) {
  const msg = e instanceof Error ? e.message : String(e)
  if (msg.includes('URL must start with the protocol `prisma://`') || msg.includes('prisma+postgres://')) {
    return json(500, { ok: false, error: 'PRISMA_ENGINE_URL_PROTOCOL' })
  }
  return json(500, { ok: false, error: 'INTERNAL_ERROR' })
}

/**
 * Optional diagnostics:
 * /api/activity/recent?diag=1
 * Returns session + workspace info and Prisma client version, no secrets.
 */
async function diagnostics(userEmail: string | null, workspaceId: string | null) {
  return json(200, {
    ok: true,
    diag: true,
    user: userEmail,
    workspaceId,
    prismaClientVersion: (prisma as any)?._clientVersion ?? 'unknown',
  })
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const diag = searchParams.get('diag') === '1'

    // Resolve session (no redirect, no throw)
    const session = await requireSessionOrDemo({ redirect: false })
    const userEmail = session?.user?.email ?? null
    const workspaceId = session?.workspace?.id ?? null

    if (diag) {
      return diagnostics(userEmail, workspaceId)
    }

    // If no workspace, return a safe empty payload (prevents 500 + keeps UI happy)
    if (!workspaceId) {
      return json(200, {
        ok: true,
        totalCount: 0,
        items: [],
      })
    }

    // Minimal, safe reads — using activityLog model as per existing schema
    const [totalCount, activities] = await Promise.all([
      prisma.activityLog.count({ where: { workspaceId } }),
      prisma.activityLog.findMany({
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

    return json(200, {
      ok: true,
      totalCount,
      items,
    })
  } catch (e) {
    return mapPrismaError(e)
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
