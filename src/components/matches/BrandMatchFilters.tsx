'use client'
import * as React from 'react'
import { Button } from '@/components/ui/Button'
import { MapPin, Globe, Sparkles } from 'lucide-react'

type TabType = 'all' | 'local' | 'national'

export interface BrandFilters {
  brandSize: string
  dealType: string
  matchScore: string
  industry: string
  search: string
  sortBy: string
}

interface BrandMatchFiltersProps {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
  onGenerateMore: () => void
  counts: {
    all: number
    local: number
    national: number
  }
  hasLocation: boolean
  filters: BrandFilters
  onFiltersChange: (filters: BrandFilters) => void
}

export default function BrandMatchFilters({
  activeTab,
  onTabChange,
  onGenerateMore,
  counts,
  hasLocation,
  filters,
  onFiltersChange,
}: BrandMatchFiltersProps) {
  const updateFilter = (key: keyof BrandFilters, value: string) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  return (
    <div className="space-y-4">
      {/* Tabs + Generate Button Row */}
      <div className="flex items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex items-center gap-2 bg-[var(--card)] border border-[var(--border)] rounded-lg p-1">
          {/* All Tab */}
          <button
            onClick={() => onTabChange('all')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'all'
                ? 'bg-[var(--brand-600)] text-white'
                : 'text-[var(--fg)] hover:bg-[var(--tint-accent)]'
            }`}
          >
            All Brands ({counts.all})
          </button>

          {/* Local Tab (only show if hasLocation) */}
          {hasLocation && (
            <button
              onClick={() => onTabChange('local')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors inline-flex items-center gap-2 ${
                activeTab === 'local'
                  ? 'bg-[var(--brand-600)] text-white'
                  : 'text-[var(--fg)] hover:bg-[var(--tint-accent)]'
              }`}
            >
              <MapPin className="w-4 h-4" />
              Local ({counts.local})
            </button>
          )}

          {/* National Tab */}
          <button
            onClick={() => onTabChange('national')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors inline-flex items-center gap-2 ${
              activeTab === 'national'
                ? 'bg-[var(--brand-600)] text-white'
                : 'text-[var(--fg)] hover:bg-[var(--tint-accent)]'
            }`}
          >
            <Globe className="w-4 h-4" />
            National ({counts.national})
          </button>
        </div>

        {/* Generate More Button */}
        <Button onClick={onGenerateMore} className="inline-flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          Generate More
        </Button>
      </div>

      {/* Filter Dropdowns Row */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Brand Size Filter */}
        <select
          className="h-10 px-3 rounded-md border border-[var(--border)] bg-[var(--card)] text-sm min-w-[150px]"
          value={filters.brandSize}
          onChange={(e) => updateFilter('brandSize', e.target.value)}
        >
          <option value="all">All Sizes</option>
          <option value="Enterprise">🏢 Enterprise</option>
          <option value="Large">🏪 Large</option>
          <option value="Medium">🏬 Mid-Market</option>
          <option value="Small">🏠 Small</option>
          <option value="Startup">🚀 Startup</option>
        </select>

        {/* Deal Type Filter */}
        <select
          className="h-10 px-3 rounded-md border border-[var(--border)] bg-[var(--card)] text-sm min-w-[160px]"
          value={filters.dealType}
          onChange={(e) => updateFilter('dealType', e.target.value)}
        >
          <option value="all">All Deal Types</option>
          <option value="sponsorship">💰 Sponsorship</option>
          <option value="affiliate">🤝 Affiliate</option>
          <option value="long-term">📅 Long-term</option>
          <option value="one-time">⚡ One-time</option>
        </select>

        {/* Match Score Filter */}
        <select
          className="h-10 px-3 rounded-md border border-[var(--border)] bg-[var(--card)] text-sm min-w-[140px]"
          value={filters.matchScore}
          onChange={(e) => updateFilter('matchScore', e.target.value)}
        >
          <option value="all">All Scores</option>
          <option value="90">🔥 90%+ Match</option>
          <option value="80">✨ 80%+ Match</option>
          <option value="70">👍 70%+ Match</option>
          <option value="60">👌 60%+ Match</option>
        </select>

        {/* Industry Filter */}
        <select
          className="h-10 px-3 rounded-md border border-[var(--border)] bg-[var(--card)] text-sm min-w-[150px]"
          value={filters.industry}
          onChange={(e) => updateFilter('industry', e.target.value)}
        >
          <option value="all">All Industries</option>
          <option value="tech">Technology</option>
          <option value="social">Social Media</option>
          <option value="marketing">Marketing</option>
          <option value="ecommerce">E-commerce</option>
          <option value="fitness">Fitness & Sports</option>
          <option value="food">Food & Beverage</option>
          <option value="beauty">Beauty & Wellness</option>
          <option value="fashion">Fashion & Apparel</option>
        </select>

        {/* Search Input */}
        <input
          type="text"
          placeholder="Search brands..."
          className="flex-1 min-w-[200px] h-10 px-3 rounded-md border border-[var(--border)] bg-[var(--card)] text-sm"
          value={filters.search}
          onChange={(e) => updateFilter('search', e.target.value)}
        />
        
        {/* Sort By Dropdown */}
        <select
          className="h-10 px-3 rounded-md border border-[var(--border)] bg-[var(--card)] text-sm min-w-[160px]"
          value={filters.sortBy}
          onChange={(e) => updateFilter('sortBy', e.target.value)}
        >
          <option value="score-desc">🔥 Match Score (High)</option>
          <option value="score-asc">Match Score (Low)</option>
          <option value="deal-value-desc">💰 Deal Value (High)</option>
          <option value="deal-value-asc">Deal Value (Low)</option>
          <option value="recent-activity">🕒 Recent Activity</option>
          <option value="name-asc">📝 Name (A-Z)</option>
          <option value="name-desc">Name (Z-A)</option>
        </select>
        
        {/* Clear Filters Button (show if any filter is active) */}
        {(filters.brandSize !== 'all' || 
          filters.dealType !== 'all' || 
          filters.matchScore !== 'all' || 
          filters.industry !== 'all' || 
          filters.search !== '' ||
          filters.sortBy !== 'score-desc') && (
          <button
            onClick={() => onFiltersChange({
              brandSize: 'all',
              dealType: 'all',
              matchScore: 'all',
              industry: 'all',
              search: '',
              sortBy: 'score-desc'
            })}
            className="h-10 px-4 rounded-md border border-[var(--border)] bg-[var(--card)] text-sm text-[var(--fg)] hover:bg-[var(--tint-accent)] transition-colors"
          >
            Clear Filters
          </button>
        )}
      </div>
    </div>
  )
}

