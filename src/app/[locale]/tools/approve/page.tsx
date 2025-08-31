'use client'
import * as React from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import BrandApprovalGrid from '@/components/approval/BrandApprovalGrid'
import ApprovalProgress from '@/components/approval/ApprovalProgress'
import useBrandApproval from '@/components/approval/useBrandApproval'
import { CheckCircle, ArrowRight, RefreshCw } from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'
import { ProgressBeacon } from '@/components/ui/ProgressBeacon'
import { toast } from '@/hooks/useToast'

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
        <Breadcrumbs items={[
          { label: 'Tools', href: '/tools' },
          { label: 'Approve Brands' }
        ]} />
        
        <div className="text-center py-12">
          <ProgressBeacon label="Loading brands..." />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[
        { label: 'Tools', href: '/tools' },
        { label: 'Approve Brands' }
      ]} />
      
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
                {saving ? (
                  <div className="flex items-center gap-2">
                    <ProgressBeacon />
                    Saving...
                  </div>
                ) : (
                  'Save Progress'
                )}
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
        <EmptyState 
          icon={CheckCircle}
          title="No brands selected" 
          description="Go back to Generate Matches to select brands first."
          action={
            <Button variant="secondary" onClick={() => window.history.back()}>
              Back to Generate Matches
            </Button>
          }
        />
      )}
    </div>
  )
}
