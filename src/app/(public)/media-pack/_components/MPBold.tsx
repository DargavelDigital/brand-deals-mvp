import React from 'react'
import { MPBase } from './MPBase'
import { ThemeTokens } from '@/services/mediaPack/types'

export function MPBold({
  theme, summary, audience, brands, coverQR, preview = false, brand,
}: {
  theme: ThemeTokens
  summary: string
  audience: { followers: number; engagement: number; topGeo: string[] }
  brands: { name: string; reasons: string[]; website?: string }[]
  coverQR?: string
  preview?: boolean
  brand?: { name: string; domain?: string }
}) {
  return (
    <MPBase theme={theme} title="Media Pack — Bold" preview={preview}>
      <div className="grid" style={{gridTemplateColumns:'1fr'}}>
        <div className="card" style={{borderColor:'var(--brand)', borderWidth:'3px', minHeight:'140px'}}>
          <div style={{display:'flex', alignItems:'center', marginBottom:'8px'}}>
            {brand?.domain && (
              <img 
                src={`https://logo.clearbit.com/${brand.domain}`} 
                alt={`${brand.name} logo`}
                style={{width:'40px', height:'40px', marginRight:'12px', borderRadius:'4px', border:'1px solid #e5e7eb'}}
              />
            )}
            <div className="h1" style={{color:'var(--brand)', fontSize:'40px'}}>Creator Media Pack</div>
          </div>
          <div style={{marginTop:8}} className="pill">Powered by HYPER</div>
          {coverQR && (
            <div style={{marginTop:12}}>
              <img src={coverQR} alt="QR" width={96} height={96} />
            </div>
          )}
        </div>
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
    </MPBase>
  )
}
