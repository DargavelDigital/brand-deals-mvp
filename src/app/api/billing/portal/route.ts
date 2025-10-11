export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { getSessionAndWorkspace } from '@/lib/billing/workspace';
import { providers } from '@/lib/env';

export async function POST(req: Request) {
  if (!providers.stripe) {
    return NextResponse.json({ ok: false, error: "BILLING_DISABLED" }, { status: 200 });
  }

  try {
    const result = await getSessionAndWorkspace();
    if (!result) {
      return NextResponse.json({ ok: false, error: 'UNAUTHENTICATED' }, { status: 401 });
    }
    
    const { ws } = result;
    if (!ws.stripeCustomerId) {
      return NextResponse.json({ ok: false, error: 'NO_CUSTOMER' }, { status: 200 });
    }
    const origin = new URL(req.url).origin;
    const stripe = getStripe();
    const portal = await stripe.billingPortal.sessions.create({
      customer: ws.stripeCustomerId,
      return_url: `${origin}/billing`,
    });
    return NextResponse.json({ ok: true, url: portal.url });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? 'PORTAL_FAILED' }, { status: 200 });
  }
}