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
  // Perplexity-specific fields
  verified?: boolean
  companySize?: 'Startup' | 'Small' | 'Medium' | 'Large' | 'Enterprise'
  knownForInfluencerMarketing?: boolean
  source?: string
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
      return 'card p-5 transition-all duration-200 border-2 border-[var(--ds-success)] bg-[var(--ds-success-light)] shadow-md hover:shadow-lg hover:-translate-y-1'
    }
    if (isRejected) {
      return 'card p-5 transition-all duration-200 border-2 border-[var(--ds-error)] bg-[var(--ds-error-light)] opacity-60'
    }
    if (isPending) {
      return 'card p-5 transition-all duration-200 border-2 border-gray-200 hover:shadow-lg hover:-translate-y-1'
    }
    // Legacy mode
    return `card p-5 transition-all duration-200 hover:shadow-lg hover:-translate-y-1 ${selected ? 'ring-2 ring-[var(--brand-600)] bg-[var(--tint-accent)]' : ''}`
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
              <div className="flex items-center gap-2">
                <div className="text-lg font-semibold truncate">{brand.name}</div>
                {/* Verified Badge for Perplexity brands */}
                {brand.verified && (
                  <Badge className="bg-blue-500 text-white border-blue-500 text-xs whitespace-nowrap">
                    ✓ Verified
                  </Badge>
                )}
              </div>
              {brand.industry && <div className="text-xs text-[var(--muted-fg)]">{brand.industry}</div>}
            </div>
            <div className="flex items-center gap-2">
              {/* Status Badge */}
              {isApproved && (
                <Badge className="bg-[var(--ds-success)] text-white border-[var(--ds-success)]">
                  <Check className="w-3 h-3 mr-1" />
                  Approved
                </Badge>
              )}
              {isRejected && (
                <Badge className="bg-[var(--ds-error)] text-white border-[var(--ds-error)]">
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

          {/* Website Link */}
          {brand.website && (
            <a 
              href={brand.website} 
              target="_blank" 
              rel="noopener noreferrer"
              className="mt-2 text-sm text-blue-600 hover:text-blue-800 hover:underline block"
            >
              {brand.website.replace(/^https?:\/\//, '')}
            </a>
          )}

          {/* Company Details (Perplexity) */}
          {(brand.companySize || brand.knownForInfluencerMarketing) && (
            <div className="mt-3 flex flex-wrap gap-2">
              {brand.companySize && (
                <Badge variant="secondary" className="text-xs">
                  {brand.companySize}
                </Badge>
              )}
              {brand.knownForInfluencerMarketing && (
                <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700 border-purple-200">
                  Works with Influencers
                </Badge>
              )}
            </div>
          )}

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
                  className="flex-1 bg-[var(--ds-success)] hover:bg-[var(--ds-success-hover)] text-white"
                >
                  <Check className="w-4 h-4 mr-1" />
                  Approve
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => onReject?.(brand.id)}
                  className="bg-[var(--ds-error-light)] hover:bg-[var(--ds-error-light)] text-[var(--ds-error)] border-[var(--ds-error)]"
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
