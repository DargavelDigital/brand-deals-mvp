'use client'

import * as React from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { TrendingUp, TrendingDown, MessageSquare, ThumbsUp, ThumbsDown } from 'lucide-react'

type FeedbackSummary = {
  type: 'MATCH' | 'OUTREACH' | 'AUDIT'
  upCount: number
  downCount: number
  totalCount: number
  ratio: number
}

export function FeedbackSummaryWidget() {
  const [summaries, setSummaries] = React.useState<FeedbackSummary[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const fetchSummaries = async () => {
      try {
        setLoading(true)
        const types: ('MATCH' | 'OUTREACH' | 'AUDIT')[] = ['MATCH', 'OUTREACH', 'AUDIT']
        
        const results = await Promise.all(
          types.map(async (type) => {
            const res = await fetch(`/api/feedback/summary?type=${type}`)
            if (!res.ok) throw new Error(`Failed to fetch ${type} summary`)
            const data = await res.json()
            return data.data
          })
        )
        
        setSummaries(results)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load feedback')
      } finally {
        setLoading(false)
      }
    }

    fetchSummaries()
  }, [])

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="p-6 border-red-200 bg-red-50">
        <div className="text-red-600 text-sm">
          <p className="font-medium">Error loading feedback</p>
          <p>{error}</p>
        </div>
      </Card>
    )
  }

  const totalFeedback = summaries.reduce((sum, s) => sum + s.totalCount, 0)
  const overallApproval = summaries.length > 0 
    ? summaries.reduce((sum, s) => sum + s.ratio, 0) / summaries.length 
    : 0

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="font-medium">Feedback Overview</h4>
          <p className="text-sm text-[var(--muted-fg)]">
            {totalFeedback} total ratings • {Math.round(overallApproval * 100)}% overall approval
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => window.location.href = '/demo/feedback'}>
          View Details
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {summaries.map((summary) => (
          <div key={summary.type} className="text-center p-4 rounded-lg border border-[var(--border)]">
            <div className="text-2xl font-bold text-[var(--brand-600)]">
              {Math.round(summary.ratio * 100)}%
            </div>
            <div className="text-sm text-[var(--muted-fg)] mb-2">
              {summary.type === 'MATCH' && 'Brand Matches'}
              {summary.type === 'OUTREACH' && 'Email Quality'}
              {summary.type === 'AUDIT' && 'Profile Analysis'}
            </div>
            
            <div className="flex items-center justify-center gap-2 text-xs">
              <div className="flex items-center gap-1 text-green-600">
                <ThumbsUp className="w-3 h-3" />
                {summary.upCount}
              </div>
              <div className="flex items-center gap-1 text-red-600">
                <ThumbsDown className="w-3 h-3" />
                {summary.downCount}
              </div>
            </div>

            {summary.ratio < 0.7 && (
              <div className="mt-2 text-xs text-amber-600 flex items-center justify-center gap-1">
                <TrendingDown className="w-3 h-3" />
                Needs attention
              </div>
            )}
            {summary.ratio > 0.8 && (
              <div className="mt-2 text-xs text-green-600 flex items-center justify-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Performing well
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  )
}
