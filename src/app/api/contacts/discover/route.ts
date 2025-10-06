import { NextResponse } from 'next/server';
import { requireSessionOrDemo } from '@/lib/auth/requireSessionOrDemo';
import { serverEnv } from '@/lib/env';

// Apollo discovery function
async function apolloDiscovery(params: any) {
  const response = await fetch('https://api.apollo.io/v1/mixed_people/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
      'X-Api-Key': process.env.APOLLO_API_KEY!
    },
    body: JSON.stringify({
      organization_domains: [params.domain],
      person_titles: params.departments.map((dept: string) => `${dept} ${params.seniority.join(' OR ')}`),
      page: 1,
      per_page: 10
    })
  });
  
  if (!response.ok) {
    throw new Error(`Apollo API error: ${response.status}`);
  }
  
  const data = await response.json();
  
  return data.people.map((person: any) => ({
    id: `apollo-${person.id}`,
    name: `${person.first_name} ${person.last_name}`,
    title: person.title,
    email: person.email,
    company: params.brandName,
    domain: params.domain,
    linkedinUrl: person.linkedin_url,
    source: 'APOLLO' as const,
    seniority: determineSeniority(person.title),
    verifiedStatus: 'VALID' as const,
    score: 85
  }));
}

// Helper function to determine seniority from title
function determineSeniority(title: string): string {
  const titleLower = title.toLowerCase();
  if (titleLower.includes('ceo') || titleLower.includes('founder') || titleLower.includes('president')) {
    return 'C-Level';
  } else if (titleLower.includes('vp') || titleLower.includes('vice president')) {
    return 'VP';
  } else if (titleLower.includes('director')) {
    return 'Director';
  } else if (titleLower.includes('head') || titleLower.includes('lead')) {
    return 'Head';
  } else if (titleLower.includes('manager')) {
    return 'Manager';
  } else {
    return 'Individual Contributor';
  }
}

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
    
    // Use Apollo for real discovery if available, otherwise fall back to mock
    let contacts;
    let mode = 'DEMO';
    
    if (hasApollo && !isDemoMode) {
      try {
        const apolloContacts = await apolloDiscovery(params);
        console.log(`Apollo found ${apolloContacts.length} contacts`);
        contacts = apolloContacts;
        mode = 'LIVE';
      } catch (apolloError) {
        console.error('Apollo discovery failed, falling back to mock:', apolloError);
        contacts = mockContacts(params);
        mode = 'FALLBACK';
      }
    } else {
      // Use mock data for demo mode or when Apollo is not available
      contacts = mockContacts(params);
    }
    
    return NextResponse.json({
      ok: true,
      contacts,
      mode,
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
