'use client'
import { useEffect, useMemo, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

import { defaultTheme, ThemeTokens, MediaPackVariant } from '@/services/mediaPack/types'

export default function MediaPackToolPage() {
  const [variant, setVariant] = useState<MediaPackVariant>('classic')
  const [theme, setTheme] = useState<ThemeTokens>(defaultTheme)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const payload = useMemo(()=>({
    variant,
    theme,
    summary: 'Alex Rodriguez is a certified personal trainer and nutritionist with over 500K engaged followers. His content focuses on sustainable fitness, healthy eating, and lifestyle transformation. He has worked with major fitness brands and has a highly engaged audience in the 25-45 age range.',
    audience: { followers: 485000, engagement: 0.067, topGeo: ['US','CA','AU'] },
    brands: [
      { name:'Nike', reasons:['Perfect brand alignment', 'Target audience match', 'Content quality'], website:'https://nike.com'},
      { name:'MyFitnessPal', reasons:['Health focus', 'Audience overlap'], website:'https://myfitnesspal.com'}
    ],
    creator: { displayName: 'Alex Rodriguez', tagline: 'Fitness Influencer • Health Coach • 500K Followers' },
    metrics: [
      { key: 'followers', label: 'Followers', value: '485K' },
      { key: 'engagement', label: 'Engagement', value: '6.7%' },
      { key: 'topGeo', label: 'Top Geo', value: 'US/CA/AU' }
    ],
    cta: { bookUrl: 'https://calendly.com/alex-rodriguez', proposalUrl: 'https://alexrodriguez.com/partnerships' }
  }), [variant, theme])

  useEffect(() => {
    const run = async () => {
      const res = await fetch('/api/util/sign', { method:'POST', body: JSON.stringify(payload) })
      const { t } = await res.json()
      setToken(t)
    }
    run()
  }, [payload])

  const previewUrl = token ? `/media-pack/preview?t=${encodeURIComponent(token)}` : ''

  const generate = async () => {
    setLoading(true)
    try {
      // Use the exact same data that's used for the preview
      const previewData = {
        variant,
        theme,
        summary: 'Alex Rodriguez is a certified personal trainer and nutritionist with over 500K engaged followers. His content focuses on sustainable fitness, healthy eating, and lifestyle transformation. He has worked with major fitness brands and has a highly engaged audience in the 25-45 age range.',
        audience: { followers: 485000, engagement: 0.067, topGeo: ['US','CA','AU'] },
        brands: [
          { name:'Nike', reasons:['Perfect brand alignment', 'Target audience match', 'Content quality'], website:'https://nike.com'},
          { name:'MyFitnessPal', reasons:['Health focus', 'Audience overlap'], website:'https://myfitnesspal.com'}
        ],
        creator: { displayName: 'Alex Rodriguez', tagline: 'Fitness Influencer • Health Coach • 500K Followers' },
        metrics: [
          { key: 'followers', label: 'Followers', value: '485K' },
          { key: 'engagement', label: 'Engagement', value: '6.7%' },
          { key: 'topGeo', label: 'Top Geo', value: 'US/CA/AU' }
        ],
        cta: { bookUrl: 'https://calendly.com/alex-rodriguez', proposalUrl: 'https://alexrodriguez.com/partnerships' }
      }

      // Generate a token with the exact preview data
      const tokenRes = await fetch('/api/util/sign', { 
        method:'POST', 
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(previewData)
      })
      const { t } = await tokenRes.json()
      
      if (!t) {
        throw new Error('Failed to generate preview token')
      }

      // Generate PDF using the exact same data as the preview
      const pdfRes = await fetch('/api/media-pack/capture-preview', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ token: t })
      })
      
      if (!pdfRes.ok) {
        const error = await pdfRes.json()
        throw new Error(error.error || 'Failed to generate PDF')
      }

      // Create blob and download
      const blob = await pdfRes.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `media-pack-${variant}-${Date.now()}.pdf`
      a.click()
      URL.revokeObjectURL(url)
      
      alert('PDF generated successfully!')
    } catch (error: any) {
      alert(error.message || 'Failed to generate PDF')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Media Pack</h1>
          <p className="text-[var(--muted-fg)]">Pick a template, tweak theme, preview, and export PDF.</p>
        </div>
        <Button onClick={generate} disabled={loading}>{loading ? 'Generating…' : 'Generate & Share'}</Button>
      </div>

      <Card className="p-4">
        <div className="flex gap-4 flex-wrap">
          {(['classic','bold','editorial'] as MediaPackVariant[]).map(v => (
            <button key={v}
              className={`px-3 py-2 rounded-md border ${variant===v?'border-[var(--brand-600)]':'border-[var(--border)]'}`}
              onClick={()=>setVariant(v)}
            >
              {v}
            </button>
          ))}
          <div className="grow" />
          <label className="text-sm">Brand Color
            <input type="color" value={theme.brandColor}
              onChange={(e)=>setTheme({...theme, brandColor:e.target.value})}
              className="ml-2 align-middle" />
          </label>
          <label className="text-sm ml-4">Accent
            <input type="color" value={theme.accent}
              onChange={(e)=>setTheme({...theme, accent:e.target.value})}
              className="ml-2 align-middle" />
          </label>
          <label className="text-sm ml-4">Mode
            <select value={theme.mode} onChange={(e)=>setTheme({...theme, mode:e.target.value as any})} className="ml-2">
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </label>
        </div>

        <div className="mt-4 border rounded-lg overflow-hidden">
          {previewUrl ? (
            <iframe src={previewUrl} className="w-full h-[900px]" />
          ) : (
            <div className="h-[300px] grid place-items-center text-[var(--muted-fg)]">Preparing preview…</div>
          )}
        </div>
      </Card>
    </div>
  )
}
