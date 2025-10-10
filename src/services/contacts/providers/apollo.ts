import { EnrichedContact, ContactCandidate, guessEmailFromNameAndDomain } from '../types';

const APOLLO_ENDPOINT = 'https://api.apollo.io/v1/people/match'; // example; org plan may differ

import { env } from '@/lib/env';

export async function apolloEnrich(c: ContactCandidate): Promise<EnrichedContact | null> {
  const key = env.APOLLO_API_KEY;
  if (!key) return null;

  // Require at least a domain + name or linkedin to be useful
  const body: any = {
    api_key: key,
    person_email: c.email,
    person_name: c.name,
    organization_name: c.company,
    organization_website: c.domain ? `https://${c.domain}` : undefined,
    linkedin_url: c.linkedinUrl,
  };

  try {
    const res = await fetch(APOLLO_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      // Apollo rate limits—retry/timeout handled by orchestrator
    });
    if (!res.ok) return null;
    const json: any = await res.json();

    const person = json?.person || json?.person_info || null;
    if (!person) return null;

    const email = person.email || c.email || guessEmailFromNameAndDomain(c.name, c.domain);
    const title = person.title || person.headline || c.title;
    const linkedinUrl = person.linkedin_url || c.linkedinUrl;

    return {
      ...c,
      email,
      title,
      linkedinUrl,
      seniority: person.seniority || c.seniority,
      source: 'APOLLO',
      confidence: 90, // Use percentage (0-100) for consistency with discover API
    };
  } catch {
    return null;
  }
}
