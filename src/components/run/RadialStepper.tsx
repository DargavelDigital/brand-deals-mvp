'use client'

import * as React from 'react'
import * as L from 'lucide-react'

/** The 8 Brand Run steps in order */
const ORDER = [
  'CONNECT',
  'AUDIT',
  'MATCHES',
  'APPROVE',
  'PACK',
  'CONTACTS',
  'OUTREACH',
  'COMPLETE',
] as const
type Step = (typeof ORDER)[number]

const LABELS: Record<Step, string> = {
  CONNECT: 'Connect',
  AUDIT: 'Audit',
  MATCHES: 'Matches',
  APPROVE: 'Approve',
  PACK: 'Pack',
  CONTACTS: 'Contacts',
  OUTREACH: 'Outreach',
  COMPLETE: 'Done',
}

const ICONS: Record<Step, React.ComponentType<{ size?: number }>> = {
  CONNECT: L.Plug2,
  AUDIT: L.Gauge,
  MATCHES: L.Sparkles,
  APPROVE: L.BadgeCheck,
  PACK: L.Images,
  CONTACTS: L.Users,
  OUTREACH: L.Send,
  COMPLETE: L.CheckCircle2,
}

function stepIndex(s: string): number {
  const i = ORDER.indexOf(s as Step)
  return i >= 0 ? i : 0
}

type Props = { step: string }

/**
 * Compact (300×300) SVG radial stepper.
 * - highlights current step
 * - shows progress arc
 * - center readout (e.g., 1/8 CONNECT)
 */
export default function RadialStepper({ step }: Props) {
  const idx = stepIndex(step)
  const total = ORDER.length

  // Fixed geometry (do not let it grow with viewport)
  const size = 280 // viewBox
  const cx = size / 2
  const cy = size / 2
  const radius = 105
  const circumference = 2 * Math.PI * radius
  const progress = (idx / (total - 1)) * circumference

  // position nodes evenly around the circle (start at -90°, top)
  const pos = (i: number) => {
    const angle = (-90 + (360 / total) * i) * (Math.PI / 180)
    return [cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)] as const
  }

  return (
    <div className="card p-4 md:p-5">
      <div className="text-sm font-medium mb-3">Brand Run Progress</div>

      {/* Hard bound size so it never explodes */}
      <div className="mx-auto" style={{ width: 300, maxWidth: '100%' }}>
        <div className="mx-auto" style={{ width: 300, height: 300 }}>
          <svg
            viewBox={`0 0 ${size} ${size}`}
            width="100%"
            height="100%"
            role="group"
            aria-label="Brand Run Progress"
            preserveAspectRatio="xMidYMid meet"
          >
            {/* base ring */}
            <circle
              cx={cx}
              cy={cy}
              r={radius}
              fill="none"
              stroke="var(--border)"
              strokeWidth={8}
            />
            {/* progress arc */}
            <circle
              cx={cx}
              cy={cy}
              r={radius}
              fill="none"
              stroke="var(--brand-600)"
              strokeWidth={8}
              strokeLinecap="round"
              strokeDasharray={`${progress} ${circumference - progress}`}
              transform={`rotate(-90 ${cx} ${cy})`}
            />

            {/* step nodes */}
            {ORDER.map((s, i) => {
              const [x, y] = pos(i)
              const Icon = ICONS[s]
              const isPast = i < idx
              const isCurrent = i === idx

              const nodeFill = isCurrent
                ? 'var(--brand-600)'
                : isPast
                ? 'var(--brand-500)'
                : 'var(--muted)'
              const iconColor = isCurrent || isPast ? 'white' : 'var(--muted-fg)'

              return (
                <g key={s} aria-label={LABELS[s]}>
                  <circle cx={x} cy={y} r={14} fill={nodeFill} />
                  {/* tiny icon in the node */}
                  <foreignObject x={x - 9} y={y - 9} width="18" height="18">
                    <div
                      style={{
                        display: 'grid',
                        placeItems: 'center',
                        width: 18,
                        height: 18,
                        color: iconColor,
                      }}
                    >
                      <Icon size={12} />
                    </div>
                  </foreignObject>
                  {/* label under the node */}
                  <text
                    x={x}
                    y={y + 26}
                    textAnchor="middle"
                    style={{
                      fontSize: 11,
                      fill: isCurrent ? 'var(--brand-600)' : 'var(--muted-fg)',
                      fontWeight: isCurrent ? 600 : 400,
                    }}
                  >
                    {LABELS[s]}
                  </text>
                </g>
              )
            })}

            {/* center readout */}
            <g>
              <text
                x={cx}
                y={cy - 2}
                textAnchor="middle"
                style={{ fontSize: 20, fontWeight: 700, fill: 'var(--fg)' }}
              >
                {idx + 1}/{total}
              </text>
              <text
                x={cx}
                y={cy + 16}
                textAnchor="middle"
                style={{ fontSize: 12, fill: 'var(--muted-fg)' }}
              >
                {LABELS[ORDER[idx]]}
              </text>
            </g>
          </svg>
        </div>
      </div>
    </div>
  )
}
