'use client'
import * as React from 'react'
import type { RankedBrand } from '@/types/match'
import BrandCard from './BrandCard'
import { X, Frown } from 'lucide-react'

interface RejectedBrandsDrawerProps {
  brands: RankedBrand[]
  approvalStates: Record<string, 'pending' | 'approved' | 'rejected'>
  open: boolean
  onOpenChange: (open: boolean) => void
  onReset: (id: string) => void
}

export default function RejectedBrandsDrawer({
  brands,
  approvalStates,
  open,
  onOpenChange,
  onReset,
}: RejectedBrandsDrawerProps) {
  // Filter for rejected brands
  const rejectedBrands = brands.filter(
    (brand) => approvalStates[brand.id] === 'rejected'
  )

  if (!open) return null

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={() => onOpenChange(false)}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-2xl bg-white shadow-2xl z-50 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-[var(--border)] px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Rejected Brands</h2>
            <p className="text-sm text-[var(--muted-fg)] mt-1">
              {rejectedBrands.length} brand{rejectedBrands.length !== 1 ? 's' : ''} rejected
            </p>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close drawer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {rejectedBrands.length > 0 ? (
            <div className="space-y-4">
              {rejectedBrands.map((brand) => (
                <BrandCard
                  key={brand.id}
                  brand={{
                    id: brand.id,
                    name: brand.name,
                    logo: brand.domain,
                    description: brand.rationale,
                    tags: brand.categories,
                    matchScore: brand.score,
                    industry: brand.categories?.[0],
                    website: brand.domain ? `https://${brand.domain}` : undefined,
                  }}
                  approvalState="rejected"
                  onReset={onReset}
                  onDetails={(id) => console.log('View details:', id)}
                />
              ))}
            </div>
          ) : (
            // Empty State
            <div className="text-center py-16">
              <Frown className="w-16 h-16 mx-auto text-[var(--muted-fg)] mb-4" />
              <h3 className="text-lg font-medium mb-2">No rejected brands yet</h3>
              <p className="text-[var(--muted-fg)]">
                Brands you reject will appear here
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

