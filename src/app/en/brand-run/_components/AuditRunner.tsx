'use client';

import React from 'react';
import { runAudit, pollAuditStatus, getLatestAudit } from '@/lib/auditClient';

type Props = { provider: 'tiktok' | 'instagram' | 'youtube' | 'x' };

export default function AuditRunner({ provider }: Props) {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [latest, setLatest] = React.useState<any | null>(null);

  const refreshLatest = React.useCallback(async () => {
    const res = await getLatestAudit(provider);
    if (res.ok) setLatest(res.audit ?? null);
  }, [provider]);

  React.useEffect(() => {
    // fetch latest on mount
    refreshLatest();
  }, [refreshLatest]);

  async function onRun() {
    setLoading(true);
    setError(null);
    try {
      const run = await runAudit(provider);
      if (!run.ok || !run.jobId) {
        throw new Error(run.error ?? 'Failed to start audit');
      }
      const status = await pollAuditStatus(run.jobId, 15, 1000);
      if (!status.ok || status.error) {
        throw new Error(status.error ?? 'Audit did not complete');
      }
      await refreshLatest();
    } catch (e: any) {
      setError(e?.message ?? 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button
          onClick={onRun}
          disabled={loading}
          className="px-4 py-2 rounded-xl shadow border hover:opacity-90 disabled:opacity-50"
        >
          {loading ? 'Running…' : 'Run Audit'}
        </button>
        {error && <span className="text-red-600 text-sm">{error}</span>}
      </div>

      <div className="rounded-2xl border p-4">
        <h3 className="font-semibold mb-2">Latest audit</h3>
        {!latest && <p className="text-sm opacity-70">No audit yet.</p>}
        {latest && <AuditCard audit={latest} />}
      </div>
    </div>
  );
}

function AuditCard({ audit }: { audit: any }) {
  const created = audit?.createdAt ? new Date(audit.createdAt).toLocaleString() : '—';
  const snapshot = audit?.snapshotJson ?? {};
  const sources = audit?.sources ?? [];

  return (
    <div className="space-y-2 text-sm">
      <div className="grid grid-cols-2 gap-2">
        <div><span className="opacity-60">ID:</span> {audit.id}</div>
        <div><span className="opacity-60">Created:</span> {created}</div>
        <div><span className="opacity-60">Workspace:</span> {audit.workspaceId ?? '—'}</div>
        <div><span className="opacity-60">Provider:</span> {snapshot?.provider ?? 'tiktok'}</div>
      </div>

      <div className="mt-3">
        <div className="opacity-60 mb-1">Snapshot</div>
        <pre className="rounded-xl bg-black/5 p-3 overflow-auto text-xs">
{JSON.stringify(snapshot, null, 2)}
        </pre>
      </div>

      {Array.isArray(sources) && sources.length > 0 && (
        <div className="mt-3">
          <div className="opacity-60 mb-1">Sources</div>
          <ul className="list-disc ml-5">
            {sources.map((s: any, i: number) => (
              <li key={i}>{s?.url ?? s?.id ?? 'source'}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
