'use client'
import * as React from 'react'

export function UsageRing({
  used = 0,
  limit = 1000,
  label = 'AI Tokens'
}: { used?: number; limit?: number; label?: string }) {
  const pct = Math.max(0, Math.min(1, limit ? used / limit : 0))
  const cx = 100, cy = 100, r = 84
  const C = 2 * Math.PI * r
  const dash = pct * C
  const gap = C - dash

  return (
    <div className="grid place-items-center">
      <svg width="220" height="220" viewBox="0 0 200 200" aria-label={`${label} usage`}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--border)" strokeWidth="12" />
        <circle
          cx={cx} cy={cy} r={r} fill="none"
          stroke="var(--brand-600)" strokeWidth="12" strokeLinecap="round"
          strokeDasharray={`${dash} ${gap}`} transform="rotate(-90 100 100)"
        />
      </svg>
      <div className="mt-2 text-center">
        <div className="text-2xl font-semibold">{Math.round(pct * 100)}%</div>
        <div className="text-sm text-[var(--muted-fg)]">{used.toLocaleString()} / {limit.toLocaleString()} {label}</div>
      </div>
    </div>
  )
}
