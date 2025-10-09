'use client'
import * as React from 'react'
import { useBrandMatchFlow } from '@/hooks/useBrandMatchFlow'
import BrandCard from '@/components/matches/BrandCard'
import BrandMatchProgress from '@/components/matches/BrandMatchProgress'
import BrandMatchFilters from '@/components/matches/BrandMatchFilters'
import BrandMatchActionBar from '@/components/matches/BrandMatchActionBar'
import RejectedBrandsDrawer from '@/components/matches/RejectedBrandsDrawer'
import BrandDetailsDrawer from '@/components/matches/BrandDetailsDrawer'
import { Card } from '@/components/ui/Card'
import { ProgressBeacon } from '@/components/ui/ProgressBeacon'
import { isToolEnabled } from '@/lib/launch'
import { ComingSoon } from '@/components/ComingSoon'
import PageShell from '@/components/PageShell'
import { Sparkles, Trash2 } from 'lucide-react'
import type { UIMatchBrand } from '@/components/matches/BrandCard'

type TabType = 'all' | 'local' | 'national'

export default function UnifiedBrandMatchesPage() {
  const enabled = isToolEnabled('matches')

  // Check if tool is enabled
  if (!enabled) {
    return (
      <PageShell 
        title="Brand Matches" 
        subtitle="AI-powered brand recommendations based on your profile"
      >
        <div className="mx-auto max-w-md">
          <ComingSoon
            title="Brand Matches"
            subtitle="This tool will be enabled soon. The page is visible so you can navigate and preview the UI."
          />
        </div>
      </PageShell>
    )
  }

  // Use unified hook
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
  const [showRejected, setShowRejected] = React.useState(false)
  const [detailsDrawer, setDetailsDrawer] = React.useState<{
    open: boolean
    brand?: UIMatchBrand
  }>({ open: false })

  // Filter matches by tab
  const filteredMatches = React.useMemo(() => {
    if (activeTab === 'all') {
      return matches
    }
    
    if (activeTab === 'local') {
      // Local brands are from Google Places or Yelp
      return matches.filter((m) => m.source === 'google' || m.source === 'yelp')
    }
    
    if (activeTab === 'national') {
      // National brands are from other sources
      return matches.filter((m) => m.source !== 'google' && m.source !== 'yelp')
    }
    
    return matches
  }, [matches, activeTab])

  // Calculate counts for tabs
  const tabCounts = React.useMemo(() => ({
    all: matches.length,
    local: matches.filter((m) => m.source === 'google' || m.source === 'yelp').length,
    national: matches.filter((m) => m.source !== 'google' && m.source !== 'yelp').length,
  }), [matches])

  // Detect if user has location (check if any match has geo data)
  const hasLocation = React.useMemo(
    () => matches.some((m) => m.geo?.distanceKm !== undefined),
    [matches]
  )

  // Handle generate more
  const handleGenerateMore = () => {
    generate({
      includeLocal: activeTab === 'local' || activeTab === 'all',
      limit: 12,
    })
  }

  // Convert RankedBrand to UIMatchBrand
  const convertToUIBrand = (brand: typeof matches[0]): UIMatchBrand => ({
    id: brand.id,
    name: brand.name,
    logo: brand.domain,
    description: brand.rationale,
    tags: brand.categories,
    matchScore: brand.score,
    industry: brand.categories?.[0],
    website: brand.domain ? `https://${brand.domain}` : undefined,
  })

  return (
    <PageShell 
      title="🎯 Brand Matches" 
      subtitle="AI-powered brand recommendations based on your profile"
    >
      <div className="space-y-6 pb-24">
        {/* Progress Card */}
        <BrandMatchProgress stats={stats} canContinue={canContinue} />

        {/* Filters */}
        <BrandMatchFilters
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onGenerateMore={handleGenerateMore}
          counts={tabCounts}
          hasLocation={hasLocation}
        />

        {/* View Rejected Link */}
        {stats.rejected > 0 && (
          <div className="flex justify-end">
            <Card
              className="p-3 cursor-pointer hover:bg-[var(--tint-accent)] transition-colors inline-flex items-center gap-2"
              onClick={() => setShowRejected(true)}
            >
              <Trash2 className="w-4 h-4 text-red-600" />
              <span className="text-sm font-medium">
                View {stats.rejected} Rejected Brand{stats.rejected !== 1 ? 's' : ''} →
              </span>
            </Card>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <Card className="p-4 bg-red-50 border-red-200 text-red-800">
            <div className="font-medium">Error</div>
            <div className="text-sm mt-1">{error}</div>
          </Card>
        )}

        {/* Loading State */}
        {generating && (
          <div className="text-center py-12">
            <Card className="inline-flex items-center gap-3 px-6 py-4">
              <ProgressBeacon />
              <span className="text-lg font-medium">Generating brand matches...</span>
            </Card>
          </div>
        )}

        {/* Brand Cards Grid */}
        {filteredMatches.length > 0 && !generating && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMatches.map((brand) => (
              <BrandCard
                key={brand.id}
                brand={convertToUIBrand(brand)}
                approvalState={approvalStates[brand.id] || 'pending'}
                onApprove={approve}
                onReject={reject}
                onReset={reset}
                onDetails={(id) => {
                  const brandData = matches.find((m) => m.id === id)
                  if (brandData) {
                    setDetailsDrawer({ 
                      open: true, 
                      brand: convertToUIBrand(brandData)
                    })
                  }
                }}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!generating && filteredMatches.length === 0 && (
          <Card className="p-12 text-center">
            <div className="text-6xl mb-4">
              {activeTab === 'local' ? '📍' : activeTab === 'national' ? '🌍' : '🔍'}
            </div>
            <h3 className="text-xl font-medium mb-2">
              {activeTab === 'local'
                ? 'No local brands found'
                : activeTab === 'national'
                ? 'No national brands found'
                : 'No brand matches yet'}
            </h3>
            <p className="text-[var(--muted-fg)] mb-6">
              {activeTab === 'all'
                ? 'Click "Generate More" to discover brands that align with your audience & content.'
                : 'Try switching to "All Brands" or generate more matches.'}
            </p>
            <button
              onClick={handleGenerateMore}
              disabled={generating}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--brand-600)] hover:bg-[var(--brand-700)] text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Sparkles className="w-5 h-5" />
              {generating ? 'Generating...' : 'Generate Brands'}
            </button>
          </Card>
        )}
      </div>

      {/* Sticky Action Bar */}
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
        open={showRejected}
        onOpenChange={setShowRejected}
        onReset={reset}
      />

      {/* Brand Details Drawer */}
      <BrandDetailsDrawer
        open={detailsDrawer.open}
        onClose={() => setDetailsDrawer({ open: false })}
        brand={detailsDrawer.brand}
      />
    </PageShell>
  )
}
