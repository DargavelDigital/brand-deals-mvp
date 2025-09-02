'use client';

import Link from 'next/link';

export function UpsellBanner({ reason = 'This feature requires Pro.' }: { reason?: string }) {
  return (
    <div className="border border-[var(--border)] rounded-lg p-3 bg-[var(--tint-accent)] text-sm flex items-center justify-between">
      <span>{reason}</span>
      <Link href="/billing" className="inline-flex items-center px-3 py-1 rounded-md bg-[var(--brand-600)] text-white text-xs">
        Upgrade
      </Link>
    </div>
  );
}