import { NextResponse } from 'next/server';
import { requireSessionOrDemo } from '@/lib/auth/requireSessionOrDemo';
import { serverEnv } from '@/lib/env';

// Mock contacts for demo mode
function mockContacts(params: any) {
  const base = [
    ['Alex Patel','Head of Influencer Marketing','Head','VALID',98,'LinkedIn + Email Verification'],
    ['Morgan Lee','Brand Partnerships Manager','Manager','VALID',92,'Company + Verify'],
    ['Jamie Chen','Social Media Lead','Lead','RISKY',80,'LinkedIn'],
    ['Taylor Kim','Director, Brand','Director','VALID',90,'LinkedIn'],
    ['Jordan Fox','VP Growth','VP','INVALID',60,'Guess'],
  ] as const
  
  return base.map((b,i)=>({
    id: `${params.domain}-${i}`,
    name: b[0],
    title: b[1],
    seniority: b[2],
    verifiedStatus: b[3],
    score: b[4],
    source: b[5],
    email: `${b[0].toLowerCase().replace(' ','')}@${params.domain}`,
    company: params.brandName,
    domain: params.domain
  }))
}

export async function POST(req: Request) {
  const workspaceId = await requireSessionOrDemo(req as any);
  if (!workspaceId) {
    return NextResponse.json({ ok: false, error: 'UNAUTHENTICATED' }, { status: 401 });
  }

  try {
    const params = await req.json();
    
    // Check if we have external providers configured
    const hasApollo = Boolean(serverEnv.APOLLO_API_KEY);
    const hasHunter = Boolean(serverEnv.HUNTER_API_KEY);
    const hasExa = Boolean(serverEnv.EXA_API_KEY);
    const hasExternalProviders = hasApollo || hasHunter || hasExa;
    
    // Check if demo mode is enabled
    const isDemoMode = process.env.NEXT_PUBLIC_CONTACTS_DEMO_MODE === "true";
    
    if (!hasExternalProviders && !isDemoMode) {
      return NextResponse.json({
        ok: false,
        error: 'NO_PROVIDERS_CONFIGURED',
        message: 'No external providers configured and demo mode not enabled'
      }, { status: 200 });
    }
    
    // For now, always return mock data
    // In the future, this would call the actual discovery services
    const contacts = mockContacts(params);
    
    return NextResponse.json({
      ok: true,
      contacts,
      mode: isDemoMode ? 'DEMO' : 'LIVE',
      providers: {
        apollo: hasApollo,
        hunter: hasHunter,
        exa: hasExa,
      }
    });
  } catch (err: any) {
    return NextResponse.json({
      ok: false,
      error: 'DISCOVERY_FAILED',
      detail: err?.message
    }, { status: 200 });
  }
}
