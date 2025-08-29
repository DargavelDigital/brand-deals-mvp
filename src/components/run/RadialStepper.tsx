'use client'
import * as React from 'react'

const STEPS = ['CONNECT','AUDIT','MATCHES','APPROVE','PACK','CONTACTS','OUTREACH','COMPLETE'] as const
type Step = typeof STEPS[number]

export default function RadialStepper({ step }: { step: Step | string }) {
  const idx = Math.max(0, STEPS.indexOf((step as Step) || 'CONNECT'))
  const total = STEPS.length

  const cx = 100, cy = 100
  const r = 84
  const circumference = 2 * Math.PI * r
  const progress = (idx + 1) / total
  const dash = progress * circumference
  const gap = circumference - dash

  return (
    <div className="card p-5 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="text-base font-semibold">Brand Run Progress</div>
        <div className="text-sm text-[var(--muted-fg)]">{idx + 1}/{total}</div>
      </div>

      <div className="grid place-items-center">
        <svg width="220" height="220" viewBox="0 0 200 200" role="img" aria-label="Brand run progress">
          {/* Track */}
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--border)" strokeWidth="10" />
          {/* Progress (no path math, just stroke dashes on a circle) */}
          <circle
            cx={cx} cy={cy} r={r} fill="none"
            stroke="var(--brand-600)" strokeWidth="10" strokeLinecap="round"
            strokeDasharray={`${dash} ${gap}`} transform="rotate(-90 100 100)"
          />
          {/* Step dots */}
          {STEPS.map((_, i) => {
            const angle = (i / total) * 2 * Math.PI - Math.PI/2
            const x = cx + Math.cos(angle) * r
            const y = cy + Math.sin(angle) * r
            const active = i <= idx
            return <circle key={i} cx={x} cy={y} r="4" fill={active ? 'var(--brand-600)' : 'var(--border)'} />
          })}
        </svg>

        <div className="mt-3 text-center">
          <div className="text-sm uppercase tracking-wide text-[var(--muted-fg)]">
            {STEPS[idx] || 'CONNECT'}
          </div>
        </div>
      </div>
    </div>
  )
}
