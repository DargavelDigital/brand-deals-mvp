'use client'
import * as React from 'react'
import { Check, X, Info } from 'lucide-react'

type BrandLite = {
  id: string
  name: string
  logo?: string
  industry?: string
  description?: string
  matchScore?: number
  tags?: string[]
  reasons?: string[]
  website?: string
}

export type ApprovalState = 'pending' | 'approved' | 'rejected'

export default function BrandApprovalCard({
  brand, state, onApprove, onReject, onReset, onDetails,
}: {
  brand: BrandLite
  state: ApprovalState
  onApprove: () => void
  onReject: () => void
  onReset: () => void
  onDetails: () => void
}) {
  const initial = brand.name?.[0]?.toUpperCase() ?? 'B'
  const chip = (
    state === 'approved' ? (
      <span className="inline-flex items-center gap-1 rounded-full border border-[var(--success)] text-[var(--success)] bg-[var(--tint-success)] text-xs px-2 py-0.5">
        <Check className="w-3 h-3" /> Approved
      </span>
    ) : state === 'rejected' ? (
      <span className="inline-flex items-center gap-1 rounded-full border border-[var(--error)] text-[var(--error)] bg-[var(--tint-error)] text-xs px-2 py-0.5">
        <X className="w-3 h-3" /> Rejected
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] text-[var(--muted-fg)] bg-[var(--card)] text-xs px-2 py-0.5">
        Pending
      </span>
    )
  )

  return (
    <div className={`card p-5 transition-all ${state==='approved' ? 'ring-2 ring-[var(--success)] bg-[var(--tint-success)]' : state==='rejected' ? 'ring-2 ring-[var(--error)] bg-[var(--tint-error)]' : ''}`}>
      <div className="flex items-start gap-4">
        {brand.logo ? (
          <img src={brand.logo} alt="" className="w-16 h-16 rounded-lg object-cover"/>
        ) : (
          <div className="w-16 h-16 rounded-lg bg-[var(--muted)] grid place-items-center text-white text-xl font-bold">{initial}</div>
        )}

        <div className="min-w-0 flex-grow-1">
          <div className="flex items-center justify-between gap-3">
            <div className="truncate">
              <div className="text-lg font-semibold truncate">{brand.name}</div>
              {brand.industry && <div className="text-xs text-[var(--muted-fg)]">{brand.industry}</div>}
            </div>
            {chip}
          </div>

          {brand.description && <p className="mt-2 text-sm text-[var(--muted-fg)] line-clamp-2">{brand.description}</p>}

          {brand.tags?.length ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {brand.tags.slice(0,3).map((t,i)=>(
                <span key={i} className="inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--card)] text-xs px-2 py-0.5 text-[var(--muted-fg)]">{t}</span>
              ))}
            </div>
          ) : null}

          {brand.matchScore && (
            <div className="mt-2 text-sm text-[var(--muted-fg)]">
              Match Score: <span className="font-medium text-[var(--fg)]">{brand.matchScore}%</span>
            </div>
          )}

          <div className="mt-4 flex gap-2">
            {state === 'pending' ? (
              <>
                <button onClick={onApprove} className="inline-flex h-8 items-center gap-1 rounded-md bg-[var(--brand-600)] px-3 text-xs text-white hover:bg-[var(--brand-600)]/90">
                  <Check className="w-3 h-3" /> Approve
                </button>
                <button onClick={onReject} className="inline-flex h-8 items-center gap-1 rounded-md bg-[var(--error)] px-3 text-xs text-white hover:bg-[var(--error)]/90">
                  <X className="w-3 h-3" /> Reject
                </button>
              </>
            ) : (
              <button onClick={onReset} className="inline-flex h-8 items-center gap-1 rounded-md bg-[var(--muted)] px-3 text-xs text-[var(--muted-fg)] hover:bg-[var(--muted)]/80">
                Reset
              </button>
            )}
            <button onClick={onDetails} className="inline-flex h-8 items-center gap-1 rounded-md border border-[var(--border)] bg-[var(--card)] px-3 text-xs text-[var(--muted-fg)] hover:bg-[var(--muted)]">
              <Info className="w-3 h-3" /> Details
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
