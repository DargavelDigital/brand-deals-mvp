'use client'
import * as React from 'react'
import MPProfessional from '@/components/media-pack/templates/MPProfessional'
import MPLuxury from '@/components/media-pack/templates/MPLuxury'
import MPMinimal from '@/components/media-pack/templates/MPMinimal'
import { Share2, Copy, Check } from 'lucide-react'

export default function Preview({ current }:{ current: any }){
  const [variant, setVariant] = React.useState<'professional'|'luxury'|'minimal'>('professional')
  const [isSharing, setIsSharing] = React.useState(false)
  const [copied, setCopied] = React.useState(false)
  
  // Mock data for preview
  const mockData = {
    theme: {
      brandColor: '#3b82f6',
      accent: '#06b6d4',
      surface: '#ffffff',
      text: '#0b0b0c'
    },
    summary: 'Your audience is primed for partnerships in tech & lifestyle. Strong US/UK base and above-average ER.',
    audience: { followers: 156000, engagement: 0.053, topGeo: ['US','UK','CA'] },
    brands: [
      { name: 'Acme Co', reasons: ['Audience overlap', 'Content affinity'], website: 'https://acme.com' }
    ],
    brand: { name: 'Demo Workspace', domain: 'demo-workspace.com' },
    creator: { displayName: 'Demo Creator', tagline: 'Creator • Partnerships • Storytelling' },
    metrics: [
      { key: 'followers', label: 'Followers', value: '156K' },
      { key: 'engagement', label: 'Engagement', value: '5.3%' },
      { key: 'top-geo', label: 'Top Geo', value: 'US, UK, CA' }
    ],
    cta: { 
      bookUrl: 'https://calendly.com/demo-creator', 
      proposalUrl: 'mailto:demo@example.com?subject=Partnership Proposal Request' 
    }
  }

  const renderVariant = () => {
    const commonProps = {
      theme: mockData.theme,
      summary: mockData.summary,
      audience: mockData.audience,
      brands: mockData.brands,
      brand: mockData.brand,
      creator: mockData.creator,
      metrics: mockData.metrics,
      cta: mockData.cta,
      preview: true
    }

    switch (variant) {
      case 'professional':
        return <MPProfessional data={commonProps} isPublic={false} />
      case 'luxury':
        return <MPLuxury data={commonProps} isPublic={false} />
      case 'minimal':
        return <MPMinimal data={commonProps} isPublic={false} />
      default:
        return <MPProfessional data={commonProps} isPublic={false} />
    }
  }

  const handleShare = async () => {
    if (!current?.id) return
    
    setIsSharing(true)
    try {
      const response = await fetch('/api/media-pack/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mpId: current.id })
      })
      
      if (!response.ok) {
        throw new Error('Failed to create share link')
      }
      
      const { shareUrl } = await response.json()
      
      // Copy to clipboard
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Share error:', error)
    } finally {
      setIsSharing(false)
    }
  }

  return (
    <div className="card p-5 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="text-lg font-semibold">Preview</div>
        <div className="flex gap-1 p-1 bg-[var(--surface)] rounded-lg border border-[var(--border)]">
          {(['professional', 'luxury', 'minimal'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setVariant(v)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                variant === v 
                  ? 'bg-[var(--brand-600)] text-white' 
                  : 'text-[var(--muted-fg)] hover:text-[var(--fg)]'
              }`}
            >
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
      </div>
      
      <div className="bg-[var(--bg)] text-[var(--fg)] rounded-lg border border-[var(--border)] overflow-hidden">
        <div className="max-w-[960px] mx-auto">
          {renderVariant()}
        </div>
      </div>
      
      {current && (
        <div className="flex gap-3 mt-4">
          <button
            onClick={handleShare}
            disabled={isSharing}
            className="inline-flex h-10 items-center gap-2 rounded-[10px] px-4 border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--surface)] disabled:opacity-50"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                Copied!
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" />
                {isSharing ? 'Sharing...' : 'Share'}
              </>
            )}
          </button>
          {current.pdfUrl && (
            <a className="inline-flex h-10 items-center rounded-[10px] px-4 border border-[var(--border)] bg-[var(--card)]"
               href={current.pdfUrl} target="_blank" rel="noreferrer">Download PDF</a>
          )}
          {current.htmlUrl && (
            <a className="inline-flex h-10 items-center rounded-[10px] px-4 bg-[var(--brand-600)] text-white"
               href={current.htmlUrl} target="_blank" rel="noreferrer">Open Web Version</a>
          )}
        </div>
      )}
    </div>
  )
}
