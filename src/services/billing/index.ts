import { getStripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { env } from '@/lib/env';
import { PLAN_LIMITS, TOPUP_GRANTS } from './entitlements'
import type { Plan, CreditKind } from '@prisma/client'

export async function ensureStripeCustomer(workspaceId: string) {
  const ws = await prisma.workspace.findUnique({ where: { id: workspaceId } })
  if (!ws) throw new Error('Workspace not found')
  if (ws.stripeCustomerId) return ws.stripeCustomerId

  const stripe = getStripe()
  const customer = await stripe.customers.create({
    metadata: { workspaceId },
    name: ws.name,
  })
  await prisma.workspace.update({ where: { id: workspaceId }, data: { stripeCustomerId: customer.id } })
  return customer.id
}

export async function createPortalSession(workspaceId: string) {
  const customer = await ensureStripeCustomer(workspaceId)
  const url = env.BILLING_PUBLIC_URL || 'http://localhost:3000'
  const stripe = getStripe()
  const session = await stripe.billingPortal.sessions.create({
    customer,
    return_url: `${url}/settings/billing`,
  })
  return session.url
}

// Generic Checkout for top-ups (one-time)
export async function createTopupCheckout(workspaceId: string, lookupKey: string) {
  const customer = await ensureStripeCustomer(workspaceId)
  const stripe = getStripe()
  const price = (await stripe.prices.list({ lookup_keys: [lookupKey], expand: ['data.product'] })).data[0]
  if (!price) throw new Error('Price not found')

  const url = env.BILLING_PUBLIC_URL || 'http://localhost:3000'
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer,
    line_items: [{ price: price.id, quantity: 1 }],
    success_url: `${url}/settings/billing?success=1`,
    cancel_url: `${url}/settings/billing?canceled=1`,
    metadata: { workspaceId },
  })
  return session.url!
}

// Internal: apply credit to workspace & ledger
export async function grantCredit(workspaceId: string, kind: CreditKind, amount: number, reason: string) {
  return prisma.$transaction(async (tx) => {
    const ws = await tx.workspace.findUnique({ where: { id: workspaceId } })
    if (!ws) throw new Error('Workspace not found')
    const next = kind === 'AI' ? ws.aiTokensBalance + amount : ws.emailBalance + amount
    const updated = await tx.workspace.update({
      where: { id: workspaceId },
      data: kind === 'AI' ? { aiTokensBalance: next } : { emailBalance: next },
    })
    await tx.creditLedger.create({
      data: {
        workspaceId,
        kind,
        delta: amount,
        reason,
        ref: undefined,
        balanceAfter: kind === 'AI' ? updated.aiTokensBalance : updated.emailBalance,
      },
    })
    return updated
  })
}
