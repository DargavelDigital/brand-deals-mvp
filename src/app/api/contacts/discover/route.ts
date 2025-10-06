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
      person_titles: params.departments.flatMap((dept: string) => 
        params.seniority.map((sen: string) => `${sen} ${dept}`)
      ),
      page: 1,
      per_page: 10
    })
  });
  
  if (!response.ok) throw new Error(`Apollo: ${response.status}`);
  
  const data = await response.json();
  
  return data.people?.map((p: any) => ({
    name: `${p.first_name} ${p.last_name}`,
    title: p.title,
    email: p.email,
    company: params.brandName,
    domain: params.domain,
    linkedinUrl: p.linkedin_url,
    phone: p.phone_numbers?.[0]?.number,
    source: 'APOLLO',
    seniority: params.seniority[0],
    confidence: 85
  })) || [];
}

// Exa discovery function
async function exaDiscovery(params: any) {
  const searchTerms = [
    params.brandName,
    params.domain,
    ...params.departments,
    ...params.seniority,
    'partnerships',
    'influencer marketing'
  ].join(' ');

  const response = await fetch('https://api.exa.ai/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.EXA_API_KEY!
    },
    body: JSON.stringify({
      query: `site:linkedin.com "${searchTerms}"`,
      numResults: 5,
      type: 'neural'
    })
  });

  if (!response.ok) throw new Error(`Exa: ${response.status}`);
  
  const data = await response.json();
  
  return data.results?.map((r: any) => ({
    name: extractNameFromLinkedIn(r.title || r.url),
    title: extractTitleFromSnippet(r.text),
    email: null,
    company: params.brandName,
    domain: params.domain,
    linkedinUrl: r.url,
    source: 'EXA',
    seniority: params.seniority[0],
    confidence: 70
  })) || [];
}

function extractNameFromLinkedIn(text: string): string {
  const match = text.match(/^(.+?)\s*[-–|]/);
  return match ? match[1].trim() : 'Unknown';
}

function extractTitleFromSnippet(text: string): string {
  const match = text.match(/(Director|Manager|VP|Head|Chief)[\w\s]+/i);
  return match ? match[0] : 'Unknown';
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
    
    // Use Apollo and Exa for real discovery if available, otherwise fall back to mock
    let contacts;
    let mode = 'DEMO';
    
    if ((hasApollo || hasExa) && !isDemoMode) {
      try {
        const apolloContacts = hasApollo ? await apolloDiscovery(params) : [];
        const exaContacts = hasExa ? await exaDiscovery(params) : [];
        const allContacts = [...apolloContacts, ...exaContacts];
        console.log(`Found ${allContacts.length} total contacts (Apollo: ${apolloContacts.length}, Exa: ${exaContacts.length})`);
        contacts = allContacts;
        mode = 'LIVE';
      } catch (discoveryError) {
        console.error('Discovery failed, falling back to mock:', discoveryError);
        contacts = mockContacts(params);
        mode = 'FALLBACK';
      }
    } else {
      // Use mock data for demo mode or when no providers are available
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
