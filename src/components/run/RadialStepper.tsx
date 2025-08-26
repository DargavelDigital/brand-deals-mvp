'use client'
import * as L from 'lucide-react'
import { ORDER, stepIndex } from '@/services/brand-run/types'
import React from 'react'

type Props = { step: string }

/** Icon mapping (adjust as you wish) */
const ICONS: Record<string, React.ComponentType<any>> = {
  CONNECT: L.Plug2,
  AUDIT: L.Gauge,
  MATCHES: L.Sparkles,
  APPROVE: L.BadgeCheck,
  PACK: L.Images,
  CONTACTS: L.Users,
  OUTREACH: L.Send,
  COMPLETE: L.CheckCircle2,
}

/** Label mapping (display only; keep your existing copy elsewhere if you prefer) */
const LABELS: Record<string,string> = {
  CONNECT:'Connect', AUDIT:'Audit', MATCHES:'Matches', APPROVE:'Approve',
  PACK:'Pack', CONTACTS:'Contacts', OUTREACH:'Outreach', COMPLETE:'Done'
}

export default function RadialStepper({ step }: Props){
  const idx = Math.max(0, stepIndex(step as any))
  const total = ORDER.length
  const size = 280     // SVG viewport
  const radius = 110   // circle radius for icon ring
  const cx = size/2, cy = size/2

  // For arc progress (foreground over muted full ring)
  const circumference = 2 * Math.PI * radius
  const progress = (idx/(total-1)) * circumference

  // Compute positions around the circle, top at -90deg
  const pos = (i:number)=>{
    const angle = (-90 + (360/(total)) * i) * Math.PI/180
    return [ cx + radius * Math.cos(angle), cy + radius * Math.sin(angle) ]
  }

  return (
    <div className="card p-4">
      <div className="text-sm font-medium mb-4">Brand Run Progress</div>

      {/* Radial on desktop/tablet */}
      <div className="radial-container grid place-items-center">
        <svg width={size} height={size} className="radial-wrap" role="group" aria-label="Brand Run Progress">
          {/* Base full ring */}
          <circle
            cx={cx} cy={cy} r={radius}
            fill="none"
            stroke="var(--border)"
            strokeWidth="8"
          />
          {/* Progress arc */}
          <circle
            cx={cx} cy={cy} r={radius}
            fill="none"
            stroke="var(--brand-600)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${progress} ${circumference-progress}`}
            transform={`rotate(-90 ${cx} ${cy})`}
          />

          {/* Step nodes */}
          {ORDER.map((s, i)=>{
            const [x, y] = pos(i)
            const Icon = ICONS[s] ?? L.Circle
            const isPast = i < idx
            const isCurrent = i === idx
            const isFuture = i > idx

            const nodeFill = isCurrent ? 'var(--brand-600)' : isPast ? 'var(--accent)' : 'var(--muted)'
            const iconColor = isCurrent || isPast ? 'white' : 'var(--muted-fg)'

            return (
              <g key={s} tabIndex={0} aria-label={`${LABELS[s]} ${isCurrent? '(current step)':''}`} role="button">
                {/* node */}
                <circle cx={x} cy={y} r={16} fill={nodeFill} />
                {/* icon */}
                <foreignObject x={x-10} y={y-10} width="20" height="20">
                  <div style={{display:'grid',placeItems:'center',width:'20px',height:'20px',color:iconColor}}>
                    <Icon size={14} />
                  </div>
                </foreignObject>
                {/* label */}
                <text x={x} y={y+32} textAnchor="middle" className={`radial-label ${isCurrent?'radial-current':''}`}>
                  {LABELS[s]}
                </text>
              </g>
            )
          })}

          {/* Center readout */}
          <g>
            <text x={cx} y={cy-2} textAnchor="middle" style={{fontSize:'28px',fontWeight:600}}>
              {idx+1}/{total}
            </text>
            <text x={cx} y={cy+20} textAnchor="middle" className="radial-label">
              {LABELS[ORDER[idx]]}
            </text>
          </g>
        </svg>
      </div>

      {/* Linear fallback on small screens */}
      <div className="linear-fallback">
        <div className="flex flex-wrap gap-2">
          {ORDER.map((s, i)=>{
            const Icon = ICONS[s] ?? L.Circle
            const isPast = i < idx
            const isCurrent = i === idx
            return (
              <div key={s}
                   className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border
                     ${isCurrent ? 'bg-[var(--brand-600)] text-white border-transparent'
                                 : isPast ? 'bg-[var(--muted)] text-[var(--text)]'
                                          : 'bg-[var(--card)] text-[var(--muted-fg)]'}`}>
                <Icon size={14} />
                <span className="text-xs">{LABELS[s]}</span>
              </div>
            )
          })}
        </div>
        <div className="text-xs text-[var(--muted-fg)] mt-2">{idx+1} of {total}</div>
      </div>
    </div>
  )
}
