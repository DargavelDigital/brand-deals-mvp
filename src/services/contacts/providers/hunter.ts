import { EnrichedContact, ContactCandidate, guessEmailFromNameAndDomain } from '../types';

const HUNTER_ENDPOINT = 'https://api.hunter.io/v2/email-finder';

import { env } from '@/lib/env';

export async function hunterEnrich(c: ContactCandidate): Promise<EnrichedContact | null> {
  const key = env.HUNTER_API_KEY;
  if (!key) return null;
  if (!c.domain) return null;

  const { first, last } = (() => {
    const name = (c.name ?? '').trim();
    const parts = name.split(/\s+/);
    return { first: parts[0], last: parts.slice(1).join(' ') || undefined };
  })();

  const url = new URL(HUNTER_ENDPOINT);
  if (first) url.searchParams.set('first_name', first);
  if (last) url.searchParams.set('last_name', last);
  url.searchParams.set('domain', c.domain);
  url.searchParams.set('api_key', key);

  try {
    const res = await fetch(url.toString());
    if (!res.ok) return null;
    const json: any = await res.json();
    const data = json?.data || {};
    const email = data.email || c.email || guessEmailFromNameAndDomain(c.name, c.domain);
    return {
      ...c,
      email,
      title: c.title,
      seniority: c.seniority,
      linkedinUrl: c.linkedinUrl,
      source: 'HUNTER',
      confidence: typeof data.score === 'number' ? data.score : 60, // Use percentage (0-100) for consistency
    };
  } catch {
    return null;
  }
}
