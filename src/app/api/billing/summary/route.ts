import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireSessionOrDemo } from '@/lib/authz'
import { PLAN_LIMITS } from '@/services/billing/entitlements'

export const dynamic = 'force-dynamic' // ensure Node runtime on Netlify, not edge
export const runtime = 'nodejs'        // avoid edge for Prisma

export async function GET(req: NextRequest) {
  const traceId = crypto.randomUUID()
  try {
    const { workspaceId } = await requireSessionOrDemo(req)
    
    // In demo mode, return default data
    if (workspaceId === 'demo-workspace') {
      return NextResponse.json({
        ok: true,
        traceId,
        workspace: {
          plan: 'FREE',
          periodStart: new Date(),
          periodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          aiTokensBalance: 10000,
          emailBalance: 100,
          emailDailyUsed: 0,
        },
        limits: PLAN_LIMITS.FREE,
        tokensUsed: 5000,
        tokensLimit: 100000,
        emailsUsed: 5,
        emailsLimit: 500
      })
    }

    // Try to get real workspace data
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
    }).catch(() => null)
    
    if (!ws) {
      return NextResponse.json({
        ok: false,
        traceId,
        error: 'WORKSPACE_NOT_FOUND',
        workspace: {
          plan: 'FREE',
          periodStart: new Date(),
          periodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          aiTokensBalance: 0,
          emailBalance: 0,
          emailDailyUsed: 0,
        },
        limits: PLAN_LIMITS.FREE,
        tokensUsed: 0,
        tokensLimit: 100000,
        emailsUsed: 0,
        emailsLimit: 500
      })
    }

    const limits = PLAN_LIMITS[ws.plan]
    const tokensUsed = limits.aiTokensMonthly - (ws.aiTokensBalance || 0)
    const emailsUsed = ws.emailDailyUsed || 0
    
    return NextResponse.json({
      ok: true,
      traceId,
      workspace: ws,
      limits,
      tokensUsed: Math.max(0, tokensUsed),
      tokensLimit: limits.aiTokensMonthly,
      emailsUsed,
      emailsLimit: limits.emailsPerDay
    })
  } catch (err: any) {
    console.error('[billing.summary]', traceId, err?.message || err)
    return NextResponse.json(
      { 
        ok: false, 
        traceId, 
        error: 'BILLING_SUMMARY_FAILED',
        workspace: {
          plan: 'FREE',
          periodStart: new Date(),
          periodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          aiTokensBalance: 0,
          emailBalance: 0,
          emailDailyUsed: 0,
        },
        limits: PLAN_LIMITS.FREE,
        tokensUsed: 0,
        tokensLimit: 100000,
        emailsUsed: 0,
        emailsLimit: 500
      },
      { status: 500 }
    )
  }
}
