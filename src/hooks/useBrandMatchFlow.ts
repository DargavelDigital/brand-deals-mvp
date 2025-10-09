'use client'
import * as React from 'react'
import type { RankedBrand, BrandSearchInput } from '@/types/match'
import { useRouter } from 'next/navigation'

// Simple debounce implementation
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): T & { cancel: () => void } {
  let timeout: NodeJS.Timeout | null = null

  const debounced = function (this: any, ...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func.apply(this, args), wait)
  } as T & { cancel: () => void }

  debounced.cancel = () => {
    if (timeout) clearTimeout(timeout)
  }

  return debounced
}

type ApprovalState = 'pending' | 'approved' | 'rejected'

interface BrandMatchFlowOptions {
  includeLocal?: boolean
  keywords?: string[]
  limit?: number
}

interface BrandMatchFlowStats {
  approved: number
  rejected: number
  pending: number
  total: number
}

export function useBrandMatchFlow() {
  const router = useRouter()
  
  // State
  const [matches, setMatches] = React.useState<RankedBrand[]>([])
  const [approvalStates, setApprovalStates] = React.useState<Record<string, ApprovalState>>({})
  const [generating, setGenerating] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // Get workspaceId from cookie (matches existing pattern in codebase)
  const getWorkspaceId = React.useCallback(() => {
    if (typeof document === 'undefined') return null
    const wsid = document.cookie.split('; ').find(r => r.startsWith('wsid='))?.split('=')[1]
    return wsid || null
  }, [])

  // Auto-save function with debounce
  const autoSave = React.useMemo(
    () =>
      debounce(async (states: Record<string, ApprovalState>, workspaceId: string) => {
        try {
          setSaving(true)
          setError(null)

          const approvedIds = Object.entries(states)
            .filter(([_, state]) => state === 'approved')
            .map(([id]) => id)

          const response = await fetch('/api/brand-run/upsert', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              workspaceId,
              selectedBrandIds: approvedIds,
              step: 'MATCHES'
            })
          })

          if (!response.ok) {
            throw new Error(`Auto-save failed: ${response.status}`)
          }
        } catch (e: any) {
          console.error('Auto-save error:', e)
          // Don't show error to user for background saves
        } finally {
          setSaving(false)
        }
      }, 500),
    []
  )

  // Generate matches
  const generate = React.useCallback(async (options: BrandMatchFlowOptions = {}) => {
    setGenerating(true)
    setError(null)

    try {
      const workspaceId = getWorkspaceId()
      if (!workspaceId) {
        throw new Error('No workspace ID found')
      }

      // Build search parameters
      const searchInput: Partial<BrandSearchInput> = {
        workspaceId,
        includeLocal: options.includeLocal ?? true,
        keywords: options.keywords,
        limit: options.limit ?? 24,
        radiusKm: 20,
        categories: ['cafe', 'gym', 'salon', 'retail', 'beauty', 'fitness']
      }

      // Call REAL endpoint (not mock)
      const response = await fetch('/api/match/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(searchInput)
      })

      if (!response.ok) {
        throw new Error(`Match generation failed: ${response.status}`)
      }

      const data = await response.json()
      const newMatches: RankedBrand[] = data.matches || []

      // Append to existing matches (don't replace)
      setMatches(prev => {
        const existingIds = new Set(prev.map(m => m.id))
        const uniqueNewMatches = newMatches.filter(m => !existingIds.has(m.id))
        return [...prev, ...uniqueNewMatches]
      })

      // Initialize approval states for new matches
      setApprovalStates(prev => {
        const newStates = { ...prev }
        newMatches.forEach(match => {
          if (!(match.id in newStates)) {
            newStates[match.id] = 'pending'
          }
        })
        return newStates
      })

    } catch (e: any) {
      setError(e.message || 'Failed to generate matches')
      console.error('Generate matches error:', e)
    } finally {
      setGenerating(false)
    }
  }, [getWorkspaceId])

  // Approve a brand
  const approve = React.useCallback((id: string) => {
    setApprovalStates(prev => {
      const newStates = { ...prev, [id]: 'approved' as ApprovalState }
      
      // Trigger auto-save
      const workspaceId = getWorkspaceId()
      if (workspaceId) {
        autoSave(newStates, workspaceId)
      }
      
      return newStates
    })
  }, [autoSave, getWorkspaceId])

  // Reject a brand
  const reject = React.useCallback((id: string) => {
    setApprovalStates(prev => {
      const newStates = { ...prev, [id]: 'rejected' as ApprovalState }
      
      // Trigger auto-save
      const workspaceId = getWorkspaceId()
      if (workspaceId) {
        autoSave(newStates, workspaceId)
      }
      
      return newStates
    })
  }, [autoSave, getWorkspaceId])

  // Reset approval state
  const reset = React.useCallback((id: string) => {
    setApprovalStates(prev => {
      const newStates = { ...prev, [id]: 'pending' as ApprovalState }
      
      // Trigger auto-save
      const workspaceId = getWorkspaceId()
      if (workspaceId) {
        autoSave(newStates, workspaceId)
      }
      
      return newStates
    })
  }, [autoSave, getWorkspaceId])

  // Save and advance to next step
  const saveAndAdvance = React.useCallback(async () => {
    try {
      setSaving(true)
      setError(null)

      const workspaceId = getWorkspaceId()
      if (!workspaceId) {
        throw new Error('No workspace ID found')
      }

      const approvedIds = Object.entries(approvalStates)
        .filter(([_, state]) => state === 'approved')
        .map(([id]) => id)

      if (approvedIds.length === 0) {
        setError('Please approve at least one brand before continuing')
        return false
      }

      // Save approved brands
      const upsertResponse = await fetch('/api/brand-run/upsert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId,
          selectedBrandIds: approvedIds,
          step: 'MATCHES'
        })
      })

      if (!upsertResponse.ok) {
        throw new Error(`Failed to save: ${upsertResponse.status}`)
      }

      // Advance workflow
      const advanceResponse = await fetch('/api/brand-run/advance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceId })
      })

      if (!advanceResponse.ok) {
        throw new Error(`Failed to advance: ${advanceResponse.status}`)
      }

      // Redirect to media pack
      router.push('/tools/pack')
      return true

    } catch (e: any) {
      setError(e.message || 'Failed to save and advance')
      console.error('Save and advance error:', e)
      return false
    } finally {
      setSaving(false)
    }
  }, [approvalStates, getWorkspaceId, router])

  // Computed values
  const stats = React.useMemo<BrandMatchFlowStats>(() => {
    const approved = Object.values(approvalStates).filter(s => s === 'approved').length
    const rejected = Object.values(approvalStates).filter(s => s === 'rejected').length
    const pending = Object.values(approvalStates).filter(s => s === 'pending').length
    
    return {
      approved,
      rejected,
      pending,
      total: matches.length
    }
  }, [approvalStates, matches.length])

  const approvedBrandIds = React.useMemo(
    () => Object.entries(approvalStates)
      .filter(([_, state]) => state === 'approved')
      .map(([id]) => id),
    [approvalStates]
  )

  const rejectedBrands = React.useMemo(
    () => matches.filter(m => approvalStates[m.id] === 'rejected'),
    [matches, approvalStates]
  )

  const canContinue = React.useMemo(
    () => stats.approved > 0,
    [stats.approved]
  )

  // Auto-generate on mount if matches array is empty
  React.useEffect(() => {
    if (matches.length === 0 && !generating) {
      generate()
    }
  }, []) // Only run on mount

  // Cleanup debounce on unmount
  React.useEffect(() => {
    return () => {
      autoSave.cancel()
    }
  }, [autoSave])

  return {
    // State
    matches,
    approvalStates,
    generating,
    saving,
    error,
    
    // Actions
    generate,
    approve,
    reject,
    reset,
    saveAndAdvance,
    
    // Computed
    stats,
    approvedBrandIds,
    rejectedBrands,
    canContinue
  }
}

