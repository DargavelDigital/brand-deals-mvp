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
      
      const wsid = document.cookie.split('; ').find(r => r.startsWith('wsid='))?.split('=')[1] || 'demo-workspace'
      
      // Get current brand run
      const runRes = await fetch(`/api/brand-run/current?workspaceId=${wsid}`)
      if (!runRes.ok) throw new Error(`Failed to fetch brand run: ${runRes.status}`)
      const runData = await runRes.json()
      
      // For demo purposes, always generate some mock brands
      // In production, you'd check if runData.brandRun?.selectedBrandIds?.length > 0
      const mockBrands: BrandLite[] = [
        {
          id: 'brand1',
          name: 'Nike',
          industry: 'Fitness & Sports',
          description: 'Leading athletic footwear and apparel company with a focus on innovation and performance.',
          matchScore: 92,
          tags: ['Sports', 'Fitness', 'Lifestyle'],
          reasons: [
            'Your audience demographics align perfectly with Nike\'s target market',
            'Content style matches Nike\'s energetic and motivational brand voice',
            'High engagement on fitness and sports-related content'
          ],
          website: 'https://nike.com'
        },
        {
          id: 'brand2',
          name: 'Apple',
          industry: 'Technology',
          description: 'Premium technology company known for innovative design and user experience.',
          matchScore: 88,
          tags: ['Tech', 'Innovation', 'Design'],
          reasons: [
            'Your audience shows high interest in technology and innovation',
            'Content quality and aesthetic align with Apple\'s premium positioning',
            'Strong engagement on product review and lifestyle content'
          ],
          website: 'https://apple.com'
        },
        {
          id: 'brand3',
          name: 'Starbucks',
          industry: 'Food & Beverage',
          description: 'Global coffeehouse chain with a focus on community and sustainability.',
          matchScore: 85,
          tags: ['Food', 'Lifestyle', 'Community'],
          reasons: [
            'Your audience values community and social connection',
            'Content often features lifestyle and social moments',
            'High engagement on community-focused posts'
          ],
          website: 'https://starbucks.com'
        },
        {
          id: 'brand4',
          name: 'Adidas',
          industry: 'Fitness & Sports',
          description: 'Global sportswear manufacturer with a focus on street culture and athletics.',
          matchScore: 82,
          tags: ['Sports', 'Streetwear', 'Culture'],
          reasons: [
            'Your audience shows interest in street culture and sports',
            'Content style aligns with Adidas\' urban and athletic aesthetic',
            'Good engagement on lifestyle and culture content'
          ],
          website: 'https://adidas.com'
        }
      ]

      setBrands(mockBrands)
      
      // Initialize all as pending
      const initialStates: Record<string, ApprovalState> = {}
      mockBrands.forEach(brand => {
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
      
      const wsid = document.cookie.split('; ').find(r => r.startsWith('wsid='))?.split('=')[1] || 'demo-workspace'
      
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
      const wsid = document.cookie.split('; ').find(r => r.startsWith('wsid='))?.split('=')[1] || 'demo-workspace'
      
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
