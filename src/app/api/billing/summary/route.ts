import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth/session'
import { PLAN_LIMITS } from '@/services/billing/entitlements'

export async function GET() {
  const user = await getCurrentUser()
  if (!user?.workspaceId) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
  const ws = await prisma.workspace.findUnique({ where: { id: user.workspaceId } })
  if (!ws) return NextResponse.json({ error: 'workspace not found' }, { status: 404 })

  const limits = PLAN_LIMITS[ws.plan]
  return NextResponse.json({
    plan: ws.plan,
    periodStart: ws.periodStart,
    periodEnd: ws.periodEnd,
    aiTokensBalance: ws.aiTokensBalance,
    emailBalance: ws.emailBalance,
    emailDailyUsed: ws.emailDailyUsed,
    limits,
  })
}
