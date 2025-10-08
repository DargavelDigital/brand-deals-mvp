'use client'
import * as React from 'react'
import AuditKPI from './AuditKPI'
import SparkBar from './SparkBar'
import { Users, Heart, BarChart2, Share2, TrendingUp, AlertCircle, CheckCircle2, Sparkles } from 'lucide-react'
import AiFeedbackButtons from '@/components/feedback/AiFeedbackButtons'
import AdaptiveBadge from '@/components/ui/AdaptiveBadge'
import { useLocale } from 'next-intl'

type Similar = { name:string; platform:string; reason:string; audienceSize:string }
export type AuditResultFront = {
  auditId: string
  sources: string[]
  audience: {
    totalFollowers: number
    avgEngagement: number
    reachRate: number
    avgLikes: number
    avgComments: number
    avgShares: number
  }
  insights: string[]
  similarCreators: Similar[]
}

export default function AuditResults({ data, onRefresh }:{
  data: AuditResultFront
  onRefresh: ()=>void
}){
  const locale = useLocale()
  const bars = React.useMemo(()=>[
    Math.round(data.audience.avgLikes),
    Math.round(data.audience.avgComments),
    Math.round(data.audience.avgShares),
    Math.round(data.audience.reachRate*100),
    Math.round(data.audience.avgEngagement*100),
  ], [data])

  // Calculate overall score based on engagement and reach
  const overallScore = React.useMemo(() => {
    const engagement = data.audience.avgEngagement * 100
    const reach = data.audience.reachRate * 100
    const score = (engagement * 0.6) + (reach * 0.4) // Weighted score
    return Math.min(100, Math.round(score * 20)) // Scale to 100
  }, [data.audience])

  const getScoreGrade = (score: number) => {
    if (score >= 90) return { grade: 'A+', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' }
    if (score >= 80) return { grade: 'A', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' }
    if (score >= 70) return { grade: 'B', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' }
    if (score >= 60) return { grade: 'C', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' }
    return { grade: 'D', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' }
  }

  const scoreData = getScoreGrade(overallScore)

  // Extract strengths and improvements from insights
  const strengths = data.insights.filter((_, i) => i % 3 === 0).slice(0, 3)
  const improvements = data.insights.filter((_, i) => i % 3 === 1).slice(0, 3)
  const recommendations = data.insights.filter((_, i) => i % 3 === 2).slice(0, 3)

  return (
    <div className="space-y-6">
      {/* Overall Score Card */}
      <div className={`card p-6 border-2 ${scoreData.border} ${scoreData.bg}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-20 h-20 rounded-full ${scoreData.bg} border-4 ${scoreData.border} flex items-center justify-center`}>
              <div className="text-center">
                <div className={`text-2xl font-bold ${scoreData.color}`}>{scoreData.grade}</div>
                <div className={`text-xs ${scoreData.color} opacity-75`}>{overallScore}/100</div>
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-500" />
                Audit Results
              </h2>
              <p className="text-sm text-[var(--muted-fg)] mt-1">
                Sources: {data.sources.join(', ')}
              </p>
            </div>
          </div>
          <button
            onClick={onRefresh}
            className="inline-flex h-9 items-center px-3 rounded-[10px] border border-[var(--border)] hover:bg-[var(--muted)] transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* KPI Metrics Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AuditKPI label="Total Audience" value={data.audience.totalFollowers.toLocaleString()} icon={<Users className="size-4" />} />
        <AuditKPI label="Avg Engagement" value={`${(data.audience.avgEngagement*100).toFixed(1)}%`} icon={<Heart className="size-4" />} />
        <AuditKPI label="Reach Rate" value={`${(data.audience.reachRate*100).toFixed(1)}%`} icon={<BarChart2 className="size-4" />} />
        <AuditKPI label="Avg Shares" value={data.audience.avgShares.toFixed(0)} icon={<Share2 className="size-4" />} />
      </div>

      {/* Key Strengths */}
      {strengths.length > 0 && (
        <div className="card p-5 border-l-4 border-green-500">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            Key Strengths
          </h3>
          <ul className="space-y-3">
            {strengths.map((insight, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-[var(--fg)]">{insight}</p>
                  <div className="mt-2">
                    <AiFeedbackButtons 
                      type="AUDIT" 
                      targetId={`strength_${data.auditId}_${i}`}
                      size="sm"
                    />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Areas for Improvement */}
      {improvements.length > 0 && (
        <div className="card p-5 border-l-4 border-yellow-500">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            Areas for Improvement
          </h3>
          <ul className="space-y-3">
            {improvements.map((insight, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-[var(--fg)]">{insight}</p>
                  <div className="mt-2">
                    <AiFeedbackButtons 
                      type="AUDIT" 
                      targetId={`improvement_${data.auditId}_${i}`}
                      size="sm"
                    />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="card p-5 border-l-4 border-blue-500">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Recommendations
          </h3>
          <ul className="space-y-3">
            {recommendations.map((insight, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-[var(--fg)]">{insight}</p>
                  <div className="mt-2">
                    <AiFeedbackButtons 
                      type="AUDIT" 
                      targetId={`recommendation_${data.auditId}_${i}`}
                      size="sm"
                    />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Engagement Metrics Chart */}
      <div className="card p-5">
        <h3 className="text-lg font-semibold mb-4">Engagement Metrics</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-[var(--muted-fg)]">Avg Likes</span>
              <span className="font-medium">{Math.round(data.audience.avgLikes).toLocaleString()}</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-pink-500 to-red-500 transition-all" 
                style={{ width: `${Math.min(100, (data.audience.avgLikes / data.audience.totalFollowers) * 10000)}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-[var(--muted-fg)]">Avg Comments</span>
              <span className="font-medium">{Math.round(data.audience.avgComments).toLocaleString()}</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all" 
                style={{ width: `${Math.min(100, (data.audience.avgComments / data.audience.totalFollowers) * 20000)}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-[var(--muted-fg)]">Engagement Rate</span>
              <span className="font-medium">{(data.audience.avgEngagement * 100).toFixed(1)}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all" 
                style={{ width: `${Math.min(100, data.audience.avgEngagement * 200)}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-[var(--muted-fg)]">Reach Rate</span>
              <span className="font-medium">{(data.audience.reachRate * 100).toFixed(1)}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all" 
                style={{ width: `${Math.min(100, data.audience.reachRate * 200)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Signal Snapshot */}
      <div className="card p-5">
        <h3 className="text-lg font-semibold mb-3">Performance Snapshot</h3>
        <SparkBar values={bars} />
        <div className="mt-3 text-xs text-[var(--muted-fg)]">Likes / Comments / Shares / Reach% / Engagement%</div>
      </div>

      {/* Similar Creators */}
      {data.similarCreators && data.similarCreators.length > 0 && (
        <div className="card p-5">
          <h3 className="text-lg font-semibold mb-4">Similar Creators</h3>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {data.similarCreators.slice(0,6).map((c, i)=>(
              <div key={i} className="rounded-[10px] border border-[var(--border)] bg-[var(--card)] p-4 hover:border-[var(--brand-600)] transition-colors">
                <div className="font-medium text-sm">{c.name}</div>
                <div className="text-xs text-[var(--muted-fg)] mt-1">{c.platform}</div>
                <div className="text-xs text-[var(--muted-fg)] mt-2">{c.audienceSize}</div>
                <div className="text-xs mt-2 text-[var(--fg)] opacity-75">{c.reason}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="card p-5">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={onRefresh}
            className="inline-flex h-11 items-center px-6 rounded-[10px] text-sm font-medium border-2 border-[var(--brand-600)] text-[var(--brand-600)] hover:bg-[var(--brand-50)] transition-colors"
          >
            Run New Audit
          </button>
          <a 
            href={`/${locale}/tools/matches`} 
            className="inline-flex h-11 items-center px-6 rounded-[10px] text-sm font-medium text-white bg-[var(--brand-600)] hover:opacity-90 transition-opacity"
          >
            Generate Matches
          </a>
          <a 
            href={`/${locale}/tools/pack`} 
            className="inline-flex h-11 items-center px-6 rounded-[10px] text-sm border border-[var(--border)] hover:bg-[var(--muted)] transition-colors"
          >
            Build Media Pack
          </a>
        </div>
        
        {/* AI Feedback Integration */}
        <div className="mt-6 pt-4 border-t border-[var(--border)]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-[var(--muted-fg)]">How was this audit?</span>
            <AdaptiveBadge />
          </div>
          <AiFeedbackButtons 
            type="AUDIT" 
            targetId={`audit_${data.auditId}`}
            className="justify-start"
          />
        </div>
      </div>
    </div>
  )
}
