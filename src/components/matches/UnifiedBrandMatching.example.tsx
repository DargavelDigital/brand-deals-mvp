/**
 * Example: Unified Brand Matching Page
 * 
 * This demonstrates how all the new components work together
 * for a complete brand matching + approval experience.
 */

'use client'
import * as React from 'react'
import { useBrandMatchFlow } from '@/hooks/useBrandMatchFlow'
import BrandCard from './BrandCard'
import BrandMatchProgress from './BrandMatchProgress'
import BrandMatchFilters from './BrandMatchFilters'
import BrandMatchActionBar from './BrandMatchActionBar'
import RejectedBrandsDrawer from './RejectedBrandsDrawer'
import BrandDetailsDrawer from './BrandDetailsDrawer'
import { Button } from '@/components/ui/Button'
import { Trash2 } from 'lucide-react'

type TabType = 'all' | 'local' | 'national'

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
    canContinue,
    rejectedBrands,
  } = useBrandMatchFlow()

  // Local UI state
  const [activeTab, setActiveTab] = React.useState<TabType>('all')
  const [rejectedDrawerOpen, setRejectedDrawerOpen] = React.useState(false)
  const [detailsDrawer, setDetailsDrawer] = React.useState<{
    open: boolean
    brand?: any
  }>({ open: false })

  // Filter matches by tab
  const filteredMatches = React.useMemo(() => {
    if (activeTab === 'all') return matches
    
    if (activeTab === 'local') {
      return matches.filter((m) => m.geo?.distanceKm !== undefined)
    }
    
    if (activeTab === 'national') {
      return matches.filter((m) => m.geo?.distanceKm === undefined)
    }
    
    return matches
  }, [matches, activeTab])

  // Calculate counts for tabs
  const tabCounts = React.useMemo(() => ({
    all: matches.length,
    local: matches.filter((m) => m.geo?.distanceKm !== undefined).length,
    national: matches.filter((m) => m.geo?.distanceKm === undefined).length,
  }), [matches])

  // Check if user has location (for showing local tab)
  const hasLocation = tabCounts.local > 0

  // Handle generate more
  const handleGenerateMore = () => {
    generate({
      includeLocal: activeTab === 'local',
      limit: 12,
    })
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] pb-24">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Brand Matching</h1>
          <p className="text-[var(--muted-fg)] mt-2">
            Discover and approve brands for your campaign in one place
          </p>
        </div>

        {/* Progress Section */}
        <BrandMatchProgress stats={stats} canContinue={canContinue} />

        {/* Filters Section */}
        <BrandMatchFilters
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onGenerateMore={handleGenerateMore}
          counts={tabCounts}
          hasLocation={hasLocation}
        />

        {/* View Rejected Brands Button */}
        {stats.rejected > 0 && (
          <div className="flex justify-end">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setRejectedDrawerOpen(true)}
              className="inline-flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              View Rejected Brands ({stats.rejected})
            </Button>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            <div className="font-medium">Error</div>
            <div className="text-sm mt-1">{error}</div>
          </div>
        )}

        {/* Loading State */}
        {generating && (
          <div className="text-center py-12">
            <div className="inline-flex items-center gap-3 px-6 py-4 bg-white rounded-lg shadow-sm">
              <div className="animate-spin h-5 w-5 border-2 border-[var(--brand-600)] border-t-transparent rounded-full" />
              <span className="text-lg">Generating matches...</span>
            </div>
          </div>
        )}

        {/* Brand Cards Grid */}
        {filteredMatches.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMatches.map((brand) => (
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
                approvalState={approvalStates[brand.id]}
                onApprove={approve}
                onReject={reject}
                onReset={reset}
                onDetails={(id) => {
                  const brandData = matches.find((m) => m.id === id)
                  setDetailsDrawer({ open: true, brand: brandData })
                }}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!generating && filteredMatches.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-medium mb-2">No brands found</h3>
            <p className="text-[var(--muted-fg)] mb-4">
              {activeTab === 'local'
                ? 'No local brands found. Try generating more or switch to All Brands.'
                : activeTab === 'national'
                ? 'No national brands found. Try generating more or switch to All Brands.'
                : 'Click "Generate More" to discover aligned brands.'}
            </p>
            <Button onClick={handleGenerateMore} disabled={generating}>
              Generate Brands
            </Button>
          </div>
        )}
      </div>

      {/* Sticky Action Bar (always visible) */}
      <BrandMatchActionBar
        approvedCount={stats.approved}
        canContinue={canContinue}
        saving={saving}
        onSaveAndAdvance={saveAndAdvance}
      />

      {/* Rejected Brands Drawer */}
      <RejectedBrandsDrawer
        brands={rejectedBrands}
        approvalStates={approvalStates}
        open={rejectedDrawerOpen}
        onOpenChange={setRejectedDrawerOpen}
        onReset={reset}
      />

      {/* Brand Details Drawer */}
      <BrandDetailsDrawer
        open={detailsDrawer.open}
        onClose={() => setDetailsDrawer({ open: false })}
        brand={detailsDrawer.brand}
      />
    </div>
  )
}

