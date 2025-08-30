// Ensure Node runtime (Prisma/Stripe cannot run on edge)
export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { safe } from '@/lib/api/safeHandler'

function mockSummary(ok = true) {
  const now = new Date()
  const end = new Date(now)
  end.setMonth(now.getMonth() + 1)

  return {
    ok, // <— we will send ok:true for disabled billing
    workspace: {
      plan: 'FREE',
      periodStart: now.toISOString(),
      periodEnd: end.toISOString(),
      aiTokensBalance: 0,
      emailBalance: 0,
      emailDailyUsed: 0,
    },
    limits: {
      aiTokensMonthly: 100_000,
      emailsPerDay: 20,
      maxContacts: 500,
    },
    tokensUsed: 0,
    tokensLimit: 100_000,
    emailsUsed: 0,
    emailsLimit: 500,
  }
}

export const GET = safe(async () => {
  const traceId = randomUUID()

  try {
    // If billing isn't enabled or keys are missing, return a healthy FREE summary
    if (
      process.env.FEATURE_BILLING_ENABLED !== 'true' ||
      !process.env.STRIPE_SECRET_KEY
    ) {
      return NextResponse.json({
        ok: true,
        disabled: true,
        plan: "FREE",
        usage: { aiTokens: 0, emails: 0 },
        limits: { aiTokensMonthly: 100000, emailsPerDay: 20, maxContacts: 500 }
      }, { status: 200 })
    }

    // --- Real implementation (Stripe/Prisma) goes here behind flags ---
    // const wsId = await resolveWorkspaceIdFromAuth()
    // const summary = await computeBillingSummary(wsId)
    // return NextResponse.json({ ok: true, traceId, ...summary }, { status: 200 })

    return NextResponse.json(
      { traceId, ...mockSummary(true), mode: 'mock' },
        { status: 200 }
      )
  } catch (err: any) {
    console.error('BILLING_SUMMARY_FAILED', traceId, err?.message, err)
    // Return a healthy mock instead of a 500 so the page never errors
    return NextResponse.json(
      { traceId, ...mockSummary(true), mode: 'mock-fallback' },
        { status: 200 }
      )
  }
}, { route: '/api/billing/summary' })
