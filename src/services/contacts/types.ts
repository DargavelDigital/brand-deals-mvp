export type ContactCandidate = {
  name?: string;
  email?: string;
  domain?: string;
  company?: string;
  linkedinUrl?: string;
  title?: string;
  seniority?: string;
  source?: string;
};

export type EnrichedContact = ContactCandidate & {
  // normalized, best-effort fields
  email?: string;
  title?: string;
  seniority?: string;
  linkedinUrl?: string;
  source: string; // 'APOLLO' | 'HUNTER' | 'EXA' | 'MOCK'
  confidence?: number; // 0..1
};

export function normalizeName(name?: string) {
  return (name ?? '').trim().replace(/\s+/g, ' ');
}

export function parseFirstLast(name?: string): { first?: string; last?: string } {
  const n = normalizeName(name);
  if (!n) return {};
  const parts = n.split(' ');
  if (parts.length === 1) return { first: parts[0] };
  return { first: parts[0], last: parts.slice(1).join(' ') };
}

export function guessEmailFromNameAndDomain(name?: string, domain?: string) {
  if (!name || !domain) return undefined;
  const { first, last } = parseFirstLast(name.toLowerCase());
  if (!first) return undefined;
  const safeLast = (last ?? '').replace(/[^a-z]/g, '');
  const safeFirst = first.replace(/[^a-z]/g, '');
  if (safeLast) return `${safeFirst}.${safeLast}@${domain}`;
  return `${safeFirst}@${domain}`;
}
