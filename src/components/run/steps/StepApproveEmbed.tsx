'use client'
import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import BrandApprovalGrid from '@/components/approval/BrandApprovalGrid'
import ApprovalProgress from '@/components/approval/ApprovalProgress'
import useBrandApproval from '@/components/approval/useBrandApproval'
import { CheckCircle, ArrowRight, RefreshCw } from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'
import { ProgressBeacon } from '@/components/ui/ProgressBeacon'
import { toast } from '@/hooks/useToast'

interface StepApproveEmbedProps {
  workspaceId: string
  onDirtyChange: (dirty: boolean) => void
  data: any
  setData: (data: any) => void
  goNext: () => void
}

export default function StepApproveEmbed({ 
  workspaceId, 
  onDirtyChange, 
  data, 
  setData, 
  goNext 
}: StepApproveEmbedProps) {
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

  const [showDetails, setShowDetails] = useState<string | null>(null)

  const handleDetails = (id: string) => {
    setShowDetails(showDetails === id ? null : id)
  }

  useEffect(() => {
    onDirtyChange(stats.approved > 0)
    setData(prevData => ({ 
      ...prevData, 
      approvedBrandIds: brands.filter(b => approvalStates[b.id] === 'approved').map(b => b.id),
      'wizard.brands.selected': brands.filter(b => approvalStates[b.id] === 'approved').map(b => b.id),
      approvedBrands: brands.filter(b => approvalStates[b.id] === 'approved')
    }))
  }, [stats.approved, brands, approvalStates, onDirtyChange, setData])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <ProgressBeacon label="Loading brands..." />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Description */}
      <div className="text-center">
        <p className="text-muted-foreground">
          Review your selected brands. Check the ones you want to approve for your campaign.
        </p>
        <a 
          href="/tools/approve" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-sm text-blue-600 hover:text-blue-800 underline mt-2 inline-block"
        >
          Learn more about brand approval →
        </a>
      </div>

      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Approve Brands</h1>
          <p className="text-muted-foreground">Review and approve the brands you selected for your campaign.</p>
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
        <Card className="p-4 text-red-600 bg-red-50 border-red-200">
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
        <Card className="p-4 bg-blue-50 border-blue-600 sticky bottom-4">
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <span className="font-medium">{stats.approved}</span> brands approved
              {stats.rejected > 0 && (
                <span className="text-muted-foreground ml-2">• {stats.rejected} rejected</span>
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
                onClick={goNext}
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
