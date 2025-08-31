'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Select } from '@/components/ui/Select'
import { BarChartComponent } from '@/ui/charts'
import { Button } from '@/components/ui/Button'

interface AnalyticsData {
  funnel: {
    sent: number
    opened: number
    clicked: number
    replied: number
    bounced: number
  }
  rates: {
    openRate: number
    clickRate: number
    replyRate: number
  }
  medianTimeToReply: number
  chartData: Array<{
    name: string
    value: number
    color: string
  }>
  topSubjects: Array<{
    subject: string
    totalSent: number
    totalOpened: number
    totalReplied: number
    openRate: number
    replyRate: number
  }>
  period: string
}

export default function OutreachAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [period, setPeriod] = useState('30')

  useEffect(() => {
    fetchAnalytics()
  }, [period])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/outreach/analytics?days=${period}`)
      
      if (response.ok) {
        const result = await response.json()
        setAnalytics(result.data)
        setError(null)
      } else {
        setError('Failed to fetch analytics')
      }
    } catch (err) {
      setError('Error fetching analytics')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="card p-4 border-[var(--error)] bg-[var(--tint-error)] text-[var(--error)]">
          {error}
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={fetchAnalytics}
            className="ml-3"
          >
            Retry
          </Button>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="space-y-6">
        <div className="text-center text-[var(--muted-fg)] py-12">
          No analytics data available
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with period selector */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Sequence Analytics</h2>
          <p className="text-[var(--muted-fg)]">Performance metrics for your outreach sequences</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-[var(--muted-fg)]">Period:</label>
          <Select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="w-32"
          >
            <option value="7">7 days</option>
            <option value="30">30 days</option>
            <option value="90">90 days</option>
          </Select>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-[var(--accent)]">
            {analytics.funnel.sent.toLocaleString()}
          </div>
          <div className="text-sm text-[var(--muted-fg)]">Emails Sent</div>
        </Card>
        
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-[var(--success)]">
            {analytics.rates.openRate.toFixed(1)}%
          </div>
          <div className="text-sm text-[var(--muted-fg)]">Open Rate</div>
        </Card>
        
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-[var(--warn)]">
            {analytics.rates.replyRate.toFixed(1)}%
          </div>
          <div className="text-sm text-[var(--muted-fg)]">Reply Rate</div>
        </Card>
        
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-[var(--brand-600)]">
            {analytics.medianTimeToReply > 0 
              ? `${analytics.medianTimeToReply.toFixed(1)}h`
              : 'N/A'
            }
          </div>
          <div className="text-sm text-[var(--muted-fg)]">Median Reply Time</div>
        </Card>
      </div>

      {/* Funnel Chart */}
      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">Email Funnel</h3>
        <div className="h-64">
          <BarChartComponent data={analytics.chartData} height={256} />
        </div>
        <div className="mt-4 text-sm text-[var(--muted-fg)] text-center">
          Showing data for the last {analytics.period}
        </div>
      </Card>

      {/* Top Performing Subjects */}
      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">Top Performing Subjects</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left py-2 font-medium">Subject</th>
                <th className="text-right py-2 font-medium">Sent</th>
                <th className="text-right py-2 font-medium">Opened</th>
                <th className="text-right py-2 font-medium">Replied</th>
                <th className="text-right py-2 font-medium">Open Rate</th>
                <th className="text-right py-2 font-medium">Reply Rate</th>
              </tr>
            </thead>
            <tbody>
              {analytics.topSubjects.map((subject, index) => (
                <tr key={index} className="border-b border-[var(--border)] hover:bg-[var(--muted)]/20">
                  <td className="py-2 font-medium truncate max-w-xs" title={subject.subject}>
                    {subject.subject}
                  </td>
                  <td className="py-2 text-right">{subject.totalSent}</td>
                  <td className="py-2 text-right">{subject.totalOpened}</td>
                  <td className="py-2 text-right">{subject.totalReplied}</td>
                  <td className="py-2 text-right">
                    <Badge variant="outline" className="text-xs">
                      {subject.openRate.toFixed(1)}%
                    </Badge>
                  </td>
                  <td className="py-2 text-right">
                    <Badge variant="outline" className="text-xs">
                      {subject.replyRate.toFixed(1)}%
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {analytics.topSubjects.length === 0 && (
          <div className="text-center text-[var(--muted-fg)] py-8">
            No subject data available for this period
          </div>
        )}
      </Card>
    </div>
  )
}
