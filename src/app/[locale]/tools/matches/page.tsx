'use client'
import * as React from 'react'
import { useBrandMatchFlow } from '@/hooks/useBrandMatchFlow'
import BrandCard from '@/components/matches/BrandCard'
import BrandMatchProgress from '@/components/matches/BrandMatchProgress'
import BrandMatchFilters, { type BrandFilters } from '@/components/matches/BrandMatchFilters'
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
import { WorkflowProgress } from '@/components/ui/WorkflowProgress'

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
        {/* NEW: Workflow progress indicator */}
        <WorkflowProgress 
          currentStep={2} 
          steps={['Connect', 'Audit', 'Matches', 'Contacts', 'Pack', 'Outreach']}
        />
        
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
    errorDetails,
    
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
  
  // Filter state
  const [filters, setFilters] = React.useState<BrandFilters>({
    brandSize: 'all',
    dealType: 'all',
    matchScore: 'all',
    industry: 'all',
    search: '',
    sortBy: 'score-desc'
  })

  // Filter matches by tab AND filters
  const filteredMatches = React.useMemo(() => {
    let filtered = matches
    
    // Apply tab filter
    if (activeTab === 'local') {
      filtered = filtered.filter((m) => m.source === 'google' || m.source === 'yelp')
    } else if (activeTab === 'national') {
      filtered = filtered.filter((m) => m.source !== 'google' && m.source !== 'yelp')
    }
    
    // Apply brand size filter
    if (filters.brandSize !== 'all') {
      filtered = filtered.filter((m) => (m as any).companySize === filters.brandSize)
    }
    
    // Apply match score filter
    if (filters.matchScore !== 'all') {
      const minScore = parseInt(filters.matchScore)
      filtered = filtered.filter((m) => m.score >= minScore)
    }
    
    // Apply industry filter
    if (filters.industry !== 'all') {
      filtered = filtered.filter((m) => 
        m.categories?.some(cat => cat.toLowerCase().includes(filters.industry.toLowerCase()))
      )
    }
    
    // Apply search filter
    if (filters.search.trim()) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter((m) => 
        m.name.toLowerCase().includes(searchLower) ||
        m.rationale?.toLowerCase().includes(searchLower) ||
        m.categories?.some(cat => cat.toLowerCase().includes(searchLower))
      )
    }
    
    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (filters.sortBy) {
        case 'score-desc':
          return b.score - a.score
        case 'score-asc':
          return a.score - b.score
        case 'deal-value-desc':
          // Extract numeric value from dealValueRange (e.g., "$2,000-$5,000" -> 5000)
          const aMax = extractMaxDealValue((a as any).dealValueRange)
          const bMax = extractMaxDealValue((b as any).dealValueRange)
          return bMax - aMax
        case 'deal-value-asc':
          const aMin = extractMinDealValue((a as any).dealValueRange)
          const bMin = extractMinDealValue((b as any).dealValueRange)
          return aMin - bMin
        case 'recent-activity':
          // Brands with recentActivity field come first
          const aHasActivity = !!(a as any).recentActivity
          const bHasActivity = !!(b as any).recentActivity
          if (aHasActivity && !bHasActivity) return -1
          if (!aHasActivity && bHasActivity) return 1
          return 0
        case 'name-asc':
          return a.name.localeCompare(b.name)
        case 'name-desc':
          return b.name.localeCompare(a.name)
        default:
          return 0
      }
    })
    
    return sorted
  }, [matches, activeTab, filters])
  
  // Helper function to extract max deal value from range string
  const extractMaxDealValue = (dealValueRange?: string): number => {
    if (!dealValueRange) return 0
    const match = dealValueRange.match(/\$[\d,]+-\$?([\d,]+)/)
    if (match) {
      return parseInt(match[1].replace(/,/g, ''))
    }
    // Try single value like "$5,000"
    const singleMatch = dealValueRange.match(/\$([\d,]+)/)
    if (singleMatch) {
      return parseInt(singleMatch[1].replace(/,/g, ''))
    }
    return 0
  }
  
  // Helper function to extract min deal value from range string
  const extractMinDealValue = (dealValueRange?: string): number => {
    if (!dealValueRange) return 0
    const match = dealValueRange.match(/\$([\d,]+)/)
    if (match) {
      return parseInt(match[1].replace(/,/g, ''))
    }
    return 0
  }

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
    // Add Perplexity-specific fields if available
    verified: brand.source === 'perplexity' || brand.source === 'seed',
    companySize: (brand as any).companySize,
    knownForInfluencerMarketing: (brand as any).knownForInfluencerMarketing,
    source: brand.source,
  })

  return (
    <PageShell 
      title="🎯 Brand Matches" 
      subtitle="AI-powered brand recommendations based on your profile"
    >
      {/* NEW: Workflow progress indicator */}
      <WorkflowProgress 
        currentStep={2} 
        steps={['Connect', 'Audit', 'Matches', 'Contacts', 'Pack', 'Outreach']}
      />
      
      <div className="space-y-6 pb-24">
        {/* Progress Card */}
        <BrandMatchProgress stats={stats} canContinue={canContinue} />

        {/* Filters and Actions */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <BrandMatchFilters
              activeTab={activeTab}
              onTabChange={setActiveTab}
              onGenerateMore={handleGenerateMore}
              counts={tabCounts}
              hasLocation={hasLocation}
              filters={filters}
              onFiltersChange={setFilters}
            />
          </div>
          
          {/* Start Fresh Button */}
          {matches.length > 0 && (
            <button
              onClick={async () => {
                if (!confirm('⚠️ This will reset your workflow and clear all brand matches and approvals.\n\nAre you sure you want to start fresh?')) {
                  return;
                }
                
                try {
                  console.log('🔄 Resetting workflow...');
                  const response = await fetch('/api/brand-run/reset', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                  });
                  
                  const result = await response.json();
                  
                  if (result.success) {
                    console.log('✅ Workflow reset:', result.deleted);
                    alert('✅ Workflow reset! Refreshing page...');
                    window.location.reload();
                  } else {
                    console.error('❌ Reset failed:', result.error);
                    alert('❌ Failed to reset workflow: ' + result.error);
                  }
                } catch (error) {
                  console.error('❌ Reset error:', error);
                  alert('❌ Failed to reset workflow');
                }
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium whitespace-nowrap"
            >
              🔄 Start Fresh
            </button>
          )}
        </div>

        {/* View Rejected Link */}
        {stats.rejected > 0 && (
          <div className="flex justify-end">
            <Card
              className="p-3 cursor-pointer hover:bg-[var(--tint-accent)] transition-colors inline-flex items-center gap-2"
              onClick={() => setShowRejected(true)}
            >
              <Trash2 className="w-4 h-4 text-[var(--ds-error)]" />
              <span className="text-sm font-medium">
                View {stats.rejected} Rejected Brand{stats.rejected !== 1 ? 's' : ''} →
              </span>
            </Card>
          </div>
        )}

        {/* Error Display */}
        {error && errorDetails && (
          <Card className="p-6 bg-gray-50 border-2 border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Account Requirements for Brand Matching
            </h3>
            
            {errorDetails.requirements && errorDetails.requirements.length > 0 && (
              <div className="space-y-3 mb-6">
                {errorDetails.requirements.map((req, i) => {
                  console.log('🔍 Rendering requirement:', req);
                  return (
                    <div key={i} className="p-3 bg-white rounded border border-gray-200">
                      <div className="flex items-start gap-3">
                        <div className={`font-bold text-lg ${req.met ? 'text-green-600' : 'text-red-600'}`}>
                          {req.met ? '✓' : '×'}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{req.label || 'Missing Label'}</div>
                          <div className="text-sm text-gray-600 mt-1">{req.current || 'Missing Current'}</div>
                          {!req.met && req.needed && (
                            <div className="text-sm text-red-600 mt-1 font-medium">{req.needed}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            
            {errorDetails.tips && errorDetails.tips.length > 0 && (
              <div className="border-t border-gray-200 pt-4">
                <h4 className="font-semibold text-gray-900 mb-3">Next Steps:</h4>
                <ul className="space-y-2">
                  {errorDetails.tips.map((tip, i) => (
                    <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="text-gray-400">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Card>
        )}
        
        {/* Fallback Error Display (for errors without details) */}
        {error && !errorDetails && (
          <Card className="p-4 bg-[var(--ds-error-light)] border-[var(--ds-error)] text-[var(--ds-error-hover)]">
            <div className="font-medium">Error</div>
            <div className="text-sm mt-1">{error}</div>
          </Card>
        )}

        {/* Loading State */}
        {generating && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
            <Card className="px-8 py-6 max-w-md">
              <div className="text-center space-y-2">
                <p className="text-lg font-semibold text-gray-900">
                  🔍 Researching real brands for you...
                </p>
                <p className="text-sm text-gray-600">
                  This takes 30-60 seconds to find accurate, verified brands using AI-powered web research.
                </p>
              </div>
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
          <Card className="p-8 text-center">
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
