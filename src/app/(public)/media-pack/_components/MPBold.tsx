import React from 'react'
import { MPBase } from './MPBase'
import { ThemeTokens } from '@/services/mediaPack/types'
import BrandLogo from '@/components/media/BrandLogo'

export function MPBold({
  theme, summary, audience, brands, coverQR, preview = false, brand, creator, metrics, cta,
}: {
  theme: ThemeTokens
  summary: string
  audience: { followers: number; engagement: number; topGeo: string[] }
  brands: { name: string; reasons: string[]; website?: string }[]
  coverQR?: string
  preview?: boolean
  brand?: { name: string; domain?: string }
  creator?: { displayName?: string; name?: string; tagline?: string }
  metrics?: { key: string; label: string; value: string; sub?: string }[]
  cta?: { bookUrl?: string; proposalUrl?: string }
}) {
  return (
    <MPBase theme={theme} title="Media Pack — Bold" preview={preview}>
      <div id="mp-root" className="bg-[var(--bg)] text-[var(--fg)]">
        <div className="max-w-[960px] mx-auto px-5 md:px-8 py-6 md:py-10 space-y-6 md:space-y-8">
          <header className="grid grid-cols-[auto,1fr] items-center gap-4 md:gap-6 mb-6 md:mb-8">
            <div className="w-14 h-14 md:w-16 md:h-16">
              <BrandLogo domain={brand?.domain} name={brand?.name} size={64} className="w-full h-full" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-[var(--fg)] truncate">
                {creator?.displayName ?? creator?.name ?? 'Creator Name'}
              </h1>
              <p className="text-sm md:text-base text-[var(--muted-fg)] truncate">
                {creator?.tagline ?? 'Creator • Partnerships • Storytelling'}
              </p>
            </div>
          </header>

          <section className="mb-6 md:mb-8">
            <h2 className="text-base font-medium text-[var(--fg)] mb-3">Audience & Performance</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {metrics?.map((m) => (
                <div key={m.key} className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
                  <div className="text-xs uppercase tracking-wide text-[var(--muted-fg)]">{m.label}</div>
                  <div className="mt-1 text-xl md:text-2xl font-semibold text-[var(--fg)]">{m.value}</div>
                  {m.sub && <div className="text-xs text-[var(--muted-fg)] mt-0.5">{m.sub}</div>}
                </div>
              ))}
            </div>
          </section>

          <div className="grid" style={{gridTemplateColumns:'1fr'}}>
        <div className="card">
          <div className="h2">Executive Summary</div>
          <p style={{lineHeight:1.5}}>{summary}</p>
        </div>
        <div className="card">
          <div className="h2">Audience Snapshot</div>
          <div>Followers: <b>{audience.followers.toLocaleString()}</b></div>
          <div>Engagement: <b>{(audience.engagement*100).toFixed(1)}%</b></div>
          <div>Top Geo: {audience.topGeo.join(', ')}</div>
        </div>
        <div className="card">
          <div className="h2">Brand Fit</div>
          <div className="grid" style={{gridTemplateColumns:'repeat(3,minmax(0,1fr))'}}>
            {brands.map((b) => (
              <div key={b.name} className="card">
                <div style={{fontWeight:600, color:'var(--brand)'}}>{b.name}</div>
                <ul style={{margin:'8px 0 0 16px'}}>
                  {b.reasons.map((r,i)=><li key={i}>{r}</li>)}
                </ul>
                {b.website && <a href={b.website} style={{color:'var(--accent)'}}>{b.website}</a>}
              </div>
            ))}
          </div>
          </div>
          </div>

          <section className="mt-8 md:mt-12">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 md:p-6">
              <h3 className="text-lg font-medium text-[var(--fg)] mb-2">Ready to explore a partnership?</h3>
              <p className="text-[var(--muted-fg)] mb-4">
                We can tailor concepts to your goals—short-form, long-form, multi-platform, or multi-month.
              </p>
              <div className="flex flex-wrap gap-3">
                <a href={cta?.bookUrl ?? '#'} className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-[var(--brand-600)] text-white border border-[var(--brand-600)] hover:opacity-95">
                  Book a call
                </a>
                <a href={cta?.proposalUrl ?? '#'} className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-[var(--tint-accent)] text-[var(--fg)] border border-[var(--border)] hover:opacity-95">
                  Request proposal
                </a>
              </div>
            </div>
          </section>
        </div>
      </div>
      
      <style jsx global>{`
        @media print {
          #mp-root {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          #mp-root img {
            image-rendering: -webkit-optimize-contrast;
          }
          #mp-root h1, #mp-root h2, #mp-root h3, #mp-root p, #mp-root div {
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
        }
      `}</style>
    </MPBase>
  )
}
