'use client';

import { useState } from 'react';

function ActionButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`inline-flex items-center rounded-lg px-4 py-2 bg-[var(--brand-600)] text-white text-sm shadow-sm border border-[var(--border)] hover:opacity-90 disabled:opacity-60 ${props.className ?? ''}`}
    />
  );
}

export default function BillingPage() {
  const [busy, setBusy] = useState<'PRO' | 'AGENCY' | 'PORTAL' | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function go(path: string, body?: any) {
    setError(null);
    const res = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });
    const json = await res.json();
    if (!json.ok || !json.url) {
      setError(json.error ?? 'Unknown error');
      return;
    }
    window.location.href = json.url;
  }

  return (
    <div className="container-page py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Billing</h1>
        <p className="text-[var(--muted-fg)]">Upgrade your plan or manage your subscription.</p>
      </div>

      {error && (
        <div className="border border-[var(--error)] text-[var(--error)] rounded-lg p-3 text-sm">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <div className="border border-[var(--border)] rounded-xl p-5 bg-[var(--card)] space-y-3">
          <h3 className="font-medium text-lg">Pro</h3>
          <ul className="text-sm text-[var(--muted-fg)] list-disc pl-5 space-y-1">
            <li>Media Pack PDF export</li>
            <li>AI enrichment & enhanced matching</li>
            <li>Email outreach sequences</li>
          </ul>
          <ActionButton
            disabled={busy !== null}
            onClick={async () => { setBusy('PRO'); await go('/api/billing/checkout', { plan: 'pro' }); setBusy(null); }}
          >
            {busy === 'PRO' ? 'Starting checkout…' : 'Upgrade to Pro'}
          </ActionButton>
        </div>

        <div className="border border-[var(--border)] rounded-xl p-5 bg-[var(--card)] space-y-3">
          <h3 className="font-medium text-lg">Agency</h3>
          <ul className="text-sm text-[var(--muted-fg)] list-disc pl-5 space-y-1">
            <li>All Pro features</li>
            <li>Agency roles & reporting</li>
            <li>Higher usage caps</li>
          </ul>
          <ActionButton
            disabled={busy !== null}
            onClick={async () => { setBusy('AGENCY'); await go('/api/billing/checkout', { plan: 'agency' }); setBusy(null); }}
          >
            {busy === 'AGENCY' ? 'Starting checkout…' : 'Upgrade to Agency'}
          </ActionButton>
        </div>
      </div>

      <div className="border border-[var(--border)] rounded-xl p-5 bg-[var(--card)] space-y-3">
        <h3 className="font-medium text-lg">Manage Subscription</h3>
        <p className="text-sm text-[var(--muted-fg)]">Open the Stripe customer portal to update payment details, change plan, or cancel.</p>
        <ActionButton
          disabled={busy !== null}
          onClick={async () => { setBusy('PORTAL'); await go('/api/billing/portal'); setBusy(null); }}
        >
          {busy === 'PORTAL' ? 'Opening portal…' : 'Manage Billing'}
        </ActionButton>
      </div>
    </div>
  );
}