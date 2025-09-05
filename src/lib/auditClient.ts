// Client utility for AI Audit API interactions
// Re-usable anywhere in the app

export async function runAudit(provider: string) {
  const r = await fetch('/api/audit/run', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ provider })
  });
  return r.json() as Promise<{ ok: boolean; jobId?: string; auditId?: string; error?: string }>;
}

export async function pollAuditStatus(jobId: string, tries = 15, delayMs = 1000) {
  for (let i = 0; i < tries; i++) {
    const r = await fetch(`/api/audit/status?jobId=${encodeURIComponent(jobId)}`);
    const data = await r.json();
    if (data?.ok && (data.status === 'succeeded' || data.auditId)) return data;
    await new Promise(res => setTimeout(res, delayMs));
  }
  return { ok: false, error: 'TIMED_OUT' };
}

export async function getLatestAudit(provider?: string) {
  const qs = provider ? `?provider=${encodeURIComponent(provider)}` : '';
  const r = await fetch(`/api/audit/latest${qs}`, { cache: 'no-store' });
  return r.json() as Promise<{ ok: boolean; audit: any | null }>;
}

export async function getAudit(id: string) {
  const r = await fetch(`/api/audit/get?id=${encodeURIComponent(id)}`, { cache: 'no-store' });
  return r.json() as Promise<{ ok: boolean; audit?: any }>;
}
