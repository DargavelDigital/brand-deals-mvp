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
    summary: 'Polished AI-written summary will appear here.',
    audience: { followers: 156000, engagement: 0.053, topGeo: ['US','UK','CA'] },
    brands: [{ name:'Acme Co', reasons:['Great fit','Similar audiences'], website:'https://acme.com'}]
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
      const res = await fetch('/api/media-pack/generate', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          workspaceId: 'demo-workspace',
          variant,
          theme,
          brandIds: ['demo-1'],
          includeAISummary: false
        })
      })
      const json = await res.json()
      alert(json.mediaPack?.shareUrl || json.error)
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
