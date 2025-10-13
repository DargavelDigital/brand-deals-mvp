'use client'
import * as React from 'react'
import type { ApprovalState } from './BrandApprovalCard'

type BrandLite = {
  id: string
  name: string
  logo?: string
  industry?: string
  description?: string
  matchScore?: number
  tags?: string[]
  reasons?: string[]
  website?: string
}

export default function useBrandApproval() {
  const [brands, setBrands] = React.useState<BrandLite[]>([])
  const [approvalStates, setApprovalStates] = React.useState<Record<string, ApprovalState>>({})
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // Fetch current brand run and selected brands
  const fetchBrands = React.useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const wsid = document.cookie.split('; ').find(r => r.startsWith('wsid='))?.split('=')[1]
      
      if (!wsid) {
        throw new Error('No workspace ID found. Please log in.')
      }
      
      // Get current brand run
      const runRes = await fetch(`/api/brand-run/current?workspaceId=${wsid}`)
      if (!runRes.ok) throw new Error(`Failed to fetch brand run: ${runRes.status}`)
      const runData = await runRes.json()
      
      // Use real brands from runSummaryJson (no mock brands)
      const realBrands: BrandLite[] = runData.data?.runSummaryJson?.brands || runData.runSummaryJson?.brands || []
      
      if (realBrands.length === 0) {
        setError('No brands found. Please complete the brand matching step first.')
        setBrands([])
        return
      }
      
      setBrands(realBrands)
      
      // Initialize all as pending
      const initialStates: Record<string, ApprovalState> = {}
      realBrands.forEach(brand => {
        initialStates[brand.id] = 'pending'
      })
      setApprovalStates(initialStates)
      
    } catch (e: any) {
      setError(e.message ?? 'Failed to fetch brands')
    } finally {
      setLoading(false)
    }
  }, [])

  // Handle approval actions
  const approve = React.useCallback((id: string) => {
    setApprovalStates(prev => ({ ...prev, [id]: 'approved' }))
  }, [])

  const reject = React.useCallback((id: string) => {
    setApprovalStates(prev => ({ ...prev, [id]: 'rejected' }))
  }, [])

  const reset = React.useCallback((id: string) => {
    setApprovalStates(prev => ({ ...prev, [id]: 'pending' }))
  }, [])

  // Save approval states to brand run
  const saveApprovals = React.useCallback(async () => {
    try {
      setSaving(true)
      setError(null)
      
      const wsid = document.cookie.split('; ').find(r => r.startsWith('wsid='))?.split('=')[1]
      
      if (!wsid) {
        throw new Error('No workspace ID found. Please log in.')
      }
      
      // Update brand run with approval states
      const approvedIds = Object.entries(approvalStates)
        .filter(([_, state]) => state === 'approved')
        .map(([id]) => id)

      const res = await fetch('/api/brand-run/upsert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId: wsid,
          selectedBrandIds: approvedIds,
          step: 'approval'
        })
      })

      if (!res.ok) throw new Error(`Failed to save approvals: ${res.status}`)
      
      return true
    } catch (e: any) {
      setError(e.message ?? 'Failed to save approvals')
      return false
    } finally {
      setSaving(false)
    }
  }, [approvalStates])

  // Advance to next step
  const advanceToNext = React.useCallback(async () => {
    const saved = await saveApprovals()
    if (!saved) return false

    try {
      const wsid = document.cookie.split('; ').find(r => r.startsWith('wsid='))?.split('=')[1]
      
      if (!wsid) {
        throw new Error('No workspace ID found. Please log in.')
      }
      
      const res = await fetch('/api/brand-run/advance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceId: wsid })
      })

      if (!res.ok) throw new Error(`Failed to advance: ${res.status}`)
      
      return true
    } catch (e: any) {
      setError(e.message ?? 'Failed to advance to next step')
      return false
    }
  }, [saveApprovals])

  // Load brands on mount
  React.useEffect(() => {
    fetchBrands()
  }, [fetchBrands])

  // Calculate stats
  const stats = React.useMemo(() => {
    const approved = Object.values(approvalStates).filter(s => s === 'approved').length
    const rejected = Object.values(approvalStates).filter(s => s === 'rejected').length
    const pending = Object.values(approvalStates).filter(s => s === 'pending').length
    
    return { approved, rejected, pending, total: brands.length }
  }, [approvalStates, brands.length])

  return {
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
    refresh: fetchBrands
  }
}
