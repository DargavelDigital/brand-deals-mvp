export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { getSessionAndWorkspace } from '@/lib/billing/workspace';
import { env, providers } from '@/lib/env';

const PRICE_IDS: Record<string, string> = {
  pro: env.STRIPE_PRICE_PRO ?? '',      // e.g. price_123
  agency: env.STRIPE_PRICE_AGENCY ?? '',// e.g. price_abc
};

function getLocaleFromUrl(url: string) {
  const u = new URL(url);
  const p = u.pathname.split('/').filter(Boolean);
  return p[0] || 'en';
}

export async function POST(req: Request) {
  if (!providers.stripe) {
    return NextResponse.json({ ok: false, error: "BILLING_DISABLED" }, { status: 200 });
  }

  try {
    const { session, ws } = await getSessionAndWorkspace();
    const body = await req.json();
    const plan: 'pro' | 'agency' = body?.plan;
    if (!plan || !(plan in PRICE_IDS) || !PRICE_IDS[plan]) {
      return NextResponse.json({ ok: false, error: 'INVALID_PLAN' }, { status: 400 });
    }

    const origin = new URL(req.url).origin;
    const locale = getLocaleFromUrl(req.url);

    // Ensure customer
    let customerId = ws.stripeCustomerId ?? null;
    if (!customerId) {
      const stripe = getStripe();
    const customer = await stripe.customers.create({
        email: session.user.email ?? undefined,
        name: ws.name,
        metadata: { workspaceId: ws.id },
      });
      customerId = customer.id;
      await prisma.workspace.update({
        where: { id: ws.id },
        data: { stripeCustomerId: customerId },
      });
    }

    const checkout = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: PRICE_IDS[plan], quantity: 1 }],
      success_url: `${origin}/${locale}/billing?status=success`,
      cancel_url: `${origin}/${locale}/billing?status=cancel`,
      metadata: {
        workspaceId: ws.id,
        userId: session.user.id,
        plan,
      },
      allow_promotion_codes: true,
    });

    return NextResponse.json({ ok: true, url: checkout.url });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? 'CHECKOUT_FAILED' }, { status: 200 });
  }
}