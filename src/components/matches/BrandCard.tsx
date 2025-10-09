'use client'
import * as React from 'react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import AiFeedbackButtons from '@/components/feedback/AiFeedbackButtons'
import AdaptiveBadge from '@/components/ui/AdaptiveBadge'
import BrandLogo from '@/components/media/BrandLogo'
import { Check, X, RotateCcw, Eye } from 'lucide-react'

export type UIMatchBrand = {
  id: string
  name: string
  logo?: string
  description?: string
  relevance?: string
  tags?: string[]
  matchScore: number
  industry?: string
  website?: string
}

type ApprovalState = 'pending' | 'approved' | 'rejected'

export default function BrandCard({
  brand,
  selected,
  onSelect,
  onDetails,
  approvalState,
  onApprove,
  onReject,
  onReset,
}: {
  brand: UIMatchBrand
  selected?: boolean
  onSelect?: (id: string) => void
  onDetails: (id: string) => void
  approvalState?: ApprovalState
  onApprove?: (id: string) => void
  onReject?: (id: string) => void
  onReset?: (id: string) => void
}) {
  // Determine visual state
  const isApproved = approvalState === 'approved'
  const isRejected = approvalState === 'rejected'
  const isPending = approvalState === 'pending'
  const isLegacyMode = approvalState === undefined

  // Card styling based on approval state
  const getCardClassName = () => {
    if (isApproved) {
      return 'card p-5 transition-all border-2 border-green-500 bg-green-50 shadow-md'
    }
    if (isRejected) {
      return 'card p-5 transition-all border-2 border-red-300 bg-red-50 opacity-60'
    }
    if (isPending) {
      return 'card p-5 transition-all border-2 border-gray-200 hover:shadow-lg'
    }
    // Legacy mode
    return `card p-5 transition-all ${selected ? 'ring-2 ring-[var(--brand-600)] bg-[var(--tint-accent)]' : ''}`
  }

  return (
    <div className={getCardClassName()}>
      <div className="flex items-start gap-4">
        <BrandLogo 
          name={brand.name}
          domain={brand.website ? new URL(brand.website).hostname : brand.logo}
          size={32}
        />
        <div className="min-w-0 flex-grow-1">
          <div className="flex items-center justify-between gap-3">
            <div className="truncate">
              <div className="text-lg font-semibold truncate">{brand.name}</div>
              {brand.industry && <div className="text-xs text-[var(--muted-fg)]">{brand.industry}</div>}
            </div>
            <div className="flex items-center gap-2">
              {/* Status Badge */}
              {isApproved && (
                <Badge className="bg-green-600 text-white border-green-600">
                  <Check className="w-3 h-3 mr-1" />
                  Approved
                </Badge>
              )}
              {isRejected && (
                <Badge className="bg-red-600 text-white border-red-600">
                  <X className="w-3 h-3 mr-1" />
                  Rejected
                </Badge>
              )}
              {/* Match Score */}
              <Badge className="bg-[var(--success)] text-white border-[var(--success)]">
                {brand.matchScore}% Match
              </Badge>
            </div>
          </div>

          {brand.description && <p className="mt-2 text-sm text-[var(--muted-fg)] line-clamp-2">{brand.description}</p>}

          {brand.tags?.length ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {brand.tags.slice(0,5).map((t,i)=>(
                <Badge key={i} variant="secondary" className="text-xs">{t}</Badge>
              ))}
            </div>
          ) : null}

          {brand.relevance && <p className="mt-2 text-sm text-[var(--muted-fg)]">{brand.relevance}</p>}

          {/* Action Buttons */}
          <div className="mt-3 flex gap-2">
            {/* PENDING STATE - Show Approve & Reject */}
            {isPending && (
              <>
                <Button 
                  size="sm" 
                  onClick={() => onApprove?.(brand.id)}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  <Check className="w-4 h-4 mr-1" />
                  Approve
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => onReject?.(brand.id)}
                  className="bg-red-50 hover:bg-red-100 text-red-700 border-red-300"
                >
                  <X className="w-4 h-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => onDetails(brand.id)}
                >
                  <Eye className="w-4 h-4" />
                </Button>
              </>
            )}

            {/* APPROVED STATE - Show Reset */}
            {isApproved && (
              <>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => onReset?.(brand.id)}
                  className="flex-1 text-gray-600 hover:text-gray-800"
                >
                  <RotateCcw className="w-4 h-4 mr-1" />
                  Reset
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => onDetails(brand.id)}
                >
                  <Eye className="w-4 h-4" />
                </Button>
              </>
            )}

            {/* REJECTED STATE - Show Reset */}
            {isRejected && (
              <>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => onReset?.(brand.id)}
                  className="flex-1 text-gray-600 hover:text-gray-800"
                >
                  <RotateCcw className="w-4 h-4 mr-1" />
                  Reset
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => onDetails(brand.id)}
                >
                  <Eye className="w-4 h-4" />
                </Button>
              </>
            )}

            {/* LEGACY MODE - Show Select button (backwards compatible) */}
            {isLegacyMode && onSelect && (
              <>
                <Button 
                  size="sm" 
                  variant={selected ? 'secondary' : 'primary'} 
                  onClick={() => onSelect(brand.id)}
                >
                  {selected ? 'Selected' : 'Select Brand'}
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => onDetails(brand.id)}
                >
                  View Details
                </Button>
              </>
            )}
          </div>
          
          {/* AI Feedback Integration */}
          <div className="mt-3 pt-3 border-t border-[var(--border)]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[var(--muted-fg)]">How was this match?</span>
              <AdaptiveBadge />
            </div>
            <AiFeedbackButtons 
              type="MATCH" 
              targetId={brand.id}
              className="justify-start"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
