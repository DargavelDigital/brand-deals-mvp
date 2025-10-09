'use client'
import * as React from 'react'
import { Button } from '@/components/ui/Button'
import { MapPin, Globe, Sparkles } from 'lucide-react'

type TabType = 'all' | 'local' | 'national'

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
}

export default function BrandMatchFilters({
  activeTab,
  onTabChange,
  onGenerateMore,
  counts,
  hasLocation,
}: BrandMatchFiltersProps) {
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
      <div className="flex items-center gap-3">
        {/* Industry Filter */}
        <select
          className="h-10 px-3 rounded-md border border-[var(--border)] bg-[var(--card)] text-sm min-w-[150px]"
          defaultValue="all"
        >
          <option value="all">All Industries</option>
          <option value="tech">Technology</option>
          <option value="fitness">Fitness & Sports</option>
          <option value="food">Food & Beverage</option>
          <option value="beauty">Beauty & Wellness</option>
          <option value="fashion">Fashion & Apparel</option>
        </select>

        {/* Match Score Filter */}
        <select
          className="h-10 px-3 rounded-md border border-[var(--border)] bg-[var(--card)] text-sm min-w-[150px]"
          defaultValue="all"
        >
          <option value="all">All Scores</option>
          <option value="90">90%+ Match</option>
          <option value="80">80%+ Match</option>
          <option value="70">70%+ Match</option>
          <option value="60">60%+ Match</option>
        </select>

        {/* Search Input */}
        <input
          type="text"
          placeholder="Search brands..."
          className="flex-1 h-10 px-3 rounded-md border border-[var(--border)] bg-[var(--card)] text-sm"
        />
      </div>
    </div>
  )
}

