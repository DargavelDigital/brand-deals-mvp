'use client'
import * as React from 'react'
import AuditKPI from './AuditKPI'
import SparkBar from './SparkBar'
import { Users, Heart, BarChart2, Share2 } from 'lucide-react'
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

  return (
    <div className="space-y-4">
      <div className="card p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold">Audit Results</div>
            <div className="text-sm text-[var(--muted-fg)]">Sources: {data.sources.join(', ')}</div>
          </div>
          <button
            onClick={onRefresh}
            className="inline-flex h-9 items-center px-3 rounded-[10px] border border-[var(--border)] hover:bg-[var(--muted)]"
          >
            Refresh
          </button>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <AuditKPI label="Total Audience" value={data.audience.totalFollowers.toLocaleString()} icon={<Users className="size-4" />} />
          <AuditKPI label="Avg Engagement" value={`${(data.audience.avgEngagement*100).toFixed(1)}%`} icon={<Heart className="size-4" />} />
          <AuditKPI label="Reach Rate" value={`${(data.audience.reachRate*100).toFixed(1)}%`} icon={<BarChart2 className="size-4" />} />
          <AuditKPI label="Avg Shares" value={data.audience.avgShares.toFixed(0)} icon={<Share2 className="size-4" />} />
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <div className="card p-4">
            <div className="text-sm font-medium mb-1">Signal Snapshot</div>
            <SparkBar values={bars} />
            <div className="mt-2 text-xs text-[var(--muted-fg)]">Likes / Comments / Shares / Reach% / Engagement%</div>
          </div>

          <div className="card p-4 lg:col-span-2">
            <div className="text-sm font-medium mb-3">AI Insights</div>
            <ul className="grid gap-2">
              {data.insights.map((s, i)=>(
                <li key={i} className="rounded-[10px] border border-[var(--border)] bg-[var(--card)] p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="text-sm flex-grow">{s}</div>
                    <div className="flex-shrink-0">
                      <AiFeedbackButtons 
                        type="AUDIT" 
                        targetId={`insight_${data.auditId}_${i}`}
                        size="sm"
                      />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-6">
          <div className="text-sm font-medium mb-2">Similar Creators</div>
          <div className="grid gap-2 md:grid-cols-2">
            {data.similarCreators.slice(0,6).map((c, i)=>(
              <div key={i} className="rounded-[10px] border border-[var(--border)] bg-[var(--card)] p-3">
                <div className="font-medium">{c.name} · <span className="text-[var(--muted-fg)]">{c.platform}</span></div>
                <div className="text-xs text-[var(--muted-fg)]">{c.audienceSize} · {c.reason}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <a href={`/${locale}/tools/matches`} className="inline-flex h-10 items-center px-4 rounded-[10px] text-sm font-medium text-white bg-[var(--brand-600)] hover:opacity-95">Generate Matches</a>
          <a href={`/${locale}/tools/pack`} className="inline-flex h-10 items-center px-4 rounded-[10px] text-sm border border-[var(--border)] hover:bg-[var(--muted)]">Build Media Pack</a>
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
