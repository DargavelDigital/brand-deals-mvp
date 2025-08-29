import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireSessionOrDemo } from '@/lib/authz'
import { PLAN_LIMITS } from '@/services/billing/entitlements'

export async function GET(req: NextRequest) {
  try {
    const { workspaceId } = await requireSessionOrDemo(req)
    
    const ws = await prisma.workspace.findUnique({ 
      where: { id: workspaceId },
      select: {
        plan: true,
        periodStart: true,
        periodEnd: true,
        aiTokensBalance: true,
        emailBalance: true,
        emailDailyUsed: true,
      }
    })
    
    if (!ws) {
      // In demo mode, return default data
      if (workspaceId === 'demo-workspace') {
        return NextResponse.json({
          plan: 'FREE',
          periodStart: new Date(),
          periodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          aiTokensBalance: 10000,
          emailBalance: 100,
          emailDailyUsed: 0,
          limits: PLAN_LIMITS.FREE,
        })
      }
      return NextResponse.json({ error: 'workspace not found' }, { status: 404 })
    }

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
  } catch (error) {
    if (error instanceof Response) throw error
    return NextResponse.json({ error: 'internal server error' }, { status: 500 })
  }
}
