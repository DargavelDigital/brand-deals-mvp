'use client'
import * as React from 'react'
import { Button } from '@/components/ui/Button'
import { ArrowRight, AlertTriangle, Save } from 'lucide-react'
import { ProgressBeacon } from '@/components/ui/ProgressBeacon'

interface BrandMatchActionBarProps {
  approvedCount: number
  canContinue: boolean
  saving: boolean
  onSaveAndAdvance: () => void
}

export default function BrandMatchActionBar({
  approvedCount,
  canContinue,
  saving,
  onSaveAndAdvance,
}: BrandMatchActionBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[var(--border)] shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left Side - Approved Count */}
          <div className="flex items-center gap-2">
            <span className="text-2xl">💚</span>
            <span className="text-lg font-medium">
              {approvedCount} brand{approvedCount !== 1 ? 's' : ''} approved
            </span>
            {saving && (
              <div className="flex items-center gap-2 ml-4 text-sm text-[var(--muted-fg)]">
                <ProgressBeacon />
                <span>Auto-saving...</span>
              </div>
            )}
          </div>

          {/* Right Side - Continue Button */}
          <div>
            {canContinue ? (
              <Button
                onClick={onSaveAndAdvance}
                disabled={saving}
                size="lg"
                className="inline-flex items-center gap-2 bg-[var(--brand-600)] hover:bg-[var(--brand-700)] text-white px-6 py-3"
              >
                {saving ? (
                  <>
                    <ProgressBeacon />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>Save & Continue to Contacts</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </Button>
            ) : (
              <Button
                disabled
                size="lg"
                className="inline-flex items-center gap-2 bg-gray-300 text-gray-600 cursor-not-allowed px-6 py-3"
              >
                <AlertTriangle className="w-5 h-5" />
                <span>Approve at least 1 brand to continue</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

