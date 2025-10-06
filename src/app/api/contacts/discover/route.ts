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

// Hunter discovery function
async function hunterDiscovery(params: any) {
  const response = await fetch(
    `https://api.hunter.io/v2/domain-search?domain=${params.domain}&api_key=${process.env.HUNTER_API_KEY}&limit=10`,
    { method: 'GET' }
  );

  if (!response.ok) throw new Error(`Hunter: ${response.status}`);
  
  const data = await response.json();
  
  return data.data?.emails?.map((e: any) => ({
    name: `${e.first_name} ${e.last_name}`,
    title: e.position,
    email: e.value,
    company: params.brandName,
    domain: params.domain,
    linkedinUrl: e.linkedin,
    phone: e.phone_number,
    source: 'HUNTER',
    seniority: determineSeniority(e.position),
    confidence: e.confidence,
    verification: e.verification?.status
  })).filter((c: any) => 
    params.departments.some((d: string) => c.title?.toLowerCase().includes(d.toLowerCase()))
  ) || [];
}

function determineSeniority(title: string): string {
  if (!title) return 'Unknown';
  const t = title.toLowerCase();
  if (t.includes('chief') || t.includes('ceo') || t.includes('cto')) return 'C-Level';
  if (t.includes('vp') || t.includes('vice president')) return 'VP';
  if (t.includes('director')) return 'Director';
  if (t.includes('manager')) return 'Manager';
  return 'Other';
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
    const body = await req.json();
    
    // Handle batch requests
    if (Array.isArray(body)) {
      const batchResults = await Promise.all(
        body.map(async (params) => {
          try {
            const contacts = await discoverContacts(params);
            return {
              brandName: params.brandName,
              success: true,
              contacts
            };
          } catch (error) {
            return {
              brandName: params.brandName,
              success: false,
              error: error.message
            };
          }
        })
      );
      
      return NextResponse.json({ results: batchResults });
    }
    
    // Handle single request
    const contacts = await discoverContacts(body);
    return NextResponse.json({ contacts });
    
  } catch (err: any) {
    return NextResponse.json({
      ok: false,
      error: 'DISCOVERY_FAILED',
      detail: err?.message
    }, { status: 200 });
  }
}

async function discoverContacts(params: any) {
  // Check if we have external providers configured
  const hasApollo = Boolean(serverEnv.APOLLO_API_KEY);
  const hasHunter = Boolean(serverEnv.HUNTER_API_KEY);
  const hasExa = Boolean(serverEnv.EXA_API_KEY);
  const hasExternalProviders = hasApollo || hasHunter || hasExa;
  
  // Check if demo mode is enabled
  const isDemoMode = process.env.NEXT_PUBLIC_CONTACTS_DEMO_MODE === "true";
  
  if (!hasExternalProviders && !isDemoMode) {
    throw new Error('No external providers configured and demo mode not enabled');
  }
  
  // Use Apollo, Exa, and Hunter for real discovery if available, otherwise fall back to mock
  let contacts;
  
  if ((hasApollo || hasExa || hasHunter) && !isDemoMode) {
    try {
      const [apolloContacts, exaContacts, hunterContacts] = await Promise.all([
        hasApollo ? apolloDiscovery(params).catch(() => []) : Promise.resolve([]),
        hasExa ? exaDiscovery(params).catch(() => []) : Promise.resolve([]),
        hasHunter ? hunterDiscovery(params).catch(() => []) : Promise.resolve([])
      ]);
      
      const allContacts = [...apolloContacts, ...exaContacts, ...hunterContacts];
      console.log(`Found ${allContacts.length} total contacts (Apollo: ${apolloContacts.length}, Exa: ${exaContacts.length}, Hunter: ${hunterContacts.length})`);
      contacts = allContacts;
    } catch (discoveryError) {
      console.error('Discovery failed, falling back to mock:', discoveryError);
      contacts = mockContacts(params);
    }
  } else {
    // Use mock data for demo mode or when no providers are available
    contacts = mockContacts(params);
  }
  
  return contacts;
}
