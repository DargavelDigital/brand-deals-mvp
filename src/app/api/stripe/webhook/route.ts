import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { TOPUP_GRANTS } from '@/services/billing/entitlements'
import { grantCredit } from '@/services/billing'
import type Stripe from 'stripe'
import { env } from '@/lib/env'
import { log } from '@/lib/log'
import { withRequestContext } from '@/lib/with-request-context'

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

async function handlePOST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature') || ''
  const secret = env.STRIPE_WEBHOOK_SECRET!
  const buf = Buffer.from(await req.arrayBuffer())

  let evt: Stripe.Event
  try {
    const stripe = getStripe()
    evt = stripe.webhooks.constructEvent(buf, sig, secret)
    log.info('Stripe webhook received', { eventType: evt.type, eventId: evt.id, feature: 'stripe-webhook' });
  } catch (err: any) {
    log.error('Stripe webhook signature verification failed', { error: err.message, feature: 'stripe-webhook' });
    return NextResponse.json({ error: `Webhook signature failed: ${err.message}` }, { status: 400 })
  }

  switch (evt.type) {
    case 'checkout.session.completed': {
      const session = evt.data.object as Stripe.Checkout.Session
      const workspaceId = (session.metadata?.workspaceId as string) || null
      if (!workspaceId) {
        log.warn('Checkout session completed without workspaceId', { sessionId: session.id, feature: 'stripe-webhook' });
        break;
      }
      
      log.info('Processing checkout session completion', { sessionId: session.id, workspaceId, feature: 'stripe-webhook' });
      
      // For each line item, resolve lookup_key and grant credits
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { expand: ['data.price'] })
      for (const li of lineItems.data) {
        const price = li.price as Stripe.Price
        const lk = (price.lookup_key as string) || null
        if (!lk) continue
        const grant = TOPUP_GRANTS[lk]
        if (grant) {
          await grantCredit(workspaceId, grant.kind, grant.amount, `stripe.topup:${lk}`)
          log.info('Credits granted', { workspaceId, grantKind: grant.kind, amount: grant.amount, feature: 'stripe-webhook' });
        }
      }
      break
    }

    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const sub = evt.data.object as Stripe.Subscription
      const customerId = sub.customer as string
      const ws = await prisma.workspace.findFirst({ where: { stripeCustomerId: customerId } })
      if (!ws) {
        log.warn('Subscription event for unknown customer', { customerId, subscriptionId: sub.id, feature: 'stripe-webhook' });
        break;
      }

      log.info('Processing subscription update', { subscriptionId: sub.id, workspaceId: ws.id, feature: 'stripe-webhook' });

      // Map first price lookup_key to plan enum
      const item = sub.items.data[0]
      const price = await stripe.prices.retrieve(item.price.id)
      const lookup = price.lookup_key || ''
      const toPlan = lookup.includes('team') ? 'TEAM' : lookup.includes('pro') ? 'PRO' : 'FREE'

      await prisma.workspace.update({
        where: { id: ws.id },
        data: {
          plan: toPlan as any,
          stripeSubId: sub.id,
          // reset period window (Stripe's current_period_end)
          periodStart: new Date(sub.current_period_start * 1000),
          periodEnd: new Date(sub.current_period_end * 1000),
          // monthly plan cap credit: we keep in plan limits; balances stay for top-ups only
        }
      })
      
      log.info('Workspace plan updated', { workspaceId: ws.id, newPlan: toPlan, feature: 'stripe-webhook' });
      break
    }

    default:
      // ignore
      break
  }

  log.info('Stripe webhook processed successfully', { eventType: evt.type, feature: 'stripe-webhook' });
  return NextResponse.json({ received: true })
}

export const POST = withRequestContext(handlePOST);
