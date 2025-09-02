import { ContactCandidate, EnrichedContact, guessEmailFromNameAndDomain } from './types';
import { apolloEnrich } from './providers/apollo';
import { hunterEnrich } from './providers/hunter';
import { exaEnrich } from './providers/exa';

function timeout<T>(p: Promise<T>, ms = 8000): Promise<T | null> {
  return new Promise((resolve) => {
    const t = setTimeout(() => resolve(null), ms);
    p.then((v) => { clearTimeout(t); resolve(v); })
     .catch(() => { clearTimeout(t); resolve(null); });
  });
}

async function tryProviders(c: ContactCandidate): Promise<EnrichedContact> {
  // 1) Apollo
  const ap = await timeout(apolloEnrich(c));
  if (ap && (ap.email || ap.linkedinUrl || ap.title)) return ap;

  // 2) Hunter
  const hu = await timeout(hunterEnrich(c));
  if (hu && hu.email) return hu;

  // 3) Exa
  const ex = await timeout(exaEnrich(c));
  if (ex && (ex.linkedinUrl || ex.title)) {
    // Try email guess if we got name+domain
    const guessed = ex.email ?? guessEmailFromNameAndDomain(c.name, c.domain);
    return { ...ex, email: guessed };
  }

  // 4) Mock fallback
  const mockTitle = c.title ?? 'Partnerships Manager';
  const mockEmail = c.email ?? guessEmailFromNameAndDomain(c.name, c.domain);
  return {
    ...c,
    email: mockEmail,
    title: mockTitle,
    seniority: c.seniority ?? 'manager',
    linkedinUrl: c.linkedinUrl,
    source: 'MOCK',
    confidence: 0.3,
  };
}

export async function enrichContacts(candidates: ContactCandidate[]): Promise<EnrichedContact[]> {
  const tasks = candidates.map((c) => tryProviders(c));
  const results = await Promise.all(tasks);
  // Best-effort de-dup by email
  const seen = new Set<string>();
  const unique: EnrichedContact[] = [];
  for (const r of results) {
    const key = (r.email ?? `${r.name}-${r.company}`).toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(r);
    }
  }
  return unique;
}
