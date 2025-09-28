import { NextResponse } from 'next/server';
import { serverEnv } from '@/lib/env';

export async function GET() {
  try {
    // Check if external providers are configured
    const hasApollo = Boolean(serverEnv.APOLLO_API_KEY);
    const hasHunter = Boolean(serverEnv.HUNTER_API_KEY);
    const hasExa = Boolean(serverEnv.EXA_API_KEY);
    
    const hasExternalProviders = hasApollo || hasHunter || hasExa;
    
    // Check if demo mode is enabled
    const isDemoMode = process.env.NEXT_PUBLIC_CONTACTS_DEMO_MODE === "true";
    
    // Determine if we have the necessary capabilities
    const providersOk = isDemoMode || hasExternalProviders;
    
    return NextResponse.json({
      ok: true,
      providersOk,
      isDemoMode,
      providers: {
        apollo: hasApollo,
        hunter: hasHunter,
        exa: hasExa,
      },
      configured: providersOk,
    });
  } catch (err: any) {
    return NextResponse.json({
      ok: false,
      error: 'CAPABILITIES_CHECK_FAILED',
      detail: err?.message,
      providersOk: false,
      isDemoMode: false,
    }, { status: 200 });
  }
}
