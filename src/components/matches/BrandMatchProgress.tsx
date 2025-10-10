'use client'
import * as React from 'react'
import { Card } from '@/components/ui/Card'
import { CheckCircle, AlertTriangle } from 'lucide-react'

interface BrandMatchProgressStats {
  approved: number
  rejected: number
  pending: number
  total: number
}

interface BrandMatchProgressProps {
  stats: BrandMatchProgressStats
  canContinue: boolean
}

export default function BrandMatchProgress({ stats, canContinue }: BrandMatchProgressProps) {
  // Calculate progress percentage
  const processedCount = stats.approved + stats.rejected
  const progressPercentage = stats.total > 0 ? (processedCount / stats.total) * 100 : 0

  return (
    <Card className="p-6 bg-[var(--ds-primary-light)] border-[var(--ds-primary)]">
      <div className="space-y-4">
        {/* Stats Display */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-[var(--ds-success)]">{stats.approved}</div>
              <div className="text-sm text-[var(--muted-fg)]">Approved</div>
            </div>
            <div className="text-2xl text-[var(--muted-fg)]">•</div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[var(--ds-error)]">{stats.rejected}</div>
              <div className="text-sm text-[var(--muted-fg)]">Rejected</div>
            </div>
            <div className="text-2xl text-[var(--muted-fg)]">•</div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[var(--ds-warning)]">{stats.pending}</div>
              <div className="text-sm text-[var(--muted-fg)]">Pending</div>
            </div>
          </div>

          {/* Status Indicator */}
          <div className="flex items-center gap-2">
            {canContinue ? (
              <div className="flex items-center gap-2 px-4 py-2 bg-[var(--ds-success-light)] text-[var(--ds-success-hover)] rounded-lg">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Ready to continue</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-4 py-2 bg-[var(--ds-warning-light)] text-[var(--ds-warning-hover)] rounded-lg">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-medium">Need at least 1 approved brand to continue</span>
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--muted-fg)]">
              Progress: {processedCount} of {stats.total} brands reviewed
            </span>
            <span className="font-medium">{Math.round(progressPercentage)}%</span>
          </div>
          
          {/* Custom Progress Bar */}
          <div className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-[var(--ds-primary)] transition-all duration-300 ease-in-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>
    </Card>
  )
}

