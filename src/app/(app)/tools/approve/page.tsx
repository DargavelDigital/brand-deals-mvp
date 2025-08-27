'use client'
import * as React from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import BrandApprovalGrid from '@/components/approval/BrandApprovalGrid'
import ApprovalProgress from '@/components/approval/ApprovalProgress'
import useBrandApproval from '@/components/approval/useBrandApproval'
import { CheckCircle, ArrowRight, RefreshCw } from 'lucide-react'

export default function ApproveBrandsPage() {
  const {
    brands,
    approvalStates,
    loading,
    saving,
    error,
    stats,
    approve,
    reject,
    reset,
    saveApprovals,
    advanceToNext,
    refresh
  } = useBrandApproval()

  const [showDetails, setShowDetails] = React.useState<string | null>(null)

  const handleDetails = (id: string) => {
    setShowDetails(showDetails === id ? null : id)
  }

  const handleAdvance = async () => {
    const success = await advanceToNext()
    if (success) {
      // Redirect to next step (Media Pack)
      window.location.href = '/tools/media-pack'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="w-8 h-8 mx-auto mb-3 border-4 border-[var(--brand-600)] border-t-transparent rounded-full animate-spin"/>
          <div className="text-[var(--muted-fg)]">Loading brands...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Approve Brands</h1>
          <p className="text-[var(--muted-fg)]">Review and approve the brands you selected for your campaign.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={refresh} disabled={loading}>
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Progress */}
      <Card className="p-6">
        <ApprovalProgress {...stats} />
      </Card>

      {/* Error */}
      {error && (
        <Card className="p-4 text-[var(--error)] bg-[var(--tint-error)] border-[var(--error)]">
          {error}
        </Card>
      )}

      {/* Brands Grid */}
      <BrandApprovalGrid
        brands={brands}
        approvalStates={approvalStates}
        onApprove={approve}
        onReject={reject}
        onReset={reset}
        onDetails={handleDetails}
      />

      {/* Action Bar */}
      {stats.total > 0 && (
        <Card className="p-4 bg-[var(--tint-accent)] border-[var(--brand-600)] sticky bottom-4">
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <span className="font-medium">{stats.approved}</span> brands approved
              {stats.rejected > 0 && (
                <span className="text-[var(--muted-fg)] ml-2">• {stats.rejected} rejected</span>
              )}
            </div>
            <div className="flex gap-2">
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={saveApprovals}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Progress'}
              </Button>
              <Button 
                onClick={handleAdvance}
                disabled={stats.approved === 0 || saving}
                className="inline-flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Continue to Media Pack
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Empty State */}
      {stats.total === 0 && (
        <Card className="p-8 text-center text-[var(--muted-fg)]">
          <div className="text-lg font-medium mb-2">No brands selected</div>
          <div className="text-sm mb-4">Go back to Generate Matches to select brands first</div>
          <Button variant="secondary" onClick={() => window.history.back()}>
            Back to Generate Matches
          </Button>
        </Card>
      )}
    </div>
  )
}
