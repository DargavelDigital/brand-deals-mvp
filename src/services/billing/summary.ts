import { prisma } from '@/src/lib/db'

const FALLBACK_LIMITS = { aiTokensMonthly: 100000, emailsPerDay: 20, maxContacts: 500 }

export async function getBillingSummary() {
  // Hard gate on envs missing -> return safe defaults, not throw
  const stripeKey = process.env.STRIPE_SECRET_KEY
  const billingEnabled = process.env.FEATURE_BILLING_ENABLED === 'true'

  let workspacePlan = 'FREE'
  let periodStart = new Date()
  let periodEnd = new Date(Date.now() + 302460601000)

  let tokensUsed = 0
  let emailsUsed = 0

  // Optional: try reading workspace row; if columns missing, catch and keep defaults
  try {
    // If you have a current workspace context helper, use that instead:
    // const ws = await currentWorkspace()
    const ws = await prisma.workspace.findFirst({ 
      select: { 
        plan: true, 
        periodStart: true, 
        periodEnd: true,
        aiTokensBalance: true,
        emailBalance: true,
        emailDailyUsed: true
      } 
    })
    if (ws?.plan) workspacePlan = ws.plan
    if (ws?.periodStart) periodStart = ws.periodStart as any
    if (ws?.periodEnd) periodEnd = ws.periodEnd as any
    if (ws?.aiTokensBalance !== undefined) tokensUsed = ws.aiTokensBalance
    if (ws?.emailBalance !== undefined) emailsUsed = ws.emailBalance
    if (ws?.emailDailyUsed !== undefined) emailsUsed = ws.emailDailyUsed
  } catch {}

  // If Stripe disabled/misconfigured, return safe summary without throwing
  if (!billingEnabled || !stripeKey) {
    return {
      ok: true,
      plan: workspacePlan,
      periodStart,
      periodEnd,
      tokensUsed,
      tokensLimit: FALLBACK_LIMITS.aiTokensMonthly,
      emailsUsed,
      emailsLimit: FALLBACK_LIMITS.emailsPerDay,
      limits: FALLBACK_LIMITS,
    }
  }

  // Stripe path (wrap in try/catch, never throw outward)
  try {
    // … call Stripe and compute totals …
    return {
      ok: true,
      plan: workspacePlan,
      periodStart,
      periodEnd,
      tokensUsed,
      tokensLimit: FALLBACK_LIMITS.aiTokensMonthly,
      emailsUsed,
      emailsLimit: FALLBACK_LIMITS.emailsPerDay,
      limits: FALLBACK_LIMITS,
    }
  } catch {
    // Don't propagate errors—return soft-fail with defaults so UI works
    return {
      ok: false,
      error: 'BILLING_SUMMARY_FAILED',
      plan: workspacePlan,
      periodStart,
      periodEnd,
      tokensUsed,
      tokensLimit: FALLBACK_LIMITS.aiTokensMonthly,
      emailsUsed,
      emailsLimit: FALLBACK_LIMITS.emailsPerDay,
      limits: FALLBACK_LIMITS,
    }
  }
}
