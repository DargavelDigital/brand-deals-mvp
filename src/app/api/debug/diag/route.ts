import { NextResponse } from 'next/server';
import { env, providers } from '@/lib/env';

export async function GET() {
  return NextResponse.json({
    ok: true,
    nodeEnv: env.NODE_ENV,
    providers: {
      stripe: providers.stripe,
      apollo: providers.apollo,
      hunter: providers.hunter,
      exa: providers.exa,
      email: providers.email,
    },
    // add any feature flags as booleans (no values)
    features: {
      billingEnabled: env.FEATURE_BILLING_ENABLED === 'true',
      observability: env.FEATURE_OBSERVABILITY === 'true',
      demoAuth: env.FEATURE_DEMO_AUTH === 'true',
    },
  });
}
