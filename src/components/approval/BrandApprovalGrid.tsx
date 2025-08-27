'use client'
import * as React from 'react'
import BrandApprovalCard, { type ApprovalState } from './BrandApprovalCard'

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

export default function BrandApprovalGrid({
  brands, approvalStates, onApprove, onReject, onReset, onDetails,
}: {
  brands: BrandLite[]
  approvalStates: Record<string, ApprovalState>
  onApprove: (id: string) => void
  onReject: (id: string) => void
  onReset: (id: string) => void
  onDetails: (id: string) => void
}) {
  if (!brands.length) {
    return (
      <div className="text-center py-12 text-[var(--muted-fg)]">
        <div className="text-lg font-medium mb-2">No brands to approve</div>
        <div className="text-sm">Go back to Generate Matches to select brands first</div>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {brands.map(brand => (
        <BrandApprovalCard
          key={brand.id}
          brand={brand}
          state={approvalStates[brand.id] || 'pending'}
          onApprove={() => onApprove(brand.id)}
          onReject={() => onReject(brand.id)}
          onReset={() => onReset(brand.id)}
          onDetails={() => onDetails(brand.id)}
        />
      ))}
    </div>
  )
}
