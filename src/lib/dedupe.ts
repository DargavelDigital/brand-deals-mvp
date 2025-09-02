export function findDuplicateEmails(existingEmails: string[], incomingEmails: string[]): string[] {
  const existing = new Set((existingEmails ?? []).filter(Boolean).map(e => e.toLowerCase()));
  const dupes: string[] = [];
  for (const e of incomingEmails ?? []) {
    const key = e?.toLowerCase();
    if (!key) continue;
    if (existing.has(key)) dupes.push(e);
  }
  return dupes;
}

