import { EnrichedContact, ContactCandidate } from '../types';

const EXA_ENDPOINT = 'https://api.exa.ai/search';

import { env } from '@/lib/env';

export async function exaEnrich(c: ContactCandidate): Promise<EnrichedContact | null> {
  const key = env.EXA_API_KEY;
  if (!key) return null;

  // We will search LinkedIn pages for name + company
  const terms = [
    c.name,
    c.company,
    'partnerships',
    'marketing',
    'influencer',
    'creator',
  ].filter(Boolean).join(' ');
  if (!terms) return null;

  try {
    const res = await fetch(EXA_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
      },
      body: JSON.stringify({
        query: `site:linkedin.com "${terms}"`,
        numResults: 3,
      }),
    });
    if (!res.ok) return null;
    const json: any = await res.json();
    const first = json?.results?.[0];
    if (!first) return null;

    const linkedinUrl = first.url || c.linkedinUrl;
    // Exa won't give title directly; best-effort from snippet
    const snippet = first.text || first.snippet || '';
    const title = c.title || (snippet.match(/(Head|Manager|Lead|Director|Specialist)[^.,|]+/i)?.[0] ?? undefined);

    return {
      ...c,
      linkedinUrl,
      title,
      source: 'EXA',
      confidence: 50, // Use percentage (0-100) for consistency with discover API
    };
  } catch {
    return null;
  }
}
