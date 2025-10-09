/**
 * Example: Unified Brand Matching Component
 * 
 * This component demonstrates how to use the useBrandMatchFlow hook
 * to create a complete brand matching experience in a single view.
 */

'use client'
import * as React from 'react'
import { useBrandMatchFlow } from './useBrandMatchFlow'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Sparkles, Check, X, RotateCcw, ArrowRight, MapPin } from 'lucide-react'
import { ProgressBeacon } from '@/components/ui/ProgressBeacon'

export default function UnifiedBrandMatchingExample() {
  const {
    // State
    matches,
    approvalStates,
    generating,
    saving,
    error,
    
    // Actions
    generate,
    approve,
    reject,
    reset,
    saveAndAdvance,
    
    // Computed
    stats,
    canContinue
  } = useBrandMatchFlow()

  const [localOnly, setLocalOnly] = React.useState(true)
  const [searchKeywords, setSearchKeywords] = React.useState('')

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Brand Matching</h1>
        <p className="text-[var(--muted-fg)] mt-2">
          Discover and approve brands for your campaign
        </p>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-2xl font-semibold">{stats.total}</div>
          <div className="text-sm text-[var(--muted-fg)]">Total Matches</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-semibold text-green-600">{stats.approved}</div>
          <div className="text-sm text-[var(--muted-fg)]">Approved</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-semibold text-red-600">{stats.rejected}</div>
          <div className="text-sm text-[var(--muted-fg)]">Rejected</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-semibold text-yellow-600">{stats.pending}</div>
          <div className="text-sm text-[var(--muted-fg)]">Pending</div>
        </Card>
      </div>

      {/* Generate Controls */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Generate More Matches</h2>
        
        <div className="space-y-4">
          {/* Local Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setLocalOnly(!localOnly)}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                localOnly
                  ? 'bg-[var(--brand-600)] text-white border-[var(--brand-600)]'
                  : 'bg-[var(--card)] text-[var(--fg)] border-[var(--border)]'
              }`}
            >
              <MapPin className="inline w-4 h-4 mr-2" />
              {localOnly ? 'Local Only' : 'All Brands'}
            </button>
            
            <input
              type="text"
              value={searchKeywords}
              onChange={(e) => setSearchKeywords(e.target.value)}
              placeholder="Search keywords (comma-separated)..."
              className="flex-1 px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--card)]"
            />
          </div>

          {/* Generate Button */}
          <Button
            onClick={() => generate({
              includeLocal: localOnly,
              keywords: searchKeywords ? searchKeywords.split(',').map(k => k.trim()) : undefined,
              limit: 12
            })}
            disabled={generating}
            className="w-full"
          >
            {generating ? (
              <>
                <ProgressBeacon />
                <span className="ml-2">Generating Matches...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate {localOnly ? 'Local' : 'All'} Brands
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="p-4 bg-red-50 border-red-200 text-red-800">
          <div className="font-medium">Error</div>
          <div className="text-sm mt-1">{error}</div>
        </Card>
      )}

      {/* Matches Grid */}
      {matches.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {matches.map(brand => {
            const state = approvalStates[brand.id]
            const isApproved = state === 'approved'
            const isRejected = state === 'rejected'
            const isPending = state === 'pending'

            return (
              <Card
                key={brand.id}
                className={`p-5 transition-all ${
                  isApproved
                    ? 'ring-2 ring-green-500 bg-green-50'
                    : isRejected
                    ? 'ring-2 ring-red-500 bg-red-50 opacity-60'
                    : 'hover:shadow-lg'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{brand.name}</h3>
                    {brand.domain && (
                      <p className="text-xs text-[var(--muted-fg)]">{brand.domain}</p>
                    )}
                  </div>
                  <Badge 
                    className={`ml-2 ${
                      brand.score >= 80 
                        ? 'bg-green-600' 
                        : brand.score >= 60 
                        ? 'bg-yellow-600' 
                        : 'bg-gray-600'
                    } text-white`}
                  >
                    {brand.score}%
                  </Badge>
                </div>

                {/* Rationale */}
                <p className="text-sm text-[var(--muted-fg)] mb-3 line-clamp-2">
                  {brand.rationale}
                </p>

                {/* Pitch Idea */}
                {brand.pitchIdea && (
                  <div className="mb-3 p-2 bg-[var(--tint-accent)] rounded text-xs">
                    <span className="font-medium">Pitch: </span>
                    {brand.pitchIdea}
                  </div>
                )}

                {/* Categories */}
                {brand.categories && brand.categories.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {brand.categories.slice(0, 3).map((cat, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {cat}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Distance (for local brands) */}
                {brand.geo?.distanceKm && (
                  <div className="text-xs text-[var(--muted-fg)] mb-3">
                    <MapPin className="inline w-3 h-3 mr-1" />
                    ~{brand.geo.distanceKm} km away
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                  {isPending && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => approve(brand.id)}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => reject(brand.id)}
                        className="bg-red-100 hover:bg-red-200 text-red-800"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                  
                  {(isApproved || isRejected) && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => reset(brand.id)}
                      className="w-full"
                    >
                      <RotateCcw className="w-4 h-4 mr-1" />
                      Reset
                    </Button>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Empty State */}
      {matches.length === 0 && !generating && (
        <Card className="p-12 text-center">
          <Sparkles className="w-12 h-12 mx-auto text-[var(--muted-fg)] mb-4" />
          <h3 className="text-lg font-medium mb-2">No matches yet</h3>
          <p className="text-[var(--muted-fg)] mb-4">
            Click "Generate Matches" to discover aligned brands
          </p>
        </Card>
      )}

      {/* Continue Button (Sticky) */}
      {matches.length > 0 && (
        <div className="sticky bottom-4">
          <Card className="p-4 bg-[var(--tint-accent)] border-[var(--brand-600)]">
            <div className="flex items-center justify-between">
              <div className="text-sm">
                <span className="font-medium">{stats.approved}</span> brands approved
                {saving && (
                  <span className="ml-2 text-[var(--muted-fg)]">
                    <ProgressBeacon className="inline w-3 h-3" /> Auto-saving...
                  </span>
                )}
              </div>
              <Button
                onClick={saveAndAdvance}
                disabled={!canContinue || saving}
                className="inline-flex items-center gap-2"
              >
                Continue to Media Pack
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

