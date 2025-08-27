'use client'
import * as React from 'react'
import { CheckCircle, Clock, XCircle } from 'lucide-react'

type ApprovalState = 'pending' | 'approved' | 'rejected'

export default function ApprovalProgress({
  total, approved, rejected, pending,
}: {
  total: number
  approved: number
  rejected: number
  pending: number
}) {
  const progress = total > 0 ? ((approved + rejected) / total) * 100 : 0

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">Approval Progress</div>
        <div className="text-sm text-[var(--muted-fg)]">{Math.round(progress)}% Complete</div>
      </div>
      
      <div className="w-full bg-[var(--muted)] rounded-full h-2">
        <div 
          className="bg-[var(--brand-600)] h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-1 text-[var(--success)]">
            <CheckCircle className="w-4 h-4" />
            <span className="text-lg font-semibold">{approved}</span>
          </div>
          <div className="text-xs text-[var(--muted-fg)]">Approved</div>
        </div>
        
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-1 text-[var(--error)]">
            <XCircle className="w-4 h-4" />
            <span className="text-lg font-semibold">{rejected}</span>
          </div>
          <div className="text-xs text-[var(--muted-fg)]">Rejected</div>
        </div>
        
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-1 text-[var(--muted-fg)]">
            <Clock className="w-4 h-4" />
            <span className="text-lg font-semibold">{pending}</span>
          </div>
          <div className="text-xs text-[var(--muted-fg)]">Pending</div>
        </div>
      </div>
    </div>
  )
}
