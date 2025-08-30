'use client'
import { useEffect, useState } from 'react'
import { getMediaPackAnalytics, getVariantPerformance } from '@/services/mediaPack/analytics'

interface AnalyticsDashboardProps {
  mediaPackId: string
}

export function AnalyticsDashboard({ mediaPackId }: AnalyticsDashboardProps) {
  const [analytics, setAnalytics] = useState<any>(null)
  const [variantPerformance, setVariantPerformance] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [analyticsData, variantData] = await Promise.all([
          getMediaPackAnalytics(mediaPackId),
          getVariantPerformance(mediaPackId)
        ])
        setAnalytics(analyticsData)
        setVariantPerformance(variantData)
      } catch (error) {
        // Failed to fetch analytics
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [mediaPackId])

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="p-6 text-center text-gray-500">
        No analytics data available
      </div>
    )
  }

  // Calculate variant winner
  const winner = variantPerformance.reduce((prev, current) => 
    (current.avgScrollDepth > prev.avgScrollDepth) ? current : prev
  )

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Media Pack Analytics</h2>
      
      {/* Variant Performance */}
      <div className="grid md:grid-cols-3 gap-6">
        {variantPerformance.map((variant) => (
          <div 
            key={variant.variant}
            className={`p-6 rounded-lg border-2 ${
              variant.variant === winner.variant 
                ? 'border-green-500 bg-green-50' 
                : 'border-gray-200 bg-white'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold capitalize">
                {variant.variant} Variant
              </h3>
              {variant.variant === winner.variant && (
                <span className="px-2 py-1 text-xs bg-green-500 text-white rounded-full">
                  Winner
                </span>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Views:</span>
                <span className="font-semibold">{variant.views}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Avg Scroll:</span>
                <span className="font-semibold">{variant.avgScrollDepth}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Scroll Depth Heatmap */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Scroll Depth Heatmap</h3>
        <div className="space-y-3">
          {[25, 50, 75, 100].map((depth) => {
            const views = analytics.views
              .filter((v: any) => v.event === 'scroll' && v.value === depth)
              .reduce((sum: number, v: any) => sum + v._count.id, 0)
            
            return (
              <div key={depth} className="flex items-center">
                <span className="w-16 text-sm text-gray-600">{depth}%</span>
                <div className="flex-1 bg-gray-200 rounded-full h-3 mx-4">
                  <div 
                    className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((views / Math.max(analytics.views[0]?._count.id || 1, 1)) * 100, 100)}%` }}
                  ></div>
                </div>
                <span className="w-16 text-sm text-gray-600 text-right">{views}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Conversion Metrics */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Conversions</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-700 mb-3">Call Requests</h4>
            <div className="space-y-2">
              {analytics.conversions
                .filter((c: any) => c.type === 'call')
                .map((c: any) => (
                  <div key={c.status} className="flex justify-between">
                    <span className="text-gray-600 capitalize">{c.status}:</span>
                    <span className="font-semibold">{c._count.id}</span>
                  </div>
                ))}
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-3">Proposal Requests</h4>
            <div className="space-y-2">
              {analytics.conversions
                .filter((c: any) => c.type === 'proposal')
                .map((c: any) => (
                  <div key={c.status} className="flex justify-between">
                    <span className="text-gray-600 capitalize">{c.status}:</span>
                    <span className="font-semibold">{c._count.id}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
