import { prisma } from '@/lib/prisma'
import { PLAN_LIMITS } from './entitlements'
import type { CreditKind, Plan } from '@prisma/client'

export class EntitlementError extends Error {
  public upsell?: { reason: string; kind: 'AI' | 'EMAIL'; needed: number }
  constructor(message: string, upsell?: EntitlementError['upsell']) {
    super(message); this.upsell = upsell
  }
}

async function ledger(workspaceId: string, kind: CreditKind, delta: number, reason: string, ref?: string) {
  return prisma().$transaction(async (tx) => {
    const ws = await tx.workspace.findUnique({ where: { id: workspaceId } })
    if (!ws) throw new Error('workspace not found')

    const next = kind === 'AI' ? ws.aiTokensBalance + delta : ws.emailBalance + delta
    const updated = await tx.workspace.update({
      where: { id: workspaceId },
      data: kind === 'AI' ? { aiTokensBalance: next } : { emailBalance: next },
    })
    await tx.creditLedger.create({
      data: { workspaceId, kind, delta, reason, ref, balanceAfter: next }
    })
    return updated
  })
}

export async function checkAndConsumeAI(workspaceId: string, tokens: number, ref: string) {
  const ws = await prisma().workspace.findUnique({ where: { id: workspaceId } })
  if (!ws) throw new Error('workspace not found')
  const limits = PLAN_LIMITS[ws.plan]

  // Monthly cap by plan (do NOT decrement plan cap here; we consume from balance+cap via logic)
  // Simple policy: require either balance >= tokens OR (balance + remainingPlanCap) >= tokens.
  // Track remaining plan cap implicitly via: (cap - sum(consumed in ledger this period of kind AI where delta<0 and reason startsWith 'ai.'))
  const start = ws.periodStart ?? new Date(Date.now() - 30*24*3600*1000)
  const consumedThisPeriod = await prisma().creditLedger.aggregate({
    _sum: { delta: true },
    where: {
      workspaceId,
      kind: 'AI',
      delta: { lt: 0 },
      createdAt: { gte: start },
      reason: { startsWith: 'ai.' }
    }
  })
  const usedAbs = Math.abs(consumedThisPeriod._sum.delta ?? 0)
  const remainingPlan = Math.max(limits.aiTokensMonthly - usedAbs, 0)
  const available = ws.aiTokensBalance + remainingPlan

  if (available < tokens) {
    throw new EntitlementError('AI token limit reached', { reason: 'ai', kind: 'AI', needed: tokens - available })
  }

  // Prefer consuming from balance; then from plan (record negative ledger but not change balance)
  const fromBalance = Math.min(ws.aiTokensBalance, tokens)
  if (fromBalance > 0) {
    await ledger(workspaceId, 'AI', -fromBalance, 'ai.consume.balance', ref)
  }
  const fromPlan = tokens - fromBalance
  if (fromPlan > 0) {
    await prisma().creditLedger.create({
      data: { workspaceId, kind: 'AI', delta: -fromPlan, reason: 'ai.consume.plan', ref, balanceAfter: ws.aiTokensBalance - fromBalance }
    })
  }
}

export async function checkAndConsumeEmail(workspaceId: string, count: number, ref: string) {
  const ws = await prisma().workspace.findUnique({ where: { id: workspaceId } })
  if (!ws) throw new Error('workspace not found')
  const limits = PLAN_LIMITS[ws.plan]

  if ((ws.emailDailyUsed + count) > limits.emailsPerDay && ws.emailBalance < count) {
    throw new EntitlementError('Daily email limit reached', { reason: 'email.daily', kind: 'EMAIL', needed: count })
  }

  // If daily cap hit, consume credits; otherwise just increment dailyUsed
  if ((ws.emailDailyUsed + count) > limits.emailsPerDay) {
    await ledger(workspaceId, 'EMAIL', -count, 'email.consume.balance', ref)
  } else {
    await prisma().workspace.update({
      where: { id: workspaceId },
      data: { emailDailyUsed: { increment: count } }
    })
    await prisma().creditLedger.create({
      data: { workspaceId, kind: 'EMAIL', delta: -count, reason: 'email.consume.plan', ref, balanceAfter: ws.emailBalance }
    })
  }
}
