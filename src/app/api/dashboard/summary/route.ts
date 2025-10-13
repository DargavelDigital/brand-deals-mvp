import { NextRequest, NextResponse } from 'next/server'
import { requireSessionOrDemo } from '@/lib/auth/requireSessionOrDemo'
import { prisma } from '@/lib/prisma'

/** Dashboard summary - returns workspace-specific metrics */
export async function GET(request: NextRequest) {
  try {
    const auth = await requireSessionOrDemo(request)
    const workspaceId = auth?.workspaceId

    if (!workspaceId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('[Dashboard] Fetching summary for workspace:', workspaceId)

    // Demo workspace - return impressive demo stats
    if (workspaceId === 'demo-workspace') {
      console.log('[Dashboard] Returning demo data')
      return NextResponse.json({
        ok: true,
        data: {
          totalDeals: 24,
          activeOutreach: 8,
          responseRate: 0.68,
          avgDealValue: 2400,
          deltas: { deals: 0.12, outreach: 0.03, response: -0.05, adv: 0.18 }
        }
      })
    }

    // Real users - query actual data from database
    console.log('[Dashboard] Querying real data for workspace:', workspaceId)

    // Count total deals (handle missing table gracefully)
    let totalDeals = 0
    try {
      totalDeals = await prisma().deal.count({ where: { workspaceId } })
    } catch (e) {
      console.log('[Dashboard] Deal table not available:', e)
    }

    // Count active outreach sequences (handle missing table gracefully)
    let activeOutreach = 0
    try {
      activeOutreach = await prisma().outreachSequence.count({
        where: { workspaceId, status: 'ACTIVE' }
      })
    } catch (e) {
      console.log('[Dashboard] OutreachSequence table not available:', e)
    }

    // Calculate response rate (handle missing table gracefully)
    let responseRate = 0
    try {
      const totalSent = await prisma().outreachEmail.count({
        where: { 
          sequence: { workspaceId },
          status: { in: ['SENT', 'DELIVERED'] }
        }
      })

      if (totalSent > 0) {
        const totalReplies = await prisma().outreachEmail.count({
          where: { 
            sequence: { workspaceId },
            status: 'REPLIED'
          }
        })
        responseRate = totalReplies / totalSent
      }
    } catch (e) {
      console.log('[Dashboard] OutreachEmail table not available:', e)
    }

    // Calculate average deal value (handle missing table gracefully)
    let avgDealValue = 0
    try {
      const dealsWithValue = await prisma().deal.findMany({
        where: { 
          workspaceId,
          value: { not: null }
        },
        select: { value: true }
      })

      if (dealsWithValue.length > 0) {
        const totalValue = dealsWithValue.reduce((sum, deal) => sum + (deal.value || 0), 0)
        avgDealValue = totalValue / dealsWithValue.length
      }
    } catch (e) {
      console.log('[Dashboard] Deal value calculation skipped:', e)
    }

    console.log('[Dashboard] Real data:', { 
      totalDeals, 
      activeOutreach, 
      responseRate, 
      avgDealValue 
    })

    return NextResponse.json({
      ok: true,
      data: {
        totalDeals,
        activeOutreach,
        responseRate,
        avgDealValue,
        deltas: { 
          deals: 0,      // TODO: Calculate month-over-month growth
          outreach: 0,   // TODO: Calculate growth
          response: 0,   // TODO: Calculate growth
          adv: 0         // TODO: Calculate growth
        }
      }
    })

  } catch (error) {
    console.error('[Dashboard] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}
