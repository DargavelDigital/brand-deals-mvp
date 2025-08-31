'use client'

import * as React from 'react'
import clsx from 'clsx'
import { track } from '@/lib/telemetry'
import { flags } from '@/lib/flags/index'

type StepId =
  | 'CONNECT'
  | 'AUDIT'
  | 'MATCHES'
  | 'APPROVE'
  | 'PACK'
  | 'CONTACTS'
  | 'OUTREACH'
  | 'DONE'

const ORDER: StepId[] = [
  'CONNECT',
  'AUDIT',
  'MATCHES',
  'APPROVE',
  'PACK',
  'CONTACTS',
  'OUTREACH',
  'DONE',
]

const LABEL: Record<StepId, string> = {
  CONNECT: 'Connect',
  AUDIT: 'Audit',
  MATCHES: 'Matches',
  APPROVE: 'Approve',
  PACK: 'Pack',
  CONTACTS: 'Contacts',
  OUTREACH: 'Outreach',
  DONE: 'Done',
}

function polar(cx: number, cy: number, r: number, angleRad: number) {
  return { x: cx + Math.cos(angleRad) * r, y: cy + Math.sin(angleRad) * r }
}

// ETA calculation based on step constants
function calculateETA(currentStep: StepId): number {
  const stepTimes: Record<StepId, number> = {
    CONNECT: 1,
    AUDIT: 3,
    MATCHES: 2,
    APPROVE: 1,
    PACK: 2,
    CONTACTS: 2,
    OUTREACH: 2,
    DONE: 0,
  }
  
  const currentIndex = ORDER.indexOf(currentStep)
  let remainingTime = 0
  
  // Sum up time for remaining steps
  for (let i = currentIndex; i < ORDER.length - 1; i++) {
    remainingTime += stepTimes[ORDER[i]]
  }
  
  return remainingTime
}

export function RunProgressWheel({
  step,
  className,
  size = 420, // change this to scale the whole widget
}: {
  step: StepId
  className?: string
  size?: number
}) {
  const idx = Math.max(0, ORDER.indexOf(step))
  const count = ORDER.length

  const center = size / 2
  const ring = Math.round(size * 0.36) // radius for the track/dots
  const labelR = Math.round(ring + size * 0.11) // radius for labels (outside the ring)
  const nodeR = Math.round(size * 0.029) // inactive dot radius
  const nodeRActive = Math.round(size * 0.038)

  const trackWidth = Math.max(12, Math.round(size * 0.038))
  const arcWidth = trackWidth

  // SVG arc progress
  const circumference = 2 * Math.PI * ring
  const progress = (idx + 1) / count
  const dash = `${circumference * progress} ${circumference}`

  // Typography scales gently with size
  const titleSize = Math.round(size * 0.052) // center "1/8"
  const subtitleSize = Math.round(size * 0.038) // center "Connect"
  const labelSize = Math.max(12, Math.round(size * 0.032))

  return (
    <div
      className={clsx(
        'rounded-xl border border-[var(--border)] bg-[var(--card)] p-6',
        className,
      )}
      style={{ minWidth: size + 48 }}
    >
      <div className="text-[15px] font-medium mb-4">Run Progress</div>

      <div className="relative mx-auto" style={{ width: size, height: size }}>
        {/* Track + progress */}
        <svg width={size} height={size} className="block">
          {/* Track */}
          <circle
            cx={center}
            cy={center}
            r={ring}
            fill="none"
            stroke="var(--border)"
            strokeWidth={trackWidth}
            strokeLinecap="round"
          />
          {/* Progress arc */}
          <circle
            cx={center}
            cy={center}
            r={ring}
            fill="none"
            stroke="var(--brand-600)"
            strokeWidth={arcWidth}
            strokeLinecap="round"
            strokeDasharray={dash}
            strokeDashoffset={circumference * 0.125} // start at top (12 o'clock)
            transform={`rotate(-90 ${center} ${center})`}
          />
        </svg>

        {/* Step nodes + labels */}
        {ORDER.map((s, i) => {
          const fraction = i / count
          const angle = fraction * Math.PI * 2 - Math.PI / 2 // 12 o'clock start
          const node = polar(center, center, ring, angle)
          const label = polar(center, center, labelR, angle)
          const active = s === step

          // micro nudges to avoid overlap at 3–5 o'clock and 7–9 o'clock
          const deg = (fraction * 360 + 360) % 360
          let nudgeX = 0
          let nudgeY = 0
          if (deg > 20 && deg < 80) {
            // 1–3 o'clock: nudge label a bit outward/down
            nudgeX = 6
            nudgeY = 4
          } else if (deg > 100 && deg < 160) {
            // 4–6 o'clock: nudge downward slightly
            nudgeY = 6
          } else if (deg > 200 && deg < 260) {
            // 7–9 o'clock: nudge left/down
            nudgeX = -6
            nudgeY = 6
          } else if (deg > 280 && deg < 340) {
            // 10–11 o'clock: nudge outward/up a touch
            nudgeX = -2
            nudgeY = -2
          }

          return (
            <React.Fragment key={s}>
              {/* Node/dot */}
              <div
                className={clsx(
                  'absolute -translate-x-1/2 -translate-y-1/2 select-none',
                  'grid place-items-center rounded-full transition-all',
                  active
                    ? 'bg-[var(--brand-600)] text-white shadow-lg'
                    : 'bg-[var(--surface)] text-[var(--muted-fg)] border border-[var(--border)]',
                )}
                style={{
                  left: node.x,
                  top: node.y,
                  width: active ? nodeRActive * 2 : nodeR * 2,
                  height: active ? nodeRActive * 2 : nodeR * 2,
                }}
                aria-current={active ? 'step' : undefined}
              >
                <div
                  className={clsx(
                    'rounded-full',
                    active ? 'w-3 h-3 bg-white' : 'w-2.5 h-2.5 bg-[var(--muted)]',
                  )}
                />
              </div>

              {/* Label */}
              <div
                className={clsx(
                  'absolute -translate-x-1/2 -translate-y-1/2 select-none',
                  'px-1 text-center',
                  active
                    ? 'text-[var(--brand-600)] font-medium'
                    : 'text-[var(--muted-fg)]',
                )}
                style={{
                  left: label.x + nudgeX,
                  top: label.y + nudgeY,
                  fontSize: labelSize,
                  lineHeight: 1.1,
                  maxWidth: Math.round(size * 0.22), // keep labels tight
                  whiteSpace: 'nowrap',
                }}
              >
                {LABEL[s]}
              </div>
            </React.Fragment>
          )
        })}

        {/* Center summary */}
        <div className="absolute inset-0 grid place-items-center pointer-events-none">
          <div className="text-center">
            <div
              className="font-semibold"
              style={{ fontSize: titleSize, lineHeight: 1.1 }}
            >
              {Math.min(count, idx + 1)}/{count}
            </div>
            <div
              className="text-[var(--muted-fg)]"
              style={{ fontSize: subtitleSize, marginTop: 6 }}
            >
              {LABEL[step]}
            </div>
            
            {/* Progress visualization - feature flagged */}
            {flags.brandrun.progressViz && (
              <div className="mt-3 space-y-1">
                <div
                  className="text-[var(--muted-fg)] font-medium"
                  style={{ fontSize: Math.max(10, Math.round(size * 0.025)) }}
                >
                  {Math.round(((idx + 1) / count) * 100)}% complete
                </div>
                <div
                  className="text-[var(--muted)] text-xs"
                  style={{ fontSize: Math.max(9, Math.round(size * 0.022)) }}
                >
                  Est. ~{calculateETA(step)} min left
                </div>
                {React.useEffect(() => {
                  const percent = Math.round(((idx + 1) / count) * 100)
                  const etaMin = calculateETA(step)
                  track('brandrun_progress_view', { percent, etaMin })
                }, [idx, count, step])}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
