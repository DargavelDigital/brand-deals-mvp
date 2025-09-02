export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getStripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';

function planFromPriceId(priceId?: string | null): 'FREE' | 'PRO' | 'AGENCY' | null {
  if (!priceId) return null;
  const pro = process.env.STRIPE_PRICE_PRO;
  const agency = process.env.STRIPE_PRICE_AGENCY;
  if (priceId === pro) return 'PRO';
  if (priceId === agency) return 'AGENCY';
  return null;
}

export async function POST(req: Request) {
  const sig = headers().get('stripe-signature');
  const whSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!sig || !whSecret) return NextResponse.json({ received: true });

  let event: any;
  try {
    const buf = await req.text();
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(buf, sig, whSecret);
  } catch (err: any) {
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const sub = event.data.object;
        const customerId = sub.customer as string;
        const priceId = sub.items?.data?.[0]?.price?.id as string | undefined;
        const plan = planFromPriceId(priceId);
        if (plan && customerId) {
          // find workspace by stripeCustomerId
          const ws = await prisma.workspace.findFirst({
            where: { stripeCustomerId: customerId },
            select: { id: true },
          });
          if (ws) {
            await prisma.workspace.update({
              where: { id: ws.id },
              data: { plan },
            });
          }
        }
        break;
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object;
        const customerId = sub.customer as string;
        if (customerId) {
          const ws = await prisma.workspace.findFirst({
            where: { stripeCustomerId: customerId },
            select: { id: true },
          });
          if (ws) {
            await prisma.workspace.update({
              where: { id: ws.id },
              data: { plan: 'FREE' },
            });
          }
        }
        break;
      }
      case 'invoice.payment_failed': {
        // Optional: mark a flag or send a notification
        break;
      }
      default:
        // ignore
        break;
    }
  } catch (e) {
    // swallow to avoid retries storm; inspect logs in Netlify
  }

  return NextResponse.json({ received: true });
}
